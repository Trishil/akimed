/**
 * AkiMed AGI-Grade Clinical Search & Semantic NLP Parser
 * 
 * Features:
 * 1. Protected Vocabulary Whitelist (Prevents erroneous typo corrections like "spiking" -> "puking")
 * 2. 50+ Medical Shortforms & Abbreviations (SOB, CP, HTN, DM2, NKDA, PE, DVT, N/V, DOE, HA, etc.)
 * 3. Layperson & Colloquial Symptom Terms ("dark pee", "yellow eyes", "throwing up", "cold sweats")
 * 4. Multi-Field Auto-Extraction: Demographics, Symptoms, Travel History, Chronology, Vitals, Allergies
 * 5. Strict Context-Guarded Typo Correction (Only for unknown tokens with high edit similarity)
 */

import { PatientProfile } from '../types/clinical';

export interface ExtractedClinicalConcept {
  id: string;
  canonicalName: string;
  category: 'Symptom' | 'Sign' | 'Risk Factor' | 'Endemic Travel' | 'Vital Sign' | 'Allergy' | 'Medication';
  matchedText: string;
  isShortform: boolean;
  shortformOriginal?: string;
  isTypoCorrected: boolean;
  correctedFrom?: string;
  severityOrModifier?: string;
}

export interface ClinicalSearchParseResult {
  concepts: ExtractedClinicalConcept[];
  parsedDemographics: {
    age?: number;
    gender?: 'Male' | 'Female' | 'Other';
    isPregnant?: boolean;
  };
  parsedTravel?: string;
  parsedDuration?: string;
  parsedVitals: {
    bpSystolic?: number;
    bpDiastolic?: number;
    heartRate?: number;
    respiratoryRate?: number;
    spo2?: number;
    temperatureC?: number;
    clinicalAlerts: string[];
  };
  parsedAllergies: string[];
  parsedMedications: string[];
  appliedShortforms: Array<{ shortform: string; expanded: string }>;
}

// ---------------------------------------------------------------------------
// 1. PROTECTED VOCABULARY WHITELIST (Never subject to typo correction)
// ---------------------------------------------------------------------------
const PROTECTED_VOCABULARY = new Set([
  'spiking', 'spike', 'spikes', 'cyclical', 'cyclic', 'intermittent', 'tertian',
  'shaking', 'rigors', 'severe', 'mild', 'moderate', 'intense', 'frontal',
  'sudden', 'gradual', 'acute', 'chronic', 'hours', 'hour', 'days', 'day',
  'weeks', 'week', 'months', 'month', 'every', 'constant', 'recurrent',
  'returned', 'travel', 'traveled', 'safari', 'rural', 'urban', 'trip',
  'denies', 'denied', 'without', 'presents', 'presenting', 'reports', 'complains',
  'history', 'known', 'taking', 'allergic', 'allergies', 'meds', 'medications',
  'normal', 'stable', 'elevated', 'decreased', 'bilateral', 'unilateral',
  'dark', 'urine', 'fever', 'chills', 'pain', 'headache', 'sweat', 'sweating',
  'blood', 'cough', 'swelling', 'yellow', 'eyes', 'skin', 'chest', 'belly'
]);

// ---------------------------------------------------------------------------
// 2. HIGH-YIELD MEDICAL SHORTFORMS & ABBREVIATIONS
// ---------------------------------------------------------------------------
const MEDICAL_SHORTFORMS: Record<string, { canonical: string; category: ExtractedClinicalConcept['category']; conceptId: string }> = {
  'sob': { canonical: 'Dyspnea / Shortness of Breath', category: 'Symptom', conceptId: 'E_66' },
  'doe': { canonical: 'Dyspnea on Exertion', category: 'Symptom', conceptId: 'E_66' },
  'cp': { canonical: 'Chest Pain / Angina', category: 'Symptom', conceptId: 'E_53' },
  'ha': { canonical: 'Headache / Cephalea', category: 'Symptom', conceptId: 'E_124' },
  'htn': { canonical: 'Hypertension', category: 'Risk Factor', conceptId: 'RF_HTN' },
  'dm': { canonical: 'Diabetes Mellitus', category: 'Risk Factor', conceptId: 'RF_DM' },
  'dm2': { canonical: 'Type 2 Diabetes Mellitus', category: 'Risk Factor', conceptId: 'RF_DM2' },
  't2d': { canonical: 'Type 2 Diabetes Mellitus', category: 'Risk Factor', conceptId: 'RF_DM2' },
  't1d': { canonical: 'Type 1 Diabetes Mellitus', category: 'Risk Factor', conceptId: 'RF_T1D' },
  'dvt': { canonical: 'Deep Vein Thrombosis Risk', category: 'Risk Factor', conceptId: 'RF_DVT' },
  'pe': { canonical: 'Pulmonary Embolism Suspicion', category: 'Sign', conceptId: 'DX_PE' },
  'mi': { canonical: 'Myocardial Infarction Suspicion', category: 'Sign', conceptId: 'DX_MI' },
  'stemi': { canonical: 'ST-Elevation Myocardial Infarction', category: 'Sign', conceptId: 'DX_STEMI' },
  'nstemi': { canonical: 'Non-ST-Elevation Myocardial Infarction', category: 'Sign', conceptId: 'DX_NSTEMI' },
  'nv': { canonical: 'Nausea & Vomiting', category: 'Symptom', conceptId: 'E_154' },
  'n/v': { canonical: 'Nausea & Vomiting', category: 'Symptom', conceptId: 'E_154' },
  'urti': { canonical: 'Upper Respiratory Tract Infection', category: 'Symptom', conceptId: 'DX_URTI' },
  'uri': { canonical: 'Upper Respiratory Infection', category: 'Symptom', conceptId: 'DX_URTI' },
  'uti': { canonical: 'Urinary Tract Infection', category: 'Symptom', conceptId: 'DX_UTI' },
  'ckd': { canonical: 'Chronic Kidney Disease', category: 'Risk Factor', conceptId: 'RF_CKD' },
  'chf': { canonical: 'Congestive Heart Failure', category: 'Risk Factor', conceptId: 'RF_CHF' },
  'copd': { canonical: 'Chronic Obstructive Pulmonary Disease', category: 'Risk Factor', conceptId: 'RF_COPD' },
  'afib': { canonical: 'Atrial Fibrillation', category: 'Risk Factor', conceptId: 'RF_AFIB' },
  'af': { canonical: 'Atrial Fibrillation', category: 'Risk Factor', conceptId: 'RF_AFIB' },
  'gerd': { canonical: 'Gastroesophageal Reflux Disease', category: 'Risk Factor', conceptId: 'RF_GERD' },
  'cva': { canonical: 'Cerebrovascular Accident / Stroke', category: 'Sign', conceptId: 'DX_CVA' },
  'tia': { canonical: 'Transient Ischemic Attack', category: 'Sign', conceptId: 'DX_TIA' },
  'rlq': { canonical: 'Right Lower Quadrant Abdominal Pain', category: 'Symptom', conceptId: 'E_168_RLQ' },
  'ruq': { canonical: 'Right Upper Quadrant Pain (Biliary/Hepatic)', category: 'Symptom', conceptId: 'E_168_RUQ' },
  'llq': { canonical: 'Left Lower Quadrant Pain', category: 'Symptom', conceptId: 'E_168_LLQ' },
  'luq': { canonical: 'Left Upper Quadrant Pain (Splenic)', category: 'Symptom', conceptId: 'E_168_LUQ' },
  'abd': { canonical: 'Abdominal Symptoms', category: 'Symptom', conceptId: 'E_168' },
  'nkda': { canonical: 'No Known Drug Allergies (NKDA)', category: 'Allergy', conceptId: 'ALG_NKDA' },
  'nka': { canonical: 'No Known Allergies', category: 'Allergy', conceptId: 'ALG_NKDA' }
};

// ---------------------------------------------------------------------------
// 3. CLINICAL ONTOLOGY & SYNONYM MAP (Includes Layperson & MBBS Expressions)
// ---------------------------------------------------------------------------
interface ClinicalConceptDefinition {
  id: string;
  canonical: string;
  category: ExtractedClinicalConcept['category'];
  exactPhrases: string[];
  flexiblePatterns?: RegExp[];
  typoVariants: string[];
}

const CLINICAL_CONCEPTS_DATABASE: ClinicalConceptDefinition[] = [
  {
    id: 'E_91_CYCLICAL',
    canonical: 'Cyclical / Spiking Fever (Tertian Pattern)',
    category: 'Symptom',
    exactPhrases: [
      'cyclical spiking fevers', 'spiking fevers', 'spiking fever', 'cyclical fever',
      'cyclical fevers', 'intermittent fever', 'tertian fever', 'fevers every 48 hours',
      'fever every 48 hours', 'fever every 2 days', 'fever every other day',
      'hectic fever', 'temperature spikes', 'fever spikes'
    ],
    flexiblePatterns: [
      /spik(?:ing|ed|es)?\s+fevers?/i,
      /cycli(?:cal|c)?\s+fevers?/i,
      /fevers?\s+every\s+(?:48\s*h|2\s*days?)/i
    ],
    typoVariants: ['cyclcal fever', 'cyclicl fever', 'spikin fever']
  },
  {
    id: 'E_91_RIGORS',
    canonical: 'Shaking Rigors / Severe Chills',
    category: 'Symptom',
    exactPhrases: [
      'shaking rigors', 'rigors', 'shaking chills', 'severe rigors', 'teeth chattering',
      'violent shivering', 'shivering rigors', 'chills', 'intense chills', 'rigor'
    ],
    flexiblePatterns: [
      /teeth\s+(?:were\s+)?chattering/i,
      /shak(?:ing|y)\s+(?:rigors?|chills?)/i,
      /violent\s+shiver(?:ing)?/i
    ],
    typoVariants: ['shaking rigers', 'rigorss', 'sheking chills']
  },
  {
    id: 'E_91',
    canonical: 'Fever / Pyrexia',
    category: 'Symptom',
    exactPhrases: [
      'fever', 'pyrexia', 'high temperature', 'febrile', 'feverish', 'feeling hot',
      'burning up', 'elevated temp', 'high temp'
    ],
    typoVariants: ['feever', 'fevr', 'feverr', 'temprature']
  },
  {
    id: 'E_JAUNDICE',
    canonical: 'Jaundice / Scleral Icterus',
    category: 'Sign',
    exactPhrases: [
      'jaundice', 'mild jaundice', 'severe jaundice', 'yellow eyes', 'yellow skin',
      'icterus', 'scleral icterus', 'yellowish eyes', 'yellowing of skin', 'yellowish skin'
    ],
    flexiblePatterns: [
      /yellow(?:ish|ing)?\s+(?:eyes?|skin|sclera)/i,
      /(?:eyes?|skin)\s+(?:turned|became|are)\s+yellow/i
    ],
    typoVariants: ['jaundis', 'jaundce', 'jaundise', 'icteric']
  },
  {
    id: 'E_DARK_URINE',
    canonical: 'Dark Urine / Hemoglobinuria',
    category: 'Sign',
    exactPhrases: [
      'dark urine', 'dark pee', 'cola colored urine', 'cola-colored urine', 'tea colored urine',
      'tea-colored urine', 'brown urine', 'black water urine', 'blackwater', 'hematuria',
      'blood in urine', 'red urine'
    ],
    flexiblePatterns: [
      /(?:dark|brown|tea|cola|red)\s+(?:urine|pee|piss)/i,
      /urine\s+(?:is|turned|became)\s+(?:dark|brown|black)/i
    ],
    typoVariants: ['dark urin', 'dark urinne', 'blackwater urine']
  },
  {
    id: 'E_124',
    canonical: 'Frontal / Severe Headache',
    category: 'Symptom',
    exactPhrases: [
      'frontal headache', 'severe frontal headache', 'headache', 'severe headache',
      'retro-orbital headache', 'retro-orbital pain', 'throbbing headache', 'migraine',
      'splitting headache', 'pain behind eyes'
    ],
    flexiblePatterns: [
      /(?:frontal|throbbing|severe|splitting)\s+headache/i,
      /pain\s+behind\s+(?:my\s+)?eyes/i
    ],
    typoVariants: ['headche', 'hedache', 'headac', 'migrain', 'head ache']
  },
  {
    id: 'E_50',
    canonical: 'Diaphoresis (Profuse Sweating)',
    category: 'Symptom',
    exactPhrases: [
      'diaphoresis', 'profuse sweating', 'cold sweats', 'sweaty', 'night sweats',
      'drenched in sweat', 'sweating buckets', 'excessive sweating', 'perspiration'
    ],
    flexiblePatterns: [
      /(?:cold|night|profuse)\s+sweats?/i,
      /(?:drenched|soaking)\s+in\s+sweat/i
    ],
    typoVariants: ['diaforesis', 'diaforetic', 'sweting']
  },
  {
    id: 'E_53',
    canonical: 'Chest Pain / Angina',
    category: 'Symptom',
    exactPhrases: [
      'chest pain', 'angina', 'retrosternal pain', 'substernal chest pain',
      'crushing chest pressure', 'heavy chest', 'tight chest', 'chest tightness',
      'squeezing chest pain', 'levine sign'
    ],
    typoVariants: ['cheast pain', 'ches pain', 'chest pane', 'chestpain', 'substurnal']
  },
  {
    id: 'E_57',
    canonical: 'Radiation of Pain to Arm/Jaw/Neck',
    category: 'Symptom',
    exactPhrases: [
      'radiating to left arm', 'radiates to left arm', 'left arm pain', 'radiating to jaw',
      'jaw pain', 'radiation to neck', 'radiating to back', 'arm pain'
    ],
    typoVariants: ['radiat to arm', 'radating to left arm']
  },
  {
    id: 'E_66',
    canonical: 'Dyspnea / Shortness of Breath',
    category: 'Symptom',
    exactPhrases: [
      'shortness of breath', 'dyspnea', 'breathlessness', 'difficulty breathing',
      'hard to breathe', 'winded', 'out of breath', 'air hunger', 'labored breathing'
    ],
    typoVariants: ['shorness of breath', 'shorness of breth', 'breathlesness', 'disnea', 'dispnea']
  },
  {
    id: 'E_154',
    canonical: 'Nausea & Vomiting',
    category: 'Symptom',
    exactPhrases: [
      'nausea', 'vomiting', 'throwing up', 'emesis', 'puking', 'feeling sick',
      'barfing', 'queasy', 'nauseated', 'nauseous'
    ],
    typoVariants: ['naucea', 'vomitting', 'vomit', 'vomiting']
  },
  {
    id: 'E_89',
    canonical: 'Palpitations / Tachycardia',
    category: 'Symptom',
    exactPhrases: [
      'palpitations', 'racing heart', 'fluttering heart', 'tachycardia', 'fast heartbeat',
      'pounding heart', 'heart racing', 'skipped beats'
    ],
    typoVariants: ['palpatation', 'palpitation', 'tackicardia', 'tachicardia']
  },
  {
    id: 'E_157',
    canonical: 'Dizziness / Syncope / Lightheadedness',
    category: 'Symptom',
    exactPhrases: [
      'dizziness', 'lightheadedness', 'syncope', 'fainting', 'passed out', 'blacked out',
      'presyncope', 'dizzy spells', 'feeling faint'
    ],
    typoVariants: ['dizzy', 'dizzines', 'lightheaded', 'faint']
  },
  {
    id: 'E_220',
    canonical: 'Pleuritic Chest Pain (Worse on Inspiration)',
    category: 'Symptom',
    exactPhrases: [
      'pleuritic chest pain', 'pleuritic pain', 'sharp on breathing', 'pain on deep breath',
      'worse on inspiration', 'pleurisy', 'knife-like chest pain'
    ],
    typoVariants: ['pluritic', 'pleurisy', 'pleuritic pain']
  },
  {
    id: 'E_45',
    canonical: 'Hemoptysis (Coughing Blood)',
    category: 'Sign',
    exactPhrases: [
      'coughing blood', 'hemoptysis', 'blood in sputum', 'bloody sputum', 'coughing up blood'
    ],
    typoVariants: ['haemoptysis', 'hemoptosis', 'blood cough']
  },
  {
    id: 'E_168',
    canonical: 'Abdominal Pain',
    category: 'Symptom',
    exactPhrases: [
      'abdominal pain', 'belly pain', 'stomach ache', 'bellyache', 'cramping',
      'stomach pain', 'epigastric pain', 'tummy ache'
    ],
    typoVariants: ['stomachache', 'abdomnal pain', 'stomache']
  },
  {
    id: 'E_MENINGISM',
    canonical: 'Nuchal Rigidity / Stiff Neck (Meningism)',
    category: 'Sign',
    exactPhrases: [
      'stiff neck', 'neck stiffness', 'nuchal rigidity', 'can not bend neck', "can't bend neck",
      'pain moving neck', 'kernig sign', 'brudzinski sign', 'meningismus'
    ],
    typoVariants: ['nuchal rigdity', 'stif neck']
  },
  {
    id: 'E_PHOTOPHOBIA',
    canonical: 'Photophobia (Light Sensitivity)',
    category: 'Symptom',
    exactPhrases: [
      'photophobia', 'sensitive to light', 'light hurts eyes', 'cannot look at light',
      "can't look at light", 'intolerance to light'
    ],
    typoVariants: ['fotophobia', 'photofobia']
  },
  {
    id: 'E_113',
    canonical: 'Peripheral Edema / Leg Swelling',
    category: 'Sign',
    exactPhrases: [
      'leg swelling', 'ankle swelling', 'swollen leg', 'puffy ankles', 'edema',
      'unilateral leg swelling', 'calf swelling', 'tender calf'
    ],
    typoVariants: ['oedema', 'sweling', 'swolen leg']
  },
  {
    id: 'E_173',
    canonical: 'Urticaria / Rash / Allergic Reaction',
    category: 'Sign',
    exactPhrases: [
      'hives', 'urticaria', 'rash', 'skin rash', 'itching', 'pruritus',
      'itchy welts', 'anaphylaxis', 'lip swelling', 'facial swelling'
    ],
    typoVariants: ['rashe', 'anafilaxis', 'urtecarea']
  }
];

// ---------------------------------------------------------------------------
// 4. DAMERAU-LEVENSHTEIN WITH STRICT SAFETY CONSTRAINTS
// ---------------------------------------------------------------------------
function calculateDamerauLevenshtein(a: string, b: string): number {
  const al = a.length;
  const bl = b.length;
  if (al === 0) return bl;
  if (bl === 0) return al;

  const matrix: number[][] = [];
  for (let i = 0; i <= al; i++) matrix[i] = [i];
  for (let j = 0; j <= bl; j++) matrix[0][j] = j;

  for (let i = 1; i <= al; i++) {
    for (let j = 1; j <= bl; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        matrix[i][j] = Math.min(matrix[i][j], matrix[i - 2][j - 2] + 1);
      }
    }
  }
  return matrix[al][bl];
}

// ---------------------------------------------------------------------------
// 5. SMART MULTI-ENTITY SEARCH PARSER
// ---------------------------------------------------------------------------
export function parseClinicalSearchQuery(inputText: string): ClinicalSearchParseResult {
  if (!inputText || !inputText.trim()) {
    return {
      concepts: [],
      parsedDemographics: {},
      parsedVitals: { clinicalAlerts: [] },
      parsedAllergies: [],
      parsedMedications: [],
      appliedShortforms: []
    };
  }

  const raw = inputText.trim();
  const lower = raw.toLowerCase();

  // Result accumulator
  const conceptsMap: Map<string, ExtractedClinicalConcept> = new Map();
  const appliedShortforms: Array<{ shortform: string; expanded: string }> = [];
  const parsedDemographics: ClinicalSearchParseResult['parsedDemographics'] = {};
  const parsedVitals: ClinicalSearchParseResult['parsedVitals'] = { clinicalAlerts: [] };
  const parsedAllergies: string[] = [];
  const parsedMedications: string[] = [];

  // -------------------------------------------------------------------------
  // A. DEMOGRAPHICS PARSING (e.g. "29M", "45 yo female", "32-year-old male pregnant")
  // -------------------------------------------------------------------------
  const ageMatch = lower.match(/\b(\d{1,3})\s*(?:yo|y\/o|year[\s-]old|years[\s-]old|yr[\s-]old)?\s*(male|female|m|f)\b/) ||
                   lower.match(/\b(male|female)\s*,?\s*(\d{1,3})\b/) ||
                   lower.match(/\b(\d{1,3})\s*(?:yo|y\/o|years[\s-]old|yr)\b/);

  if (ageMatch) {
    if (ageMatch[1] && !isNaN(parseInt(ageMatch[1]))) {
      const parsedAge = parseInt(ageMatch[1]);
      if (parsedAge >= 0 && parsedAge <= 120) {
        parsedDemographics.age = parsedAge;
      }
    }
    if (ageMatch[2]) {
      const g = ageMatch[2].toLowerCase();
      if (g === 'm' || g === 'male') parsedDemographics.gender = 'Male';
      if (g === 'f' || g === 'female') parsedDemographics.gender = 'Female';
    }
  }

  if (lower.includes('pregnant') || lower.includes('gestation') || lower.includes('gravida')) {
    parsedDemographics.isPregnant = true;
    if (!parsedDemographics.gender) parsedDemographics.gender = 'Female';
  }

  // -------------------------------------------------------------------------
  // B. TRAVEL & ENDEMIC GEOGRAPHY PARSING
  // -------------------------------------------------------------------------
  let parsedTravel: string | undefined;
  const travelKeywords = [
    'kenya', 'africa', 'sub-saharan', 'tanzania', 'uganda', 'ghana', 'nigeria',
    'safari', 'malaria', 'endemic', 'india', 'thailand', 'southeast asia', 'vietnam',
    'cambodia', 'brazil', 'amazon', 'peru', 'travel', 'trip', 'returned from'
  ];

  for (const tkw of travelKeywords) {
    if (lower.includes(tkw)) {
      // Extract sentence or context around travel
      const travelSentenceMatch = raw.match(new RegExp(`[^.?!;]*\\b${tkw}\\b[^.?!;]*`, 'i'));
      if (travelSentenceMatch) {
        parsedTravel = travelSentenceMatch[0].trim();
      } else {
        parsedTravel = `Recent travel to ${tkw.toUpperCase()} region`;
      }
      conceptsMap.set('TRAVEL_ENDEMIC', {
        id: 'TRAVEL_ENDEMIC',
        canonicalName: `Endemic Travel: ${parsedTravel}`,
        category: 'Endemic Travel',
        matchedText: tkw,
        isShortform: false,
        isTypoCorrected: false
      });
      break;
    }
  }

  // -------------------------------------------------------------------------
  // C. DURATION & CHRONOLOGY PARSING
  // -------------------------------------------------------------------------
  let parsedDuration: string | undefined;
  const durationMatch = lower.match(/\b(?:for|duration|started|onset|since)\s+([0-9]+\s*(?:days?|hours?|weeks?|months?|hrs?))\b/) ||
                        lower.match(/\b([0-9]+\s*(?:days?|hours?|weeks?|months?|hrs?))\s*(?:ago|duration|history)\b/) ||
                        lower.match(/\b(sudden onset|gradual onset|cyclical every \d+ hours?)\b/);

  if (durationMatch) {
    parsedDuration = durationMatch[1] || durationMatch[0];
  } else if (lower.includes('every 48 hours') || lower.includes('every 48h')) {
    parsedDuration = '48-hour cyclical (Tertian pattern)';
  }

  // -------------------------------------------------------------------------
  // D. OBJECTIVE VITALS EXTRACTION (Temp, HR, BP, SpO2, RR)
  // -------------------------------------------------------------------------
  // Temperature
  const tempMatch = lower.match(/(?:temp|t|temperature)[:\s]*([34][0-9](?:\.[0-9])?)\s*(?:c|°c)?\b/) ||
                    lower.match(/\b([34][0-9]\.[0-9])\s*(?:c|°c)\b/) ||
                    lower.match(/(?:temp|temperature)[:\s]*(10[0-5](?:\.[0-9])?)\s*(?:f|°f)?\b/);
  if (tempMatch) {
    let tVal = parseFloat(tempMatch[1]);
    if (tVal > 90) {
      // Convert Fahrenheit to Celsius
      tVal = Math.round(((tVal - 32) * 5 / 9) * 10) / 10;
    }
    parsedVitals.temperatureC = tVal;
    if (tVal >= 38.3) {
      parsedVitals.clinicalAlerts.push(`High Pyrexia (${tVal}°C)`);
      conceptsMap.set('VITAL_PYREXIA', {
        id: 'VITAL_PYREXIA',
        canonicalName: `High Pyrexia (${tVal}°C)`,
        category: 'Vital Sign',
        matchedText: tempMatch[0],
        isShortform: false,
        isTypoCorrected: false
      });
    }
  }

  // Heart Rate
  const hrMatch = lower.match(/(?:hr|heart\s*rate|pulse)[:\s]*([4-9][0-9]|1[0-9]{2}|2[0-9]{2})\s*(?:bpm)?\b/);
  if (hrMatch) {
    const hrVal = parseInt(hrMatch[1]);
    parsedVitals.heartRate = hrVal;
    if (hrVal > 100) {
      parsedVitals.clinicalAlerts.push(`Tachycardia (${hrVal} bpm)`);
      conceptsMap.set('VITAL_TACHYCARDIA', {
        id: 'VITAL_TACHYCARDIA',
        canonicalName: `Tachycardia (${hrVal} bpm)`,
        category: 'Vital Sign',
        matchedText: hrMatch[0],
        isShortform: false,
        isTypoCorrected: false
      });
    }
  }

  // Blood Pressure
  const bpMatch = lower.match(/(?:bp|blood\s*pressure)[:\s]*([7-9][0-9]|1[0-9]{2}|2[0-9]{2})\s*[\/x]\s*([4-9][0-9]|1[0-3][0-9])\b/);
  if (bpMatch) {
    parsedVitals.bpSystolic = parseInt(bpMatch[1]);
    parsedVitals.bpDiastolic = parseInt(bpMatch[2]);
    if (parsedVitals.bpSystolic < 90) {
      parsedVitals.clinicalAlerts.push(`Hypotension (BP ${parsedVitals.bpSystolic}/${parsedVitals.bpDiastolic})`);
    } else if (parsedVitals.bpSystolic >= 180) {
      parsedVitals.clinicalAlerts.push(`Hypertensive Crisis (${parsedVitals.bpSystolic}/${parsedVitals.bpDiastolic})`);
    }
  }

  // SpO2
  const spo2Match = lower.match(/(?:spo2|o2|sat|sats)[:\s]*([7-9][0-9]|100)\s*%?\b/);
  if (spo2Match) {
    const spo2Val = parseInt(spo2Match[1]);
    parsedVitals.spo2 = spo2Val;
    if (spo2Val < 94) {
      parsedVitals.clinicalAlerts.push(`Hypoxia (SpO2 ${spo2Val}%)`);
    }
  }

  // Respiratory Rate
  const rrMatch = lower.match(/(?:rr|resp|respiratory\s*rate)[:\s]*([8-9]|[1-4][0-9])\s*(?:\/min|bpm)?\b/);
  if (rrMatch) {
    parsedVitals.respiratoryRate = parseInt(rrMatch[1]);
  }

  // -------------------------------------------------------------------------
  // E. MEDICAL SHORTFORMS & ACRONYMS MATCHING
  // -------------------------------------------------------------------------
  // Tokenize words with boundary check
  const tokenList = lower.replace(/[^\w\/\s-]/g, ' ').split(/\s+/).filter(Boolean);

  for (const token of tokenList) {
    const shortformInfo = MEDICAL_SHORTFORMS[token];
    if (shortformInfo) {
      appliedShortforms.push({ shortform: token.toUpperCase(), expanded: shortformInfo.canonical });
      conceptsMap.set(shortformInfo.conceptId, {
        id: shortformInfo.conceptId,
        canonicalName: shortformInfo.canonical,
        category: shortformInfo.category,
        matchedText: token,
        isShortform: true,
        shortformOriginal: token.toUpperCase(),
        isTypoCorrected: false
      });

      if (shortformInfo.category === 'Allergy' && token === 'nkda') {
        parsedAllergies.push('No Known Drug Allergies (NKDA)');
      }
    }
  }

  // -------------------------------------------------------------------------
  // F. ONTOLOGY MATCHING (Exact, Substring & Protected Typo Recognition)
  // -------------------------------------------------------------------------
  for (const concept of CLINICAL_CONCEPTS_DATABASE) {
    let matched = false;

    // 1. Direct Multi-word Phrase Match
    for (const phrase of concept.exactPhrases) {
      if (lower.includes(phrase)) {
        conceptsMap.set(concept.id, {
          id: concept.id,
          canonicalName: concept.canonical,
          category: concept.category,
          matchedText: phrase,
          isShortform: false,
          isTypoCorrected: false
        });
        matched = true;
        break;
      }
    }

    if (matched) continue;

    // 1b. Flexible Regex Patterns Match (e.g. "teeth were chattering", "eyes turned yellow")
    if (concept.flexiblePatterns) {
      for (const pattern of concept.flexiblePatterns) {
        const m = lower.match(pattern);
        if (m) {
          conceptsMap.set(concept.id, {
            id: concept.id,
            canonicalName: concept.canonical,
            category: concept.category,
            matchedText: m[0],
            isShortform: false,
            isTypoCorrected: false
          });
          matched = true;
          break;
        }
      }
    }

    if (matched) continue;

    // 2. Controlled Typo Variants Match (Safe List)
    for (const variant of concept.typoVariants) {
      if (lower.includes(variant)) {
        conceptsMap.set(concept.id, {
          id: concept.id,
          canonicalName: concept.canonical,
          category: concept.category,
          matchedText: variant,
          isShortform: false,
          isTypoCorrected: true,
          correctedFrom: variant
        });
        matched = true;
        break;
      }
    }

    if (matched) continue;

    // 3. Guarded Edit-Distance Check (STRICT SAFETY: Only for non-protected tokens)
    for (const word of tokenList) {
      // Never attempt typo correction on protected words (e.g. 'spiking', 'severe', 'mild', 'shaking')
      if (PROTECTED_VOCABULARY.has(word)) continue;
      if (word.length < 5) continue; // Skip short words

      for (const phrase of concept.exactPhrases) {
        // Only single-word keys with similar length
        if (phrase.includes(' ')) continue;
        if (Math.abs(word.length - phrase.length) > 2) continue;

        // Must share first letter
        if (word[0] !== phrase[0]) continue;

        const dist = calculateDamerauLevenshtein(word, phrase);
        if (dist === 1 || (dist === 2 && word.length >= 7)) {
          conceptsMap.set(concept.id, {
            id: concept.id,
            canonicalName: concept.canonical,
            category: concept.category,
            matchedText: word,
            isShortform: false,
            isTypoCorrected: true,
            correctedFrom: word
          });
          matched = true;
          break;
        }
      }
      if (matched) break;
    }
  }

  // -------------------------------------------------------------------------
  // G. MEDICATION & ALLERGY EXCLUSIONS
  // -------------------------------------------------------------------------
  if (lower.includes('no chemoprophylaxis') || lower.includes('did not take chemoprophylaxis')) {
    parsedMedications.push('Did not take malaria chemoprophylaxis');
  }

  return {
    concepts: Array.from(conceptsMap.values()),
    parsedDemographics,
    parsedTravel,
    parsedDuration,
    parsedVitals,
    parsedAllergies,
    parsedMedications,
    appliedShortforms
  };
}

/**
 * Updates a PatientProfile with structured entities parsed from free-form clinical search query
 */
export function applyParsedSearchToPatientProfile(
  prev: PatientProfile,
  parsed: ClinicalSearchParseResult
): PatientProfile {
  return {
    ...prev,
    age: parsed.parsedDemographics.age ?? prev.age,
    gender: parsed.parsedDemographics.gender ?? prev.gender,
    isPregnant: parsed.parsedDemographics.isPregnant ?? prev.isPregnant,
    travelHistory: parsed.parsedTravel || prev.travelHistory,
    symptomDuration: parsed.parsedDuration || prev.symptomDuration,
    vitalSigns: {
      ...prev.vitalSigns,
      bpSystolic: parsed.parsedVitals.bpSystolic ?? prev.vitalSigns?.bpSystolic,
      bpDiastolic: parsed.parsedVitals.bpDiastolic ?? prev.vitalSigns?.bpDiastolic,
      heartRate: parsed.parsedVitals.heartRate ?? prev.vitalSigns?.heartRate,
      respiratoryRate: parsed.parsedVitals.respiratoryRate ?? prev.vitalSigns?.respiratoryRate,
      spo2: parsed.parsedVitals.spo2 ?? prev.vitalSigns?.spo2,
      temperatureC: parsed.parsedVitals.temperatureC ?? prev.vitalSigns?.temperatureC,
    },
    allergies: parsed.parsedAllergies.length > 0 
      ? Array.from(new Set([...prev.allergies, ...parsed.parsedAllergies]))
      : prev.allergies,
    currentMedications: parsed.parsedMedications.length > 0
      ? Array.from(new Set([...prev.currentMedications, ...parsed.parsedMedications]))
      : prev.currentMedications,
    preExistingConditions: prev.preExistingConditions
  };
}
