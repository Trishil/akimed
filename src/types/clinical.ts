export interface PatientProfile {
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  isPregnant?: boolean;
  chiefSymptoms: string; // e.g. "high fever with chills, severe retro-orbital headache, joint pain"
  symptomDuration: string; // e.g. "3 days", "sudden onset 2 hours ago"
  preExistingConditions: string[]; // e.g. ["Type 2 Diabetes Mellitus", "Hypertension", "Asthma"]
  currentMedications: string[]; // e.g. ["Metformin 500mg", "Lisinopril 10mg"]
  allergies: string[]; // e.g. ["Penicillin", "Sulfa drugs"]
  travelHistory: string; // e.g. "Returned from Kenya safari 10 days ago"
  vitalSigns?: {
    bpSystolic?: number;
    bpDiastolic?: number;
    heartRate?: number;
    respiratoryRate?: number;
    spo2?: number;
    temperatureC?: number;
  };
  additionalNotes?: string;
}

export type TriageLevel = 1 | 2 | 3 | 4 | 5;

export interface TriageEvaluation {
  level: TriageLevel;
  levelName: 'Resuscitation' | 'Emergent' | 'Urgent' | 'Semi-Urgent' | 'Non-Urgent';
  color: string; // hex or tailwind class
  timeToPhysician: string; // e.g. "Immediate", "< 15 minutes", "< 60 minutes"
  rationale: string;
  redFlags: string[];
}

export interface DiseaseProfile {
  id: string;
  name: string;
  icd10: string;
  category: 'Primary' | 'Secondary' | 'Alternative';
  system: 'infectious' | 'cardiac' | 'pulmonary' | 'gi' | 'neuro' | 'renal' | 'systemic' | 'endocrine' | 'rheum' | 'obgyn' | 'derm' | 'hemonc' | 'other';
  basePrior: number;
  keywords: string[];
  pathophysiology: string;
  supportingFindings: string[];
  opposingFindings: string[];
  bedsideSignsToTest: string[];
  recommendedWorkup: {
    initialLabs: string[];
    confirmatoryTests: string[];
    imaging?: string[];
  };
  clinicalPearls: string;
}

export interface DiseaseLikelihoodMap {
  [diseaseId: string]: {
    lrPos: number;
    lrNeg: number;
  };
}

export interface QuestionDefinition {
  id: string;
  text: string;
  category: 'History' | 'Physical Exam' | 'Symptom Character' | 'Red Flag' | 'Epidemiology';
  rationale: string;
  diseaseLikelihoods: DiseaseLikelihoodMap;
  triggerKeywords?: string[];
}

export interface DifferentialItem {
  diseaseName: string;
  icd10Code?: string;
  likelihood: number; // 0 to 100 percentage
  category: 'Primary' | 'Secondary' | 'Alternative' | 'Zebra/Rare';
  pathophysiology: string;
  supportingFindings: string[];
  opposingFindings: string[];
  bedsideSignsToTest: string[]; // e.g. "Check Kernig & Brudzinski signs", "Murphy's sign"
  recommendedWorkup: {
    initialLabs: string[];
    confirmatoryTests: string[];
    imaging?: string[];
  };
  clinicalPearls: string; // high-yield MBBS takeaway
}

export interface AllergyWarning {
  substance: string;
  warningType: 'Contraindication' | 'Drug-Interaction' | 'Precaution';
  severity: 'Critical' | 'Moderate' | 'Advisory';
  details: string;
}

export interface EngineTelemetry {
  activeEngine: string;
  device: string;
  parametersCount?: number;
  latencyMs?: number;
  hardwareAccelerator?: string;
  modelScale?: string;
}

export interface DiagnosticAssessment {
  triage: TriageEvaluation;
  topDiagnoses: DifferentialItem[];
  allergyAndMedicationAlerts: AllergyWarning[];
  immediateActionPlan: string[];
  differentialSummary: string;
  engineTelemetry?: EngineTelemetry;
}

export interface AkinatorQuestion {
  questionId: string;
  questionText: string;
  category: 'History' | 'Physical Exam' | 'Symptom Character' | 'Red Flag' | 'Epidemiology';
  clinicalRationale: string; // why this question is high yield
  possibleAnswers: Array<{
    label: string;
    value: 'yes' | 'no' | 'unsure' | 'probably_yes' | 'probably_no';
  }>;
}

export interface AkinatorQA {
  questionId?: string;
  question: string;
  answer: 'yes' | 'no' | 'unsure' | 'probably_yes' | 'probably_no';
  clinicalRationale?: string;
  timestamp?: number;
}

export interface ActiveHypothesisInfo {
  diseaseName: string;
  status: 'exploring' | 'pursuing' | 'corroborated' | 'refuted';
  confidence: number;
  reason: string;
  pivotedFrom?: string | null;
}

export interface AkinatorState {
  step: number;
  maxSteps: number;
  currentCandidates: Array<{
    diseaseName: string;
    confidence: number;
    trend: 'rising' | 'falling' | 'stable';
    reason: string;
  }>;
  activeHypothesis?: ActiveHypothesisInfo;
  nextQuestion?: AkinatorQuestion;
  isConcluded: boolean;
  isDefinitive?: boolean;
  finalDiagnosis?: DifferentialItem;
  differentialRanking?: DifferentialItem[];
  assessment?: DiagnosticAssessment;
  akinatorThought: string;
}

export interface PrebuiltVignette {
  id: string;
  title: string;
  specialty: string;
  difficulty: 'MBBS 1st/2nd Year' | 'Clinical Clerkship' | 'Final Year / USMLE Step 2';
  tagline: string;
  patient: PatientProfile;
  expectedDiagnosis: string;
}
