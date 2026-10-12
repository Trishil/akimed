import { PatientProfile, DiagnosticAssessment, AkinatorQuestion, DifferentialItem, TriageEvaluation, AkinatorQA, AkinatorState, ActiveHypothesisInfo } from '../types/clinical';
import { evaluateTriageDeterministic, checkAllergyAndMedInteractions } from './clinicalFallbackEngine';
import { parseClinicalSearch } from './clinicalSearchParser';

const LIKERT_ANSWERS: AkinatorQuestion['possibleAnswers'] = [
  { label: 'Yes', value: 'yes' },
  { label: 'Probably Yes', value: 'probably_yes' },
  { label: "Don't Know", value: 'unsure' },
  { label: 'Probably Not', value: 'probably_no' },
  { label: 'No', value: 'no' },
];

export interface DiseaseProfile {
  id: string;
  name: string;
  icd10: string;
  category: 'Primary' | 'Secondary' | 'Alternative';
  system: 'infectious' | 'cardiac' | 'pulmonary' | 'gi' | 'neuro' | 'renal' | 'systemic';
  basePrior: number; // baseline incidence weight
  keywords: string[]; // cardinal clinical presentation tokens for initial Bayesian prior calculation
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
    lrPos: number; // Likelihood ratio if answer is YES
    lrNeg: number; // Likelihood ratio if answer is NO
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

// ===========================================================================
// COMPREHENSIVE CLINICAL DISEASE KNOWLEDGE BASE (28 Conditions Across All Systems)
// ===========================================================================
export const CLINICAL_DISEASES: Record<string, DiseaseProfile> = {
  // --- TROPICAL & INFECTIOUS ---
  malaria: {
    id: 'malaria',
    name: 'Plasmodium falciparum Malaria',
    icd10: 'B50.9',
    category: 'Primary',
    system: 'infectious',
    basePrior: 3.0,
    keywords: ['malaria', 'travel', 'africa', 'kenya', 'safari', 'mosquito', 'chills', 'rigors', 'cyclical', 'paroxysm', 'jaundice', 'dark urine'],
    pathophysiology: 'Inoculation of sporozoites by Anopheles mosquito -> hepatic schizogony -> cyclical intraerythrocytic rupture releasing merozoites, hemozoin, and pyrogens (IL-1, TNF-alpha) causing paroxysmal fevers, rigors, and microvascular cytoadherence.',
    supportingFindings: ['Recent travel to malaria-endemic region', 'Paroxysmal cyclical fevers with violent rigors', 'Scleral icterus / dark urine from intravascular hemolysis', 'Palpable splenomegaly'],
    opposingFindings: ['Absence of travel history', 'Absence of paroxysmal fevers', 'Prominent dry cough without systemic features'],
    bedsideSignsToTest: ['Splenomegaly palpation', 'Scleral icterus exam', 'Postural blood pressure (hypovolemia)'],
    recommendedWorkup: {
      initialLabs: ['Thick and Thin Giemsa Peripheral Blood Smear', 'Malaria Rapid Diagnostic Test (PfHRP2 / pLDH)', 'Complete Blood Count (thrombocytopenia, anemia)', 'Total/Direct Bilirubin, LDH'],
      confirmatoryTests: ['Serial blood smears at 8-12 hour intervals x 3', 'G6PD qualitative screen prior to Primaquine'],
      imaging: ['Abdominal ultrasound for splenomegaly'],
    },
    clinicalPearls: 'Any fever returning from sub-Saharan Africa is Falciparum malaria until proven otherwise by 3 negative smears! Cytoadherence can trigger rapid cerebral malaria.',
  },
  dengue: {
    id: 'dengue',
    name: 'Dengue Fever / Severe Dengue',
    icd10: 'A90',
    category: 'Secondary',
    system: 'infectious',
    basePrior: 3.0,
    keywords: ['dengue', 'retro-orbital', 'eye pain', 'breakbone', 'joint pain', 'myalgia', 'petechiae', 'rash', 'tourniquet', 'bleeding'],
    pathophysiology: 'Flavivirus inoculation via Aedes aegypti causes endothelial glycocalyx disruption, capillary hyperpermeability, marked leukopenia, and profound consumptive thrombocytopenia.',
    supportingFindings: ['Severe retro-orbital headache worsening with eye movement', 'Profound myalgias/arthralgias ("breakbone fever")', 'Maculopapular rash / petechiae', 'Tourniquet test positive'],
    opposingFindings: ['Prolonged cyclical fevers beyond 10 days', 'Absence of severe body aches'],
    bedsideSignsToTest: ['Tourniquet Test (Hess test: >10 petechiae/sq inch)', 'Daily hematocrit tracking for hemoconcentration'],
    recommendedWorkup: {
      initialLabs: ['Dengue NS1 Antigen (Days 1-5)', 'Dengue IgM/IgG ELISA (After Day 5)', 'Serial CBC with platelet and hematocrit monitoring'],
      confirmatoryTests: ['RT-PCR for Dengue virus RNA serotypes'],
      imaging: ['Right Upper Quadrant ultrasound for gallbladder wall thickening and plasma leakage (ascites, pleural effusion)'],
    },
    clinicalPearls: 'Watch the critical defervescence phase (days 3-7): when fever drops, plasma leakage and shock risk peaks!',
  },
  typhoid: {
    id: 'typhoid',
    name: 'Enteric (Typhoid) Fever (Salmonella Typhi)',
    icd10: 'A01.0',
    category: 'Alternative',
    system: 'infectious',
    basePrior: 2.5,
    keywords: ['typhoid', 'salmonella', 'enteric', 'step-ladder', 'stepladder', 'faget', 'bradycardia', 'rose spots', 'constipation', 'pea soup'],
    pathophysiology: 'Fecal-oral ingestion -> invasion of intestinal Peyer patches via M-cells -> primary bacteremia through reticuloendothelial system -> stepladder fevers, relative bradycardia (Faget sign), and risk of terminal ileum perforation.',
    supportingFindings: ['Stepladder progressive fever rise', 'Relative bradycardia despite high pyrexia (Faget sign)', 'Rose spots on trunk', 'Abdominal distension with pea-soup diarrhea or constipation'],
    opposingFindings: ['Sudden explosive onset within 24 hours', 'Absence of abdominal symptoms'],
    bedsideSignsToTest: ['Faget sign (sphygmo-thermic dissociation)', 'Abdominal palpation for hepatosplenomegaly and cecal gurgling'],
    recommendedWorkup: {
      initialLabs: ['Blood culture (highest yield week 1: 80%)', 'CBC (leukopenia with relative lymphocytosis)', 'Stool/Urine cultures (week 2-3)'],
      confirmatoryTests: ['Bone marrow culture (gold standard, 90% yield even post-antibiotics)'],
    },
    clinicalPearls: 'Week 1: Blood cultures positive. Week 2: Rose spots and Widal/stool positive. Week 3: High risk of ileal perforation!',
  },
  leptospirosis: {
    id: 'leptospirosis',
    name: "Leptospirosis (Weil's Disease)",
    icd10: 'A27.0',
    category: 'Alternative',
    system: 'infectious',
    basePrior: 2.0,
    keywords: ['leptospirosis', 'freshwater', 'flood', 'floodwater', 'lake', 'calf pain', 'calf tenderness', 'red eyes', 'conjunctival suffusion', 'rodent', 'rat'],
    pathophysiology: 'Spirochete Leptospira interrogans enters through abraded skin/mucosa from water/soil contaminated with rodent urine -> systemic vasculitis with capillary endothelial necrosis affecting liver, kidneys, and lungs.',
    supportingFindings: ['Freshwater / floodwater exposure', 'Bilateral conjunctival suffusion without purulent discharge', 'Severe calf muscle tenderness', 'Jaundice combined with acute renal insufficiency'],
    opposingFindings: ['Absence of water/animal contact', 'Normal renal function and clear conjunctiva'],
    bedsideSignsToTest: ['Calf squeeze tenderness elicitation', 'Conjunctival inspection for suffusion'],
    recommendedWorkup: {
      initialLabs: ['Leptospira IgM ELISA / Rapid test', 'Serum creatinine and urea', 'Bilirubin and liver transaminases'],
      confirmatoryTests: ['Microscopic Agglutination Test (MAT - gold standard)', 'Leptospira PCR in blood/urine'],
    },
    clinicalPearls: 'Pathognomonic triad: conjunctival suffusion + intense calf myalgia + acute hepato-renal failure.',
  },
  acute_viral: {
    id: 'acute_viral',
    name: 'Acute Viral Syndrome / Constitutional Illness',
    icd10: 'B34.9',
    category: 'Alternative',
    system: 'infectious',
    basePrior: 5.0,
    keywords: ['viral', 'malaise', 'fatigue', 'tired', 'body ache', 'low fever', 'exhausted', 'generalized aches'],
    pathophysiology: 'Innate immune response to viral pathogen triggering pyrogen cascade (interferon-gamma, IL-1, TNF-alpha) causing constitutional fatigue, fever, and transient self-limiting symptoms.',
    supportingFindings: ['Constitutional malaise and low-to-moderate pyrexia', 'Diffuse mild myalgias', 'Absence of focal organomegaly or hemodynamic compromise'],
    opposingFindings: ['Focalizing physical signs (splenomegaly, petechial purpura, severe hemoconcentration)'],
    bedsideSignsToTest: ['General physical survey for lymphadenopathy and pharyngeal injection'],
    recommendedWorkup: {
      initialLabs: ['Complete Blood Count with differential', 'C-Reactive Protein (CRP)', 'Basic Metabolic Panel'],
      confirmatoryTests: ['Targeted viral multiplex PCR if indicated'],
    },
    clinicalPearls: 'A diagnosis of exclusion in tropical returnees; always rule out malaria and dengue first!',
  },
  influenza: {
    id: 'influenza',
    name: 'Influenza A/B Infection',
    icd10: 'J11.1',
    category: 'Secondary',
    system: 'infectious',
    basePrior: 4.0,
    keywords: ['flu', 'influenza', 'high fever', 'abrupt fever', 'myalgias', 'sore throat', 'dry cough', 'chills', 'prostration'],
    pathophysiology: 'Orthomyxovirus infection of respiratory epithelium triggering profound cytokine surge (interferons, IL-6), leading to abrupt systemic prostration, dry cough, and high fever.',
    supportingFindings: ['Abrupt onset within hours of high fever and shaking chills', 'Severe diffuse myalgias and ocular pain', 'Dry non-productive cough', 'Clear lungs on initial auscultation'],
    opposingFindings: ['Gradual onset over 2-3 weeks', 'Purulent rust-colored sputum'],
    bedsideSignsToTest: ['Vital signs (high pyrexia)', 'Oropharyngeal examination'],
    recommendedWorkup: {
      initialLabs: ['Rapid Influenza Molecular Assay / NAAT', 'Complete Blood Count'],
      confirmatoryTests: ['Multiplex Respiratory Viral PCR'],
    },
    clinicalPearls: 'Initiate neuraminidase inhibitors (Oseltamivir) within 48 hours for maximum mortality and morbidity reduction.',
  },
  sepsis: {
    id: 'sepsis',
    name: 'Severe Sepsis / Systemic Inflammatory Syndrome',
    icd10: 'A41.9',
    category: 'Primary',
    system: 'systemic',
    basePrior: 2.0,
    keywords: ['sepsis', 'septic', 'hypotension', 'shock', 'confusion', 'tachypnea', 'oliguria', 'altered mental', 'high fever', 'hypothermia'],
    pathophysiology: 'Dysregulated host response to infection causing systemic endothelial activation, microvascular thrombosis, vasodilation, and multiorgan failure.',
    supportingFindings: ['qSOFA criteria positive (RR >=22, altered mental status, SBP <=100)', 'Lactate > 2.0 mmol/L', 'Extreme lethargy or confusion', 'Oliguria'],
    opposingFindings: ['Normal stable vitals', 'Mild isolated localized symptoms without constitutional derangement'],
    bedsideSignsToTest: ['qSOFA score assessment', 'Capillary refill time (>3s indicates hypoperfusion)', 'Urine output catheter monitoring'],
    recommendedWorkup: {
      initialLabs: ['Serum Lactate', 'Blood Cultures x 2 before antibiotics', 'CBC, CMP, Coagulation panel'],
      confirmatoryTests: ['Source identification (CXR, Urinalysis, CT abdomen/pelvis)'],
    },
    clinicalPearls: 'Surviving Sepsis Campaign 1-Hour Bundle: Measure lactate, obtain blood cultures, start broad-spectrum IV antibiotics, and administer 30 mL/kg crystalloids for hypotension/lactate >=4.',
  },
  tuberculosis: {
    id: 'tuberculosis',
    name: 'Pulmonary Tuberculosis (TB)',
    icd10: 'A15.0',
    category: 'Alternative',
    system: 'pulmonary',
    basePrior: 2.0,
    keywords: ['tuberculosis', 'tb', 'night sweats', 'hemoptysis', 'weight loss', 'cough 3 weeks', 'chronic cough', 'blood sputum', 'cavitation'],
    pathophysiology: 'Inhalation of Mycobacterium tuberculosis aerosol droplets -> phagocytosis by alveolar macrophages -> granuloma formation with caseous necrosis -> cavitation and chronic wasting.',
    supportingFindings: ['Chronic cough > 3 weeks', 'Drenching night sweats and unintentional weight loss', 'Hemoptysis (blood-tinged sputum)', 'Apical crackles on auscultation'],
    opposingFindings: ['Hyperacute onset within hours', 'Absence of cough or constitutional signs'],
    bedsideSignsToTest: ['Chest auscultation for post-tussive apical crackles', 'Lymph node examination (scrofula)'],
    recommendedWorkup: {
      initialLabs: ['Sputum Acid-Fast Bacilli (AFB) smear x 3', 'GeneXpert MTB/RIF assay (detects DNA & Rifampin resistance in 2h)'],
      confirmatoryTests: ['Mycobacterial sputum culture (Lowenstein-Jensen / MGIT)'],
      imaging: ['Chest Radiograph (upper lobe infiltrates, cavitary lesions)'],
    },
    clinicalPearls: 'GeneXpert MTB/RIF provides rapid confirmation and simultaneously identifies rifampicin resistance within 2 hours.',
  },
  acute_pyelonephritis: {
    id: 'acute_pyelonephritis',
    name: 'Acute Pyelonephritis / Complicated UTI',
    icd10: 'N10',
    category: 'Secondary',
    system: 'renal',
    basePrior: 2.5,
    keywords: ['pyelonephritis', 'flank pain', 'cva tenderness', 'kidney pain', 'dysuria', 'urination', 'burning pee', 'fever rigors flank'],
    pathophysiology: 'Ascending bacterial infection (most commonly uropathogenic E. coli) from lower urinary tract through ureters into renal parenchyma and pelvis causing acute suppurative inflammation.',
    supportingFindings: ['Costovertebral angle (CVA) tenderness / flank pain', 'High spiking fever with rigors', 'Dysuria, urgency, or urinary frequency', 'Nausea and vomiting'],
    opposingFindings: ['Absence of flank or back tenderness', 'Completely normal urinalysis'],
    bedsideSignsToTest: ['Murphy punch sign (CVA fist percussion tenderness)', 'Abdominal and suprapubic palpation'],
    recommendedWorkup: {
      initialLabs: ['Urinalysis with microscopy (pyuria, leukocyte esterase, nitrites, WBC casts)', 'Urine Culture and Susceptibility', 'Blood Cultures x 2'],
      confirmatoryTests: ['Renal Ultrasound or CT Abdomen/Pelvis if non-responsive at 48-72h'],
    },
    clinicalPearls: 'WBC casts in urine sediment are pathognomonic for upper urinary tract involvement (pyelonephritis vs simple cystitis).',
  },

  // --- CARDIOVASCULAR & HEMODYNAMIC ---
  stemi: {
    id: 'stemi',
    name: 'Acute ST-Elevation Myocardial Infarction (STEMI)',
    icd10: 'I21.0',
    category: 'Primary',
    system: 'cardiac',
    basePrior: 3.5,
    keywords: ['chest pain', 'heart attack', 'stemi', 'angina', 'crushing', 'substernal', 'pressure', 'left arm', 'jaw', 'sweating', 'diaphoresis'],
    pathophysiology: 'Atheromatous plaque rupture with superimposed occlusive thrombosis in epicardial coronary artery -> transmural myocardial ischemia and necrosis.',
    supportingFindings: ['Crushing retrosternal chest tightness radiating to left arm/jaw', 'Diaphoresis and nausea', 'Exertional trigger', 'ST-elevation on ECG'],
    opposingFindings: ['Pleuritic pain worsening on deep inspiration', 'Pain relieved completely by leaning forward'],
    bedsideSignsToTest: ['12-lead ECG within 10 minutes', 'Cardiac auscultation for S4 gallop or new mitral regurgitation murmur'],
    recommendedWorkup: {
      initialLabs: ['High-Sensitivity Cardiac Troponin I/T (0h, 1h, 3h)', 'Electrolytes, Renal panel, Lipid profile', 'Coagulation markers'],
      confirmatoryTests: ['Immediate Emergency Coronary Angiography (Door-to-Balloon < 90 min)'],
      imaging: ['Transthoracic Echocardiography for regional wall motion abnormalities'],
    },
    clinicalPearls: 'Time is muscle! Immediate reperfusion via primary PCI is the gold standard within 90 minutes.',
  },
  unstable_angina: {
    id: 'unstable_angina',
    name: 'Unstable Angina / NSTEMI',
    icd10: 'I20.0',
    category: 'Secondary',
    system: 'cardiac',
    basePrior: 3.0,
    keywords: ['angina', 'unstable angina', 'chest pressure', 'nitroglycerin', 'exertion', 'rest pain', 'crescendo'],
    pathophysiology: 'Non-occlusive coronary thrombus or dynamic vasoconstriction causing subendocardial ischemia without persistent transmural ST-segment elevation.',
    supportingFindings: ['Angina at rest lasting >20 minutes', 'New onset severe exertional chest pressure', 'Crescendo pattern (more frequent or lower threshold)', 'Rapid relief with sublingual nitroglycerin'],
    opposingFindings: ['Sharp pleuritic pain varying with respiration', 'Pain reproducible by chest wall palpation'],
    bedsideSignsToTest: ['Serial 12-lead ECGs', 'Blood pressure monitoring in both arms'],
    recommendedWorkup: {
      initialLabs: ['Serial High-Sensitivity Troponin at 0h, 1h, 3h', 'CBC, Renal function, Coagulation profile'],
      confirmatoryTests: ['Inpatient Coronary Angiography within 24 hours (TIMI/GRACE risk stratification)'],
    },
    clinicalPearls: 'Dynamic T-wave inversions or ST-depressions with rising troponin confirm NSTEMI; absence of biomarker elevation indicates Unstable Angina.',
  },
  aortic_dissection: {
    id: 'aortic_dissection',
    name: 'Acute Stanford Type A Aortic Dissection',
    icd10: 'I71.01',
    category: 'Primary',
    system: 'cardiac',
    basePrior: 2.0,
    keywords: ['tearing', 'ripping', 'back pain', 'scapular', 'aortic', 'dissection', 'interscapular', 'pulse deficit', 'bp difference'],
    pathophysiology: 'Intimal tear in ascending aorta allowing pulsatile blood to cleave aortic media -> false lumen propagation with risk of cardiac tamponade, aortic regurgitation, or coronary ostial occlusion.',
    supportingFindings: ['Sudden explosive tearing/ripping chest pain radiating to interscapular back', 'Pulse deficit or >20 mmHg inter-arm blood pressure discrepancy', 'New diastolic murmur of aortic regurgitation', 'Severe hypertension or sudden shock'],
    opposingFindings: ['Gradual onset pain over hours', 'Normal symmetrical pulses with identical bilateral blood pressure'],
    bedsideSignsToTest: ['Bilateral simultaneous upper extremity blood pressure measurement', 'Radio-radial and radio-femoral pulse synchronization', 'Aortic murmur auscultation'],
    recommendedWorkup: {
      initialLabs: ['D-dimer (rapid rule-out if low)', 'Type and Crossmatch 6 units PRBCs', 'Troponin, CBC, BMP'],
      confirmatoryTests: ['CT Aortography (CTA chest, abdomen, pelvis - gold standard)', 'Transesophageal Echocardiography (TEE) if hemodynamically unstable'],
    },
    clinicalPearls: 'Never give full-dose anticoagulation until CTA excludes dissection! Every hour of delay increases mortality by 1-2%.',
  },
  pulmonary_embolism: {
    id: 'pulmonary_embolism',
    name: 'Acute Pulmonary Embolism (PE)',
    icd10: 'I26.9',
    category: 'Secondary',
    system: 'pulmonary',
    basePrior: 3.0,
    keywords: ['pe', 'pulmonary embolism', 'dvt', 'leg swelling', 'pleuritic', 'sob', 'breathless', 'clot', 'flight', 'sudden dyspnea'],
    pathophysiology: 'Thrombus dislodges from deep venous system (DVT) -> occludes pulmonary arterial bed -> acute ventilation-perfusion mismatch, increased right ventricular afterload, and reflex tachypnea.',
    supportingFindings: ['Sudden unexplained dyspnea and pleuritic chest pain', 'Tachycardia and tachypnea', 'Unilateral leg swelling/pain (DVT sign)', 'Hemoptysis or syncope in massive PE'],
    opposingFindings: ['Chronic cough with purulent sputum', 'Retrosternal pressure relieved by nitroglycerin'],
    bedsideSignsToTest: ['Wells score calculation', 'Calf circumference measurement (>3 cm asymmetry)', 'Jugular venous pressure inspection for RV strain'],
    recommendedWorkup: {
      initialLabs: ['Quantitative D-Dimer (high negative predictive value)', 'Troponin and NT-proBNP for RV strain risk stratification', 'Arterial Blood Gas (hypoxemia, hypocapnia, respiratory alkalosis)'],
      confirmatoryTests: ['CT Pulmonary Angiography (CTPA - gold standard)', 'Lower extremity Compression Ultrasonography for DVT'],
    },
    clinicalPearls: 'Tachycardia out of proportion to fever is a major red flag for PE. High Wells score mandates immediate CTPA!',
  },
  pericarditis: {
    id: 'pericarditis',
    name: 'Acute Pericarditis',
    icd10: 'I30.0',
    category: 'Alternative',
    system: 'cardiac',
    basePrior: 2.0,
    keywords: ['pericarditis', 'lean forward', 'sitting forward', 'pericardial rub', 'sharp chest pain', 'pleuritic chest', 'trapezius'],
    pathophysiology: 'Inflammation of visceral and parietal pericardium triggering sharp somatic pleuritic pain exacerbated by recumbency and thoracic movement.',
    supportingFindings: ['Sharp retrosternal pain radiating to trapezius ridges', 'Pain characteristically relieved by sitting upright and leaning forward', 'Pericardial friction rub on auscultation', 'Diffuse concave ST-elevation with PR depression on ECG'],
    opposingFindings: ['Pain radiating down left arm to jaw', 'Pain worsening on exertion rather than positional'],
    bedsideSignsToTest: ['Pericardial friction rub auscultation (high-pitched scratching at left lower sternal border during held expiration)', 'Pulsus paradoxus check'],
    recommendedWorkup: {
      initialLabs: ['High-Sensitivity Troponin', 'ESR and C-Reactive Protein (elevated)', 'Viral serologies or autoimmune panel as indicated'],
      confirmatoryTests: ['Echocardiogram to evaluate pericardial effusion and rule out tamponade'],
    },
    clinicalPearls: 'Trapezius ridge pain radiation is pathognomonic for pericarditis because the phrenic nerve innervates both pericardium and trapezius.',
  },
  acute_heart_failure: {
    id: 'acute_heart_failure',
    name: 'Acute Decompensated Heart Failure (ADHF)',
    icd10: 'I50.9',
    category: 'Secondary',
    system: 'cardiac',
    basePrior: 2.5,
    keywords: ['chf', 'heart failure', 'orthopnea', 'pnd', 'pillows', 'leg swelling', 'edema', 's3 gallop', 'crackles bilateral', 'jvd'],
    pathophysiology: 'Elevated cardiac filling pressures causing hydrostatic transudation of fluid into pulmonary alveoli and systemic venous congestion.',
    supportingFindings: ['Orthopnea (requires 3+ pillows to sleep) or Paroxysmal Nocturnal Dyspnea (PND)', 'Bilateral lower extremity pitting edema', 'Elevated Jugular Venous Distension (JVD) >8 cm', 'S3 gallop and bilateral basal pulmonary crackles'],
    opposingFindings: ['Asymmetrical unilateral leg swelling', 'Focal lobar consolidation with fever and purulent sputum'],
    bedsideSignsToTest: ['Hepatojugular reflux', 'Auscultation for S3 ventricular gallop and lung crackles'],
    recommendedWorkup: {
      initialLabs: ['Serum B-Type Natriuretic Peptide (BNP / NT-proBNP)', 'Troponin', 'Comprehensive Metabolic Panel (BUN/Creatinine)'],
      confirmatoryTests: ['Transthoracic Echocardiogram (EF, diastolic function, valve lesions)'],
      imaging: ['Chest X-ray (cardiomegaly, cephalization, Kerley B lines, pulmonary edema)'],
    },
    clinicalPearls: 'An elevated NT-proBNP with S3 gallop has the highest positive predictive value for acute cardiogenic dyspnea.',
  },

  // --- RESPIRATORY & PULMONARY ---
  pneumonia: {
    id: 'pneumonia',
    name: 'Severe Community-Acquired Pneumonia (CAP)',
    icd10: 'J18.9',
    category: 'Primary',
    system: 'pulmonary',
    basePrior: 4.0,
    keywords: ['pneumonia', 'cough', 'sputum', 'purulent', 'rust colored', 'crackles', 'fever cough', 'bronchial breathing', 'consolidation'],
    pathophysiology: 'Proliferation of microbial pathogens in alveolar spaces triggering exudative inflammation, alveolar consolidation, and impaired gas exchange.',
    supportingFindings: ['Cough with purulent rusty or green sputum', 'Fever, shaking chills, and pleuritic chest pain', 'Auscultatory crackles, bronchial breath sounds, and dullness to percussion', 'Tachypnea and oxygen desaturation'],
    opposingFindings: ['Clear breath sounds bilaterally with normal chest radiograph', 'Retrosternal squeezing pain radiating to left jaw'],
    bedsideSignsToTest: ['Chest auscultation for localized coarse crackles and egophony ("E to A" change)', 'CURB-65 / PSI pneumonia severity score calculation'],
    recommendedWorkup: {
      initialLabs: ['CBC with differential (leukocytosis)', 'Blood and sputum cultures', 'S. pneumoniae and Legionella urinary antigen tests'],
      confirmatoryTests: ['Chest X-Ray (PA and lateral views demonstrating lobar or patchy airspace consolidation)'],
    },
    clinicalPearls: 'CURB-65 criteria (Confusion, Urea >7 mmol/L, RR >=30, BP <90/60, Age >=65) determines outpatient vs inpatient vs ICU admission.',
  },
  asthma_exacerbation: {
    id: 'asthma_exacerbation',
    name: 'Acute Asthma Exacerbation / Status Asthmaticus',
    icd10: 'J45.901',
    category: 'Secondary',
    system: 'pulmonary',
    basePrior: 3.5,
    keywords: ['asthma', 'wheeze', 'wheezing', 'inhaler', 'albuterol', 'tight chest', 'breathless', 'atopy', 'allergy'],
    pathophysiology: 'Chronic airway inflammation exacerbated by viral infection or allergen -> smooth muscle bronchospasm, mucosal edema, and mucous plugging -> severe expiratory airflow limitation and air trapping.',
    supportingFindings: ['Acute episodic dyspnea and chest tightness with audible expiratory wheezing', 'History of atopy or prior asthma attacks', 'Use of accessory muscles of respiration', 'Inability to complete full sentences in one breath'],
    opposingFindings: ['Lobar consolidation on chest exam', 'High persistent fever with purulent sputum'],
    bedsideSignsToTest: ['Peak Expiratory Flow (PEF) measurement (<50% predicted indicates severe)', 'Auscultation for diffuse expiratory wheezes or alarming "silent chest"'],
    recommendedWorkup: {
      initialLabs: ['Pulse Oximetry continuous monitoring', 'Arterial Blood Gas if severe (normal or elevated PaCO2 indicates impending respiratory arrest)'],
      confirmatoryTests: ['Post-bronchodilator spirometry when stabilized'],
    },
    clinicalPearls: 'A "normal" PaCO2 in a severely tachypneic asthmatic is an ominous warning of diaphragmatic fatigue and imminent respiratory failure!',
  },
  copd_exacerbation: {
    id: 'copd_exacerbation',
    name: 'Acute Exacerbation of COPD',
    icd10: 'J44.1',
    category: 'Secondary',
    system: 'pulmonary',
    basePrior: 3.0,
    keywords: ['copd', 'emphysema', 'chronic bronchitis', 'smoking', 'pack years', 'barrel chest', 'pursed lips', 'sputum purulence'],
    pathophysiology: 'Infectious or environmental trigger causing worsening airflow limitation, severe hyperinflation, and ventilation-perfusion mismatch in patients with underlying COPD.',
    supportingFindings: ['Worsening dyspnea, increased sputum volume, and increased sputum purulence (Anthonisen criteria)', 'Prolonged expiratory phase and pursed-lip breathing', 'Heavy smoking history and barrel chest deformity', 'Use of scalene and sternocleidomastoid accessory muscles'],
    opposingFindings: ['Complete absence of smoking history', 'Normal baseline spirometry'],
    bedsideSignsToTest: ['Anthonisen criteria assessment', 'Auscultation for distant breath sounds and diffuse rhonchi'],
    recommendedWorkup: {
      initialLabs: ['Arterial Blood Gas (respiratory acidosis, hypoxemia, hypercapnia)', 'CBC, BMP'],
      imaging: ['Chest X-ray (rule out pneumothorax, pneumonia, or CHF)'],
    },
    clinicalPearls: 'Target oxygen saturation is strictly 88-92% to prevent loss of hypoxic ventilatory drive and catastrophic CO2 retention!',
  },
  spontaneous_pneumothorax: {
    id: 'spontaneous_pneumothorax',
    name: 'Spontaneous Tension / Simple Pneumothorax',
    icd10: 'J93.0',
    category: 'Primary',
    system: 'pulmonary',
    basePrior: 2.0,
    keywords: ['pneumothorax', 'collapsed lung', 'hyperresonance', 'absent breath sounds', 'sudden chest pain', 'tall thin', 'tracheal deviation'],
    pathophysiology: 'Rupture of apical subpleural bleb allowing atmospheric air to enter the pleural space, collapsing the ipsilateral lung and impairing gas exchange.',
    supportingFindings: ['Sudden-onset unilateral sharp pleuritic chest pain and dyspnea', 'Unilateral hyperresonance to percussion', 'Markedly diminished or absent breath sounds on affected side', 'Tension signs: tracheal deviation to contralateral side, hypotension, tachycardia'],
    opposingFindings: ['Bilateral symmetric breath sounds', 'Dullness to percussion over affected hemithorax'],
    bedsideSignsToTest: ['Thoracic percussion (hyperresonance)', 'Tracheal position palpation', 'Point-of-care lung ultrasound (absence of lung sliding and presence of lung point)'],
    recommendedWorkup: {
      initialLabs: ['Arterial Blood Gas'],
      confirmatoryTests: ['Upright inspiratory PA chest radiograph (visceral pleural line)'],
    },
    clinicalPearls: 'Tension pneumothorax is a clinical diagnosis requiring immediate needle decompression prior to obtaining any radiograph!',
  },
  anaphylaxis: {
    id: 'anaphylaxis',
    name: 'Severe Systemic Anaphylaxis',
    icd10: 'T78.0',
    category: 'Primary',
    system: 'systemic',
    basePrior: 1.5,
    keywords: ['anaphylaxis', 'allergic reaction', 'hives', 'urticaria', 'lip swelling', 'tongue swelling', 'stridor', 'epipen', 'throat closing'],
    pathophysiology: 'IgE-mediated mast cell and basophil degranulation releasing histamine, tryptase, and leukotrienes -> systemic vasodilation, laryngeal edema, and bronchospasm.',
    supportingFindings: ['Acute onset within minutes of exposure (food, medication, bee sting)', 'Diffuse urticarial pruritic rash, angioedema of lips/tongue/uvula', 'Inspiratory stridor, wheezing, and hypoxemia', 'Hypotension and syncope'],
    opposingFindings: ['Slow indolent onset over several days', 'Normal mucosal membranes with localized rash only'],
    bedsideSignsToTest: ['Airway inspection for laryngeal/tongue edema', 'Blood pressure and oxygen saturation tracking'],
    recommendedWorkup: {
      initialLabs: ['Serum Tryptase (drawn within 1-2 hours of onset)'],
      confirmatoryTests: ['Clinical diagnosis; immediate treatment must never be delayed for laboratory tests'],
    },
    clinicalPearls: 'Intramuscular Epinephrine (0.3 - 0.5 mg 1:1,000 in anterolateral thigh) is the ONLY first-line life-saving medication! Antihistamines and steroids are strictly secondary.',
  },

  // --- GASTROINTESTINAL & ACUTE ABDOMEN ---
  appendicitis: {
    id: 'appendicitis',
    name: 'Acute Appendicitis',
    icd10: 'K35.80',
    category: 'Primary',
    system: 'gi',
    basePrior: 3.5,
    keywords: ['appendicitis', 'appendix', 'mcburney', 'rlq', 'right lower', 'belly button pain', 'navel', 'migratory pain', 'rovsing', 'anorexia'],
    pathophysiology: 'Obstruction of appendiceal lumen by fecalith or lymphoid hyperplasia -> intraluminal distension, bacterial invasion, transmural ischemia, and parietal peritoneal irritation.',
    supportingFindings: ['Migratory pain starting periumbilically and shifting to Right Lower Quadrant (McBurney point)', 'Anorexia ("hamburger sign")', 'Low-grade fever and leukocytosis', 'Positive Rovsing, Psoas, or Obturator sign'],
    opposingFindings: ['Pain localized primarily in epigastrium with hematemesis', 'Pain improved after meals'],
    bedsideSignsToTest: ['McBurney point tenderness', 'Rovsing sign (RLQ pain on LLQ palpation)', 'Psoas and Obturator signs'],
    recommendedWorkup: {
      initialLabs: ['Complete Blood Count (leukocytosis with left shift)', 'C-Reactive Protein', 'Urinalysis (rule out UTI/nephrolithiasis)', 'Serum beta-hCG in females'],
      confirmatoryTests: ['Graded compression ultrasound (first-line in children/pregnancy)', 'Contrast-enhanced Abdominal CT (gold standard in adults)'],
    },
    clinicalPearls: 'Migratory pain from periumbilicus to RLQ has the highest positive likelihood ratio for appendicitis.',
  },
  cholecystitis: {
    id: 'cholecystitis',
    name: 'Acute Calculous Cholecystitis',
    icd10: 'K81.0',
    category: 'Secondary',
    system: 'gi',
    basePrior: 3.0,
    keywords: ['cholecystitis', 'gallbladder', 'murphy', 'ruq', 'right upper', 'fatty food', 'gallstone', 'shoulder pain', 'boa sign'],
    pathophysiology: 'Cystic duct obstruction by gallstone -> gallbladder distension, chemical irritation, and secondary bacterial infection triggering localized RUQ peritonitis.',
    supportingFindings: ['Severe steady Right Upper Quadrant or epigastric pain radiating to right infrascapular shoulder', 'Pain provoked by fatty/greasy meals', 'Murphy sign positive (inspiratory arrest on RUQ palpation)', 'Fever and leukocytosis'],
    opposingFindings: ['Pain migrating to RLQ', 'Absence of RUQ tenderness'],
    bedsideSignsToTest: ['Murphy sign elicitation', 'Boa sign (hyperesthesia over right scapula)'],
    recommendedWorkup: {
      initialLabs: ['CBC with differential', 'Liver function tests (Alkaline Phosphatase, Bilirubin, ALT/AST)', 'Lipase (rule out gallstone pancreatitis)'],
      confirmatoryTests: ['Right Upper Quadrant Abdominal Ultrasound (gallstones, wall thickening >4mm, pericholecystic fluid, sonographic Murphy sign)'],
    },
    clinicalPearls: 'Sonographic Murphy sign combined with gallstones and gallbladder wall thickening has >95% positive predictive value.',
  },
  pancreatitis: {
    id: 'pancreatitis',
    name: 'Acute Pancreatitis',
    icd10: 'K85.9',
    category: 'Alternative',
    system: 'gi',
    basePrior: 2.5,
    keywords: ['pancreatitis', 'pancreas', 'lipase', 'amylase', 'epigastric back', 'alcohol', 'gallstones', 'cullen', 'grey turner', 'vomiting'],
    pathophysiology: 'Premature intra-acinar activation of trypsinogen to trypsin -> autodigestion of pancreatic parenchyma, vascular damage, and intense retroperitoneal inflammation.',
    supportingFindings: ['Severe constant epigastric pain radiating straight through to the mid-back', 'Pain partially alleviated by sitting forward with knees bent', 'Persistent intractable nausea and vomiting', 'History of gallstones or heavy alcohol use'],
    opposingFindings: ['Colicky intermittent pain with pain-free intervals', 'Normal serum amylase and lipase'],
    bedsideSignsToTest: ['Epigastric palpation', 'Inspection for Cullen sign (periumbilical ecchymosis) and Grey Turner sign (flank ecchymosis)'],
    recommendedWorkup: {
      initialLabs: ['Serum Lipase (diagnostic if >3x upper limit of normal)', 'Serum Amylase', 'CBC, BUN, Creatinine, Calcium (Ranson/BISAP criteria scoring)'],
      confirmatoryTests: ['Abdominal Ultrasound for biliary etiology', 'Contrast-enhanced CT abdomen at 48-72h if severe or non-resolving'],
    },
    clinicalPearls: 'Serum lipase remains elevated longer and is far more sensitive and specific than amylase. Aggressive early isotonic IV hydration saves lives!',
  },
  gerd: {
    id: 'gerd',
    name: 'Gastroesophageal Reflux Disease / Esophageal Spasm',
    icd10: 'K21.9',
    category: 'Alternative',
    system: 'gi',
    basePrior: 4.0,
    keywords: ['gerd', 'heartburn', 'acid reflux', 'antacid', 'meals', 'burping', 'sour taste', 'lying down heartburn'],
    pathophysiology: 'Retrograde flow of gastric acid into esophagus causing mucosal irritation and esophageal smooth muscle spasm, mimicking cardiac angina.',
    supportingFindings: ['Burning retrosternal discomfort provoked by meals, reclining, or bending', 'Relief with antacids', 'Water brash / acidic taste in mouth'],
    opposingFindings: ['Radiation to jaw/arm with diaphoresis', 'Precipitated by heavy exertion and relieved by rest'],
    bedsideSignsToTest: ['Abdominal palpation for epigastric tenderness', 'Trial of liquid antacid at bedside'],
    recommendedWorkup: {
      initialLabs: ['Cardiac rule-out first: ECG and serial troponins must be normal'],
      confirmatoryTests: ['Upper GI Endoscopy (EGD)', '24-hour esophageal pH-impedance monitoring'],
    },
    clinicalPearls: 'Always rule out ACS before diagnosing GERD in any acute chest pain presentation!',
  },
  peptic_ulcer: {
    id: 'peptic_ulcer',
    name: 'Perforated Peptic Ulcer Disease',
    icd10: 'K27.0',
    category: 'Primary',
    system: 'gi',
    basePrior: 2.0,
    keywords: ['ulcer', 'peptic ulcer', 'perforated', 'board-like', 'rigid abdomen', 'peritonitis', 'nsaid', 'melena', 'coffee ground'],
    pathophysiology: 'Full-thickness erosion of gastric or duodenal wall allowing caustic acid and intraluminal contents to escape into peritoneal cavity, causing immediate chemical peritonitis.',
    supportingFindings: ['Sudden catastrophic onset of severe generalized abdominal pain', 'Board-like involuntary abdominal wall rigidity', 'Pneumoperitoneum (free air under diaphragm on upright radiograph)', 'History of chronic NSAID use or H. pylori'],
    opposingFindings: ['Soft compressible non-tender abdomen', 'Pain relieved completely by eating'],
    bedsideSignsToTest: ['Abdominal palpation for board-like rigidity and rebound tenderness', 'Liver dullness percussion (loss of liver dullness indicates free air)'],
    recommendedWorkup: {
      initialLabs: ['CBC, BMP, LFTs, Serum Amylase/Lipase, Type and Screen'],
      confirmatoryTests: ['Upright Chest X-ray (crescent of free subdiaphragmatic air)', 'CT Abdomen with IV contrast'],
    },
    clinicalPearls: 'Erect chest radiograph detects free subdiaphragmatic air in >75% of perforated peptic ulcers; immediate surgical consultation and broad-spectrum antibiotics are mandatory.',
  },
  bowel_obstruction: {
    id: 'bowel_obstruction',
    name: 'Acute Mechanical Small Bowel Obstruction (SBO)',
    icd10: 'K56.60',
    category: 'Primary',
    system: 'gi',
    basePrior: 2.5,
    keywords: ['obstruction', 'bowel obstruction', 'sbo', 'vomiting green', 'bilious', 'distension', 'no gas', 'obstipation', 'adhesions'],
    pathophysiology: 'Physical blockage of small intestinal lumen (frequently due to postoperative adhesions or incarcerated hernias) causing proximal fluid and air accumulation, severe distension, and ischemia.',
    supportingFindings: ['Complete obstipation (inability to pass flatus or stool)', 'High-pitched tinkling bowel sounds or absent sounds', 'Abdominal distension and generalized crampy colicky pain', 'Profuse bilious (green) or feculent vomiting'],
    opposingFindings: ['Normal regular bowel movements and passing gas freely', 'Isolated focal tenderness without distension'],
    bedsideSignsToTest: ['Inspection for surgical laparotomy scars and groin hernias', 'Auscultation for rushes and high-pitched tinkling sounds'],
    recommendedWorkup: {
      initialLabs: ['Electrolytes (hypokalemic hypochloremic metabolic alkalosis from vomiting)', 'Lactate (elevated indicates strangulation/ischemia)'],
      confirmatoryTests: ['Abdominal CT with IV contrast (demonstrating transition point)', 'Supine and erect abdominal radiographs (dilated bowel loops >3cm, air-fluid levels)'],
    },
    clinicalPearls: 'An elevated or rising serum lactate in SBO is a surgical emergency indicating bowel strangulation, gangrene, and imminent perforation!',
  },

  // --- NEUROLOGICAL & MENINGEAL ---
  bacterial_meningitis: {
    id: 'bacterial_meningitis',
    name: 'Acute Bacterial Meningitis',
    icd10: 'G00.9',
    category: 'Primary',
    system: 'neuro',
    basePrior: 2.0,
    keywords: ['meningitis', 'stiff neck', 'nuchal rigidity', 'photophobia', 'kernig', 'brudzinski', 'petechial rash', 'purpura', 'lumbar puncture'],
    pathophysiology: 'Hematogenous seeding of subarachnoid space by encapsulated bacteria (N. meningitidis, S. pneumoniae) -> intense purulent leptomeningeal inflammation, cerebral edema, and elevated intracranial pressure.',
    supportingFindings: ['Classic triad: high fever, severe generalized headache, and nuchal rigidity (stiff neck)', 'Photophobia and altered mental status', 'Petechial or purpuric rash (Meningococcemia)', 'Positive Kernig and Brudzinski signs'],
    opposingFindings: ['Unilateral throbbing headache with normal neck mobility and no fever', 'Normal CSF opening pressure and clear fluid'],
    bedsideSignsToTest: ['Kernig sign (resistance to passive knee extension at 90 deg hip flexion)', 'Brudzinski sign (involuntary hip/knee flexion on passive neck flexion)', 'Jolt accentuation test'],
    recommendedWorkup: {
      initialLabs: ['Emergency Blood Cultures x 2 prior to antibiotics', 'CBC, Coagulation profile, Serum lactate'],
      confirmatoryTests: ['Urgent Lumbar Puncture (CSF analysis: opening pressure, cell count with neutrophilic pleocytosis, low glucose <40% serum, high protein, Gram stain and PCR)'],
      imaging: ['Non-contrast Head CT before LP ONLY IF focal neurological deficit, new seizure, papilledema, or immunocompromise'],
    },
    clinicalPearls: 'Never delay empirical IV antibiotics (Ceftriaxone + Vancomycin +/- Dexamethasone +/- Ampicillin) for a CT scan or lumbar puncture in suspected bacterial meningitis!',
  },
  subarachnoid_hemorrhage: {
    id: 'subarachnoid_hemorrhage',
    name: 'Spontaneous Subarachnoid Hemorrhage (SAH)',
    icd10: 'I60.9',
    category: 'Primary',
    system: 'neuro',
    basePrior: 2.0,
    keywords: ['thunderclap', 'worst headache', 'subarachnoid', 'sah', 'aneurysm', 'sudden headache', 'neck stiffness', 'xanthochromia'],
    pathophysiology: 'Rupture of intracranial saccular (berry) aneurysm -> rapid extravasation of arterial blood into subarachnoid cisterns -> sudden spike in intracranial pressure and chemical meningeal irritation.',
    supportingFindings: ['Sudden explosive onset headache reaching maximal intensity within 1 minute ("thunderclap / worst headache of life")', 'Neck stiffness and photophobia appearing hours later', 'Transient loss of consciousness, nausea, or vomiting', 'Absence of preceding fever'],
    opposingFindings: ['Gradual headache building over several days with high spiking fevers', 'Headache responsive to standard mild analgesics'],
    bedsideSignsToTest: ['Cranial nerve exam (pupil-involving CN III palsy indicates PCOM aneurysm)', 'Fundoscopy for subhyaloid hemorrhages'],
    recommendedWorkup: {
      initialLabs: ['Coagulation profile, Complete Blood Count, Electrolytes'],
      confirmatoryTests: ['Non-contrast Head CT within 6 hours (sensitivity >98%)', 'Lumbar Puncture at 12 hours post-onset for CSF spectrophotometry (xanthochromia) if CT is negative'],
      imaging: ['CT Angiogram (CTA) of intracranial vessels to locate ruptured aneurysm'],
    },
    clinicalPearls: 'Ottawa SAH Rule: Any alert patient >= 15y with acute non-traumatic thunderclap headache requires non-contrast CT. If negative within 6 hours, perform LP for xanthochromia!',
  },
  acute_ischemic_stroke: {
    id: 'acute_ischemic_stroke',
    name: 'Acute Ischemic Stroke (MCA Territory)',
    icd10: 'I63.9',
    category: 'Primary',
    system: 'neuro',
    basePrior: 3.0,
    keywords: ['stroke', 'cva', 'facial droop', 'arm drift', 'speech', 'slurred speech', 'weakness one side', 'hemiparesis', 'aphasia'],
    pathophysiology: 'Thromboembolic occlusion of cerebral artery (frequently Middle Cerebral Artery) producing sudden focal neurological deficit corresponding to ischemic core and penumbra.',
    supportingFindings: ['Unilateral facial drooping, downward arm drift, and slurred speech (FAST / Cincinnati Stroke Scale)', 'Sudden unilateral hemiparesis or hemisensory loss', 'Aphasia (receptive or expressive) or gaze preference'],
    opposingFindings: ['Gradual ascending symmetrical paralysis over weeks', 'Generalized weakness without focal asymmetry'],
    bedsideSignsToTest: ['NIH Stroke Scale (NIHSS) assessment', 'Blood glucose check (must immediately rule out hypoglycemia mimicking stroke)'],
    recommendedWorkup: {
      initialLabs: ['Fingerstick Blood Glucose (immediate)', 'Coagulation markers (PT/INR, aPTT)', 'CBC, BMP, Troponin'],
      confirmatoryTests: ['Immediate Non-contrast Head CT (rule out hemorrhage prior to thrombolysis)', 'CT Perfusion / CT Angiography (detect large vessel occlusion for thrombectomy)'],
    },
    clinicalPearls: 'Time is brain! IV thrombolysis (Alteplase/Tenecteplase) within 4.5 hours and mechanical thrombectomy within up to 24 hours for large vessel occlusions.',
  },
  cluster_headache: {
    id: 'cluster_headache',
    name: 'Acute Cluster Headache Syndrome',
    icd10: 'G44.009',
    category: 'Alternative',
    system: 'neuro',
    basePrior: 1.5,
    keywords: ['cluster headache', 'eye tearing', 'rhinorrhea', 'horner', 'boring eye pain', 'suicide headache', 'unilateral headache', 'restless'],
    pathophysiology: 'Trigeminal autonomic cephalgia characterized by hypothalamic activation triggering severe ipsilateral trigeminal and cranial parasympathetic discharge.',
    supportingFindings: ['Excruciating strictly unilateral periorbital or temporal sharp boring pain lasting 15-180 minutes', 'Ipsilateral autonomic signs: conjunctival injection, lacrimation, nasal congestion/rhinorrhea, eyelid edema, miosis/ptosis', 'Patient is severely restless and pacing (unlike migraine where patient lies quietly in a dark room)'],
    opposingFindings: ['Bilateral neck stiffness with high spiking fevers', 'Diffuse bilateral throbbing pain worsened by lying down'],
    bedsideSignsToTest: ['Pupil symmetry (check for ipsilateral partial Horner syndrome: miosis + ptosis)', 'General behavior (pacing/rocking agitation)'],
    recommendedWorkup: {
      initialLabs: ['Brain MRI with contrast (first episode to exclude pituitary or cavernous sinus lesions)'],
      confirmatoryTests: ['Diagnostic trial of 100% high-flow oxygen via non-rebreather mask (rapid resolution within 15 min confirms diagnosis)'],
    },
    clinicalPearls: '100% High-flow Oxygen at 12-15 L/min via non-rebreather mask aborts acute attacks in >80% of patients within 15 minutes; oral analgesics are ineffective due to rapid attack onset.',
  },
};

// ===========================================================================
// DISCRIMINATOR QUESTION CATALOG WITH LIKELIHOOD RATIOS
// ===========================================================================
export const QUESTION_CATALOG: QuestionDefinition[] = [
  // --- TROPICAL / INFECTION DISCRIMINATORS ---
  {
    id: 'q_cyclical_rigors',
    text: 'Are the fevers accompanied by severe violent shivering chills (rigors) followed by drenching sweats in a cyclical pattern (every 48 or 72 hours)?',
    category: 'History',
    rationale: 'Classic paroxysms correlate with synchronous erythrocytic schizont rupture in Plasmodium species (Malaria).',
    diseaseLikelihoods: {
      malaria: { lrPos: 6.5, lrNeg: 0.12 },
      dengue: { lrPos: 0.3, lrNeg: 1.4 },
      typhoid: { lrPos: 0.4, lrNeg: 1.3 },
      leptospirosis: { lrPos: 0.8, lrNeg: 1.1 },
      acute_viral: { lrPos: 0.2, lrNeg: 1.4 },
      influenza: { lrPos: 0.4, lrNeg: 1.2 },
      bacterial_meningitis: { lrPos: 0.3, lrNeg: 1.2 },
      acute_pyelonephritis: { lrPos: 1.5, lrNeg: 0.9 },
    },
    triggerKeywords: ['fever', 'chills', 'rigors', 'cyclical', 'sweats'],
  },
  {
    id: 'q_retro_orbital_pain',
    text: 'Is there intense pain located directly behind the eyes (retro-orbital) that worsens with eye movement, accompanied by severe muscle and joint aching ("breakbone fever")?',
    category: 'Symptom Character',
    rationale: 'Retro-orbital headache and profound arthralgia/myalgias are cardinal discriminators for Flavivirus infection (Dengue).',
    diseaseLikelihoods: {
      dengue: { lrPos: 7.0, lrNeg: 0.15 },
      malaria: { lrPos: 0.2, lrNeg: 1.5 },
      typhoid: { lrPos: 0.3, lrNeg: 1.3 },
      leptospirosis: { lrPos: 0.5, lrNeg: 1.2 },
      acute_viral: { lrPos: 0.6, lrNeg: 1.2 },
      influenza: { lrPos: 0.8, lrNeg: 1.1 },
      bacterial_meningitis: { lrPos: 0.4, lrNeg: 1.2 },
    },
    triggerKeywords: ['eyes', 'retro-orbital', 'joint pain', 'breakbone', 'body aches'],
  },
  {
    id: 'q_hemolysis_jaundice_dark_urine',
    text: 'Has the patient or family noticed yellowing of the whites of the eyes (scleral icterus) or tea-colored dark brown/black urine?',
    category: 'Physical Exam',
    rationale: 'Hemoglobinuria and hyperbilirubinemia signify active intravascular hemolysis (Blackwater fever in severe Falciparum malaria), Weil disease in Leptospirosis, or biliary obstruction.',
    diseaseLikelihoods: {
      malaria: { lrPos: 5.0, lrNeg: 0.25 },
      leptospirosis: { lrPos: 5.5, lrNeg: 0.25 },
      cholecystitis: { lrPos: 3.5, lrNeg: 0.7 },
      dengue: { lrPos: 0.15, lrNeg: 1.4 },
      typhoid: { lrPos: 0.4, lrNeg: 1.2 },
      acute_viral: { lrPos: 0.1, lrNeg: 1.5 },
    },
    triggerKeywords: ['yellow eyes', 'jaundice', 'dark urine', 'dark pee', 'tea colored'],
  },
  {
    id: 'q_stepladder_faget',
    text: 'Did the fevers begin with a gradual daily step-ladder rise associated with constipation or pea-soup diarrhea, and an unexpectedly slow pulse despite high temperature (Faget sign)?',
    category: 'History',
    rationale: 'Step-ladder pyrexia and sphygmo-thermic dissociation are classic clinical hallmarks of Enteric (Typhoid) Fever (Salmonella Typhi).',
    diseaseLikelihoods: {
      typhoid: { lrPos: 6.5, lrNeg: 0.18 },
      malaria: { lrPos: 0.2, lrNeg: 1.4 },
      dengue: { lrPos: 0.25, lrNeg: 1.3 },
      leptospirosis: { lrPos: 0.4, lrNeg: 1.2 },
      acute_viral: { lrPos: 0.5, lrNeg: 1.2 },
    },
    triggerKeywords: ['step ladder', 'gradual fever', 'slow pulse', 'faget', 'diarrhea', 'constipation'],
  },
  {
    id: 'q_water_contact_calf_pain',
    text: 'Was there any contact with freshwater lakes, rivers, or floodwaters, and is there severe tenderness when squeezing the calf muscles alongside intensely bloodshot red eyes without discharge?',
    category: 'Epidemiology',
    rationale: 'Pathognomonic triad for Leptospirosis: waterborne animal urine exposure, intense calf muscle myalgia, and bilateral conjunctival suffusion.',
    diseaseLikelihoods: {
      leptospirosis: { lrPos: 8.5, lrNeg: 0.1 },
      malaria: { lrPos: 0.2, lrNeg: 1.3 },
      dengue: { lrPos: 0.3, lrNeg: 1.2 },
      typhoid: { lrPos: 0.3, lrNeg: 1.2 },
      acute_viral: { lrPos: 0.3, lrNeg: 1.3 },
    },
    triggerKeywords: ['freshwater', 'flood', 'lake', 'calf pain', 'red eyes', 'conjunctival'],
  },
  {
    id: 'q_petechiae_bleeding',
    text: 'Has the patient noticed any spontaneous bleeding from the gums, nosebleeds (epistaxis), or tiny pinpoint red/purple spots (petechiae) under the skin?',
    category: 'Red Flag',
    rationale: 'Signals consumptive thrombocytopenia and capillary fragility in severe Dengue hemorrhagic fever or meningococcemia.',
    diseaseLikelihoods: {
      dengue: { lrPos: 5.5, lrNeg: 0.3 },
      bacterial_meningitis: { lrPos: 4.5, lrNeg: 0.5 },
      leptospirosis: { lrPos: 3.0, lrNeg: 0.6 },
      malaria: { lrPos: 1.5, lrNeg: 0.8 },
      acute_viral: { lrPos: 0.1, lrNeg: 1.4 },
    },
    triggerKeywords: ['bleeding', 'petechiae', 'nosebleed', 'gums', 'rash', 'spots'],
  },
  {
    id: 'q_malaria_prophylaxis',
    text: 'Did the patient fail to take or omit prescribed antimalarial chemoprophylaxis tablets during and following their travel in the endemic area?',
    category: 'History',
    rationale: 'Omitting chemoprophylaxis in sub-Saharan Africa elevates pre-test probability of Falciparum malaria above 80%.',
    diseaseLikelihoods: {
      malaria: { lrPos: 4.0, lrNeg: 0.3 },
      dengue: { lrPos: 1.0, lrNeg: 1.0 },
      typhoid: { lrPos: 1.0, lrNeg: 1.0 },
      leptospirosis: { lrPos: 1.0, lrNeg: 1.0 },
      acute_viral: { lrPos: 0.7, lrNeg: 1.1 },
    },
    triggerKeywords: ['prophylaxis', 'malaria pills', 'chemoprophylaxis'],
  },
  {
    id: 'q_splenomegaly_fullness',
    text: 'Is there noticeable dragging fullness, pressure, or tenderness located under the left lower ribcage, especially when taking a deep breath in?',
    category: 'Physical Exam',
    rationale: 'Palpable splenomegaly reflects reticuloendothelial clearance of parasitized erythrocytes in Falciparum malaria or Typhoid fever.',
    diseaseLikelihoods: {
      malaria: { lrPos: 4.5, lrNeg: 0.35 },
      typhoid: { lrPos: 3.5, lrNeg: 0.5 },
      dengue: { lrPos: 0.4, lrNeg: 1.3 },
      leptospirosis: { lrPos: 1.5, lrNeg: 0.9 },
      acute_viral: { lrPos: 0.2, lrNeg: 1.4 },
    },
    triggerKeywords: ['spleen', 'left ribcage', 'splenomegaly', 'fullness left side'],
  },
  {
    id: 'q_rose_spots_trunk',
    text: 'Are there faint salmon-pink blanching macules (rose spots) visible on the anterior chest or abdomen?',
    category: 'Physical Exam',
    rationale: 'Rose spots occur in 30% of typhoid patients at the end of the first week of infection.',
    diseaseLikelihoods: {
      typhoid: { lrPos: 7.5, lrNeg: 0.4 },
      malaria: { lrPos: 0.1, lrNeg: 1.3 },
      dengue: { lrPos: 0.2, lrNeg: 1.2 },
      acute_viral: { lrPos: 0.2, lrNeg: 1.2 },
    },
    triggerKeywords: ['rose spots', 'salmon spots', 'pink spots trunk'],
  },
  {
    id: 'q_tourniquet_hess_test',
    text: 'Did blood pressure cuff inflation on the arm provoke more than 10-20 petechial spots per square inch (positive Tourniquet / Hess test)?',
    category: 'Physical Exam',
    rationale: 'A positive tourniquet test confirms capillary fragility and impending plasma leakage in Dengue fever.',
    diseaseLikelihoods: {
      dengue: { lrPos: 6.5, lrNeg: 0.2 },
      malaria: { lrPos: 0.2, lrNeg: 1.3 },
      acute_viral: { lrPos: 0.1, lrNeg: 1.4 },
    },
    triggerKeywords: ['tourniquet test', 'hess test', 'blood pressure cuff spots'],
  },

  // --- CARDIOVASCULAR & HEMODYNAMIC DISCRIMINATORS ---
  {
    id: 'q_crushing_exertional_chest_pain',
    text: 'Is the chest pain a heavy crushing pressure or squeezing tightness centered beneath the breastbone, radiating into the left arm or lower jaw, provoked by exertion or emotional stress?',
    category: 'Symptom Character',
    rationale: 'Classic presentation of acute transmural epicardial coronary occlusion (STEMI/NSTEMI).',
    diseaseLikelihoods: {
      stemi: { lrPos: 6.0, lrNeg: 0.15 },
      unstable_angina: { lrPos: 5.0, lrNeg: 0.2 },
      aortic_dissection: { lrPos: 0.8, lrNeg: 1.1 },
      pulmonary_embolism: { lrPos: 0.4, lrNeg: 1.3 },
      pericarditis: { lrPos: 0.3, lrNeg: 1.4 },
      gerd: { lrPos: 0.6, lrNeg: 1.2 },
    },
    triggerKeywords: ['crushing', 'squeezing', 'substernal', 'pressure', 'left arm', 'jaw'],
  },
  {
    id: 'q_tearing_back_dissection',
    text: 'Was the chest pain instantaneous, catastrophic, and tearing or ripping in quality, radiating straight through to the back between the shoulder blades?',
    category: 'Symptom Character',
    rationale: 'Pathognomonic description for Acute Stanford Type A/B Aortic Dissection.',
    diseaseLikelihoods: {
      aortic_dissection: { lrPos: 9.0, lrNeg: 0.08 },
      stemi: { lrPos: 0.3, lrNeg: 1.4 },
      pulmonary_embolism: { lrPos: 0.4, lrNeg: 1.2 },
      pericarditis: { lrPos: 0.2, lrNeg: 1.3 },
      gerd: { lrPos: 0.1, lrNeg: 1.4 },
    },
    triggerKeywords: ['tearing', 'ripping', 'scapular', 'interscapular', 'back pain'],
  },
  {
    id: 'q_pleuritic_dyspnea_pe',
    text: 'Did the shortness of breath begin suddenly accompanied by sharp stabbing chest pain that catches on deep inspiration and a feeling of impending doom?',
    category: 'Symptom Character',
    rationale: 'Cardinal features of acute ventilation-perfusion mismatch from Pulmonary Embolism.',
    diseaseLikelihoods: {
      pulmonary_embolism: { lrPos: 6.5, lrNeg: 0.15 },
      spontaneous_pneumothorax: { lrPos: 5.0, lrNeg: 0.3 },
      pneumonia: { lrPos: 2.5, lrNeg: 0.6 },
      pericarditis: { lrPos: 2.0, lrNeg: 0.8 },
      stemi: { lrPos: 0.3, lrNeg: 1.3 },
    },
    triggerKeywords: ['pleuritic', 'deep breath catch', 'sharp chest', 'sudden sob', 'inspiration'],
  },
  {
    id: 'q_positional_leaning_forward',
    text: 'Is the chest pain significantly relieved by sitting upright and leaning forward, and made sharply worse when lying flat on the back?',
    category: 'Symptom Character',
    rationale: 'Positional relief with forward flexion is the classic hallmark of Acute Pericarditis.',
    diseaseLikelihoods: {
      pericarditis: { lrPos: 8.0, lrNeg: 0.1 },
      pancreatitis: { lrPos: 3.0, lrNeg: 0.6 },
      stemi: { lrPos: 0.15, lrNeg: 1.4 },
      aortic_dissection: { lrPos: 0.2, lrNeg: 1.3 },
      gerd: { lrPos: 0.4, lrNeg: 1.2 },
    },
    triggerKeywords: ['lean forward', 'sitting forward', 'lying flat worse', 'supine worse'],
  },
  {
    id: 'q_pulse_bp_asymmetry',
    text: 'Is there a noticeable difference in pulse strength or a blood pressure discrepancy greater than 20 mmHg between the right and left arms?',
    category: 'Physical Exam',
    rationale: 'Asymmetric upper extremity pulses or BP gradient indicates proximal arch involvement in Type A Aortic Dissection.',
    diseaseLikelihoods: {
      aortic_dissection: { lrPos: 7.5, lrNeg: 0.2 },
      stemi: { lrPos: 0.3, lrNeg: 1.2 },
      pulmonary_embolism: { lrPos: 0.2, lrNeg: 1.2 },
    },
    triggerKeywords: ['pulse deficit', 'bp difference', 'asymmetric blood pressure', 'arm discrepancy'],
  },
  {
    id: 'q_orthopnea_pnd',
    text: 'Does the patient experience severe breathlessness when lying flat (orthopnea requiring 2+ pillows) or wake up gasping for air 1-2 hours after falling asleep (PND)?',
    category: 'History',
    rationale: 'Hallmark of elevated left ventricular filling pressures and pulmonary venous congestion in Acute Heart Failure.',
    diseaseLikelihoods: {
      acute_heart_failure: { lrPos: 7.5, lrNeg: 0.15 },
      copd_exacerbation: { lrPos: 1.8, lrNeg: 0.8 },
      asthma_exacerbation: { lrPos: 1.2, lrNeg: 0.9 },
      pneumonia: { lrPos: 0.6, lrNeg: 1.2 },
      pulmonary_embolism: { lrPos: 0.5, lrNeg: 1.2 },
    },
    triggerKeywords: ['orthopnea', 'pnd', 'pillows to sleep', 'wake up gasping'],
  },
  {
    id: 'q_calf_asymmetry_dvt',
    text: 'Is one calf noticeably swollen (greater than 3 cm difference), red, warm, or tender to palpation compared to the other?',
    category: 'Physical Exam',
    rationale: 'Unilateral lower extremity edema signals Deep Vein Thrombosis, the primary thromboembolic source for PE.',
    diseaseLikelihoods: {
      pulmonary_embolism: { lrPos: 6.5, lrNeg: 0.3 },
      acute_heart_failure: { lrPos: 0.3, lrNeg: 1.4 },
      stemi: { lrPos: 0.2, lrNeg: 1.3 },
    },
    triggerKeywords: ['one leg swollen', 'calf swelling', 'dvt', 'unilateral leg'],
  },
  {
    id: 'q_sublingual_nitroglycerin_relief',
    text: 'Does the chest tightness reliably vanish within 2 to 5 minutes after taking a sublingual nitroglycerin tablet or spray?',
    category: 'History',
    rationale: 'Nitroglycerin venodilation rapidly resolves ischemic myocardium demand in angina, whereas dissection or PE do not respond.',
    diseaseLikelihoods: {
      unstable_angina: { lrPos: 5.5, lrNeg: 0.3 },
      stemi: { lrPos: 2.0, lrNeg: 0.8 },
      gerd: { lrPos: 2.0, lrNeg: 0.8 },
      aortic_dissection: { lrPos: 0.1, lrNeg: 1.5 },
      pulmonary_embolism: { lrPos: 0.1, lrNeg: 1.5 },
    },
    triggerKeywords: ['nitroglycerin', 'nitro spray', 'sublingual tablet relief'],
  },

  // --- GASTROINTESTINAL & ACUTE ABDOMEN DISCRIMINATORS ---
  {
    id: 'q_migratory_rlq_pain',
    text: 'Did the abdominal pain start around the navel (belly button) before shifting down to the lower right side (McBurney point) with loss of appetite?',
    category: 'Symptom Character',
    rationale: 'Visceral periumbilical pain shifting to somatic parietal RLQ tenderness is pathognomonic for Acute Appendicitis.',
    diseaseLikelihoods: {
      appendicitis: { lrPos: 8.5, lrNeg: 0.1 },
      cholecystitis: { lrPos: 0.2, lrNeg: 1.4 },
      pancreatitis: { lrPos: 0.2, lrNeg: 1.4 },
      peptic_ulcer: { lrPos: 0.3, lrNeg: 1.3 },
      bowel_obstruction: { lrPos: 0.5, lrNeg: 1.2 },
    },
    triggerKeywords: ['navel', 'belly button', 'rlq', 'right lower', 'migratory pain', 'mcburney'],
  },
  {
    id: 'q_murphy_ruq_gallbladder',
    text: 'Is the pain centered in the upper right abdomen under the ribcage, triggered by eating fatty meals, causing a sharp catch in breathing when pressing there (Murphy sign)?',
    category: 'Physical Exam',
    rationale: 'Inspiratory arrest on deep RUQ subcostal palpation indicates acute gallbladder inflammation (Cholecystitis).',
    diseaseLikelihoods: {
      cholecystitis: { lrPos: 8.0, lrNeg: 0.12 },
      pancreatitis: { lrPos: 2.0, lrNeg: 0.8 },
      appendicitis: { lrPos: 0.15, lrNeg: 1.4 },
      gerd: { lrPos: 0.3, lrNeg: 1.3 },
      peptic_ulcer: { lrPos: 0.4, lrNeg: 1.2 },
    },
    triggerKeywords: ['murphy', 'ruq', 'right upper', 'gallbladder', 'fatty food'],
  },
  {
    id: 'q_epigastric_boring_back_pancreatitis',
    text: 'Is there agonizing, constant boring pain deep in the upper stomach that shoots straight through into the mid-back, accompanied by persistent vomiting?',
    category: 'Symptom Character',
    rationale: 'Retroperitoneal chemical inflammation in Acute Pancreatitis characteristically radiates straight through to the back.',
    diseaseLikelihoods: {
      pancreatitis: { lrPos: 7.5, lrNeg: 0.15 },
      peptic_ulcer: { lrPos: 3.0, lrNeg: 0.7 },
      cholecystitis: { lrPos: 2.0, lrNeg: 0.8 },
      aortic_dissection: { lrPos: 1.5, lrNeg: 0.9 },
      appendicitis: { lrPos: 0.15, lrNeg: 1.4 },
    },
    triggerKeywords: ['boring pain', 'epigastric back', 'shoots to back', 'vomiting', 'pancreas'],
  },
  {
    id: 'q_rigid_board_abdomen_perforated',
    text: 'Is the patient\'s abdomen rock-hard, board-like, and involuntarily rigid with extreme tenderness to any gentle touch or coughing?',
    category: 'Red Flag',
    rationale: 'Board-like involuntary rigidity signals generalized chemical peritonitis from visceral perforation (Perforated Peptic Ulcer).',
    diseaseLikelihoods: {
      peptic_ulcer: { lrPos: 9.0, lrNeg: 0.1 },
      appendicitis: { lrPos: 2.5, lrNeg: 0.7 },
      pancreatitis: { lrPos: 2.0, lrNeg: 0.8 },
      bowel_obstruction: { lrPos: 2.0, lrNeg: 0.8 },
      gerd: { lrPos: 0.05, lrNeg: 1.5 },
    },
    triggerKeywords: ['rigid abdomen', 'board-like', 'rock hard stomach', 'peritonitis'],
  },
  {
    id: 'q_obstipation_bilious_vomiting',
    text: 'Has the patient completely stopped passing gas or stool (obstipation) alongside profuse dark green (bilious) vomiting and progressive abdominal swelling?',
    category: 'Red Flag',
    rationale: 'Obstipation and bilious emesis are cardinal signs of acute mechanical Small Bowel Obstruction (SBO).',
    diseaseLikelihoods: {
      bowel_obstruction: { lrPos: 8.5, lrNeg: 0.12 },
      appendicitis: { lrPos: 0.5, lrNeg: 1.2 },
      pancreatitis: { lrPos: 1.5, lrNeg: 0.9 },
      peptic_ulcer: { lrPos: 1.0, lrNeg: 1.0 },
      cholecystitis: { lrPos: 0.4, lrNeg: 1.2 },
    },
    triggerKeywords: ['obstipation', 'no gas', 'no stool', 'green vomiting', 'bilious', 'distended'],
  },
  {
    id: 'q_postprandial_antacid_relief',
    text: 'Is the discomfort predominantly a burning sensation that worsens after heavy meals or lying flat, and is rapidly alleviated by drinking milk or liquid antacids?',
    category: 'Symptom Character',
    rationale: 'Acid-peptic mucosal irritation relieved by acid neutralization discriminates GERD from coronary or pulmonary ischemia.',
    diseaseLikelihoods: {
      gerd: { lrPos: 6.5, lrNeg: 0.2 },
      peptic_ulcer: { lrPos: 3.5, lrNeg: 0.5 },
      stemi: { lrPos: 0.2, lrNeg: 1.3 },
      pericarditis: { lrPos: 0.2, lrNeg: 1.3 },
      cholecystitis: { lrPos: 0.4, lrNeg: 1.2 },
    },
    triggerKeywords: ['heartburn', 'antacid', 'after meals', 'milk relief', 'acid taste'],
  },

  // --- NEUROLOGICAL & MENINGEAL DISCRIMINATORS ---
  {
    id: 'q_nuchal_rigidity_meningitis',
    text: 'Is there intense stiffness or pain in the back of the neck when trying to touch the chin to the chest, accompanied by severe aversion to bright lights (photophobia)?',
    category: 'Physical Exam',
    rationale: 'Nuchal rigidity and photophobia signify acute purulent leptomeningeal stretch and inflammation in Bacterial Meningitis.',
    diseaseLikelihoods: {
      bacterial_meningitis: { lrPos: 8.5, lrNeg: 0.1 },
      subarachnoid_hemorrhage: { lrPos: 5.0, lrNeg: 0.3 },
      malaria: { lrPos: 0.4, lrNeg: 1.2 },
      typhoid: { lrPos: 0.3, lrNeg: 1.2 },
      acute_viral: { lrPos: 0.2, lrNeg: 1.3 },
      cluster_headache: { lrPos: 0.1, lrNeg: 1.4 },
    },
    triggerKeywords: ['stiff neck', 'chin to chest', 'photophobia', 'bright lights', 'nuchal rigidity'],
  },
  {
    id: 'q_thunderclap_explosive_sah',
    text: 'Did the headache strike like an explosive thunderclap, reaching maximum 10/10 catastrophic agony within 60 seconds ("worst headache of life")?',
    category: 'Red Flag',
    rationale: 'Instantaneous maximal intensity (<1 min) is the pathognomonic hallmark of aneurysmal Subarachnoid Hemorrhage.',
    diseaseLikelihoods: {
      subarachnoid_hemorrhage: { lrPos: 9.5, lrNeg: 0.05 },
      cluster_headache: { lrPos: 3.0, lrNeg: 0.6 },
      bacterial_meningitis: { lrPos: 0.3, lrNeg: 1.4 },
      malaria: { lrPos: 0.1, lrNeg: 1.4 },
      acute_viral: { lrPos: 0.05, lrNeg: 1.5 },
    },
    triggerKeywords: ['thunderclap', 'worst headache', 'instant agony', '60 seconds', 'explosive headache'],
  },
  {
    id: 'q_facial_arm_speech_stroke',
    text: 'Is there sudden unilateral facial drooping, downward arm drift on raising both arms, or sudden slurred/incomprehensible speech (FAST / Cincinnati Stroke Signs)?',
    category: 'Red Flag',
    rationale: 'The Cincinnati Prehospital Stroke Scale has >88% sensitivity for acute ischemic territorial stroke.',
    diseaseLikelihoods: {
      acute_ischemic_stroke: { lrPos: 9.5, lrNeg: 0.05 },
      subarachnoid_hemorrhage: { lrPos: 1.5, lrNeg: 0.9 },
      bacterial_meningitis: { lrPos: 0.8, lrNeg: 1.1 },
      cluster_headache: { lrPos: 0.1, lrNeg: 1.4 },
    },
    triggerKeywords: ['facial drooping', 'arm drift', 'slurred speech', 'stroke', 'fast sign'],
  },
  {
    id: 'q_cluster_autonomic_eye_tearing',
    text: 'Is the headache strictly one-sided around the temple/eye, causing bloodshot eye redness, heavy tearing (lacrimation), a runny nostril, and severe restlessness (pacing)?',
    category: 'Symptom Character',
    rationale: 'Unilateral trigeminal autonomic cephalgia with restlessness is pathognomonic for Cluster Headache.',
    diseaseLikelihoods: {
      cluster_headache: { lrPos: 9.0, lrNeg: 0.08 },
      subarachnoid_hemorrhage: { lrPos: 0.2, lrNeg: 1.3 },
      bacterial_meningitis: { lrPos: 0.1, lrNeg: 1.4 },
    },
    triggerKeywords: ['cluster headache', 'eye tearing', 'runny nose', 'pacing', 'one-sided eye pain'],
  },

  // --- RESPIRATORY & SYSTEMIC DISCRIMINATORS ---
  {
    id: 'q_productive_purulent_cough_pneumonia',
    text: 'Is the patient coughing up thick, colored (yellow, green, or rust-colored) sputum, accompanied by focal chest crackles or localized bronchial breath sounds?',
    category: 'Physical Exam',
    rationale: 'Exudative alveolar consolidation produces purulent/rust sputum and localized crackles in Community-Acquired Pneumonia.',
    diseaseLikelihoods: {
      pneumonia: { lrPos: 7.5, lrNeg: 0.15 },
      copd_exacerbation: { lrPos: 3.5, lrNeg: 0.5 },
      tuberculosis: { lrPos: 3.0, lrNeg: 0.6 },
      asthma_exacerbation: { lrPos: 0.4, lrNeg: 1.3 },
      pulmonary_embolism: { lrPos: 0.3, lrNeg: 1.3 },
      acute_heart_failure: { lrPos: 0.5, lrNeg: 1.2 },
    },
    triggerKeywords: ['yellow sputum', 'green sputum', 'rust sputum', 'productive cough', 'crackles'],
  },
  {
    id: 'q_expiratory_wheezing_asthma',
    text: 'Is there audible musical whistling or wheezing predominantly when breathing OUT (expiratory phase), with a past history of allergies, eczema, or asthma inhaler use?',
    category: 'History',
    rationale: 'Expiratory wheezing and personal atopic diathesis indicate reversible bronchospastic airway disease.',
    diseaseLikelihoods: {
      asthma_exacerbation: { lrPos: 7.5, lrNeg: 0.18 },
      copd_exacerbation: { lrPos: 4.5, lrNeg: 0.4 },
      anaphylaxis: { lrPos: 4.0, lrNeg: 0.5 },
      acute_heart_failure: { lrPos: 1.5, lrNeg: 0.9 },
      pneumonia: { lrPos: 0.4, lrNeg: 1.3 },
    },
    triggerKeywords: ['wheeze', 'whistling', 'expiratory', 'atopy', 'inhaler', 'asthma'],
  },
  {
    id: 'q_hyperresonance_unilateral_pneumothorax',
    text: 'Did sudden sharp chest pain develop with hollow drum-like tapping (hyperresonance) and completely absent breath sounds over one lung field?',
    category: 'Physical Exam',
    rationale: 'Unilateral hyperresonance with absent vesicular breath sounds indicates atmospheric air in the pleural space (Pneumothorax).',
    diseaseLikelihoods: {
      spontaneous_pneumothorax: { lrPos: 9.0, lrNeg: 0.08 },
      pulmonary_embolism: { lrPos: 0.3, lrNeg: 1.3 },
      pneumonia: { lrPos: 0.15, lrNeg: 1.4 },
      copd_exacerbation: { lrPos: 0.5, lrNeg: 1.2 },
    },
    triggerKeywords: ['hyperresonance', 'drum-like', 'absent breath sounds', 'pneumothorax'],
  },
  {
    id: 'q_anaphylaxis_hives_stridor',
    text: 'Within minutes of taking a drug, food, or insect sting, did diffuse itchy hives erupt alongside swelling of the lips/tongue, difficulty swallowing, or high-pitched inspiratory crowing (stridor)?',
    category: 'Red Flag',
    rationale: 'Acute multi-system IgE-mediated degranulation with airway compromise indicates Anaphylaxis requiring emergent Epinephrine.',
    diseaseLikelihoods: {
      anaphylaxis: { lrPos: 9.5, lrNeg: 0.05 },
      asthma_exacerbation: { lrPos: 1.5, lrNeg: 0.9 },
      acute_viral: { lrPos: 0.1, lrNeg: 1.4 },
    },
    triggerKeywords: ['anaphylaxis', 'hives', 'urticaria', 'lip swelling', 'tongue swelling', 'stridor'],
  },
  {
    id: 'q_cva_flank_tenderness_pyelonephritis',
    text: 'Is there intense focal ache or tenderness in the flank / costovertebral angle when tapping the back over the kidneys, accompanied by burning painful urination (dysuria)?',
    category: 'Physical Exam',
    rationale: 'Costovertebral angle (CVA) percussion tenderness combined with pyuria confirms acute upper urinary tract infection (Pyelonephritis).',
    diseaseLikelihoods: {
      acute_pyelonephritis: { lrPos: 8.5, lrNeg: 0.1 },
      appendicitis: { lrPos: 0.3, lrNeg: 1.3 },
      cholecystitis: { lrPos: 0.3, lrNeg: 1.3 },
      malaria: { lrPos: 0.3, lrNeg: 1.3 },
      acute_viral: { lrPos: 0.2, lrNeg: 1.4 },
    },
    triggerKeywords: ['flank pain', 'cva tenderness', 'kidney tenderness', 'burning urination', 'dysuria'],
  },
  {
    id: 'q_tuberculosis_night_sweats_hemoptysis',
    text: 'Has the patient had chronic daily fevers with drenching night sweats that soak bedsheets, unintentional weight loss, and coughing up blood-streaked sputum for over 3 weeks?',
    category: 'History',
    rationale: 'Classic chronic constitutional wasting triad with hemoptysis points strongly to active cavitary Pulmonary Tuberculosis.',
    diseaseLikelihoods: {
      tuberculosis: { lrPos: 8.5, lrNeg: 0.12 },
      pneumonia: { lrPos: 1.8, lrNeg: 0.8 },
      pulmonary_embolism: { lrPos: 1.2, lrNeg: 0.9 },
      acute_viral: { lrPos: 0.1, lrNeg: 1.4 },
    },
    triggerKeywords: ['night sweats', 'weight loss', 'cough 3 weeks', 'hemoptysis', 'tuberculosis'],
  },
  {
    id: 'q_sepsis_qsofa_hypoperfusion',
    text: 'Does the patient exhibit altered mental confusion, respiratory rate >= 22 breaths/min, systolic blood pressure <= 100 mmHg, or sluggish capillary refill (>3 seconds)?',
    category: 'Red Flag',
    rationale: 'Positive qSOFA (>=2 criteria) identifies patients with suspected infection at high risk of in-hospital mortality from Sepsis.',
    diseaseLikelihoods: {
      sepsis: { lrPos: 7.5, lrNeg: 0.2 },
      bacterial_meningitis: { lrPos: 3.5, lrNeg: 0.5 },
      pneumonia: { lrPos: 3.0, lrNeg: 0.6 },
      malaria: { lrPos: 2.5, lrNeg: 0.7 },
      acute_viral: { lrPos: 0.1, lrNeg: 1.4 },
    },
    triggerKeywords: ['qsofa', 'confusion', 'low blood pressure', 'rapid breathing', 'capillary refill', 'septic'],
  },
];

// ===========================================================================
// DYNAMIC EPIDEMIOLOGICAL PRIOR SEEDING (Over ALL 28 Conditions)
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

    // 2. Travel History Priors
    const hasTravel = patient.travelHistory &&
      patient.travelHistory.trim() !== '' &&
      !patient.travelHistory.toLowerCase().includes('no travel') &&
      !patient.travelHistory.toLowerCase().includes('none');

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
      if (['malaria', 'dengue', 'typhoid', 'leptospirosis', 'acute_viral', 'influenza', 'pneumonia', 'bacterial_meningitis', 'acute_pyelonephritis', 'sepsis', 'appendicitis', 'cholecystitis'].includes(id)) {
        score += 6.0;
      } else if (['gerd', 'cluster_headache', 'spontaneous_pneumothorax'].includes(id)) {
        // Fever strongly decreases purely non-infectious conditions
        score *= 0.4;
      }
    }

    // 4. Age-specific risk weighting
    if (patient.age >= 55) {
      if (['stemi', 'unstable_angina', 'aortic_dissection', 'acute_heart_failure', 'acute_ischemic_stroke', 'copd_exacerbation'].includes(id)) {
        score += 4.0;
      }
    } else if (patient.age < 30) {
      if (['appendicitis', 'bacterial_meningitis', 'spontaneous_pneumothorax', 'anaphylaxis'].includes(id)) {
        score += 4.0;
      }
    }

    priors[id] = Math.max(0.2, score);
  }

  // Normalize across all diseases so sum = 100%
  normalizeProbabilities(priors, diseaseIds);
  return priors;
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

  // 1. Initialize prior probabilities across ALL 28 diseases
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
    akinatorThought = `Turn 1: Initial differential priors seeded across 28 clinical conditions. Top cluster: ${sortedCandidates.slice(0, 3).map(c => c.profile.name.split(' ')[0]).join(' vs ')}. Active inquiry will dynamically adapt until >=95% certainty is attained.`;
  } else if (pivotedFrom) {
    akinatorThought = `Turn ${turn}: Diagnostic pivot detected! Previous lead ${pivotedFrom} refuted by patient response; ${topCandidate.profile.name} (${topConfidence}%) dynamically elevated to primary differential.`;
  } else {
    akinatorThought = `Turn ${turn}: Bayesian update applied across all 28 conditions. Leading candidate: ${topCandidate.profile.name} (${topConfidence}%). Active inquiry continuing until >=95% certainty threshold is met...`;
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
