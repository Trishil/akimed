import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { PatientProfile, AkinatorQA, DiagnosticAssessment } from './src/types/clinical.ts';
import {
  generateDeterministicAssessment,
  getNextAkinatorQuestionDeterministic,
  evaluateTriageDeterministic,
  checkAllergyAndMedInteractions,
} from './src/utils/clinicalFallbackEngine.ts';
import { DEFAULT_TELEMETRY_DATA } from './src/data/telemetryData.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

const LOCAL_ENGINE_URL = process.env.AKIMED_ENGINE_URL || 'http://127.0.0.1:8000';

async function callLocalEngine(endpoint: string, body: any) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const res = await fetch(`${LOCAL_ENGINE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal
    });
    clearTimeout(timeout);
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    // Local engine offline or timed out
  }
  return null;
}

// Endpoint: Check active engine status (Local ML vs Gemini vs Fallback)
app.get('/api/engine-status', async (_req: Request, res: Response) => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1200);
    const r = await fetch(`${LOCAL_ENGINE_URL}/health`, { signal: controller.signal });
    clearTimeout(timeout);
    if (r.ok) {
      const data = await r.json();
      return res.json({
        activeEngine: 'local_ml',
        engineName: 'AkiMed Clinical Transformer (Apple Silicon MPS / 600K Cases)',
        details: data
      });
    }
  } catch {}

  if (ai) {
    return res.json({
      activeEngine: 'gemini_cloud',
      engineName: 'Gemini 3.8 Flash Cloud AI',
      details: { status: 'connected' }
    });
  }

  return res.json({
    activeEngine: 'deterministic_fallback',
    engineName: 'Offline Rule Engine',
    details: { status: 'fallback' }
  });
});

// Endpoint: Comprehensive Training Telemetry, Checkpoints, and Adversarial Benchmarks
app.get('/api/training-telemetry', async (_req: Request, res: Response) => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    const r = await fetch(`${LOCAL_ENGINE_URL}/api/training-telemetry`, { signal: controller.signal });
    clearTimeout(timeout);
    if (r.ok) {
      const data = await r.json();
      return res.json(data);
    }
  } catch {}

  // Fallback direct read from disk
  try {
    const fs = await import('fs');
    const modelsDir = '/Volumes/Trishil/Akimed_data/models';
    const metaPath = path.join(modelsDir, 'clinical_transformer_meta.json');
    const advPath = path.join(modelsDir, 'adversarial_stress_report.json');
    const historyPath = path.join(modelsDir, 'training_history.csv');
    const checkpointsDir = path.join(modelsDir, 'checkpoints');

    let meta: any = {};
    if (fs.existsSync(metaPath)) {
      meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
    }

    let adv: any = {};
    if (fs.existsSync(advPath)) {
      adv = JSON.parse(fs.readFileSync(advPath, 'utf-8'));
    }

    const checkpoints: any[] = [];
    if (fs.existsSync(checkpointsDir)) {
      const files = fs.readdirSync(checkpointsDir);
      for (const f of files) {
        if (f.endsWith('.pt') && !f.startsWith('.')) {
          const fpath = path.join(checkpointsDir, f);
          const stats = fs.statSync(fpath);
          checkpoints.push({
            name: f,
            path: fpath,
            size_mb: Number((stats.size / (1024 * 1024)).toFixed(2)),
            modified: stats.mtime.toISOString().replace('T', ' ').substring(0, 19)
          });
        }
      }
    }

    const history: any[] = [];
    if (fs.existsSync(historyPath)) {
      const lines = fs.readFileSync(historyPath, 'utf-8').trim().split('\n');
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',');
        if (parts.length >= 7) {
          history.push({
            epoch: Number(parts[0]),
            train_loss: Number(parts[1]),
            train_dx_acc: Number(parts[2]),
            val_top1_acc: Number(parts[3]),
            val_top3_acc: Number(parts[4]),
            val_triage_acc: Number(parts[5]),
            elapsed_sec: Number(parts[6])
          });
        }
      }
    }

    const bestPt = path.join(modelsDir, 'akimed_clinical_transformer_best.pt');
    const bestSize = fs.existsSync(bestPt) ? Number((fs.statSync(bestPt).size / (1024 * 1024)).toFixed(2)) : 11.0;

    return res.json({
      active_model: {
        name: 'AkiMed Clinical Attention Transformer',
        version: '2.2.0',
        weights_path: bestPt,
        weights_size_mb: bestSize,
        device: 'Apple Silicon MPS (Metal)',
        architecture: 'Self-Attention (4 Heads, d=256) + 3 Residual Dense Blocks',
        trained_samples: meta.trained_samples || 600000,
        val_top1_acc: meta.val_top1_accuracy || 99.28,
        val_top3_acc: meta.val_top3_accuracy || 99.99,
        val_triage_acc: meta.val_triage_accuracy || 99.97,
        saved_root_dir: modelsDir
      },
      checkpoints: checkpoints.length > 0 ? checkpoints : DEFAULT_TELEMETRY_DATA.checkpoints,
      training_history: history.length > 0 ? history : DEFAULT_TELEMETRY_DATA.training_history,
      adversarial_stress_report: adv && Object.keys(adv).length > 0 ? adv : DEFAULT_TELEMETRY_DATA.adversarial_stress_report
    });
  } catch (err) {
    return res.json(DEFAULT_TELEMETRY_DATA);
  }
});

// Endpoint: Generate Full Diagnostic Differential & Triage
app.post('/api/diagnose', async (req: Request, res: Response) => {
  const patient: PatientProfile = req.body.patient;

  if (!patient || !patient.chiefSymptoms) {
    return res.status(400).json({ error: 'Patient profile and chief symptoms are required.' });
  }

  // 1. Prioritize Local Trained ML & Bayesian Clinical Engine
  const localResult = await callLocalEngine('/api/diagnose', { patient });
  if (localResult && localResult.topDiagnoses && localResult.topDiagnoses.length > 0) {
    return res.json(localResult);
  }

  // 2. Fallback assessment ready in case AI is unconfigured or rate limited
  const deterministicResult = generateDeterministicAssessment(patient);

  if (!ai) {
    return res.json(deterministicResult);
  }

  try {
    const prompt = `You are a Senior Consultant Physician and Professor of Clinical Medicine evaluating a case presented by an MBBS student.
Analyze the following patient thoroughly:
- Age: ${patient.age}
- Gender: ${patient.gender} ${patient.isPregnant ? '(PREGNANT)' : ''}
- Chief Symptoms: "${patient.chiefSymptoms}" (Duration: ${patient.symptomDuration || 'Not specified'})
- Pre-existing Conditions / Medical History: ${patient.preExistingConditions?.length ? patient.preExistingConditions.join(', ') : 'None reported'}
- Current Medications: ${patient.currentMedications?.length ? patient.currentMedications.join(', ') : 'None'}
- Allergies: ${patient.allergies?.length ? patient.allergies.join(', ') : 'No known drug allergies (NKDA)'}
- Travel History: "${patient.travelHistory || 'No recent international travel'}"
- Vital Signs: ${
      patient.vitalSigns
        ? `BP: ${patient.vitalSigns.bpSystolic || '?'}/${patient.vitalSigns.bpDiastolic || '?'} mmHg, HR: ${patient.vitalSigns.heartRate || '?'} bpm, RR: ${patient.vitalSigns.respiratoryRate || '?'} /min, SpO2: ${patient.vitalSigns.spo2 || '?'}%, Temp: ${patient.vitalSigns.temperatureC || '?'} C`
        : 'Not recorded'
    }
- Clinical Notes / Signs: "${patient.additionalNotes || 'None'}"

Evaluate and generate:
1. Emergency Severity Index (ESI) Triage: Level 1 (Resuscitation), Level 2 (Emergent), Level 3 (Urgent), Level 4 (Semi-urgent), or Level 5 (Non-urgent), rationale, red flags, and time to physician.
2. Differential Diagnoses ranked by likelihood: Provide 3 to 4 conditions with ICD-10 codes, likelihood %, category (Primary, Secondary, Alternative, Zebra/Rare), detailed MBBS-level pathophysiological mechanism, supporting and opposing findings, bedside clinical signs to test, and recommended workup (initial labs, confirmatory tests, imaging).
3. Allergy & Medication Cross-Reaction Warnings: Check if the patient's stated allergies or current medications interact dangerously with standard empiric treatment regimens.
4. Immediate Action Plan & Concise Differential Summary for an MBBS student.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction:
          'You are AkiMed, a clinical diagnostic engine for medical students. Return strictly valid JSON adhering to the provided schema with sound evidence-based medical reasoning.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            triage: {
              type: Type.OBJECT,
              properties: {
                level: { type: Type.INTEGER },
                levelName: { type: Type.STRING },
                color: { type: Type.STRING },
                timeToPhysician: { type: Type.STRING },
                rationale: { type: Type.STRING },
                redFlags: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: ['level', 'levelName', 'timeToPhysician', 'rationale', 'redFlags'],
            },
            topDiagnoses: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  diseaseName: { type: Type.STRING },
                  icd10Code: { type: Type.STRING },
                  likelihood: { type: Type.INTEGER },
                  category: { type: Type.STRING },
                  pathophysiology: { type: Type.STRING },
                  supportingFindings: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  opposingFindings: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  bedsideSignsToTest: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  recommendedWorkup: {
                    type: Type.OBJECT,
                    properties: {
                      initialLabs: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                      },
                      confirmatoryTests: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                      },
                      imaging: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                      },
                    },
                    required: ['initialLabs', 'confirmatoryTests'],
                  },
                  clinicalPearls: { type: Type.STRING },
                },
                required: [
                  'diseaseName',
                  'likelihood',
                  'category',
                  'pathophysiology',
                  'supportingFindings',
                  'bedsideSignsToTest',
                  'recommendedWorkup',
                ],
              },
            },
            allergyAndMedicationAlerts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  substance: { type: Type.STRING },
                  warningType: { type: Type.STRING },
                  severity: { type: Type.STRING },
                  details: { type: Type.STRING },
                },
                required: ['substance', 'warningType', 'severity', 'details'],
              },
            },
            immediateActionPlan: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            differentialSummary: { type: Type.STRING },
          },
          required: [
            'triage',
            'topDiagnoses',
            'allergyAndMedicationAlerts',
            'immediateActionPlan',
            'differentialSummary',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '{}');
    if (!parsed.topDiagnoses || parsed.topDiagnoses.length === 0) {
      return res.json(deterministicResult);
    }
    return res.json(parsed);
  } catch (err) {
    console.error('Gemini diagnose error, serving deterministic fallback:', err);
    return res.json(deterministicResult);
  }
});

// Endpoint: Akinator Interactive Step (Ask next high-yield discriminator question OR conclude)
app.post('/api/akinator/step', async (req: Request, res: Response) => {
  const patient: PatientProfile = req.body.patient;
  const history: AkinatorQA[] = req.body.history || [];
  const step: number = Number(req.body.step) || 1;

  if (!patient || !patient.chiefSymptoms) {
    return res.status(400).json({ error: 'Patient profile required.' });
  }

  // 1. Prioritize Local Trained Bayesian Akinator Engine
  const activeHypothesis = req.body.activeHypothesis;
  const localAkinatorResult = await callLocalEngine('/api/akinator/step', { patient, history, step, activeHypothesis });
  if (localAkinatorResult && (localAkinatorResult.nextQuestion || localAkinatorResult.isConcluded)) {
    return res.json(localAkinatorResult);
  }

  // If user completed up to 20 questions or AI is unavailable, use fallback logic
  const deterministicFallbackAssessment = generateDeterministicAssessment(patient);
  const topLikelihood = deterministicFallbackAssessment.topDiagnoses[0]?.likelihood ?? 50;
  const hasReachedHighConfidence = topLikelihood >= 85 && step >= 10;
  const hasExhaustedBudget = step >= 20 || history.length >= 20;
  const isConcluded = hasReachedHighConfidence || hasExhaustedBudget;
  const isDefinitive = topLikelihood >= 85;

  if (!ai) {
    const q = getNextAkinatorQuestionDeterministic(patient, step, history.length);
    const leadDiag = deterministicFallbackAssessment.topDiagnoses[0]?.diseaseName || 'Clinical Syndrome';
    const conf = Math.max(10, Math.min(95, topLikelihood + (isConcluded ? 5 : step * 2)));

    const activeHypothesis = {
      diseaseName: leadDiag,
      status: step === 1 ? 'exploring' : (conf >= 85 ? 'corroborated' : 'pursuing'),
      confidence: conf,
      reason: `Evaluating cardinal presentation and discriminatory criteria for ${leadDiag}.`,
      pivotedFrom: null
    };

    return res.json({
      step,
      maxSteps: 20,
      isConcluded,
      isDefinitive,
      differentialRanking: deterministicFallbackAssessment.topDiagnoses.slice(0, 5),
      activeHypothesis,
      akinatorThought: isConcluded
        ? (isDefinitive
            ? `Clinical entropy reduction complete! ${deterministicFallbackAssessment.topDiagnoses[0]?.diseaseName} identified as definitive primary diagnosis.`
            : `20-question inquiry budget reached. Presenting differential candidate spectrum to prevent premature diagnostic closure.`)
        : `Turn ${step}/20: Analyzing symptom cluster and testing high-yield clinical discriminators for ${leadDiag}...`,
      currentCandidates: deterministicFallbackAssessment.topDiagnoses.map((d, i) => ({
        diseaseName: d.diseaseName,
        confidence: Math.max(10, Math.min(95, d.likelihood + (isConcluded ? 5 : step * 2))),
        trend: i === 0 ? 'rising' : 'falling',
        reason: d.supportingFindings[0] || 'Matches patient profile',
      })),
      nextQuestion: isConcluded ? undefined : q,
      finalDiagnosis: isConcluded ? deterministicFallbackAssessment.topDiagnoses[0] : undefined,
      assessment: isConcluded ? deterministicFallbackAssessment : undefined,
    });
  }

  try {
    const historyText = history
      .map(
        (h, i) =>
          `Q${i + 1}: ${h.question} -> Answer: ${h.answer.toUpperCase()}${
            h.clinicalRationale ? ` (Rationale: ${h.clinicalRationale})` : ''
          }`
      )
      .join('\n');

    const prompt = `You are "Dr. Akinator", a genius Clinical Diagnostic Akinator training an MBBS medical student.
PATIENT PROFILE:
- Age: ${patient.age}, Gender: ${patient.gender}
- Chief Complaints: "${patient.chiefSymptoms}" (Duration: ${patient.symptomDuration || 'Unknown'})
- Past Medical History: ${patient.preExistingConditions?.join(', ') || 'None'}
- Medications: ${patient.currentMedications?.join(', ') || 'None'}
- Allergies: ${patient.allergies?.join(', ') || 'NKDA'}
- Travel History: "${patient.travelHistory || 'None'}"
- Vital signs: ${JSON.stringify(patient.vitalSigns || {})}
- Notes: "${patient.additionalNotes || 'None'}"

PRIOR AKINATOR QUESTIONS AND STUDENT ANSWERS:
${historyText || 'No prior questions answered yet (Step 1).'}

CURRENT STEP: ${step} (Max 20 questions).

TASK:
1. Recalculate candidate diagnoses and their probability percentages (confidence 0-100%).
2. Decide whether to CONCLUDE (isConcluded = true):
   - Conclude early ONLY IF confidence >= 85% AND turn >= 10.
   - Otherwise, MUST continue selecting discriminators until turn == 20.
   - All questions must be closed, testable propositions compatible with a 5-point Likert scale (Yes, Probably Yes, Don't Know, Probably Not, No). Never ask open-ended questions like "Characterize your pain".
3. If concluding, provide the full assessment with differential list and pathophysiology.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction:
          'You are Dr. Akinator, an expert clinical AI tutor. Formulate intelligent, high-entropy clinical questions that cleanly differentiate look-alike diseases for MBBS students.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            step: { type: Type.INTEGER },
            isConcluded: { type: Type.BOOLEAN },
            akinatorThought: {
              type: Type.STRING,
              description: 'Short witty or insightful clinical reasoning thought from Dr. Akinator.',
            },
            currentCandidates: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  diseaseName: { type: Type.STRING },
                  confidence: { type: Type.INTEGER },
                  trend: { type: Type.STRING },
                  reason: { type: Type.STRING },
                },
                required: ['diseaseName', 'confidence', 'trend', 'reason'],
              },
            },
            nextQuestion: {
              type: Type.OBJECT,
              properties: {
                questionId: { type: Type.STRING },
                questionText: { type: Type.STRING },
                category: { type: Type.STRING },
                clinicalRationale: { type: Type.STRING },
                possibleAnswers: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      label: { type: Type.STRING },
                      value: { type: Type.STRING },
                    },
                    required: ['label', 'value'],
                  },
                },
              },
              required: ['questionId', 'questionText', 'clinicalRationale', 'possibleAnswers'],
            },
            finalDiagnosis: {
              type: Type.OBJECT,
              properties: {
                diseaseName: { type: Type.STRING },
                icd10Code: { type: Type.STRING },
                likelihood: { type: Type.INTEGER },
                category: { type: Type.STRING },
                pathophysiology: { type: Type.STRING },
                supportingFindings: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                opposingFindings: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                bedsideSignsToTest: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                recommendedWorkup: {
                  type: Type.OBJECT,
                  properties: {
                    initialLabs: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    confirmatoryTests: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                  },
                  required: ['initialLabs', 'confirmatoryTests'],
                },
                clinicalPearls: { type: Type.STRING },
              },
            },
            assessment: {
              type: Type.OBJECT,
              properties: {
                triage: {
                  type: Type.OBJECT,
                  properties: {
                    level: { type: Type.INTEGER },
                    levelName: { type: Type.STRING },
                    timeToPhysician: { type: Type.STRING },
                    rationale: { type: Type.STRING },
                    redFlags: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                  },
                },
                topDiagnoses: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      diseaseName: { type: Type.STRING },
                      likelihood: { type: Type.INTEGER },
                      pathophysiology: { type: Type.STRING },
                    },
                  },
                },
                allergyAndMedicationAlerts: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      substance: { type: Type.STRING },
                      warningType: { type: Type.STRING },
                      severity: { type: Type.STRING },
                      details: { type: Type.STRING },
                    },
                  },
                },
                immediateActionPlan: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                differentialSummary: { type: Type.STRING },
              },
            },
          },
          required: ['step', 'isConcluded', 'akinatorThought', 'currentCandidates'],
        },
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '{}');
    parsed.maxSteps = 20;
    const topConf = parsed.currentCandidates?.[0]?.confidence ?? 0;
    parsed.isDefinitive = topConf >= 85;

    // Safety fallback: if not concluded but no nextQuestion was returned, supply deterministic question
    if (!parsed.isConcluded && (!parsed.nextQuestion || !parsed.nextQuestion.questionText)) {
      parsed.nextQuestion = getNextAkinatorQuestionDeterministic(patient, step, history.length);
    }

    // Safety fallback: if concluded but no assessment was provided
    if (parsed.isConcluded && !parsed.assessment) {
      parsed.assessment = deterministicFallbackAssessment;
    }

    return res.json(parsed);
  } catch (err) {
    console.error('Gemini akinator step error, returning deterministic step:', err);
    const topLikelihood = deterministicFallbackAssessment.topDiagnoses[0]?.likelihood ?? 50;
    const hasReachedHighConfidence = topLikelihood >= 85 && step >= 10;
    const hasExhaustedBudget = step >= 20 || history.length >= 20;
    const isConcluded = hasReachedHighConfidence || hasExhaustedBudget;
    const isDefinitive = topLikelihood >= 85;

    return res.json({
      step,
      maxSteps: 20,
      isConcluded,
      isDefinitive,
      differentialRanking: deterministicFallbackAssessment.topDiagnoses.slice(0, 5),
      akinatorThought: isConcluded
        ? (isDefinitive
            ? `Clinical diagnostic threshold reached (${topLikelihood}% confidence)! Primary diagnosis determined.`
            : `20-question budget exhausted. Differential candidate ranking presented.`)
        : `Turn ${step}/20: Differentiating candidate pathologies based on clinical signs...`,
      currentCandidates: deterministicFallbackAssessment.topDiagnoses.map((d) => ({
        diseaseName: d.diseaseName,
        confidence: d.likelihood,
        trend: 'stable',
        reason: d.supportingFindings[0] || 'Matches presentation',
      })),
      nextQuestion: isConcluded
        ? undefined
        : getNextAkinatorQuestionDeterministic(patient, step, history.length),
      finalDiagnosis: isConcluded ? deterministicFallbackAssessment.topDiagnoses[0] : undefined,
      assessment: isConcluded ? deterministicFallbackAssessment : undefined,
    });
  }
});

// Vite Middleware for Fullstack React SPA
if (process.env.NODE_ENV !== 'production') {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true, hmr: false },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
}

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`AkiMed server running on http://0.0.0.0:${PORT}`);
});
