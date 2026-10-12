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
// DISEASE PROFILES & KNOWLEDGE BASE
// ===========================================================================
export const CLINICAL_DISEASES: Record<string, DiseaseProfile> = {
  // --- TROPICAL & INFECTIOUS ---
  malaria: {
    id: 'malaria',
    name: 'Plasmodium falciparum Malaria',
    icd10: 'B50.9',
    category: 'Primary',
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
    name: 'Acute Viral Syndrome / Systemic Inflammatory Process',
    icd10: 'B34.9',
    category: 'Alternative',
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

  // --- CARDIOVASCULAR ---
  stemi: {
    id: 'stemi',
    name: 'Acute ST-Elevation Myocardial Infarction (STEMI)',
    icd10: 'I21.0',
    category: 'Primary',
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
  aortic_dissection: {
    id: 'aortic_dissection',
    name: 'Acute Stanford Type A Aortic Dissection',
    icd10: 'I71.01',
    category: 'Primary',
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
  gerd: {
    id: 'gerd',
    name: 'Gastroesophageal Reflux Disease / Esophageal Spasm',
    icd10: 'K21.9',
    category: 'Alternative',
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

  // --- GASTROINTESTINAL & SURGICAL ABDOMEN ---
  appendicitis: {
    id: 'appendicitis',
    name: 'Acute Appendicitis',
    icd10: 'K35.80',
    category: 'Primary',
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

  // --- NEUROLOGICAL ---
  bacterial_meningitis: {
    id: 'bacterial_meningitis',
    name: 'Acute Bacterial Meningitis',
    icd10: 'G00.9',
    category: 'Primary',
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

  // --- RESPIRATORY ---
  pneumonia: {
    id: 'pneumonia',
    name: 'Severe Community-Acquired Pneumonia (CAP)',
    icd10: 'J18.9',
    category: 'Primary',
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
    name: 'Acute Exacerbation of Asthma / Status Asthmaticus',
    icd10: 'J45.901',
    category: 'Secondary',
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
};

// ===========================================================================
// DISCRIMINATOR QUESTION CATALOG WITH LIKELIHOOD RATIOS
// ===========================================================================
export const QUESTION_CATALOG: QuestionDefinition[] = [
  // --- TROPICAL / FEVER QUESTIONS ---
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
    },
    triggerKeywords: ['eyes', 'retro-orbital', 'joint pain', 'breakbone', 'body aches'],
  },
  {
    id: 'q_hemolysis_jaundice_dark_urine',
    text: 'Has the patient or family noticed yellowing of the whites of the eyes (scleral icterus) or tea-colored dark brown/black urine?',
    category: 'Physical Exam',
    rationale: 'Hemoglobinuria and hyperbilirubinemia signify active intravascular hemolysis (Blackwater fever in severe Falciparum malaria) or hepatic dysfunction in Leptospirosis.',
    diseaseLikelihoods: {
      malaria: { lrPos: 4.8, lrNeg: 0.3 },
      leptospirosis: { lrPos: 5.5, lrNeg: 0.25 },
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
      typhoid: { lrPos: 6.0, lrNeg: 0.2 },
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
      leptospirosis: { lrPos: 8.0, lrNeg: 0.1 },
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
    rationale: 'Signals consumptive thrombocytopenia and capillary fragility in severe Dengue hemorrhagic fever or disseminated microvascular injury.',
    diseaseLikelihoods: {
      dengue: { lrPos: 5.5, lrNeg: 0.3 },
      leptospirosis: { lrPos: 3.2, lrNeg: 0.6 },
      malaria: { lrPos: 1.8, lrNeg: 0.8 },
      typhoid: { lrPos: 0.6, lrNeg: 1.1 },
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
      malaria: { lrPos: 3.5, lrNeg: 0.35 },
      dengue: { lrPos: 1.0, lrNeg: 1.0 },
      typhoid: { lrPos: 1.0, lrNeg: 1.0 },
      leptospirosis: { lrPos: 1.0, lrNeg: 1.0 },
      acute_viral: { lrPos: 0.8, lrNeg: 1.1 },
    },
    triggerKeywords: ['prophylaxis', 'malaria pills', 'chemoprophylaxis'],
  },
  {
    id: 'q_splenomegaly_fullness',
    text: 'Is there noticeable dragging fullness, pressure, or tenderness located under the left lower ribcage, especially when taking a deep breath in?',
    category: 'Physical Exam',
    rationale: 'Palpable splenomegaly reflects reticuloendothelial clearance of parasitized erythrocytes in Falciparum malaria or Typhoid fever.',
    diseaseLikelihoods: {
      malaria: { lrPos: 4.0, lrNeg: 0.35 },
      typhoid: { lrPos: 3.2, lrNeg: 0.5 },
      dengue: { lrPos: 0.4, lrNeg: 1.3 },
      leptospirosis: { lrPos: 1.5, lrNeg: 0.9 },
      acute_viral: { lrPos: 0.2, lrNeg: 1.4 },
    },
    triggerKeywords: ['spleen', 'left ribcage', 'splenomegaly', 'fullness left side'],
  },

  // --- CARDIOVASCULAR QUESTIONS ---
  {
    id: 'q_crushing_exertional_chest_pain',
    text: 'Is the chest pain a heavy crushing pressure or squeezing tightness centered beneath the breastbone, radiating into the left arm or lower jaw, provoked by exertion or emotional stress?',
    category: 'Symptom Character',
    rationale: 'Classic presentation of acute transmural epicardial coronary occlusion (STEMI/NSTEMI).',
    diseaseLikelihoods: {
      stemi: { lrPos: 6.0, lrNeg: 0.15 },
      aortic_dissection: { lrPos: 0.8, lrNeg: 1.1 },
      pulmonary_embolism: { lrPos: 0.4, lrNeg: 1.3 },
      pericarditis: { lrPos: 0.3, lrNeg: 1.4 },
      gerd: { lrPos: 0.6, lrNeg: 1.2 },
    },
    triggerKeywords: ['crushing', 'pressure', 'squeezing', 'left arm', 'jaw', 'angina'],
  },
  {
    id: 'q_tearing_back_dissection',
    text: 'Was the chest pain instantaneous, catastrophic, and tearing or ripping in quality, radiating straight through to the upper back between the shoulder blades?',
    category: 'Symptom Character',
    rationale: 'Catastrophic tearing interscapular pain has the highest likelihood ratio for Acute Stanford Type A Aortic Dissection.',
    diseaseLikelihoods: {
      aortic_dissection: { lrPos: 8.5, lrNeg: 0.1 },
      stemi: { lrPos: 0.2, lrNeg: 1.4 },
      pulmonary_embolism: { lrPos: 0.4, lrNeg: 1.2 },
      pericarditis: { lrPos: 0.2, lrNeg: 1.3 },
      gerd: { lrPos: 0.1, lrNeg: 1.4 },
    },
    triggerKeywords: ['tearing', 'ripping', 'interscapular', 'back', 'dissection'],
  },
  {
    id: 'q_pleuritic_dyspnea_pe',
    text: 'Did the shortness of breath begin suddenly accompanied by sharp knife-like chest pain that sharply catches on taking a deep breath (pleuritic pain), or is there swelling in one calf?',
    category: 'Symptom Character',
    rationale: 'Pleuritic pain, acute dyspnea, and asymmetric calf swelling are high-yield indicators of Acute Pulmonary Embolism and DVT.',
    diseaseLikelihoods: {
      pulmonary_embolism: { lrPos: 6.5, lrNeg: 0.15 },
      pneumonia: { lrPos: 2.5, lrNeg: 0.6 },
      pericarditis: { lrPos: 2.0, lrNeg: 0.7 },
      stemi: { lrPos: 0.2, lrNeg: 1.4 },
      aortic_dissection: { lrPos: 0.3, lrNeg: 1.3 },
      gerd: { lrPos: 0.1, lrNeg: 1.4 },
    },
    triggerKeywords: ['deep breath', 'pleuritic', 'sharp breath', 'calf swelling', 'pulmonary embolism'],
  },
  {
    id: 'q_positional_leaning_forward',
    text: 'Is the chest pain significantly relieved by sitting upright and leaning forward, and worsened by lying flat on the back or coughing?',
    category: 'Symptom Character',
    rationale: 'Positional relief when leaning forward reduces parietal-visceral pericardial contact friction in Acute Pericarditis.',
    diseaseLikelihoods: {
      pericarditis: { lrPos: 7.5, lrNeg: 0.1 },
      stemi: { lrPos: 0.15, lrNeg: 1.4 },
      aortic_dissection: { lrPos: 0.2, lrNeg: 1.3 },
      pulmonary_embolism: { lrPos: 0.3, lrNeg: 1.3 },
      gerd: { lrPos: 0.4, lrNeg: 1.2 },
    },
    triggerKeywords: ['leaning forward', 'lying flat', 'positional pain', 'pericarditis'],
  },
  {
    id: 'q_postprandial_antacid_relief',
    text: 'Is the discomfort predominantly a burning sensation that worsens after spicy or acidic meals and improves following a dose of liquid antacid?',
    category: 'History',
    rationale: 'Burning postprandial pyrosis with antacid neutralization indicates Gastroesophageal Reflux Disease rather than ischemic heart disease.',
    diseaseLikelihoods: {
      gerd: { lrPos: 6.0, lrNeg: 0.2 },
      stemi: { lrPos: 0.3, lrNeg: 1.3 },
      aortic_dissection: { lrPos: 0.1, lrNeg: 1.4 },
      pulmonary_embolism: { lrPos: 0.1, lrNeg: 1.4 },
      pericarditis: { lrPos: 0.2, lrNeg: 1.3 },
    },
    triggerKeywords: ['burning', 'antacid', 'meals', 'heartburn', 'acid'],
  },
  {
    id: 'q_pulse_bp_asymmetry',
    text: 'Is there a noticeable difference in pulse strength or a blood pressure discrepancy greater than 20 mmHg when checked between the right and left arms?',
    category: 'Physical Exam',
    rationale: 'Upper-extremity pulse deficit or blood pressure asymmetry points directly to intimal flap occlusion of the brachiocephalic or subclavian arteries in Aortic Dissection.',
    diseaseLikelihoods: {
      aortic_dissection: { lrPos: 7.0, lrNeg: 0.2 },
      stemi: { lrPos: 0.2, lrNeg: 1.3 },
      pulmonary_embolism: { lrPos: 0.3, lrNeg: 1.2 },
      pericarditis: { lrPos: 0.2, lrNeg: 1.2 },
      gerd: { lrPos: 0.1, lrNeg: 1.3 },
    },
    triggerKeywords: ['pulse deficit', 'bp difference', 'both arms', 'blood pressure arms'],
  },

  // --- ABDOMINAL & GI QUESTIONS ---
  {
    id: 'q_migratory_rlq_pain',
    text: 'Did the abdominal pain start around the navel (belly button) before shifting down into the lower right side of the abdomen (McBurney point)?',
    category: 'History',
    rationale: 'Visceral periumbilical pain shifting to somatic Right Lower Quadrant peritoneal irritation has the highest specificity for Acute Appendicitis.',
    diseaseLikelihoods: {
      appendicitis: { lrPos: 7.5, lrNeg: 0.15 },
      cholecystitis: { lrPos: 0.2, lrNeg: 1.4 },
      pancreatitis: { lrPos: 0.2, lrNeg: 1.4 },
    },
    triggerKeywords: ['migrating', 'navel', 'belly button', 'rlq', 'lower right', 'appendicitis'],
  },
  {
    id: 'q_murphy_ruq_gallbladder',
    text: 'Is the pain centered in the upper right abdomen under the ribs, triggered after fatty or greasy meals, with sharp breath-stopping tenderness when pressing under the right ribcage (Murphy sign)?',
    category: 'Physical Exam',
    rationale: 'Postprandial RUQ pain with an inspiratory arrest on deep palpation indicates Acute Calculous Cholecystitis.',
    diseaseLikelihoods: {
      cholecystitis: { lrPos: 7.0, lrNeg: 0.15 },
      pancreatitis: { lrPos: 1.5, lrNeg: 0.8 },
      appendicitis: { lrPos: 0.15, lrNeg: 1.4 },
    },
    triggerKeywords: ['upper right', 'ruq', 'murphy', 'fatty food', 'gallbladder', 'greasy'],
  },
  {
    id: 'q_epigastric_boring_back_pancreatitis',
    text: 'Is there agonizing, constant boring pain deep in the upper stomach that shoots directly through into the mid-spine/back, accompanied by persistent vomiting?',
    category: 'Symptom Character',
    rationale: 'Retroperitoneal acinar inflammatory spread in Acute Pancreatitis produces intense mid-back radiation.',
    diseaseLikelihoods: {
      pancreatitis: { lrPos: 6.8, lrNeg: 0.15 },
      cholecystitis: { lrPos: 1.2, lrNeg: 0.9 },
      appendicitis: { lrPos: 0.15, lrNeg: 1.4 },
    },
    triggerKeywords: ['boring pain', 'back pain', 'vomiting', 'epigastric', 'pancreatitis'],
  },

  // --- NEUROLOGICAL QUESTIONS ---
  {
    id: 'q_nuchal_rigidity_meningitis',
    text: 'Is there intense stiffness or pain in the back of the neck when attempting to touch the chin to the chest (nuchal rigidity), combined with bright light hurting the eyes (photophobia)?',
    category: 'Physical Exam',
    rationale: 'Meningeal stretch irritation from purulent exudates in Acute Bacterial Meningitis restricts passive neck flexion.',
    diseaseLikelihoods: {
      bacterial_meningitis: { lrPos: 7.0, lrNeg: 0.15 },
      subarachnoid_hemorrhage: { lrPos: 3.5, lrNeg: 0.5 },
      malaria: { lrPos: 0.8, lrNeg: 1.1 },
    },
    triggerKeywords: ['stiff neck', 'chin to chest', 'photophobia', 'meningitis', 'nuchal'],
  },
  {
    id: 'q_thunderclap_explosive_sah',
    text: 'Did the headache strike like an explosive thunderclap, reaching peak agony in less than 60 seconds ("worst headache of my entire life") without preceding fever?',
    category: 'History',
    rationale: 'Sub-minute maximal intensity thunderclap headache indicates arterial extravasation from a ruptured intracranial berry aneurysm.',
    diseaseLikelihoods: {
      subarachnoid_hemorrhage: { lrPos: 8.0, lrNeg: 0.1 },
      bacterial_meningitis: { lrPos: 0.2, lrNeg: 1.4 },
    },
    triggerKeywords: ['thunderclap', 'explosive', 'worst headache', 'instant', 'subarachnoid'],
  },

  // --- PULMONARY QUESTIONS ---
  {
    id: 'q_productive_purulent_cough_pneumonia',
    text: 'Is the patient coughing up thick, colored (yellow, green, or rusty brick-red) sputum, accompanied by focal crackling sounds in one part of the lungs and high fevers?',
    category: 'Symptom Character',
    rationale: 'Alveolar exudative consolidation in Severe Community-Acquired Pneumonia produces purulent or rusty sputum and localized crackles.',
    diseaseLikelihoods: {
      pneumonia: { lrPos: 7.0, lrNeg: 0.15 },
      asthma_exacerbation: { lrPos: 0.3, lrNeg: 1.4 },
      pulmonary_embolism: { lrPos: 0.4, lrNeg: 1.3 },
    },
    triggerKeywords: ['sputum', 'phlegm', 'rusty', 'green cough', 'pneumonia'],
  },
  {
    id: 'q_expiratory_wheezing_asthma',
    text: 'Is there audible musical whistling or wheezing predominantly when breathing OUT, with the patient struggling to finish a sentence without stopping for breath?',
    category: 'Physical Exam',
    rationale: 'Diffuse expiratory wheezing and sentence fragmentation reflect critical intrathoracic bronchospasm in Asthma.',
    diseaseLikelihoods: {
      asthma_exacerbation: { lrPos: 7.5, lrNeg: 0.1 },
      pneumonia: { lrPos: 0.4, lrNeg: 1.3 },
      pulmonary_embolism: { lrPos: 0.3, lrNeg: 1.3 },
    },
    triggerKeywords: ['wheeze', 'whistling', 'asthma', 'breathing out', 'sentence'],
  },

  // --- ADDITIONAL TROPICAL & TRAVEL QUESTIONS ---
  {
    id: 'q_cerebral_malaria_confusion',
    text: 'Has the patient experienced any drowsiness, disorientation, persistent confusion, or seizure episodes alongside the fevers?',
    category: 'Red Flag',
    rationale: 'Assesses for Cerebral Malaria (microvascular cytoadherence of parasitized RBCs in cerebral capillaries), an acute neurological emergency.',
    diseaseLikelihoods: {
      malaria: { lrPos: 6.0, lrNeg: 0.3 },
      bacterial_meningitis: { lrPos: 4.5, lrNeg: 0.4 },
      subarachnoid_hemorrhage: { lrPos: 3.0, lrNeg: 0.6 },
      dengue: { lrPos: 1.5, lrNeg: 0.9 },
      acute_viral: { lrPos: 0.1, lrNeg: 1.5 },
    },
    triggerKeywords: ['confusion', 'drowsy', 'disoriented', 'seizure', 'altered mental'],
  },
  {
    id: 'q_rose_spots_trunk',
    text: 'Are there faint salmon-pink blanching macules (rose spots) visible across the chest or upper abdomen?',
    category: 'Physical Exam',
    rationale: 'Rose spots appear in approximately 30% of Typhoid fever cases during the second week of illness due to bacterial embolization.',
    diseaseLikelihoods: {
      typhoid: { lrPos: 7.5, lrNeg: 0.25 },
      dengue: { lrPos: 0.4, lrNeg: 1.2 },
      malaria: { lrPos: 0.1, lrNeg: 1.3 },
      acute_viral: { lrPos: 0.2, lrNeg: 1.3 },
    },
    triggerKeywords: ['rose spots', 'salmon spots', 'pink spots', 'macules'],
  },
  {
    id: 'q_tourniquet_hess_test',
    text: 'Did blood pressure cuff inflation on the arm provoke more than 10-20 tiny petechial spots per square inch (positive Hess / Tourniquet test)?',
    category: 'Physical Exam',
    rationale: 'Quantifies capillary fragility and thrombocytopenia in early Dengue Fever before frank spontaneous hemorrhage.',
    diseaseLikelihoods: {
      dengue: { lrPos: 6.5, lrNeg: 0.2 },
      leptospirosis: { lrPos: 2.5, lrNeg: 0.7 },
      malaria: { lrPos: 0.4, lrNeg: 1.3 },
      acute_viral: { lrPos: 0.2, lrNeg: 1.3 },
    },
    triggerKeywords: ['tourniquet', 'hess test', 'cuff test', 'capillary fragility'],
  },
  {
    id: 'q_severe_pallor_conjunctival',
    text: 'Is there marked ghostly white paleness of the inner eyelids (lower palpebral conjunctiva), tongue, or palmar skin creases?',
    category: 'Physical Exam',
    rationale: 'Severe conjunctival pallor signifies acute profound anemia (hemoglobin < 7 g/dL) from rapid Falciparum erythrocyte destruction.',
    diseaseLikelihoods: {
      malaria: { lrPos: 5.0, lrNeg: 0.3 },
      leptospirosis: { lrPos: 2.0, lrNeg: 0.8 },
      dengue: { lrPos: 0.3, lrNeg: 1.3 },
      typhoid: { lrPos: 1.5, lrNeg: 0.9 },
    },
    triggerKeywords: ['pallor', 'pale eyelids', 'white tongue', 'severe anemia'],
  },
  {
    id: 'q_oliguria_dark_urine',
    text: 'Has the daily urine volume markedly decreased (oliguria), or has the patient gone more than 12 hours without producing urine?',
    category: 'Red Flag',
    rationale: 'Signals acute tubular necrosis / acute kidney injury from Falciparum microvascular sludging or Leptospirosis Weil disease.',
    diseaseLikelihoods: {
      leptospirosis: { lrPos: 5.5, lrNeg: 0.25 },
      malaria: { lrPos: 4.5, lrNeg: 0.35 },
      dengue: { lrPos: 2.0, lrNeg: 0.8 },
      acute_viral: { lrPos: 0.1, lrNeg: 1.5 },
    },
    triggerKeywords: ['oliguria', 'no urine', 'kidney failure', 'decreased urine'],
  },

  // --- ADDITIONAL CARDIOVASCULAR DISCRIMINATORS ---
  {
    id: 'q_calf_asymmetry_dvt',
    text: 'Is one calf noticeably swollen (greater than 3 cm difference), warm, red, or painfully tender to squeeze compared to the other leg?',
    category: 'Physical Exam',
    rationale: 'Unilateral calf swelling and tenderness indicates Deep Vein Thrombosis (DVT), the primary embolic source for Pulmonary Embolism.',
    diseaseLikelihoods: {
      pulmonary_embolism: { lrPos: 7.0, lrNeg: 0.15 },
      stemi: { lrPos: 0.2, lrNeg: 1.3 },
      aortic_dissection: { lrPos: 0.3, lrNeg: 1.2 },
      pericarditis: { lrPos: 0.1, lrNeg: 1.3 },
    },
    triggerKeywords: ['calf swelling', 'one leg', 'dvt', 'swollen leg', 'leg pain'],
  },
  {
    id: 'q_exertional_syncope',
    text: 'Did the patient experience an episode of blacking out (syncope) or sudden near-fainting during or immediately following the chest discomfort?',
    category: 'Red Flag',
    rationale: 'Exertional syncope alerts to severe hemodynamic obstruction: massive pulmonary embolism with acute RV failure or proximal aortic dissection.',
    diseaseLikelihoods: {
      pulmonary_embolism: { lrPos: 5.5, lrNeg: 0.3 },
      aortic_dissection: { lrPos: 5.0, lrNeg: 0.35 },
      stemi: { lrPos: 2.5, lrNeg: 0.7 },
      gerd: { lrPos: 0.05, lrNeg: 1.5 },
      pericarditis: { lrPos: 0.2, lrNeg: 1.3 },
    },
    triggerKeywords: ['syncope', 'blackout', 'fainted', 'passed out', 'collapse'],
  },
  {
    id: 'q_orthopnea_pnd',
    text: 'Does the patient experience severe breathlessness when lying flat that forces them to sleep propped up on three or more pillows (orthopnea)?',
    category: 'History',
    rationale: 'Orthopnea reflects elevated pulmonary capillary wedge pressure and left ventricular failure following large myocardial infarction.',
    diseaseLikelihoods: {
      stemi: { lrPos: 4.5, lrNeg: 0.4 },
      pulmonary_embolism: { lrPos: 1.5, lrNeg: 0.9 },
      pneumonia: { lrPos: 1.8, lrNeg: 0.8 },
      pericarditis: { lrPos: 1.2, lrNeg: 0.9 },
      gerd: { lrPos: 1.0, lrNeg: 1.0 },
    },
    triggerKeywords: ['orthopnea', 'pillows', 'lying flat', 'paroxysmal nocturnal'],
  },
  {
    id: 'q_diaphoresis_cold_sweat',
    text: 'Was the chest discomfort accompanied by sudden drenching cold clammy perspiration (diaphoresis) or profuse vomiting?',
    category: 'Symptom Character',
    rationale: 'Profound sympathetic discharge causing cold diaphoresis strongly elevates likelihood of acute epicardial coronary occlusion.',
    diseaseLikelihoods: {
      stemi: { lrPos: 5.5, lrNeg: 0.2 },
      aortic_dissection: { lrPos: 4.0, lrNeg: 0.4 },
      pulmonary_embolism: { lrPos: 3.0, lrNeg: 0.6 },
      pericarditis: { lrPos: 0.4, lrNeg: 1.3 },
      gerd: { lrPos: 0.1, lrNeg: 1.4 },
    },
    triggerKeywords: ['cold sweat', 'clammy', 'diaphoresis', 'drenching sweat'],
  },
  {
    id: 'q_sublingual_nitroglycerin_relief',
    text: 'Does the chest tightness reliably vanish within 2 to 5 minutes of resting or taking a sublingual nitroglycerin tablet or spray?',
    category: 'History',
    rationale: 'Rapid prompt resolution with nitroglycerin supports reversible coronary ischemia rather than pericarditis, dissection, or PE.',
    diseaseLikelihoods: {
      stemi: { lrPos: 2.0, lrNeg: 0.8 },
      gerd: { lrPos: 2.5, lrNeg: 0.7 },
      aortic_dissection: { lrPos: 0.05, lrNeg: 1.5 },
      pulmonary_embolism: { lrPos: 0.1, lrNeg: 1.4 },
      pericarditis: { lrPos: 0.1, lrNeg: 1.4 },
    },
    triggerKeywords: ['nitroglycerin', 'nitro spray', 'sublingual'],
  },
  {
    id: 'q_pericardial_friction_rub',
    text: 'Has a clinician auscultated a superficial, high-pitched scratching or crunching sound over the left lower sternal border that persists on holding breath?',
    category: 'Physical Exam',
    rationale: 'Pericardial friction rub is pathognomonic for Acute Pericarditis, differentiating it from myocardial infarction.',
    diseaseLikelihoods: {
      pericarditis: { lrPos: 9.0, lrNeg: 0.1 },
      stemi: { lrPos: 0.1, lrNeg: 1.4 },
      pulmonary_embolism: { lrPos: 0.2, lrNeg: 1.3 },
      aortic_dissection: { lrPos: 0.1, lrNeg: 1.3 },
      gerd: { lrPos: 0.05, lrNeg: 1.4 },
    },
    triggerKeywords: ['friction rub', 'scratching sound', 'auscultation rub'],
  },

  // --- ADDITIONAL ABDOMINAL & GI DISCRIMINATORS ---
  {
    id: 'q_rigid_board_abdomen_perforated',
    text: 'Is the patient\'s entire abdominal wall rock-hard and board-like (involuntary guarding), with agonizing pain triggered by the slightest vibration or cough?',
    category: 'Physical Exam',
    rationale: 'Generalized board-like rigidity signifies diffuse chemical/purulent peritonitis from perforated viscus (e.g. perforated peptic ulcer or appendix).',
    diseaseLikelihoods: {
      appendicitis: { lrPos: 4.5, lrNeg: 0.4 },
      pancreatitis: { lrPos: 3.0, lrNeg: 0.6 },
      cholecystitis: { lrPos: 1.5, lrNeg: 0.9 },
    },
    triggerKeywords: ['board like', 'rigid abdomen', 'peritonitis', 'rebound'],
  },
  {
    id: 'q_rovsing_rebound_tenderness',
    text: 'Does applying firm pressure to the left lower side of the abdomen cause sharp pain to shoot across into the right lower side (Rovsing sign)?',
    category: 'Physical Exam',
    rationale: 'Rovsing sign pushes colon gas backwards toward the cecum, stretching the inflamed appendix in Acute Appendicitis.',
    diseaseLikelihoods: {
      appendicitis: { lrPos: 7.0, lrNeg: 0.15 },
      cholecystitis: { lrPos: 0.15, lrNeg: 1.3 },
      pancreatitis: { lrPos: 0.2, lrNeg: 1.3 },
    },
    triggerKeywords: ['rovsing', 'left to right', 'rebound tenderness'],
  },
  {
    id: 'q_obstipation_bilious_vomiting',
    text: 'Has the patient completely stopped passing gas or stool (obstipation) alongside progressive abdominal bloating and vomiting green/yellow bile?',
    category: 'Symptom Character',
    rationale: 'Obstipation, distension, and bilious vomiting form the classical diagnostic tetrad of mechanical Small Bowel Obstruction.',
    diseaseLikelihoods: {
      appendicitis: { lrPos: 1.8, lrNeg: 0.8 },
      pancreatitis: { lrPos: 2.2, lrNeg: 0.7 },
      cholecystitis: { lrPos: 0.8, lrNeg: 1.1 },
    },
    triggerKeywords: ['obstipation', 'no gas', 'no stool', 'bilious vomiting', 'bowel obstruction'],
  },
  {
    id: 'q_pale_stool_dark_urine_biliary',
    text: 'Has the patient noticed pale putty/clay-colored stools alongside tea-colored dark urine and generalized skin itching (pruritus)?',
    category: 'Symptom Character',
    rationale: 'Obstructive post-hepatic cholestasis (choledocholithiasis or ascending cholangitis) blocks bile from entering the duodenum.',
    diseaseLikelihoods: {
      cholecystitis: { lrPos: 6.5, lrNeg: 0.2 },
      pancreatitis: { lrPos: 3.5, lrNeg: 0.5 },
      appendicitis: { lrPos: 0.1, lrNeg: 1.4 },
    },
    triggerKeywords: ['clay stool', 'pale stool', 'itching', 'pruritus', 'biliary'],
  },

  // --- ADDITIONAL NEUROLOGICAL DISCRIMINATORS ---
  {
    id: 'q_kernig_brudzinski_signs',
    text: 'Does lifting or flexing the patient\'s neck cause their hips and knees to involuntarily bend upwards (Brudzinski sign), or does straightening the knee at 90 deg hip flexion produce severe resistance (Kernig sign)?',
    category: 'Physical Exam',
    rationale: 'Positive Kernig and Brudzinski signs have high specificity (>95%) for acute leptomeningeal inflammation.',
    diseaseLikelihoods: {
      bacterial_meningitis: { lrPos: 7.5, lrNeg: 0.15 },
      subarachnoid_hemorrhage: { lrPos: 3.0, lrNeg: 0.5 },
      malaria: { lrPos: 0.3, lrNeg: 1.2 },
    },
    triggerKeywords: ['kernig', 'brudzinski', 'meningeal signs', 'knee reflex'],
  },
  {
    id: 'q_facial_arm_speech_stroke',
    text: 'Is there sudden unilateral facial drooping, downward arm drift on arm extension, or slurred garbled speech (FAST stroke criteria)?',
    category: 'Physical Exam',
    rationale: 'FAST criteria identifies acute focal ischemic cerebral infarction requiring immediate thrombolytic / thrombectomy evaluation.',
    diseaseLikelihoods: {
      bacterial_meningitis: { lrPos: 1.8, lrNeg: 0.8 },
      subarachnoid_hemorrhage: { lrPos: 3.2, lrNeg: 0.6 },
    },
    triggerKeywords: ['facial droop', 'arm drift', 'slurred speech', 'stroke', 'weakness side'],
  },
  {
    id: 'q_jaw_claudication_temporal_arteritis',
    text: 'Does the patient experience cramping pain in the jaw muscles while chewing food, alongside severe tender swelling of the scalp temples?',
    category: 'History',
    rationale: 'Jaw claudication is the single highest-yield diagnostic indicator for Giant Cell (Temporal) Arteritis, a medical emergency risking irreversible blindness.',
    diseaseLikelihoods: {
      bacterial_meningitis: { lrPos: 0.2, lrNeg: 1.3 },
      subarachnoid_hemorrhage: { lrPos: 0.3, lrNeg: 1.2 },
    },
    triggerKeywords: ['jaw claudication', 'chewing', 'temple', 'temporal artery', 'scalp tenderness'],
  },
  {
    id: 'q_dilated_unresponsive_pupil_third_nerve',
    text: 'Has one pupil become noticeably dilated, fixed, or unreactive to light with a drooping upper eyelid (ptosis) and down-and-out eye deviation?',
    category: 'Physical Exam',
    rationale: 'Pupil-involving Third Cranial Nerve palsy signifies compression from an expanding Posterior Communicating Artery (PCOM) aneurysm at high risk of fatal rupture.',
    diseaseLikelihoods: {
      subarachnoid_hemorrhage: { lrPos: 8.5, lrNeg: 0.1 },
      bacterial_meningitis: { lrPos: 1.5, lrNeg: 0.9 },
    },
    triggerKeywords: ['pupil', 'blown pupil', 'dilated pupil', 'ptosis', 'drooping eyelid'],
  },

  // --- ADDITIONAL PULMONARY & RESPIRATORY DISCRIMINATORS ---
  {
    id: 'q_silent_chest_fatigue',
    text: 'Has audible wheezing suddenly stopped or become quiet despite the patient struggling violently to breathe with severe exhaustion (silent chest)?',
    category: 'Red Flag',
    rationale: 'A "silent chest" in acute status asthmaticus indicates complete absence of airflow and impending lethal asphyxial arrest.',
    diseaseLikelihoods: {
      asthma_exacerbation: { lrPos: 8.0, lrNeg: 0.1 },
      pneumonia: { lrPos: 0.5, lrNeg: 1.2 },
      pulmonary_embolism: { lrPos: 0.8, lrNeg: 1.1 },
    },
    triggerKeywords: ['silent chest', 'stopped wheezing', 'exhaustion breathing', 'asphyxia'],
  },
  {
    id: 'q_hyperresonance_unilateral_pneumothorax',
    text: 'Did sudden sharp chest pain develop with hollow drum-like tapping sounds (hyperresonance) and absent breath sounds on one side of the chest?',
    category: 'Physical Exam',
    rationale: 'Unilateral hyperresonance with absent vesicular breath sounds indicates Spontaneous Pneumothorax.',
    diseaseLikelihoods: {
      pulmonary_embolism: { lrPos: 1.5, lrNeg: 0.8 },
      asthma_exacerbation: { lrPos: 1.2, lrNeg: 0.9 },
      pneumonia: { lrPos: 0.2, lrNeg: 1.4 },
    },
    triggerKeywords: ['hyperresonance', 'pneumothorax', 'drum like', 'collapsed lung'],
  },
  {
    id: 'q_chronic_barrel_chest_pursed_copd',
    text: 'Does the patient have a chronic smoking history with a rounded barrel-shaped chest and breathing out through pursed lips with prolonged exhalation?',
    category: 'History',
    rationale: 'Prolonged expiratory phase, pursed-lip breathing, and barrel chest signify severe chronic air-trapping in COPD.',
    diseaseLikelihoods: {
      asthma_exacerbation: { lrPos: 3.5, lrNeg: 0.5 },
      pneumonia: { lrPos: 2.0, lrNeg: 0.7 },
      pulmonary_embolism: { lrPos: 1.2, lrNeg: 0.9 },
    },
    triggerKeywords: ['barrel chest', 'copd', 'pursed lip', 'chronic smoker'],
  },
  {
    id: 'q_hemoptysis_blood_cough',
    text: 'Has the patient coughed up bright red frank blood or noticeable blood-streaked sputum?',
    category: 'Red Flag',
    rationale: 'Hemoptysis in acute pleuritic dyspnea alerts to Pulmonary Infarction from Pulmonary Embolism or necrotizing bacterial pneumonia.',
    diseaseLikelihoods: {
      pulmonary_embolism: { lrPos: 6.0, lrNeg: 0.3 },
      pneumonia: { lrPos: 4.5, lrNeg: 0.4 },
      asthma_exacerbation: { lrPos: 0.1, lrNeg: 1.4 },
    },
    triggerKeywords: ['hemoptysis', 'coughing blood', 'blood in spit', 'blood sputum'],
  },
  {
    id: 'q_stridor_inability_swallow_epiglottitis',
    text: 'Is there a harsh high-pitched crowing noise on breathing IN (stridor) with inability to swallow saliva leading to drooling and forward tripod leaning?',
    category: 'Red Flag',
    rationale: 'Inspiratory stridor and drooling signal acute supraglottic airway obstruction (Acute Epiglottitis / Laryngospasm), a critical resuscitation emergency.',
    diseaseLikelihoods: {
      asthma_exacerbation: { lrPos: 0.3, lrNeg: 1.3 },
      pneumonia: { lrPos: 0.2, lrNeg: 1.3 },
      pulmonary_embolism: { lrPos: 0.1, lrNeg: 1.3 },
    },
    triggerKeywords: ['stridor', 'crowing', 'drooling', 'epiglottitis', 'airway blocked'],
  },
];

// ===========================================================================
// CLUSTER PRIOR SEEDER
// ===========================================================================
interface PriorSeed {
  domain: 'tropical' | 'cardiac' | 'gi' | 'neuro' | 'pulm';
  diseasePriors: Record<string, number>;
}

export function seedInitialDifferentialPriors(patient: PatientProfile): PriorSeed {
  const text = (
    (patient.chiefSymptoms || '') + ' ' +
    (patient.travelHistory || '') + ' ' +
    (patient.symptomDuration || '') + ' ' +
    (patient.additionalNotes || '')
  ).toLowerCase();

  // 1. Tropical / Post-Travel Febrile
  if (
    text.includes('kenya') || text.includes('africa') || text.includes('malaria') ||
    text.includes('safari') || text.includes('tropical') || text.includes('dengue') ||
    text.includes('typhoid') || text.includes('chills') || text.includes('rigor') ||
    text.includes('jaundice') || text.includes('dark urine') || text.includes('dark pee') ||
    (text.includes('fever') && (text.includes('travel') || text.includes('sweats') || text.includes('cyclical')))
  ) {
    return {
      domain: 'tropical',
      diseasePriors: {
        malaria: 38.0,
        dengue: 32.0,
        typhoid: 16.0,
        leptospirosis: 8.0,
        acute_viral: 6.0,
      },
    };
  }

  // 2. Cardiac / Chest Pain
  if (
    text.includes('chest') || text.includes('angina') || text.includes('stemi') ||
    text.includes('dissection') || text.includes('tearing') || text.includes('pressure') ||
    text.includes('retrosternal') || text.includes('coronary') || text.includes('myocardial')
  ) {
    const isTearing = text.includes('tearing') || text.includes('ripping') || text.includes('back');
    return {
      domain: 'cardiac',
      diseasePriors: {
        stemi: isTearing ? 25.0 : 45.0,
        aortic_dissection: isTearing ? 45.0 : 20.0,
        pulmonary_embolism: 18.0,
        pericarditis: 10.0,
        gerd: 7.0,
      },
    };
  }

  // 3. Acute Abdomen / GI
  if (
    text.includes('abdomen') || text.includes('belly') || text.includes('stomach') ||
    text.includes('appendicitis') || text.includes('cholecystitis') || text.includes('pancreatitis') ||
    text.includes('rlq') || text.includes('ruq') || text.includes('epigastric') || text.includes('navel')
  ) {
    return {
      domain: 'gi',
      diseasePriors: {
        appendicitis: 40.0,
        cholecystitis: 35.0,
        pancreatitis: 25.0,
      },
    };
  }

  // 4. Neurological / Severe Headache
  if (
    text.includes('stiff neck') || text.includes('nuchal') || text.includes('meningitis') ||
    text.includes('thunderclap') || text.includes('worst headache') || text.includes('photophobia') ||
    text.includes('headache')
  ) {
    const isThunderclap = text.includes('thunderclap') || text.includes('worst');
    return {
      domain: 'neuro',
      diseasePriors: {
        bacterial_meningitis: isThunderclap ? 30.0 : 55.0,
        subarachnoid_hemorrhage: isThunderclap ? 60.0 : 35.0,
        malaria: 10.0,
      },
    };
  }

  // 5. Respiratory / Dyspnea
  if (
    text.includes('breath') || text.includes('sob') || text.includes('dyspnea') ||
    text.includes('wheez') || text.includes('asthma') || text.includes('cough') ||
    text.includes('pneumonia') || text.includes('sputum')
  ) {
    return {
      domain: 'pulm',
      diseasePriors: {
        pneumonia: 40.0,
        asthma_exacerbation: 35.0,
        pulmonary_embolism: 25.0,
      },
    };
  }

  // Fallback default: Broad Medical Screening
  return {
    domain: 'tropical',
    diseasePriors: {
      malaria: 30.0,
      dengue: 25.0,
      typhoid: 20.0,
      leptospirosis: 15.0,
      acute_viral: 10.0,
    },
  };
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
  // 1. Initialize prior probabilities
  const seed = seedInitialDifferentialPriors(patient);
  const currentProbs: Record<string, number> = { ...seed.diseasePriors };
  const candidateIds = Object.keys(currentProbs);

  const initialText = (
    (patient.chiefSymptoms || '') + ' ' +
    (patient.travelHistory || '') + ' ' +
    (patient.symptomDuration || '') + ' ' +
    (patient.additionalNotes || '')
  ).toLowerCase();

  // 2. Apply Bayesian Updating across all answered questions in history
  const answeredQuestionIds = new Set<string>();
  let previousLeadId = candidateIds[0];

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
      // 'unsure' -> weight = 0, no update
      continue;
    }

    // Update each candidate disease's odds
    for (const dId of candidateIds) {
      const lrConfig = qDef.diseaseLikelihoods[dId];
      if (!lrConfig) continue;

      if (isPositive) {
        // Positive answer multiplier: interpolate between 1.0 and lrPos
        const mult = 1.0 + (lrConfig.lrPos - 1.0) * weight;
        currentProbs[dId] *= Math.max(0.01, mult);
      } else {
        // Negative answer multiplier: interpolate between 1.0 and lrNeg
        const mult = 1.0 + (lrConfig.lrNeg - 1.0) * weight;
        currentProbs[dId] *= Math.max(0.01, mult);
      }
    }

    // Normalize probabilities after each turn
    normalizeProbabilities(currentProbs, candidateIds);

    // Track leader before final turn
    if (turnIdx === history.length - 2) {
      previousLeadId = getTopCandidateId(currentProbs, candidateIds);
    }
  }

  // Final normalization
  normalizeProbabilities(currentProbs, candidateIds);

  // 3. Sort candidate diseases by posterior probability
  const sortedCandidates = candidateIds
    .map(id => ({
      id,
      profile: CLINICAL_DISEASES[id],
      prob: Math.round(currentProbs[id] * 10) / 10,
    }))
    .filter(c => c.profile !== undefined)
    .sort((a, b) => b.prob - a.prob);

  const topCandidate = sortedCandidates[0];
  const secondCandidate = sortedCandidates[1];
  const topConfidence = Math.min(99, Math.round(topCandidate?.prob || 50));

  // 4. Determine Dynamic Hypothesis Pursuit Status & Pivoting
  let hypothesisStatus: ActiveHypothesisInfo['status'] = 'exploring';
  let pivotedFrom: string | null = null;
  let hypothesisReason = '';

  const turn = history.length;

  if (turn === 0) {
    // Before Question 1: Never assert a single disease as confirmed!
    hypothesisStatus = 'exploring';
    hypothesisReason = `Broad differential inquiry: evaluating presentation across ${sortedCandidates.length} candidate diagnoses (${sortedCandidates.map(c => `${c.profile.name.split(' ')[0]} ${c.prob}%`).join(', ')}).`;
  } else {
    // Check if the leading candidate changed compared to previousHypothesis
    if (prevHypothesis && prevHypothesis.diseaseName && prevHypothesis.diseaseName !== topCandidate.profile.name) {
      hypothesisStatus = 'refuted';
      pivotedFrom = prevHypothesis.diseaseName;
      hypothesisReason = `Hypothesis pivoted from ${pivotedFrom} to ${topCandidate.profile.name} based on discriminatory answers in turns 1-${turn}.`;
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
  // Compute discriminatory power between candidate #1 and candidate #2:
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
    // Find question that maximizes discriminatory divergence between top two candidates
    let bestQ = availableQuestions[0];
    let bestScore = -1;

    const topId = topCandidate.id;
    const secId = secondCandidate?.id || candidateIds[1] || topId;

    for (const q of availableQuestions) {
      const lr1 = q.diseaseLikelihoods[topId]?.lrPos ?? 1.0;
      const lr2 = q.diseaseLikelihoods[secId]?.lrPos ?? 1.0;
      // Discrimination gap: how differently this question affects condition 1 vs condition 2
      const divergence = Math.abs(Math.log(Math.max(0.1, lr1)) - Math.log(Math.max(0.1, lr2)));
      
      // Also bonus questions that specifically target the top candidate
      const relevance = Math.max(lr1, 1 / Math.max(0.1, lr1));
      const score = divergence * 2.0 + relevance;

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
  const differentialRanking: DifferentialItem[] = sortedCandidates.map((c, idx) => ({
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
      'Establish peripheral venous access, draw baseline CBC, chemistry panel, and blood cultures/smears as indicated.',
      'Maintain continuous vital sign monitoring and adhere to allergy contraindication alerts.',
    ],
    differentialSummary: isDefinitive
      ? `Definitive diagnostic certainty threshold reached (>=95% confidence). Primary identified condition is ${topCandidate.profile.name}. Immediate targeted confirmatory testing and clinical management indicated.`
      : `Inquiry completed after ${turn} turns. Primary candidate is ${topCandidate.profile.name} (${topConfidence}%), with close differentials ${sortedCandidates.slice(1, 3).map(c => `${c.profile.name} (${c.prob}%)`).join(', ')}. Comprehensive differential workup recommended.`,
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
    akinatorThought = `Turn 1: Clinical priors initialized. Formulating discriminatory question to differentiate candidate cluster (${sortedCandidates.map(c => c.profile.name.split(' ')[0]).join(' vs ')}). Active inquiry will continue until >=95% certainty is attained.`;
  } else {
    akinatorThought = `Turn ${turn}: Bayesian update applied. Leading candidate: ${topCandidate.profile.name} (${topConfidence}%). Active inquiry continuing until >=95% certainty threshold is met...`;
  }

  const currentCandidates = sortedCandidates.slice(0, 5).map(c => ({
    diseaseName: c.profile.name,
    confidence: Math.round(c.prob),
    trend: (turn === 0 ? 'stable' : (c.id === topCandidate.id ? 'rising' : 'falling')) as 'rising' | 'falling' | 'stable',
    reason: c.profile.supportingFindings[0] || 'Corroborated by clinical findings',
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

function getTopCandidateId(probs: Record<string, number>, keys: string[]): string {
  let topId = keys[0];
  let maxP = -1;
  for (const k of keys) {
    if (probs[k] > maxP) {
      maxP = probs[k];
      topId = k;
    }
  }
  return topId;
}
