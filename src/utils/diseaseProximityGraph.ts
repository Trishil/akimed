/**
 * AkiMed Clinical Disease Proximity Graph & Hallmark Question Policy Engine
 * 
 * Implements the authentic "Akinator" 20-Questions Algorithm for Clinical Medicine:
 * 1. Prominent Hypothesis Lock-On: The AI identifies the leading candidate and interrogates its cardinal features.
 * 2. Affirmative Chain ("Yes" / "Probably Yes"): The AI STAYS on that disease, deepening its hallmark ladder until certainty >= 95%.
 * 3. Negative Pivot ("No" / "Probably No"): The moment the user answers "No", that disease is REFUTED, and the AI
 *    instantly pivots to its NEAREST CLINICAL NEIGHBOR (based on the Clinical Proximity Graph).
 * 4. Transparent Clinical Reasoning: The thought bubble explicitly explains why it pivoted and which neighbor it shifted to.
 */

export interface HallmarkQuestion {
  questionId: string;
  questionText: string;
  category: 'History' | 'Physical Exam' | 'Bedside Sign' | 'Red Flag';
  clinicalRationale: string;
  expectedAnswer: 'yes' | 'no';
  diagnosticYield: number; // 1 to 10
}

export interface NearestNeighbor {
  diseaseId: string;
  name: string;
  similarity: number; // 0.0 to 1.0
  clinicalReason: string;
}

export interface DiseaseProximityNode {
  diseaseId: string;
  name: string;
  system: string;
  nearestNeighbors: NearestNeighbor[];
  hallmarkQuestions: HallmarkQuestion[];
}

export const DISEASE_PROXIMITY_GRAPH: Record<string, DiseaseProximityNode> = {
  // =========================================================================
  // NEUROLOGY
  // =========================================================================
  'acute_ischemic_stroke': {
    diseaseId: 'acute_ischemic_stroke',
    name: 'Acute ischemic stroke (MCA territory)',
    system: 'neuro',
    nearestNeighbors: [
      { diseaseId: 'acute_hypoglycemia', name: 'Acute hypoglycemia (Stroke Mimic)', similarity: 0.94, clinicalReason: 'Neuroglycopenia produces focal hemiplegia and acute confusion identical to hemispheric MCA stroke.' },
      { diseaseId: 'spontaneous_sah', name: 'Spontaneous subarachnoid hemorrhage (SAH)', similarity: 0.88, clinicalReason: 'Acute abrupt vascular insult with sudden neurological compromise and altered sensorium.' },
      { diseaseId: 'bells_palsy', name: 'Bell\'s palsy (Idiopathic CN VII paralysis)', similarity: 0.82, clinicalReason: 'Unilateral facial weakness; distinguished by forehead involvement (LMN vs UMN).' },
      { diseaseId: 'migraine', name: 'Hemiplegic Migraine / Complicated Cephalea', similarity: 0.78, clinicalReason: 'Reversible cortical spreading depression causing unilateral motor weakness.' },
      { diseaseId: 'bacterial_meningitis', name: 'Acute bacterial meningitis', similarity: 0.72, clinicalReason: 'Acute confusion and neurological depression with intracranial pathology.' }
    ],
    hallmarkQuestions: [
      {
        questionId: 'q_stroke_unilateral_weakness',
        questionText: 'Did the patient experience sudden, abrupt weakness or numbness primarily affecting one side of the face, arm, or leg (unilateral hemiparesis)?',
        category: 'History',
        clinicalRationale: 'Contralateral motor cortex or internal capsule ischemia produces hallmark focal unilateral weakness.',
        expectedAnswer: 'yes',
        diagnosticYield: 10
      },
      {
        questionId: 'q_stroke_dysarthria',
        questionText: 'Is the patient experiencing slurred, garbled speech (dysarthria) or difficulty articulating words / comprehending spoken commands (aphasia)?',
        category: 'Bedside Sign',
        clinicalRationale: 'Involvement of cortical speech centers (Broca/Wernicke) or corticobulbar pathways in the MCA distribution.',
        expectedAnswer: 'yes',
        diagnosticYield: 9
      },
      {
        questionId: 'q_stroke_facial_droop',
        questionText: 'On physical examination, is there a visible unilateral facial droop with asymmetric smile or pronator arm drift when eyes are closed?',
        category: 'Physical Exam',
        clinicalRationale: 'Cincinnati Prehospital Stroke Scale / FAST hallmark sign of middle cerebral artery ischemia.',
        expectedAnswer: 'yes',
        diagnosticYield: 9
      },
      {
        questionId: 'q_stroke_onset_window',
        questionText: 'Did these neurological deficits appear abruptly with the patient last known to be completely normal within the past 4.5 hours?',
        category: 'Red Flag',
        clinicalRationale: 'Confirms hyperacute arterial occlusion within the critical IV thrombolysis (Alteplase/Tenecteplase) reperfusion window.',
        expectedAnswer: 'yes',
        diagnosticYield: 10
      }
    ]
  },

  'acute_hypoglycemia': {
    diseaseId: 'acute_hypoglycemia',
    name: 'Acute hypoglycemia (Stroke Mimic)',
    system: 'endocrine',
    nearestNeighbors: [
      { diseaseId: 'acute_ischemic_stroke', name: 'Acute ischemic stroke (MCA territory)', similarity: 0.94, clinicalReason: 'Focal neurological deficits and sudden confusion mimicking hemispheric stroke.' },
      { diseaseId: 'diabetic_ketoacidosis', name: 'Diabetic ketoacidosis (DKA)', similarity: 0.85, clinicalReason: 'Diabetic medication imbalance causing acute metabolic decompensation.' },
      { diseaseId: 'addisonian_crisis', name: 'Primary adrenal insufficiency (Addisonian crisis)', similarity: 0.79, clinicalReason: 'Glucocorticoid deficiency triggering refractory hypoglycemia and shock.' }
    ],
    hallmarkQuestions: [
      {
        questionId: 'q_hypo_adrenergic',
        questionText: 'Is the acute confusion accompanied by intense diaphoresis (cold sweats), fine tremor, palpitations, and marked hunger?',
        category: 'History',
        clinicalRationale: 'Sympathoadrenal catecholamine surge triggered by rapid plasma glucose decline (< 55 mg/dL).',
        expectedAnswer: 'yes',
        diagnosticYield: 9
      },
      {
        questionId: 'q_hypo_diabetic_meds',
        questionText: 'Is the patient taking insulin injections or oral sulfonylureas (e.g. Glimepiride, Glipizide) with a recently missed meal or strenuous exertion?',
        category: 'History',
        clinicalRationale: 'Exogenous hyperinsulinemia or secretagogues represent the primary precipitant of severe neuroglycopenia.',
        expectedAnswer: 'yes',
        diagnosticYield: 9
      },
      {
        questionId: 'q_hypo_dextrose_reversal',
        questionText: 'Did point-of-care capillary fingerstick confirm blood glucose < 60 mg/dL, with prompt neurological improvement following oral sugar or IV Dextrose (Whipple triad)?',
        category: 'Bedside Sign',
        clinicalRationale: 'Whipple triad confirms definitive hypoglycemia over structural ischemic stroke.',
        expectedAnswer: 'yes',
        diagnosticYield: 10
      }
    ]
  },

  // =========================================================================
  // CARDIOLOGY & VASCULAR
  // =========================================================================
  'stemi': {
    diseaseId: 'stemi',
    name: 'Acute ST-elevation myocardial infarction (STEMI)',
    system: 'cardiac',
    nearestNeighbors: [
      { diseaseId: 'nstemi_atypical', name: 'Possible NSTEMI / STEMI (Atypical ACS)', similarity: 0.96, clinicalReason: 'Coronary artery occlusion; atypical or anginal equivalent in diabetics and females.' },
      { diseaseId: 'aortic_dissection', name: 'Acute Stanford Type A aortic dissection', similarity: 0.89, clinicalReason: 'Severe anterior chest pain radiating to back with catastrophic cardiovascular collapse.' },
      { diseaseId: 'pulmonary_embolism', name: 'Acute pulmonary embolism', similarity: 0.84, clinicalReason: 'Sudden chest pain, marked dyspnea, tachycardia, and right heart strain.' },
      { diseaseId: 'pericarditis', name: 'Acute pericarditis', similarity: 0.79, clinicalReason: 'Severe retrosternal chest pain with ST changes on ECG.' },
      { diseaseId: 'gerd', name: 'Gastroesophageal Reflux Disease (GERD) / Esophageal Spasm', similarity: 0.74, clinicalReason: 'Severe substernal burning/pressure radiating to neck and back.' }
    ],
    hallmarkQuestions: [
      {
        questionId: 'q_stemi_chest_pain',
        questionText: 'Is there heavy, crushing, pressure-like substernal chest discomfort radiating to the left arm, shoulder, or jaw lasting > 20 minutes?',
        category: 'History',
        clinicalRationale: 'Classic ischemic visceral cardiac pain mediated by sympathetic C7-T4 cardiac afferents.',
        expectedAnswer: 'yes',
        diagnosticYield: 10
      },
      {
        questionId: 'q_stemi_diaphoresis',
        questionText: 'Is the discomfort accompanied by cold, profuse diaphoresis, unprovoked nausea, and acute shortness of breath?',
        category: 'History',
        clinicalRationale: 'Autonomic nervous system reflex activation caused by transmural myocardial necrosis.',
        expectedAnswer: 'yes',
        diagnosticYield: 9
      },
      {
        questionId: 'q_stemi_nitrate_refractory',
        questionText: 'Has the pain persisted unrelieved by rest and unresponsive to sublingual nitroglycerin or antacids?',
        category: 'History',
        clinicalRationale: 'Complete thrombotic occlusion of an epicardial coronary artery is refractory to simple vasodilation.',
        expectedAnswer: 'yes',
        diagnosticYield: 8
      },
      {
        questionId: 'q_stemi_ecg_elevation',
        questionText: 'Does the 12-lead ECG reveal new ST-segment elevation >= 1mm in two contiguous leads or new Left Bundle Branch Block (LBBB)?',
        category: 'Bedside Sign',
        clinicalRationale: 'Definitive diagnostic hallmark of acute transmural infarction mandating immediate cath lab activation.',
        expectedAnswer: 'yes',
        diagnosticYield: 10
      }
    ]
  },

  'nstemi_atypical': {
    diseaseId: 'nstemi_atypical',
    name: 'Possible NSTEMI / STEMI (Atypical ACS)',
    system: 'cardiac',
    nearestNeighbors: [
      { diseaseId: 'stemi', name: 'Acute ST-elevation myocardial infarction (STEMI)', similarity: 0.96, clinicalReason: 'Coronary artery occlusion; classic presentation.' },
      { diseaseId: 'aortic_dissection', name: 'Acute Stanford Type A aortic dissection', similarity: 0.88, clinicalReason: 'Severe interscapular back pain and visceral distress.' },
      { diseaseId: 'acute_pancreatitis', name: 'Acute pancreatitis', similarity: 0.81, clinicalReason: 'Deep epigastric gnawing pain radiating straight through to back with nausea/vomiting.' },
      { diseaseId: 'gerd', name: 'Gastroesophageal Reflux Disease (GERD)', similarity: 0.77, clinicalReason: 'Upper abdominal discomfort unrelieved by OTC antacids.' }
    ],
    hallmarkQuestions: [
      {
        questionId: 'q_atypical_anginal_equiv',
        questionText: 'In this female or diabetic patient, does the presentation feature an anginal equivalent: deep gnawing epigastric discomfort radiating straight through to the back rather than classic crushing chest pain?',
        category: 'History',
        clinicalRationale: 'Diabetic autonomic neuropathy blunts visceral pain fibers; up to 40% of MI in females presents as anginal equivalents.',
        expectedAnswer: 'yes',
        diagnosticYield: 10
      },
      {
        questionId: 'q_atypical_s4_gallop',
        questionText: 'On cardiac auscultation, is an S4 atrial gallop audible, accompanied by bibasilar fine crackles at the lung bases (Killip Class II heart failure)?',
        category: 'Physical Exam',
        clinicalRationale: 'Ischemic stiffening of left ventricular compliance creates an audible S4; elevated filling pressures produce pulmonary venous congestion.',
        expectedAnswer: 'yes',
        diagnosticYield: 9
      },
      {
        questionId: 'q_atypical_antacid_refractory',
        questionText: 'Did over-the-counter antacids (Tums, Mylanta) fail to relieve the gnawing epigastric and back ache?',
        category: 'History',
        clinicalRationale: 'Distinguishes ischemic coronary discomfort from benign acid-peptic reflux disease.',
        expectedAnswer: 'yes',
        diagnosticYield: 8
      }
    ]
  },

  'aortic_dissection': {
    diseaseId: 'aortic_dissection',
    name: 'Acute Stanford Type A aortic dissection',
    system: 'cardiac',
    nearestNeighbors: [
      { diseaseId: 'stemi', name: 'Acute ST-elevation myocardial infarction (STEMI)', similarity: 0.89, clinicalReason: 'Severe retrosternal chest pain; can occlude RCA ostium causing inferior STEMI.' },
      { diseaseId: 'pulmonary_embolism', name: 'Acute pulmonary embolism', similarity: 0.83, clinicalReason: 'Acute hemodynamic collapse and sharp chest pain.' },
      { diseaseId: 'spontaneous_sah', name: 'Spontaneous subarachnoid hemorrhage (SAH)', similarity: 0.78, clinicalReason: 'Catastrophic abrupt onset arterial tearing.' }
    ],
    hallmarkQuestions: [
      {
        questionId: 'q_dissection_tearing',
        questionText: 'Did the pain strike instantaneously at maximum intensity (10/10) with a ripping, tearing sensation migrating from anterior chest into the interscapular back?',
        category: 'History',
        clinicalRationale: 'Intimal flap tear and rapid propagation of blood through the false lumen generates characteristic ripping pain.',
        expectedAnswer: 'yes',
        diagnosticYield: 10
      },
      {
        questionId: 'q_dissection_pulse_deficit',
        questionText: 'Is there a pulse deficit or > 20 mmHg blood pressure differential between the right and left upper extremities?',
        category: 'Bedside Sign',
        clinicalRationale: 'Compression of the brachiocephalic or left subclavian artery by the dissecting hematoma creates asymmetric pulses.',
        expectedAnswer: 'yes',
        diagnosticYield: 10
      },
      {
        questionId: 'q_dissection_diastolic_murmur',
        questionText: 'Is a new early diastolic blowing murmur of acute aortic regurgitation audible along the right sternal border?',
        category: 'Physical Exam',
        clinicalRationale: 'Retrograde dissection into the aortic root disrupts commissural leaflet support leading to acute AR.',
        expectedAnswer: 'yes',
        diagnosticYield: 9
      }
    ]
  },

  // =========================================================================
  // TOXICOLOGY
  // =========================================================================
  'organophosphate_poisoning': {
    diseaseId: 'organophosphate_poisoning',
    name: 'Organophosphate / Carbamate Poisoning (Acute Cholinergic Toxidrome)',
    system: 'toxicology',
    nearestNeighbors: [
      { diseaseId: 'carbamate_toxicity', name: 'Acute Carbamate Insecticide Toxicity', similarity: 0.95, clinicalReason: 'Reversible AChE carbamylation; near identical muscarinic symptoms without irreversible aging.' },
      { diseaseId: 'muscarine_mushroom', name: 'Toxic Mushroom Ingestion (Muscarine-containing Inocybe / Clitocybe)', similarity: 0.84, clinicalReason: 'Direct muscarinic agonist toxicity (salivation, lacrimation, bradycardia) without nicotinic fasciculations.' },
      { diseaseId: 'myasthenia_crisis', name: 'Myasthenia Gravis Cholinergic Crisis', similarity: 0.78, clinicalReason: 'Overdose of anticholinesterase medication (Pyridostigmine) producing excess acetylcholine.' },
      { diseaseId: 'opioid_overdose', name: 'Acute Opioid Intoxication / Overdose', similarity: 0.69, clinicalReason: 'Pinpoint miosis and respiratory depression.' }
    ],
    hallmarkQuestions: [
      {
        questionId: 'q_tox_pesticide_exposure',
        questionText: 'Was the patient directly handling, mixing, or spraying commercial agricultural pesticides / organophosphate insecticides prior to symptom onset?',
        category: 'History',
        clinicalRationale: 'Confirms occupational or accidental transdermal/inhalation exposure route for acetylcholinesterase inhibition.',
        expectedAnswer: 'yes',
        diagnosticYield: 10
      },
      {
        questionId: 'q_tox_killer_bs',
        questionText: 'Are pathognomonic "Killer B\'s" present: severe bronchorrhea (copious frothy airway secretions), diffuse bronchospasm, and symptomatic bradycardia?',
        category: 'Bedside Sign',
        clinicalRationale: 'Uncontrolled muscarinic hyperstimulation of bronchial submucosal glands and cardiac M2 receptors leads to fatal asphyxiation.',
        expectedAnswer: 'yes',
        diagnosticYield: 10
      },
      {
        questionId: 'q_tox_pinpoint_pupils',
        questionText: 'Are the pupils constricted to pinpoint size (miosis, <= 1mm) bilaterally accompanied by profuse salivation and lacrimation?',
        category: 'Physical Exam',
        clinicalRationale: 'Excess acetylcholine stimulation of iris sphincter muscle and parasympathetic lacrimal/salivary glands.',
        expectedAnswer: 'yes',
        diagnosticYield: 9
      },
      {
        questionId: 'q_tox_fasciculations',
        questionText: 'Are visible involuntary muscle twitches (fasciculations) or motor weakness present in the chest wall, tongue, or arms?',
        category: 'Physical Exam',
        clinicalRationale: 'Persistent acetylcholine accumulation at neuromuscular junction nicotinic receptors causes initial fasciculations followed by flaccid paralysis.',
        expectedAnswer: 'yes',
        diagnosticYield: 9
      }
    ]
  },

  // =========================================================================
  // OB-GYN & SURGICAL ABDOMEN
  // =========================================================================
  'ruptured_ectopic': {
    diseaseId: 'ruptured_ectopic',
    name: 'Ruptured ectopic pregnancy',
    system: 'obgyn',
    nearestNeighbors: [
      { diseaseId: 'ovarian_torsion', name: 'Acute ovarian torsion', similarity: 0.88, clinicalReason: 'Sudden severe unilateral pelvic pain with nausea in female of reproductive age.' },
      { diseaseId: 'ruptured_ovarian_cyst', name: 'Ruptured hemorrhagic ovarian cyst', similarity: 0.87, clinicalReason: 'Acute adnexal pain with hemoperitoneum and peritoneal signs.' },
      { diseaseId: 'pelvic_inflammatory_disease', name: 'Pelvic inflammatory disease (PID / Tubo-ovarian abscess)', similarity: 0.81, clinicalReason: 'Lower quadrant tenderness, cervical motion tenderness (CMT), and vaginal discharge.' },
      { diseaseId: 'appendicitis', name: 'Acute appendicitis', similarity: 0.79, clinicalReason: 'Right lower quadrant abdominal pain with peritonitis.' }
    ],
    hallmarkQuestions: [
      {
        questionId: 'q_ectopic_amenorrhea',
        questionText: 'Is the patient a female of reproductive age with a history of missed menstrual period (amenorrhea for 6 to 8 weeks) and recent light vaginal spotting?',
        category: 'History',
        clinicalRationale: 'Decidual sloughing and amenorrhea signify blastocyst implantation outside the uterine cavity.',
        expectedAnswer: 'yes',
        diagnosticYield: 10
      },
      {
        questionId: 'q_ectopic_kehr_shoulder',
        questionText: 'Is the sudden sharp lower abdominal pain now radiating to the ipsilateral shoulder tip (positive Kehr\'s sign)?',
        category: 'History',
        clinicalRationale: 'Free hemoperitoneum irritates the diaphragmatic parietal peritoneum, referring pain via the phrenic nerve (C3-C5).',
        expectedAnswer: 'yes',
        diagnosticYield: 9
      },
      {
        questionId: 'q_ectopic_cmt',
        questionText: 'On pelvic bimanual examination, is exquisite cervical motion tenderness (CMT / Chandelier sign) or right/left adnexal fullness elicited?',
        category: 'Physical Exam',
        clinicalRationale: 'Distension and rupture of the fallopian tube triggers intense local peritoneal inflammation upon cervical mobilization.',
        expectedAnswer: 'yes',
        diagnosticYield: 10
      },
      {
        questionId: 'q_ectopic_shock',
        questionText: 'Are there signs of Class III hemorrhagic shock: marked tachycardia (HR > 120 bpm), hypotension (SBP < 90), or orthostatic syncope upon standing?',
        category: 'Red Flag',
        clinicalRationale: 'Signals ongoing arterial bleeding from the tubal branch of the uterine artery requiring STAT surgical laparotomy.',
        expectedAnswer: 'yes',
        diagnosticYield: 9
      }
    ]
  },

  'appendicitis': {
    diseaseId: 'appendicitis',
    name: 'Acute appendicitis',
    system: 'gi',
    nearestNeighbors: [
      { diseaseId: 'mesenteric_adenitis', name: 'Mesenteric adenitis', similarity: 0.89, clinicalReason: 'Right lower quadrant pain in young patients following viral illness.' },
      { diseaseId: 'diverticulitis', name: 'Acute diverticulitis (Right-sided / Cecal)', similarity: 0.83, clinicalReason: 'Focal colonic wall inflammation with localized peritonitis.' },
      { diseaseId: 'ruptured_ectopic', name: 'Ruptured ectopic pregnancy', similarity: 0.79, clinicalReason: 'RLQ pain with peritonitis in females of childbearing age.' },
      { diseaseId: 'cholecystitis', name: 'Acute calculous cholecystitis', similarity: 0.74, clinicalReason: 'Acute visceral quadrant pain with fever and leukocytosis.' }
    ],
    hallmarkQuestions: [
      {
        questionId: 'q_app_visceral_somatic_migration',
        questionText: 'Did the abdominal pain start around the belly button (periumbilical) before migrating and localizing specifically to the right lower quadrant (RLQ)?',
        category: 'History',
        clinicalRationale: 'Classic visceral T10 dermatome pain shifts to somatic parietal peritoneal innervation at McBurney\'s point as luminal distension advances.',
        expectedAnswer: 'yes',
        diagnosticYield: 10
      },
      {
        questionId: 'q_app_mcburney_rebound',
        questionText: 'Is there exquisite focal tenderness and rebound tenderness when pressing at McBurney\'s point (one-third the distance from the ASIS to umbilicus)?',
        category: 'Physical Exam',
        clinicalRationale: 'Direct anatomical localization of the inflamed appendix against the anterior abdominal wall.',
        expectedAnswer: 'yes',
        diagnosticYield: 9
      },
      {
        questionId: 'q_app_rovsing_sign',
        questionText: 'Does palpation of the left lower quadrant produce sharp referred pain in the right lower quadrant (positive Rovsing\'s sign)?',
        category: 'Physical Exam',
        clinicalRationale: 'Retrograde displacement of colonic gas increases cecal intraluminal pressure, stretching the inflamed appendix.',
        expectedAnswer: 'yes',
        diagnosticYield: 8
      },
      {
        questionId: 'q_app_anorexia_psoas',
        questionText: 'Has the patient lost all appetite (anorexia / "hamburger sign") with pain provoked by extending the right hip (positive Psoas sign)?',
        category: 'Physical Exam',
        clinicalRationale: 'Retrocecal appendix irritation of the underlying iliopsoas muscle belly.',
        expectedAnswer: 'yes',
        diagnosticYield: 8
      }
    ]
  },

  // =========================================================================
  // INFECTIOUS & ENDEMIC
  // =========================================================================
  'malaria': {
    diseaseId: 'malaria',
    name: 'Falciparum malaria',
    system: 'infectious',
    nearestNeighbors: [
      { diseaseId: 'dengue', name: 'Dengue fever / Severe dengue', similarity: 0.91, clinicalReason: 'High tropical fevers, severe headache, retro-orbital ache, and thrombocytopenia.' },
      { diseaseId: 'typhoid', name: 'Enteric (Typhoid) Fever (Salmonella Typhi)', similarity: 0.86, clinicalReason: 'Prolonged fevers and hepatosplenomegaly following travel to endemic regions.' },
      { diseaseId: 'leptospirosis', name: 'Leptospirosis (Weil\'s disease)', similarity: 0.83, clinicalReason: 'High fever, jaundice, dark urine, and conjunctival suffusion.' },
      { diseaseId: 'bacterial_meningitis', name: 'Acute bacterial meningitis', similarity: 0.72, clinicalReason: 'High fever, severe headache, and altered mental status (Cerebral Malaria mimic).' }
    ],
    hallmarkQuestions: [
      {
        questionId: 'q_malaria_cyclical_fevers',
        questionText: 'Are the fevers accompanied by violent, bed-shaking shivering chills (rigors) followed by high pyrexia and drenching sweats every 48 hours (Tertian paroxysm)?',
        category: 'History',
        clinicalRationale: 'Synchronous rupture of mature erythrocytic schizonts releases merozoites, hemozoin, and TNF-alpha pyrogens.',
        expectedAnswer: 'yes',
        diagnosticYield: 10
      },
      {
        questionId: 'q_malaria_travel_endemic',
        questionText: 'Did the patient travel to or return from a malaria-endemic region (e.g. Sub-Saharan Africa, South Asia) within the last 1 to 4 weeks without chemoprophylaxis?',
        category: 'History',
        clinicalRationale: 'Plasmodium falciparum incubation period typically ranges from 9 to 30 days.',
        expectedAnswer: 'yes',
        diagnosticYield: 10
      },
      {
        questionId: 'q_malaria_hemolysis',
        questionText: 'Has the patient or family noted yellowing of the eyes (scleral icterus), tea-colored dark urine (blackwater fever), or marked pallor?',
        category: 'Physical Exam',
        clinicalRationale: 'Massive intravascular hemolysis and splenic clearance of parasitized red blood cells generates unconjugated hyperbilirubinemia.',
        expectedAnswer: 'yes',
        diagnosticYield: 9
      },
      {
        questionId: 'q_malaria_splenomegaly',
        questionText: 'On abdominal examination, is a tender palpable spleen edge detected beneath the left costal margin (splenomegaly)?',
        category: 'Physical Exam',
        clinicalRationale: 'Reticuloendothelial system hypertrophy filtering rigid parasitized erythrocytes.',
        expectedAnswer: 'yes',
        diagnosticYield: 8
      }
    ]
  },

  'dengue': {
    diseaseId: 'dengue',
    name: 'Dengue fever / Severe dengue',
    system: 'infectious',
    nearestNeighbors: [
      { diseaseId: 'malaria', name: 'Falciparum malaria', similarity: 0.91, clinicalReason: 'High tropical fever with severe myalgias and headache.' },
      { diseaseId: 'typhoid', name: 'Enteric (Typhoid) Fever', similarity: 0.84, clinicalReason: 'Travel-related persistent fever with cytopenias.' },
      { diseaseId: 'chikungunya', name: 'Chikungunya virus infection', similarity: 0.89, clinicalReason: 'Arboviral illness with debilitating arthralgias and cutaneous eruption.' }
    ],
    hallmarkQuestions: [
      {
        questionId: 'q_dengue_retro_orbital',
        questionText: 'Is the severe headache characterized by intense, excruciating pain behind the eyes (retro-orbital cephalalgia) exacerbated by eye movement?',
        category: 'History',
        clinicalRationale: 'Classic hallmark discriminator for Dengue flavivirus over other tropical fevers.',
        expectedAnswer: 'yes',
        diagnosticYield: 10
      },
      {
        questionId: 'q_dengue_breakbone',
        questionText: 'Is the patient suffering from debilitating, bone-crushing muscle and joint pains ("breakbone fever") throughout the spine and extremities?',
        category: 'History',
        clinicalRationale: 'Severe myalgias and polyarthralgias resulting from immune cytokine cascade.',
        expectedAnswer: 'yes',
        diagnosticYield: 9
      },
      {
        questionId: 'q_dengue_petechiae',
        questionText: 'Are there spontaneous cutaneous petechiae, gum bleeding, or a positive tourniquet test (> 10 petechiae per square inch)?',
        category: 'Physical Exam',
        clinicalRationale: 'Capillary hyperpermeability and profound immune-mediated thrombocytopenia.',
        expectedAnswer: 'yes',
        diagnosticYield: 9
      }
    ]
  },

  'bacterial_meningitis': {
    diseaseId: 'bacterial_meningitis',
    name: 'Acute bacterial meningitis',
    system: 'infectious',
    nearestNeighbors: [
      { diseaseId: 'spontaneous_sah', name: 'Spontaneous subarachnoid hemorrhage (SAH)', similarity: 0.87, clinicalReason: 'Sudden catastrophic headache, photophobia, and nuchal rigidity.' },
      { diseaseId: 'herpes_encephalitis', name: 'Herpes simplex viral encephalitis', similarity: 0.85, clinicalReason: 'Fever, headache, altered mental status, and focal temporal deficits.' },
      { diseaseId: 'acute_ischemic_stroke', name: 'Acute ischemic stroke (MCA territory)', similarity: 0.72, clinicalReason: 'Acute altered sensorium and focal intracranial presentation.' }
    ],
    hallmarkQuestions: [
      {
        questionId: 'q_mening_nuchal_rigidity',
        questionText: 'Is there marked neck stiffness (nuchal rigidity) with severe resistance or inability to touch chin to chest on passive neck flexion?',
        category: 'Physical Exam',
        clinicalRationale: 'Leptomeningeal purulent exudate causes severe mechanical stretch irritation of spinal nerve roots.',
        expectedAnswer: 'yes',
        diagnosticYield: 10
      },
      {
        questionId: 'q_mening_kernig_brudzinski',
        questionText: 'Are Kernig\'s sign (knee extension resistance with hip flexed) or Brudzinski\'s sign (involuntary hip/knee flexion upon neck flexion) positive?',
        category: 'Physical Exam',
        clinicalRationale: 'Pathognomonic meningeal irritation signs indicating diffuse subarachnoid inflammation.',
        expectedAnswer: 'yes',
        diagnosticYield: 10
      },
      {
        questionId: 'q_mening_petechial_rash',
        questionText: 'Is a non-blanching petechial or purpuric skin rash present (failing to fade under a glass tumbler / positive glass test)?',
        category: 'Physical Exam',
        clinicalRationale: 'Pathognomonic for Neisseria meningitidis endotoxemia, DIC, and microvascular purpura fulminans.',
        expectedAnswer: 'yes',
        diagnosticYield: 10
      },
      {
        questionId: 'q_mening_photophobia',
        questionText: 'Does normal room light cause excruciating eye and head pain (severe photophobia) accompanied by projectile vomiting?',
        category: 'History',
        clinicalRationale: 'Acute intracranial hypertension and direct irritation of cranial meninges.',
        expectedAnswer: 'yes',
        diagnosticYield: 9
      }
    ]
  },

  'diabetic_ketoacidosis': {
    diseaseId: 'diabetic_ketoacidosis',
    name: 'Diabetic ketoacidosis (DKA)',
    system: 'endocrine',
    nearestNeighbors: [
      { diseaseId: 'hhs', name: 'Hyperosmolar Hyperglycemic State (HHS)', similarity: 0.92, clinicalReason: 'Profound hyperglycemia and dehydration in diabetes mellitus.' },
      { diseaseId: 'acute_hypoglycemia', name: 'Acute hypoglycemia', similarity: 0.85, clinicalReason: 'Diabetic glycemic crisis with altered sensorium.' },
      { diseaseId: 'appendicitis', name: 'Acute appendicitis / Pseudo-acute abdomen', similarity: 0.76, clinicalReason: 'Severe diffuse abdominal pain and vomiting mimicking a surgical abdomen.' }
    ],
    hallmarkQuestions: [
      {
        questionId: 'q_dka_kussmaul',
        questionText: 'Is the patient taking abnormally deep, rapid, sighing breaths (Kussmaul breathing) in an effort to blow off acid?',
        category: 'Physical Exam',
        clinicalRationale: 'Respiratory center compensation for severe high-anion gap metabolic ketoacidosis.',
        expectedAnswer: 'yes',
        diagnosticYield: 10
      },
      {
        questionId: 'q_dka_fruity_acetone_breath',
        questionText: 'Is there a distinct sweet, fruity, acetone-like chemical odor detectable on the patient\'s exhaled breath?',
        category: 'Bedside Sign',
        clinicalRationale: 'Volatilization and pulmonary elimination of acetoacetate and acetone ketone bodies.',
        expectedAnswer: 'yes',
        diagnosticYield: 10
      },
      {
        questionId: 'q_dka_polyuria_polydipsia',
        questionText: 'Preceding the acute vomiting and diffuse abdominal pain, was there intense unquenchable thirst (polydipsia) and copious urination (polyuria)?',
        category: 'History',
        clinicalRationale: 'Severe osmotic diuresis induced by plasma glucose exceeding the renal tubular reabsorptive threshold (> 180 mg/dL).',
        expectedAnswer: 'yes',
        diagnosticYield: 9
      },
      {
        questionId: 'q_dka_insulin_omission',
        questionText: 'Does the patient have a history of Type 1 Diabetes with recent insulin omission, or a concurrent febrile infection?',
        category: 'History',
        clinicalRationale: 'Absolute insulin deficiency unleashes uninhibited lipolysis and hepatic ketogenesis.',
        expectedAnswer: 'yes',
        diagnosticYield: 9
      }
    ]
  }
};

/**
 * Given a current prominent disease, finds the closest look-alike disease from the
 * proximity graph that has NOT yet been refuted by the user.
 */
export function findNearestNonRefutedDisease(
  currentDiseaseId: string,
  refutedDiseases: Set<string>
): NearestNeighbor | null {
  const node = DISEASE_PROXIMITY_GRAPH[currentDiseaseId];
  if (!node || !node.nearestNeighbors) {
    // If not found in explicit graph, search for any disease in same system
    return null;
  }

  for (const neighbor of node.nearestNeighbors) {
    if (!refutedDiseases.has(neighbor.diseaseId)) {
      return neighbor;
    }
  }

  return null;
}

/**
 * Returns the unasked hallmark question from the disease's diagnostic ladder.
 */
export function getNextHallmarkQuestionForDisease(
  diseaseId: string,
  askedQuestionIds: Set<string>
): HallmarkQuestion | null {
  const node = DISEASE_PROXIMITY_GRAPH[diseaseId];
  if (!node || !node.hallmarkQuestions) return null;

  for (const q of node.hallmarkQuestions) {
    if (!askedQuestionIds.has(q.questionId)) {
      return q;
    }
  }

  return null;
}

/**
 * Normalizes user text or candidate string into a recognized graph disease ID.
 */
export function normalizeDiseaseId(nameOrQuery: string): string {
  const lower = (nameOrQuery || '').toLowerCase();
  if (lower.includes('stroke') || lower.includes('mca') || lower.includes('cva') || lower.includes('hemiparesis')) {
    return 'acute_ischemic_stroke';
  }
  if (lower.includes('pesticide') || lower.includes('organophosphate') || lower.includes('carbamate') || lower.includes('crop') || lower.includes('cholinergic')) {
    return 'organophosphate_poisoning';
  }
  if (lower.includes('ectopic') || (lower.includes('spotting') && lower.includes('lower')) || lower.includes('adnexal')) {
    return 'ruptured_ectopic';
  }
  if (lower.includes('stemi') || lower.includes('myocardial infarction') || lower.includes('heart attack')) {
    if (lower.includes('atypical') || lower.includes('gnawing') || lower.includes('s4') || lower.includes('diabetic')) {
      return 'nstemi_atypical';
    }
    return 'stemi';
  }
  if (lower.includes('dissection') || (lower.includes('tearing') && lower.includes('chest'))) {
    return 'aortic_dissection';
  }
  if (lower.includes('malaria') || lower.includes('falciparum') || lower.includes('tertian')) {
    return 'malaria';
  }
  if (lower.includes('dengue') || lower.includes('breakbone') || lower.includes('retro-orbital')) {
    return 'dengue';
  }
  if (lower.includes('meningitis') || lower.includes('stiff neck') || lower.includes('nuchal')) {
    return 'bacterial_meningitis';
  }
  if (lower.includes('dka') || lower.includes('ketoacidosis') || lower.includes('kussmaul') || lower.includes('acetone')) {
    return 'diabetic_ketoacidosis';
  }
  if (lower.includes('appendicitis') || lower.includes('mcburney') || lower.includes('rlq')) {
    return 'appendicitis';
  }
  if (lower.includes('hypoglycemia') || lower.includes('low sugar') || lower.includes('dextrose')) {
    return 'acute_hypoglycemia';
  }

  return 'acute_ischemic_stroke';
}
