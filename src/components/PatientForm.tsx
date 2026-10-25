import React, { useState, useMemo, useEffect } from 'react';
import { PatientProfile } from '../types/clinical';
import { 
  parseClinicalSearchQuery, 
  applyParsedSearchToPatientProfile,
  ClinicalSearchParseResult,
  ExtractedClinicalConcept
} from '../utils/clinicalSearchParser';
import { 
  User, 
  HeartPulse, 
  Plane, 
  Clock, 
  ShieldAlert, 
  Sparkles, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp,
  Search,
  Activity,
  ArrowRight,
  Stethoscope,
  Info,
  RotateCcw,
  Brain
} from 'lucide-react';

interface PatientFormProps {
  patient: PatientProfile;
  setPatient: React.Dispatch<React.SetStateAction<PatientProfile>>;
  onStartAkinator: (overridePatient?: PatientProfile) => void;
  onGenerateTriage: (overridePatient?: PatientProfile) => void;
  isLoading: boolean;
  activeMode?: 'akinator' | 'triage';
  onSwitchMode?: (mode: 'akinator' | 'triage') => void;
}

export const PatientForm: React.FC<PatientFormProps> = ({
  patient,
  setPatient,
  onStartAkinator,
  onGenerateTriage,
  isLoading,
  activeMode = 'akinator',
  onSwitchMode,
}) => {
  const [showVitalsDrawer, setShowVitalsDrawer] = useState<boolean>(false);

  // Real-time Semantic Clinical Search Parse
  const parseResult: ClinicalSearchParseResult = useMemo(() => {
    return parseClinicalSearchQuery(patient.chiefSymptoms || '');
  }, [patient.chiefSymptoms]);

  // Automatically synchronize parsed demographics, vitals, PMH, and allergies if detected in the search query
  useEffect(() => {
    if (!patient.chiefSymptoms) return;

    setPatient((prev) => {
      const updated = applyParsedSearchToPatientProfile(prev, parseResult, patient.chiefSymptoms);
      // Only trigger state update if actual properties changed to prevent rerender loops
      if (
        (parseResult.parsedDemographics.age && updated.age !== prev.age) ||
        (parseResult.parsedDemographics.gender && updated.gender !== prev.gender) ||
        (parseResult.parsedDemographics.isPregnant !== undefined && updated.isPregnant !== prev.isPregnant) ||
        (parseResult.parsedTravel && updated.travelHistory !== prev.travelHistory) ||
        (parseResult.parsedDuration && updated.symptomDuration !== prev.symptomDuration) ||
        (parseResult.parsedVitals.temperatureC && updated.vitalSigns?.temperatureC !== prev.vitalSigns?.temperatureC) ||
        (parseResult.parsedVitals.heartRate && updated.vitalSigns?.heartRate !== prev.vitalSigns?.heartRate) ||
        (parseResult.parsedVitals.bpSystolic && updated.vitalSigns?.bpSystolic !== prev.vitalSigns?.bpSystolic) ||
        (parseResult.parsedVitals.spo2 && updated.vitalSigns?.spo2 !== prev.vitalSigns?.spo2) ||
        (parseResult.parsedVitals.respiratoryRate && updated.vitalSigns?.respiratoryRate !== prev.vitalSigns?.respiratoryRate) ||
        (JSON.stringify(updated.preExistingConditions) !== JSON.stringify(prev.preExistingConditions)) ||
        (JSON.stringify(updated.allergies) !== JSON.stringify(prev.allergies)) ||
        (JSON.stringify(updated.currentMedications) !== JSON.stringify(prev.currentMedications)) ||
        (updated.additionalNotes !== prev.additionalNotes)
      ) {
        return updated;
      }
      return prev;
    });
  }, [parseResult, patient.chiefSymptoms, setPatient]);

  const handleResetForm = () => {
    setPatient({
      age: 30,
      gender: 'Male',
      chiefSymptoms: '',
      symptomDuration: 'Acute onset',
      preExistingConditions: [],
      currentMedications: [],
      allergies: [],
      travelHistory: '',
      additionalNotes: '',
      vitalSigns: {
        bpSystolic: 120,
        bpDiastolic: 80,
        heartRate: 75,
        respiratoryRate: 16,
        spo2: 98,
        temperatureC: 37.0
      }
    });
  };

  const handleLaunchAkinator = () => {
    const updated = applyParsedSearchToPatientProfile(patient, parseResult, patient.chiefSymptoms);
    setPatient(updated);
    onStartAkinator(updated);
  };

  const handleLaunchTriage = () => {
    const updated = applyParsedSearchToPatientProfile(patient, parseResult, patient.chiefSymptoms);
    setPatient(updated);
    onGenerateTriage(updated);
  };

  return (
    <div className="bg-white border-[2.5px] border-black rounded-3xl p-6 sm:p-8 shadow-[5px_5px_0px_0px_#000000] text-black relative transition-all">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 mb-6 border-b-2 border-black/10 gap-3">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold shadow-[2.5px_2.5px_0px_0px_#000000] border-2 border-black ${
            activeMode === 'akinator' ? 'bg-[#8B5CF6] text-white' : 'bg-[#3B82F6] text-white'
          }`}>
            {activeMode === 'akinator' ? (
              <Brain className="w-6 h-6 text-white stroke-[2.5]" />
            ) : (
              <Activity className="w-6 h-6 text-white stroke-[2.5]" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-black tracking-tight">
                {activeMode === 'akinator'
                  ? 'Dr. Akinator Consultation & Patient Intake'
                  : 'Direct Emergency Triage & Differential Intake'}
              </h2>
              <span className={`text-[11px] font-black px-3 py-0.5 rounded-full border-2 border-black shadow-[2px_2px_0px_0px_#000000] ${
                activeMode === 'akinator'
                  ? 'bg-[#DCFCE7] text-[#064E3B]'
                  : 'bg-[#EDE9FE] text-[#4C1D95]'
              }`}>
                {activeMode === 'akinator' ? '20-Questions Dynamic Engine' : '⚡ MPS GPU Triage'}
              </span>
            </div>
            <p className="text-xs text-zinc-600 font-medium">
              {activeMode === 'akinator'
                ? 'Enter presenting symptoms, vitals, or clinical notes. Dr. Akinator will ask targeted questions to pinpoint the diagnosis.'
                : 'Paste doctor notes, clinical vignettes, or symptoms for instant 5-tier ESI Triage and full MBBS SOAP Differential.'}
            </p>
          </div>
        </div>

        {/* Clean Neobrutalist Reset Action */}
        <div className="flex items-center self-start sm:self-auto">
          <button
            type="button"
            onClick={handleResetForm}
            className="text-[11px] font-black px-3.5 py-1.5 rounded-full bg-[#FEE2E2] hover:bg-[#FECACA] text-[#7F1D1D] border-2 border-black shadow-[2.5px_2.5px_0px_0px_#000000] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_0px_#000000] active:translate-x-[1.5px] active:translate-y-[1.5px] active:shadow-[1px_1px_0px_0px_#000000] transition-all cursor-pointer flex items-center gap-1.5"
            title="Clear all fields and reset encounter"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#7F1D1D] stroke-[2.5]" />
            <span>Reset / New Case</span>
          </button>
        </div>
      </div>

      <div className="space-y-5">
        {/* Minimal Basic Patient Info Bar */}
        <div className="bg-[#FAF8F5] border-2 border-black rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center shadow-[2.5px_2.5px_0px_0px_#000000]">
          <div>
            <label className="block text-[11px] font-black text-black uppercase tracking-wider mb-1">
              Age (Years)
              {parseResult.parsedDemographics.age && (
                <span className="ml-1 text-[10px] text-[#064E3B] font-bold">
                  (auto-detected: {parseResult.parsedDemographics.age}y)
                </span>
              )}
            </label>
            <input
              type="number"
              min="0"
              max="120"
              value={patient.age || ''}
              onChange={(e) => setPatient((p) => ({ ...p, age: parseInt(e.target.value) || 0 }))}
              className="w-full bg-white border-2 border-black focus:shadow-[2.5px_2.5px_0px_0px_#000000] rounded-xl px-3 py-2 text-sm font-black text-black outline-none transition-all"
              placeholder="e.g. 29"
            />
          </div>

          <div>
            <label className="block text-[11px] font-black text-black uppercase tracking-wider mb-1">
              Biological Sex
              {parseResult.parsedDemographics.gender && (
                <span className="ml-1 text-[10px] text-[#064E3B] font-bold">
                  (auto-detected: {parseResult.parsedDemographics.gender})
                </span>
              )}
            </label>
            <select
              value={patient.gender}
              onChange={(e) =>
                setPatient((p) => ({ ...p, gender: e.target.value as 'Male' | 'Female' | 'Other' }))
              }
              className="w-full bg-white border-2 border-black focus:shadow-[2.5px_2.5px_0px_0px_#000000] rounded-xl px-3 py-2 text-sm font-black text-black outline-none transition-all cursor-pointer"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other / Non-Binary</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-black text-black uppercase tracking-wider mb-1">
              Pregnancy Status
            </label>
            <div className="flex items-center h-[40px]">
              <label className="relative flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={patient.isPregnant || false}
                  disabled={patient.gender === 'Male'}
                  onChange={(e) => setPatient((p) => ({ ...p, isPregnant: e.target.checked }))}
                  className="w-4 h-4 accent-black rounded cursor-pointer"
                />
                <span className={`text-xs font-black ${patient.gender === 'Male' ? 'text-zinc-400' : 'text-black'}`}>
                  Currently Pregnant (Gestational Risk)
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Unified Clinical Search / Chat Omnibox */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-zinc-800 uppercase tracking-wider flex items-center gap-1.5">
              <Stethoscope className="w-4 h-4 text-zinc-800" />
              Clinical Case Description & Presentation
            </label>
            <span className="text-[11px] text-zinc-500 font-medium">
              Free-text • Typo-guarded • Medical shortforms enabled
            </span>
          </div>

          <textarea
            rows={4}
            value={patient.chiefSymptoms}
            onChange={(e) => setPatient((p) => ({ ...p, chiefSymptoms: e.target.value }))}
            className="w-full bg-[#FAF8F5] border-2 border-black focus:border-black focus:bg-white rounded-2xl p-4 text-sm font-bold text-black outline-none transition-all placeholder:text-zinc-500 shadow-inner focus:shadow-[3px_3px_0px_0px_#000000]"
            placeholder="Type or paste patient presentation freely. E.g. 'Cyclical spiking fevers every 48 hours, shaking rigors, severe frontal headache, diaphoresis, mild jaundice, dark urine. Returned 12 days ago from Kenya safari. Temp 39.4, HR 118, BP 110/70. NKDA'..."
          />
        </div>

        {/* Live Semantic Breakdown HUD */}
        <div className="p-4 rounded-2xl bg-[#FAF8F5] border-2 border-black space-y-3 shadow-[2.5px_2.5px_0px_0px_#000000]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#064E3B]" />
              <h3 className="text-xs font-black uppercase tracking-wider text-black">
                Live AI Understanding & Entity Extraction
              </h3>
            </div>
            <span className="text-[11px] text-zinc-600 font-bold">
              {parseResult.concepts.length} clinical concept{parseResult.concepts.length === 1 ? '' : 's'} identified
            </span>
          </div>

          {parseResult.concepts.length === 0 ? (
            <p className="text-xs text-zinc-500 italic font-medium">
              Start typing symptoms, vitals, or clinical shortforms above. The AI will extract and structure clinical concepts in real time.
            </p>
          ) : (
            <div className="space-y-2.5">
              {/* Symptoms & Signs Pills - Authentic Neobrutalism Badges */}
              <div className="flex flex-wrap gap-2">
                {parseResult.concepts.map((concept, idx) => {
                  const isVital = concept.category === 'Vital Sign';
                  const isTravel = concept.category === 'Endemic Travel';
                  const isAllergy = concept.category === 'Allergy';
                  const isRisk = concept.category === 'Risk Factor';

                  return (
                    <div
                      key={idx}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border-2 border-black shadow-[1.5px_1.5px_0px_0px_#000000] transition-all ${
                        isTravel
                          ? 'bg-[#DBEAFE] text-[#1E3A8A]'
                          : isVital
                          ? 'bg-[#FEE2E2] text-[#7F1D1D]'
                          : isAllergy
                          ? 'bg-[#EDE9FE] text-[#4C1D95]'
                          : isRisk
                          ? 'bg-[#FEF9C3] text-[#713F12]'
                          : 'bg-[#DCFCE7] text-[#064E3B]'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>{concept.canonicalName}</span>
                      {concept.isShortform && (
                        <span className="text-[10px] px-1.5 py-0.2 bg-white rounded-full font-mono text-black border border-black">
                          {concept.shortformOriginal}
                        </span>
                      )}
                      {concept.isTypoCorrected && concept.correctedFrom && (
                        <span className="text-[10px] px-1.5 py-0.2 bg-white rounded-full font-mono text-black border border-black">
                          fixed: "{concept.correctedFrom}"
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Parsed Travel, Chronology & Vitals Context Strip */}
              {(parseResult.parsedTravel || parseResult.parsedDuration || parseResult.parsedVitals.temperatureC || parseResult.appliedShortforms.length > 0) && (
                <div className="pt-2 border-t-2 border-black/10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                  {parseResult.parsedTravel && (
                    <div className="flex items-center gap-1.5 text-black bg-[#DBEAFE] border-2 border-black px-3 py-1.5 rounded-xl font-bold shadow-[1.5px_1.5px_0px_0px_#000000]">
                      <Plane className="w-3.5 h-3.5 text-black shrink-0" />
                      <span className="truncate">Travel: {parseResult.parsedTravel}</span>
                    </div>
                  )}

                  {parseResult.parsedDuration && (
                    <div className="flex items-center gap-1.5 text-black bg-[#FEF9C3] border-2 border-black px-3 py-1.5 rounded-xl font-bold shadow-[1.5px_1.5px_0px_0px_#000000]">
                      <Clock className="w-3.5 h-3.5 text-black shrink-0" />
                      <span>Duration: {parseResult.parsedDuration}</span>
                    </div>
                  )}

                  {parseResult.appliedShortforms.length > 0 && (
                    <div className="flex items-center gap-1.5 text-black bg-[#DCFCE7] border-2 border-black px-3 py-1.5 rounded-xl font-bold shadow-[1.5px_1.5px_0px_0px_#000000]">
                      <Info className="w-3.5 h-3.5 text-black shrink-0" />
                      <span>
                        Shortforms: {parseResult.appliedShortforms.map(s => `${s.shortform}→${s.expanded}`).join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Collapsible Vitals Drawer (Optional fine-tuning) */}
        <div className="border-2 border-black rounded-2xl overflow-hidden bg-white shadow-[2.5px_2.5px_0px_0px_#000000]">
          <button
            type="button"
            onClick={() => setShowVitalsDrawer(!showVitalsDrawer)}
            className="w-full px-4 py-2.5 flex items-center justify-between text-left cursor-pointer hover:bg-[#FAF8F5] transition-colors"
          >
            <span className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-[#FF4949]" />
              Adjust Objective Vitals (BP, HR, RR, SpO2, Temp)
              {(patient.vitalSigns?.temperatureC || patient.vitalSigns?.heartRate || patient.vitalSigns?.bpSystolic) && (
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#FEE2E2] text-[#7F1D1D] border border-black">
                  RECORDED
                </span>
              )}
            </span>
            {showVitalsDrawer ? <ChevronUp className="w-4 h-4 text-black" /> : <ChevronDown className="w-4 h-4 text-black" />}
          </button>

          {showVitalsDrawer && (
            <div className="p-4 pt-3 grid grid-cols-2 sm:grid-cols-5 gap-3 border-t-2 border-black bg-[#FAF8F5]">
              <div>
                <label className="block text-[10px] font-black text-black uppercase mb-1">Systolic BP (mmHg)</label>
                <input
                  type="number"
                  placeholder="120"
                  value={patient.vitalSigns?.bpSystolic || ''}
                  onChange={(e) =>
                    setPatient((p) => ({
                      ...p,
                      vitalSigns: { ...p.vitalSigns, bpSystolic: parseInt(e.target.value) || undefined },
                    }))
                  }
                  className="w-full bg-white border-2 border-black rounded-lg px-3 py-1.5 text-xs font-bold text-black outline-none focus:shadow-[2px_2px_0px_0px_#000000]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-black uppercase mb-1">Heart Rate (bpm)</label>
                <input
                  type="number"
                  placeholder="75"
                  value={patient.vitalSigns?.heartRate || ''}
                  onChange={(e) =>
                    setPatient((p) => ({
                      ...p,
                      vitalSigns: { ...p.vitalSigns, heartRate: parseInt(e.target.value) || undefined },
                    }))
                  }
                  className="w-full bg-white border-2 border-black rounded-lg px-3 py-1.5 text-xs font-bold text-black outline-none focus:shadow-[2px_2px_0px_0px_#000000]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-black uppercase mb-1">Resp Rate (/min)</label>
                <input
                  type="number"
                  placeholder="16"
                  value={patient.vitalSigns?.respiratoryRate || ''}
                  onChange={(e) =>
                    setPatient((p) => ({
                      ...p,
                      vitalSigns: { ...p.vitalSigns, respiratoryRate: parseInt(e.target.value) || undefined },
                    }))
                  }
                  className="w-full bg-white border-2 border-black rounded-lg px-3 py-1.5 text-xs font-bold text-black outline-none focus:shadow-[2px_2px_0px_0px_#000000]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-black uppercase mb-1">SpO2 (%)</label>
                <input
                  type="number"
                  placeholder="98"
                  value={patient.vitalSigns?.spo2 || ''}
                  onChange={(e) =>
                    setPatient((p) => ({
                      ...p,
                      vitalSigns: { ...p.vitalSigns, spo2: parseInt(e.target.value) || undefined },
                    }))
                  }
                  className="w-full bg-white border-2 border-black rounded-lg px-3 py-1.5 text-xs font-bold text-black outline-none focus:shadow-[2px_2px_0px_0px_#000000]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-black uppercase mb-1">Temp (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="37.0"
                  value={patient.vitalSigns?.temperatureC || ''}
                  onChange={(e) =>
                    setPatient((p) => ({
                      ...p,
                      vitalSigns: { ...p.vitalSigns, temperatureC: parseFloat(e.target.value) || undefined },
                    }))
                  }
                  className="w-full bg-white border-2 border-zinc-900/25 rounded-lg px-3 py-1.5 text-xs font-bold text-zinc-900 outline-none focus:border-zinc-900"
                />
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons - Authentic Neobrutalism UI */}
        <div className="pt-2 flex flex-col gap-3">
          {activeMode === 'akinator' ? (
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                disabled={isLoading || !patient.chiefSymptoms?.trim()}
                onClick={handleLaunchAkinator}
                className="w-full sm:flex-1 py-4 px-6 rounded-2xl bg-[#00F5A0] hover:bg-[#00D689] text-black font-black text-sm border-[2.5px] border-black shadow-[4px_4px_0px_0px_#000000] hover:translate-x-[-1.5px] hover:translate-y-[-1.5px] hover:shadow-[6px_6px_0px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_#000000] transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
              >
                <Brain className="w-5 h-5 text-black stroke-[2.5]" />
                <span>Launch "Dr. Akinator" (20-Questions Dynamic Engine)</span>
              </button>

              <button
                type="button"
                onClick={() => onSwitchMode ? onSwitchMode('triage') : handleLaunchTriage()}
                className="w-full sm:w-auto py-4 px-5 rounded-2xl bg-[#FFC900] hover:bg-[#E5B400] text-black font-black text-xs border-[2.5px] border-black shadow-[4px_4px_0px_0px_#000000] hover:translate-x-[-1.5px] hover:translate-y-[-1.5px] hover:shadow-[6px_6px_0px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_#000000] transition-all flex items-center justify-center gap-2 cursor-pointer"
                title="Switch directly to emergency triage"
              >
                <Activity className="w-4 h-4 text-black stroke-[2.5]" />
                <span>Instant Triage View</span>
                <ArrowRight className="w-3.5 h-3.5 text-black stroke-[2.5]" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                disabled={isLoading || !patient.chiefSymptoms?.trim()}
                onClick={handleLaunchTriage}
                className="w-full sm:flex-1 py-4 px-6 rounded-2xl bg-[#3B82F6] hover:bg-[#2563EB] text-white font-black text-sm border-[2.5px] border-black shadow-[4px_4px_0px_0px_#000000] hover:translate-x-[-1.5px] hover:translate-y-[-1.5px] hover:shadow-[6px_6px_0px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_#000000] transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
              >
                <Activity className="w-5 h-5 text-white stroke-[2.5]" />
                <span>Compute Emergency Triage & Differential (MPS GPU)</span>
                <ArrowRight className="w-4 h-4 text-white stroke-[2.5]" />
              </button>

              <button
                type="button"
                onClick={() => onSwitchMode ? onSwitchMode('akinator') : handleLaunchAkinator()}
                className="w-full sm:w-auto py-4 px-5 rounded-2xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-black text-xs border-[2.5px] border-black shadow-[4px_4px_0px_0px_#000000] hover:translate-x-[-1.5px] hover:translate-y-[-1.5px] hover:shadow-[6px_6px_0px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_#000000] transition-all flex items-center justify-center gap-2 cursor-pointer"
                title="Switch to Dr. Akinator inquiry mode"
              >
                <Brain className="w-4 h-4 text-white stroke-[2.5]" />
                <span>Switch to Dr. Akinator Inquiry</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
