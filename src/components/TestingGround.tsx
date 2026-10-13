import React, { useState, useMemo, useEffect } from 'react';
import {
  Activity,
  Sliders,
  Flame,
  ShieldAlert,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Shuffle,
  BarChart3,
  Zap,
  Search,
  Trash2,
  Filter,
  Clock,
  Target,
  Cpu,
  HelpCircle,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { CLINICAL_DISEASES } from '../utils/clinicalDiseasesCatalog';
import { QUESTION_CATALOG } from '../utils/clinicalQuestionsCatalog';
import {
  DISEASE_VITALS_ONTOLOGY,
  evaluatePatientVitalsForDisease,
  getDiseaseVitals,
  type VitalsEliminationEvaluation
} from '../data/diseaseVitalsOntology';
import { computeAkinatorInferenceStep } from '../utils/clinicalInferenceEngine';
import { PatientProfile, AkinatorQA } from '../types/clinical';

interface TestingGroundProps {
  onLaunchCase?: (patient: PatientProfile) => void;
}

interface VitalsFormState {
  bpSystolic: number | '';
  bpDiastolic: number | '';
  heartRate: number | '';
  respiratoryRate: number | '';
  spo2: number | '';
  temperatureC: number | '';
}

interface BenchmarkResultItem {
  id: string;
  name: string;
  turnsWithVitals: number;
  turnsWithoutVitals: number;
  finalDxWithVitals: string;
  finalDxWithoutVitals: string;
  matchWithVitals: boolean;
  matchWithoutVitals: boolean;
  confidenceWithVitals: number;
  confidenceWithoutVitals: number;
}

const PRESET_SCENARIOS = [
  {
    name: 'Septic Shock',
    badge: 'Hyperdynamic Febrile Shock',
    vitals: { bpSystolic: 75, bpDiastolic: 45, heartRate: 135, respiratoryRate: 28, spo2: 93, temperatureC: 39.5 },
    color: 'border-rose-500 bg-rose-50 text-rose-900',
    chief: 'High spiking fever with shaking rigors, severe lethargy, altered mental status, and warm flushed extremities.'
  },
  {
    name: 'Acute STEMI',
    badge: 'Cardiogenic Hypoperfusion',
    vitals: { bpSystolic: 85, bpDiastolic: 55, heartRate: 118, respiratoryRate: 26, spo2: 91, temperatureC: 36.8 },
    color: 'border-red-500 bg-red-50 text-red-900',
    chief: 'Crushing retrosternal chest pressure radiating to left arm and jaw with profuse cold diaphoresis.'
  },
  {
    name: 'Tension Pneumothorax',
    badge: 'Critical Hypoxemic Distress',
    vitals: { bpSystolic: 80, bpDiastolic: 50, heartRate: 140, respiratoryRate: 34, spo2: 84, temperatureC: 37.0 },
    color: 'border-amber-500 bg-amber-50 text-amber-900',
    chief: 'Sudden sharp unilateral pleuritic chest pain with profound acute respiratory distress and tracheal deviation.'
  },
  {
    name: 'Severe DKA',
    badge: 'Kussmaul Acidosis',
    vitals: { bpSystolic: 102, bpDiastolic: 65, heartRate: 122, respiratoryRate: 32, spo2: 98, temperatureC: 37.8 },
    color: 'border-orange-500 bg-orange-50 text-orange-900',
    chief: 'Rapid deep sighing respirations, diffuse abdominal pain, nausea, polyuria, polydipsia, and fruity breath odor.'
  },
  {
    name: 'Severe Anaphylaxis',
    badge: 'Distributive Shock + Stridor',
    vitals: { bpSystolic: 70, bpDiastolic: 40, heartRate: 130, respiratoryRate: 30, spo2: 89, temperatureC: 36.9 },
    color: 'border-purple-500 bg-purple-50 text-purple-900',
    chief: 'Sudden onset facial angioedema, generalized urticaria, wheezing, throat tightness 10 minutes post ingestion.'
  },
  {
    name: 'Normal Outpatient Baseline',
    badge: 'Euvolemic Non-Distressed',
    vitals: { bpSystolic: 120, bpDiastolic: 80, heartRate: 72, respiratoryRate: 16, spo2: 99, temperatureC: 37.0 },
    color: 'border-emerald-500 bg-emerald-50 text-emerald-900',
    chief: 'Subacute localized symptoms without overt systemic distress or hemodynamic compromise.'
  }
];

export const TestingGround: React.FC<TestingGroundProps> = ({ onLaunchCase }) => {
  const [activeSubTab, setActiveSubTab] = useState<'vitals' | 'arena' | 'benchmark'>('vitals');

  // Vitals State
  const [vitals, setVitals] = useState<VitalsFormState>({
    bpSystolic: 75,
    bpDiastolic: 45,
    heartRate: 135,
    respiratoryRate: 28,
    spo2: 93,
    temperatureC: 39.5
  });

  const [activeChief, setActiveChief] = useState<string>(PRESET_SCENARIOS[0].chief);
  const [selectedPreset, setSelectedPreset] = useState<string>(PRESET_SCENARIOS[0].name);
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'favored' | 'compatible' | 'eliminated'>('all');

  // Interactive Diagnostic Arena State
  const allDiseaseList = useMemo(() => Object.values(CLINICAL_DISEASES), []);
  const [arenaTargetId, setArenaTargetId] = useState<string>(allDiseaseList[0]?.id || 'malaria');
  const [arenaIncludeVitals, setArenaIncludeVitals] = useState<boolean>(true);
  const [arenaHistory, setArenaHistory] = useState<AkinatorQA[]>([]);
  const [arenaCurrentPatient, setArenaCurrentPatient] = useState<PatientProfile>(() => {
    const d = CLINICAL_DISEASES[allDiseaseList[0]?.id || 'malaria'];
    const p = getDiseaseVitals(d?.id || 'malaria');
    return {
      age: 38,
      gender: 'Male',
      chiefSymptoms: d?.keywords.join(', ') || 'fever and headache',
      symptomDuration: '3 days',
      preExistingConditions: [],
      currentMedications: [],
      allergies: [],
      travelHistory: 'None reported',
      vitalSigns: p
        ? {
            bpSystolic: p.sbp.mean,
            bpDiastolic: p.dbp.mean,
            heartRate: p.hr.mean,
            respiratoryRate: p.rr.mean,
            spo2: p.spo2.mean,
            temperatureC: p.temp.mean
          }
        : undefined
    };
  });

  const [arenaState, setArenaState] = useState(() =>
    computeAkinatorInferenceStep(arenaCurrentPatient, [], 1)
  );

  // Batch Benchmark State
  const [isBenchmarking, setIsBenchmarking] = useState(false);
  const [benchmarkProgress, setBenchmarkProgress] = useState(0);
  const [benchmarkCurrentDisease, setBenchmarkCurrentDisease] = useState('');
  const [benchmarkResults, setBenchmarkResults] = useState<BenchmarkResultItem[]>([]);

  // -------------------------------------------------------------
  // Vitals Elimination Evaluations over ALL 111 Diseases
  // -------------------------------------------------------------
  const vitalsPatientProfile = useMemo(() => {
    const hasAnyVital = Object.values(vitals).some(v => v !== '' && v !== undefined && v !== null);
    return {
      bpSystolic: vitals.bpSystolic === '' ? undefined : Number(vitals.bpSystolic),
      bpDiastolic: vitals.bpDiastolic === '' ? undefined : Number(vitals.bpDiastolic),
      heartRate: vitals.heartRate === '' ? undefined : Number(vitals.heartRate),
      respiratoryRate: vitals.respiratoryRate === '' ? undefined : Number(vitals.respiratoryRate),
      spo2: vitals.spo2 === '' ? undefined : Number(vitals.spo2),
      temperatureC: vitals.temperatureC === '' ? undefined : Number(vitals.temperatureC)
    };
  }, [vitals]);

  const diseaseEvaluations = useMemo(() => {
    const evals: VitalsEliminationEvaluation[] = [];
    for (const d of allDiseaseList) {
      const evaluation = evaluatePatientVitalsForDisease(vitalsPatientProfile, d.id, d.name);
      evals.push(evaluation);
    }
    return evals.sort((a, b) => b.overallMultiplier - a.overallMultiplier);
  }, [allDiseaseList, vitalsPatientProfile]);

  const favoredList = useMemo(() => diseaseEvaluations.filter(e => e.status === 'favored'), [diseaseEvaluations]);
  const compatibleList = useMemo(() => diseaseEvaluations.filter(e => e.status === 'compatible'), [diseaseEvaluations]);
  const eliminatedList = useMemo(() => diseaseEvaluations.filter(e => e.status === 'eliminated'), [diseaseEvaluations]);

  const filteredEvaluations = useMemo(() => {
    return diseaseEvaluations.filter(e => {
      if (statusFilter !== 'all' && e.status !== statusFilter) return false;
      if (searchFilter) {
        const query = searchFilter.toLowerCase();
        return (
          e.diseaseName.toLowerCase().includes(query) ||
          e.diseaseId.toLowerCase().includes(query) ||
          e.eliminationReasons.some(r => r.toLowerCase().includes(query))
        );
      }
      return true;
    });
  }, [diseaseEvaluations, statusFilter, searchFilter]);

  // Vitals Action Handlers
  const handleApplyPreset = (preset: typeof PRESET_SCENARIOS[0]) => {
    setSelectedPreset(preset.name);
    setVitals(preset.vitals);
    setActiveChief(preset.chief);
  };

  const handleClearVitals = () => {
    setSelectedPreset('Custom (No Vitals)');
    setVitals({
      bpSystolic: '',
      bpDiastolic: '',
      heartRate: '',
      respiratoryRate: '',
      spo2: '',
      temperatureC: ''
    });
  };

  const handleInjectJitter = () => {
    setVitals(prev => {
      const jitter = (val: number | '', stdPercent: number, minVal: number, maxVal: number) => {
        if (val === '') return '';
        const factor = 1 + (Math.random() * 2 - 1) * stdPercent;
        const perturbed = Math.round(Number(val) * factor * 10) / 10;
        return Math.max(minVal, Math.min(maxVal, perturbed));
      };
      return {
        bpSystolic: Math.round(Number(jitter(prev.bpSystolic, 0.06, 60, 220))),
        bpDiastolic: Math.round(Number(jitter(prev.bpDiastolic, 0.06, 40, 130))),
        heartRate: Math.round(Number(jitter(prev.heartRate, 0.08, 45, 190))),
        respiratoryRate: Math.round(Number(jitter(prev.respiratoryRate, 0.08, 10, 48))),
        spo2: Math.round(Number(jitter(prev.spo2, 0.02, 72, 100))),
        temperatureC: Math.round(Number(jitter(prev.temperatureC, 0.015, 35.2, 41.5)) * 10) / 10
      };
    });
  };

  // -------------------------------------------------------------
  // Arena Handlers
  // -------------------------------------------------------------
  const setupArenaCase = (targetId: string, withVitals: boolean) => {
    const d = CLINICAL_DISEASES[targetId] || allDiseaseList[0];
    const p = getDiseaseVitals(d.id);
    const newPatient: PatientProfile = {
      age: 42,
      gender: 'Male',
      chiefSymptoms: d.keywords.slice(0, 4).join(', '),
      symptomDuration: '3 days',
      preExistingConditions: [],
      currentMedications: [],
      allergies: [],
      travelHistory: ['malaria', 'dengue', 'typhoid'].includes(d.id) ? 'Returned from trip 10 days ago' : 'None',
      vitalSigns:
        withVitals && p
          ? {
              bpSystolic: p.sbp.mean,
              bpDiastolic: p.dbp.mean,
              heartRate: p.hr.mean,
              respiratoryRate: p.rr.mean,
              spo2: p.spo2.mean,
              temperatureC: p.temp.mean
            }
          : undefined
    };

    setArenaCurrentPatient(newPatient);
    setArenaHistory([]);
    const state = computeAkinatorInferenceStep(newPatient, [], 1);
    setArenaState(state);
  };

  useEffect(() => {
    setupArenaCase(arenaTargetId, arenaIncludeVitals);
  }, [arenaTargetId, arenaIncludeVitals]);

  const handleArenaStep = () => {
    if (arenaState.isConcluded || !arenaState.nextQuestion) return;

    const q = arenaState.nextQuestion;
    const qDef = QUESTION_CATALOG.find(item => item.id === q.questionId);
    let simulatedAnswer: AkinatorQA['answer'] = 'no';

    if (qDef) {
      const lrConfig = qDef.diseaseLikelihoods[arenaTargetId];
      if (lrConfig) {
        if (lrConfig.lrPos >= 2.0) simulatedAnswer = 'yes';
        else if (lrConfig.lrPos > 1.1) simulatedAnswer = 'probably_yes';
        else if (lrConfig.lrNeg < 0.6) simulatedAnswer = 'no';
        else simulatedAnswer = 'probably_no';
      } else {
        const targetD = CLINICAL_DISEASES[arenaTargetId];
        const text = (targetD?.pathophysiology + ' ' + targetD?.supportingFindings.join(' ')).toLowerCase();
        if (qDef.triggerKeywords && qDef.triggerKeywords.some(kw => text.includes(kw.toLowerCase()))) {
          simulatedAnswer = 'yes';
        } else {
          simulatedAnswer = 'no';
        }
      }
    }

    const newQA: AkinatorQA = {
      questionId: q.questionId,
      question: q.questionText,
      answer: simulatedAnswer,
      timestamp: Date.now()
    };

    const newHistory = [...arenaHistory, newQA];
    setArenaHistory(newHistory);
    const nextState = computeAkinatorInferenceStep(
      arenaCurrentPatient,
      newHistory,
      newHistory.length + 1,
      arenaState.activeHypothesis
    );
    setArenaState(nextState);
  };

  const handleArenaAutoSolve = () => {
    let currentHist = [...arenaHistory];
    let currentState = arenaState;
    let guard = 0;

    while (!currentState.isConcluded && currentState.nextQuestion && guard < 35) {
      guard++;
      const q = currentState.nextQuestion;
      const qDef = QUESTION_CATALOG.find(item => item.id === q.questionId);
      let simulatedAnswer: AkinatorQA['answer'] = 'no';

      if (qDef) {
        const lrConfig = qDef.diseaseLikelihoods[arenaTargetId];
        if (lrConfig) {
          if (lrConfig.lrPos >= 2.0) simulatedAnswer = 'yes';
          else if (lrConfig.lrPos > 1.1) simulatedAnswer = 'probably_yes';
          else if (lrConfig.lrNeg < 0.6) simulatedAnswer = 'no';
          else simulatedAnswer = 'probably_no';
        } else {
          const targetD = CLINICAL_DISEASES[arenaTargetId];
          const text = (targetD?.pathophysiology + ' ' + targetD?.supportingFindings.join(' ')).toLowerCase();
          if (qDef.triggerKeywords && qDef.triggerKeywords.some(kw => text.includes(kw.toLowerCase()))) {
            simulatedAnswer = 'yes';
          } else {
            simulatedAnswer = 'no';
          }
        }
      }

      const newQA: AkinatorQA = {
        questionId: q.questionId,
        question: q.questionText,
        answer: simulatedAnswer,
        timestamp: Date.now()
      };

      currentHist.push(newQA);
      currentState = computeAkinatorInferenceStep(
        arenaCurrentPatient,
        currentHist,
        currentHist.length + 1,
        currentState.activeHypothesis
      );
    }

    setArenaHistory(currentHist);
    setArenaState(currentState);
  };

  // -------------------------------------------------------------
  // Batch Benchmark Runner across all 111 Diseases
  // -------------------------------------------------------------
  const runFullBenchmark = async () => {
    setIsBenchmarking(true);
    setBenchmarkProgress(0);
    const results: BenchmarkResultItem[] = [];

    const diseases = Object.values(CLINICAL_DISEASES);

    for (let i = 0; i < diseases.length; i++) {
      const d = diseases[i];
      setBenchmarkCurrentDisease(d.name);
      setBenchmarkProgress(Math.round(((i + 1) / diseases.length) * 100));

      const simulateOne = (withVitals: boolean) => {
        const p = getDiseaseVitals(d.id);
        const patient: PatientProfile = {
          age: 40,
          gender: 'Male',
          chiefSymptoms: d.keywords.slice(0, 4).join(', '),
          symptomDuration: '3 days',
          preExistingConditions: [],
          currentMedications: [],
          allergies: [],
          travelHistory: ['malaria', 'dengue', 'typhoid'].includes(d.id) ? 'Travel 10 days ago' : 'None',
          vitalSigns:
            withVitals && p
              ? {
                  bpSystolic: p.sbp.mean,
                  bpDiastolic: p.dbp.mean,
                  heartRate: p.hr.mean,
                  respiratoryRate: p.rr.mean,
                  spo2: p.spo2.mean,
                  temperatureC: p.temp.mean
                }
              : undefined
        };

        let hist: AkinatorQA[] = [];
        let state = computeAkinatorInferenceStep(patient, [], 1);
        let turns = 0;

        while (!state.isConcluded && state.nextQuestion && turns < 30) {
          turns++;
          const q = state.nextQuestion;
          const qDef = QUESTION_CATALOG.find(item => item.id === q.questionId);
          let ans: AkinatorQA['answer'] = 'no';

          if (qDef) {
            const lr = qDef.diseaseLikelihoods[d.id];
            if (lr) {
              if (lr.lrPos >= 2.0) ans = 'yes';
              else if (lr.lrPos > 1.1) ans = 'probably_yes';
              else if (lr.lrNeg < 0.6) ans = 'no';
              else ans = 'probably_no';
            } else {
              const text = (d.pathophysiology + ' ' + d.supportingFindings.join(' ')).toLowerCase();
              if (qDef.triggerKeywords && qDef.triggerKeywords.some(kw => text.includes(kw.toLowerCase()))) {
                ans = 'yes';
              } else {
                ans = 'no';
              }
            }
          }

          hist.push({
            questionId: q.questionId,
            question: q.questionText,
            answer: ans,
            timestamp: Date.now()
          });

          state = computeAkinatorInferenceStep(patient, hist, hist.length + 1, state.activeHypothesis);
        }

        const topLead = state.differentialRanking?.[0];
        const isMatch = topLead ? topLead.diseaseName.toLowerCase() === d.name.toLowerCase() : false;
        const conf = topLead?.likelihood || 0;

        return {
          turns: hist.length,
          finalDx: topLead?.diseaseName || 'None',
          isMatch,
          conf
        };
      };

      const resWith = simulateOne(true);
      const resWithout = simulateOne(false);

      results.push({
        id: d.id,
        name: d.name,
        turnsWithVitals: resWith.turns,
        turnsWithoutVitals: resWithout.turns,
        finalDxWithVitals: resWith.finalDx,
        finalDxWithoutVitals: resWithout.finalDx,
        matchWithVitals: resWith.isMatch,
        matchWithoutVitals: resWithout.isMatch,
        confidenceWithVitals: resWith.conf,
        confidenceWithoutVitals: resWithout.conf
      });

      // Small tick for UI responsiveness
      if (i % 5 === 0) {
        await new Promise(r => setTimeout(r, 10));
      }
    }

    setBenchmarkResults(results);
    setIsBenchmarking(false);
  };

  const benchmarkStats = useMemo(() => {
    if (benchmarkResults.length === 0) return null;
    const total = benchmarkResults.length;
    const matchWith = benchmarkResults.filter(r => r.matchWithVitals).length;
    const matchWithout = benchmarkResults.filter(r => r.matchWithoutVitals).length;
    const avgTurnsWith =
      benchmarkResults.reduce((acc, r) => acc + r.turnsWithVitals, 0) / Math.max(1, total);
    const avgTurnsWithout =
      benchmarkResults.reduce((acc, r) => acc + r.turnsWithoutVitals, 0) / Math.max(1, total);
    const acceleration =
      avgTurnsWithout > 0 ? ((avgTurnsWithout - avgTurnsWith) / avgTurnsWithout) * 100 : 0;

    return {
      total,
      accuracyWith: (matchWith / total) * 100,
      accuracyWithout: (matchWithout / total) * 100,
      avgTurnsWith: avgTurnsWith.toFixed(1),
      avgTurnsWithout: avgTurnsWithout.toFixed(1),
      acceleration: acceleration.toFixed(1)
    };
  }, [benchmarkResults]);

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="bg-white border-2 border-zinc-900 rounded-3xl p-6 sm:p-8 shadow-tactile">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-teal-100 text-teal-950 font-black text-xs border border-teal-300">
                AkiMed Testing Ground
              </span>
              <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-950 font-bold text-xs border border-amber-300 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-amber-700" />
                Vitals Margin Elimination Active
              </span>
              <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-950 font-bold text-xs border border-purple-300">
                111 Conditions
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight mt-2">
              Clinical Diagnostic Arena & Vitals Testing Ground
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 mt-1 max-w-3xl">
              Evaluate real-time continuous vitals tolerance margins ($\pm 5-15\%$), examine physiological candidate
              elimination, stress-test margin noise perturbations, and run batch accuracy benchmarks across all 111
              conditions.
            </p>
          </div>

          {/* Subtabs selector */}
          <div className="flex items-center gap-2 p-1.5 bg-zinc-100 rounded-2xl border-2 border-zinc-900 shrink-0 self-start md:self-center">
            <button
              onClick={() => setActiveSubTab('vitals')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeSubTab === 'vitals'
                  ? 'bg-zinc-900 text-white shadow-tactile-sm'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Vitals Elimination Lab</span>
            </button>

            <button
              onClick={() => setActiveSubTab('arena')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeSubTab === 'arena'
                  ? 'bg-zinc-900 text-white shadow-tactile-sm'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>Diagnostic Arena</span>
            </button>

            <button
              onClick={() => setActiveSubTab('benchmark')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeSubTab === 'benchmark'
                  ? 'bg-zinc-900 text-white shadow-tactile-sm'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>111-Disease Benchmark</span>
            </button>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* SUBTAB 1: VITALS ELIMINATION LAB                                     */}
      {/* ==================================================================== */}
      {activeSubTab === 'vitals' && (
        <div className="space-y-6">
          {/* Preset Clinical Scenarios */}
          <div className="bg-white border-2 border-zinc-900 rounded-3xl p-6 shadow-tactile">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-black text-zinc-900 flex items-center gap-2">
                <Flame className="w-4 h-4 text-rose-500" />
                <span>1-Click Preset Clinical Scenarios</span>
              </h2>
              <span className="text-xs font-bold text-zinc-500">Test physiologically distinct states</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
              {PRESET_SCENARIOS.map(p => (
                <button
                  key={p.name}
                  onClick={() => handleApplyPreset(p)}
                  className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                    selectedPreset === p.name
                      ? 'border-zinc-900 bg-zinc-900 text-white shadow-tactile-sm scale-[1.02]'
                      : 'border-zinc-200 bg-zinc-50 hover:border-zinc-400 text-zinc-800'
                  }`}
                >
                  <span className="text-xs font-black leading-tight">{p.name}</span>
                  <span
                    className={`text-[10px] font-bold mt-1.5 px-1.5 py-0.5 rounded-md ${
                      selectedPreset === p.name ? 'bg-zinc-800 text-zinc-300' : 'bg-white text-zinc-600 border border-zinc-200'
                    }`}
                  >
                    {p.badge}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Vitals Sliders and Controls */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: The 6 Vitals Controls */}
            <div className="lg:col-span-2 bg-white border-2 border-zinc-900 rounded-3xl p-6 shadow-tactile space-y-5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h2 className="text-base font-black text-zinc-900 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-teal-600" />
                    <span>Interactive Patient Vitals Station</span>
                  </h2>
                  <p className="text-xs text-zinc-500">
                    Adjust continuous sliders. Within tolerance margin: 100% compatible. Outside: soft Gaussian decay.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleInjectJitter}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 border-zinc-900 bg-amber-50 hover:bg-amber-100 text-amber-950 text-xs font-black shadow-tactile-sm cursor-pointer transition-all"
                    title="Simulate realistic biological variability (+-5-10% jitter)"
                  >
                    <Shuffle className="w-3.5 h-3.5 text-amber-700" />
                    <span>Margin Jitter</span>
                  </button>

                  <button
                    onClick={handleClearVitals}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 border-zinc-900 bg-rose-50 hover:bg-rose-100 text-rose-950 text-xs font-black shadow-tactile-sm cursor-pointer transition-all"
                    title="Remove all vitals to test pure symptom inquiry"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-700" />
                    <span>Clear / Omit Vitals</span>
                  </button>
                </div>
              </div>

              {/* Sliders Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* 1. SBP */}
                <div className="p-3.5 rounded-2xl bg-zinc-50 border-2 border-zinc-200">
                  <div className="flex items-center justify-between text-xs font-bold text-zinc-700 mb-1">
                    <span>Systolic BP (SBP)</span>
                    <span className="font-black text-teal-700">{vitals.bpSystolic !== '' ? `${vitals.bpSystolic} mmHg` : 'Unmeasured'}</span>
                  </div>
                  <input
                    type="range"
                    min="60"
                    max="220"
                    value={vitals.bpSystolic || 120}
                    onChange={e => setVitals(prev => ({ ...prev, bpSystolic: Number(e.target.value) }))}
                    className="w-full accent-teal-600"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-400 mt-1">
                    <span>60 Shock</span>
                    <span>120 Normal</span>
                    <span>220 Crisis</span>
                  </div>
                </div>

                {/* 2. DBP */}
                <div className="p-3.5 rounded-2xl bg-zinc-50 border-2 border-zinc-200">
                  <div className="flex items-center justify-between text-xs font-bold text-zinc-700 mb-1">
                    <span>Diastolic BP (DBP)</span>
                    <span className="font-black text-teal-700">{vitals.bpDiastolic !== '' ? `${vitals.bpDiastolic} mmHg` : 'Unmeasured'}</span>
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="130"
                    value={vitals.bpDiastolic || 80}
                    onChange={e => setVitals(prev => ({ ...prev, bpDiastolic: Number(e.target.value) }))}
                    className="w-full accent-teal-600"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-400 mt-1">
                    <span>40 Severe</span>
                    <span>80 Normal</span>
                    <span>130 Severe</span>
                  </div>
                </div>

                {/* 3. HR */}
                <div className="p-3.5 rounded-2xl bg-zinc-50 border-2 border-zinc-200">
                  <div className="flex items-center justify-between text-xs font-bold text-zinc-700 mb-1">
                    <span>Heart Rate (HR)</span>
                    <span className="font-black text-rose-700">{vitals.heartRate !== '' ? `${vitals.heartRate} bpm` : 'Unmeasured'}</span>
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="200"
                    value={vitals.heartRate || 75}
                    onChange={e => setVitals(prev => ({ ...prev, heartRate: Number(e.target.value) }))}
                    className="w-full accent-rose-600"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-400 mt-1">
                    <span>40 Brady</span>
                    <span>75 Normal</span>
                    <span>200 Tachy</span>
                  </div>
                </div>

                {/* 4. RR */}
                <div className="p-3.5 rounded-2xl bg-zinc-50 border-2 border-zinc-200">
                  <div className="flex items-center justify-between text-xs font-bold text-zinc-700 mb-1">
                    <span>Respiratory Rate (RR)</span>
                    <span className="font-black text-cyan-700">{vitals.respiratoryRate !== '' ? `${vitals.respiratoryRate} /min` : 'Unmeasured'}</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="50"
                    value={vitals.respiratoryRate || 16}
                    onChange={e => setVitals(prev => ({ ...prev, respiratoryRate: Number(e.target.value) }))}
                    className="w-full accent-cyan-600"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-400 mt-1">
                    <span>10 Bradypnea</span>
                    <span>16 Normal</span>
                    <span>50 Tachypnea</span>
                  </div>
                </div>

                {/* 5. SpO2 */}
                <div className="p-3.5 rounded-2xl bg-zinc-50 border-2 border-zinc-200">
                  <div className="flex items-center justify-between text-xs font-bold text-zinc-700 mb-1">
                    <span>Oxygen Saturation (SpO2)</span>
                    <span className="font-black text-indigo-700">{vitals.spo2 !== '' ? `${vitals.spo2}%` : 'Unmeasured'}</span>
                  </div>
                  <input
                    type="range"
                    min="70"
                    max="100"
                    value={vitals.spo2 || 98}
                    onChange={e => setVitals(prev => ({ ...prev, spo2: Number(e.target.value) }))}
                    className="w-full accent-indigo-600"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-400 mt-1">
                    <span>70% Hypoxemia</span>
                    <span>95% Borderline</span>
                    <span>100% Optimal</span>
                  </div>
                </div>

                {/* 6. Temperature */}
                <div className="p-3.5 rounded-2xl bg-zinc-50 border-2 border-zinc-200">
                  <div className="flex items-center justify-between text-xs font-bold text-zinc-700 mb-1">
                    <span>Body Temperature</span>
                    <span className="font-black text-orange-700">{vitals.temperatureC !== '' ? `${vitals.temperatureC} °C` : 'Unmeasured'}</span>
                  </div>
                  <input
                    type="range"
                    min="35.0"
                    max="41.5"
                    step="0.1"
                    value={vitals.temperatureC || 37.0}
                    onChange={e => setVitals(prev => ({ ...prev, temperatureC: Number(e.target.value) }))}
                    className="w-full accent-orange-600"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-400 mt-1">
                    <span>35.0 Hypothermia</span>
                    <span>37.0 Normal</span>
                    <span>41.5 Hyperpyrexia</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right 1 Col: Live Real-Time Elimination Scorecard */}
            <div className="bg-white border-2 border-zinc-900 rounded-3xl p-6 shadow-tactile flex flex-col justify-between space-y-4">
              <div>
                <h3 className="text-base font-black text-zinc-900 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-emerald-600" />
                  <span>Elimination Scorecard</span>
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Dynamic pruning across all 111 MBBS medical conditions.
                </p>

                <div className="space-y-3 mt-4">
                  {/* Pruning Efficiency */}
                  <div className="p-4 rounded-2xl bg-zinc-900 text-white">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-300">Pruning Efficiency</span>
                      <span className="text-xl font-black text-teal-400">
                        {((eliminatedList.length / allDiseaseList.length) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-zinc-700 h-2 rounded-full overflow-hidden mt-2">
                      <div
                        className="bg-teal-400 h-full transition-all duration-300"
                        style={{ width: `${(eliminatedList.length / allDiseaseList.length) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-2 font-medium">
                      {eliminatedList.length} of {allDiseaseList.length} candidate diagnoses ruled out on Turn 0.
                    </p>
                  </div>

                  {/* Badges Breakdown */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2.5 rounded-xl border-2 border-emerald-300 bg-emerald-50">
                      <span className="block text-lg font-black text-emerald-950">{favoredList.length}</span>
                      <span className="text-[10px] font-bold text-emerald-800">Favored</span>
                    </div>

                    <div className="p-2.5 rounded-xl border-2 border-amber-300 bg-amber-50">
                      <span className="block text-lg font-black text-amber-950">{compatibleList.length}</span>
                      <span className="text-[10px] font-bold text-amber-800">Compatible</span>
                    </div>

                    <div className="p-2.5 rounded-xl border-2 border-rose-300 bg-rose-50">
                      <span className="block text-lg font-black text-rose-950">{eliminatedList.length}</span>
                      <span className="text-[10px] font-bold text-rose-800">Eliminated</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action: Launch Case in Akinator */}
              {onLaunchCase && (
                <button
                  onClick={() =>
                    onLaunchCase({
                      age: 45,
                      gender: 'Male',
                      chiefSymptoms: activeChief,
                      symptomDuration: '2 days',
                      preExistingConditions: [],
                      currentMedications: [],
                      allergies: [],
                      travelHistory: 'None',
                      vitalSigns: vitalsPatientProfile
                    })
                  }
                  className="w-full py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-black text-xs shadow-tactile-sm flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Launch in Dr. Akinator Game</span>
                </button>
              )}
            </div>
          </div>

          {/* Disease Elimination Explorer (All 111 Diseases) */}
          <div className="bg-white border-2 border-zinc-900 rounded-3xl p-6 shadow-tactile space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-black text-zinc-900">
                  111-Disease Physiological Tolerance Matrix
                </h3>
                <p className="text-xs text-zinc-500">
                  Inspect continuous soft likelihood multipliers, expected vs measured parameters, and clinical reasons.
                </p>
              </div>

              {/* Filter and Search */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={e => setSearchFilter(e.target.value)}
                    placeholder="Search 111 conditions..."
                    className="pl-8 pr-3 py-1.5 rounded-xl border-2 border-zinc-200 text-xs font-bold text-zinc-800 focus:border-zinc-900 outline-none"
                  />
                </div>

                <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-xl border border-zinc-300">
                  {(['all', 'favored', 'compatible', 'eliminated'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setStatusFilter(tab)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-black capitalize transition-all cursor-pointer ${
                        statusFilter === tab ? 'bg-zinc-900 text-white shadow-tactile-sm' : 'text-zinc-600 hover:text-zinc-950'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Matrix Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[560px] overflow-y-auto pr-1">
              {filteredEvaluations.map(ev => {
                const disease = CLINICAL_DISEASES[ev.diseaseId];
                const isFav = ev.status === 'favored';
                const isElim = ev.status === 'eliminated';

                return (
                  <div
                    key={ev.diseaseId}
                    className={`p-4 rounded-2xl border-2 transition-all ${
                      isFav
                        ? 'border-emerald-400 bg-emerald-50/50'
                        : isElim
                        ? 'border-zinc-200 bg-zinc-50/60 opacity-70 hover:opacity-100'
                        : 'border-amber-300 bg-amber-50/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-xs font-black text-zinc-900 leading-snug">{ev.diseaseName}</h4>
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                          ICD-10: {disease?.icd10 || 'N/A'} • {disease?.system || 'Systemic'}
                        </span>
                      </div>

                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                          isFav
                            ? 'bg-emerald-100 text-emerald-950 border-emerald-300'
                            : isElim
                            ? 'bg-rose-100 text-rose-950 border-rose-300'
                            : 'bg-amber-100 text-amber-950 border-amber-300'
                        }`}
                      >
                        {ev.status} ({(ev.overallMultiplier * 100).toFixed(0)}%)
                      </span>
                    </div>

                    {/* Vitals Individual Multipliers */}
                    <div className="grid grid-cols-6 gap-1 mt-2.5 text-center">
                      <div
                        className={`p-1 rounded-md text-[9px] font-bold border ${
                          ev.vitalMultipliers.sbp > 0.8
                            ? 'bg-emerald-100 border-emerald-300 text-emerald-900'
                            : 'bg-rose-100 border-rose-300 text-rose-900'
                        }`}
                        title="BP Systolic Compatibility"
                      >
                        BP {(ev.vitalMultipliers.sbp * 100).toFixed(0)}%
                      </div>

                      <div
                        className={`p-1 rounded-md text-[9px] font-bold border ${
                          ev.vitalMultipliers.hr > 0.8
                            ? 'bg-emerald-100 border-emerald-300 text-emerald-900'
                            : 'bg-rose-100 border-rose-300 text-rose-900'
                        }`}
                        title="Heart Rate Compatibility"
                      >
                        HR {(ev.vitalMultipliers.hr * 100).toFixed(0)}%
                      </div>

                      <div
                        className={`p-1 rounded-md text-[9px] font-bold border ${
                          ev.vitalMultipliers.rr > 0.8
                            ? 'bg-emerald-100 border-emerald-300 text-emerald-900'
                            : 'bg-rose-100 border-rose-300 text-rose-900'
                        }`}
                        title="Respiratory Rate Compatibility"
                      >
                        RR {(ev.vitalMultipliers.rr * 100).toFixed(0)}%
                      </div>

                      <div
                        className={`p-1 rounded-md text-[9px] font-bold border ${
                          ev.vitalMultipliers.spo2 > 0.8
                            ? 'bg-emerald-100 border-emerald-300 text-emerald-900'
                            : 'bg-rose-100 border-rose-300 text-rose-900'
                        }`}
                        title="SpO2 Compatibility"
                      >
                        SpO2 {(ev.vitalMultipliers.spo2 * 100).toFixed(0)}%
                      </div>

                      <div
                        className={`p-1 rounded-md text-[9px] font-bold border ${
                          ev.vitalMultipliers.temp > 0.8
                            ? 'bg-emerald-100 border-emerald-300 text-emerald-900'
                            : 'bg-rose-100 border-rose-300 text-rose-900'
                        }`}
                        title="Temperature Compatibility"
                      >
                        T {(ev.vitalMultipliers.temp * 100).toFixed(0)}%
                      </div>

                      <div
                        className={`p-1 rounded-md text-[9px] font-bold border ${
                          ev.vitalMultipliers.dbp > 0.8
                            ? 'bg-emerald-100 border-emerald-300 text-emerald-900'
                            : 'bg-rose-100 border-rose-300 text-rose-900'
                        }`}
                        title="BP Diastolic Compatibility"
                      >
                        DBP {(ev.vitalMultipliers.dbp * 100).toFixed(0)}%
                      </div>
                    </div>

                    {/* Explanations */}
                    <div className="mt-2 text-[11px] font-medium text-zinc-600 space-y-1">
                      {ev.eliminationReasons.slice(0, 2).map((r, idx) => (
                        <p key={idx} className="text-rose-700 flex items-start gap-1">
                          <span className="shrink-0 text-rose-500 font-bold">•</span>
                          <span>{r}</span>
                        </p>
                      ))}

                      {ev.supportingReasons.slice(0, 1).map((s, idx) => (
                        <p key={idx} className="text-emerald-700 flex items-start gap-1">
                          <span className="shrink-0 text-emerald-500 font-bold">•</span>
                          <span>{s}</span>
                        </p>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* SUBTAB 2: INTERACTIVE DIAGNOSTIC ARENA                               */}
      {/* ==================================================================== */}
      {activeSubTab === 'arena' && (
        <div className="space-y-6">
          {/* Target Disease Selector Bar */}
          <div className="bg-white border-2 border-zinc-900 rounded-3xl p-6 shadow-tactile">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-zinc-900 text-white flex items-center justify-center font-black">
                  <Target className="w-5 h-5 text-teal-400" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-zinc-900">Ground-Truth Target Condition</h3>
                  <p className="text-xs text-zinc-500">Pick any of 111 diseases or test a random blind presentation.</p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={arenaTargetId}
                  onChange={e => setArenaTargetId(e.target.value)}
                  className="px-3.5 py-2 rounded-xl border-2 border-zinc-900 bg-zinc-50 text-xs font-black text-zinc-900 outline-none"
                >
                  {allDiseaseList.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.icd10})
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => {
                    const randomIdx = Math.floor(Math.random() * allDiseaseList.length);
                    setArenaTargetId(allDiseaseList[randomIdx].id);
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 border-zinc-900 bg-amber-50 hover:bg-amber-100 text-xs font-black text-zinc-900 shadow-tactile-sm cursor-pointer"
                >
                  <Shuffle className="w-3.5 h-3.5 text-amber-700" />
                  <span>Random</span>
                </button>

                <label className="flex items-center gap-2 px-3 py-2 rounded-xl border-2 border-zinc-900 bg-zinc-50 text-xs font-black text-zinc-900 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={arenaIncludeVitals}
                    onChange={e => setArenaIncludeVitals(e.target.checked)}
                    className="accent-teal-600 rounded"
                  />
                  <span>Include Vitals</span>
                </label>
              </div>
            </div>

            {/* Seeded Presentation Summary */}
            <div className="mt-4 p-4 rounded-2xl bg-zinc-50 border border-zinc-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="block font-bold text-zinc-400 text-[10px] uppercase">Chief Symptoms</span>
                <span className="font-extrabold text-zinc-900">{arenaCurrentPatient.chiefSymptoms}</span>
              </div>

              <div>
                <span className="block font-bold text-zinc-400 text-[10px] uppercase">Physiological Vitals</span>
                <span className="font-extrabold text-teal-700">
                  {arenaIncludeVitals && arenaCurrentPatient.vitalSigns
                    ? `BP ${arenaCurrentPatient.vitalSigns.bpSystolic}/${arenaCurrentPatient.vitalSigns.bpDiastolic} | HR ${arenaCurrentPatient.vitalSigns.heartRate} | RR ${arenaCurrentPatient.vitalSigns.respiratoryRate} | SpO2 ${arenaCurrentPatient.vitalSigns.spo2}% | T ${arenaCurrentPatient.vitalSigns.temperatureC}°C`
                    : 'Omitted / Cleared'}
                </span>
              </div>

              <div>
                <span className="block font-bold text-zinc-400 text-[10px] uppercase">Certainty Target</span>
                <span className="font-extrabold text-indigo-700">Stopping Rule: ≥ 95% Confidence</span>
              </div>
            </div>
          </div>

          {/* Arena Stepper & Real-time Reasoning */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Question Stream & Controls */}
            <div className="lg:col-span-2 bg-white border-2 border-zinc-900 rounded-3xl p-6 shadow-tactile space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-zinc-900">Dr. Akinator Inquiry Stream</h3>
                  <span className="text-xs font-bold text-zinc-500">
                    Turn {arenaHistory.length} • Certainty: {arenaState.activeHypothesis?.confidence ?? 0}%
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleArenaStep}
                    disabled={arenaState.isConcluded || !arenaState.nextQuestion}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border-2 border-zinc-900 bg-teal-600 hover:bg-teal-700 text-white font-black text-xs shadow-tactile-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Run 1 Question</span>
                  </button>

                  <button
                    onClick={handleArenaAutoSolve}
                    disabled={arenaState.isConcluded}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border-2 border-zinc-900 bg-zinc-900 text-white hover:bg-zinc-800 font-black text-xs shadow-tactile-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>⚡ Auto-Solve to ≥95%</span>
                  </button>

                  <button
                    onClick={() => setupArenaCase(arenaTargetId, arenaIncludeVitals)}
                    className="p-2 rounded-xl border-2 border-zinc-900 bg-zinc-100 hover:bg-zinc-200 cursor-pointer"
                    title="Reset Simulation"
                  >
                    <RotateCcw className="w-4 h-4 text-zinc-800" />
                  </button>
                </div>
              </div>

              {/* Akinator Thought Bubble */}
              <div className="p-4 rounded-2xl bg-teal-50/80 border-2 border-teal-500 text-xs text-teal-950 font-bold flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <span className="block font-black text-teal-900 text-[11px] uppercase tracking-wider mb-0.5">
                    Dr. Akinator Diagnostic Cognition
                  </span>
                  <span>{arenaState.akinatorThought}</span>
                </div>
              </div>

              {/* Conclusion Banner */}
              {arenaState.isConcluded && (
                <div
                  className={`p-4 rounded-2xl border-2 flex items-center justify-between gap-4 ${
                    (arenaState.differentialRanking?.[0]?.diseaseName || '').toLowerCase() ===
                    CLINICAL_DISEASES[arenaTargetId]?.name.toLowerCase()
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-950'
                      : 'bg-amber-50 border-amber-600 text-amber-950'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                    <div>
                      <h4 className="text-sm font-black">
                        Diagnosed: {arenaState.differentialRanking?.[0]?.diseaseName || 'None'} (
                        {arenaState.activeHypothesis?.confidence ?? 0}%)
                      </h4>
                      <p className="text-xs">
                        Reached ≥95% certainty in <strong>{arenaHistory.length} questions</strong>{' '}
                        {arenaIncludeVitals ? 'with physiological vitals acceleration' : 'without vitals'}.
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-white border border-zinc-300 rounded-xl font-black text-xs">
                    {(arenaState.differentialRanking?.[0]?.diseaseName || '').toLowerCase() ===
                    CLINICAL_DISEASES[arenaTargetId]?.name.toLowerCase()
                      ? 'MATCH 100%'
                      : 'CLOSE DIFFERENTIAL'}
                  </span>
                </div>
              )}

              {/* Next Question Preview */}
              {!arenaState.isConcluded && arenaState.nextQuestion && (
                <div className="p-4 rounded-2xl bg-zinc-900 text-white space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider">
                      Next Maximally Discriminating Inquiry
                    </span>
                    <span className="text-[10px] font-bold text-zinc-400">
                      Category: {arenaState.nextQuestion.category}
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-white">{arenaState.nextQuestion.questionText}</h4>
                  <p className="text-[11px] text-zinc-300 italic">
                    Rationale: {arenaState.nextQuestion.clinicalRationale}
                  </p>
                </div>
              )}

              {/* History of Answered Questions */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Inquiry History</h4>
                {arenaHistory.length === 0 ? (
                  <p className="text-xs text-zinc-400 italic">No questions answered yet. Click "Run 1 Question" to start.</p>
                ) : (
                  <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                    {arenaHistory.map((h, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-between text-xs font-medium"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-zinc-200 text-zinc-700 flex items-center justify-center font-black text-[10px]">
                            {idx + 1}
                          </span>
                          <span className="text-zinc-800">{h.question}</span>
                        </div>
                        <span
                          className={`font-black text-[11px] px-2 py-0.5 rounded-md uppercase ${
                            h.answer === 'yes'
                              ? 'bg-emerald-100 text-emerald-950 border border-emerald-300'
                              : 'bg-zinc-200 text-zinc-700'
                          }`}
                        >
                          {h.answer}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right 1 Col: Live Differential Leaderboard */}
            <div className="bg-white border-2 border-zinc-900 rounded-3xl p-6 shadow-tactile space-y-4">
              <h3 className="text-base font-black text-zinc-900 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-teal-600" />
                <span>Live Differential Ranking</span>
              </h3>
              <p className="text-xs text-zinc-500">
                Posterior probability shifts dynamically across all 111 conditions after every turn.
              </p>

              <div className="space-y-2 mt-2">
                {(arenaState.differentialRanking || []).slice(0, 7).map((item, idx) => {
                  const isTarget =
                    item.diseaseName.toLowerCase() === CLINICAL_DISEASES[arenaTargetId]?.name.toLowerCase();

                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-2xl border-2 transition-all ${
                        idx === 0
                          ? 'border-teal-500 bg-teal-50/70 shadow-tactile-sm'
                          : isTarget
                          ? 'border-amber-400 bg-amber-50/50'
                          : 'border-zinc-200 bg-zinc-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-lg bg-zinc-900 text-white flex items-center justify-center font-black text-[10px]">
                            #{idx + 1}
                          </span>
                          <span className="text-xs font-black text-zinc-900 leading-snug">{item.diseaseName}</span>
                        </div>
                        <span className="text-xs font-black text-teal-700">{item.likelihood}%</span>
                      </div>

                      <div className="w-full bg-zinc-200 h-1.5 rounded-full overflow-hidden mt-2">
                        <div
                          className="bg-teal-600 h-full rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, item.likelihood)}%` }}
                        ></div>
                      </div>

                      {isTarget && (
                        <span className="text-[10px] font-black text-amber-700 mt-1 block">
                          ⭐ Ground-truth target
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* SUBTAB 3: 111-DISEASE ACCURACY BENCHMARK SUITE                       */}
      {/* ==================================================================== */}
      {activeSubTab === 'benchmark' && (
        <div className="space-y-6">
          {/* Benchmark Controls Card */}
          <div className="bg-white border-2 border-zinc-900 rounded-3xl p-6 sm:p-8 shadow-tactile space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-zinc-900">
                  Comprehensive 111-Disease Accuracy & Speed Benchmark
                </h3>
                <p className="text-xs text-zinc-500 mt-1 max-w-2xl">
                  Simulates complete clinical patient encounters across all 111 medical conditions, comparing diagnosis
                  accuracy and turns-to-certainty with vitals elimination vs without vitals.
                </p>
              </div>

              <button
                onClick={runFullBenchmark}
                disabled={isBenchmarking}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white font-black text-xs shadow-tactile cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isBenchmarking ? (
                  <>
                    <Activity className="w-4 h-4 animate-spin text-teal-400" />
                    <span>Running Benchmark ({benchmarkProgress}%)...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>Start 111-Disease Benchmark</span>
                  </>
                )}
              </button>
            </div>

            {/* Live Progress Bar */}
            {isBenchmarking && (
              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2">
                <div className="flex justify-between text-xs font-bold text-zinc-700">
                  <span>Testing: {benchmarkCurrentDisease}...</span>
                  <span>{benchmarkProgress}%</span>
                </div>
                <div className="w-full bg-zinc-200 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-teal-500 h-full transition-all duration-150"
                    style={{ width: `${benchmarkProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Real-time Summary Cards */}
            {benchmarkStats && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-4 rounded-2xl border-2 border-emerald-400 bg-emerald-50">
                  <span className="block text-xs font-bold text-emerald-800">Top-1 Accuracy</span>
                  <span className="text-2xl font-black text-emerald-950">{benchmarkStats.accuracyWith.toFixed(1)}%</span>
                  <span className="text-[10px] font-bold text-emerald-700 mt-1 block">
                    Target: Definitive ≥ 95%
                  </span>
                </div>

                <div className="p-4 rounded-2xl border-2 border-teal-400 bg-teal-50">
                  <span className="block text-xs font-bold text-teal-800">Avg Turns (With Vitals)</span>
                  <span className="text-2xl font-black text-teal-950">{benchmarkStats.avgTurnsWith} turns</span>
                  <span className="text-[10px] font-bold text-teal-700 mt-1 block">Accelerated by soft elimination</span>
                </div>

                <div className="p-4 rounded-2xl border-2 border-zinc-300 bg-zinc-50">
                  <span className="block text-xs font-bold text-zinc-600">Avg Turns (Without Vitals)</span>
                  <span className="text-2xl font-black text-zinc-900">{benchmarkStats.avgTurnsWithout} turns</span>
                  <span className="text-[10px] font-bold text-zinc-500 mt-1 block">Baseline symptom inquiry</span>
                </div>

                <div className="p-4 rounded-2xl border-2 border-amber-400 bg-amber-50">
                  <span className="block text-xs font-bold text-amber-800">Diagnostic Acceleration</span>
                  <span className="text-2xl font-black text-amber-950">{benchmarkStats.acceleration}%</span>
                  <span className="text-[10px] font-bold text-amber-700 mt-1 block">Faster to diagnosis</span>
                </div>
              </div>
            )}
          </div>

          {/* Results Table */}
          {benchmarkResults.length > 0 && (
            <div className="bg-white border-2 border-zinc-900 rounded-3xl p-6 shadow-tactile space-y-4">
              <h4 className="text-base font-black text-zinc-900">
                111-Disease Full Encounter Benchmark Log ({benchmarkResults.length} cases)
              </h4>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-100 text-zinc-600 uppercase text-[10px] font-black border-b border-zinc-200">
                    <tr>
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Condition Name</th>
                      <th className="py-2.5 px-3">With Vitals</th>
                      <th className="py-2.5 px-3">Turns (With)</th>
                      <th className="py-2.5 px-3">Without Vitals</th>
                      <th className="py-2.5 px-3">Turns (Without)</th>
                      <th className="py-2.5 px-3">Delta / Speedup</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {benchmarkResults.map((r, idx) => (
                      <tr key={r.id} className="hover:bg-zinc-50">
                        <td className="py-2 px-3 font-bold text-zinc-400">{idx + 1}</td>
                        <td className="py-2 px-3 font-black text-zinc-900">{r.name}</td>
                        <td className="py-2 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${
                              r.matchWithVitals
                                ? 'bg-emerald-100 text-emerald-950 border-emerald-300'
                                : 'bg-rose-100 text-rose-950 border-rose-300'
                            }`}
                          >
                            {r.matchWithVitals ? 'MATCH (100%)' : 'DIFF'} ({r.confidenceWithVitals}%)
                          </span>
                        </td>
                        <td className="py-2 px-3 font-black text-teal-700">{r.turnsWithVitals} Qs</td>
                        <td className="py-2 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${
                              r.matchWithoutVitals
                                ? 'bg-zinc-100 text-zinc-950 border-zinc-300'
                                : 'bg-rose-100 text-rose-950 border-rose-300'
                            }`}
                          >
                            {r.matchWithoutVitals ? 'MATCH' : 'DIFF'} ({r.confidenceWithoutVitals}%)
                          </span>
                        </td>
                        <td className="py-2 px-3 font-bold text-zinc-600">{r.turnsWithoutVitals} Qs</td>
                        <td className="py-2 px-3 font-black text-emerald-700">
                          {r.turnsWithoutVitals - r.turnsWithVitals > 0
                            ? `-${r.turnsWithoutVitals - r.turnsWithVitals} Qs faster`
                            : 'Same turns'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
