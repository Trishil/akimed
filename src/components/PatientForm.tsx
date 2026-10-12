import React, { useState, useMemo } from 'react';
import { PatientProfile } from '../types/clinical';
import { extractClinicalConceptsFuzzy, RecognizedClinicalConcept } from '../utils/clinicalFuzzyMatcher';
import { 
  User, 
  HeartPulse, 
  AlertTriangle, 
  Plane, 
  Pill, 
  Thermometer, 
  ShieldAlert, 
  Plus, 
  X, 
  ChevronDown, 
  ChevronUp,
  Sparkles,
  CheckCircle2,
  Wand2,
  HelpCircle
} from 'lucide-react';

interface PatientFormProps {
  patient: PatientProfile;
  setPatient: React.Dispatch<React.SetStateAction<PatientProfile>>;
  onStartAkinator: () => void;
  onGenerateTriage: () => void;
  isLoading: boolean;
}

const COMMON_CONDITIONS = [
  'Hypertension',
  'Type 2 Diabetes',
  'Asthma',
  'COPD',
  'G6PD Deficiency',
  'Chronic Kidney Disease',
  'Coronary Artery Disease',
  'Oral Contraceptive Use',
  'Immunosuppressed / Steroids',
];

const COMMON_MEDS = [
  'Metformin',
  'Lisinopril',
  'Amlodipine',
  'Aspirin',
  'Warfarin',
  'Combined OCP (Estrogen/Progestin)',
  'Salbutamol Inhaler',
  'Atorvastatin',
  'Insulin',
];

const COMMON_ALLERGIES = [
  'Penicillin / Amoxicillin',
  'Sulfa Antibiotics',
  'Aspirin / NSAIDs',
  'Cephalosporins',
  'Latex',
  'No Known Drug Allergies (NKDA)',
];

export const PatientForm: React.FC<PatientFormProps> = ({
  patient,
  setPatient,
  onStartAkinator,
  onGenerateTriage,
  isLoading,
}) => {
  const [showVitals, setShowVitals] = useState<boolean>(true);
  const [customCondition, setCustomCondition] = useState('');
  const [customMed, setCustomMed] = useState('');
  const [customAllergy, setCustomAllergy] = useState('');

  // Real-time Fuzzy NLP Typo & Concept Detection
  const recognizedConcepts: RecognizedClinicalConcept[] = useMemo(() => {
    return extractClinicalConceptsFuzzy(patient.chiefSymptoms || '');
  }, [patient.chiefSymptoms]);

  const toggleArrayItem = (field: 'preExistingConditions' | 'currentMedications' | 'allergies', item: string) => {
    setPatient((prev) => {
      const current = prev[field] || [];
      if (current.includes(item)) {
        return { ...prev, [field]: current.filter((x) => x !== item) };
      } else {
        return { ...prev, [field]: [...current, item] };
      }
    });
  };

  const addCustomItem = (field: 'preExistingConditions' | 'currentMedications' | 'allergies', val: string, clearFn: () => void) => {
    if (!val.trim()) return;
    setPatient((prev) => ({
      ...prev,
      [field]: [...(prev[field] || []), val.trim()],
    }));
    clearFn();
  };

  const removeArrayItem = (field: 'preExistingConditions' | 'currentMedications' | 'allergies', index: number) => {
    setPatient((prev) => ({
      ...prev,
      [field]: (prev[field] || []).filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="bg-white border-2 border-zinc-900 rounded-3xl p-6 sm:p-8 shadow-tactile text-zinc-900 relative overflow-hidden transition-all">
      {/* Decorative Hand-drawn Doodles (Akademia Style) */}
      <div className="absolute top-4 right-5 text-zinc-300 pointer-events-none select-none hidden sm:block">
        <svg width="64" height="40" viewBox="0 0 64 40" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M4 12C12 4 24 6 28 16C32 26 44 28 58 18" />
          <path d="M12 28C20 22 30 24 34 32" />
        </svg>
      </div>

      {/* Form Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 mb-6 border-b-2 border-zinc-900/10 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-zinc-900 text-white flex items-center justify-center font-bold shadow-tactile-sm">
            <User className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-zinc-900 tracking-tight">
                Patient Clinical Profile
              </h2>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-yellow-200/80 text-zinc-900 border border-zinc-900">
                Fuzzy Typo Tolerant
              </span>
            </div>
            <p className="text-xs text-zinc-500 font-medium">
              Enter symptoms naturally — typos, abbreviations, and informal complaints are automatically parsed
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Row 1: Demographics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-zinc-800 uppercase tracking-wider mb-1.5">
              Age (Years) <span className="text-emerald-600">*</span>
            </label>
            <input
              type="number"
              min="0"
              max="120"
              value={patient.age || ''}
              onChange={(e) => setPatient((p) => ({ ...p, age: parseInt(e.target.value) || 0 }))}
              className="w-full bg-[#FAF8F5] border-2 border-zinc-900/25 focus:border-zinc-900 focus:bg-white rounded-xl px-4 py-2.5 text-sm font-semibold text-zinc-900 outline-none transition-all"
              placeholder="e.g. 29"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-800 uppercase tracking-wider mb-1.5">
              Biological Sex <span className="text-emerald-600">*</span>
            </label>
            <select
              value={patient.gender}
              onChange={(e) =>
                setPatient((p) => ({ ...p, gender: e.target.value as 'Male' | 'Female' | 'Other' }))
              }
              className="w-full bg-[#FAF8F5] border-2 border-zinc-900/25 focus:border-zinc-900 focus:bg-white rounded-xl px-4 py-2.5 text-sm font-semibold text-zinc-900 outline-none transition-all"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other / Non-Binary</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-800 uppercase tracking-wider mb-1.5">
              Pregnancy Status
            </label>
            <div className="flex items-center h-[44px]">
              <label className="relative flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={patient.isPregnant || false}
                  disabled={patient.gender === 'Male'}
                  onChange={(e) => setPatient((p) => ({ ...p, isPregnant: e.target.checked }))}
                  className="w-5 h-5 accent-zinc-900 rounded cursor-pointer"
                />
                <span className={`text-xs font-bold ${patient.gender === 'Male' ? 'text-zinc-400' : 'text-zinc-800'}`}>
                  Currently Pregnant (Gestational Risk)
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Row 2: Chief Symptoms & Clinical Presentation with Live Fuzzy Typo Bar */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-zinc-800 uppercase tracking-wider">
              Chief Symptoms & Clinical Presentation <span className="text-emerald-600">*</span>
            </label>
            <span className="text-[11px] text-zinc-500 font-medium">
              Levenshtein & Phonetic Parser Active
            </span>
          </div>
          
          <textarea
            rows={3}
            value={patient.chiefSymptoms}
            onChange={(e) => setPatient((p) => ({ ...p, chiefSymptoms: e.target.value }))}
            className="w-full bg-[#FAF8F5] border-2 border-zinc-900/25 focus:border-zinc-900 focus:bg-white rounded-2xl p-4 text-sm font-medium text-zinc-900 outline-none transition-all placeholder:text-zinc-400"
            placeholder="Type symptoms freely, e.g. 'substurnal cheast pane radiatin to left arm with shorness of breth and diaforetic feeling'..."
          />

          {/* LIVE AI UNDERSTANDING & TYPO RESOLUTION CHIP BAR */}
          <div className="mt-2.5 p-3 rounded-2xl bg-zinc-50 border-2 border-zinc-900/15">
            <div className="flex items-center gap-2 mb-2">
              <Wand2 className="w-3.5 h-3.5 text-teal-600" />
              <span className="text-xs font-black uppercase tracking-wider text-zinc-800">
                Live AI Understanding & Typo Correction
              </span>
              <span className="text-[10px] text-zinc-500 font-medium ml-auto">
                {recognizedConcepts.length} symptom{recognizedConcepts.length === 1 ? '' : 's'} extracted
              </span>
            </div>

            {recognizedConcepts.length === 0 ? (
              <p className="text-xs text-zinc-500 italic">
                Start typing above. The AI will continuously detect clinical concepts, resolve typos, and highlight recognized findings here in real-time.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {recognizedConcepts.map((item, idx) => (
                  <div
                    key={idx}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border-2 transition-all ${
                      item.isTypoCorrected
                        ? 'bg-amber-100 text-amber-950 border-amber-400 shadow-sm'
                        : 'bg-emerald-100 text-emerald-950 border-emerald-400 shadow-sm'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-zinc-800 shrink-0" />
                    <span>{item.canonicalName}</span>
                    {item.isTypoCorrected && (
                      <span className="text-[10px] px-1.5 py-0.2 bg-white/80 rounded-full font-mono text-zinc-800 border border-amber-300">
                        corrected from "{item.matchedWord}"
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Row 3: Duration & Travel History */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-zinc-800 uppercase tracking-wider mb-1.5">
              Symptom Duration / Chronology
            </label>
            <input
              type="text"
              value={patient.symptomDuration}
              onChange={(e) => setPatient((p) => ({ ...p, symptomDuration: e.target.value }))}
              className="w-full bg-[#FAF8F5] border-2 border-zinc-900/25 focus:border-zinc-900 focus:bg-white rounded-xl px-4 py-2.5 text-sm font-semibold text-zinc-900 outline-none transition-all"
              placeholder="e.g. Sudden onset 2 hours ago, or 4 days"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Plane className="w-3.5 h-3.5 text-cyan-600" />
              Recent Travel History (Key for Endemic Disease)
            </label>
            <input
              type="text"
              value={patient.travelHistory}
              onChange={(e) => setPatient((p) => ({ ...p, travelHistory: e.target.value }))}
              className="w-full bg-[#FAF8F5] border-2 border-zinc-900/25 focus:border-zinc-900 focus:bg-white rounded-xl px-4 py-2.5 text-sm font-semibold text-zinc-900 outline-none transition-all"
              placeholder="e.g. Returned from Kenya safari 10 days ago (Malaria risk)"
            />
          </div>
        </div>

        {/* Row 4: Past Medical History Pill Toggles */}
        <div>
          <label className="block text-xs font-bold text-zinc-800 uppercase tracking-wider mb-2">
            Pre-Existing Conditions & Risk Factors
          </label>
          <div className="flex flex-wrap gap-2 mb-2.5">
            {COMMON_CONDITIONS.map((cond) => {
              const active = patient.preExistingConditions.includes(cond);
              return (
                <button
                  type="button"
                  key={cond}
                  onClick={() => toggleArrayItem('preExistingConditions', cond)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold border-2 transition-all cursor-pointer ${
                    active
                      ? 'bg-zinc-900 text-white border-zinc-900 shadow-tactile-sm'
                      : 'bg-white text-zinc-700 border-zinc-900/20 hover:border-zinc-900 hover:bg-zinc-50'
                  }`}
                >
                  {cond} {active && '✓'}
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 5: Allergies & Medications */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-zinc-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Pill className="w-3.5 h-3.5 text-emerald-600" />
              Current Medications
            </label>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_MEDS.slice(0, 6).map((med) => {
                const active = patient.currentMedications.includes(med);
                return (
                  <button
                    type="button"
                    key={med}
                    onClick={() => toggleArrayItem('currentMedications', med)}
                    className={`px-3 py-1 rounded-full text-xs font-bold border-2 transition-all cursor-pointer ${
                      active
                        ? 'bg-zinc-900 text-white border-zinc-900 shadow-tactile-sm'
                        : 'bg-white text-zinc-700 border-zinc-900/20 hover:border-zinc-900'
                    }`}
                  >
                    {med} {active && '✓'}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
              Known Drug Allergies (Safety Alert)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_ALLERGIES.slice(0, 4).map((alg) => {
                const active = patient.allergies.includes(alg);
                return (
                  <button
                    type="button"
                    key={alg}
                    onClick={() => toggleArrayItem('allergies', alg)}
                    className={`px-3 py-1 rounded-full text-xs font-bold border-2 transition-all cursor-pointer ${
                      active
                        ? 'bg-rose-500 text-white border-zinc-900 shadow-tactile-sm'
                        : 'bg-white text-zinc-700 border-zinc-900/20 hover:border-zinc-900'
                    }`}
                  >
                    {alg} {active && '✓'}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Row 6: Collapsible Objective Vitals Bar */}
        <div className="border-2 border-zinc-900/15 rounded-2xl overflow-hidden bg-zinc-50/70">
          <button
            type="button"
            onClick={() => setShowVitals(!showVitals)}
            className="w-full px-4 py-3 flex items-center justify-between text-left cursor-pointer hover:bg-zinc-100 transition-colors"
          >
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-800 flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-rose-500" />
              Objective Vital Signs (Acuteness & ESI Triage)
            </span>
            {showVitals ? <ChevronUp className="w-4 h-4 text-zinc-600" /> : <ChevronDown className="w-4 h-4 text-zinc-600" />}
          </button>

          {showVitals && (
            <div className="p-4 pt-0 grid grid-cols-2 sm:grid-cols-5 gap-3 border-t border-zinc-900/10">
              <div>
                <label className="block text-[11px] font-bold text-zinc-600 mb-1">Systolic BP (mmHg)</label>
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
                  className="w-full bg-white border-2 border-zinc-900/25 rounded-lg px-3 py-1.5 text-xs font-bold text-zinc-900 outline-none focus:border-zinc-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-600 mb-1">Heart Rate (bpm)</label>
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
                  className="w-full bg-white border-2 border-zinc-900/25 rounded-lg px-3 py-1.5 text-xs font-bold text-zinc-900 outline-none focus:border-zinc-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-600 mb-1">Resp Rate (/min)</label>
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
                  className="w-full bg-white border-2 border-zinc-900/25 rounded-lg px-3 py-1.5 text-xs font-bold text-zinc-900 outline-none focus:border-zinc-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-600 mb-1">SpO2 (%)</label>
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
                  className="w-full bg-white border-2 border-zinc-900/25 rounded-lg px-3 py-1.5 text-xs font-bold text-zinc-900 outline-none focus:border-zinc-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-600 mb-1">Temp (°C)</label>
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

        {/* Action Buttons - Tactile Akademia Pill Design */}
        <div className="pt-2 flex flex-col sm:flex-row gap-3.5">
          <button
            type="button"
            disabled={isLoading || !patient.chiefSymptoms.trim()}
            onClick={onStartAkinator}
            className="flex-1 py-3.5 px-6 rounded-full bg-emerald-400 hover:bg-emerald-300 text-zinc-950 font-black text-sm border-2 border-zinc-900 shadow-tactile shadow-tactile-hover flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-zinc-950" />
            <span>Launch "Dr. Akinator" (20-Questions Engine)</span>
          </button>

          <button
            type="button"
            disabled={isLoading || !patient.chiefSymptoms.trim()}
            onClick={onGenerateTriage}
            className="py-3.5 px-6 rounded-full bg-white hover:bg-zinc-100 text-zinc-900 font-extrabold text-sm border-2 border-zinc-900 shadow-tactile shadow-tactile-hover flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <HeartPulse className="w-4 h-4 text-rose-500" />
            <span>Direct Triage & Differential</span>
          </button>
        </div>
      </div>
    </div>
  );
};
