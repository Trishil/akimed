import React, { useState } from 'react';
import { 
  AkinatorState, 
  AkinatorQA, 
  PatientProfile, 
  AkinatorQuestion 
} from '../types/clinical';
import { formatSoapNote } from '../utils/caseNoteFormatter';
import { 
  Brain, 
  Sparkles, 
  Stethoscope, 
  HelpCircle, 
  CheckCircle2, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  ArrowRight, 
  RotateCcw, 
  Activity, 
  ShieldCheck, 
  AlertCircle,
  Zap,
  Info,
  Target,
  Copy,
  Check
} from 'lucide-react';

interface AkinatorGameProps {
  patient: PatientProfile;
  akinatorState: AkinatorState;
  history: AkinatorQA[];
  onAnswerQuestion: (answer: 'yes' | 'no' | 'unsure' | 'probably_yes' | 'probably_no') => void;
  onRestart: () => void;
  onViewFullTriage: () => void;
  isLoading: boolean;
}

export const AkinatorGame: React.FC<AkinatorGameProps> = ({
  patient,
  akinatorState,
  history,
  onAnswerQuestion,
  onRestart,
  onViewFullTriage,
  isLoading,
}) => {
  const [copiedNote, setCopiedNote] = useState<boolean>(false);

  const handleCopySoap = () => {
    const note = formatSoapNote(patient, akinatorState.assessment, akinatorState);
    navigator.clipboard.writeText(note);
    setCopiedNote(true);
    setTimeout(() => setCopiedNote(false), 2500);
  };
  const currentQuestion = akinatorState.nextQuestion;
  const isConcluded = akinatorState.isConcluded;
  const finalDiagnosis = akinatorState.finalDiagnosis || (akinatorState.differentialRanking && akinatorState.differentialRanking[0]) || akinatorState.assessment?.topDiagnoses?.[0];
  const maxSteps = akinatorState.maxSteps || 20;
  const isDefinitive = akinatorState.isDefinitive ?? (finalDiagnosis?.likelihood ? finalDiagnosis.likelihood >= 85 : false);
  const differentialList = (akinatorState.differentialRanking && akinatorState.differentialRanking.length > 0)
    ? akinatorState.differentialRanking
    : (akinatorState.assessment?.topDiagnoses || (finalDiagnosis ? [finalDiagnosis] : []));

  return (
    <div className="space-y-6">
      {/* Akinator Stage - Warm Editorial Card */}
      <div className="bg-white border-2 border-zinc-900 rounded-3xl p-6 md:p-8 shadow-tactile text-zinc-900 relative overflow-hidden transition-all">
        
        {/* Top Bar: Step & Status */}
        <div className="flex items-center justify-between pb-4 mb-5 border-b-2 border-zinc-900/10">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-zinc-900 text-white flex items-center justify-center shadow-tactile-sm border-2 border-zinc-900">
                <Stethoscope className="w-6 h-6 text-teal-400 font-bold" />
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-zinc-900 tracking-tight">Dr. Akinator</h3>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-teal-100 text-teal-950 border border-teal-400">
                  Discriminator Policy Head
                </span>
              </div>
              <p className="text-xs text-zinc-500 font-medium">
                {isConcluded 
                  ? (isDefinitive ? 'Definitive Diagnostic Threshold Met' : `Differential Spectrum Finalized (${history.length} Turns)`) 
                  : `Inquiry Turn ${history.length + 1} of ${maxSteps}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onRestart}
              className="px-3.5 py-1.5 rounded-full border-2 border-zinc-900 bg-white hover:bg-zinc-100 text-xs font-bold text-zinc-800 flex items-center gap-1.5 transition-all shadow-tactile-sm cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restart Inquiry</span>
            </button>
          </div>
        </div>

        {/* Dr. Akinator Thinking Bubble - Warm Aesthetic */}
        <div className="bg-[#FAF8F5] border-2 border-zinc-900/20 rounded-2xl p-4 mb-6 relative">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-black text-zinc-700 uppercase tracking-wider block mb-1">
                Akinator Entropy Reduction Thought
              </span>
              <p className="text-xs sm:text-sm text-zinc-800 italic leading-relaxed font-serif">
                "{akinatorState.akinatorThought || 'Evaluating presentation and calculating cross-symptom attention weights...'}"
              </p>
            </div>
          </div>
        </div>

        {/* Active Working Hypothesis Banner */}
        {akinatorState.activeHypothesis && (
          <div className={`border-2 border-zinc-900 rounded-2xl p-4 mb-5 shadow-tactile-sm transition-all ${
            akinatorState.activeHypothesis.status === 'refuted'
              ? 'bg-rose-50 border-rose-900'
              : akinatorState.activeHypothesis.status === 'corroborated'
              ? 'bg-emerald-50 border-emerald-900'
              : akinatorState.activeHypothesis.status === 'pursuing'
              ? 'bg-amber-50/70 border-amber-900'
              : 'bg-indigo-50 border-indigo-900'
          }`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-xl border-2 border-zinc-900 shrink-0 ${
                  akinatorState.activeHypothesis.status === 'refuted'
                    ? 'bg-rose-200 text-rose-950'
                    : akinatorState.activeHypothesis.status === 'corroborated'
                    ? 'bg-emerald-200 text-emerald-950'
                    : akinatorState.activeHypothesis.status === 'pursuing'
                    ? 'bg-amber-200 text-amber-950'
                    : 'bg-indigo-200 text-indigo-950'
                }`}>
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-xs font-black uppercase tracking-wider text-zinc-900">
                      {akinatorState.activeHypothesis.status === 'refuted' ? 'Hypothesis Refuted & Pivoted' :
                       akinatorState.activeHypothesis.status === 'corroborated' ? 'Hypothesis Corroborated' :
                       akinatorState.activeHypothesis.status === 'pursuing' ? 'Active Hypothesis Pursuit' : 'Broad Syndromic Exploration'}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-white border-2 border-zinc-900 shadow-tactile-sm">
                      {akinatorState.activeHypothesis.diseaseName} ({akinatorState.activeHypothesis.confidence}%)
                    </span>
                    {akinatorState.activeHypothesis.pivotedFrom && (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-900 border border-rose-300">
                        Pivoted from {akinatorState.activeHypothesis.pivotedFrom}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-700 font-medium leading-relaxed">
                    {akinatorState.activeHypothesis.reason}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* If Game is Still in Progress */}
        {!isConcluded && currentQuestion && (
          <div className="space-y-6">
            {/* Question Card */}
            <div className="bg-white border-2 border-zinc-900 rounded-3xl p-6 sm:p-7 shadow-tactile relative">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-yellow-200/90 text-zinc-950 border-2 border-zinc-900 flex items-center gap-1.5 shadow-tactile-sm">
                  <Zap className="w-3.5 h-3.5 text-zinc-950" />
                  Discriminator: {currentQuestion.category}
                </span>
                <span className="text-xs font-bold text-zinc-500">
                  Question {history.length + 1} / {maxSteps}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-zinc-900 mb-4 leading-snug">
                {currentQuestion.questionText}
              </h2>

              {/* Clinical Rationale Box */}
              {currentQuestion.clinicalRationale && (
                <div className="bg-[#FAF8F5] border-2 border-zinc-900/15 rounded-xl p-3.5 text-xs text-zinc-700 flex items-start gap-2.5 mb-6">
                  <Info className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-zinc-900 block mb-0.5">
                      MBBS Diagnostic Discriminator:
                    </span>
                    {currentQuestion.clinicalRationale}
                  </div>
                </div>
              )}

              {/* Answer Options Buttons - Tactile Akademia Likert Pills */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                <button
                  disabled={isLoading}
                  onClick={() => onAnswerQuestion('yes')}
                  className="py-3 px-3 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-zinc-950 font-black text-xs border-2 border-zinc-900 shadow-tactile-sm shadow-tactile-hover transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer disabled:opacity-50"
                >
                  <span className="text-sm">Yes</span>
                  <span className="text-[10px] font-bold text-emerald-950 opacity-80">Present / Confirmed</span>
                </button>

                <button
                  disabled={isLoading}
                  onClick={() => onAnswerQuestion('probably_yes')}
                  className="py-3 px-3 rounded-2xl bg-emerald-100 hover:bg-emerald-200 text-emerald-950 font-bold text-xs border-2 border-zinc-900 shadow-tactile-sm shadow-tactile-hover transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer disabled:opacity-50"
                >
                  <span className="text-sm">Probably Yes</span>
                  <span className="text-[10px] font-medium text-emerald-900">Likely / Partial</span>
                </button>

                <button
                  disabled={isLoading}
                  onClick={() => onAnswerQuestion('unsure')}
                  className="py-3 px-3 rounded-2xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold text-xs border-2 border-zinc-900 shadow-tactile-sm shadow-tactile-hover transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer disabled:opacity-50"
                >
                  <span className="text-sm">Don't Know</span>
                  <span className="text-[10px] font-medium text-zinc-600">Not assessed</span>
                </button>

                <button
                  disabled={isLoading}
                  onClick={() => onAnswerQuestion('probably_no')}
                  className="py-3 px-3 rounded-2xl bg-rose-100 hover:bg-rose-200 text-rose-950 font-bold text-xs border-2 border-zinc-900 shadow-tactile-sm shadow-tactile-hover transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer disabled:opacity-50"
                >
                  <span className="text-sm">Probably Not</span>
                  <span className="text-[10px] font-medium text-rose-900">Unlikely</span>
                </button>

                <button
                  disabled={isLoading}
                  onClick={() => onAnswerQuestion('no')}
                  className="py-3 px-3 rounded-2xl bg-rose-400 hover:bg-rose-300 text-zinc-950 font-black text-xs border-2 border-zinc-900 shadow-tactile-sm shadow-tactile-hover transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer disabled:opacity-50"
                >
                  <span className="text-sm">No</span>
                  <span className="text-[10px] font-bold text-rose-950 opacity-80">Denied / Absent</span>
                </button>
              </div>
            </div>

            {/* Real-time Bayesian Confidence Distribution */}
            {akinatorState.currentCandidates && akinatorState.currentCandidates.length > 0 && (
              <div className="bg-[#FAF8F5] border-2 border-zinc-900/20 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3.5">
                  <div className="flex items-center gap-2">
                    <Brain className="w-4 h-4 text-teal-600" />
                    <h4 className="text-xs font-black text-zinc-900 uppercase tracking-wider">
                      Live Differential Probability Shift
                    </h4>
                  </div>
                  <span className="text-[11px] font-medium text-zinc-500">
                    Adjusts in real-time with each response
                  </span>
                </div>

                <div className="space-y-3">
                  {akinatorState.currentCandidates.map((c, i) => (
                    <div key={i} className="bg-white border-2 border-zinc-900/15 rounded-xl p-3 shadow-sm">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <div className="flex items-center gap-2 font-bold text-zinc-900">
                          <span className="w-4 text-zinc-400 font-mono text-[11px]">#{i + 1}</span>
                          <span>{c.diseaseName}</span>
                          {c.trend === 'rising' && (
                            <span className="flex items-center text-[10px] text-emerald-700 font-bold bg-emerald-100 px-1.5 py-0.2 rounded-full border border-emerald-300">
                              <TrendingUp className="w-3 h-3 mr-0.5" /> Rising
                            </span>
                          )}
                          {c.trend === 'falling' && (
                            <span className="flex items-center text-[10px] text-rose-700 font-bold bg-rose-100 px-1.5 py-0.2 rounded-full border border-rose-300">
                              <TrendingDown className="w-3 h-3 mr-0.5" /> Falling
                            </span>
                          )}
                        </div>
                        <span className="font-mono font-black text-zinc-900">
                          {c.confidence}%
                        </span>
                      </div>

                      {/* Progress Bar with Tactile Border */}
                      <div className="w-full bg-zinc-100 rounded-full h-2.5 overflow-hidden border border-zinc-900/15">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            i === 0
                              ? 'bg-emerald-400'
                              : 'bg-zinc-400'
                          }`}
                          style={{ width: `${Math.min(100, Math.max(5, c.confidence))}%` }}
                        />
                      </div>

                      {c.reason && (
                        <p className="text-[11px] text-zinc-500 mt-1.5 font-medium italic">
                          Rationale: {c.reason}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Concluded Reveal Screen: Definitive Diagnosis (>=85%) vs Differential Ranking (<85%) */}
        {isConcluded && finalDiagnosis && (
          <div className="space-y-6">
            {isDefinitive ? (
              /* Definitive Primary Diagnosis View (>= 85% Confidence & Turn >= 10) */
              <div className="bg-white border-2 border-zinc-900 rounded-3xl p-6 sm:p-8 shadow-tactile relative">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b-2 border-zinc-900/10">
                  <div>
                    <span className="text-xs font-black uppercase tracking-widest text-emerald-700 flex items-center gap-1.5 mb-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Definitive Primary Diagnosis (≥85% Certainty Met)
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">
                      {finalDiagnosis.diseaseName}
                    </h2>
                    {finalDiagnosis.icd10Code && (
                      <span className="text-xs font-mono font-bold text-zinc-500 mt-1 inline-block">
                        ICD-10: {finalDiagnosis.icd10Code}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-[11px] text-zinc-500 font-bold uppercase tracking-wider block">
                        Diagnostic Confidence
                      </span>
                      <span className="text-3xl sm:text-4xl font-black text-emerald-600 font-mono">
                        {finalDiagnosis.likelihood}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Pathophysiology Box */}
                <div className="mt-6 space-y-4">
                  <div className="bg-[#FAF8F5] border-2 border-zinc-900/20 rounded-2xl p-5">
                    <h4 className="text-xs font-black text-zinc-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Brain className="w-4 h-4 text-teal-600" /> MBBS Pathophysiological Mechanism:
                    </h4>
                    <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed font-medium">
                      {finalDiagnosis.pathophysiology}
                    </p>
                  </div>

                  {/* Supporting Findings */}
                  {finalDiagnosis.supportingFindings && finalDiagnosis.supportingFindings.length > 0 && (
                    <div>
                      <h4 className="text-xs font-black text-zinc-900 uppercase tracking-wider mb-2.5">
                        Key Corroborating Evidence:
                      </h4>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-zinc-800">
                        {finalDiagnosis.supportingFindings.map((finding, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2 bg-zinc-50 border border-zinc-900/15 rounded-xl p-3 font-medium"
                          >
                            <span className="text-emerald-600 font-bold">•</span>
                            <span>{finding}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Bedside Physical Exam Signs to Elicit */}
                  {finalDiagnosis.bedsideSignsToTest && finalDiagnosis.bedsideSignsToTest.length > 0 && (
                    <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-5">
                      <h4 className="text-xs font-black text-amber-950 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Stethoscope className="w-4 h-4 text-amber-600" />
                        Bedside Clinical Maneuvers to Examine:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {finalDiagnosis.bedsideSignsToTest.map((sign, idx) => (
                          <span
                            key={idx}
                            className="bg-white text-zinc-900 border border-amber-300 text-xs px-3 py-1 rounded-full font-bold shadow-sm"
                          >
                            {sign}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Clinical Pearls */}
                  {finalDiagnosis.clinicalPearls && (
                    <div className="bg-teal-50 border-2 border-teal-300 rounded-2xl p-5">
                      <h4 className="text-xs font-black text-teal-950 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-teal-600" />
                        MBBS Ward Round Clinical Pearl:
                      </h4>
                      <p className="text-xs sm:text-sm text-teal-950 italic font-serif leading-relaxed">
                        "{finalDiagnosis.clinicalPearls}"
                      </p>
                    </div>
                  )}
                </div>

                {/* Next Steps CTA */}
                <div className="mt-8 pt-5 border-t-2 border-zinc-900/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                    <button
                      onClick={onViewFullTriage}
                      className="w-full sm:w-auto px-6 py-3 bg-zinc-900 hover:bg-zinc-800 text-white font-black text-xs rounded-full shadow-tactile-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Activity className="w-4 h-4 text-teal-400" />
                      <span>View Emergency Triage & Lab Workup</span>
                    </button>

                    <button
                      onClick={handleCopySoap}
                      className={`w-full sm:w-auto px-5 py-3 rounded-full font-black text-xs border-2 border-zinc-900 shadow-tactile-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        copiedNote ? 'bg-emerald-500 text-white' : 'bg-white hover:bg-zinc-100 text-zinc-900'
                      }`}
                    >
                      {copiedNote ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-white" />
                          <span>Copied SOAP Note!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-zinc-700" />
                          <span>Copy MBBS Note (SOAP)</span>
                        </>
                      )}
                    </button>
                  </div>

                  <button
                    onClick={onRestart}
                    className="w-full sm:w-auto px-5 py-3 bg-white hover:bg-zinc-100 text-zinc-800 font-extrabold text-xs rounded-full border-2 border-zinc-900 shadow-tactile-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Evaluate Another Case</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Differential Diagnosis Ranking & Uncertainty View (Budget Reached with < 85% Confidence) */
              <div className="bg-white border-2 border-zinc-900 rounded-3xl p-6 sm:p-8 shadow-tactile relative">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b-2 border-zinc-900/10">
                  <div className="max-w-2xl">
                    <span className="text-xs font-black uppercase tracking-widest text-amber-700 flex items-center gap-1.5 mb-1.5">
                      <AlertCircle className="w-4 h-4 text-amber-600" /> Differential Diagnosis Ranking & Uncertainty Summary
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">
                      Inquiry Budget Completed (Turn {history.length || maxSteps} of {maxSteps})
                    </h2>
                    <p className="text-xs sm:text-sm text-zinc-600 mt-2 leading-relaxed">
                      Primary condition confidence reached <strong className="text-zinc-900">{finalDiagnosis.likelihood}%</strong>, which is below the definitive certainty threshold (≥85%). In strict adherence to MBBS diagnostic safety standards, we do not declare a premature single diagnosis and present the ranked differential spectrum below.
                    </p>
                  </div>

                  <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 shrink-0 text-right">
                    <span className="text-[10px] text-amber-900 font-black uppercase tracking-wider block">
                      Leading Candidate
                    </span>
                    <span className="text-base sm:text-lg font-black text-zinc-900 block mt-0.5">
                      {finalDiagnosis.diseaseName}
                    </span>
                    <span className="text-xs font-mono font-black text-amber-700 block">
                      {finalDiagnosis.likelihood}% posterior probability
                    </span>
                  </div>
                </div>

                {/* Ranked Candidate Spectrum Cards */}
                <div className="mt-6 space-y-4">
                  <h4 className="text-xs font-black text-zinc-900 uppercase tracking-wider flex items-center gap-2">
                    <Brain className="w-4 h-4 text-teal-600" />
                    Top Candidate Differential Conditions (Ranked by Posterior Likelihood):
                  </h4>

                  <div className="space-y-3">
                    {differentialList.slice(0, 5).map((diag, rank) => (
                      <div 
                        key={rank} 
                        className={`border-2 rounded-2xl p-4 sm:p-5 transition-all ${
                          rank === 0 
                            ? 'bg-[#FAF8F5] border-zinc-900 shadow-tactile-sm' 
                            : 'bg-zinc-50/70 border-zinc-900/15'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
                          <div className="flex items-center gap-2.5">
                            <span className={`text-xs font-black px-2.5 py-1 rounded-full font-mono ${
                              rank === 0 ? 'bg-zinc-900 text-white' : 'bg-zinc-200 text-zinc-800'
                            }`}>
                              #{rank + 1}
                            </span>
                            <h5 className="text-base font-black text-zinc-900">
                              {diag.diseaseName}
                            </h5>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-950 border border-teal-300">
                              {diag.category || (rank === 0 ? 'Leading Differential' : 'Alternative')}
                            </span>
                            {diag.icd10Code && (
                              <span className="text-[11px] font-mono text-zinc-500 font-bold hidden sm:inline">
                                ICD-10: {diag.icd10Code}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-zinc-500">Likelihood:</span>
                            <span className="text-lg font-mono font-black text-zinc-900">
                              {diag.likelihood}%
                            </span>
                          </div>
                        </div>

                        {/* Likelihood Bar */}
                        <div className="w-full bg-zinc-200 rounded-full h-2 mb-3 overflow-hidden border border-zinc-900/10">
                          <div 
                            className={`h-full rounded-full ${rank === 0 ? 'bg-amber-500' : 'bg-teal-500'}`}
                            style={{ width: `${Math.min(100, Math.max(5, diag.likelihood))}%` }}
                          />
                        </div>

                        {/* Pathophysiology summary */}
                        <p className="text-xs text-zinc-700 font-medium mb-3 leading-relaxed">
                          {diag.pathophysiology}
                        </p>

                        {/* Confirmatory workup to discriminate */}
                        {diag.recommendedWorkup?.confirmatoryTests && diag.recommendedWorkup.confirmatoryTests.length > 0 && (
                          <div className="bg-white border border-zinc-900/15 rounded-xl p-3 text-xs">
                            <span className="font-bold text-zinc-900 block mb-1">
                              Discriminatory Confirmatory Workup:
                            </span>
                            <span className="text-zinc-600 font-medium">
                              {diag.recommendedWorkup.confirmatoryTests.join(' • ')}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Bedside Signs for Leading Candidate */}
                  {finalDiagnosis.bedsideSignsToTest && finalDiagnosis.bedsideSignsToTest.length > 0 && (
                    <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-5 mt-4">
                      <h4 className="text-xs font-black text-amber-950 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Stethoscope className="w-4 h-4 text-amber-600" />
                        Bedside Clinical Maneuvers to Discriminate Between Leading Candidates:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {finalDiagnosis.bedsideSignsToTest.map((sign, idx) => (
                          <span
                            key={idx}
                            className="bg-white text-zinc-900 border border-amber-300 text-xs px-3 py-1 rounded-full font-bold shadow-sm"
                          >
                            {sign}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Next Steps CTA */}
                <div className="mt-8 pt-5 border-t-2 border-zinc-900/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                    <button
                      onClick={onViewFullTriage}
                      className="w-full sm:w-auto px-6 py-3 bg-zinc-900 hover:bg-zinc-800 text-white font-black text-xs rounded-full shadow-tactile-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Activity className="w-4 h-4 text-teal-400" />
                      <span>View Emergency Triage & Differential Workup</span>
                    </button>

                    <button
                      onClick={handleCopySoap}
                      className={`w-full sm:w-auto px-5 py-3 rounded-full font-black text-xs border-2 border-zinc-900 shadow-tactile-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        copiedNote ? 'bg-emerald-500 text-white' : 'bg-white hover:bg-zinc-100 text-zinc-900'
                      }`}
                    >
                      {copiedNote ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-white" />
                          <span>Copied Differential Note!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-zinc-700" />
                          <span>Copy MBBS Note (SOAP)</span>
                        </>
                      )}
                    </button>
                  </div>

                  <button
                    onClick={onRestart}
                    className="w-full sm:w-auto px-5 py-3 bg-white hover:bg-zinc-100 text-zinc-800 font-extrabold text-xs rounded-full border-2 border-zinc-900 shadow-tactile-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Evaluate Another Case</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* History of Prior Questions Answered */}
        {history.length > 0 && (
          <div className="mt-6 pt-5 border-t-2 border-zinc-900/10">
            <h4 className="text-xs font-black text-zinc-700 uppercase tracking-wider mb-3">
              Inquiry Elimination Trail ({history.length} answered)
            </h4>
            <div className="space-y-2">
              {history.map((h, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between bg-zinc-50 border border-zinc-900/15 rounded-xl px-4 py-2.5 text-xs"
                >
                  <div className="flex items-center gap-2 text-zinc-800 font-medium">
                    <span className="font-mono text-zinc-400 font-bold">Q{i + 1}.</span>
                    <span>{h.question}</span>
                  </div>
                  <span
                    className={`font-black px-2.5 py-0.5 rounded-full text-[11px] uppercase border ${
                      h.answer === 'yes'
                        ? 'bg-emerald-100 text-emerald-950 border-emerald-400'
                        : h.answer === 'no'
                        ? 'bg-rose-100 text-rose-950 border-rose-400'
                        : 'bg-zinc-200 text-zinc-800 border-zinc-400'
                    }`}
                  >
                    {h.answer.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
