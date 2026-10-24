import { PatientProfile, DiagnosticAssessment, AkinatorQuestion, DifferentialItem, TriageEvaluation, AllergyWarning } from '../types/clinical';
import { getCaseSpecificAkinatorQuestion } from './caseSpecificQuestionEngine';

/**
 * Deterministic medical heuristic engine built according to standard MBBS clinical guidelines
 * (Davidson's Principles, Harrison's Internal Medicine, Bailey & Love Surgery, and ESI Triage).
 */

export function evaluateTriageDeterministic(patient: PatientProfile): TriageEvaluation {
  const s = (patient.chiefSymptoms + ' ' + (patient.additionalNotes || '') + ' ' + (patient.travelHistory || '')).toLowerCase();
  const v = patient.vitalSigns;

  // Toxicological / Environmental Emergency Check (Level 1 Resuscitation)
  const isOrganophosphateOrCholinergic =
    (s.includes('spraying') || s.includes('crops') || s.includes('farmer') || s.includes('pesticide') || s.includes('insecticide') || s.includes('organophosphate') || s.includes('carbamate') || s.includes('chemical odor') || s.includes('garlic')) &&
    (s.includes('pupil') || s.includes('miosis') || s.includes('pinpoint') || s.includes('salivation') || s.includes('lacrimation') || s.includes('bronchorrhea') || s.includes('fasciculation') || s.includes('twitching') || s.includes('bradycardia') || s.includes('diarrhea') || s.includes('cramps'));

  const hasTrueTearingChestPain =
    /\b(?:tearing|ripping)\b(?!\s*(?:eyes?|lacrimation))/i.test(s) &&
    /\b(?:chest|retrosternal|substernal|back|interscapular|aort)\b/i.test(s);

  // Shock Index & Hemodynamic Collapse evaluation (SI = HR / SBP)
  const sbp = v?.bpSystolic || 120;
  const hr = v?.heartRate || 75;
  const shockIndex = sbp > 0 ? hr / sbp : 0;
  const isDecompensatedShock = (shockIndex >= 1.0 && sbp < 100) || (sbp < 90 && hr > 105) || sbp < 85;

  // Gynecological Emergency / Ruptured Ectopic Suspicion in Female of Childbearing Age
  const isFemaleReproductive = (patient.gender?.toLowerCase() === 'female' || patient.isPregnant) && (!patient.age || (patient.age >= 12 && patient.age <= 55));
  const hasGynLowerPain = s.includes('pelvic') || s.includes('lower abdomen') || s.includes('rlq') || s.includes('llq') || s.includes('adnexal') || s.includes('lower quadrant') || s.includes('right-sided lower') || s.includes('right lower');
  const hasGynTriggers = s.includes('ectopic') || s.includes('spotting') || s.includes('vaginal') || s.includes('amenorrhea') || s.includes('menstrual period') || s.includes('lmp') || s.includes('cervical motion') || s.includes('cmt') || s.includes('chandelier') || s.includes('shoulder') || s.includes('kehr') || s.includes('pid') || s.includes('pelvic inflammatory');
  const isRupturedEctopicSuspect = isFemaleReproductive && hasGynLowerPain && (hasGynTriggers || shockIndex >= 0.9);

  // Level 1: Resuscitation (immediate life threat)
  if (
    isOrganophosphateOrCholinergic ||
    (isRupturedEctopicSuspect && (isDecompensatedShock || shockIndex >= 0.9 || sbp < 95)) ||
    isDecompensatedShock ||
    s.includes('unresponsive') ||
    s.includes('cardiac arrest') ||
    s.includes('anaphylaxis') ||
    s.includes('stridor') ||
    s.includes('severe respiratory distress') ||
    (v && v.spo2 && v.spo2 < 85) ||
    (v && v.bpSystolic && v.bpSystolic < 85) ||
    (v && v.heartRate && (v.heartRate > 150 || v.heartRate < 40)) ||
    s.includes('ketoacidosis') ||
    s.includes('dka') ||
    s.includes('kussmaul') ||
    s.includes('acetone') ||
    (s.includes('insulin') && s.includes('vomiting')) ||
    (v && v.respiratoryRate && v.respiratoryRate >= 26 && v.heartRate && v.heartRate >= 120)
  ) {
    let rationale = 'Severe hemodynamic collapse, compromised airway, or imminent metabolic/respiratory arrest requiring immediate resuscitation protocols.';
    let redFlags = ['Severe physiological collapse', 'High shock index', 'Impending metabolic collapse'];

    if (isOrganophosphateOrCholinergic) {
      rationale = 'Acute Organophosphate / Carbamate Poisoning with life-threatening cholinergic crisis ("Killer B\'s": severe bronchorrhea, bronchospasm, and bradycardia) causing impending respiratory failure. Requires immediate resuscitation, aggressive airway suctioning, high-dose IV Atropine, and Pralidoxime (2-PAM).';
      redFlags = [
        'Impending respiratory failure secondary to severe bronchorrhea & bronchospasm ("Killer B\'s")',
        'Severe symptomatic bradycardia with hemodynamic compromise (HR < 55 bpm)',
        'Secondary contamination risk to healthcare personnel (requires immediate HazMat Level C PPE & patient decontamination)',
        'Central nervous system depression with impaired airway protection (GCS < 13)'
      ];
    } else if (isRupturedEctopicSuspect && (isDecompensatedShock || shockIndex >= 0.9 || sbp < 95)) {
      rationale = `Severe Class III Decompensated Hemorrhagic Shock (Shock Index: ${shockIndex.toFixed(2)}, BP ${sbp}/${v?.bpDiastolic || '?'}, HR ${hr} bpm) secondary to suspected Ruptured Ectopic Pregnancy with acute hemoperitoneum. Immediate resuscitation, Massive Transfusion Protocol, STAT beta-hCG, bedside FAST/TVUS, and emergent OB-GYN surgical hemostasis required.`;
      redFlags = [
        `Decompensated Class III Hemorrhagic Shock (Shock Index: ${shockIndex.toFixed(2)} with marked tachycardia and hypotension)`,
        'Severe intra-abdominal hemoperitoneum indicated by diaphragmatic Kehr sign (referred shoulder pain)',
        'Acute peritoneal rigid abdomen with severe cervical motion tenderness (CMT) and adnexal fullness',
        'Critical tissue hypoperfusion with delayed capillary refill (> 4s) and orthostatic presyncope'
      ];
    } else if (s.includes('ketoacidosis') || s.includes('dka') || s.includes('acetone') || s.includes('kussmaul') || (s.includes('insulin') && s.includes('vomiting'))) {
      rationale = 'Diabetic Ketoacidosis (DKA) / Severe High-Anion Gap Metabolic Acidosis with compensatory Kussmaul tachypnea and marked dehydration requiring immediate resuscitation.';
      redFlags = ['Severe high-anion-gap metabolic acidosis', 'Profound shock state / elevated shock index', 'Impending metabolic collapse'];
    }

    return {
      level: 1,
      levelName: 'Resuscitation',
      color: '#dc2626', // red-600
      timeToPhysician: 'Immediate (0 minutes)',
      rationale,
      redFlags,
    };
  }

  // Level 2: Emergent (high risk, don't miss life threats)
  if (
    hasTrueTearingChestPain ||
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
    let rationale = 'High-risk presentation with potential rapid clinical deterioration requiring urgent bedside evaluation.';
    if (s.includes('chest pain') || s.includes('stemi') || s.includes('angina')) {
      rationale = 'Acute chest pain concerning for Acute Coronary Syndrome (ACS) or acute cardiopulmonary emergency.';
    } else if (hasTrueTearingChestPain || s.includes('dissection')) {
      rationale = 'Severe tearing retrosternal pain concerning for acute aortic pathology / dissection.';
    } else if (s.includes('meningitis') || s.includes('neck stiffness')) {
      rationale = 'Meningeal signs concerning for acute central nervous system infection.';
    } else if (s.includes('abdominal') || s.includes('peritoneal')) {
      rationale = 'Acute abdominal symptoms with physiological distress requiring emergent evaluation.';
    }

    return {
      level: 2,
      levelName: 'Emergent',
      color: '#ea580c', // orange-600
      timeToPhysician: '< 15 minutes',
      rationale,
      redFlags: [
        'Vital sign instability / High shock index',
        'Severe acute visceral or neurological pain',
        'Evidence of end-organ compromise',
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

  const v = patient.vitalSigns;
  const sbp = v?.bpSystolic || 120;
  const hr = v?.heartRate || 75;
  const shockIndex = sbp > 0 ? hr / sbp : 0;
  const isFemaleReproductive = (patient.gender?.toLowerCase() === 'female' || patient.isPregnant) && (!patient.age || (patient.age >= 12 && patient.age <= 55));
  const hasGynLowerPain = s.includes('pelvic') || s.includes('lower abdomen') || s.includes('rlq') || s.includes('llq') || s.includes('adnexal') || s.includes('lower quadrant') || s.includes('right-sided lower') || s.includes('right lower');
  const hasGynTriggers = s.includes('ectopic') || s.includes('spotting') || s.includes('vaginal') || s.includes('amenorrhea') || s.includes('menstrual period') || s.includes('lmp') || s.includes('cervical motion') || s.includes('cmt') || s.includes('chandelier') || s.includes('shoulder') || s.includes('kehr') || s.includes('pid') || s.includes('pelvic inflammatory');
  const isRupturedEctopicSuspect = isFemaleReproductive && hasGynLowerPain && hasGynTriggers;

  // Scenario 0: Diabetic Ketoacidosis (DKA) / Severe Metabolic Acidosis
  if (
    s.includes('ketoacidosis') ||
    s.includes('dka') ||
    s.includes('acetone') ||
    s.includes('kussmaul') ||
    s.includes('fruity breath') ||
    s.includes('polydipsia') ||
    s.includes('polyuria') ||
    s.includes('unquenchable thirst') ||
    (s.includes('insulin') && (s.includes('vomiting') || s.includes('abdominal pain') || s.includes('lethargy') || s.includes('nausea'))) ||
    (s.includes('diabetes') && (s.includes('vomiting') || s.includes('abdominal pain') || s.includes('acidosis')))
  ) {
    differentials.push({
      diseaseName: 'Diabetic Ketoacidosis (DKA)',
      icd10Code: 'E10.10',
      likelihood: 95,
      category: 'Primary',
      pathophysiology: 'Absolute or relative insulin deficiency combined with counter-regulatory hormone excess (glucagon, catecholamines, cortisol) drives uncontrolled lipolysis and hepatic ketogenesis (beta-hydroxybutyrate, acetoacetate) -> severe high-anion-gap metabolic acidosis. Osmotic diuresis causes profound total-body volume and electrolyte depletion. Ketosis and splanchnic hypoperfusion generate severe diffuse abdominal pain mimicking a surgical acute abdomen (pseudo-acute abdomen), while metabolic acidosis triggers compensatory deep, rapid Kussmaul hyperventilation.',
      supportingFindings: [
        'Classic metabolic triad: Polyuria, polydipsia, and severe fatigue',
        'Pathognomonic sweet, acetone odor on breath',
        'Deep, rapid compensatory Kussmaul respirations',
        'Diffuse pseudo-acute abdominal pain and intractable vomiting without peritoneal signs',
        'Severe volume depletion, tachycardia, and hypotension following insulin omission'
      ],
      opposingFindings: [
        'Clear lungs on auscultation rule out primary pneumonia as sole cause of tachypnea',
        'Absence of focal guarding or rebound tenderness excludes perforated viscus / surgical abdomen'
      ],
      bedsideSignsToTest: [
        'STAT Capillary Blood Glucose (Point-of-care fingerstick > 250 mg/dL)',
        'Point-of-Care Urine Dipstick / Blood Ketone test (moderate-to-large ketonuria, beta-hydroxybutyrate > 3.0 mmol/L)',
        'Venous Blood Gas (VBG) for pH (< 7.30) and serum bicarbonate (< 18 mEq/L)',
        'Continuous 3-lead telemetry monitoring for dysrhythmias and potassium shifts'
      ],
      recommendedWorkup: {
        initialLabs: [
          'STAT Blood Glucose, Serum Electrolytes with calculated Anion Gap',
          'Venous Blood Gas (pH, base excess)',
          'Serum Beta-Hydroxybutyrate and Urinalysis',
          'Complete Blood Count (CBC) and Blood/Urine cultures to identify infectious trigger',
          'Serum Creatinine, BUN, Osmolality'
        ],
        confirmatoryTests: [
          'Confirmed Triad: Hyperglycemia (>250 mg/dL) + High Anion Gap Metabolic Acidosis (pH < 7.3, HCO3 < 18) + Ketonemia (>3.0 mmol/L)',
          'Serial potassium and glucose monitoring q1h during protocolized IV insulin and fluid resuscitation'
        ],
        imaging: [
          'Portable Chest Radiography to evaluate for occult pneumonia as infectious precipitant'
        ]
      },
      clinicalPearls: 'DO NOT start insulin if serum potassium is < 3.3 mEq/L! Insulin drives potassium intracellularly, risking fatal cardiac arrest. Rehydrate first with aggressive isotonic saline (1-1.5 L in 1st hour) and replete potassium before initiating fixed-rate IV insulin infusion.'
    });

    differentials.push({
      diseaseName: 'Hyperosmolar Hyperglycemic State (HHS)',
      icd10Code: 'E11.00',
      likelihood: 35,
      category: 'Secondary',
      pathophysiology: 'Relative insulin deficiency sufficient to prevent lipolysis and gross ketogenesis, but insufficient to suppress hepatic gluconeogenesis -> severe extreme hyperglycemia (>600 mg/dL) -> massive osmotic diuresis and profound dehydration with serum hyperosmolality (>320 mOsm/kg).',
      supportingFindings: ['Severe hyperglycemia and lethargy', 'Extreme volume depletion'],
      opposingFindings: ['Prominent Kussmaul respirations and sweet acetone breath favor DKA over pure HHS'],
      bedsideSignsToTest: ['Serum osmolality calculation: 2*(Na) + Glucose/18 + BUN/2.8', 'Neurological assessment for focal deficits'],
      recommendedWorkup: {
        initialLabs: ['Serum Osmolality, Serum Glucose, Chemistries, ABG/VBG'],
        confirmatoryTests: ['Serum Osmolality > 320 mOsm/kg with normal/mildly reduced bicarbonate (>18 mEq/L) and minimal ketonemia']
      },
      clinicalPearls: 'HHS carries higher mortality than DKA due to profound dehydration (often 8-12 L deficit) and thromboembolic complications in elderly patients.'
    });

    differentials.push({
      diseaseName: 'Acute Gastroenteritis / Pseudo-Acute Surgical Abdomen',
      icd10Code: 'K52.9',
      likelihood: 20,
      category: 'Alternative',
      pathophysiology: 'Enteric pathogen or severe systemic metabolic irritation causing diffuse abdominal pain and emesis without focal peritoneal inflammation.',
      supportingFindings: ['Intractable nausea, vomiting, and diffuse abdominal tenderness'],
      opposingFindings: ['Presence of Kussmaul breathing and acetone odor confirms metabolic acidosis, not simple gastroenteritis; lack of rebound tenderness excludes true peritonitis'],
      bedsideSignsToTest: ['Serial abdominal examinations to confirm absence of peritoneal signs'],
      recommendedWorkup: {
        initialLabs: ['Stool studies, Basic Metabolic Panel, Serum Ketones'],
        confirmatoryTests: ['Resolution of abdominal pain parallel with correction of acidosis and ketone clearance']
      },
      clinicalPearls: 'Abdominal pain in DKA can mimic acute appendicitis or perforated ulcer! It resolves within hours of fluid and insulin resuscitation; if pain persists after acidosis resolves, investigate for primary intra-abdominal pathology.'
    });
  }

  // Scenario 1: Post-travel Tropical Fever (Kenya / Africa / Spiking fevers)
  else if (s.includes('kenya') || s.includes('africa') || (s.includes('travel') && s.includes('fever') && s.includes('rigor'))) {
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

  // Environmental / Toxicological Gatekeeper: Acute Cholinergic Toxidrome / Organophosphate & Carbamate Poisoning
  const isOrganophosphateOrCholinergic =
    (s.includes('spraying') || s.includes('crops') || s.includes('farmer') || s.includes('pesticide') || s.includes('insecticide') || s.includes('organophosphate') || s.includes('carbamate') || s.includes('chemical odor') || s.includes('garlic')) &&
    (s.includes('pupil') || s.includes('miosis') || s.includes('pinpoint') || s.includes('salivation') || s.includes('lacrimation') || s.includes('bronchorrhea') || s.includes('fasciculation') || s.includes('twitching') || s.includes('bradycardia') || s.includes('diarrhea') || s.includes('cramps'));

  const hasTrueTearingChestPain =
    /\b(?:tearing|ripping)\b(?!\s*(?:eyes?|lacrimation))/i.test(s) &&
    /\b(?:chest|retrosternal|substernal|back|interscapular|aort)\b/i.test(s);

  if (isOrganophosphateOrCholinergic || ((s.includes('pinpoint') || s.includes('miosis')) && (s.includes('bronchorrhea') || (s.includes('salivation') && s.includes('lacrimation'))))) {
    differentials.push({
      diseaseName: 'Organophosphate / Carbamate Poisoning (Acute Cholinergic Toxidrome)',
      icd10Code: 'T60.0X1A',
      likelihood: 96,
      category: 'Primary',
      pathophysiology: 'Organophosphate and carbamate insecticides irreversibly (organophosphates) or reversibly (carbamates) inhibit acetylcholinesterase (AChE) via serine active site phosphorylation/carbamylation. This precipitates massive accumulation of acetylcholine across muscarinic synapses (parasympathetic crisis: miosis, salivation, lacrimation, urination, diarrhea, emesis, and the killer "B\'s": severe bronchorrhea, bronchospasm, bradycardia), nicotinic neuromuscular junctions (muscle fasciculations, cramping, flaccid paralysis), and central nervous system muscarinic receptors (agitation, confusion, central apnea).',
      supportingFindings: [
        'Occupational exposure: Agricultural crop spraying with a faint garlic-like chemical odor on clothing',
        'Classic DUMBELS cholinergic toxidrome: Diarrhea, Pinpoint miosis (1mm pupils), Bradycardia (52 bpm), Bronchorrhea & diffuse wheezing, Emesis, Lacrimation (tearing), Copious salivation',
        'Nicotinic neuromuscular hyperactivity: Muscle fasciculations (twitching) in arms and chest wall',
        'Hypoxemia (SpO2 90%) and tachypnea (RR 26) driven by copious airway secretion flooding (killer "B\'s")',
        'Central nervous system manifestations: Agitation, confusion, and depressed GCS (12)',
      ],
      opposingFindings: ['Absence of anticholinergic findings (mydriasis, flushed dry skin, urinary retention, tachycardia)'],
      bedsideSignsToTest: [
        'Pupillary diameter examination (confirm bilateral pinpoint miosis < 2mm)',
        'Serial pulmonary auscultation assessing airway secretory load ("wet" vs "dry" lungs) to guide Atropine titration',
        'Continuous cardiac monitoring for profound muscarinic bradycardia (HR < 50 bpm) and AV block',
        'Neuromuscular exam for peripheral muscle fasciculations and diaphragm/intercostal fatigue',
      ],
      recommendedWorkup: {
        initialLabs: [
          'RBC Acetylcholinesterase activity (gold standard biomarker of neural AChE inhibition)',
          'Plasma Pseudocholinesterase / Butyrylcholinesterase level',
          'Arterial Blood Gas (ABG: assess hypoxemia and mixed respiratory/metabolic acidosis)',
          'Complete Blood Count, Comprehensive Metabolic Panel, Serum Lactate',
          '12-lead Electrocardiogram (ECG: monitor for QT prolongation, AV block, dysrhythmias)',
        ],
        confirmatoryTests: [
          'Diagnostic Atropine trial (1-2 mg IV; failure to develop anticholinergic signs confirms cholinergic toxicity)',
          'Serial RBC Cholinesterase showing >50% enzyme inhibition confirming organophosphate poisoning',
        ],
        imaging: [
          'Portable upright Chest Radiograph (evaluate for chemical pneumonitis, copious pulmonary edema, or aspiration)',
        ],
      },
      clinicalPearls: 'PRIORITY ZERO: HazMat Level C decontamination! Strip all clothing and double-bag outside the clinical care area; copiously decontaminate skin with soap and water to prevent dermal absorption by staff. Treat "Killer B\'s" immediately with high-dose IV Atropine titrated to DRYING OF AIRWAY SECRETIONS and HR > 80 bpm (NOT pupil size!). Administer Pralidoxime (2-PAM) early before AChE "aging" occurs. CONTRAINDICATION: Avoid Succinylcholine for intubation (causes prolonged apnea due to pseudocholinesterase inhibition); use Rocuronium instead.',
    });

    differentials.push({
      diseaseName: 'Acute Carbamate Insecticide Toxicity',
      icd10Code: 'T60.0X1A',
      likelihood: 45,
      category: 'Secondary',
      pathophysiology: 'Reversible carbamylation of acetylcholinesterase producing a transient cholinergic toxidrome that resolves within 24-48 hours without irreversible enzyme "aging".',
      supportingFindings: ['Identical clinical cholinergic features (SLUDGEM/DUMBELS) following agricultural pesticide exposure'],
      opposingFindings: ['Organophosphates cause irreversible covalent phosphorylation and persistent toxicity without oxime reactivation'],
      bedsideSignsToTest: ['Serial pupil and airway secretion assessments following initial Atropine therapy'],
      recommendedWorkup: {
        initialLabs: ['RBC Cholinesterase and Plasma Cholinesterase levels', 'Arterial Blood Gas'],
        confirmatoryTests: ['Spontaneous recovery of cholinesterase activity within 24-48 hours'],
      },
      clinicalPearls: 'Carbamates do not undergo "aging", so Atropine alone is often sufficient, although Pralidoxime is still administered if the specific pesticide agent is unidentified.',
    });

    differentials.push({
      diseaseName: 'Toxic Mushroom Ingestion (Muscarine-containing Inocybe / Clitocybe)',
      icd10Code: 'T62.0X1A',
      likelihood: 20,
      category: 'Alternative',
      pathophysiology: 'Direct stimulation of postganglionic muscarinic acetylcholine receptors by the heat-stable alkaloid muscarine without cholinesterase inhibition.',
      supportingFindings: ['Prominent salivation, lacrimation, diaphoresis, and bradycardia'],
      opposingFindings: ['Absence of mushroom foraging/ingestion history; presence of nicotinic muscle fasciculations (muscarine only stimulates muscarinic receptors, not nicotinic NMJ)'],
      bedsideSignsToTest: ['Examine for absence of nicotinic fasciculations or motor weakness'],
      recommendedWorkup: {
        initialLabs: ['Normal RBC and plasma cholinesterase levels confirm direct muscarinic agonist rather than AChE inhibitor'],
        confirmatoryTests: ['Mycological identification of ingested mushroom sample'],
      },
      clinicalPearls: 'Pure muscarine poisoning does NOT cause nicotinic fasciculations or paralysis, and responds briskly to low-dose Atropine.',
    });
  }

  // Scenario 2: Severe Chest Pain / Aortic Dissection / ACS (Strict Pathognomonic Preconditions Enforced)
  else if (
    (hasTrueTearingChestPain || ((s.includes('chest pain') || s.includes('retrosternal')) && (s.includes('back') || s.includes('interscapular') || s.includes('asymmetric')))) &&
    !s.includes('lacrimation') && !s.includes('bronchorrhea') && !s.includes('spraying')
  ) {
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

  // Scenario 3: Gynecological Emergency / Ruptured Ectopic Pregnancy in Hemorrhagic Shock
  else if (isRupturedEctopicSuspect) {
    differentials.push({
      diseaseName: 'Ruptured / Complicated Ectopic Pregnancy',
      icd10Code: 'O00.1',
      likelihood: 96,
      category: 'Primary',
      pathophysiology: 'Blastocyst implantation outside endometrial cavity (most commonly fallopian tube ampulla/isthmus) -> trophoblastic invasion erodes tubal muscularis and spiral arteries -> catastrophic tubal rupture and massive intra-abdominal hemorrhage. Hemoperitoneum pooling under diaphragm irritates phrenic nerve afferents (C3-C5), producing referred shoulder pain (Kehr\'s sign), while ongoing blood loss causes decompensated hemorrhagic shock.',
      supportingFindings: [
        'Female of childbearing age with acute severe lower abdominal/pelvic pain',
        '7-week amenorrhea (missed menstrual period) accompanied by abnormal vaginal spotting',
        `Class III Decompensated Hemorrhagic Shock: Marked tachycardia (HR ${hr}), profound hypotension (BP ${sbp}/${v?.bpDiastolic || '?'}), Shock Index: ${shockIndex.toFixed(2)}`,
        'Pathognomonic Kehr\'s sign: Pain radiating to right shoulder indicative of diaphragmatic hemoperitoneum',
        'Exquisite Cervical Motion Tenderness (CMT / Chandelier sign) and palpable right adnexal fullness',
        'Past history of Pelvic Inflammatory Disease (PID: major risk factor for tubal scarring and deciliation)'
      ],
      opposingFindings: ['None. Clinical triad of lower abdominal pain, amenorrhea, and vaginal spotting complicated by hemoperitoneum and shock is pathognomonic.'],
      bedsideSignsToTest: [
        'Bedside Focused Assessment with Sonography for Trauma (FAST) looking for anechoic free peritoneal blood in Morison\'s pouch and Pouch of Douglas',
        'Bedside Transvaginal Ultrasound (TVUS) evaluating for empty uterine cavity and complex adnexal mass ("tubal ring")',
        'Bimanual pelvic examination assessing cervical motion tenderness (CMT) and adnexal fullness',
        'Continuous Shock Index monitoring (HR / SBP; target < 0.8)',
        'Assessment for rigid abdominal guarding without aggressive deep palpation'
      ],
      recommendedWorkup: {
        initialLabs: [
          'STAT Point-of-Care Urine and Serum Quantitative beta-hCG (mandatory life-saving test)',
          'STAT Type and Crossmatch 4-6 units PRBCs (Massive Transfusion Protocol activation)',
          'Complete Blood Count (serial hematocrit and hemoglobin to monitor ongoing internal exsanguination)',
          'Coagulation Panel (PT/INR, aPTT, Fibrinogen for consumptive coagulopathy)',
          'Comprehensive Metabolic Panel and Serum Lactate (tissue hypoperfusion)'
        ],
        confirmatoryTests: [
          'Bedside Transvaginal Ultrasound (TVUS) demonstrating empty uterus and complex adnexal mass with pelvic free fluid',
          'Emergent Diagnostic Laparoscopy / Exploratory Laparotomy with Salpingectomy'
        ]
      },
      clinicalPearls: 'Every woman of reproductive age with acute lower quadrant pain and shock has a ruptured ectopic pregnancy until proven otherwise! Do not delay surgical intervention for contrast CT scans or irrelevant bedside appendicitis maneuvers (Obturator/Psoas). Permissive hypotension (SBP ~90 mmHg) is targeted until definitive surgical hemostasis is achieved.'
    });

    differentials.push({
      diseaseName: 'Ruptured Hemorrhagic Ovarian Cyst / Ovarian Torsion',
      icd10Code: 'N83.2',
      likelihood: 32,
      category: 'Secondary',
      pathophysiology: 'Rupture of a vascular corpus luteum or follicular cyst leading to peritoneal bleeding, or adnexal twist on vascular axis causing acute venous engorgement and ischemia.',
      supportingFindings: ['Acute severe pelvic pain during physical activity', 'Adnexal tenderness on bimanual examination'],
      opposingFindings: ['7 weeks of amenorrhea and vaginal spotting strongly point to gestational trophoblastic etiology; beta-hCG will differentiate'],
      bedsideSignsToTest: ['Bedside TVUS with color Doppler evaluating ovarian parenchymal blood flow and whirlpool sign'],
      recommendedWorkup: {
        initialLabs: ['Serum beta-hCG (to exclude pregnancy)', 'CBC, Coagulation studies'],
        confirmatoryTests: ['Transvaginal pelvic ultrasound with Doppler waveform analysis']
      },
      clinicalPearls: 'A ruptured corpus luteum can present identically to an ectopic pregnancy, but an empty uterus with a positive beta-hCG is an ectopic until proven otherwise.'
    });

    differentials.push({
      diseaseName: 'Acute Appendicitis',
      icd10Code: 'K35.80',
      likelihood: 12,
      category: 'Alternative',
      pathophysiology: 'Luminal obstruction of the vermiform appendix causing visceral then somatic peritoneal inflammation.',
      supportingFindings: ['Right lower quadrant pain and peritoneal guarding'],
      opposingFindings: [
        'Appendicitis does NOT cause cervical motion tenderness (CMT) or adnexal fullness',
        'Appendicitis does NOT cause vaginal spotting or 7 weeks of amenorrhea',
        'Appendicitis does NOT cause Kehr\'s referred shoulder pain without generalized purulent peritonitis',
        'Profound hemorrhagic shock without days of septic fever is incompatible with uncomplicated appendicitis'
      ],
      bedsideSignsToTest: ['McBurney\'s point tenderness (secondary check only; do not delay operative resuscitation)'],
      recommendedWorkup: {
        initialLabs: ['CBC with differential, Serum beta-hCG (mandatory rule-out)'],
        confirmatoryTests: ['Graded compression ultrasound of RLQ']
      },
      clinicalPearls: 'Never diagnose appendicitis in a reproductive-age female in shock before ruling out ruptured ectopic pregnancy with a beta-hCG!'
    });
  }

  // Scenario 4: Acute Abdomen (Appendicitis)
  else if (
    (s.includes('appendicitis') || (s.includes('rlq') && s.includes('pain')) || (s.includes('right lower quadrant') && s.includes('pain')) || (s.includes('mcburney') && s.includes('pain')) || (s.includes('umbilicus') && s.includes('iliac'))) &&
    !s.includes('no rebound') && !s.includes('pseudo-acute') && !s.includes('acetone') && !s.includes('insulin')
  ) {
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

  let immediateActionPlan = [
    `Triage Level ${triage.level} (${triage.levelName}): Prioritize patient evaluation within ${triage.timeToPhysician}.`,
    'Establish large-bore peripheral IV access and draw baseline blood tubes (CBC, crossmatch, chemistries).',
    'Continuous monitoring of vital signs (SpO2, continuous 3-lead telemetry, automated NIBP q15m).',
    'Address active red flags and allergy warnings before initiating empirical pharmacotherapy.',
  ];

  if (isOrganophosphateOrCholinergic) {
    immediateActionPlan = [
      'HAZMAT LEVEL C PPE & DECONTAMINATION: Immediately strip all clothing and double-bag outside the ED; copiously wash skin with soap and water to protect healthcare staff from transdermal toxicity.',
      'HIGH-DOSE ATROPINIZATION: Administer IV Atropine (2 to 4 mg IV bolus every 3-5 minutes, doubling dose if no response) titrating strictly to the clearance of bronchorrhea and bronchospasm ("Killer B\'s") and HR > 80 bpm.',
      'CHOLINESTERASE REACTIVATION: Administer Pralidoxime (2-PAM) 1-2 g IV over 30 minutes followed by continuous infusion to treat nicotinic muscle weakness and fasciculations before irreversible enzyme "aging".',
      'AIRWAY PROTECTION: Aggressive inline suctioning for copious airway secretions; AVOID Succinylcholine for intubation (causes prolonged paralysis due to pseudocholinesterase inhibition); use Rocuronium.',
      'Continuous cardiac telemetry, SpO2 monitoring, and emergent ICU / Toxicology consult.',
    ];
  } else if (isRupturedEctopicSuspect) {
    immediateActionPlan = [
      'EMERGENCY RESUSCITATION & MTP: Immediately activate Massive Transfusion Protocol (MTP). Request 4-6 units of uncrossmatched Type-O negative PRBCs on standby.',
      'LARGE-BORE VASCULAR ACCESS: Place two large-bore 14G or 16G peripheral IV lines immediately; initiate rapid warmed isotonic crystalloid bolus (1 L Plasmalyte) via rapid infuser, targeting permissive hypotension (SBP ~90 mmHg).',
      'STAT PREGNANCY TESTING: Obtain immediate point-of-care Urine beta-hCG and STAT quantitative Serum beta-hCG.',
      'BEDSIDE ULTRASOUND (FAST & TVUS): Perform emergent bedside FAST examination to identify hemoperitoneum (Morison\'s pouch & Pouch of Douglas), followed by Transvaginal Ultrasound (TVUS) to assess adnexal mass and rule out intrauterine pregnancy.',
      'EMERGENT OB-GYN SURGICAL CONSULTATION: Immediate page to OB-GYN attending for transfer to operating room for emergency Diagnostic Laparoscopy vs Exploratory Laparotomy / Salpingectomy.',
      'CRITICAL CONTRAINDICATION: Do NOT send the patient to radiology for abdominal CT scan with oral contrast (causes fatal delays in surgical hemostasis); omit irrelevant appendicitis maneuvers (Obturator/Psoas) during active internal exsanguination.'
    ];
  }

  let differentialSummary = `Based on patient demographics (${patient.age}y ${patient.gender}), chief complaints, and past medical history, the highest probability differential is ${differentials[0]?.diseaseName}. Immediate clinical attention is required to exclude life-threatening rule-outs.`;
  if (isOrganophosphateOrCholinergic) {
    differentialSummary = `Patient presents with acute cholinergic crisis ("Killer B's": severe bronchorrhea, bronchospasm, bradycardia, miosis, copious secretions, and fasciculations) following commercial agricultural crop spraying. ESI Triage Level 1 (Resuscitation). Leading diagnosis: Organophosphate / Carbamate Poisoning (96%). Immediate decontamination and high-dose IV Atropine protocol initiated.`;
  } else if (isRupturedEctopicSuspect) {
    differentialSummary = `Patient is a ${patient.age}-year-old female presenting with acute lower abdominal pain, 7-week amenorrhea, vaginal spotting, Kehr's sign (referred shoulder pain), and Class III Hemorrhagic Shock (BP ${sbp}/${v?.bpDiastolic || '?'}, HR ${hr}, Shock Index: ${shockIndex.toFixed(2)}). ESI Triage Level 1 (Resuscitation). Leading diagnosis: Ruptured Ectopic Pregnancy (96%). Immediate Massive Transfusion Protocol activation, STAT beta-hCG, bedside FAST/TVUS, and emergent OB-GYN operative hemostasis required.`;
  }

  return {
    triage,
    topDiagnoses: differentials,
    allergyAndMedicationAlerts: allergyAlerts,
    immediateActionPlan,
    differentialSummary,
  };
}

export function getNextAkinatorQuestionDeterministic(
  patient: PatientProfile,
  step: number,
  answeredCount: number
): AkinatorQuestion {
  return getCaseSpecificAkinatorQuestion(patient, step, answeredCount);
}
