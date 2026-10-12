import React, { useState } from 'react';
import { DiagnosticAssessment, DifferentialItem, PatientProfile } from '../types/clinical';
import { formatSoapNote } from '../utils/caseNoteFormatter';
import { 
  ShieldAlert, 
  Clock, 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp, 
  Stethoscope, 
  FlaskConical, 
  Activity, 
  CheckCircle,
  Pill,
  Sparkles,
  ArrowRight,
  Copy,
  Check
} from 'lucide-react';

interface TriageDifferentialViewProps {
  assessment: DiagnosticAssessment;
  patient?: PatientProfile;
  onPlayAkinator: () => void;
}

export const TriageDifferentialView: React.FC<TriageDifferentialViewProps> = ({
  assessment,
  patient,
  onPlayAkinator,
}) => {
  const [expandedIndex, setExpandedIndex] = useState<number>(0);
  const [copiedNote, setCopiedNote] = useState<boolean>(false);
  const triage = assessment.triage;

  const handleCopySoap = () => {
    const fallbackPatient: PatientProfile = patient || {
      age: 35,
      gender: 'Male',
      chiefSymptoms: assessment.topDiagnoses?.[0]?.supportingFindings?.[0] || 'Presenting complaints',
      symptomDuration: 'Acute',
      preExistingConditions: [],
      currentMedications: [],
      allergies: [],
      travelHistory: 'None reported'
    };
    const note = formatSoapNote(fallbackPatient, assessment);
    navigator.clipboard.writeText(note);
    setCopiedNote(true);
    setTimeout(() => setCopiedNote(false), 2500);
  };

  const getTriageBadgeStyle = (level: number) => {
    switch (level) {
      case 1:
        return 'bg-rose-600 text-white border-zinc-900';
      case 2:
        return 'bg-amber-500 text-zinc-900 border-zinc-900';
      case 3:
        return 'bg-yellow-300 text-zinc-900 border-zinc-900';
      case 4:
        return 'bg-emerald-400 text-zinc-900 border-zinc-900';
      default:
        return 'bg-sky-300 text-zinc-900 border-zinc-900';
    }
  };

  return (
    <div className="space-y-6">
      {/* Triage Level Banner */}
      <div className="bg-white border-2 border-zinc-900 rounded-3xl p-6 md:p-8 shadow-tactile relative overflow-hidden">
        {/* Subtle decorative background watermark */}
        <div className="absolute -right-8 -bottom-8 select-none pointer-events-none opacity-5 text-zinc-900 font-serif font-black text-9xl">
          ESI
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 pb-5 border-b-2 border-zinc-100">
          <div className="flex items-start gap-4">
            <div
              className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center border-2 font-black shadow-tactile-sm shrink-0 ${getTriageBadgeStyle(
                triage.level
              )}`}
            >
              <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">ESI Tier</span>
              <span className="text-3xl leading-none font-serif">{triage.level}</span>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-serif font-black text-zinc-900">
                  {triage.levelName} Priority
                </h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-[#FAF8F5] text-zinc-800 border border-zinc-300">
                  Emergency Triage Category
                </span>
              </div>
              <p className="text-xs text-zinc-600 mt-1.5 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Target Physician Evaluation Time: </span>
                <strong className="text-zinc-900 font-bold bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300 font-mono">
                  {triage.timeToPhysician}
                </strong>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
            <button
              onClick={handleCopySoap}
              className={`px-4 py-2.5 rounded-full font-bold text-xs shadow-tactile-sm hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex items-center gap-1.5 cursor-pointer border-2 border-zinc-900 ${
                copiedNote ? 'bg-emerald-500 text-white' : 'bg-white hover:bg-zinc-100 text-zinc-900'
              }`}
            >
              {copiedNote ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>Copied SOAP / SBAR Note!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-zinc-700" />
                  <span>Copy MBBS Note (SOAP)</span>
                </>
              )}
            </button>

            <button
              onClick={onPlayAkinator}
              className="px-5 py-2.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs shadow-tactile-sm hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex items-center gap-2 cursor-pointer border-2 border-zinc-900"
            >
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span>Challenge Dr. Akinator</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 bg-[#FAF8F5] border-2 border-zinc-900/20 rounded-2xl p-4">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">
              Clinical Triage Rationale
            </span>
            <p className="text-xs md:text-sm text-zinc-800 leading-relaxed font-normal">
              {triage.rationale}
            </p>
          </div>

          {triage.redFlags && triage.redFlags.length > 0 && (
            <div className="bg-rose-50 border-2 border-rose-500 rounded-2xl p-4 shadow-tactile-sm">
              <span className="text-xs font-black text-rose-900 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                Must-Not-Miss Red Flags
              </span>
              <ul className="text-xs text-rose-950 space-y-1.5 font-medium">
                {triage.redFlags.map((flag, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-rose-600 font-bold">•</span>
                    <span>{flag}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Allergy & Medication Safety Warning Shield */}
      {assessment.allergyAndMedicationAlerts && assessment.allergyAndMedicationAlerts.length > 0 && (
        <div className="bg-amber-50 border-2 border-amber-500 rounded-3xl p-5 md:p-6 shadow-tactile-sm">
          <div className="flex items-center gap-2 mb-3">
            <ShieldAlert className="w-5 h-5 text-amber-600" />
            <h3 className="text-sm font-black text-amber-950 uppercase tracking-wider">
              Pharmacotherapy & Allergy Safety Alerts ({assessment.allergyAndMedicationAlerts.length})
            </h3>
          </div>
          <div className="space-y-2.5">
            {assessment.allergyAndMedicationAlerts.map((alert, idx) => (
              <div
                key={idx}
                className="bg-white border-2 border-amber-300 rounded-2xl p-3.5 text-xs flex items-start gap-3 shadow-tactile-sm"
              >
                <div className="w-7 h-7 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center shrink-0">
                  <Pill className="w-4 h-4 text-amber-700" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-zinc-900 text-sm">{alert.substance}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border ${
                        alert.severity === 'Critical'
                          ? 'bg-rose-100 text-rose-700 border-rose-300'
                          : 'bg-amber-100 text-amber-800 border-amber-300'
                      }`}
                    >
                      {alert.warningType}
                    </span>
                  </div>
                  <p className="text-zinc-700 leading-relaxed">{alert.details}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ranked Differential Diagnoses */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-zinc-900 uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-zinc-900" />
            Ranked Differential Diagnoses ({assessment.topDiagnoses?.length || 0})
          </h3>
          <span className="text-xs text-zinc-500 font-medium">Click a card to inspect workup & signs</span>
        </div>

        <div className="space-y-3.5">
          {assessment.topDiagnoses?.map((item: DifferentialItem, index: number) => {
            const isExpanded = expandedIndex === index;
            return (
              <div
                key={index}
                className={`bg-white border-2 border-zinc-900 rounded-3xl overflow-hidden transition-all shadow-tactile ${
                  isExpanded ? 'ring-2 ring-zinc-900' : 'hover:-translate-y-0.5'
                }`}
              >
                {/* Header Row */}
                <div
                  onClick={() => setExpandedIndex(isExpanded ? -1 : index)}
                  className="p-4 md:p-5 flex items-center justify-between cursor-pointer hover:bg-[#FAF8F5] transition-colors"
                >
                  <div className="flex items-center gap-3.5">
                    <span className="w-7 h-7 rounded-xl bg-zinc-900 text-white text-xs font-black flex items-center justify-center font-mono shadow-tactile-sm">
                      {index + 1}
                    </span>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-base md:text-lg font-serif font-black text-zinc-900">{item.diseaseName}</h4>
                        {item.icd10Code && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 border border-zinc-300 font-bold">
                            {item.icd10Code}
                          </span>
                        )}
                        <span
                          className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase border-2 border-zinc-900 shadow-tactile-sm ${
                            item.category === 'Primary'
                              ? 'bg-yellow-300 text-zinc-900'
                              : 'bg-zinc-100 text-zinc-700'
                          }`}
                        >
                          {item.category}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-600 line-clamp-1 mt-1 font-normal">
                        {item.supportingFindings?.[0] || 'Clinical feature match'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-xl md:text-2xl font-serif font-black text-zinc-900">
                        {item.likelihood}%
                      </span>
                      <span className="block text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Likelihood</span>
                    </div>
                    <div className="w-8 h-8 rounded-full border border-zinc-300 flex items-center justify-center text-zinc-600">
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-zinc-900" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-zinc-900" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-5 md:p-6 border-t-2 border-zinc-900/10 bg-[#FAF8F5] space-y-4 text-xs">
                    {/* Pathophysiology */}
                    <div className="bg-white border-2 border-zinc-900/20 rounded-2xl p-4 shadow-tactile-sm">
                      <span className="font-bold text-zinc-900 uppercase tracking-wider block mb-1.5 text-[11px]">
                        MBBS Pathophysiological Mechanism:
                      </span>
                      <p className="text-zinc-800 leading-relaxed font-normal">{item.pathophysiology}</p>
                    </div>

                    {/* Supporting & Opposing Findings Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      <div className="bg-emerald-50 border-2 border-emerald-600/30 rounded-2xl p-4 shadow-tactile-sm">
                        <span className="font-black text-emerald-950 uppercase tracking-wider block mb-2 text-[11px]">
                          Supporting Clinical Features:
                        </span>
                        <ul className="space-y-1.5 text-emerald-950 font-medium">
                          {item.supportingFindings?.map((f, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-emerald-600 font-bold">•</span>
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-rose-50 border-2 border-rose-500/30 rounded-2xl p-4 shadow-tactile-sm">
                        <span className="font-black text-rose-950 uppercase tracking-wider block mb-2 text-[11px]">
                          Opposing / Atypical Features:
                        </span>
                        <ul className="space-y-1.5 text-rose-950 font-medium">
                          {item.opposingFindings && item.opposingFindings.length > 0 ? (
                            item.opposingFindings.map((f, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="text-rose-600 font-bold">•</span>
                                <span>{f}</span>
                              </li>
                            ))
                          ) : (
                            <li className="text-zinc-500 italic">No strong contradicting features noted.</li>
                          )}
                        </ul>
                      </div>
                    </div>

                    {/* Bedside Signs to Test */}
                    {item.bedsideSignsToTest && item.bedsideSignsToTest.length > 0 && (
                      <div className="bg-amber-50 border-2 border-amber-500/30 rounded-2xl p-4 shadow-tactile-sm">
                        <span className="font-black text-amber-950 uppercase tracking-wider flex items-center gap-1.5 mb-2 text-[11px]">
                          <Stethoscope className="w-4 h-4 text-amber-700" />
                          Bedside Physical Exam Signs to Elicit:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {item.bedsideSignsToTest.map((sign, i) => (
                            <span
                              key={i}
                              className="bg-white border-2 border-amber-300 text-amber-950 px-2.5 py-1 rounded-full text-[11px] font-bold shadow-tactile-sm"
                            >
                              {sign}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recommended Workup */}
                    {item.recommendedWorkup && (
                      <div className="bg-white border-2 border-zinc-900/20 rounded-2xl p-4 space-y-2.5 shadow-tactile-sm">
                        <span className="font-black text-zinc-900 uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
                          <FlaskConical className="w-4 h-4 text-sky-600" />
                          Recommended Diagnostic Workup:
                        </span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-zinc-800">
                          <div className="bg-[#FAF8F5] p-3 rounded-xl border border-zinc-200">
                            <strong className="text-zinc-900 font-bold block mb-1 text-xs">Initial Urgent Labs:</strong>
                            <ul className="list-disc list-inside space-y-1 text-[11px] text-zinc-700">
                              {item.recommendedWorkup.initialLabs?.map((lab, i) => (
                                <li key={i}>{lab}</li>
                              ))}
                            </ul>
                          </div>
                          <div className="bg-[#FAF8F5] p-3 rounded-xl border border-zinc-200">
                            <strong className="text-zinc-900 font-bold block mb-1 text-xs">Confirmatory / Imaging:</strong>
                            <ul className="list-disc list-inside space-y-1 text-[11px] text-zinc-700">
                              {item.recommendedWorkup.confirmatoryTests?.map((test, i) => (
                                <li key={i}>{test}</li>
                              ))}
                              {item.recommendedWorkup.imaging?.map((img, i) => (
                                <li key={`img-${i}`}>{img}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Clinical Pearl */}
                    {item.clinicalPearls && (
                      <div className="p-3.5 rounded-2xl bg-yellow-100 border-2 border-zinc-900 text-zinc-900 shadow-tactile-sm">
                        <strong className="font-black">Clinical Pearl: </strong>
                        <span className="font-normal">{item.clinicalPearls}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Immediate Action Plan */}
      {assessment.immediateActionPlan && assessment.immediateActionPlan.length > 0 && (
        <div className="bg-white border-2 border-zinc-900 rounded-3xl p-6 shadow-tactile">
          <h3 className="text-xs font-black text-zinc-900 uppercase tracking-wider flex items-center gap-2 mb-3">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            Immediate Clinical Management Steps (MBBS Protocol)
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-xs md:text-sm text-zinc-800">
            {assessment.immediateActionPlan.map((action, idx) => (
              <li key={idx} className="leading-relaxed font-normal">
                {action}
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* MBBS Documentation Export Section */}
      <div className="bg-[#FAF8F5] border-2 border-zinc-900 rounded-3xl p-6 shadow-tactile flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-black text-zinc-900 uppercase tracking-wider flex items-center gap-2">
            <Copy className="w-4 h-4 text-teal-600" />
            Standardized Clinical Case Export (SOAP / SBAR)
          </h3>
          <p className="text-xs text-zinc-600 mt-1">
            Generate an accredited MBBS ward round case summary with vitals, red flags, differential rationale, and management steps.
          </p>
        </div>

        <button
          onClick={handleCopySoap}
          className={`px-5 py-3 rounded-full font-black text-xs shadow-tactile-sm hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex items-center gap-2 shrink-0 border-2 border-zinc-900 cursor-pointer ${
            copiedNote ? 'bg-emerald-500 text-white' : 'bg-zinc-900 hover:bg-zinc-800 text-white'
          }`}
        >
          {copiedNote ? (
            <>
              <Check className="w-4 h-4 text-white" />
              <span>Copied to Clipboard!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-teal-300" />
              <span>Copy Formatted MBBS Case Note</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
