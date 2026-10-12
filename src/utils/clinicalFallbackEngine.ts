import { PatientProfile, DiagnosticAssessment, AkinatorQuestion, DifferentialItem, TriageEvaluation, AllergyWarning } from '../types/clinical';

/**
 * Deterministic medical heuristic engine built according to standard MBBS clinical guidelines
 * (Davidson's Principles, Harrison's Internal Medicine, Bailey & Love Surgery, and ESI Triage).
 */

export function evaluateTriageDeterministic(patient: PatientProfile): TriageEvaluation {
  const s = (patient.chiefSymptoms + ' ' + (patient.additionalNotes || '')).toLowerCase();
  const v = patient.vitalSigns;

  // Level 1: Resuscitation (immediate life threat)
  if (
    s.includes('unresponsive') ||
    s.includes('cardiac arrest') ||
    s.includes('anaphylaxis') ||
    s.includes('stridor') ||
    s.includes('severe respiratory distress') ||
    (v && v.spo2 && v.spo2 < 85) ||
    (v && v.bpSystolic && v.bpSystolic < 80) ||
    (v && v.heartRate && (v.heartRate > 150 || v.heartRate < 40))
  ) {
    return {
      level: 1,
      levelName: 'Resuscitation',
      color: '#dc2626', // red-600
      timeToPhysician: 'Immediate (0 minutes)',
      rationale: 'Severe hemodynamic collapse, compromised airway, or imminent cardiac/respiratory arrest requiring immediate resuscitation protocols.',
      redFlags: ['Airway patency threat', 'Profound shock state', 'Extreme vital instability'],
    };
  }

  // Level 2: Emergent (high risk, don't miss life threats)
  if (
    s.includes('tearing') ||
    s.includes('crushing chest pain') ||
    s.includes('thunderclap') ||
    s.includes('petechial rash') ||
    s.includes('neck stiffness') ||
    s.includes('hemoptysis') ||
    s.includes('confusion') ||
    s.includes('jaundice') ||
    s.includes('dark urine') ||
    s.includes('blackwater') ||
    (v && v.spo2 && v.spo2 < 92) ||
    (v && v.bpSystolic && (v.bpSystolic > 200 || v.bpSystolic < 90)) ||
    (v && v.heartRate && v.heartRate > 120) ||
    (v && v.heartRate && v.heartRate >= 115 && v.temperatureC && v.temperatureC >= 38.5) ||
    (v && v.temperatureC && v.temperatureC >= 40.0)
  ) {
    return {
      level: 2,
      levelName: 'Emergent',
      color: '#ea580c', // orange-600
      timeToPhysician: '< 15 minutes',
      rationale: 'High-risk presentation with potential rapid clinical deterioration (e.g. Acute Coronary Syndrome, Aortic Dissection, Meningococcemia, Pulmonary Embolism, or Complicated Falciparum Malaria with Intravascular Hemolysis).',
      redFlags: [
        'Vital sign instability / High shock index',
        'Severe acute visceral or neurological pain',
        'Evidence of end-organ compromise or active intravascular hemolysis',
      ],
    };
  }

  // Level 3: Urgent (multiple resources required, stable vitals)
  if (
    s.includes('fever') ||
    s.includes('abdominal pain') ||
    s.includes('vomiting') ||
    s.includes('migratory') ||
    patient.travelHistory.length > 5 ||
    (v && v.temperatureC && v.temperatureC > 38.0)
  ) {
    return {
      level: 3,
      levelName: 'Urgent',
      color: '#ca8a04', // yellow-600
      timeToPhysician: '< 45 minutes',
      rationale: 'Patient is currently hemodynamically stable but requires multiple diagnostic resources (IV cannulation, lab workup, ultrasonography/CT, urgent empirical therapy).',
      redFlags: ['Monitor for progression of localized infection to systemic sepsis', 'Surgical abdomen signs'],
    };
  }

  // Level 4: Semi-Urgent
  if (s.includes('pain') || s.includes('rash') || s.includes('cough')) {
    return {
      level: 4,
      levelName: 'Semi-Urgent',
      color: '#16a34a', // green-600
      timeToPhysician: '< 60-90 minutes',
      rationale: 'Mild-to-moderate symptoms requiring single outpatient diagnostic evaluation or symptomatic prescription.',
      redFlags: ['Warn patient to return if dyspnea, intractable vomiting, or altered mentation develops'],
    };
  }

  // Level 5: Non-Urgent
  return {
    level: 5,
    levelName: 'Non-Urgent',
    color: '#2563eb', // blue-600
    timeToPhysician: '< 120 minutes',
    rationale: 'Routine presentation suitable for outpatient primary care clinic consultation.',
    redFlags: ['Standard safety-netting'],
  };
}

export function checkAllergyAndMedInteractions(patient: PatientProfile): AllergyWarning[] {
  const alerts: AllergyWarning[] = [];
  const allergies = (patient.allergies || []).map((a) => a.toLowerCase());
  const meds = (patient.currentMedications || []).map((m) => m.toLowerCase());
  const conditions = (patient.preExistingConditions || []).map((c) => c.toLowerCase());

  // Penicillin allergy
  if (allergies.some((a) => a.includes('penicillin') || a.includes('amoxicillin'))) {
    alerts.push({
      substance: 'Beta-Lactam Antibiotics (Penicillins, Cephalosporins)',
      warningType: 'Contraindication',
      severity: 'Critical',
      details: 'Patient has documented Penicillin allergy. Avoid Ampicillin, Amoxicillin-Clavulanate, Piperacillin-Tazobactam. Exercise caution with 1st-generation cephalosporins (3-5% cross-reactivity). Consider Macrolides (Azithromycin), Fluoroquinolones, or Carbapenems as indicated.',
    });
  }

  // Sulfa allergy
  if (allergies.some((a) => a.includes('sulfa') || a.includes('sulfonamide'))) {
    alerts.push({
      substance: 'Sulfonamide Drugs (Co-trimoxazole, Sulfamethoxazole)',
      warningType: 'Contraindication',
      severity: 'Critical',
      details: 'Avoid Co-trimoxazole (Bactrim/Septra), Sulfasalazine, and cross-reactive carbonic anhydrase inhibitors. Monitor closely for Stevens-Johnson Syndrome (SJS) / Toxic Epidermal Necrolysis (TEN).',
    });
  }

  // Aspirin / NSAID allergy + Asthma (Samter's Triad)
  if (
    allergies.some((a) => a.includes('aspirin') || a.includes('nsaid') || a.includes('ibuprofen')) ||
    (conditions.some((c) => c.includes('asthma')) && allergies.some((a) => a.includes('aspirin')))
  ) {
    alerts.push({
      substance: 'Aspirin & NSAIDs (Ibuprofen, Ketorolac, Diclofenac)',
      warningType: 'Contraindication',
      severity: 'Critical',
      details: 'Aspirin-Exacerbated Respiratory Disease (AERD / Samter\'s Triad) risk: NSAID-induced cyclooxygenase (COX-1) inhibition shunts arachidonic acid to leukotrienes, triggering lethal bronchospasm. Avoid all non-selective NSAIDs; use Acetaminophen with caution or Paracetamol under supervision.',
    });
  }

  // G6PD Deficiency precaution
  if (conditions.some((c) => c.includes('g6pd'))) {
    alerts.push({
      substance: 'Oxidant Medications & Antimalarials (Primaquine, Dapsone, Nitrofurantoin)',
      warningType: 'Contraindication',
      severity: 'Critical',
      details: 'G6PD Deficiency: Exposure to oxidant stressors, Primaquine, Dapsone, Rasburicase, or Nitrofurantoin causes acute intravascular hemolytic anemia with Heinz body formation and hemoglobinuria. Test G6PD levels prior to antimalarial radical cure.',
    });
  }

  // Combined Oral Contraceptive + Travel / Immobility (DVT/PE risk)
  if (
    meds.some((m) => m.includes('contraceptive') || m.includes('estrogen') || m.includes('cocp') || m.includes('birth control')) &&
    (patient.travelHistory.toLowerCase().includes('flight') || patient.travelHistory.toLowerCase().includes('travel') || patient.chiefSymptoms.toLowerCase().includes('calf') || patient.chiefSymptoms.toLowerCase().includes('chest'))
  ) {
    alerts.push({
      substance: 'Exogenous Estrogens / Oral Contraceptives',
      warningType: 'Drug-Interaction',
      severity: 'Moderate',
      details: 'Estrogen increases hepatic synthesis of clotting factors II, VII, VIII, X and decreases antithrombin III, markedly elevating relative risk for Deep Venous Thrombosis (DVT) and Pulmonary Embolism (PE), especially when compounded by travel stasis.',
    });
  }

  return alerts;
}

export function generateDeterministicAssessment(patient: PatientProfile): DiagnosticAssessment {
  const triage = evaluateTriageDeterministic(patient);
  const allergyAlerts = checkAllergyAndMedInteractions(patient);
  const s = (
    (patient.chiefSymptoms || '') +
    ' ' +
    (patient.additionalNotes || '') +
    ' ' +
    (patient.travelHistory || '')
  ).toLowerCase();

  const differentials: DifferentialItem[] = [];

  // Scenario 1: Post-travel Tropical Fever (Kenya / Africa / Spiking fevers)
  if (s.includes('kenya') || s.includes('africa') || (s.includes('travel') && s.includes('fever') && s.includes('rigor'))) {
    differentials.push({
      diseaseName: 'Plasmodium falciparum Malaria',
      icd10Code: 'B50.9',
      likelihood: 82,
      category: 'Primary',
      pathophysiology: 'Anopheles mosquito inoculates sporozoites into bloodstream -> hepatic schizogony (6-14 days) -> intraerythrocytic cycle with cyclical rupture of schizonts releasing merozoites, hemozoin, and pyrogens (IL-1, TNF-alpha) causing intermittent 48-hour fevers, rigors, and microvascular sequestration.',
      supportingFindings: [
        'Recent travel to malaria-endemic region (Sub-Saharan Africa)',
        'Classic paroxysmal fever pattern (cold stage rigors -> hot fever stage -> diaphoresis)',
        'Scleral icterus / mild jaundice and dark urine indicating intravascular hemolysis',
        'Splenomegaly from reticuloendothelial clearing of parasitized RBCs',
      ],
      opposingFindings: ['Lack of altered mental status (so far excludes cerebral malaria)'],
      bedsideSignsToTest: ['Splenomegaly palpation', 'Scleral icterus examination', 'Postural blood pressure (hypovolemia)'],
      recommendedWorkup: {
        initialLabs: ['Thick and Thin Giemsa Peripheral Blood Smear (Gold standard parasitemia)', 'Malaria Rapid Diagnostic Test (PfHRP2 / pLDH antigen)', 'Complete Blood Count (Thrombocytopenia, normocytic anemia)', 'Total and Direct Bilirubin + LDH'],
        confirmatoryTests: ['Serial blood smears at 8-12 hour intervals x 3', 'G6PD qualitative screen prior to 8-aminoquinoline (Primaquine)'],
        imaging: ['Abdominal ultrasound to quantify splenomegaly and exclude splenic hematoma'],
      },
      clinicalPearls: 'Falciparum is the deadliest species due to cytoadherence (knob formation on RBCs) causing microvascular sludging in brain and kidneys. Any fever returning from Africa is Falciparum malaria until proven otherwise by 3 negative smears!',
    });

    differentials.push({
      diseaseName: 'Dengue Fever / Severe Dengue',
      icd10Code: 'A90',
      likelihood: 48,
      category: 'Secondary',
      pathophysiology: 'Flavivirus transmitted by day-biting Aedes aegypti causes endothelial glycocalyx disruption and capillary hyperpermeability, marked leukopenia, and profound thrombocytopenia.',
      supportingFindings: ['Severe retro-orbital headache', 'Myalgias ("breakbone fever")', 'High persistent fever', 'Thrombocytopenia'],
      opposingFindings: ['Usually shorter incubation (3-10 days)', 'Absence of maculopapular blanching rash / petechiae so far'],
      bedsideSignsToTest: ['Tourniquet Test (Hess test: >10 petechiae per square inch)', 'Hematocrit monitoring for hemoconcentration'],
      recommendedWorkup: {
        initialLabs: ['Dengue NS1 Antigen (Days 1-5)', 'Dengue IgM/IgG ELISA (After Day 5)', 'Serial CBC for hematocrit hemoconcentration'],
        confirmatoryTests: ['RT-PCR for Dengue serotype RNA'],
        imaging: ['Right upper quadrant ultrasound for gallbladder wall thickening and ascites (plasma leakage signs)'],
      },
      clinicalPearls: 'Monitor closely at defervescence (days 3-7) for plasma leak syndrome when fever drops!',
    });

    differentials.push({
      diseaseName: 'Enteric (Typhoid) Fever (Salmonella Typhi)',
      icd10Code: 'A01.0',
      likelihood: 34,
      category: 'Alternative',
      pathophysiology: 'Ingestion of contaminated food/water -> invasion of intestinal Peyer\'s patches via M-cells -> primary bacteremia through reticuloendothelial system -> stepladder fevers and relative bradycardia (Faget sign).',
      supportingFindings: ['Prolonged fevers', 'Headache', 'Travel to developing region with water sanitation hazards'],
      opposingFindings: ['Lack of pea-soup diarrhea or rose spots (erythematous macules on trunk)', 'Fever is described as cyclical rather than step-ladder'],
      bedsideSignsToTest: ['Sphygmo-thermic dissociation (Faget\'s sign: pulse rate slower than expected for high temperature)', 'Abdominal palpation for hepatosplenomegaly'],
      recommendedWorkup: {
        initialLabs: ['Blood cultures (highest sensitivity in week 1: 80%)', 'Stool & Urine cultures (week 2-3)', 'CBC (leukopenia with relative lymphocytosis)'],
        confirmatoryTests: ['Bone marrow culture (gold standard, 90% sensitivity even post-antibiotics)', 'Widal test (low specificity)'],
      },
      clinicalPearls: 'In week 1, blood culture is best; in week 2, Widal/stool culture; in week 3, watch for terminal ileum perforation!',
    });
  }

  // Scenario 2: Severe Chest Pain / Aortic Dissection / ACS
  else if (s.includes('tearing') || (s.includes('chest pain') && (s.includes('back') || s.includes('interscapular') || s.includes('asymmetric')))) {
    differentials.push({
      diseaseName: 'Acute Stanford Type A Aortic Dissection',
      icd10Code: 'I71.01',
      likelihood: 88,
      category: 'Primary',
      pathophysiology: 'High intraluminal shear stress on chronically hypertensive aortic media creates an intimal tear -> blood surges into media under arterial pressure separating outer and inner layers, creating false lumen. Retrograde extension can dissect into aortic root, causing acute aortic insufficiency, hemopericardium, and coronary ostial occlusion.',
      supportingFindings: [
        'Sudden, maximal at onset "tearing / ripping" retrosternal pain radiating directly to interscapular back',
        'History of poorly controlled essential hypertension with high BP presentation',
        'Asymmetric blood pressure / radial pulse deficit between upper extremities (>20 mmHg difference)',
        'New onset aortic regurgitation diastolic murmur at right sternal border',
      ],
      opposingFindings: ['Absence of ST-elevation on standard 12-lead ECG'],
      bedsideSignsToTest: ['Bilateral upper extremity blood pressure measurements', 'Carotid and femoral pulse palpation', 'Cardiac auscultation for early diastolic blowing murmur'],
      recommendedWorkup: {
        initialLabs: ['CT Angiography of Chest, Abdomen and Pelvis (CTA - Gold standard, definitive)', 'Transthoracic or Transesophageal Echocardiogram (TEE)', 'Serum Troponin I/T and D-Dimer (>500 ng/mL sensitive)', 'Cross-match 6 units packed RBCs'],
        confirmatoryTests: ['CT Aortography demonstrating intimal flap separating true and false lumens'],
        imaging: ['Portable upright Chest X-Ray: Mediastinal widening (>8cm), displacement of aortic knob calcification'],
      },
      clinicalPearls: 'Never give thrombolytics or full-dose anticoagulation if chest pain radiates to the back until dissection is ruled out! Lower BP immediately with IV beta-blockers (Esmolol/Labetalol) to heart rate < 60 bpm before vasodilators (Nitroprusside) to reduce dP/dt shear forces.',
    });

    differentials.push({
      diseaseName: 'Acute ST-Elevation Myocardial Infarction (STEMI)',
      icd10Code: 'I21.3',
      likelihood: 42,
      category: 'Secondary',
      pathophysiology: 'Atherosclerotic plaque rupture in coronary artery -> thrombotic occlusion -> transmural ischemia and myocardial necrosis.',
      supportingFindings: ['Severe retrosternal chest pain', 'Diaphoresis and syncope episode', 'Cardiovascular risk profile (Hypertension, Hyperlipidemia, Smoking history)'],
      opposingFindings: ['Pain described as sharp/tearing radiating to back rather than squeezing pressure radiating to left arm/jaw', 'Pulse asymmetry between arms is atypical for uncomplicated ACS'],
      bedsideSignsToTest: ['12-lead ECG immediately within 10 minutes', 'Auscultation for S3/S4 gallop or new mitral regurgitation murmur'],
      recommendedWorkup: {
        initialLabs: ['High-Sensitivity Cardiac Troponin (hs-cTn)', 'Serial 12-lead ECGs', 'Serum electrolytes, Creatinine, Lipid profile'],
        confirmatoryTests: ['Emergent Coronary Angiography (Primary PCI)'],
      },
      clinicalPearls: 'Dissection can shear the right coronary artery (RCA) ostium, masquerading as an inferior STEMI! Always inspect for aortic root dilation if an inferior STEMI presents with pulse deficits.',
    });

    differentials.push({
      diseaseName: 'Acute Pulmonary Embolism (PE)',
      icd10Code: 'I26.9',
      likelihood: 30,
      category: 'Alternative',
      pathophysiology: 'Thromboembolism occludes pulmonary arterial tree -> ventilation-perfusion mismatch and acute right ventricular strain.',
      supportingFindings: ['Tachycardia and tachypnea', 'Sudden onset distress and syncope'],
      opposingFindings: ['Pain in dissection is tearing retrosternal rather than pleuritic; asymmetric radial pulses are specific to aortic pathology'],
      bedsideSignsToTest: ['Assess for deep vein thrombosis in lower extremities (unilateral calf swelling/tenderness)', 'Check JVP for right ventricular overload'],
      recommendedWorkup: {
        initialLabs: ['CT Pulmonary Angiogram (CTPA)', 'D-Dimer assay', 'Arterial Blood Gas (hypoxemia, hypocapnia with respiratory alkalosis)'],
        confirmatoryTests: ['CTPA showing filling defect in pulmonary vasculature'],
      },
      clinicalPearls: 'Wells Score and Geneva criteria guide the decision between high-sensitivity D-Dimer vs direct CTPA.',
    });
  }

  // Scenario 3: Acute Abdomen (Appendicitis)
  else if (s.includes('appendicitis') || (s.includes('quadrant') && s.includes('pain')) || (s.includes('umbilicus') && s.includes('iliac'))) {
    differentials.push({
      diseaseName: 'Acute Appendicitis',
      icd10Code: 'K35.80',
      likelihood: 86,
      category: 'Primary',
      pathophysiology: 'Luminal obstruction of the vermiform appendix by a fecalith or lymphoid hyperplasia -> ongoing mucosal secretion increases intraluminal pressure -> visceral C-fiber stimulation generates referred periumbilical pain (T10 dermatome). As inflammation spreads to the parietal peritoneum, somatic A-delta fibers localize sharp severe pain to the Right Lower Quadrant (McBurney\'s point).',
      supportingFindings: [
        'Classic migratory pain chronology: Periumbilical visceral ache shifting to localized Right Iliac Fossa sharp pain',
        'Associated gastrointestinal triad: Anorexia, nausea, low-grade fever',
        'Physical exam landmarks: Tenderness & localized guarding at McBurney\'s point (2/3 distance from umbilicus to ASIS)',
        'Positive peritoneal signs: Rovsing sign (pain in RIF on LIF palpation) and Psoas sign (pain on hip extension)',
      ],
      opposingFindings: ['Lack of diffuse peritonitis / rigid board-like abdomen indicates non-perforated stage'],
      bedsideSignsToTest: [
        'McBurney\'s Point tenderness',
        'Rovsing\'s Sign (contralateral palpation)',
        'Psoas Sign (retrocecal appendix irritation of iliopsoas)',
        'Obturator Sign (internal rotation of flexed hip - pelvic appendix)',
      ],
      recommendedWorkup: {
        initialLabs: ['Serum beta-hCG (mandatory in all reproductive-age females to rule out ectopic pregnancy)', 'Complete Blood Count (Leukocytosis with left shift / neutrophilia)', 'C-Reactive Protein (CRP)', 'Urinalysis (rule out UTI and urolithiasis; mild pyuria may occur if appendix abuts ureter)'],
        confirmatoryTests: ['Abdominal Ultrasound with graded compression (non-compressible blind-ended tubular structure >6mm)', 'Contrast-Enhanced CT Abdomen/Pelvis (Gold standard in adults)'],
      },
      clinicalPearls: 'Alvarado Score (MANTRELS: Migration, Anorexia, Nausea, Tenderness RIF, Rebound, Elevation temp, Leukocytosis, Shift left) >= 7 strongly predicts acute appendicitis requiring surgical consultation.',
    });

    differentials.push({
      diseaseName: 'Ruptured / Complicated Ectopic Pregnancy',
      icd10Code: 'O00.9',
      likelihood: 45,
      category: 'Secondary',
      pathophysiology: 'Implantation of gestational sac outside uterine cavity (95% in fallopian tube ampulla) -> tubal distension and rupture causes acute intra-abdominal hemoperitoneum and hypovolemic shock.',
      supportingFindings: ['Female of reproductive age', 'Acute lower quadrant pelvic pain'],
      opposingFindings: ['Normal regular last menstrual period 2 weeks ago and patient on oral contraceptives makes pregnancy less probable, but urine beta-hCG remains mandatory'],
      bedsideSignsToTest: ['Bimanual pelvic examination (cervical motion tenderness / Chandelier sign)', 'Vital signs for postural hypotension'],
      recommendedWorkup: {
        initialLabs: ['STAT Urine and Quantitative Serum beta-hCG', 'Type and Screen / Crossmatch for transfusion'],
        confirmatoryTests: ['Transvaginal Ultrasound (TVUS) evaluating empty uterine cavity and adnexal mass with fluid in pouch of Douglas'],
      },
      clinicalPearls: 'Every female of reproductive age presenting with lower abdominal or pelvic pain has an ectopic pregnancy until proven otherwise by a negative beta-hCG!',
    });

    differentials.push({
      diseaseName: 'Acute Mesenteric Adenitis',
      icd10Code: 'I88.0',
      likelihood: 28,
      category: 'Alternative',
      pathophysiology: 'Self-limiting inflammation of mesenteric lymph nodes (often following viral URI or Yersinia enterocolitica gastroenteritis) mimicking appendicitis.',
      supportingFindings: ['Right lower quadrant pain and low-grade fever in a young patient'],
      opposingFindings: ['Lack of antecedent viral pharyngitis/rhinitis; classic Alvarado migration points strongly to appendicitis'],
      bedsideSignsToTest: ['Palpation for shifting tenderness when patient moves to left lateral decubitus position'],
      recommendedWorkup: {
        initialLabs: ['CBC, CRP, Stool viral/bacterial culture'],
        confirmatoryTests: ['High-resolution ultrasound demonstrating enlarged mesenteric lymph nodes (>8mm) with normal compressible appendix'],
      },
      clinicalPearls: 'In mesenteric adenitis, the tenderness is often less well-localized and shifts when the patient turns onto the left side.',
    });
  }

  // Scenario 4: Headache + Meningeal signs + Rash (Meningitis)
  else if (s.includes('meningitis') || s.includes('stiff neck') || s.includes('petechial') || s.includes('photophobia')) {
    differentials.push({
      diseaseName: 'Acute Meningococcal Meningitis (Neisseria meningitidis)',
      icd10Code: 'G00.0',
      likelihood: 90,
      category: 'Primary',
      pathophysiology: 'Nasopharyngeal colonization by encapsulated Neisseria meningitidis -> mucosal invasion and bacteremia -> crossing of blood-brain barrier -> intense subarachnoid purulent inflammation with exudate covering leptomeninges. Endotoxin (lipooligosaccharide, LOS) induces DIC, capillary microvascular thrombosis, and purpura fulminans.',
      supportingFindings: [
        'Classic meningeal triad: High fever, nuchal rigidity (neck stiffness), and altered mental status / severe headache',
        'Photophobia and projectile vomiting indicating acute intracranial hypertension',
        'Pathognomonic non-blanching petechial and purpuric cutaneous rash (positive glass test)',
        'Positive Kernig\'s sign (resistance to knee extension with flexed hip) and Brudzinski\'s sign (involuntary hip flexion upon passive neck flexion)',
        'Epidemiological crowding risk factor (dormitory / university camp setting)',
      ],
      opposingFindings: ['None; presentation is classical and catastrophic'],
      bedsideSignsToTest: ['Kernig\'s and Brudzinski\'s meningeal irritation tests', 'Tumbler / Glass test for non-blanching purpura', 'Fundoscopy for papilledema (evaluating ICP)'],
      recommendedWorkup: {
        initialLabs: ['Blood Cultures x 2 sets immediately', 'Complete Blood Count with differential, Coagulation profile (PT/INR, aPTT, Fibrinogen, D-Dimer for DIC)', 'Serum lactate (septic shock evaluation)', 'Blood glucose (for CSF:Serum glucose ratio comparison)'],
        confirmatoryTests: ['Lumbar Puncture with CSF Analysis: Gram stain (Gram-negative diplococci), CSF opening pressure, high protein (>100 mg/dL), low glucose (<40% of serum), neutrophilic pleocytosis (>1000/mcL)', 'CSF Multiplex PCR panel'],
        imaging: ['Non-contrast Head CT prior to LP only if focal neuro deficits, new seizures, or papilledema are present to rule out herniation risk'],
      },
      clinicalPearls: 'Do NEVER delay empirical IV antibiotics (Ceftriaxone 2g IV + Vancomycin +/- Dexamethasone to prevent S. pneumoniae hearing loss) while waiting for Lumbar Puncture or CT scans!',
    });

    differentials.push({
      diseaseName: 'Subarachnoid Hemorrhage (Aneurysmal SAH)',
      icd10Code: 'I60.9',
      likelihood: 35,
      category: 'Secondary',
      pathophysiology: 'Rupture of intracranial berry aneurysm (typically at anterior communicating or posterior communicating artery circle of Willis bifurcations) -> extravasation of arterial blood into subarachnoid space -> chemical meningitis and severe headache.',
      supportingFindings: ['Sudden explosive headache ("thunderclap")', 'Neck stiffness (chemical irritation of meninges by degraded blood)', 'Photophobia and vomiting'],
      opposingFindings: ['High spiking fever (39.8C) and petechial skin rash are classic for bacteremia, not isolated aneurysmal bleed'],
      bedsideSignsToTest: ['Cranial nerve exam (CN III palsy with pupil dilation indicates PCOM aneurysm)', 'Fundoscopy for subhyaloid retinal hemorrhages'],
      recommendedWorkup: {
        initialLabs: ['CBC, Coagulation panel (PT/INR, aPTT)', 'Troponin and ECG (neurogenic stunned myocardium)'],
        confirmatoryTests: [
          'Non-contrast Head CT within 6 hours (high sensitivity >98%)',
          'Lumbar Puncture at 12 hours post-onset for CSF spectrophotometry xanthochromia',
        ],
        imaging: ['CT Angiogram (CTA) of intracranial vessels or Digital Subtraction Angiography (DSA) to identify aneurysm source'],
      },
      clinicalPearls: 'Ottawa SAH rule helps identify when a thunderclap headache mandates emergency CT and LP.',
    });
  }

  // General Fallback
  else {
    differentials.push({
      diseaseName: 'Acute Viral Syndrome / Systemic Inflammatory Process',
      icd10Code: 'B34.9',
      likelihood: 60,
      category: 'Primary',
      pathophysiology: 'Innate immune response to viral pathogen triggering pyrogen cascade (interferon-gamma, IL-1, TNF-alpha) causing constitutional fatigue, fever, and localized symptoms.',
      supportingFindings: ['Constitutional symptoms', 'Subacute presentation'],
      opposingFindings: ['Lack of focal pathognomonic physical signs'],
      bedsideSignsToTest: ['Complete systematic examination: lymph node survey, cardiopulmonary auscultation, abdominal tenderness'],
      recommendedWorkup: {
        initialLabs: ['Complete Blood Count with differential', 'C-Reactive Protein (CRP)', 'Basic Metabolic Panel (BMP)', 'Urinalysis'],
        confirmatoryTests: ['Respiratory viral multiplex PCR', 'Targeted serologies'],
      },
      clinicalPearls: 'Systematic review of systems and repeat physical exam in 24 hours often unmasks the underlying clinical picture.',
    });
  }

  return {
    triage,
    topDiagnoses: differentials,
    allergyAndMedicationAlerts: allergyAlerts,
    immediateActionPlan: [
      `Triage Level ${triage.level} (${triage.levelName}): Prioritize patient evaluation within ${triage.timeToPhysician}.`,
      'Establish large-bore peripheral IV access and draw baseline blood tubes (CBC, crossmatch, chemistries).',
      'Continuous monitoring of vital signs (SpO2, continuous 3-lead telemetry, automated NIBP q15m).',
      'Address active red flags and allergy warnings before initiating empirical pharmacotherapy.',
    ],
    differentialSummary: `Based on patient demographics (${patient.age}y ${patient.gender}), chief complaints, and past medical history, the highest probability differential is ${differentials[0]?.diseaseName}. Immediate clinical attention is required to exclude life-threatening rule-outs.`,
  };
}

export function getNextAkinatorQuestionDeterministic(
  patient: PatientProfile,
  step: number,
  answeredCount: number
): AkinatorQuestion {
  const s = ((patient.chiefSymptoms || '') + ' ' + (patient.travelHistory || '') + ' ' + (patient.additionalNotes || '')).toLowerCase();

  const likertAnswers: AkinatorQuestion['possibleAnswers'] = [
    { label: 'Yes', value: 'yes' },
    { label: 'Probably Yes', value: 'probably_yes' },
    { label: 'Don\'t Know', value: 'unsure' },
    { label: 'Probably Not', value: 'probably_no' },
    { label: 'No', value: 'no' },
  ];

  // Shared systemic & red-flag discriminators (turns 5 to 20 fallback pool)
  const systemicBank: AkinatorQuestion[] = [
    {
      questionId: 'sys-1',
      questionText: 'Have you had drenching night sweats requiring you to change your clothes or bed sheets?',
      category: 'Symptom Character',
      clinicalRationale: 'B-symptoms point toward lymphoma, active pulmonary tuberculosis, or subacute bacterial endocarditis.',
      possibleAnswers: likertAnswers,
    },
    {
      questionId: 'sys-2',
      questionText: 'Have you experienced unintentional weight loss of more than 5% of your body weight over the past 4 to 8 weeks?',
      category: 'History',
      clinicalRationale: 'Significant involuntary weight loss differentiates chronic inflammatory or malignant processes from benign self-limiting disease.',
      possibleAnswers: likertAnswers,
    },
    {
      questionId: 'sys-3',
      questionText: 'Do you feel lightheaded, faint, or as if you might pass out when standing up quickly (orthostatic presyncope)?',
      category: 'Physical Exam',
      clinicalRationale: 'Indicates hypovolemia, occult blood loss, or autonomic cardiovascular decompensation.',
      possibleAnswers: likertAnswers,
    },
    {
      questionId: 'sys-4',
      questionText: 'Have you noticed any new swollen, firm, or non-tender lymph nodes in your neck, armpits, or groin?',
      category: 'Physical Exam',
      clinicalRationale: 'Painless generalized lymphadenopathy suggests lymphoproliferative disorder or chronic granulomatous infection.',
      possibleAnswers: likertAnswers,
    },
    {
      questionId: 'sys-5',
      questionText: 'Have you coughed up any streaks of blood, rust-colored sputum, or frank bright red blood (hemoptysis)?',
      category: 'Red Flag',
      clinicalRationale: 'Crucial discriminator for pulmonary embolism, cavitary tuberculosis, bronchiectasis, or bronchogenic carcinoma.',
      possibleAnswers: likertAnswers,
    },
    {
      questionId: 'sys-6',
      questionText: 'Is there noticeable swelling (pitting edema) in both your ankles, feet, or lower legs?',
      category: 'Physical Exam',
      clinicalRationale: 'Bilateral dependent edema indicates elevated systemic venous pressure (congestive heart failure, nephrotic syndrome, or cirrhosis).',
      possibleAnswers: likertAnswers,
    },
    {
      questionId: 'sys-7',
      questionText: 'Are you experiencing a persistent racing, fluttering, or irregularly irregular heart rate (palpitations)?',
      category: 'Symptom Character',
      clinicalRationale: 'Rules out tachyarrhythmias (atrial fibrillation, SVT) or compensatory response to hypoxia / sepsis.',
      possibleAnswers: likertAnswers,
    },
    {
      questionId: 'sys-8',
      questionText: 'Have you noticed dark, black, tarry, or foul-smelling stools (melena)?',
      category: 'Red Flag',
      clinicalRationale: 'Signals acute upper gastrointestinal hemorrhage originating proximal to the ligament of Treitz.',
      possibleAnswers: likertAnswers,
    },
    {
      questionId: 'sys-9',
      questionText: 'Do you experience burning pain, marked frequency, or urgency when urinating (dysuria)?',
      category: 'Symptom Character',
      clinicalRationale: 'Differentiates lower urinary tract infection or pyelonephritis as a source of fever or lower abdominal discomfort.',
      possibleAnswers: likertAnswers,
    },
    {
      questionId: 'sys-10',
      questionText: 'Is there any stiffness in your joints, joint swelling, or morning stiffness lasting longer than 30 minutes?',
      category: 'Physical Exam',
      clinicalRationale: 'Identifies systemic inflammatory autoimmune disease (SLE, rheumatoid arthritis, reactive arthritis).',
      possibleAnswers: likertAnswers,
    },
    {
      questionId: 'sys-11',
      questionText: 'Have you had severe difficulty or pain when swallowing liquids or solid food (dysphagia/odynophagia)?',
      category: 'Red Flag',
      clinicalRationale: 'Red flag for esophageal perforation (Boerhaave), stricture, or retrosternal compression.',
      possibleAnswers: likertAnswers,
    },
    {
      questionId: 'sys-12',
      questionText: 'Have you noticed any blurred vision, double vision (diplopia), or transient loss of vision in one eye?',
      category: 'Red Flag',
      clinicalRationale: 'Assesses giant cell arteritis, central nervous system ischemia, or elevated intracranial pressure.',
      possibleAnswers: likertAnswers,
    },
    {
      questionId: 'sys-13',
      questionText: 'Are you currently taking any immunosuppressive therapy, systemic steroids, or chemotherapy?',
      category: 'History',
      clinicalRationale: 'Immunocompromised hosts have markedly altered disease priors and high risk for opportunistic infections.',
      possibleAnswers: likertAnswers,
    },
    {
      questionId: 'sys-14',
      questionText: 'Have you had any close contact with individuals diagnosed with active tuberculosis or severe respiratory infections?',
      category: 'Epidemiology',
      clinicalRationale: 'Epidemiological exposure significantly increases pre-test probability of mycobacterial and airborne pathogens.',
      possibleAnswers: likertAnswers,
    },
    {
      questionId: 'sys-15',
      questionText: 'Has there been any recent change in your bowel habits, such as alternating diarrhea and constipation?',
      category: 'History',
      clinicalRationale: 'Discriminates colonic pathology, irritable bowel syndrome, or malabsorption syndromes.',
      possibleAnswers: likertAnswers,
    },
    {
      questionId: 'sys-16',
      questionText: 'Do you experience extreme fatigue or breathlessness that forces you to sleep elevated on two or more pillows (orthopnea)?',
      category: 'Symptom Character',
      clinicalRationale: 'High sensitivity for pulmonary congestion and left ventricular systolic or diastolic failure.',
      possibleAnswers: likertAnswers,
    },
  ];

  let pathQuestions: AkinatorQuestion[] = [];

  // 1. Fever / Travel / Tropical path
  if (s.includes('fever') || s.includes('travel') || s.includes('africa') || s.includes('kenya') || s.includes('chills')) {
    pathQuestions = [
      {
        questionId: 'trop-1',
        questionText: 'Are the fevers accompanied by severe violent shivering chills (rigors) followed by drenching sweats in a cyclical pattern (every 48 or 72 hours)?',
        category: 'History',
        clinicalRationale: 'Classic tertian or quartan fever paroxysms correlate with synchronized erythrocytic schizont rupture in Plasmodium species (Malaria).',
        possibleAnswers: likertAnswers,
      },
      {
        questionId: 'trop-2',
        questionText: 'Has the patient or family noted yellowing of the eyes (scleral icterus) or tea-colored dark brown urine?',
        category: 'Physical Exam',
        clinicalRationale: 'Hemoglobinuria and unconjugated hyperbilirubinemia signify active intravascular hemolysis (e.g. Blackwater fever in severe malaria, G6PD crisis, or Leptospirosis).',
        possibleAnswers: likertAnswers,
      },
      {
        questionId: 'trop-3',
        questionText: 'Is there intense retro-orbital pain (pain behind the eyes worsening with eye movement) accompanied by severe bone/joint aching ("breakbone fever")?',
        category: 'Symptom Character',
        clinicalRationale: 'Retro-orbital cephalalgia and profound arthralgia/myalgia are highly characteristic discriminators for Dengue and Chikungunya over Malaria.',
        possibleAnswers: likertAnswers,
      },
      {
        questionId: 'trop-4',
        questionText: 'Is there any spontaneous mucosal bleeding (epistaxis, bleeding gums), hematuria, or pinpoint petechial rash on the extremities?',
        category: 'Red Flag',
        clinicalRationale: 'Signals consumptive coagulopathy, severe dengue hemorrhagic fever, or microvascular thrombosis.',
        possibleAnswers: likertAnswers,
      },
      {
        questionId: 'trop-5',
        questionText: 'Has the patient experienced any drowsiness, disorientation, persistent confusion, or seizures?',
        category: 'Red Flag',
        clinicalRationale: 'Assesses for Cerebral Malaria (Plasmodium falciparum cytoadherence in cerebral microvasculature), a medical emergency with high mortality.',
        possibleAnswers: likertAnswers,
      },
      {
        questionId: 'trop-6',
        questionText: 'Has there been a marked decrease in daily urine output (oliguria) or inability to retain oral fluids due to persistent vomiting?',
        category: 'Red Flag',
        clinicalRationale: 'Indicates acute tubular necrosis / acute kidney injury in severe falciparum malaria or severe hypovolemic shock.',
        possibleAnswers: likertAnswers,
      },
    ];
  } else if (s.includes('chest') || s.includes('tearing') || s.includes('pressure') || s.includes('angina') || s.includes('heart')) {
    // 2. Chest pain / Cardiology path
    pathQuestions = [
      {
        questionId: 'cardio-1',
        questionText: 'Did the pain reach its maximal peak intensity in less than 1 minute ("thunderclap / tearing" onset), and does it radiate directly between the shoulder blades (interscapular)?',
        category: 'History',
        clinicalRationale: 'Instantaneous maximal tearing back pain has a likelihood ratio > 8.0 for Stanford Type A/B Aortic Dissection over Myocardial Infarction.',
        possibleAnswers: likertAnswers,
      },
      {
        questionId: 'cardio-2',
        questionText: 'Is there a measurable difference in systolic blood pressure (>20 mmHg) between the right and left arm, or a delayed/diminished radial or femoral pulse?',
        category: 'Physical Exam',
        clinicalRationale: 'Pulse deficits or inter-arm blood pressure differentials indicate mechanical occlusion of the subclavian or innominate branches by an aortic false lumen flap.',
        possibleAnswers: likertAnswers,
      },
      {
        questionId: 'cardio-3',
        questionText: 'Does the chest pain worsen sharply with deep inspiration or coughing (pleuritic pain), and is it associated with unilateral lower extremity calf swelling or pain?',
        category: 'Symptom Character',
        clinicalRationale: 'Identifies deep venous thrombosis leading to Pulmonary Embolism (Wells Score criteria) vs pericardial friction or aortic pathology.',
        possibleAnswers: likertAnswers,
      },
      {
        questionId: 'cardio-4',
        questionText: 'Does the chest pain ease noticeably when you lean forward and worsen when lying flat on your back (pericarditic positionality)?',
        category: 'Symptom Character',
        clinicalRationale: 'Positional retrosternal pain relieved by sitting forward is pathognomonic for acute pericarditis.',
        possibleAnswers: likertAnswers,
      },
    ];
  } else if (s.includes('abdomen') || s.includes('iliac') || s.includes('quadrant') || s.includes('stomach') || s.includes('belly')) {
    // 3. Abdominal Pain path
    pathQuestions = [
      {
        questionId: 'gi-1',
        questionText: 'Did the discomfort initially start as a dull, vague ache around the bellybutton (umbilicus) before migrating and sharpening in the Right Lower Quadrant (Right Iliac Fossa)?',
        category: 'History',
        clinicalRationale: 'Classic visceral-to-somatic migration pattern (T10 periumbilical dermatome shifting to parietal peritoneal localization at McBurney\'s point).',
        possibleAnswers: likertAnswers,
      },
      {
        questionId: 'gi-2',
        questionText: 'Does pressing gently on the LEFT lower quadrant elicit or aggravate pain in the RIGHT lower quadrant (Positive Rovsing\'s sign)?',
        category: 'Physical Exam',
        clinicalRationale: 'Rovsing\'s sign forces colonic gas retrograde into the cecum and stretches an inflamed appendix, demonstrating localized parietal peritonitis.',
        possibleAnswers: likertAnswers,
      },
      {
        questionId: 'gi-3',
        questionText: 'Has the patient completely lost their appetite (anorexia / "hamburger test") or vomited following the onset of pain?',
        category: 'Symptom Character',
        clinicalRationale: 'In acute appendicitis, anorexia and pain precede vomiting in >95% of cases. If vomiting precedes abdominal pain, gastroenteritis or bowel obstruction is more likely.',
        possibleAnswers: likertAnswers,
      },
      {
        questionId: 'gi-4',
        questionText: 'Does taking a deep breath while the examiner palpates deeply under the right ribcage cause sudden sharp catching of breath (Murphy\'s sign)?',
        category: 'Physical Exam',
        clinicalRationale: 'Murphy\'s sign has >95% specificity for acute calculous cholecystitis.',
        possibleAnswers: likertAnswers,
      },
    ];
  } else {
    // 4. Neurological / Headache path
    pathQuestions = [
      {
        questionId: 'neuro-1',
        questionText: 'Is the patient unable to touch their chin to their chest without severe pain or involuntary flexion of their knees/hips (Brudzinski\'s sign)?',
        category: 'Physical Exam',
        clinicalRationale: 'Nuchal rigidity indicates irritation of cervical nerve roots by purulent or hemorrhagic subarachnoid fluid.',
        possibleAnswers: likertAnswers,
      },
      {
        questionId: 'neuro-2',
        questionText: 'Are there any dark purple, non-blanching spots (petechiae or purpura) on the skin that do NOT fade when pressed with a transparent glass?',
        category: 'Red Flag',
        clinicalRationale: 'Non-blanching purpuric rash is pathognomonic for meningococcemia (Neisseria meningitidis) with risk of Waterhouse-Friderichsen adrenal hemorrhage.',
        possibleAnswers: likertAnswers,
      },
      {
        questionId: 'neuro-3',
        questionText: 'Did the headache reach excruciating, 10/10 peak intensity in less than 60 seconds (thunderclap headache)?',
        category: 'Red Flag',
        clinicalRationale: 'Thunderclap cephalalgia is the cardinal sign of ruptured saccular aneurysm and subarachnoid hemorrhage.',
        possibleAnswers: likertAnswers,
      },
      {
        questionId: 'neuro-4',
        questionText: 'Is there any unilateral facial drooping, arm drift/weakness, or slurred speech (FAST criteria)?',
        category: 'Red Flag',
        clinicalRationale: 'Acute focal neurological deficits indicate acute ischemic stroke or intracranial mass effect requiring emergent non-contrast head CT.',
        possibleAnswers: likertAnswers,
      },
    ];
  }

  // Combine path-specific questions with the systemic bank up to 20 questions
  const fullQuestions = [...pathQuestions, ...systemicBank];

  // Avoid re-asking findings already stated or confirmed in patient chief presentation
  const alreadyConfirmed = (q: AkinatorQuestion): boolean => {
    if (q.questionId === 'trop-1' && (s.includes('rigor') || s.includes('cyclical') || s.includes('every 48'))) return true;
    if (q.questionId === 'trop-2' && (s.includes('jaundice') || s.includes('dark urine') || s.includes('yellow eyes') || s.includes('dark pee'))) return true;
    if (q.questionId === 'cardio-1' && s.includes('tearing')) return true;
    if (q.questionId === 'gi-1' && (s.includes('periumbilical') || s.includes('bellybutton')) && (s.includes('rlq') || s.includes('right lower'))) return true;
    if (q.questionId === 'neuro-1' && (s.includes('stiff neck') || s.includes('nuchal rigidity') || s.includes('chin to chest'))) return true;
    return false;
  };

  const eligibleQuestions = fullQuestions.filter(q => !alreadyConfirmed(q));
  const safeIndex = Math.min(answeredCount, eligibleQuestions.length - 1);
  return eligibleQuestions[safeIndex] || fullQuestions[0];
}
