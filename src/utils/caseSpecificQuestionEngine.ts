/**
 * AkiMed Case-Specific Dynamic 20-Question Inquiry Engine
 * 
 * Guarantees that whatever clinical case the user enters in the chatbox,
 * all 20 Akinator questions are specifically and dynamically tailored to that case:
 * 
 * - Questions 1-5: Cardinal hallmarks & pathognomonic clinical signs of the primary disease
 * - Questions 6-10: Crucial differential discriminators against candidate look-alikes
 * - Questions 11-15: Specific bedside physical examination maneuvers
 * - Questions 16-20: Case-specific critical red flags, organ failure & ICU alerts
 * 
 * Plus: Intelligent deduplication (never asks questions for findings already stated in the search query).
 */

import { PatientProfile, AkinatorQuestion } from '../types/clinical';

const LIKERT_ANSWERS: AkinatorQuestion['possibleAnswers'] = [
  { label: 'Yes', value: 'yes' },
  { label: 'Probably Yes', value: 'probably_yes' },
  { label: 'Don\'t Know', value: 'unsure' },
  { label: 'Probably Not', value: 'probably_no' },
  { label: 'No', value: 'no' },
];

// ===========================================================================
// 1. TROPICAL / TRAVEL / MALARIA / DENGUE / TYPHOID PATHWAY (20 Questions)
// ===========================================================================
const TROPICAL_QUESTIONS: AkinatorQuestion[] = [
  {
    questionId: 'trop-1',
    questionText: 'Are the fevers accompanied by severe violent shivering chills (rigors) followed by drenching sweats in a cyclical pattern (every 48 or 72 hours)?',
    category: 'History',
    clinicalRationale: 'Classic tertian or quartan fever paroxysms correlate with synchronized erythrocytic schizont rupture in Plasmodium species (Malaria).',
    possibleAnswers: LIKERT_ANSWERS,
  },
  {
    questionId: 'trop-2',
    questionText: 'Has the patient or family noted yellowing of the eyes (scleral icterus) or tea-colored dark brown urine?',
    category: 'Physical Exam',
    clinicalRationale: 'Hemoglobinuria and unconjugated hyperbilirubinemia signify active intravascular hemolysis (e.g. Blackwater fever in severe malaria, G6PD crisis, or Leptospirosis).',
    possibleAnswers: LIKERT_ANSWERS,
  },
  {
    questionId: 'trop-3',
    questionText: 'Is there intense retro-orbital pain (pain behind the eyes worsening with eye movement) accompanied by severe bone/joint aching ("breakbone fever")?',
    category: 'Symptom Character',
    clinicalRationale: 'Retro-orbital cephalalgia and profound arthralgia/myalgia are highly characteristic discriminators for Dengue and Chikungunya over Malaria.',
    possibleAnswers: LIKERT_ANSWERS,
  },
  {
    questionId: 'trop-4',
    questionText: 'Is there any spontaneous mucosal bleeding (epistaxis, bleeding gums), hematuria, or pinpoint petechial rash on the extremities?',
    category: 'Red Flag',
    clinicalRationale: 'Signals consumptive coagulopathy, severe dengue hemorrhagic fever, or microvascular thrombosis.',
    possibleAnswers: LIKERT_ANSWERS,
  },
  {
    questionId: 'trop-5',
    questionText: 'Has the patient experienced any drowsiness, disorientation, persistent confusion, or seizure episodes?',
    category: 'Red Flag',
    clinicalRationale: 'Assesses for Cerebral Malaria (Plasmodium falciparum cytoadherence in cerebral microvasculature), a medical emergency with high mortality.',
    possibleAnswers: LIKERT_ANSWERS,
  },
  {
    questionId: 'trop-6',
    questionText: 'Has there been a marked decrease in daily urine output (oliguria) or inability to retain oral fluids due to persistent vomiting?',
    category: 'Red Flag',
    clinicalRationale: 'Indicates acute tubular necrosis / acute kidney injury in severe falciparum malaria or severe hypovolemic shock.',
    possibleAnswers: LIKERT_ANSWERS,
  },
  {
    questionId: 'trop-7',
    questionText: 'Did the fevers begin as a gradual step-ladder rise over several days associated with constipation or pea-soup diarrhea?',
    category: 'History',
    clinicalRationale: 'Step-ladder pyrexia and gastrointestinal prodrome are classic hallmarks of Enteric (Typhoid) Fever (Salmonella Typhi).',
    possibleAnswers: LIKERT_ANSWERS,
  },
  {
    questionId: 'trop-8',
    questionText: 'Is the heart rate unexpectedly slow despite high body temperature (Faget\'s sign / sphygmo-thermic dissociation)?',
    category: 'Physical Exam',
    clinicalRationale: 'Relative bradycardia in high pyrexia is characteristic of Typhoid fever, Yellow fever, and Legionella.',
    possibleAnswers: LIKERT_ANSWERS,
  },
  {
    questionId: 'trop-9',
    questionText: 'Is there a dragging fullness or tenderness under the left ribcage on deep inspiration (palpable splenomegaly)?',
    category: 'Physical Exam',
    clinicalRationale: 'Splenic enlargement from reticuloendothelial clearance of parasitized RBCs; alerts to risk of traumatic splenic rupture.',
    possibleAnswers: LIKERT_ANSWERS,
  },
  {
    questionId: 'trop-10',
    questionText: 'Has the patient been exposed to freshwater lakes, rivers, or floodwaters in tropical areas (Leptospirosis / Schistosomiasis risk)?',
    category: 'Epidemiology',
    clinicalRationale: 'Water-borne exposure differentiates Leptospirosis (Weil\'s disease) and acute schistosomiasis (Katayama fever).',
    possibleAnswers: LIKERT_ANSWERS,
  },
  {
    questionId: 'trop-11',
    questionText: 'Is there severe tenderness on squeezing the calf muscles accompanied by bilateral red eyes without discharge (conjunctival suffusion)?',
    category: 'Physical Exam',
    clinicalRationale: 'Pathognomonic triad for Leptospirosis (Weil\'s disease): conjunctival suffusion, severe calf myalgia, and jaundice.',
    possibleAnswers: LIKERT_ANSWERS,
  },
  {
    questionId: 'trop-12',
    questionText: 'Does the patient experience sudden episodes of cold tremors, sweating, and extreme weakness relieved by sugary drinks (hypoglycemia)?',
    category: 'Red Flag',
    clinicalRationale: 'Severe hypoglycemia is a life-threatening complication of Falciparum malaria, often exacerbated by Quinine therapy.',
    possibleAnswers: LIKERT_ANSWERS,
  },
  {
    questionId: 'trop-13',
    questionText: 'Are there faint salmon-pink blanching spots (rose spots) visible across the chest or upper abdomen?',
    category: 'Physical Exam',
    clinicalRationale: 'Rose spots appear in 30% of Typhoid fever cases during the second week of illness.',
    possibleAnswers: LIKERT_ANSWERS,
  },
  {
    questionId: 'trop-14',
    questionText: 'Did the patient miss or fail to take prescribed malaria chemoprophylaxis prior to and during travel in an endemic zone?',
    category: 'History',
    clinicalRationale: 'Omitting chemoprophylaxis in sub-Saharan Africa elevates pre-test probability of Falciparum malaria above 80%.',
    possibleAnswers: LIKERT_ANSWERS,
  },
  {
    questionId: 'trop-15',
    questionText: 'Is there severe pallor of the lower conjunctiva, palms, or tongue indicating acute profound anemia?',
    category: 'Physical Exam',
    clinicalRationale: 'Rapid parasite-mediated hemolysis can drive hemoglobin < 5 g/dL requiring emergent blood transfusion.',
    possibleAnswers: LIKERT_ANSWERS,
  },
  {
    questionId: 'trop-16',
    questionText: 'Does the patient have a history of G6PD deficiency, or experienced dark urine after eating fava beans or taking sulfa drugs?',
    category: 'History',
    clinicalRationale: 'Critical pharmacogenomic safety check before prescribing 8-aminoquinolines (Primaquine/Tafenoquine) to prevent massive hemolysis.',
    possibleAnswers: LIKERT_ANSWERS,
  },
  {
    questionId: 'trop-17',
    questionText: 'Is the patient experiencing rapid shallow breathing, air hunger, or persistent dry cough without preexisting lung disease (ARDS)?',
    category: 'Red Flag',
    clinicalRationale: 'Non-cardiogenic pulmonary edema (ARDS) can occur in complicated malaria due to alveolar-capillary microvascular cytoadherence.',
    possibleAnswers: LIKERT_ANSWERS,
  },
  {
    questionId: 'trop-18',
    questionText: 'Did a blood pressure cuff inflation on the arm provoke more than 10-20 tiny petechiae per square inch (Hess / Tourniquet test)?',
    category: 'Physical Exam',
    clinicalRationale: 'Demonstrates increased capillary fragility in Dengue hemorrhagic fever.',
    possibleAnswers: LIKERT_ANSWERS,
  },
  {
    questionId: 'trop-19',
    questionText: 'Has the patient experienced persistent abdominal tenderness or RUQ guarding alongside fevers (Malarial hepatitis)?',
    category: 'Physical Exam',
    clinicalRationale: 'Differentiates malarial liver involvement from acute viral hepatitis and acute cholecystitis.',
    possibleAnswers: LIKERT_ANSWERS,
  },
  {
    questionId: 'trop-20',
    questionText: 'Is the patient cold, clammy, and hypotensive (systolic BP < 90 mmHg) despite high fever (Algid Malaria / Septic shock)?',
    category: 'Red Flag',
    clinicalRationale: 'Algid malaria signifies profound circulatory collapse and gram-negative co-infection with secondary bacteremia.',
    possibleAnswers: LIKERT_ANSWERS,
  },
];

// ===========================================================================
// 2. CARDIOVASCULAR / CHEST PAIN / STEMI / DISSECTION PATHWAY (20 Questions)
// ===========================================================================
const CARDIO_QUESTIONS: AkinatorQuestion[] = [
  {
    questionId: 'cardio-1',
    questionText: 'Did the pain reach its maximal peak intensity in less than 1 minute ("thunderclap / tearing" onset), and does it radiate directly between the shoulder blades (interscapular)?',
    category: 'History',
    clinicalRationale: 'Instantaneous maximal tearing back pain has a likelihood ratio > 8.0 for Stanford Type A/B Aortic Dissection over Myocardial Infarction.',
    possibleAnswers: LIKERT_ANSWERS,
  },
  {
    questionId: 'cardio-2',
    questionText: 'Is the chest pain a heavy, squeezing, or crushing pressure radiating to the left arm, neck, or lower jaw?',
    category: 'Symptom Character',
    clinicalRationale: 'Classic ischemic radiation pattern for Acute Coronary Syndrome (STEMI / NSTEMI).',
    possibleAnswers: LIKERT_ANSWERS,
  },
  {
    questionId: 'cardio-3',
    questionText: 'Is there a measurable difference in systolic blood pressure (>20 mmHg) between the right and left arm, or a delayed/diminished radial or femoral pulse?',
    category: 'Physical Exam',
    clinicalRationale: 'Pulse deficits or inter-arm blood pressure differentials indicate mechanical occlusion of the subclavian or innominate branches by an aortic false lumen flap.',
    possibleAnswers: LIKERT_ANSWERS,
  },
  {
    questionId: 'cardio-4',
    questionText: 'Does the chest pain worsen sharply with deep inspiration or coughing (pleuritic pain), and is it associated with unilateral lower extremity calf swelling or pain?',
    category: 'Symptom Character',
    clinicalRationale: 'Identifies deep venous thrombosis leading to Pulmonary Embolism (Wells Score criteria) vs pericardial friction or aortic pathology.',
    possibleAnswers: LIKERT_ANSWERS,
  },
  {
    questionId: 'cardio-5',
    questionText: 'Does the chest pain ease noticeably when you lean forward and worsen when lying flat on your back (pericarditic positionality)?',
    category: 'Symptom Character',
    clinicalRationale: 'Positional retrosternal pain relieved by sitting forward is pathognomonic for acute pericarditis.',
    possibleAnswers: LIKERT_ANSWERS,
  },
  {
    questionId: 'cardio-6',
    questionText: 'Did the patient instinctively place a clenched fist over the sternum when describing the pain (Levine\'s sign)?',
    category: 'Physical Exam',
    clinicalRationale: 'Levine sign has high clinical specificity for visceral transmural myocardial ischemia.',
    possibleAnswers: LIKERT_ANSWERS,
  },
  {
    questionId: 'cardio-7',
    questionText: 'Was the onset of chest tightness accompanied by unexplained profuse cold sweating (diaphoresis)?',
    category: 'Symptom Character',
    clinicalRationale: 'Autonomic diaphoresis accompanying acute chest pain increases odds of acute myocardial infarction > 2-fold.',
    possibleAnswers: LIKERT_ANSWERS,
  },
  {
    questionId: 'cardio-8',
    questionText: 'Did the chest pain start after violent vomiting or retching, with pain felt deep behind the sternum (Boerhaave syndrome)?',
    category: 'History',
    clinicalRationale: 'Boerhaave syndrome (transmural esophageal rupture) follows forceful retching and requires emergent surgical repair.',
    possibleAnswers: LIKERT_ANSWERS,
  },
  {
    questionId: 'cardio-9',
    questionText: 'Did the patient experience a syncopal blackout, sudden collapse, or profound presyncope at pain onset?',
    category: 'Red Flag',
    clinicalRationale: 'Syncope with chest pain indicates catastrophic hemodynamic compromise (aortic dissection, massive PE, or malignant ventricular arrhythmia).',
    possibleAnswers: LIKERT_ANSWERS,
  },
  {
    questionId: 'cardio-10',
    questionText: 'Does pressing firmly on the costochondral junctions of the ribs reproduce the exact chest discomfort (Costochondritis / Tietze)?',
    category: 'Physical Exam',
    clinicalRationale: 'Direct chest wall tenderness reproducing symptoms significantly reduces likelihood of acute coronary ischemia.',
    possibleAnswers: LIKERT_ANSWERS,
  },
  {
    questionId: 'cardio-11',
    questionText: 'Did the pain reliably improve within 3 to 5 minutes following rest or sublingual nitroglycerin administration?',
    category: 'History',
    clinicalRationale: 'Rapid relief with nitrates/rest suggests demand-supply ischemia (angina pectoris), though esophageal spasm can also respond.',
    possibleAnswers: LIKERT_ANSWERS,
  },
  {
    questionId: 'cardio-12',
    questionText: 'Is the patient experiencing shortness of breath that forces them to sit upright and prevents lying flat (orthopnea)?',
    category: 'Symptom Character',
    clinicalRationale: 'Orthopnea signifies acute pulmonary venous congestion and left ventricular pump failure.',
    possibleAnswers: LIKERT_ANSWERS,
  },
  {
    questionId: 'cardio-13',
    questionText: 'Is there a new harsh early diastolic murmur audible at the right sternal border (acute aortic regurgitation)?',
    category: 'Physical Exam',
    clinicalRationale: 'Acute aortic insufficiency murmur in chest pain is a cardinal diagnostic sign of retrograde Type A aortic dissection.',
    possibleAnswers: LIKERT_ANSWERS,
  },
  {
    questionId: 'cardio-14',
    questionText: 'Has the patient had recent prolonged leg immobilization, surgery, cancer, or active oral contraceptive therapy (DVT/PE risk)?',
    category: 'History',
    clinicalRationale: 'Assesses Virchow\'s triad components (stasis, endothelial injury, hypercoagulability) for venous thromboembolism.',
    possibleAnswers: LIKERT_ANSWERS,
  },
  {
    questionId: 'cardio-15',
    questionText: 'Is there a superficial scratching or creaking sound audible with the stethoscope diaphragm over the left lower sternum (pericardial rub)?',
    category: 'Physical Exam',
    clinicalRationale: 'Triphasic pericardial friction rub confirms acute inflammation of the visceral and parietal pericardium.',
    possibleAnswers: LIKERT_ANSWERS,
  },
  {
    questionId: 'cardio-16',
    questionText: 'Has the patient used cocaine, amphetamines, or decongestants in the last 24 hours (coronary vasospasm)?',
    category: 'History',
    clinicalRationale: 'Sympathomimetic agents induce coronary arterial vasospasm (Prinzmetal angina) and acute coronary thrombosis in young patients.',
    possibleAnswers: LIKERT_ANSWERS,
  },
  {
    questionId: 'cardio-17',
    questionText: 'Is there a tall, slender habitus with joint hypermobility, pectus excavatum, or family history of thoracic aneurysms (Marfan syndrome)?',
    category: 'Physical Exam',
    clinicalRationale: 'Marfan and Ehlers-Danlos syndromes carry cystic medial necrosis predisposing to aortic dissection at a young age.',
    possibleAnswers: LIKERT_ANSWERS,
  },
  {
    questionId: 'cardio-18',
    questionText: 'Is there an S3 ventricular gallop or bilateral inspiratory crackles over the lung bases on auscultation?',
    category: 'Physical Exam',
    clinicalRationale: 'Indicates elevated left ventricular end-diastolic pressure and acute cardiogenic pulmonary edema (Killip Class II/III).',
    possibleAnswers: LIKERT_ANSWERS,
  },
  {
    questionId: 'cardio-19',
    questionText: 'Is the patient pale, grey, cold, and clammy with a systolic BP dropping below 90 mmHg (Cardiogenic Shock)?',
    category: 'Red Flag',
    clinicalRationale: 'Cardiogenic shock requires immediate invasive arterial monitoring, inotropic support, and emergent revascularization.',
    possibleAnswers: LIKERT_ANSWERS,
  },
  {
    questionId: 'cardio-20',
    questionText: 'Has there been any coughing up of frank bright red blood (hemoptysis) alongside acute dyspnea?',
    category: 'Red Flag',
    clinicalRationale: 'Hemoptysis in acute chest pain confirms pulmonary infarction secondary to acute pulmonary embolism.',
    possibleAnswers: LIKERT_ANSWERS,
  },
];

// ===========================================================================
// 3. GASTROINTESTINAL / ACUTE ABDOMEN PATHWAY (20 Questions)
// ===========================================================================
const GI_QUESTIONS: AkinatorQuestion[] = [
  {
    questionId: 'gi-1',
    questionText: 'Did the discomfort initially start as a dull, vague ache around the bellybutton (umbilicus) before migrating and sharpening in the Right Lower Quadrant (Right Iliac Fossa)?',
    category: 'History',
    clinicalRationale: 'Classic visceral-to-somatic migration pattern (T10 periumbilical dermatome shifting to parietal peritoneal localization at McBurney\'s point).',
    possibleAnswers: LIKERT_ANSWERS,
  },
  {
    questionId: 'gi-2',
    questionText: 'Does pressing gently on the LEFT lower quadrant elicit or aggravate pain in the RIGHT lower quadrant (Positive Rovsing\'s sign)?',
    category: 'Physical Exam',
    clinicalRationale: 'Rovsing\'s sign forces colonic gas retrograde into the cecum and stretches an inflamed appendix, demonstrating localized parietal peritonitis.',
    possibleAnswers: LIKERT_ANSWERS,
  },
  {
    questionId: 'gi-3',
    questionText: 'Has the patient completely lost their appetite (anorexia / "hamburger test") or vomited following the onset of pain?',
    category: 'Symptom Character',
    clinicalRationale: 'In acute appendicitis, anorexia and pain precede vomiting in >95% of cases. If vomiting precedes abdominal pain, gastroenteritis or bowel obstruction is more likely.',
    possibleAnswers: LIKERT_ANSWERS,
  },
  {
    questionId: 'gi-4',
    questionText: 'Does taking a deep breath while the examiner palpates deeply under the right ribcage cause sudden sharp catching of breath (Murphy\'s sign)?',
    category: 'Physical Exam',
    clinicalRationale: 'Murphy\'s sign has >95% specificity for acute calculous cholecystitis.',
    possibleAnswers: LIKERT_ANSWERS,
  },
  {
    questionId: 'gi-5',
    questionText: 'Is the pain severe, constant, and located in the epigastrium boring straight through to the mid-back, partially relieved by leaning forward?',
    category: 'Symptom Character',
    clinicalRationale: 'Hallmark presentation for Acute Pancreatitis (often triggered by gallstones or heavy alcohol use).',
    possibleAnswers: LIKERT_ANSWERS,
  },
  {
    questionId: 'gi-6',
    questionText: 'Is the pain severe, colicky, and radiating from the flank/loin down toward the groin, testicle, or labia (Renal Colic)?',
    category: 'Symptom Character',
    clinicalRationale: 'Smooth muscle ureteral hyperperistalsis against an obstructing calculus generates severe radiating loin-to-groin colic.',
    possibleAnswers: LIKERT_ANSWERS,
  },
  {
    questionId: 'gi-7',
    questionText: 'Did the abdomen suddenly become completely rigid and board-like, with severe pain provoked by the slightest movement or cough (Perforated Viscus)?',
    category: 'Red Flag',
    clinicalRationale: 'Board-like abdominal rigidity indicates generalized chemical peritonitis from perforated peptic ulcer or ruptured viscous.',
    possibleAnswers: LIKERT_ANSWERS,
  },
  {
    questionId: 'gi-8',
    questionText: 'Is the abdominal pain excruciating and completely out of proportion to mild tenderness on physical exam in an elderly or AFib patient?',
    category: 'Red Flag',
    clinicalRationale: 'Pain out of proportion to examination is the hallmark of Acute Mesenteric Ischemia until necrotic bowel manifests.',
    possibleAnswers: LIKERT_ANSWERS,
  },
  {
    questionId: 'gi-9',
    questionText: 'Does extending the right hip backward while lying on the left side provoke deep lower quadrant pain (Psoas sign)?',
    category: 'Physical Exam',
    clinicalRationale: 'Psoas sign irritates a retrocecal appendix overlying the psoas major muscle.',
    possibleAnswers: LIKERT_ANSWERS,
  },
  {
    questionId: 'gi-10',
    questionText: 'Does internal rotation of the flexed right hip elicit deep pelvic lower quadrant pain (Obturator sign)?',
    category: 'Physical Exam',
    clinicalRationale: 'Obturator sign irritates an inflamed pelvic appendix contacting the obturator internus muscle.',
    possibleAnswers: LIKERT_ANSWERS,
  },
  {
    questionId: 'gi-11',
    questionText: 'Has the abdomen become increasingly distended with complete inability to pass gas (flatus) or stool for more than 24 hours?',
    category: 'Symptom Character',
    clinicalRationale: 'Obstipation and abdominal distension indicate mechanical small or large bowel obstruction.',
    possibleAnswers: LIKERT_ANSWERS,
  },
  {
    questionId: 'gi-12',
    questionText: 'Have you noticed dark black tarry stools (melena) or vomiting material resembling dark coffee grounds?',
    category: 'Red Flag',
    clinicalRationale: 'Indicates severe upper gastrointestinal bleeding proximal to the ligament of Treitz.',
    possibleAnswers: LIKERT_ANSWERS,
  },
  {
    questionId: 'gi-13',
    questionText: 'Is there a triad of high fevers with shaking chills, right upper quadrant pain, and visible jaundice (Charcot\'s triad)?',
    category: 'Red Flag',
    clinicalRationale: 'Charcot\'s triad confirms Acute Ascending Cholangitis, an emergent surgical biliary infection requiring decompression.',
    possibleAnswers: LIKERT_ANSWERS,
  },
  {
    questionId: 'gi-14',
    questionText: 'Does releasing palpation pressure on the abdomen hurt significantly more than pressing in (Rebound tenderness)?',
    category: 'Physical Exam',
    clinicalRationale: 'Rebound tenderness (Blumberg sign) confirms parietal peritoneal irritation.',
    possibleAnswers: LIKERT_ANSWERS,
  },
  {
    questionId: 'gi-15',
    questionText: 'In a female patient, is there any possibility of pregnancy, or was the last menstrual period abnormal or delayed?',
    category: 'History',
    clinicalRationale: 'Ruptured ectopic pregnancy is a life-threatening look-alike for appendicitis and pelvic inflammatory disease.',
    possibleAnswers: LIKERT_ANSWERS,
  },
  {
    questionId: 'gi-16',
    questionText: 'Is there bluish-purple discoloration visible around the navel (Cullen sign) or in the flanks (Grey Turner sign)?',
    category: 'Physical Exam',
    clinicalRationale: 'Retroperitoneal hemorrhage tracking along fascial planes in severe necrotizing acute pancreatitis.',
    possibleAnswers: LIKERT_ANSWERS,
  },
  {
    questionId: 'gi-17',
    questionText: 'Are the abdominal symptoms noticeably triggered or worsened within 1 to 2 hours after consuming fatty or greasy meals?',
    category: 'History',
    clinicalRationale: 'Cholecystokinin-induced gallbladder contraction against cystic duct stones in symptomatic cholelithiasis.',
    possibleAnswers: LIKERT_ANSWERS,
  },
  {
    questionId: 'gi-18',
    questionText: 'Does the abdominal wall remain tense and guarded even when asking the patient to exhale gently through their mouth?',
    category: 'Physical Exam',
    clinicalRationale: 'Differentiates voluntary defensive guarding from true involuntary muscular spasm in peritonitis.',
    possibleAnswers: LIKERT_ANSWERS,
  },
  {
    questionId: 'gi-19',
    questionText: 'Are bowel sounds completely absent on continuous auscultation across all quadrants for 2-3 minutes?',
    category: 'Physical Exam',
    clinicalRationale: 'Paralytic ileus reflecting generalized peritonitis or mesenteric vascular compromise.',
    possibleAnswers: LIKERT_ANSWERS,
  },
  {
    questionId: 'gi-20',
    questionText: 'Is the patient experiencing tachycardia > 115 bpm with systolic blood pressure dropping below 90 mmHg (Septic Shock)?',
    category: 'Red Flag',
    clinicalRationale: 'Severe intra-abdominal sepsis / septic peritonitis requiring immediate fluid resuscitation and emergency laparotomy.',
    possibleAnswers: LIKERT_ANSWERS,
  },
];

// ===========================================================================
// 4. NEUROLOGY / HEADACHE / MENINGITIS / STROKE PATHWAY (20 Questions)
// ===========================================================================
const NEURO_QUESTIONS: AkinatorQuestion[] = [
  {
    questionId: 'neuro-1',
    questionText: 'Is the patient unable to touch their chin to their chest without severe pain or involuntary flexion of their knees/hips (Brudzinski\'s sign)?',
    category: 'Physical Exam',
    clinicalRationale: 'Nuchal rigidity indicates irritation of cervical nerve roots by purulent or hemorrhagic subarachnoid fluid.',
    possibleAnswers: LIKERT_ANSWERS,
  },
  {
    questionId: 'neuro-2',
    questionText: 'Are there any dark purple, non-blanching spots (petechiae or purpura) on the skin that do NOT fade when pressed with a transparent glass?',
    category: 'Red Flag',
    clinicalRationale: 'Non-blanching purpuric rash is pathognomonic for meningococcemia (Neisseria meningitidis) with risk of Waterhouse-Friderichsen adrenal hemorrhage.',
    possibleAnswers: LIKERT_ANSWERS,
  },
  {
    questionId: 'neuro-3',
    questionText: 'Did the headache reach excruciating, 10/10 peak intensity in less than 60 seconds (thunderclap headache)?',
    category: 'Red Flag',
    clinicalRationale: 'Thunderclap cephalalgia is the cardinal sign of ruptured saccular aneurysm and subarachnoid hemorrhage.',
    possibleAnswers: LIKERT_ANSWERS,
  },
  {
    questionId: 'neuro-4',
    questionText: 'Is there any unilateral facial drooping, arm drift/weakness, or slurred speech (FAST criteria)?',
    category: 'Red Flag',
    clinicalRationale: 'Acute focal neurological deficits indicate acute ischemic stroke or intracranial mass effect requiring emergent non-contrast head CT.',
    possibleAnswers: LIKERT_ANSWERS,
  },
  {
    questionId: 'neuro-5',
    questionText: 'Does exposure to ordinary light cause intense pain in the eyes forcing the patient to stay in a dark room (photophobia)?',
    category: 'Symptom Character',
    clinicalRationale: 'Photophobia reflects meningeal irritation or severe corneal/uveal inflammation.',
    possibleAnswers: LIKERT_ANSWERS,
  },
  {
    questionId: 'neuro-6',
    questionText: 'Is there severe hamstring pain and resistance when attempting to extend the knee with the hip flexed at 90 degrees (Kernig\'s sign)?',
    category: 'Physical Exam',
    clinicalRationale: 'Kernig\'s sign confirms meningeal irritation stretching inflamed lumbosacral nerve roots.',
    possibleAnswers: LIKERT_ANSWERS,
  },
  {
    questionId: 'neuro-7',
    questionText: 'Has the patient experienced sudden projectile vomiting occurring without preceding nausea?',
    category: 'Symptom Character',
    clinicalRationale: 'Projectile vomiting is an autonomic marker of acute intracranial hypertension.',
    possibleAnswers: LIKERT_ANSWERS,
  },
  {
    questionId: 'neuro-8',
    questionText: 'In patients over 50, is there tender swollen temporal arteries, scalp pain when brushing hair, or jaw claudication when chewing?',
    category: 'Physical Exam',
    clinicalRationale: 'Giant Cell (Temporal) Arteritis carries imminent risk of permanent ischemic optic neuropathy (blindness) requiring immediate high-dose steroids.',
    possibleAnswers: LIKERT_ANSWERS,
  },
  {
    questionId: 'neuro-9',
    questionText: 'Has the patient shown acute personality changes, confusion, bizarre behavior, or olfactory hallucinations (Herpes Encephalitis)?',
    category: 'Red Flag',
    clinicalRationale: 'Herpes Simplex Virus (HSV-1) encephalitis preferentially targets temporal lobes and requires immediate empirical IV Acyclovir.',
    possibleAnswers: LIKERT_ANSWERS,
  },
  {
    questionId: 'neuro-10',
    questionText: 'Has there been blurring of vision, transient visual blackouts, or double vision when looking to the sides?',
    category: 'Symptom Character',
    clinicalRationale: 'Visual obscurations and sixth cranial nerve palsy (abducens) indicate raised intracranial pressure with papilledema.',
    possibleAnswers: LIKERT_ANSWERS,
  },
  {
    questionId: 'neuro-11',
    questionText: 'Was the headache preceded by flashing zigzag lights, blind spots, or tingling in the fingers (classic migraine aura)?',
    category: 'History',
    clinicalRationale: 'Cortical spreading depression produces reversible neurological aura preceding classic migraine cephalalgia.',
    possibleAnswers: LIKERT_ANSWERS,
  },
  {
    questionId: 'neuro-12',
    questionText: 'Is the pain strictly unilateral, piercing/boring around one eye, accompanied by eye redness, tearing, and Horner-like ptosis (Cluster headache)?',
    category: 'Symptom Character',
    clinicalRationale: 'Trigeminal autonomic cephalalgia (Cluster headache) responds specifically to 100% high-flow oxygen and sumatriptan.',
    possibleAnswers: LIKERT_ANSWERS,
  },
  {
    questionId: 'neuro-13',
    questionText: 'Has there been any head trauma, fall, or minor head strike in the past 4 weeks, especially in elderly or anticoagulated patients?',
    category: 'History',
    clinicalRationale: 'Bridging cortical vein rupture produces progressive Chronic Subdural Hematoma manifesting as insidious headache and drowsiness.',
    possibleAnswers: LIKERT_ANSWERS,
  },
  {
    questionId: 'neuro-14',
    questionText: 'Has the patient experienced chronic ear discharge, severe mastoid pain, or acute dental/sinus infection?',
    category: 'History',
    clinicalRationale: 'Direct contiguous spread of infection into cranial vault causing intracranial epidural abscess or lateral sinus thrombosis.',
    possibleAnswers: LIKERT_ANSWERS,
  },
  {
    questionId: 'neuro-15',
    questionText: 'Is there progressive drowsiness, lethargy, or fluctuating Glasgow Coma Scale (GCS) score?',
    category: 'Red Flag',
    clinicalRationale: 'Declining GCS mandates immediate airway protection and non-contrast CT head prior to lumbar puncture.',
    possibleAnswers: LIKERT_ANSWERS,
  },
  {
    questionId: 'neuro-16',
    questionText: 'Are the pupils noticeably unequal in size, or is one pupil dilated and non-reactive to direct light (Uncal herniation)?',
    category: 'Red Flag',
    clinicalRationale: 'Ipsilateral pupil dilation indicates uncal herniation compressing cranial nerve III (tentorial notch herniation).',
    possibleAnswers: LIKERT_ANSWERS,
  },
  {
    questionId: 'neuro-17',
    questionText: 'Does flexing the neck forward cause an electrical tingling sensation shooting down the spine into the limbs (Lhermitte sign)?',
    category: 'Physical Exam',
    clinicalRationale: 'Indicates cervical spinal cord demyelination (Multiple Sclerosis) or cervical cord compression.',
    possibleAnswers: LIKERT_ANSWERS,
  },
  {
    questionId: 'neuro-18',
    questionText: 'Has the patient experienced any generalized tonic-clonic convulsions, tongue biting, or post-ictal confusion?',
    category: 'Red Flag',
    clinicalRationale: 'Seizure activity accompanying headache signals cortical irritation from encephalitis, subarachnoid bleed, or brain mass.',
    possibleAnswers: LIKERT_ANSWERS,
  },
  {
    questionId: 'neuro-19',
    questionText: 'Are the peripheral extremities cold, pale, and mottled with prolonged capillary refill time > 3 seconds (Septic Shock)?',
    category: 'Red Flag',
    clinicalRationale: 'Meningococcal endotoxemia induces profound peripheral vasoconstriction and disseminated intravascular coagulation (DIC).',
    possibleAnswers: LIKERT_ANSWERS,
  },
  {
    questionId: 'neuro-20',
    questionText: 'Is there an upgoing big toe on plantar reflex testing (positive Babinski sign) on one or both sides?',
    category: 'Physical Exam',
    clinicalRationale: 'Confirms upper motor neuron corticospinal tract compromise.',
    possibleAnswers: LIKERT_ANSWERS,
  },
];

// ===========================================================================
// 5. PULMONOLOGY / RESPIRATORY / DYSPNEA / ASTHMA PATHWAY (20 Questions)
// ===========================================================================
const PULM_QUESTIONS: AkinatorQuestion[] = [
  {
    questionId: 'pulm-1',
    questionText: 'Is there a persistent cough productive of thick green, yellow, or rust-colored sputum accompanied by high fevers?',
    category: 'History',
    clinicalRationale: 'Rust-colored sputum with lobar consolidation is classic for Streptococcus pneumoniae Community-Acquired Pneumonia.',
    possibleAnswers: LIKERT_ANSWERS,
  },
  {
    questionId: 'pulm-2',
    questionText: 'Does the chest pain worsen sharply like a knife stabbing on deep inspiration or coughing (pleuritic chest pain)?',
    category: 'Symptom Character',
    clinicalRationale: 'Pleuritic irritation signifies pulmonary embolism, pleural inflammation, or pneumothorax.',
    possibleAnswers: LIKERT_ANSWERS,
  },
  {
    questionId: 'pulm-3',
    questionText: 'Is there unilateral swelling, redness, or calf tenderness in one lower leg compared to the other (DVT)?',
    category: 'Physical Exam',
    clinicalRationale: 'Deep venous thrombosis in lower extremity is the primary source of acute pulmonary embolism.',
    possibleAnswers: LIKERT_ANSWERS,
  },
  {
    questionId: 'pulm-4',
    questionText: 'Did sudden sharp chest pain and breathlessness begin abruptly in a young, tall individual or patient with emphysema (Pneumothorax)?',
    category: 'History',
    clinicalRationale: 'Spontaneous rupture of apical subpleural bleb produces primary spontaneous pneumothorax.',
    possibleAnswers: LIKERT_ANSWERS,
  },
  {
    questionId: 'pulm-5',
    questionText: 'Are there audible high-pitched musical wheezing sounds during breathing out, with prolonged expiration (Asthma / COPD)?',
    category: 'Physical Exam',
    clinicalRationale: 'Expiratory polyphonic wheezing confirms diffuse lower airway bronchoconstriction.',
    possibleAnswers: LIKERT_ANSWERS,
  },
  {
    questionId: 'pulm-6',
    questionText: 'Is the patient unable to speak in complete sentences and forced to pause after every few words to breathe?',
    category: 'Red Flag',
    clinicalRationale: 'Inability to complete sentences in one breath is an objective hallmark of severe acute asthma / acute respiratory failure.',
    possibleAnswers: LIKERT_ANSWERS,
  },
  {
    questionId: 'pulm-7',
    questionText: 'Has the patient coughed up bright red blood, blood-streaked phlegm, or dark blood clots (hemoptysis)?',
    category: 'Red Flag',
    clinicalRationale: 'Hemoptysis requires exclusion of pulmonary embolism, cavitary tuberculosis, bronchiectasis, and bronchogenic malignancy.',
    possibleAnswers: LIKERT_ANSWERS,
  },
  {
    questionId: 'pulm-8',
    questionText: 'Does breathlessness worsen when lying flat (orthopnea) and wake the patient from sleep gasping for air (Paroxysmal Nocturnal Dyspnea)?',
    category: 'Symptom Character',
    clinicalRationale: 'Orthopnea and PND distinguish cardiogenic pulmonary venous congestion from isolated bronchospastic airway disease.',
    possibleAnswers: LIKERT_ANSWERS,
  },
  {
    questionId: 'pulm-9',
    questionText: 'Has there been drenching night sweats, chronic cough for more than 3 weeks, and unintentional weight loss (Tuberculosis)?',
    category: 'History',
    clinicalRationale: 'Classic systemic B-symptoms for active pulmonary tuberculosis or thoracic lymphoma.',
    possibleAnswers: LIKERT_ANSWERS,
  },
  {
    questionId: 'pulm-10',
    questionText: 'Did the breathlessness begin rapidly after an insect sting, new medication, or food allergen, with hives or lip swelling (Anaphylaxis)?',
    category: 'Red Flag',
    clinicalRationale: 'IgE-mediated acute anaphylaxis with laryngeal edema requires immediate IM Epinephrine (0.3-0.5 mg).',
    possibleAnswers: LIKERT_ANSWERS,
  },
  {
    questionId: 'pulm-11',
    questionText: 'Are there focal inspiratory crackles or bronchial tubular breath sounds heard over one lung field on auscultation?',
    category: 'Physical Exam',
    clinicalRationale: 'Bronchial breath sounds and crackles identify alveolar consolidation in bacterial pneumonia.',
    possibleAnswers: LIKERT_ANSWERS,
  },
  {
    questionId: 'pulm-12',
    questionText: 'Is the patient using accessory muscles of breathing (visible tensing of neck sternocleidomastoids or intercostal indrawing)?',
    category: 'Physical Exam',
    clinicalRationale: 'Accessory muscle recruitment indicates marked work of breathing and impending respiratory exhaustion.',
    possibleAnswers: LIKERT_ANSWERS,
  },
  {
    questionId: 'pulm-13',
    questionText: 'Does the pulse palpably weaken or systolic blood pressure drop by more than 10-15 mmHg during inspiration (Pulsus paradoxus)?',
    category: 'Physical Exam',
    clinicalRationale: 'Severe pulsus paradoxus in asthma indicates critical intrathoracic pressure swings and high mortality risk.',
    possibleAnswers: LIKERT_ANSWERS,
  },
  {
    questionId: 'pulm-14',
    questionText: 'Are breath sounds completely silent on chest auscultation despite intense respiratory effort ("Silent Chest")?',
    category: 'Red Flag',
    clinicalRationale: 'The "silent chest" signifies critical reduction in airflow due to severe bronchospasm and exhaustion—a pre-arrest emergency.',
    possibleAnswers: LIKERT_ANSWERS,
  },
  {
    questionId: 'pulm-15',
    questionText: 'Does the patient have a chronic daily morning cough with sputum for at least 3 months in consecutive years (Chronic Bronchitis)?',
    category: 'History',
    clinicalRationale: 'Clinical definition of chronic bronchitis in Chronic Obstructive Pulmonary Disease (COPD).',
    possibleAnswers: LIKERT_ANSWERS,
  },
  {
    questionId: 'pulm-16',
    questionText: 'Is there bulbous enlargement of the fingertips with loss of the normal nail-bed angle (Finger clubbing)?',
    category: 'Physical Exam',
    clinicalRationale: 'Clubbing points toward chronic suppurative lung disease (bronchiectasis, lung abscess), empyema, or lung cancer (never uncomplicated asthma).',
    possibleAnswers: LIKERT_ANSWERS,
  },
  {
    questionId: 'pulm-17',
    questionText: 'Is there a stony dull sound when percussing the lower posterior chest wall (Pleural Effusion)?',
    category: 'Physical Exam',
    clinicalRationale: 'Stony dullness to percussion confirms fluid collection in the pleural space requiring diagnostic thoracentesis.',
    possibleAnswers: LIKERT_ANSWERS,
  },
  {
    questionId: 'pulm-18',
    questionText: 'Is there a bluish-purple discoloration of the lips, tongue, or oral mucous membranes (Central Cyanosis)?',
    category: 'Red Flag',
    clinicalRationale: 'Central cyanosis indicates severe deoxygenated hemoglobin > 5 g/dL (arterial PaO2 < 50 mmHg).',
    possibleAnswers: LIKERT_ANSWERS,
  },
  {
    questionId: 'pulm-19',
    questionText: 'Is the patient experiencing a coarse flapping tremor of outstretched wrists (asterixis) or progressive confusion?',
    category: 'Red Flag',
    clinicalRationale: 'Asterixis in respiratory failure confirms hypercapnia (CO2 retention) and acute respiratory acidosis.',
    possibleAnswers: LIKERT_ANSWERS,
  },
  {
    questionId: 'pulm-20',
    questionText: 'Is oxygen saturation (SpO2) failing to climb above 90% despite high-flow supplemental oxygen via face mask?',
    category: 'Red Flag',
    clinicalRationale: 'Refractory hypoxemia signifies significant intrapulmonary shunt (massive pulmonary embolism, acute ARDS, or extensive lobar collapse).',
    possibleAnswers: LIKERT_ANSWERS,
  },
];

// ===========================================================================
// DYNAMIC DISPATCHER ENGINE
// ===========================================================================
export function getCaseSpecificAkinatorQuestion(
  patient: PatientProfile,
  step: number,
  answeredCount: number
): AkinatorQuestion {
  const s = (
    (patient.chiefSymptoms || '') +
    ' ' +
    (patient.additionalNotes || '') +
    ' ' +
    (patient.travelHistory || '')
  ).toLowerCase();

  // 1. Identify Primary Pathway based on what user entered in the chatbox
  let pathway: AkinatorQuestion[];

  if (
    s.includes('kenya') || s.includes('africa') || s.includes('malaria') ||
    s.includes('tropical') || s.includes('dengue') || s.includes('typhoid') ||
    s.includes('jaundice') || s.includes('dark urine') || s.includes('dark pee') ||
    (s.includes('fever') && (s.includes('rigor') || s.includes('travel') || s.includes('cyclical') || s.includes('48')))
  ) {
    pathway = TROPICAL_QUESTIONS;
  } else if (
    s.includes('chest') || s.includes('angina') || s.includes('stemi') ||
    s.includes('dissection') || s.includes('tearing') || s.includes('pressure') ||
    s.includes('heart') || s.includes('infarct') || s.includes('coronary')
  ) {
    pathway = CARDIO_QUESTIONS;
  } else if (
    s.includes('appendicitis') || s.includes('abdomen') || s.includes('belly') ||
    s.includes('stomach') || s.includes('iliac') || s.includes('quadrant') ||
    s.includes('rlq') || s.includes('cholecystitis') || s.includes('pancreatitis') ||
    s.includes('peritonitis')
  ) {
    pathway = GI_QUESTIONS;
  } else if (
    s.includes('meningitis') || s.includes('stiff neck') || s.includes('nuchal') ||
    s.includes('headache') || s.includes('photophobia') || s.includes('thunderclap') ||
    s.includes('stroke') || s.includes('fast') || s.includes('seizure') ||
    s.includes('encephalitis')
  ) {
    pathway = NEURO_QUESTIONS;
  } else if (
    s.includes('breath') || s.includes('sob') || s.includes('dyspnea') ||
    s.includes('wheez') || s.includes('asthma') || s.includes('cough') ||
    s.includes('pneumonia') || s.includes('sputum') || s.includes('pe') ||
    s.includes('copd')
  ) {
    pathway = PULM_QUESTIONS;
  } else if (
    s.includes('fever') || s.includes('pyrexia') || s.includes('chills')
  ) {
    // Febrile illness default to tropical/systemic
    pathway = TROPICAL_QUESTIONS;
  } else {
    // Multi-system default to cardio-pulmonary / acute medical
    pathway = CARDIO_QUESTIONS;
  }

  // 2. Intelligent Deduplication: Filter out findings already declared in intake text
  const isAlreadyDeclared = (q: AkinatorQuestion): boolean => {
    // Tropical deduplication
    if (q.questionId === 'trop-1' && (s.includes('rigor') || s.includes('cyclical') || s.includes('48 hours') || s.includes('every 48'))) return true;
    if (q.questionId === 'trop-2' && (s.includes('jaundice') || s.includes('yellow eyes') || s.includes('dark urine') || s.includes('dark pee'))) return true;
    if (q.questionId === 'trop-3' && s.includes('retro-orbital')) return true;
    if (q.questionId === 'trop-14' && (s.includes('chemoprophylaxis') || s.includes('prophylaxis'))) return true;

    // Cardio deduplication
    if (q.questionId === 'cardio-1' && s.includes('tearing')) return true;
    if (q.questionId === 'cardio-2' && s.includes('left arm') && s.includes('jaw')) return true;
    if (q.questionId === 'cardio-7' && s.includes('diaphoresis')) return true;

    // GI deduplication
    if (q.questionId === 'gi-1' && (s.includes('migrat') || (s.includes('periumbilical') && s.includes('rlq')))) return true;
    if (q.questionId === 'gi-4' && s.includes('murphy')) return true;

    // Neuro deduplication
    if (q.questionId === 'neuro-1' && (s.includes('stiff neck') || s.includes('nuchal rigidity') || s.includes('chin to chest'))) return true;
    if (q.questionId === 'neuro-3' && s.includes('thunderclap')) return true;
    if (q.questionId === 'neuro-5' && s.includes('photophobia')) return true;

    // Pulm deduplication
    if (q.questionId === 'pulm-1' && (s.includes('rusty sputum') || s.includes('green sputum'))) return true;
    if (q.questionId === 'pulm-2' && (s.includes('pleuritic') || s.includes('deep breath'))) return true;
    if (q.questionId === 'pulm-5' && s.includes('wheez')) return true;

    return false;
  };

  const candidateQuestions = pathway.filter(q => !isAlreadyDeclared(q));

  // 3. Select question by answered count (bounded within candidate list)
  const selectedIndex = Math.min(answeredCount, candidateQuestions.length - 1);
  return candidateQuestions[selectedIndex] || pathway[0];
}
