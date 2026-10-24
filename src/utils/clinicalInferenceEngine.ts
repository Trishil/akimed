import { PatientProfile, DiagnosticAssessment, AkinatorQuestion, DifferentialItem, TriageEvaluation, AkinatorQA, AkinatorState, ActiveHypothesisInfo } from '../types/clinical';
import { evaluateTriageDeterministic, checkAllergyAndMedInteractions } from './clinicalFallbackEngine';

const LIKERT_ANSWERS: AkinatorQuestion['possibleAnswers'] = [
  { label: 'Yes', value: 'yes' },
  { label: 'Probably Yes', value: 'probably_yes' },
  { label: "Don't Know", value: 'unsure' },
  { label: 'Probably Not', value: 'probably_no' },
  { label: 'No', value: 'no' },
];

import { CLINICAL_DISEASES } from './clinicalDiseasesCatalog';
import type { DiseaseProfile } from './clinicalDiseasesCatalog';
import { QUESTION_CATALOG } from './clinicalQuestionsCatalog';
import type { DiseaseLikelihoodMap, QuestionDefinition } from '../types/clinical';
import {
  evaluatePatientVitalsForDisease,
  getDiseaseVitals,
  type VitalsEliminationEvaluation,
  type DiseaseVitalsProfile,
} from '../data/diseaseVitalsOntology';

export { CLINICAL_DISEASES };
export type { DiseaseProfile, DiseaseLikelihoodMap, QuestionDefinition, VitalsEliminationEvaluation, DiseaseVitalsProfile };
export { QUESTION_CATALOG } from './clinicalQuestionsCatalog';
export { evaluatePatientVitalsForDisease, getDiseaseVitals };


// ===========================================================================
// DYNAMIC EPIDEMIOLOGICAL PRIOR SEEDING (Over ALL 111 Conditions)
// ===========================================================================
export function computeInitialDiseasePriors(patient: PatientProfile): Record<string, number> {
  const text = (
    (patient.chiefSymptoms || '') + ' ' +
    (patient.travelHistory || '') + ' ' +
    (patient.symptomDuration || '') + ' ' +
    (patient.additionalNotes || '')
  ).toLowerCase();

  const priors: Record<string, number> = {};
  const diseaseIds = Object.keys(CLINICAL_DISEASES);

  for (const id of diseaseIds) {
    const d = CLINICAL_DISEASES[id];
    let score = d.basePrior || 2.0;

    // 1. Keyword Overlap Matching
    if (d.keywords) {
      for (const kw of d.keywords) {
        if (text.includes(kw.toLowerCase())) {
          // Longer or specific multi-word tokens receive substantial evidentiary boost
          score += kw.includes(' ') || kw.length > 5 ? 12.0 : 7.0;
        }
      }
    }

    // 2. Travel History Priors (With Negation Guard)
    const hasTravel = patient.travelHistory &&
      patient.travelHistory.trim() !== '' &&
      !/\b(?:no|none|denies|negative|without|unremarkable)\b/i.test(patient.travelHistory);

    if (hasTravel) {
      if (['malaria', 'dengue', 'typhoid', 'leptospirosis', 'tuberculosis'].includes(id)) {
        score += 10.0;
      }
    }

    // 3. Pyrexia / Fever Heuristics
    const hasFever = text.includes('fever') ||
      text.includes('temp') ||
      text.includes('febrile') ||
      text.includes('chills') ||
      (patient.vitalSigns?.temperatureC && patient.vitalSigns.temperatureC >= 38.0);

    if (hasFever) {
      if (d.system === 'infectious' || ['appendicitis', 'cholecystitis', 'diverticulitis', 'pancreatitis', 'septic_arthritis'].includes(id)) {
        score += 6.0;
      } else if (['gerd', 'cluster_headache', 'spontaneous_pneumothorax', 'acute_gout', 'acute_hypoglycemia'].includes(id)) {
        // Fever strongly decreases purely non-infectious conditions
        score *= 0.4;
      }
    }

    // 4. Age-specific risk weighting
    if (patient.age >= 55) {
      if (d.system === 'cardiac' || ['acute_ischemic_stroke', 'copd_exacerbation', 'multiple_myeloma', 'bph_urinary_retention'].includes(id)) {
        score += 4.0;
      }
    } else if (patient.age < 30) {
      if (['appendicitis', 'bacterial_meningitis', 'spontaneous_pneumothorax', 'anaphylaxis', 'testicular_torsion', 'diabetic_ketoacidosis'].includes(id)) {
        score += 4.0;
      }
    }

    // 5. Continuous Vitals Likelihood with Clinical Margins (Soft Elimination)
    // Does NOT lock vitals to brittle binary cliffs; respects physiological tolerance margins.
    // If vitals are omitted or empty, multiplier remains 1.0 (neutral baseline).
    if (patient.vitalSigns) {
      const vEval = evaluatePatientVitalsForDisease(patient.vitalSigns, id, d.name);
      score *= vEval.overallMultiplier;
    }

    priors[id] = Math.max(0.01, score);
  }

  // Normalize across all diseases so sum = 100%
  normalizeProbabilities(priors, diseaseIds);
  return priors;
}

/**
 * Summarizes real-time physiological vitals compatibility across all 111 conditions.
 */
export function getVitalsEliminationSummary(patient: PatientProfile) {
  const evaluations: Record<string, VitalsEliminationEvaluation> = {};
  let favoredCount = 0;
  let compatibleCount = 0;
  let eliminatedCount = 0;

  const diseaseIds = Object.keys(CLINICAL_DISEASES);
  for (const id of diseaseIds) {
    const d = CLINICAL_DISEASES[id];
    const ev = evaluatePatientVitalsForDisease(patient.vitalSigns, id, d.name);
    evaluations[id] = ev;
    if (ev.status === 'favored') favoredCount++;
    else if (ev.status === 'compatible') compatibleCount++;
    else if (ev.status === 'eliminated') eliminatedCount++;
  }

  const total = diseaseIds.length;
  const eliminationRate = total > 0 ? (eliminatedCount / total) * 100 : 0;

  return {
    evaluations,
    favoredCount,
    compatibleCount,
    eliminatedCount,
    eliminationRate,
    totalConditions: total,
  };
}


// Backward-compatible helper for callers expecting domain seed
export function seedInitialDifferentialPriors(patient: PatientProfile): {
  domain: 'tropical' | 'cardiac' | 'gi' | 'neuro' | 'pulm';
  diseasePriors: Record<string, number>;
} {
  const fullPriors = computeInitialDiseasePriors(patient);
  const sorted = Object.entries(fullPriors).sort((a, b) => b[1] - a[1]);
  const topCond = sorted[0]?.[0] || 'malaria';
  const sys = CLINICAL_DISEASES[topCond]?.system || 'infectious';

  let domain: 'tropical' | 'cardiac' | 'gi' | 'neuro' | 'pulm' = 'tropical';
  if (sys === 'cardiac') domain = 'cardiac';
  else if (sys === 'gi') domain = 'gi';
  else if (sys === 'neuro') domain = 'neuro';
  else if (sys === 'pulmonary') domain = 'pulm';

  return { domain, diseasePriors: fullPriors };
}

// ===========================================================================
// CORE DYNAMIC BAYESIAN ENGINE
// ===========================================================================
export function computeAkinatorInferenceStep(
  patient: PatientProfile,
  history: AkinatorQA[],
  currentStep: number,
  prevHypothesis?: ActiveHypothesisInfo
): AkinatorState {
  const allDiseaseIds = Object.keys(CLINICAL_DISEASES);

  // 1. Initialize prior probabilities across ALL ${allDiseaseIds.length} conditions
  const currentProbs: Record<string, number> = computeInitialDiseasePriors(patient);

  const initialText = (
    (patient.chiefSymptoms || '') + ' ' +
    (patient.travelHistory || '') + ' ' +
    (patient.symptomDuration || '') + ' ' +
    (patient.additionalNotes || '')
  ).toLowerCase();

  // 2. Apply Dynamic Bayesian Updating across all answered questions
  const answeredQuestionIds = new Set<string>();

  for (let turnIdx = 0; turnIdx < history.length; turnIdx++) {
    const qa = history[turnIdx];
    if (qa.questionId) {
      answeredQuestionIds.add(qa.questionId);
    }

    const qDef = QUESTION_CATALOG.find(q => q.id === qa.questionId);
    if (!qDef) continue;

    // Weight based on Likert answer
    let weight = 0;
    let isPositive = false;

    if (qa.answer === 'yes') {
      weight = 1.0;
      isPositive = true;
    } else if (qa.answer === 'probably_yes') {
      weight = 0.55;
      isPositive = true;
    } else if (qa.answer === 'probably_no') {
      weight = 0.55;
      isPositive = false;
    } else if (qa.answer === 'no') {
      weight = 1.0;
      isPositive = false;
    } else {
      // 'unsure' -> no update
      continue;
    }

    const targetDiseaseIds = Object.keys(qDef.diseaseLikelihoods);

    // Update each disease in the ENTIRE medical catalog
    for (const dId of allDiseaseIds) {
      const lrConfig = qDef.diseaseLikelihoods[dId];

      if (lrConfig) {
        const targetLr = isPositive ? lrConfig.lrPos : lrConfig.lrNeg;
        const mult = 1.0 + (targetLr - 1.0) * weight;
        currentProbs[dId] *= Math.max(0.01, mult);
      } else {
        // If a highly specific focal physical sign was confirmed YES (e.g. Murphy's sign, McBurney, Kernig),
        // unrelated diseases outside that specific organ system receive a mild dampening factor (0.45x)
        if (isPositive && targetDiseaseIds.length > 0 && targetDiseaseIds.length <= 4) {
          currentProbs[dId] *= 0.45;
        }
      }
    }

    // Normalize probabilities across ALL conditions after each turn
    normalizeProbabilities(currentProbs, allDiseaseIds);
  }

  // Final normalization across all diseases
  normalizeProbabilities(currentProbs, allDiseaseIds);

  // 3. Sort ALL candidate diseases dynamically by posterior probability
  const sortedCandidates = allDiseaseIds
    .map(id => ({
      id,
      profile: CLINICAL_DISEASES[id],
      prob: Math.round(currentProbs[id] * 10) / 10,
    }))
    .filter(c => c.profile !== undefined)
    .sort((a, b) => b.prob - a.prob);

  const topCandidate = sortedCandidates[0];
  const secondCandidate = sortedCandidates[1];
  const thirdCandidate = sortedCandidates[2];
  const topConfidence = Math.min(99, Math.round(topCandidate?.prob || 50));

  // 4. Dynamic Hypothesis Tracking & Disease Pivoting
  let hypothesisStatus: ActiveHypothesisInfo['status'] = 'exploring';
  let pivotedFrom: string | null = null;
  let hypothesisReason = '';

  const turn = history.length;

  if (turn === 0) {
    // Turn 0: Differential screening
    hypothesisStatus = 'exploring';
    hypothesisReason = `Broad differential inquiry: evaluating presentation across top candidate diagnoses (${sortedCandidates.slice(0, 3).map(c => `${c.profile.name.split(' ')[0]} ${c.prob}%`).join(', ')}).`;
  } else {
    // Check if the leading candidate changed compared to previous hypothesis
    if (prevHypothesis && prevHypothesis.diseaseName && prevHypothesis.diseaseName !== topCandidate.profile.name) {
      hypothesisStatus = 'refuted';
      pivotedFrom = prevHypothesis.diseaseName;
      hypothesisReason = `Hypothesis refuted for previous lead (${pivotedFrom}); clinical evidence dynamically pivoted primary differential to ${topCandidate.profile.name} (${topConfidence}%).`;
    } else if (topConfidence >= 85) {
      hypothesisStatus = 'corroborated';
      hypothesisReason = `Cardinal clinical criteria strongly corroborated for ${topCandidate.profile.name} (${topConfidence}% confidence).`;
    } else if (turn >= 2 && topConfidence >= 45) {
      hypothesisStatus = 'pursuing';
      hypothesisReason = `Actively probing distinguishing criteria for leading candidate ${topCandidate.profile.name} (${topConfidence}%) vs alternative differentials.`;
    } else {
      hypothesisStatus = 'exploring';
      hypothesisReason = `Screening diagnostic inquiry: balancing ${topCandidate.profile.name} (${topConfidence}%) and ${secondCandidate?.profile.name || 'alternatives'} (${secondCandidate?.prob || 0}%).`;
    }
  }

  // 5. Available Question Extraction & Dynamic Discriminator Selection
  const availableQuestions = QUESTION_CATALOG.filter(q => {
    if (answeredQuestionIds.has(q.id)) return false;
    // Deduplicate against intake text
    if (q.triggerKeywords && q.triggerKeywords.some(kw => initialText.includes(kw))) {
      return false;
    }
    return true;
  });

  // Strict stopping criteria as specified:
  // Do NOT cap at 20 questions! The engine must NOT stop asking questions until topConfidence >= 95%
  // (or until all available discriminators in the catalog are exhausted).
  const hasReachedCertainty = topConfidence >= 95;
  const hasExhaustedQuestions = availableQuestions.length === 0;
  const isConcluded = hasReachedCertainty || hasExhaustedQuestions;
  const isDefinitive = topConfidence >= 95;

  let nextQuestion: AkinatorQuestion | undefined = undefined;

  if (!isConcluded && availableQuestions.length > 0) {
    // Find question that maximizes discriminatory divergence between current top candidates
    let bestQ = availableQuestions[0];
    let bestScore = -1;

    const topId = topCandidate.id;
    const secId = secondCandidate?.id || allDiseaseIds[1] || topId;
    const thirdId = thirdCandidate?.id;

    for (const q of availableQuestions) {
      const lr1 = q.diseaseLikelihoods[topId]?.lrPos ?? 1.0;
      const lr2 = q.diseaseLikelihoods[secId]?.lrPos ?? 1.0;
      const lr3 = thirdId ? (q.diseaseLikelihoods[thirdId]?.lrPos ?? 1.0) : 1.0;

      // Discrimination divergence: how differently this question affects condition 1 vs rival conditions
      const divergence12 = Math.abs(Math.log(Math.max(0.05, lr1)) - Math.log(Math.max(0.05, lr2)));
      const divergence13 = Math.abs(Math.log(Math.max(0.05, lr1)) - Math.log(Math.max(0.05, lr3)));

      // Relevance to leading candidate
      const relevance = Math.max(lr1, 1 / Math.max(0.05, lr1));

      // Red flag bonus if a life-threatening disease has >4% probability
      let redFlagBonus = 0;
      if (q.category === 'Red Flag') {
        for (const [dId, lrConf] of Object.entries(q.diseaseLikelihoods)) {
          if ((currentProbs[dId] || 0) > 4 && lrConf.lrPos > 3.0) {
            redFlagBonus += 3.0;
          }
        }
      }

      const score = divergence12 * 2.5 + divergence13 * 1.0 + relevance * 1.5 + redFlagBonus;

      if (score > bestScore) {
        bestScore = score;
        bestQ = q;
      }
    }

    nextQuestion = {
      questionId: bestQ.id,
      questionText: bestQ.text,
      category: bestQ.category,
      clinicalRationale: bestQ.rationale,
      possibleAnswers: LIKERT_ANSWERS,
    };
  }

  // 6. Format Differential Ranking & Diagnostic Assessment
  // Takes top candidates dynamically from the ENTIRE sorted catalog
  const differentialRanking: DifferentialItem[] = sortedCandidates.slice(0, 8).map((c, idx) => ({
    diseaseName: c.profile.name,
    icd10Code: c.profile.icd10,
    likelihood: Math.round(c.prob),
    category: idx === 0 ? 'Primary' : (idx <= 2 ? 'Secondary' : 'Alternative'),
    pathophysiology: c.profile.pathophysiology,
    supportingFindings: c.profile.supportingFindings,
    opposingFindings: c.profile.opposingFindings,
    bedsideSignsToTest: c.profile.bedsideSignsToTest,
    recommendedWorkup: c.profile.recommendedWorkup,
    clinicalPearls: c.profile.clinicalPearls,
  }));

  const triage = evaluateTriageDeterministic(patient);
  const allergyAlerts = checkAllergyAndMedInteractions(patient);

  const fullAssessment: DiagnosticAssessment = {
    triage,
    topDiagnoses: differentialRanking,
    allergyAndMedicationAlerts: allergyAlerts,
    immediateActionPlan: [
      `Triage Level ${triage.level} (${triage.levelName}): Prioritize patient evaluation within ${triage.timeToPhysician}.`,
      `Highest probability condition: ${topCandidate.profile.name} (${topConfidence}% posterior likelihood).`,
      'Establish peripheral venous access, draw baseline CBC, chemistry panel, and targeted confirmatory tests as indicated.',
      'Maintain continuous vital sign monitoring and adhere to allergy contraindication alerts.',
    ],
    differentialSummary: isDefinitive
      ? `Definitive diagnostic certainty threshold reached (>=95% confidence). Primary identified condition is ${topCandidate.profile.name}. Immediate targeted confirmatory testing and clinical management indicated.`
      : `Inquiry completed after ${turn} turns. Primary candidate is ${topCandidate.profile.name} (${topConfidence}%), with close differentials ${sortedCandidates.slice(1, 4).map(c => `${c.profile.name} (${c.prob}%)`).join(', ')}. Comprehensive differential workup recommended.`,
  };

  // 7. Generate Dr. Akinator Thought Bubble
  let akinatorThought = '';
  if (isConcluded) {
    if (isDefinitive) {
      akinatorThought = `Definitive diagnostic threshold met (${topConfidence}% confidence >= 95% at Turn ${turn})! Identified ${topCandidate.profile.name}. Findings decisively confirm cardinal pathophysiological criteria.`;
    } else {
      akinatorThought = `All ${turn} available clinical discriminators exhausted. Highest posterior candidate reached ${topConfidence}%. In strict adherence to MBBS diagnostic safety, presenting ranked differential spectrum without premature closure.`;
    }
  } else if (turn === 0) {
    const hasVitals = patient.vitalSigns && Object.values(patient.vitalSigns).some(v => v !== undefined && v !== null && (v as number) > 0);
    const vSummary = hasVitals ? getVitalsEliminationSummary(patient) : null;
    const vitalsNote = vSummary && vSummary.eliminatedCount > 0
      ? ` Vitals tolerance analysis pruned ${vSummary.eliminatedCount}/${allDiseaseIds.length} incompatible conditions (${vSummary.eliminationRate.toFixed(0)}% eliminated).`
      : '';
    akinatorThought = `Turn 1: Initial differential priors seeded across ${allDiseaseIds.length} clinical conditions.${vitalsNote} Top cluster: ${sortedCandidates.slice(0, 3).map(c => c.profile.name.split(' ')[0]).join(' vs ')}. Active inquiry will dynamically adapt until >=95% certainty is attained.`;

  } else if (pivotedFrom) {
    akinatorThought = `Turn ${turn}: Diagnostic pivot detected! Previous lead ${pivotedFrom} refuted by patient response; ${topCandidate.profile.name} (${topConfidence}%) dynamically elevated to primary differential.`;
  } else {
    akinatorThought = `Turn ${turn}: Bayesian update applied across all ${allDiseaseIds.length} conditions. Leading candidate: ${topCandidate.profile.name} (${topConfidence}%). Active inquiry continuing until >=95% certainty threshold is met...`;
  }

  // The 5 candidates displayed in real-time adapt dynamically across the entire medical catalog
  const currentCandidates = sortedCandidates.slice(0, 5).map(c => ({
    diseaseName: c.profile.name,
    confidence: Math.round(c.prob),
    trend: (turn === 0 ? 'stable' : (c.id === topCandidate.id ? 'rising' : 'falling')) as 'rising' | 'falling' | 'stable',
    reason: c.profile.supportingFindings[0] || 'Corroborated by clinical presentation',
  }));

  return {
    step: currentStep,
    maxSteps: Math.max(turn + 1, 20),
    isConcluded,
    isDefinitive,
    differentialRanking,
    activeHypothesis: {
      diseaseName: topCandidate.profile.name,
      status: hypothesisStatus,
      confidence: topConfidence,
      reason: hypothesisReason,
      pivotedFrom,
    },
    akinatorThought,
    currentCandidates,
    nextQuestion,
    finalDiagnosis: isConcluded ? differentialRanking[0] : undefined,
    assessment: isConcluded ? fullAssessment : undefined,
  };
}

// ----------------- HELPER FUNCTIONS -----------------
function normalizeProbabilities(probs: Record<string, number>, keys: string[]) {
  const sum = keys.reduce((acc, k) => acc + (probs[k] || 0), 0);
  if (sum <= 0) {
    const equal = 100 / keys.length;
    keys.forEach(k => { probs[k] = equal; });
    return;
  }
  keys.forEach(k => {
    probs[k] = (probs[k] / sum) * 100;
  });
}
