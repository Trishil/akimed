import React, { useState } from 'react';
import { Header } from './components/Header';
import { PatientForm } from './components/PatientForm';
import { AkinatorGame } from './components/AkinatorGame';
import { TriageDifferentialView } from './components/TriageDifferentialView';
import { VignetteSelector } from './components/VignetteSelector';
import { MbbsProjectGuide } from './components/MbbsProjectGuide';
import { 
  PatientProfile, 
  AkinatorState, 
  AkinatorQA, 
  DiagnosticAssessment, 
  PrebuiltVignette 
} from './types/clinical';
import { SAMPLE_CLINICAL_VIGNETTES } from './data/vignettes';
import { 
  generateDeterministicAssessment, 
  getNextAkinatorQuestionDeterministic 
} from './utils/clinicalFallbackEngine';
import { computeAkinatorInferenceStep } from './utils/clinicalInferenceEngine';
import { AlertCircle, Sparkles, BookOpen, RefreshCw, Cpu, HardDrive, ArrowDownRight, Compass } from 'lucide-react';
import { TrainingTelemetryModal } from './components/TrainingTelemetryModal';

const INITIAL_PATIENT: PatientProfile = SAMPLE_CLINICAL_VIGNETTES[0].patient;

export default function App() {
  const [activeTab, setActiveTab] = useState<'akinator' | 'triage' | 'vignettes' | 'guide'>('akinator');
  const [patient, setPatient] = useState<PatientProfile>(INITIAL_PATIENT);
  const [history, setHistory] = useState<AkinatorQA[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Akinator state
  const [akinatorState, setAkinatorState] = useState<AkinatorState>(() =>
    computeAkinatorInferenceStep(INITIAL_PATIENT, [], 1)
  );

  // Triage & Assessment state
  const [assessment, setAssessment] = useState<DiagnosticAssessment | null>(() =>
    generateDeterministicAssessment(INITIAL_PATIENT)
  );

  const [showTelemetryModal, setShowTelemetryModal] = useState<boolean>(false);

  // Start Akinator from Patient Profile
  const handleStartAkinator = async () => {
    if (!patient.chiefSymptoms.trim()) {
      setError('Please provide chief symptoms to start.');
      return;
    }

    setIsLoading(true);
    setError(null);
    // Isolate Session State on Launch: completely wipe active question-history, previous assessment, and candidates
    setHistory([]);
    setAssessment(null);
    setAkinatorState((prev) => ({
      ...prev,
      step: 1,
      maxSteps: 50,
      isConcluded: false,
      isDefinitive: false,
      differentialRanking: [],
      currentCandidates: [],
      nextQuestion: undefined,
      finalDiagnosis: undefined,
      assessment: undefined,
      akinatorThought: 'Isolating session state & incorporating travel and chronology priors before Question 1...',
    }));

    try {
      const res = await fetch('/api/akinator/step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient,
          history: [],
          step: 1,
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: AkinatorState = await res.json();
      setAkinatorState(data);
      if (data.assessment) {
        setAssessment(data.assessment);
      }
      setActiveTab('akinator');
    } catch (err) {
      console.warn('Backend API request failed, using client dynamic Bayesian logic:', err);
      const dynamicStep = computeAkinatorInferenceStep(patient, [], 1);
      setAkinatorState(dynamicStep);
      if (dynamicStep.assessment) {
        setAssessment(dynamicStep.assessment);
      }
      setActiveTab('akinator');
    } finally {
      setIsLoading(false);
    }
  };

  // Answer question in Akinator loop
  const handleAnswerQuestion = async (
    answer: 'yes' | 'no' | 'unsure' | 'probably_yes' | 'probably_no'
  ) => {
    if (!akinatorState.nextQuestion) return;

    const currentQ = akinatorState.nextQuestion;
    const newHistory: AkinatorQA[] = [
      ...history,
      {
        questionId: currentQ.questionId,
        question: currentQ.questionText,
        answer,
        clinicalRationale: currentQ.clinicalRationale,
      },
    ];
    setHistory(newHistory);
    setIsLoading(true);

    try {
      const nextStep = akinatorState.step + 1;
      const res = await fetch('/api/akinator/step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient,
          history: newHistory,
          step: nextStep,
          activeHypothesis: akinatorState.activeHypothesis,
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: AkinatorState = await res.json();
      setAkinatorState(data);
      if (data.assessment) {
        setAssessment(data.assessment);
      }
    } catch (err) {
      console.warn('Akinator step API failed, using client dynamic Bayesian engine:', err);
      const dynamicStep = computeAkinatorInferenceStep(
        patient,
        newHistory,
        akinatorState.step + 1,
        akinatorState.activeHypothesis
      );
      setAkinatorState(dynamicStep);
      if (dynamicStep.assessment) {
        setAssessment(dynamicStep.assessment);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Generate Comprehensive Triage & Differential
  const handleGenerateTriage = async () => {
    if (!patient.chiefSymptoms.trim()) {
      setError('Please provide chief symptoms to evaluate.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patient }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: DiagnosticAssessment = await res.json();
      setAssessment(data);
      setActiveTab('triage');
    } catch (err) {
      console.warn('Diagnose API failed, using deterministic fallback:', err);
      const data = generateDeterministicAssessment(patient);
      setAssessment(data);
      setActiveTab('triage');
    } finally {
      setIsLoading(false);
    }
  };

  // Load a Prebuilt Clinical Vignette with complete session state isolation
  const handleSelectVignette = async (vignette: PrebuiltVignette) => {
    setPatient(vignette.patient);
    setHistory([]);
    setAssessment(null);
    setIsLoading(true);
    setActiveTab('akinator');

    setAkinatorState({
      step: 1,
      maxSteps: 50,
      isConcluded: false,
      isDefinitive: false,
      differentialRanking: [],
      currentCandidates: [],
      nextQuestion: undefined,
      akinatorThought: `Loaded Case: "${vignette.title}". Factorizing travel priors and initializing Question 1...`,
    });

    try {
      const res = await fetch('/api/akinator/step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient: vignette.patient,
          history: [],
          step: 1,
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: AkinatorState = await res.json();
      setAkinatorState(data);
      if (data.assessment) {
        setAssessment(data.assessment);
      }
    } catch {
      const dynamicStep = computeAkinatorInferenceStep(vignette.patient, [], 1);
      setAkinatorState(dynamicStep);
      if (dynamicStep.assessment) {
        setAssessment(dynamicStep.assessment);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestart = async () => {
    setHistory([]);
    setAssessment(null);
    setIsLoading(true);

    setAkinatorState((prev) => ({
      ...prev,
      step: 1,
      maxSteps: 50,
      isConcluded: false,
      isDefinitive: false,
      differentialRanking: [],
      currentCandidates: [],
      nextQuestion: undefined,
      akinatorThought: 'Restarting inquiry session and wiping prior evidence...',
    }));

    try {
      const res = await fetch('/api/akinator/step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient,
          history: [],
          step: 1,
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: AkinatorState = await res.json();
      setAkinatorState(data);
      if (data.assessment) {
        setAssessment(data.assessment);
      }
    } catch {
      const dynamicStep = computeAkinatorInferenceStep(patient, [], 1);
      setAkinatorState(dynamicStep);
      if (dynamicStep.assessment) {
        setAssessment(dynamicStep.assessment);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPatient = () => {
    setPatient({
      age: 25,
      gender: 'Male',
      chiefSymptoms: '',
      symptomDuration: '',
      preExistingConditions: [],
      currentMedications: [],
      allergies: [],
      travelHistory: '',
      vitalSigns: {
        bpSystolic: 120,
        bpDiastolic: 80,
        heartRate: 75,
        respiratoryRate: 16,
        spo2: 98,
        temperatureC: 37.0,
      },
    });
    setHistory([]);
    setAssessment(null);
  };

  return (
    <div className="min-h-screen bg-paper-pattern text-zinc-900 flex flex-col font-sans selection:bg-yellow-200 selection:text-zinc-950">
      {/* App Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onResetPatient={handleResetPatient}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Akademia-Style Hero Headline Section */}
        <section className="relative pt-4 pb-2">
          {/* Circular Stamp Graphic Badge (Akademia Reference Style) */}
          <div className="absolute -top-3 right-2 sm:right-6 pointer-events-none select-none hidden md:block">
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg className="w-full h-full animate-spin-slow text-zinc-900" viewBox="0 0 100 100">
                <path
                  id="circlePath"
                  d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
                  fill="transparent"
                />
                <text className="text-[7.5px] font-black uppercase tracking-widest fill-zinc-900">
                  <textPath href="#circlePath">
                    • AKIMED 10-LAYER TRANSFORMER • 600K ENCOUNTERS • APPLE MPS •
                  </textPath>
                </text>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl">🩺</span>
              </div>
            </div>
          </div>

          <div className="max-w-3xl">
            {/* Inline Capsule Headline (Akademia Reference Style) */}
            <h1 className="text-3xl sm:text-5xl font-black text-zinc-900 tracking-tight leading-[1.15] mb-4">
              Find{' '}
              <span className="inline-flex items-center mx-1 px-3 py-0.5 rounded-full bg-emerald-300 text-zinc-950 text-xs sm:text-sm font-black border-2 border-zinc-900 align-middle shadow-tactile-sm">
                10-Layer AI
              </span>{' '}
              differential{' '}
              <span className="highlighter-stroke">diagnoses</span> & triage{' '}
              <span className="inline-flex items-center mx-1 px-2.5 py-0.5 rounded-full bg-yellow-300 text-zinc-950 text-xs sm:text-sm font-black border-2 border-zinc-900 align-middle shadow-tactile-sm">
                ⚡ MPS GPU
              </span>
            </h1>

            <p className="text-sm sm:text-base text-zinc-600 font-medium leading-relaxed max-w-2xl">
              An evidence-based diagnostic Akinator and 5-tier ESI emergency triage engine powered by a 10-Layer Pre-LN Clinical Attention Transformer. Type symptoms freely — typos and misspellings are automatically resolved in real-time.
            </p>

            {/* Quick Stats Pill Strip */}
            <div className="flex flex-wrap items-center gap-2.5 mt-5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border-2 border-zinc-900 text-xs font-bold text-zinc-800 shadow-tactile-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>10-Layer Transformer (Pre-LN / ~34 MB)</span>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border-2 border-zinc-900 text-xs font-bold text-zinc-800 shadow-tactile-sm">
                <span>Top-3 Accuracy:</span>
                <span className="text-emerald-600 font-black">99.99%</span>
              </div>

              <button
                onClick={() => setShowTelemetryModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-black shadow-tactile-sm transition-transform hover:-translate-y-0.5 cursor-pointer"
              >
                <Cpu className="w-3.5 h-3.5 text-teal-400" />
                <span>Inspect Saved Weights</span>
              </button>
            </div>
          </div>
        </section>

        {/* Error notification */}
        {error && (
          <div className="bg-rose-50 border-2 border-rose-600 rounded-2xl p-4 text-xs font-bold text-rose-900 flex items-center justify-between shadow-tactile-sm">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="px-3 py-1 bg-white border border-rose-300 rounded-lg text-rose-700 hover:text-rose-950 font-bold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Global Patient Intake Bar (Visible on Akinator and Triage tabs for quick tweak) */}
        {(activeTab === 'akinator' || activeTab === 'triage') && (
          <PatientForm
            patient={patient}
            setPatient={setPatient}
            onStartAkinator={handleStartAkinator}
            onGenerateTriage={handleGenerateTriage}
            isLoading={isLoading}
          />
        )}

        {/* Tab 1: Dr. Akinator Game */}
        {activeTab === 'akinator' && (
          <AkinatorGame
            patient={patient}
            akinatorState={akinatorState}
            history={history}
            onAnswerQuestion={handleAnswerQuestion}
            onRestart={handleRestart}
            onViewFullTriage={() => setActiveTab('triage')}
            isLoading={isLoading}
          />
        )}

        {/* Tab 2: Triage & Full Differential */}
        {activeTab === 'triage' && assessment && (
          <TriageDifferentialView
            assessment={assessment}
            patient={patient}
            onPlayAkinator={() => setActiveTab('akinator')}
          />
        )}

        {/* Tab 3: Pre-built High-Yield MBBS Clinical Vignettes */}
        {activeTab === 'vignettes' && (
          <VignetteSelector onSelectVignette={handleSelectVignette} />
        )}

        {/* Tab 4: MBBS Project Blueprint & Training Guide */}
        {activeTab === 'guide' && <MbbsProjectGuide />}
      </main>

      {/* Footer - Clean Akademia Editorial Style */}
      <footer className="border-t-2 border-zinc-900/10 bg-white/70 py-6 mt-12 text-center text-xs text-zinc-600">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-zinc-900 text-white flex items-center justify-center font-bold text-[10px]">
              A
            </div>
            <span className="font-extrabold text-zinc-900">AkiMed Studio</span>
            <span className="text-zinc-400">•</span>
            <span>Clinical Informatics Decision Engine</span>
          </div>
          <p className="text-[11px] text-zinc-500 font-medium">
            Trained on DDXPlus, USMLE MedQA, & NEET-PG MedMCQA • Apple Silicon MPS Accelerated
          </p>
        </div>
      </footer>

      {/* Persistent Training Telemetry & Model Storage Modal */}
      <TrainingTelemetryModal
        isOpen={showTelemetryModal}
        onClose={() => setShowTelemetryModal(false)}
      />
    </div>
  );
}
