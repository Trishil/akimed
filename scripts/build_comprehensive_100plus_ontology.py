#!/usr/bin/env python3
"""
AkiMed Comprehensive 100+ Clinical Disease Knowledge Base & Dataset Builder
Scales AkiMed's medical universe from 49 conditions to 115+ conditions across all major medical specialties:
- Endocrine & Metabolic (DKA, HHS, Hypothyroidism, Graves, Addison's, Hypoglycemia)
- Renal & Urology (Kidney Stones, AKI, CKD, Nephrotic, Urinary Retention)
- Gastrointestinal & Hepato-Biliary (Hepatitis A/B/C, Cirrhosis, Diverticulitis, IBD, Celiac, SBO)
- Cardiovascular & Vascular (STEMI, NSTEMI, Aortic Dissection, PE, Heart Failure, DVT, Endocarditis)
- Neurological & Psychiatric (Meningitis, SAH, Stroke, Epilepsy, Parkinson's, MS, Bell's Palsy, Migraine, Vertigo)
- Infectious & Tropical (Malaria, Dengue, Typhoid, Leptospirosis, Sepsis, TB, Lyme, Mono, Cellulitis, Shingles)
- Rheumatology & Musculoskeletal (Gout, Pseudogout, Rheumatoid Arthritis, Septic Arthritis, SLE)
- OB/GYN & Women's Health (Ectopic Pregnancy, Preeclampsia, PID, Ovarian Torsion)
- Hematology & Oncology (Iron Deficiency Anemia, Hemolytic Anemia, ITP, Leukemia)
"""

import os
import sys
import json
import csv
import random
import math
from collections import defaultdict

DATA_ROOT = "/Volumes/Trishil/Akimed_data"
PROCESSED_DIR = os.path.join(DATA_ROOT, "processed")
RAW_DIR = os.path.join(DATA_ROOT, "raw")
SCRIPTS_DIR = os.path.join(DATA_ROOT, "scripts")

# Load existing 49 conditions and 223 evidences
with open(os.path.join(PROCESSED_DIR, "conditions_lookup.json"), "r", encoding="utf-8") as f:
    existing_conditions = json.load(f)

with open(os.path.join(PROCESSED_DIR, "clinical_knowledge.json"), "r", encoding="utf-8") as f:
    existing_knowledge = json.load(f)

with open(os.path.join(PROCESSED_DIR, "evidences_lookup.json"), "r", encoding="utf-8") as f:
    evidences_lookup = json.load(f)

with open(os.path.join(PROCESSED_DIR, "prob_matrix.json"), "r", encoding="utf-8") as f:
    existing_prob_matrix = json.load(f)

with open(os.path.join(PROCESSED_DIR, "condition_priors.json"), "r", encoding="utf-8") as f:
    existing_priors = json.load(f)

print(f"[LOAD] Loaded {len(existing_conditions)} existing DDXPlus conditions and {len(evidences_lookup)} clinical evidences.")

# ===========================================================================
# 66+ EXPANDED MEDICAL CONDITIONS (MBBS / Harrison's Internal Medicine)
# ===========================================================================
EXPANDED_CONDITIONS = {
    # --- ENDOCRINE & METABOLIC ---
    "Diabetic ketoacidosis (DKA)": {
        "icd10": "E10.10",
        "category": "Primary",
        "severity": 1,
        "system": "endocrine",
        "pathophysiology": "Absolute insulin deficiency leading to uninhibited lipolysis, hepatic ketogenesis of beta-hydroxybutyrate and acetoacetate, profound anion-gap metabolic acidosis, osmotic diuresis, and electrolyte wasting.",
        "bedsideSignsToTest": ["Kussmaul breathing (deep, rapid sighing respirations)", "Fruity acetonic breath odor", "Signs of severe dehydration (dry mucous membranes, sunken eyes, delayed skin turgor)"],
        "initialLabs": ["Fingerstick blood glucose (>250 mg/dL)", "Serum ketones / beta-hydroxybutyrate (>3 mmol/L)", "Arterial or venous blood gas (pH < 7.30, HCO3 < 18 mEq/L)", "Basic metabolic panel (elevated anion gap >12, calculate corrected sodium)"],
        "confirmatoryTests": ["Urinalysis (heavy glucosuria and ketonuria)", "Serum osmolality and potassium serial tracking"],
        "imaging": ["Chest X-ray to rule out underlying infectious trigger (pneumonia)"],
        "clinicalPearls": "Always check serum potassium before starting IV insulin! If K+ < 3.3 mEq/L, replenish potassium first to prevent fatal cardiac arrhythmias.",
        "evidences": ["E_66", "E_58", "E_53", "E_148", "E_211", "E_50", "E_89"]
    },
    "Hyperosmolar hyperglycemic state (HHS)": {
        "icd10": "E11.00",
        "category": "Primary",
        "severity": 1,
        "system": "endocrine",
        "pathophysiology": "Relative insulin deficiency sufficient to prevent lipolysis and ketogenesis, but inadequate to prevent severe hyperglycemia (>600 mg/dL), massive osmotic diuresis, extreme hyperosmolality (>320 mOsm/kg), and altered consciousness.",
        "bedsideSignsToTest": ["Severe dehydration and hypovolemic shock", "Altered sensorium / lethargy without Kussmaul respirations"],
        "initialLabs": ["Serum glucose (>600 mg/dL)", "Serum osmolality (>320 mOsm/kg)", "BMP (normal anion gap, acute prerenal azotemia)"],
        "confirmatoryTests": ["Serum ketones negative or minimal"],
        "imaging": ["Brain CT if focal neurological deficits present"],
        "clinicalPearls": "Fluid deficit is massive (often 8-10 liters); aggressive isotonic crystalloid resuscitation is the cornerstone of therapy.",
        "evidences": ["E_159", "E_89", "E_76", "E_82", "E_155"]
    },
    "Hypothyroidism / Hashimoto thyroiditis": {
        "icd10": "E03.9",
        "category": "Alternative",
        "severity": 4,
        "system": "endocrine",
        "pathophysiology": "Autoimmune destruction or primary failure of thyroid follicular cells leading to decreased circulating T4/T3, elevated TSH, generalized reduction in metabolic rate, and interstitial accumulation of glycosaminoglycans (myxedema).",
        "bedsideSignsToTest": ["Delayed relaxation phase of deep tendon reflexes ('hung-up' ankle jerk)", "Non-pitting periorbital and pretibial puffiness", "Bradycardia, coarse brittle hair, and cold dry skin"],
        "initialLabs": ["Serum TSH (elevated)", "Free T4 (low)", "Anti-TPO and Anti-Thyroglobulin antibodies"],
        "confirmatoryTests": ["Thyroid ultrasound (heterogeneous pseudonodular parenchyma)"],
        "imaging": ["Thyroid ultrasound"],
        "clinicalPearls": "Elevated TSH with normal free T4 is subclinical hypothyroidism; treat if symptomatic, TSH > 10, or pregnant.",
        "evidences": ["E_89", "E_175", "E_151", "E_58"]
    },
    "Hyperthyroidism / Graves disease": {
        "icd10": "E05.00",
        "category": "Primary",
        "severity": 2,
        "system": "endocrine",
        "pathophysiology": "Autoantibodies stimulating the TSH receptor (TSI) -> excessive autonomous synthesis and secretion of thyroid hormones -> hypermetabolic state with adrenergic hyperactivation.",
        "bedsideSignsToTest": ["Graves ophthalmopathy (exophthalmos, proptosis, lid lag / von Graefe sign)", "Fine postural hand tremor", "Diffuse thyroid enlargement with audible vascular bruit", "Resting sinus tachycardia or atrial fibrillation"],
        "initialLabs": ["Serum TSH (undetectable <0.01 mIU/L)", "Free T4 and Free T3 (markedly elevated)", "TSH-receptor antibodies (TRAb/TSI)"],
        "confirmatoryTests": ["Radioactive Iodine Uptake (RAIU) scan (diffuse homogeneous uptake in Graves vs patchy in toxic nodular goiter)"],
        "imaging": ["Thyroid scintigraphy / RAIU", "Orbital MRI if severe dysthyroid optic neuropathy"],
        "clinicalPearls": "Propranolol rapidly controls adrenergic symptoms (tremor, palpitations); antithyroid drugs (Methimazole/PTU) take weeks to deplete preformed colloid.",
        "evidences": ["E_155", "E_50", "E_89", "E_175", "E_193"]
    },
    "Acute hypoglycemia": {
        "icd10": "E16.2",
        "category": "Primary",
        "severity": 1,
        "system": "endocrine",
        "pathophysiology": "Blood glucose falling below 70 mg/dL (symptomatic <55 mg/dL) triggering sympathoadrenal catecholamine release (autonomic phase) followed by cerebral glucose deprivation (neuroglycopenic phase).",
        "bedsideSignsToTest": ["Whipple's triad: autonomic/neuroglycopenic symptoms, low blood glucose, resolution of symptoms following carbohydrate administration", "Profuse cold diaphoresis, pallor, and fine tremors"],
        "initialLabs": ["Immediate fingerstick point-of-care glucose (<55 mg/dL)", "Serum insulin, C-peptide, and proinsulin (if non-diabetic hypoglycemia workup)"],
        "confirmatoryTests": ["Rapid clinical response to 25g IV Dextrose (D50W) or 1mg IM Glucagon"],
        "imaging": ["None required in acute presentation"],
        "clinicalPearls": "Patients on beta-blockers may have masked autonomic warning signs (no tremors or palpitations); only diaphoresis persists!",
        "evidences": ["E_50", "E_193", "E_155", "E_76", "E_82", "E_159"]
    },
    "Primary adrenal insufficiency (Addisonian crisis)": {
        "icd10": "E27.1",
        "category": "Primary",
        "severity": 1,
        "system": "endocrine",
        "pathophysiology": "Autoimmune or infectious destruction of adrenal cortex -> profound deficiency of cortisol and aldosterone -> refractory hypotension, hyponatremia, hyperkalemia, and vascular collapse.",
        "bedsideSignsToTest": ["Hyperpigmentation of palmar creases, buccal mucosa, and scars (from elevated ACTH and MSH)", "Postural orthostatic hypotension and shock"],
        "initialLabs": ["Electrolytes (hyponatremia, hyperkalemia, hypoglycemia)", "Morning serum cortisol (<5 mcg/dL)", "Plasma ACTH (markedly elevated in primary)"],
        "confirmatoryTests": ["Cosyntropin (ACTH) stimulation test (failure of cortisol to rise >18 mcg/dL)"],
        "imaging": ["Adrenal CT (adrenal enlargement/calcification in TB, atrophy in autoimmune)"],
        "clinicalPearls": "In acute crisis with shock, immediately administer IV Hydrocortisone (100mg bolus) and normal saline without waiting for ACTH stimulation results; Dexamethasone can be used if immediate cosyntropin testing is planned.",
        "evidences": ["E_55", "E_53", "E_159", "E_151"]
    },

    # --- RENAL & UROLOGY ---
    "Nephrolithiasis (Renal colic)": {
        "icd10": "N20.0",
        "category": "Primary",
        "severity": 2,
        "system": "renal",
        "pathophysiology": "Supersaturation of urinary salts (calcium oxalate, uric acid) forming calculi that dislodge and obstruct the ureteropelvic or ureterovesical junction, causing proximal hydroureteronephrosis, smooth muscle spasm, and visceral pain.",
        "bedsideSignsToTest": ["Costovertebral angle (CVA) tenderness", "Patient constantly writhes and paces attempting to find a comfortable position (unlike peritonitis where patient lies completely still)"],
        "initialLabs": ["Urinalysis (microscopic or macroscopic hematuria in >85% of cases, urine pH, crystal microscopy)", "Serum creatinine, BUN, calcium, uric acid", "Urine pregnancy test in females"],
        "confirmatoryTests": ["Non-contrast Low-Dose Helical CT Abdomen/Pelvis (gold standard, detects stones >1mm)"],
        "imaging": ["Non-contrast CT KUB", "Renal Ultrasound (detects hydronephrosis and acoustic shadowing stones; preferred in pregnancy/pediatrics)"],
        "clinicalPearls": "Pain radiates characteristically from loin to groin/labia/testicle as stone travels down the ureter. Fever + obstructing stone is a urological emergency requiring emergent decompression via stent or nephrostomy!",
        "evidences": ["E_55", "E_53", "E_54", "E_57", "E_59", "E_56", "E_58", "E_45"]
    },
    "Acute pyelonephritis": {
        "icd10": "N10",
        "category": "Secondary",
        "severity": 2,
        "system": "renal",
        "pathophysiology": "Ascending bacterial infection (most commonly uropathogenic E. coli) from lower urinary tract through ureters into renal parenchyma and pelvis causing acute suppurative inflammation.",
        "bedsideSignsToTest": ["Murphy punch sign (CVA fist percussion tenderness)", "Abdominal and suprapubic palpation for cystitis overlap"],
        "initialLabs": ["Urinalysis with microscopy (pyuria, leukocyte esterase, nitrites, WBC casts)", "Urine Culture and Susceptibility", "Blood Cultures x 2"],
        "confirmatoryTests": ["Renal Ultrasound or CT Abdomen/Pelvis if non-responsive at 48-72h"],
        "imaging": ["Renal POCUS", "Contrast CT abdomen/pelvis if suspecting perinephric abscess or emphysematous pyelonephritis"],
        "clinicalPearls": "WBC casts in urine sediment are pathognomonic for upper urinary tract involvement (pyelonephritis vs simple cystitis).",
        "evidences": ["E_91", "E_55", "E_53", "E_54", "E_56", "E_58"]
    },
    "Acute kidney injury (Prerenal azotemia)": {
        "icd10": "N17.9",
        "category": "Secondary",
        "severity": 2,
        "system": "renal",
        "pathophysiology": "Renal hypoperfusion without intrinsic parenchymal structural damage (caused by hypovolemia, sepsis, or heart failure) -> decreased GFR, activation of RAAS, and maximal tubular sodium/water reabsorption.",
        "bedsideSignsToTest": ["Orthostatic blood pressure drop (>20 mmHg systolic drop on standing)", "Dry axillae and mucosal dehydration", "Oliguria (<0.5 mL/kg/h)"],
        "initialLabs": ["BUN and Serum Creatinine (BUN:Cr ratio > 20:1)", "Fractional Excretion of Sodium (FeNa < 1%)", "Urine osmolality (>500 mOsm/kg)", "Urine microscopy (hyaline casts)"],
        "confirmatoryTests": ["Rapid clinical and biochemical response to IV isotonic fluid challenge (500-1000 mL normal saline)"],
        "imaging": ["Renal Ultrasound to exclude post-renal hydronephrosis"],
        "clinicalPearls": "FeNa < 1% indicates intact tubular function in prerenal azotemia; FeNa > 2% points to Acute Tubular Necrosis (ATN) with muddy brown granular casts.",
        "evidences": ["E_151", "E_148", "E_89", "E_76"]
    },
    "Benign prostatic hyperplasia with acute retention": {
        "icd10": "N40.1",
        "category": "Alternative",
        "severity": 3,
        "system": "renal",
        "pathophysiology": "Nodular hyperplasia of prostatic transition zone stroma and epithelial cells compressing the prostatic urethra, culminating in acute painful urinary retention.",
        "bedsideSignsToTest": ["Suprapubic fullness and dullness to percussion (palpable distended bladder)", "Digital Rectal Exam (smooth, symmetrically enlarged, non-tender, rubbery prostate)"],
        "initialLabs": ["Serum creatinine and BUN (rule out post-renal acute renal failure)", "Urinalysis", "PSA (deferred during acute retention)"],
        "confirmatoryTests": ["Immediate diagnostic and therapeutic relief upon urethral catheterization (drainage of >400-1000 mL urine)"],
        "imaging": ["Bedside bladder POCUS scan (>300-500 mL retained volume)"],
        "clinicalPearls": "Decompress the bladder immediately! Beware of post-obstructive diuresis: monitor urine output and electrolytes hourly for 24-48 hours post-decompression.",
        "evidences": ["E_55", "E_53", "E_54", "E_58"]
    },

    # --- GASTROINTESTINAL & HEPATO-BILIARY ---
    "Acute appendicitis": {
        "icd10": "K35.80",
        "category": "Primary",
        "severity": 2,
        "system": "gi",
        "pathophysiology": "Obstruction of appendiceal lumen by fecalith or lymphoid hyperplasia -> intraluminal distension, bacterial invasion, transmural ischemia, and parietal peritoneal irritation.",
        "bedsideSignsToTest": ["McBurney point tenderness", "Rovsing sign (RLQ pain on LLQ palpation)", "Psoas and Obturator signs"],
        "initialLabs": ["Complete Blood Count (leukocytosis with left shift)", "C-Reactive Protein", "Urinalysis (rule out UTI/nephrolithiasis)", "Serum beta-hCG in females"],
        "confirmatoryTests": ["Contrast-enhanced Abdominal CT (appendiceal diameter >6mm, wall thickening, periappendiceal fat stranding)"],
        "imaging": ["Graded compression ultrasound (first-line in children/pregnancy)", "Contrast-enhanced Abdominal CT (gold standard in adults)"],
        "clinicalPearls": "Migratory pain from periumbilicus to RLQ has the highest positive likelihood ratio for appendicitis.",
        "evidences": ["E_55", "E_53", "E_54", "E_57", "E_59", "E_56", "E_58", "E_91", "E_148", "E_211"]
    },
    "Acute calculous cholecystitis": {
        "icd10": "K81.0",
        "category": "Secondary",
        "severity": 2,
        "system": "gi",
        "pathophysiology": "Cystic duct obstruction by gallstone -> gallbladder distension, chemical irritation, and secondary bacterial infection triggering localized RUQ peritonitis.",
        "bedsideSignsToTest": ["Murphy sign elicitation (inspiratory arrest on deep RUQ palpation)", "Boa sign (hyperesthesia over right scapula)"],
        "initialLabs": ["CBC with differential (leukocytosis)", "Liver function tests (Alkaline Phosphatase, Bilirubin, ALT/AST)", "Lipase (rule out gallstone pancreatitis)"],
        "confirmatoryTests": ["Right Upper Quadrant Abdominal Ultrasound (gallstones, wall thickening >4mm, pericholecystic fluid, sonographic Murphy sign)"],
        "imaging": ["RUQ Ultrasound", "HIDA Cholescintigraphy (gold standard if ultrasound equivocal: non-visualization of gallbladder)"],
        "clinicalPearls": "Sonographic Murphy sign combined with gallstones and gallbladder wall thickening has >95% positive predictive value.",
        "evidences": ["E_58", "E_53", "E_54", "E_57", "E_148", "E_211", "E_91", "E_30", "E_215"]
    },
    "Acute pancreatitis": {
        "icd10": "K85.9",
        "category": "Alternative",
        "severity": 2,
        "system": "gi",
        "pathophysiology": "Premature intra-acinar activation of trypsinogen to trypsin -> autodigestion of pancreatic parenchyma, vascular damage, and intense retroperitoneal inflammation.",
        "bedsideSignsToTest": ["Epigastric palpation for severe tenderness with guarding", "Inspection for Cullen sign (periumbilical ecchymosis) and Grey Turner sign (flank ecchymosis)"],
        "initialLabs": ["Serum Lipase (diagnostic if >3x upper limit of normal)", "Serum Amylase", "CBC, BUN, Creatinine, Calcium (Ranson/BISAP criteria scoring)"],
        "confirmatoryTests": ["Abdominal Ultrasound for biliary etiology", "Contrast-enhanced CT abdomen at 48-72h if severe or non-resolving"],
        "imaging": ["Abdominal Ultrasound", "Contrast-enhanced CT abdomen at 48-72h"],
        "clinicalPearls": "Serum lipase remains elevated longer and is far more sensitive and specific than amylase. Aggressive early isotonic IV hydration saves lives!",
        "evidences": ["E_58", "E_53", "E_33", "E_211", "E_148", "E_57", "E_91"]
    },
    "Acute diverticulitis": {
        "icd10": "K57.32",
        "category": "Secondary",
        "severity": 2,
        "system": "gi",
        "pathophysiology": "Microperforation or fecalith obstruction of colonic diverticulum (most commonly sigmoid colon) leading to localized inflammation, pericolic abscess, or phlegmon ('left-sided appendicitis').",
        "bedsideSignsToTest": ["Left Lower Quadrant (LLQ) focal tenderness and palpable mass", "Check for localized rebound tenderness or guarding"],
        "initialLabs": ["CBC (leukocytosis)", "CRP and ESR", "Urinalysis (rule out colovesical fistula: pneumaturia, fecaluria)"],
        "confirmatoryTests": ["Contrast-enhanced CT Abdomen and Pelvis (bowel wall thickening >4mm, pericolic fat stranding, abscess/extraluminal air)"],
        "imaging": ["CT Abdomen/Pelvis with IV contrast"],
        "clinicalPearls": "Avoid colonoscopy during acute diverticulitis episode due to high risk of bowel perforation; perform elective colonoscopy 6-8 weeks post-resolution.",
        "evidences": ["E_55", "E_53", "E_54", "E_58", "E_91"]
    },
    "Acute viral hepatitis (Hepatitis A/B/C)": {
        "icd10": "B15.9",
        "category": "Alternative",
        "severity": 3,
        "system": "gi",
        "pathophysiology": "Hepatotropic viral infection inducing cytotoxic T-cell-mediated lysis of infected hepatocytes -> lobular inflammation, ballooning degeneration, cholestasis, and transaminitis.",
        "bedsideSignsToTest": ["Scleral icterus and skin jaundice", "Tender hepatomegaly with smooth liver edge", "Tea-colored dark urine and clay-colored pale stools"],
        "initialLabs": ["Serum ALT and AST (markedly elevated in thousands >1,000 U/L, ALT > AST)", "Total and Direct Bilirubin", "Prothrombin Time / INR (key marker of acute hepatic synthetic failure)"],
        "confirmatoryTests": ["Viral serology panel: IgM anti-HAV (acute Hep A), HBsAg and IgM anti-HBc (acute Hep B), anti-HCV and HCV RNA PCR"],
        "imaging": ["RUQ Abdominal Ultrasound"],
        "clinicalPearls": "Prolongation of Prothrombin Time / INR and altered sensorium (asterixis) are ominous signs of Acute Liver Failure requiring immediate transplant center transfer.",
        "evidences": ["E_91", "E_50", "E_151", "E_55"]
    },
    "Decompensated liver cirrhosis / Ascites": {
        "icd10": "K74.60",
        "category": "Secondary",
        "severity": 2,
        "system": "gi",
        "pathophysiology": "Diffuse parenchymal fibrosis and regenerative nodules causing increased sinusoidal resistance, portal hypertension, splanchnic arterial vasodilation, ascites, and variceal formation.",
        "bedsideSignsToTest": ["Shifting dullness and fluid wave on abdominal percussion", "Caput medusae, spider angiomas, and palmar erythema", "Asterixis ('liver flap' wrist tremor) indicative of hepatic encephalopathy"],
        "initialLabs": ["Liver Function Tests (low Albumin, elevated Bilirubin, elevated AST/ALT ratio >2 in alcoholic)", "Coagulation profile (prolonged INR/PT)", "CBC (thrombocytopenia from hypersplenism)"],
        "confirmatoryTests": ["Diagnostic Paracentesis (calculate Serum-Ascites Albumin Gradient: SAAG >= 1.1 g/dL confirms portal hypertension; ascitic PMN > 250 cells/mm3 confirms SBP)"],
        "imaging": ["Abdominal Ultrasound with Doppler (portal vein patency, liver nodularity, splenomegaly)"],
        "clinicalPearls": "Every cirrhotic patient admitted with ascites or clinical deterioration mandates a diagnostic paracentesis to rule out Spontaneous Bacterial Peritonitis (SBP)!",
        "evidences": ["E_151", "E_30", "E_129", "E_89", "E_159"]
    },
    "Perforated peptic ulcer disease": {
        "icd10": "K27.0",
        "category": "Primary",
        "severity": 1,
        "system": "gi",
        "pathophysiology": "Full-thickness erosion of gastric or duodenal wall allowing caustic acid and intraluminal contents to escape into peritoneal cavity, causing immediate chemical peritonitis.",
        "bedsideSignsToTest": ["Board-like involuntary abdominal wall rigidity", "Loss of liver dullness on percussion (displaced by free subdiaphragmatic gas)", "Rebound tenderness throughout all four quadrants"],
        "initialLabs": ["CBC (leukocytosis)", "Serum amylase/lipase (may be mildly elevated from peritoneal absorption)", "Type and Crossmatch 4 units PRBCs"],
        "confirmatoryTests": ["Erect Chest Radiograph demonstrating crescent of free subdiaphragmatic air (pneumoperitoneum)", "Abdominal CT with IV contrast"],
        "imaging": ["Erect Chest X-ray", "Abdominal CT"],
        "clinicalPearls": "Erect chest radiograph detects free air in >75% of perforated peptic ulcers; immediate surgical consultation, broad-spectrum IV antibiotics, and fluid resuscitation are mandatory.",
        "evidences": ["E_58", "E_53", "E_56", "E_59", "E_211", "E_30"]
    },

    # --- CARDIOVASCULAR & VASCULAR ---
    "Acute ST-elevation myocardial infarction (STEMI)": {
        "icd10": "I21.0",
        "category": "Primary",
        "severity": 1,
        "system": "cardiac",
        "pathophysiology": "Complete acute occlusive coronary artery thrombosis following atheromatous plaque rupture -> transmural myocardial ischemia and coagulative necrosis.",
        "bedsideSignsToTest": ["Levine sign (clenched fist over sternum)", "Auscultate for new S4 gallop or mitral regurgitation murmur", "Check bilateral arm BP to rule out aortic dissection"],
        "initialLabs": ["High-sensitivity Cardiac Troponin I/T", "12-Lead ECG within 10 minutes", "CBC, Electrolytes, Coagulation markers"],
        "confirmatoryTests": ["Emergency Coronary Angiography (cath lab primary PCI within 90 min)"],
        "imaging": ["Emergency Transthoracic Echocardiogram"],
        "clinicalPearls": "Time is muscle! Immediate reperfusion via primary PCI is the gold standard within 90 minutes. Never give nitrates if right ventricular infarction is suspected.",
        "evidences": ["E_55", "E_53", "E_54", "E_57", "E_59", "E_56", "E_58", "E_50", "E_66", "E_14", "E_105"]
    },
    "Acute Stanford Type A aortic dissection": {
        "icd10": "I71.01",
        "category": "Primary",
        "severity": 1,
        "system": "cardiac",
        "pathophysiology": "Intimal tear in ascending aorta allowing pulsatile blood to cleave aortic media -> false lumen propagation with risk of cardiac tamponade, aortic regurgitation, or coronary ostial occlusion.",
        "bedsideSignsToTest": ["Bilateral simultaneous upper extremity blood pressure measurement (>20 mmHg difference)", "Radio-radial and radio-femoral pulse synchronization", "Auscultate for new early diastolic murmur of aortic regurgitation"],
        "initialLabs": ["D-dimer (rapid rule-out if low)", "Type and Crossmatch 6 units PRBCs", "Troponin, CBC, BMP"],
        "confirmatoryTests": ["CT Aortography (CTA chest, abdomen, pelvis - gold standard)", "Transesophageal Echocardiography (TEE) if hemodynamically unstable"],
        "imaging": ["CTA Chest/Abdomen/Pelvis", "Bedside Echo"],
        "clinicalPearls": "Never give full-dose anticoagulation until CTA excludes dissection! Every hour of delay increases mortality by 1-2%.",
        "evidences": ["E_55", "E_53", "E_54", "E_57", "E_59", "E_56", "E_58", "E_50", "E_66", "E_159"]
    },
    "Acute pulmonary embolism": {
        "icd10": "I26.9",
        "category": "Secondary",
        "severity": 1,
        "system": "pulmonary",
        "pathophysiology": "Thrombus dislodges from deep venous system (DVT) -> occludes pulmonary arterial bed -> acute ventilation-perfusion mismatch, increased right ventricular afterload, and reflex tachypnea.",
        "bedsideSignsToTest": ["Wells score calculation", "Calf circumference measurement (>3 cm asymmetry)", "Jugular venous pressure inspection for RV strain"],
        "initialLabs": ["Quantitative D-Dimer (high negative predictive value)", "Troponin and NT-proBNP for RV strain risk stratification", "Arterial Blood Gas (hypoxemia, hypocapnia, respiratory alkalosis)"],
        "confirmatoryTests": ["CT Pulmonary Angiography (CTPA - gold standard)", "Lower extremity Compression Ultrasonography for DVT"],
        "imaging": ["CTPA", "Bilateral Lower Extremity Doppler"],
        "clinicalPearls": "Tachycardia out of proportion to fever is a major red flag for PE. High Wells score mandates immediate CTPA!",
        "evidences": ["E_66", "E_53", "E_57", "E_45", "E_151", "E_159", "E_220", "E_59"]
    },
    "Acute decompensated heart failure": {
        "icd10": "I50.9",
        "category": "Secondary",
        "severity": 2,
        "system": "cardiac",
        "pathophysiology": "Elevated cardiac filling pressures causing hydrostatic transudation of fluid into pulmonary alveoli and systemic venous congestion.",
        "bedsideSignsToTest": ["Orthopnea (requires 3+ pillows to sleep) or Paroxysmal Nocturnal Dyspnea (PND)", "Bilateral lower extremity pitting edema", "Elevated Jugular Venous Distension (JVD) >8 cm", "S3 gallop and bilateral basal pulmonary crackles"],
        "initialLabs": ["Serum B-Type Natriuretic Peptide (BNP / NT-proBNP)", "Troponin", "Comprehensive Metabolic Panel (BUN/Creatinine)"],
        "confirmatoryTests": ["Transthoracic Echocardiogram (EF, diastolic function, valve lesions)"],
        "imaging": ["Chest X-ray (cardiomegaly, cephalization, Kerley B lines, pulmonary edema)"],
        "clinicalPearls": "An elevated NT-proBNP with S3 gallop has the highest positive predictive value for acute cardiogenic dyspnea.",
        "evidences": ["E_66", "E_217", "E_64", "E_67", "E_151", "E_89"]
    },
    "Deep vein thrombosis (DVT)": {
        "icd10": "I82.40",
        "category": "Primary",
        "severity": 2,
        "system": "cardiac",
        "pathophysiology": "Virchow's triad (venous stasis, endothelial injury, hypercoagulability) promoting platelet and fibrin clot propagation in deep veins of lower extremity (femoral, popliteal, iliac).",
        "bedsideSignsToTest": ["Unilateral calf swelling (>3 cm discrepancy measured 10 cm below tibial tuberosity)", "Calf tenderness on manual palpation", "Check for localized warmth, erythema, and superficial venous dilation"],
        "initialLabs": ["D-Dimer (ELISA method, high sensitivity >95%)", "Coagulation profile", "Renal function (baseline for anticoagulation)"],
        "confirmatoryTests": ["Compression Duplex Ultrasonography of lower extremity deep veins (non-compressibility of vein lumen diagnostic)"],
        "imaging": ["Venous Duplex Ultrasound"],
        "clinicalPearls": "Homan's sign (calf pain on dorsiflexion) is notoriously unreliable and can dislodge clots; rely strictly on Wells score and compression duplex ultrasound!",
        "evidences": ["E_55", "E_53", "E_54", "E_151"]
    },
    "Infective endocarditis": {
        "icd10": "I33.0",
        "category": "Primary",
        "severity": 2,
        "system": "cardiac",
        "pathophysiology": "Turbulent intracardiac blood flow injuring valvular endocardium -> platelet-fibrin deposition -> bacteremic colonization forming infected friable vegetations with systemic embolization.",
        "bedsideSignsToTest": ["Auscultate for new or changing regurgitant heart murmur", "Peripheral stigmata: Osler nodes (painful nodules on pads of fingers/toes), Janeway lesions (painless macular spots on palms/soles), splinter hemorrhages under nails", "Fundoscopy for Roth spots (retinal hemorrhages with pale centers)"],
        "initialLabs": ["Blood cultures: 3 sets drawn from different venipuncture sites separated by at least 1 hour before starting antibiotics", "CBC (normocytic normochromic anemia, leukocytosis)", "ESR and CRP (markedly elevated)"],
        "confirmatoryTests": ["Transesophageal Echocardiogram (TEE - sensitivity >90% for detecting valvular vegetations and perivalvular abscesses)"],
        "imaging": ["TTE initially, followed by TEE in all suspected cases"],
        "clinicalPearls": "Modified Duke Criteria: 2 major (positive blood cultures + echo vegetation/new regurgitation) OR 1 major + 3 minor confirms diagnosis.",
        "evidences": ["E_91", "E_55", "E_53", "E_50", "E_89"]
    },

    # --- NEUROLOGICAL & PSYCHIATRIC ---
    "Acute bacterial meningitis": {
        "icd10": "G00.9",
        "category": "Primary",
        "severity": 1,
        "system": "neuro",
        "pathophysiology": "Hematogenous seeding of subarachnoid space by encapsulated bacteria (N. meningitidis, S. pneumoniae) -> intense purulent leptomeningeal inflammation, cerebral edema, and elevated intracranial pressure.",
        "bedsideSignsToTest": ["Kernig sign (resistance to passive knee extension at 90 deg hip flexion)", "Brudzinski sign (involuntary hip/knee flexion on passive neck flexion)", "Nuchal rigidity and jolt accentuation test"],
        "initialLabs": ["Emergency Blood Cultures x 2 prior to antibiotics", "CBC, Coagulation profile, Serum lactate"],
        "confirmatoryTests": ["Urgent Lumbar Puncture (CSF analysis: opening pressure, cell count with neutrophilic pleocytosis, low glucose <40% serum, high protein, Gram stain and PCR)"],
        "imaging": ["Non-contrast Head CT before LP ONLY IF focal neurological deficit, new seizure, papilledema, or immunocompromise"],
        "clinicalPearls": "Never delay empirical IV antibiotics (Ceftriaxone + Vancomycin +/- Dexamethasone +/- Ampicillin) for a CT scan or lumbar puncture in suspected bacterial meningitis!",
        "evidences": ["E_192", "E_193", "E_91", "E_53", "E_58", "E_148", "E_211"]
    },
    "Spontaneous subarachnoid hemorrhage (SAH)": {
        "icd10": "I60.9",
        "category": "Primary",
        "severity": 1,
        "system": "neuro",
        "pathophysiology": "Rupture of intracranial saccular (berry) aneurysm -> rapid extravasation of arterial blood into subarachnoid cisterns -> sudden spike in intracranial pressure and chemical meningeal irritation.",
        "bedsideSignsToTest": ["Cranial nerve exam (pupil-involving CN III palsy indicates PCOM aneurysm)", "Fundoscopy for subhyaloid preretinal hemorrhages", "Meningeal signs (nuchal rigidity developing hours post-rupture)"],
        "initialLabs": ["Coagulation profile, Complete Blood Count, Electrolytes"],
        "confirmatoryTests": ["Non-contrast Head CT within 6 hours (sensitivity >98%)", "Lumbar Puncture at 12 hours post-onset for CSF spectrophotometry (xanthochromia) if CT is negative"],
        "imaging": ["Non-contrast Head CT", "CT Angiogram (CTA) of intracranial vessels to locate ruptured aneurysm"],
        "clinicalPearls": "Ottawa SAH Rule: Any alert patient >= 15y with acute non-traumatic thunderclap headache requires non-contrast CT. If negative within 6 hours, perform LP for xanthochromia!",
        "evidences": ["E_55", "E_53", "E_54", "E_59", "E_56", "E_58", "E_159"]
    },
    "Acute ischemic stroke (MCA territory)": {
        "icd10": "I63.9",
        "category": "Primary",
        "severity": 1,
        "system": "neuro",
        "pathophysiology": "Thromboembolic occlusion of cerebral artery (frequently Middle Cerebral Artery) producing sudden focal neurological deficit corresponding to ischemic core and penumbra.",
        "bedsideSignsToTest": ["Unilateral facial drooping, downward arm drift, and slurred speech (FAST / Cincinnati Stroke Scale)", "Sudden unilateral hemiparesis or hemisensory loss", "Aphasia (receptive or expressive) or gaze preference"],
        "initialLabs": ["Fingerstick Blood Glucose (immediate)", "Coagulation markers (PT/INR, aPTT)", "CBC, BMP, Troponin"],
        "confirmatoryTests": ["Immediate Non-contrast Head CT (rule out hemorrhage prior to thrombolysis)", "CT Perfusion / CT Angiography (detect large vessel occlusion for thrombectomy)"],
        "imaging": ["Non-contrast Head CT", "CT Angiography / CT Perfusion", "Brain MRI (DWI)"],
        "clinicalPearls": "Time is brain! IV thrombolysis (Alteplase/Tenecteplase) within 4.5 hours and mechanical thrombectomy within up to 24 hours for large vessel occlusions.",
        "evidences": ["E_176", "E_156", "E_83", "E_159", "E_59"]
    },
    "Generalized tonic-clonic status epilepticus": {
        "icd10": "G40.901",
        "category": "Primary",
        "severity": 1,
        "system": "neuro",
        "pathophysiology": "Failure of seizure termination mechanisms or excessive continuous excitatory neurotransmission (glutamate NMDA) with deficient GABAergic inhibition, leading to continuous seizure activity >5 minutes.",
        "bedsideSignsToTest": ["Continuous generalized motor convulsions >5 minutes or 2+ discrete seizures without return to baseline consciousness between episodes", "Assess tongue bite lacerations (lateral tongue bite highly specific for generalized seizure) and urinary incontinence"],
        "initialLabs": ["Point-of-care capillary blood glucose (immediate)", "Serum electrolytes (sodium, calcium, magnesium)", "Anticonvulsant drug levels", "Venous blood gas (lactic acidosis)"],
        "confirmatoryTests": ["Continuous Electroencephalogram (EEG) to confirm termination and detect non-convulsive status epilepticus"],
        "imaging": ["Non-contrast Head CT after stabilization"],
        "clinicalPearls": "First-line at 5 minutes: IV Lorazepam (0.1 mg/kg) or IM Midazolam (10 mg). Second-line at 10-20 minutes: IV Levetiracetam, Fosphenytoin, or Valproate.",
        "evidences": ["E_159", "E_193", "E_50", "E_89"]
    },
    "Migraine headache": {
        "icd10": "G43.909",
        "category": "Secondary",
        "severity": 3,
        "system": "neuro",
        "pathophysiology": "Neurovascular headache disorder involving cortical spreading depression, trigeminovascular activation, and neurogenic inflammation mediated by Calcitonin Gene-Related Peptide (CGRP).",
        "bedsideSignsToTest": ["POUND criteria: Pulsatile quality, One-day duration (4-72h), Unilateral location, Nausea/vomiting, Disabling intensity", "Severe photophobia and phonophobia (patient prefers lying quietly in a dark, silent room)"],
        "initialLabs": ["None required for classic recurrent presentations without red flags"],
        "confirmatoryTests": ["Clinical diagnosis based on ICHD-3 criteria"],
        "imaging": ["Brain MRI/CT indicated ONLY if red flags present (SNOOP criteria: Systemic symptoms, Neurological deficits, Onset sudden, Older age, Pattern change)"],
        "clinicalPearls": "Triptans (5-HT1B/1D agonists) and oral CGRP antagonists (rimegepant/ubrogepant) are most effective when taken early during the mild headache phase.",
        "evidences": ["E_55", "E_53", "E_54", "E_56", "E_58", "E_99", "E_148", "E_52"]
    },
    "Benign paroxysmal positional vertigo (BPPV)": {
        "icd10": "H81.10",
        "category": "Alternative",
        "severity": 4,
        "system": "neuro",
        "pathophysiology": "Canalithiasis: dislodged otoconia (calcium carbonate crystals) from utricle freely floating in posterior semicircular canal, inappropriately deflecting cupula during head position changes.",
        "bedsideSignsToTest": ["Dix-Hallpike maneuver eliciting torsional, geotropic nystagmus with latency (2-5s) and fatigability", "Absence of focal neurological signs, limb ataxia, or hearing loss"],
        "initialLabs": ["None indicated"],
        "confirmatoryTests": ["Positive Dix-Hallpike maneuver and curative response to Epley canalith repositioning maneuver"],
        "imaging": ["MRI Brain/Brainstem indicated ONLY if HINTS exam suggests central vertigo (stroke)"],
        "clinicalPearls": "Epley repositioning maneuver successfully cures >85% of cases on first attempt at the bedside without any medications!",
        "evidences": ["E_76", "E_82", "E_148", "E_211"]
    },

    # --- TROPICAL & INFECTIOUS ---
    "Plasmodium falciparum malaria": {
        "icd10": "B50.9",
        "category": "Primary",
        "severity": 1,
        "system": "infectious",
        "pathophysiology": "Inoculation of sporozoites by Anopheles mosquito -> hepatic schizogony -> cyclical intraerythrocytic rupture releasing merozoites, hemozoin, and pyrogens causing paroxysmal fevers, rigors, and microvascular cytoadherence.",
        "bedsideSignsToTest": ["Splenomegaly palpation", "Scleral icterus exam", "Postural blood pressure (hypovolemia)"],
        "initialLabs": ["Thick and Thin Giemsa Peripheral Blood Smear", "Malaria Rapid Diagnostic Test (PfHRP2 / pLDH)", "CBC (thrombocytopenia, anemia)", "Total/Direct Bilirubin, LDH"],
        "confirmatoryTests": ["Serial blood smears at 8-12 hour intervals x 3", "G6PD qualitative screen prior to Primaquine"],
        "imaging": ["Abdominal ultrasound for splenomegaly"],
        "clinicalPearls": "Any fever returning from sub-Saharan Africa is Falciparum malaria until proven otherwise by 3 negative smears! Cytoadherence can trigger rapid cerebral malaria.",
        "evidences": ["E_91", "E_50", "E_204", "E_89", "E_144", "E_53"]
    },
    "Dengue fever / Severe dengue": {
        "icd10": "A90",
        "category": "Secondary",
        "severity": 2,
        "system": "infectious",
        "pathophysiology": "Flavivirus inoculation via Aedes aegypti causes endothelial glycocalyx disruption, capillary hyperpermeability, marked leukopenia, and profound consumptive thrombocytopenia.",
        "bedsideSignsToTest": ["Tourniquet Test (Hess test: >10-20 petechiae/sq inch)", "Daily hematocrit tracking for hemoconcentration"],
        "initialLabs": ["Dengue NS1 Antigen (Days 1-5)", "Dengue IgM/IgG ELISA (After Day 5)", "Serial CBC with platelet and hematocrit monitoring"],
        "confirmatoryTests": ["RT-PCR for Dengue virus RNA serotypes"],
        "imaging": ["RUQ ultrasound for gallbladder wall thickening and plasma leakage (ascites, pleural effusion)"],
        "clinicalPearls": "Watch the critical defervescence phase (days 3-7): when fever drops, plasma leakage and shock risk peaks!",
        "evidences": ["E_91", "E_55", "E_53", "E_54", "E_56", "E_58", "E_133", "E_204"]
    },
    "Enteric (Typhoid) fever": {
        "icd10": "A01.0",
        "category": "Alternative",
        "severity": 2,
        "system": "infectious",
        "pathophysiology": "Fecal-oral ingestion of Salmonella Typhi -> invasion of intestinal Peyer patches -> primary bacteremia through reticuloendothelial system -> stepladder fevers, relative bradycardia (Faget sign), and risk of terminal ileum perforation.",
        "bedsideSignsToTest": ["Faget sign (sphygmo-thermic dissociation: slow pulse despite high fever)", "Abdominal palpation for hepatosplenomegaly and rose spots"],
        "initialLabs": ["Blood culture (highest yield week 1: 80%)", "CBC (leukopenia with relative lymphocytosis)", "Stool/Urine cultures (week 2-3)"],
        "confirmatoryTests": ["Bone marrow culture (gold standard, 90% yield even post-antibiotics)"],
        "imaging": ["Abdominal radiograph if peritonitis suspected (ileal perforation)"],
        "clinicalPearls": "Week 1: Blood cultures positive. Week 2: Rose spots and stool positive. Week 3: High risk of ileal perforation!",
        "evidences": ["E_91", "E_55", "E_53", "E_54", "E_58", "E_204"]
    },
    "Leptospirosis (Weil's disease)": {
        "icd10": "A27.0",
        "category": "Alternative",
        "severity": 2,
        "system": "infectious",
        "pathophysiology": "Spirochete Leptospira interrogans enters through abraded skin/mucosa from water/soil contaminated with rodent urine -> systemic vasculitis with capillary endothelial necrosis affecting liver, kidneys, and lungs.",
        "bedsideSignsToTest": ["Calf squeeze tenderness elicitation", "Conjunctival inspection for suffusion without purulence"],
        "initialLabs": ["Leptospira IgM ELISA / Rapid test", "Serum creatinine and urea", "Bilirubin and liver transaminases"],
        "confirmatoryTests": ["Microscopic Agglutination Test (MAT - gold standard)", "Leptospira PCR in blood/urine"],
        "imaging": ["Chest X-ray for pulmonary hemorrhage"],
        "clinicalPearls": "Pathognomonic triad: conjunctival suffusion + intense calf myalgia + acute hepato-renal failure.",
        "evidences": ["E_91", "E_55", "E_53", "E_54", "E_58", "E_204"]
    },
    "Severe sepsis / Septic shock": {
        "icd10": "A41.9",
        "category": "Primary",
        "severity": 1,
        "system": "systemic",
        "pathophysiology": "Dysregulated host response to infection causing systemic endothelial activation, microvascular thrombosis, vasodilation, and multiorgan failure.",
        "bedsideSignsToTest": ["qSOFA criteria positive (RR >=22, altered mental status, SBP <=100)", "Capillary refill time (>3s indicates hypoperfusion)", "Oliguria on Foley catheter"],
        "initialLabs": ["Serum Lactate (>2 mmol/L)", "Blood Cultures x 2 before antibiotics", "CBC, CMP, Coagulation panel"],
        "confirmatoryTests": ["Source identification (CXR, Urinalysis, CT abdomen/pelvis)"],
        "imaging": ["Chest X-ray", "CT source localization"],
        "clinicalPearls": "Surviving Sepsis Campaign 1-Hour Bundle: Measure lactate, obtain blood cultures, start broad-spectrum IV antibiotics, and administer 30 mL/kg crystalloids for hypotension/lactate >=4.",
        "evidences": ["E_91", "E_66", "E_159", "E_50", "E_89", "E_148"]
    },

    # --- RHEUMATOLOGY & MUSCULOSKELETAL ---
    "Acute gouty arthritis": {
        "icd10": "M10.9",
        "category": "Primary",
        "severity": 3,
        "system": "rheumatology",
        "pathophysiology": "Supersaturation of extracellular urate leading to precipitation of monosodium urate (MSU) crystals in synovial fluid -> phagocytosis by macrophages and activation of NLRP3 inflammasome releasing IL-1beta.",
        "bedsideSignsToTest": ["Podagra: exquisitely tender, swollen, erythematous, warm first metatarsophalangeal (MTP) joint", "Presence of tophi on ears, olecranon bursa, or Achilles tendon"],
        "initialLabs": ["Serum Uric Acid (may be normal during acute attack due to cytokine-mediated uricosuria!)", "ESR and CRP", "CBC (mild leukocytosis)"],
        "confirmatoryTests": ["Arthrocentesis with polarized light microscopy: needle-shaped, strongly negatively birefringent monosodium urate crystals (bright yellow when parallel to slow axis)"],
        "imaging": ["X-ray of affected joint ('punched-out' periarticular erosions with overhanging edges in chronic gout)"],
        "clinicalPearls": "Arthrocentesis is mandatory to rule out septic arthritis! Never start or stop allopurinol during an acute flare, as fluctuating urate levels prolong the attack.",
        "evidences": ["E_55", "E_53", "E_54", "E_59", "E_56", "E_58", "E_151"]
    },
    "Rheumatoid arthritis": {
        "icd10": "M06.9",
        "category": "Secondary",
        "severity": 3,
        "system": "rheumatology",
        "pathophysiology": "Chronic systemic autoimmune disease with autoantibodies (RF, anti-CCP) targeting citrullinated proteins -> synovial hyperplasia (pannus) invading and eroding articular cartilage and bone.",
        "bedsideSignsToTest": ["Symmetric swelling and tenderness of MCP and PIP joints (DIP joints typically spared!)", "Morning joint stiffness lasting >1 hour, improving with activity", "Classic hand deformities in late disease: ulnar deviation of MCP joints, swan-neck deformity, boutonnière deformity"],
        "initialLabs": ["Anti-Cyclic Citrullinated Peptide (anti-CCP antibodies - sensitivity 70%, specificity >95%)", "Rheumatoid Factor (RF)", "ESR and CRP"],
        "confirmatoryTests": ["ACR/EULAR 2010 Classification Criteria scoring (joint involvement, serology, acute-phase reactants, duration >=6 weeks)"],
        "imaging": ["X-rays of hands and wrists (periarticular osteopenia, joint space narrowing, marginal bone erosions)"],
        "clinicalPearls": "Anti-CCP antibody is far more specific than Rheumatoid Factor and predicts aggressive erosive disease; start DMARD (Methotrexate) early to prevent irreversible joint destruction.",
        "evidences": ["E_55", "E_53", "E_54", "E_151", "E_216", "E_144", "E_89"]
    },
    "Septic arthritis": {
        "icd10": "M00.9",
        "category": "Primary",
        "severity": 1,
        "system": "rheumatology",
        "pathophysiology": "Hematogenous inoculation or direct penetration of synovial space by bacteria (most commonly Staphylococcus aureus, or Neisseria gonorrhoeae in young sexually active adults) -> purulent joint effusion, synovial necrosis, and rapid chondrolysis within 24-48 hours.",
        "bedsideSignsToTest": ["Monoarticular hot, swollen, exquisitely tender joint (knee in >50% of cases)", "Severe restriction of both active AND passive range of motion"],
        "initialLabs": ["Emergency Arthrocentesis: synovial fluid WBC > 50,000/mcL (>90% neutrophils), cloudy/purulent appearance, Gram stain and culture", "Blood cultures x 2", "CBC, ESR, CRP"],
        "confirmatoryTests": ["Synovial fluid Gram stain and bacterial culture"],
        "imaging": ["Plain radiograph (rule out osteomyelitis), MRI if joint difficult to aspirate (hip)"],
        "clinicalPearls": "Orthopedic emergency! Delay in joint drainage causes irreversible cartilage destruction within 48 hours; perform emergent surgical or needle washout immediately.",
        "evidences": ["E_91", "E_55", "E_53", "E_54", "E_56", "E_58", "E_151"]
    },

    # --- OB/GYN & WOMEN'S HEALTH ---
    "Ruptured ectopic pregnancy": {
        "icd10": "O00.9",
        "category": "Primary",
        "severity": 1,
        "system": "obgyn",
        "pathophysiology": "Blastocyst implantation outside the uterine cavity (most commonly fallopian tube ampulla) -> gestational growth eroding tubal wall and blood vessels -> catastrophic intraperitoneal hemorrhage and hemorrhagic shock.",
        "bedsideSignsToTest": ["Severe unilateral lower abdominal / pelvic pain with history of missed menstrual period", "Cervical motion tenderness (chandelier sign) and adnexal mass tenderness", "Peritoneal signs (guarding, rebound) and shoulder tip pain (Kehr sign from diaphragmatic blood irritation)"],
        "initialLabs": ["Serum quantitative beta-hCG (positive)", "Type and Crossmatch 4 units PRBCs", "Serial Hematocrit/CBC", "Coagulation profile"],
        "confirmatoryTests": ["Transvaginal Ultrasound (TVUS) demonstrating empty uterine cavity with serum beta-hCG above discriminatory zone (>1,500-2,000 mIU/mL), adnexal gestational sac, and free fluid in pouch of Douglas"],
        "imaging": ["Transvaginal Ultrasound (TVUS)", "FAST abdominal ultrasound (free fluid in Morison's pouch)"],
        "clinicalPearls": "Any reproductive-age female presenting with lower abdominal pain or syncope MUST have a pregnancy test! Rupture requires immediate surgical laparoscopy/laparotomy.",
        "evidences": ["E_55", "E_53", "E_54", "E_59", "E_56", "E_58", "E_159", "E_50"]
    },
    "Preeclampsia with severe features": {
        "icd10": "O14.1",
        "category": "Primary",
        "severity": 1,
        "system": "obgyn",
        "pathophysiology": "Defective trophoblastic invasion of uterine spiral arteries -> placental hypoperfusion releasing anti-angiogenic factors (sFlt-1) -> widespread maternal endothelial dysfunction, vasospasm, hypertension, and multiorgan ischemia.",
        "bedsideSignsToTest": ["Blood pressure >= 160/110 mmHg on 2 occasions at least 4 hours apart after 20 weeks gestation", "Brisk hyperreflexia with clonus (indicates central nervous system irritability / impending eclampsia)", "Right upper quadrant / epigastric tenderness (Glisson's capsule distension)"],
        "initialLabs": ["Urine protein-to-creatinine ratio (>= 0.3) or 24-hour urine protein (>= 300 mg)", "Complete Blood Count (thrombocytopenia < 100,000/mcL)", "Serum creatinine (>1.1 mg/dL)", "Liver transaminases (ALT/AST elevated >2x normal)"],
        "confirmatoryTests": ["Clinical diagnosis meeting criteria after 20 weeks gestation"],
        "imaging": ["Obstetric ultrasound with umbilical artery Doppler for fetal growth restriction and oligohydramnios"],
        "clinicalPearls": "Magnesium sulfate is the drug of choice for seizure prophylaxis (NOT phenytoin or diazepam); definitive cure is delivery of the fetus and placenta.",
        "evidences": ["E_55", "E_53", "E_54", "E_151", "E_159"]
    },
    "Pelvic inflammatory disease (PID)": {
        "icd10": "N73.9",
        "category": "Secondary",
        "severity": 2,
        "system": "obgyn",
        "pathophysiology": "Ascending spread of microorganisms (N. gonorrhoeae, C. trachomatis, and vaginal flora) from cervix and vagina to endometrium, fallopian tubes, and pelvic peritoneum.",
        "bedsideSignsToTest": ["Cervical motion tenderness ('chandelier sign')", "Uterine or bilateral adnexal tenderness on bimanual pelvic exam", "Purulent endocervical discharge"],
        "initialLabs": ["Nucleic Acid Amplification Test (NAAT) for N. gonorrhoeae and C. trachomatis", "Wet prep and Gram stain of vaginal discharge", "Urine pregnancy test (mandatory rule out ectopic pregnancy)"],
        "confirmatoryTests": ["Transvaginal Ultrasound (thickened fluid-filled fallopian tubes / hydrosalpinx, tubo-ovarian abscess)"],
        "imaging": ["Transvaginal Ultrasound"],
        "clinicalPearls": "Maintain a low threshold for empirical treatment (Ceftriaxone + Doxycycline + Metronidazole); untreated PID leads to tubal scarring, ectopic pregnancy, and chronic pelvic pain.",
        "evidences": ["E_91", "E_55", "E_53", "E_54", "E_58"]
    },
    "Ovarian torsion": {
        "icd10": "N83.51",
        "category": "Primary",
        "severity": 1,
        "system": "obgyn",
        "pathophysiology": "Partial or complete rotation of the ovary and fallopian tube on its infundibulopelvic and utero-ovarian ligaments (frequently around an ovarian cyst or mass >5cm), causing venous obstruction, edema, arterial occlusion, and hemorrhagic necrosis.",
        "bedsideSignsToTest": ["Sudden severe unilateral lower quadrant / pelvic pain often with wave-like cramping", "Accompanying intractable nausea and vomiting in up to 70% of cases", "Unilateral tender adnexal mass on bimanual pelvic exam"],
        "initialLabs": ["Urine pregnancy test (exclude ectopic pregnancy)", "CBC (leukocytosis in tissue necrosis)", "Urinalysis"],
        "confirmatoryTests": ["Pelvic Ultrasound with Color Doppler (enlarged edematous ovary >4cm with absent or decreased arterial/venous blood flow; 'whirlpool sign' of twisted pedicle)"],
        "imaging": ["Transabdominal and Transvaginal Pelvic Ultrasound with Doppler"],
        "clinicalPearls": "Normal Doppler flow does NOT exclude ovarian torsion (due to dual arterial supply from uterine and ovarian arteries)! Clinical suspicion warrants emergent diagnostic laparoscopy.",
        "evidences": ["E_55", "E_53", "E_54", "E_59", "E_56", "E_58", "E_148", "E_211"]
    },

    # --- INFECTIOUS & DERMATOLOGICAL ---
    "Cellulitis / Erysipelas": {
        "icd10": "L03.90",
        "category": "Primary",
        "severity": 3,
        "system": "dermatology",
        "pathophysiology": "Bacterial entry (most commonly Streptococcus pyogenes or Staphylococcus aureus) through breached skin barrier, producing acute spreading dermis and subcutaneous tissue inflammation.",
        "bedsideSignsToTest": ["Classic cardinal signs: Calor (warmth), Rubor (erythema), Tumor (edema), Dolor (pain)", "Erysipelas has sharply demarcated, raised borders (upper dermis); cellulitis has indistinct spreading borders (subcutaneous deep tissue)"],
        "initialLabs": ["CBC (leukocytosis with neutrophilia)", "CRP and ESR", "Blood cultures if systemic features (fever, chills, tachycardia) present"],
        "confirmatoryTests": ["Clinical diagnosis; mark borders with skin marker to monitor response to antibiotic therapy"],
        "imaging": ["Bedside soft-tissue ultrasound (rule out subcutaneous abscess requiring I&D or 'cobblestoning' edema)"],
        "clinicalPearls": "Rapidly advancing erythema with severe pain out of proportion to exam, bullae, skin crepitus, or anesthesia is Necrotizing Fasciitis until proven otherwise in OR!",
        "evidences": ["E_91", "E_55", "E_53", "E_54", "E_58", "E_151"]
    },
    "Herpes zoster (Shingles)": {
        "icd10": "B02.9",
        "category": "Secondary",
        "severity": 3,
        "system": "infectious",
        "pathophysiology": "Reactivation of latent Varicella-Zoster Virus (VZV) residing in dorsal root or cranial nerve sensory ganglia, traveling retrograde down sensory axon to skin.",
        "bedsideSignsToTest": ["Unilateral painful grouped vesicular eruption strictly respecting a single thoracic or cranial dermatome", "Prodromal burning or tingling pain preceding rash by 2-5 days"],
        "initialLabs": ["Usually clinical diagnosis"],
        "confirmatoryTests": ["VZV PCR from lesion fluid (highest sensitivity)", "Direct Fluorescent Antibody (DFA) or Tzanck smear"],
        "imaging": ["None indicated"],
        "clinicalPearls": "Vesicles on tip of nose (Hutchinson sign) indicates involvement of nasociliary branch of CN V1—urgent ophthalmology consult needed to prevent corneal ulceration and blindness!",
        "evidences": ["E_55", "E_53", "E_54", "E_56", "E_58", "E_133"]
    },
    "Infectious mononucleosis (EBV)": {
        "icd10": "B27.0",
        "category": "Alternative",
        "severity": 3,
        "system": "infectious",
        "pathophysiology": "Epstein-Barr Virus transmitted via saliva -> infection of oropharyngeal epithelial cells and B-lymphocytes -> reactive proliferation of CD8+ cytotoxic T-lymphocytes (atypical lymphocytes).",
        "bedsideSignsToTest": ["Triad: high fever, severe exudative pharyngitis, and symmetric posterior cervical lymphadenopathy", "Splenomegaly palpation (present in 50% of cases)", "Palatal petechiae at junction of hard and soft palate"],
        "initialLabs": ["Heterophile Antibody Test (Monospot / latex agglutination)", "CBC with differential (lymphocytosis >50% with >10% atypical reactive lymphocytes)", "LFTs (mild transient transaminitis in 90%)"],
        "confirmatoryTests": ["EBV specific serology (VCA IgM positive, EBNA negative confirms acute infection)"],
        "imaging": ["Abdominal ultrasound if splenic enlargement is equivocal"],
        "clinicalPearls": "Administration of ampicillin/amoxicillin in infectious mononucleosis causes a diffuse pruritic maculopapular rash in >90% of patients; advise strict avoidance of contact sports for 3-4 weeks to prevent splenic rupture!",
        "evidences": ["E_91", "E_55", "E_53", "E_50", "E_9", "E_89", "E_175"]
    },
    "Lyme disease (Borrelia burgdorferi)": {
        "icd10": "A69.20",
        "category": "Alternative",
        "severity": 3,
        "system": "infectious",
        "pathophysiology": "Spirochete Borrelia burgdorferi transmitted by Ixodes tick bite -> local centrifugal cutaneous migration -> hematogenous dissemination to joints, cardiac conduction system, and central nervous system.",
        "bedsideSignsToTest": ["Erythema migrans: expanding annular erythematous rash with central clearing ('bull's-eye' target lesion >= 5 cm)", "Facial nerve (CN VII) palsy (bilateral Bell's palsy is highly suspicious for Lyme disease)", "Auscultate for bradycardia (Lyme carditis / AV block)"],
        "initialLabs": ["Two-tier serologic testing: sensitive first-tier enzyme immunoassay (EIA) or IFA, followed by Western blot if reactive or equivocal"],
        "confirmatoryTests": ["Two-tier serology (IgM and IgG Western blot)"],
        "imaging": ["ECG to evaluate for PR prolongation and heart block"],
        "clinicalPearls": "Erythema migrans in an endemic area is diagnostic on its own—serology is often falsely negative in early stage (first 2-3 weeks); treat immediately with oral Doxycycline without waiting for titers.",
        "evidences": ["E_91", "E_55", "E_53", "E_50", "E_133", "E_204"]
    },

    # --- HEMATOLOGY & ONCOLOGY ---
    "Iron deficiency anemia": {
        "icd10": "D50.9",
        "category": "Secondary",
        "severity": 3,
        "system": "hematology",
        "pathophysiology": "Depletion of body iron stores (due to chronic blood loss from GI tract or menstruation, or malabsorption) -> defective heme synthesis and impaired erythropoiesis -> microcytic hypochromic anemia.",
        "bedsideSignsToTest": ["Conjunctival and palmar crease pallor", "Koilonychia (spoon-shaped concave nails), angular cheilitis, and atrophic glossitis", "Pica (compulsive craving to eat ice/pagophagia, dirt, or starch)"],
        "initialLabs": ["Complete Blood Count (low Hemoglobin, low MCV <80 fL, elevated RDW)", "Serum Ferritin (low <30 ng/mL is the most sensitive and specific marker)", "Serum Iron and Total Iron Binding Capacity (TIBC elevated)"],
        "confirmatoryTests": ["Low serum ferritin (<30 ng/mL diagnostic)"],
        "imaging": ["Upper and lower GI endoscopy (EGD and Colonoscopy) mandatory in adult men and postmenopausal women to rule out occult GI malignancy"],
        "clinicalPearls": "In any adult male or postmenopausal female, iron deficiency anemia is colon cancer until proven otherwise by endoscopy!",
        "evidences": ["E_89", "E_64", "E_76", "E_82", "E_175"]
    },
    "Immune thrombocytopenic purpura (ITP)": {
        "icd10": "D69.3",
        "category": "Primary",
        "severity": 2,
        "system": "hematology",
        "pathophysiology": "Autoantibodies (IgG) directed against platelet membrane glycoproteins (GPIIb/IIIa) -> splenic macrophage Fc-receptor phagocytosis and destruction of sensitized platelets with compensatory megakaryocytosis.",
        "bedsideSignsToTest": ["Dry purpura: petechiae, ecchymoses, and easy bruising on lower extremities", "Wet purpura: epistaxis, gingival bleeding, or mucosal bullae (indicates severe thrombocytopenia and higher intracranial bleed risk)"],
        "initialLabs": ["CBC (isolated profound thrombocytopenia <20,000-30,000/mcL with normal WBC and Hb)", "Peripheral blood smear (confirm true thrombocytopenia, exclude pseudothrombocytopenia and schistocytes)"],
        "confirmatoryTests": ["Diagnosis of exclusion; bone marrow biopsy if atypical features or failure to respond to first-line steroids"],
        "imaging": ["None required in uncomplicated cases"],
        "clinicalPearls": "Splenomegaly is conspicuously ABSENT in ITP; if splenomegaly is palpable, suspect secondary causes (lymphoma, cirrhosis/hypersplenism, or SLE).",
        "evidences": ["E_129", "E_178", "E_89", "E_45"]
    },
    "Acute limb ischemia": {
        "icd10": "I74.3",
        "category": "Primary",
        "severity": 1,
        "system": "cardiac",
        "pathophysiology": "Sudden embolus or local thrombosis occluding peripheral arterial inflow -> 6 Ps: Pain, Pallor, Poikilothermia, Pulselessness, Paresthesia, Paralysis -> irreversible tissue loss within 6 hours.",
        "bedsideSignsToTest": ["6 Ps examination of extremity", "Handheld Doppler assessment of dorsalis pedis and posterior tibial pulses"],
        "initialLabs": ["CBC, Coagulation markers, Creatine Kinase (rhabdomyolysis), BMP"],
        "confirmatoryTests": ["Catheter-directed or CT Angiography of lower extremity"],
        "imaging": ["CT Angiogram of lower extremities", "Arterial duplex ultrasound"],
        "clinicalPearls": "Surgical emergency! Every minute counts: immediately start IV unfractionated heparin bolus and consult vascular surgery for emergent revascularization.",
        "evidences": ["E_55", "E_53", "E_54", "E_59", "E_56"]
    },
    "Hypertensive emergency": {
        "icd10": "I16.1",
        "category": "Primary",
        "severity": 1,
        "system": "cardiac",
        "pathophysiology": "Severe blood pressure elevation (>180/120 mmHg) exceeding cerebral and systemic autoregulation, causing endothelial fibrinoid necrosis, microvascular leak, and acute target organ damage.",
        "bedsideSignsToTest": ["Fundoscopy for flame hemorrhages, cotton-wool spots, or papilledema", "Neurological exam for encephalopathy or focal deficits", "Cardiac and pulmonary auscultation for crackles or murmurs"],
        "initialLabs": ["Serum creatinine and BUN", "Urinalysis (proteinuria, microhematuria, RBC casts)", "Cardiac troponin I", "CBC (schistocytes / microangiopathic hemolytic anemia)"],
        "confirmatoryTests": ["Blood pressure >180/120 with clinical or laboratory evidence of acute end-organ damage"],
        "imaging": ["Non-contrast Head CT if neurological symptoms present", "Chest X-ray (aortic widening / pulmonary edema)"],
        "clinicalPearls": "Lower mean arterial pressure (MAP) by no more than 20-25% in the first hour to prevent cerebral watershed infarction, except in aortic dissection where rapid drop to SBP 100-120 is required.",
        "evidences": ["E_55", "E_53", "E_159", "E_66"]
    },
    "Ulcerative colitis (Acute severe flare)": {
        "icd10": "K51.9",
        "category": "Primary",
        "severity": 2,
        "system": "gi",
        "pathophysiology": "Continuous mucosal and submucosal inflammation starting in rectum and extending proximally into colon, leading to diffuse ulcerations, crypt abscesses, and bloody diarrhea.",
        "bedsideSignsToTest": ["Truelove and Witts criteria: >6 bloody stools/day with systemic toxicity (fever >37.8C, pulse >90, anemia, ESR >30)", "Abdominal palpation for toxic megacolon (distension, tenderness, tympany)"],
        "initialLabs": ["Stool studies (fecal calprotectin, C. difficile toxin PCR, bacterial stool cultures)", "CBC (anemia, leukocytosis)", "ESR, CRP, Albumin"],
        "confirmatoryTests": ["Flexible Sigmoidoscopy (continuous diffuse mucosal erythema, friability, loss of vascular pattern)"],
        "imaging": ["Abdominal Plain Radiograph (exclude toxic megacolon: transverse colon diameter >6 cm)"],
        "clinicalPearls": "Avoid full colonoscopy or barium enema during severe flares due to risk of bowel perforation and toxic megacolon!",
        "evidences": ["E_55", "E_53", "E_54", "E_58", "E_91", "E_45"]
    },
    "Crohn's disease": {
        "icd10": "K50.9",
        "category": "Secondary",
        "severity": 2,
        "system": "gi",
        "pathophysiology": "Transmural granulomatous inflammation capable of affecting any segment of the GI tract from mouth to anus ('skip lesions'), producing strictures, fistulae, and cobblestone mucosa.",
        "bedsideSignsToTest": ["Right lower quadrant (RLQ) abdominal mass and focal tenderness (terminal ileitis mimicking appendicitis)", "Perianal inspection for skin tags, complex fissures, or draining fistulae", "Aphthous oral ulcers and erythema nodosum"],
        "initialLabs": ["Fecal calprotectin", "CBC, Ferritin, Vitamin B12 and Folate (terminal ileal malabsorption)", "CRP and ESR"],
        "confirmatoryTests": ["Ileocolonoscopy with segmental biopsies (transmural non-caseating granulomas, cobblestone mucosal pattern)"],
        "imaging": ["MR Enterography / CT Enterography (skip lesions, bowel wall thickening, creeping fat, fistulae)"],
        "clinicalPearls": "Terminal ileum involvement impairs B12 and bile acid absorption, leading to megaloblastic anemia, gallstones, and calcium oxalate kidney stones.",
        "evidences": ["E_55", "E_53", "E_54", "E_58", "E_91"]
    },
    "Celiac disease": {
        "icd10": "K90.0",
        "category": "Alternative",
        "severity": 4,
        "system": "gi",
        "pathophysiology": "Autoimmune enteropathy triggered by dietary gluten (gliadin) ingestion in HLA-DQ2/DQ8 positive individuals -> intraepithelial lymphocytosis, crypt hyperplasia, and blunting of duodenal villi.",
        "bedsideSignsToTest": ["Dermatitis herpetiformis (intensely pruritic grouped vesicular eruption on elbows, knees, buttocks)", "Signs of malabsorption: angular stomatitis, digital clubbing, wasting"],
        "initialLabs": ["IgA Tissue Transglutaminase (tTG-IgA - sensitivity and specificity >95%)", "Total Serum IgA (mandatory to rule out selective IgA deficiency causing false negative tTG)", "Anti-Endomysial IgA (EMA)"],
        "confirmatoryTests": ["Upper GI Endoscopy with multiple duodenal biopsies: Marsh criteria (villous atrophy, crypt hyperplasia, intraepithelial lymphocytosis)"],
        "imaging": ["Dual-energy X-ray absorptiometry (DEXA scan for secondary osteoporosis)"],
        "clinicalPearls": "Patient must remain on a gluten-containing diet prior to antibody testing and endoscopy; a gluten-free diet causes serology and histology to normalize, yielding false-negative results.",
        "evidences": ["E_51", "E_30", "E_58", "E_53", "E_215", "E_89"]
    },
    "Testicular torsion": {
        "icd10": "N44.0",
        "category": "Primary",
        "severity": 1,
        "system": "renal",
        "pathophysiology": "Twisting of spermatic cord within tunica vaginalis (bell-clapper deformity) -> venous congestion followed by arterial occlusion and testicular ischemia -> irreversible necrosis within 6 hours.",
        "bedsideSignsToTest": ["High-riding, horizontally lie testicle on affected side", "Absent cremasteric reflex (scratching inner thigh fails to elevate ipsilateral testis - sensitivity >99%)", "Negative Prehn sign (elevation of scrotum does NOT relieve pain)"],
        "initialLabs": ["Urinalysis (usually completely normal, ruling out epididymitis)"],
        "confirmatoryTests": ["Color Doppler Ultrasound of scrotum (decreased or absent intratesticular blood flow)"],
        "imaging": ["Scrotal Doppler Ultrasound"],
        "clinicalPearls": "Surgical emergency! Salvage rate exceeds 90% if detorsion occurs within 6 hours, but drops below 10% after 24 hours; never delay surgical exploration for imaging if suspicion is high!",
        "evidences": ["E_55", "E_53", "E_54", "E_59", "E_56", "E_58", "E_148", "E_211"]
    },
    "Bell's palsy (Idiopathic CN VII paralysis)": {
        "icd10": "G51.0",
        "category": "Alternative",
        "severity": 3,
        "system": "neuro",
        "pathophysiology": "Acute inflammation and compression of the facial nerve (cranial nerve VII) within the labyrinthine segment of the fallopian canal, commonly triggered by reactivated HSV-1.",
        "bedsideSignsToTest": ["Complete unilateral lower motor neuron facial paralysis: inability to raise ipsilateral eyebrow or wrinkle forehead (distinguishes from upper motor neuron stroke which spares forehead!)", "Bell's phenomenon (upward and outward eye deviation on attempted forced eyelid closure)", "Hyperacusis and loss of taste on anterior two-thirds of tongue"],
        "initialLabs": ["Lyme serology in endemic areas"],
        "confirmatoryTests": ["Clinical diagnosis; MRI indicated only if atypical, progressive, or no recovery at 3 months"],
        "imaging": ["Brain MRI if multiple cranial neuropathies or forehead wrinkling preserved"],
        "clinicalPearls": "Forehead involvement is the key: stroke spares forehead wrinkling due to bilateral cortical upper motor neuron innervation; Bell's palsy paralyzes the ENTIRE half of the face including forehead.",
        "evidences": ["E_156", "E_83", "E_176", "E_127"]
    },
    "Trigeminal neuralgia": {
        "icd10": "G50.0",
        "category": "Alternative",
        "severity": 3,
        "system": "neuro",
        "pathophysiology": "Microvascular compression of trigeminal nerve sensory root entry zone (most commonly by superior cerebellar artery) causing local demyelination and ectopic ephaptic transmission.",
        "bedsideSignsToTest": ["Trigger zones: light touch, chewing, talking, brushing teeth, or cold breeze triggering paroxysmal electric shock-like facial pain in V2/V3 distribution", "Normal sensory examination (absence of persistent sensory loss in trigeminal distribution)"],
        "initialLabs": ["None indicated"],
        "confirmatoryTests": ["Clinical diagnosis based on ICHD-3 criteria and therapeutic response to Carbamazepine"],
        "imaging": ["High-resolution Brain MRI with CISS/FIESTA sequences (detects neurovascular compression and excludes multiple sclerosis plaques)"],
        "clinicalPearls": "First-line medical treatment of choice is Carbamazepine or Oxcarbazepine (sodium channel blockers); opioids and NSAIDs are completely ineffective.",
        "evidences": ["E_55", "E_53", "E_54", "E_59", "E_56"]
    },
    "Parkinson's disease": {
        "icd10": "G20",
        "category": "Secondary",
        "severity": 3,
        "system": "neuro",
        "pathophysiology": "Progressive degeneration of dopaminergic neurons in the substantia nigra pars compacta with intracellular alpha-synuclein Lewy bodies -> profound dopamine depletion in striatum.",
        "bedsideSignsToTest": ["TRAP tetrad: Tremor (asymmetric 4-6 Hz pill-rolling resting tremor), Rigidity (cogwheel rigidity), Akinesia/Bradykinesia (progressive decrement in amplitude on finger tapping), Postural instability", "Mask-like facies, hypophonia, and festinating, shuffling gait with reduced arm swing"],
        "initialLabs": ["Serum ceruloplasmin in patients <40 years (exclude Wilson disease)"],
        "confirmatoryTests": ["Clinical diagnosis based on UK Parkinson's Disease Society Brain Bank criteria and sustained response to Levodopa"],
        "imaging": ["Brain MRI (to rule out vascular parkinsonism or normal pressure hydrocephalus)", "DaTscan (dopamine transporter SPECT imaging)"],
        "clinicalPearls": "Resting tremor that improves with purposeful movement and worsens with contralateral mental tasks is hallmark of Parkinson's; essential tremor is an action/postural tremor.",
        "evidences": ["E_193", "E_176", "E_216", "E_144"]
    },
    "Multiple sclerosis": {
        "icd10": "G35",
        "category": "Secondary",
        "severity": 2,
        "system": "neuro",
        "pathophysiology": "Cell-mediated autoimmune demyelination of central nervous system white matter separated in space and time -> oligodendrocyte destruction, axonal injury, and gliotic plaque formation.",
        "bedsideSignsToTest": ["Optic neuritis (painful unilateral vision loss, afferent pupillary defect / Marcus Gunn pupil)", "Lhermitte's sign (electric shock sensation radiating down spine on neck flexion)", "Uhthoff's phenomenon (temporary worsening of symptoms with elevated body temperature/hot bath)", "Internuclear ophthalmoplegia (INO from MLF lesion)"],
        "initialLabs": ["Lumbar Puncture: CSF analysis showing unique oligoclonal IgG bands (absent in serum) and elevated IgG index (>0.7)"],
        "confirmatoryTests": ["McDonald Criteria 2017: Demonstration of CNS lesions disseminated in time and space via MRI"],
        "imaging": ["Brain and Spinal Cord MRI with gadolinium (periventricular, juxtacortical, and infratentorial T2/FLAIR hyperintensities; Dawson fingers)"],
        "clinicalPearls": "Bilateral internuclear ophthalmoplegia in a young woman is Multiple Sclerosis until proven otherwise!",
        "evidences": ["E_52", "E_176", "E_177", "E_89", "E_193"]
    },
    "Clostridioides difficile colitis": {
        "icd10": "A04.7",
        "category": "Primary",
        "severity": 2,
        "system": "infectious",
        "pathophysiology": "Disruption of normal colonic microbiota by broad-spectrum antibiotic therapy (fluoroquinolones, clindamycin, cephalosporins) -> spore germination of C. difficile releasing exotoxins A (enterotoxin) and B (cytotoxin) -> pseudomembranous colitis.",
        "bedsideSignsToTest": ["Profuse watery non-bloody diarrhea (>3 unformed stools in 24 hours)", "Fever, lower abdominal cramping, and leukocytosis", "Abdominal distension and tenderness (warning of toxic megacolon)"],
        "initialLabs": ["Stool Nucleic Acid Amplification Test (NAAT/PCR for tcdB gene)", "Stool Enzyme Immunoassay (EIA for GDH antigen and toxins A/B)", "CBC (unexplained marked leukocytosis >15,000/mcL or leukemoid reaction >50,000)"],
        "confirmatoryTests": ["Positive stool GDH + toxin A/B EIA or positive NAAT in symptomatic patient"],
        "imaging": ["Abdominal CT if fulminant (colonic wall thickening, accordion sign, pericolonic stranding)"],
        "clinicalPearls": "Oral Vancomycin (125mg QID) or oral Fidaxomicin is first-line; Metronidazole is NO LONGER recommended for initial episodes. Wash hands with soap and water—alcohol rubs do NOT kill C. diff spores!",
        "evidences": ["E_91", "E_55", "E_53", "E_54", "E_58"]
    },
    "Herpes simplex viral encephalitis": {
        "icd10": "B00.4",
        "category": "Primary",
        "severity": 1,
        "system": "neuro",
        "pathophysiology": "Reactivation or primary infection of HSV-1 traveling via olfactory or trigeminal nerves into temporal and inferior frontal lobes -> necrotizing hemorrhagic encephalitis with severe cerebral edema.",
        "bedsideSignsToTest": ["Rapid cognitive decline, altered personality, bizarre behavior, or olfactory hallucinations", "Fever and new-onset focal or generalized seizures", "Dysphasia and hemiparesis"],
        "initialLabs": ["Urgent Lumbar Puncture: CSF showing lymphocytic pleocytosis, elevated RBC count (xanthochromia from hemorrhagic necrosis), normal or slightly low glucose, elevated protein"],
        "confirmatoryTests": ["CSF HSV-1 PCR (sensitivity >95%, specificity >99%)"],
        "imaging": ["Brain MRI with contrast (asymmetric hyperintensity in frontotemporal lobes on T2/FLAIR)"],
        "clinicalPearls": "Neurological emergency! Start IV Acyclovir immediately on suspicion without waiting for LP results; mortality approaches 70% in untreated patients.",
        "evidences": ["E_91", "E_159", "E_193", "E_176", "E_53", "E_148"]
    },
    "Sickle cell vaso-occlusive crisis": {
        "icd10": "D57.0",
        "category": "Primary",
        "severity": 1,
        "system": "hematology",
        "pathophysiology": "Point mutation in beta-globin gene (Glu6Val -> HbS) -> deoxygenation triggers HbS polymerization, erythrocyte sickling, microvascular occlusion, tissue ischemia, and severe bone marrow infarction.",
        "bedsideSignsToTest": ["Severe acute unremitting bone pain (femur, tibia, humerus, lumbar spine, dactylitis in infants)", "Tachycardia, tachypnea, scleral icterus", "Assess for Acute Chest Syndrome: new pulmonary infiltrates + fever + tachypnea/chest pain"],
        "initialLabs": ["Complete Blood Count (baseline vs drop in hemoglobin, reticulocyte count)", "Comprehensive metabolic panel, total bilirubin, LDH", "Hemoglobin electrophoresis (HbS confirmation)"],
        "confirmatoryTests": ["Hemoglobin electrophoresis or HPLC (HbSS pattern)"],
        "imaging": ["Chest X-ray (mandatory to evaluate for Acute Chest Syndrome)", "Plain radiographs of painful bones (rule out osteomyelitis)"],
        "clinicalPearls": "Pain management within 30-60 minutes of presentation is a clinical priority; aggressive incentive spirometry reduces the risk of fatal Acute Chest Syndrome.",
        "evidences": ["E_55", "E_53", "E_54", "E_59", "E_56", "E_58", "E_91"]
    },
    "Multiple myeloma": {
        "icd10": "C90.0",
        "category": "Alternative",
        "severity": 3,
        "system": "hematology",
        "pathophysiology": "Neoplastic clonal proliferation of plasma cells in bone marrow overproducing monoclonal immunoglobulins (M-protein / paraprotein) and osteoclast-activating factors (RANKL).",
        "bedsideSignsToTest": ["CRAB criteria: Calcium elevation, Renal insufficiency, Anemia (normocytic), Bone lytic lesions (pathologic fractures, deep bone pain)", "Pallor from severe anemia, bone tenderness over vertebrae and ribs"],
        "initialLabs": ["Serum and Urine Protein Electrophoresis with Immunofixation (SPEP/UPEP showing M-spike)", "Serum Free Light Chain (FLC) ratio (kappa/lambda)", "Serum Calcium (hypercalcemia)", "Serum Creatinine, BUN, CBC, beta-2 microglobulin"],
        "confirmatoryTests": ["Bone marrow aspirate and biopsy (>10% clonal plasma cells)"],
        "imaging": ["Whole-body low-dose CT or skeletal survey ('punched-out' osteolytic bone lesions without osteoblastic activity)"],
        "clinicalPearls": "A routine bone scan (technetium-99m) is falsely negative in multiple myeloma because osteoblasts are inhibited; use whole-body low-dose CT or skeletal survey!",
        "evidences": ["E_55", "E_53", "E_54", "E_56", "E_216", "E_144", "E_89"]
    },
    "Cardiac tamponade": {
        "icd10": "I31.4",
        "category": "Primary",
        "severity": 1,
        "system": "cardiac",
        "pathophysiology": "Accumulation of fluid, pus, or blood in the inextensible pericardial space -> intrapericardial pressure exceeding intracardiac diastolic pressure -> impaired ventricular filling, decreased stroke volume, and obstructive shock.",
        "bedsideSignsToTest": ["Beck's triad: Hypotension, Distended Jugular Veins, Muffled/Distant heart sounds", "Pulsus paradoxus (systolic blood pressure drop >10 mmHg during normal inspiration)", "Tachycardia and electrical alternans on ECG"],
        "initialLabs": ["Troponin, CBC, Coagulation markers, BMP", "Pericardial fluid analysis post-drainage (cytology, culture, acid-fast smear)"],
        "confirmatoryTests": ["Emergency Transthoracic Echocardiogram (TTE): pericardial effusion with right ventricular diastolic collapse and right atrial systolic collapse"],
        "imaging": ["Bedside POCUS / TTE", "Chest X-ray ('water bottle' enlarged cardiac silhouette)"],
        "clinicalPearls": "Emergency pericardiocentesis is life-saving! Positive pressure ventilation is relatively contraindicated as it increases intrathoracic pressure and worsens cardiac collapse.",
        "evidences": ["E_66", "E_55", "E_53", "E_159", "E_50"]
    },
}

print(f"[EXPAND] Defined {len(EXPANDED_CONDITIONS)} high-yield conditions across all missing medical specialties.")

# Merge conditions into conditions_lookup
combined_conditions = dict(existing_conditions)
combined_knowledge = dict(existing_knowledge)
combined_prob_matrix = dict(existing_prob_matrix)
combined_priors = dict(existing_priors)

all_evidence_keys = list(evidences_lookup.keys())

for cond_name, meta in EXPANDED_CONDITIONS.items():
    combined_conditions[cond_name] = {
        "condition_name": cond_name,
        "cond-name-fr": cond_name,
        "cond-name-eng": cond_name,
        "icd10-id": meta["icd10"],
        "symptoms": {ev: {} for ev in meta.get("evidences", [])},
        "antecedents": {},
        "severity": meta["severity"]
    }

    combined_knowledge[cond_name] = {
        "icd10": meta["icd10"],
        "category": meta["category"],
        "pathophysiology": meta["pathophysiology"],
        "bedsideSignsToTest": meta["bedsideSignsToTest"],
        "initialLabs": meta["initialLabs"],
        "confirmatoryTests": meta["confirmatoryTests"],
        "imaging": meta["imaging"],
        "clinicalPearls": meta["clinicalPearls"]
    }

    # Set prior probability
    combined_priors[cond_name] = 0.012

    # Build conditional probability vector
    prob_vec = {}
    linked_evs = set(meta.get("evidences", []))
    for ev in all_evidence_keys:
        if ev in linked_evs:
            prob_vec[ev] = 0.78
        else:
            prob_vec[ev] = 0.02
    combined_prob_matrix[cond_name] = prob_vec

# Re-normalize condition priors
total_p = sum(combined_priors.values())
for k in combined_priors:
    combined_priors[k] /= total_p

print(f"[MERGE] Total Conditions after expansion: {len(combined_conditions)}")

# Save expanded artifacts
with open(os.path.join(PROCESSED_DIR, "conditions_lookup_expanded.json"), "w", encoding="utf-8") as f:
    json.dump(combined_conditions, f, indent=2)

with open(os.path.join(PROCESSED_DIR, "clinical_knowledge_expanded.json"), "w", encoding="utf-8") as f:
    json.dump(combined_knowledge, f, indent=2)

with open(os.path.join(PROCESSED_DIR, "prob_matrix_expanded.json"), "w", encoding="utf-8") as f:
    json.dump(combined_prob_matrix, f)

with open(os.path.join(PROCESSED_DIR, "condition_priors_expanded.json"), "w", encoding="utf-8") as f:
    json.dump(combined_priors, f, indent=2)

print("[SUCCESS] Saved conditions_lookup_expanded.json, clinical_knowledge_expanded.json, prob_matrix_expanded.json, and condition_priors_expanded.json")

# ===========================================================================
# GENERATE EXPANDED MULTI-CONDITION PATIENT DATASET (120,000 Patients)
# ===========================================================================
print("\n[PATIENT GENERATOR] Generating 120,000 multi-specialty patient training records covering all 115+ conditions...")

train_patients_out = os.path.join(PROCESSED_DIR, "patients_expanded_train.csv")
val_patients_out = os.path.join(PROCESSED_DIR, "patients_expanded_val.csv")

random.seed(42)

all_conditions_list = list(combined_conditions.keys())
fieldnames = ["AGE", "DIFFERENTIAL_DIAGNOSIS", "SEX", "PATHOLOGY", "EVIDENCES", "INITIAL_EVIDENCE"]

def generate_patient_case(condition_name):
    meta = combined_knowledge.get(condition_name, {})
    cond_meta = combined_conditions.get(condition_name, {})
    
    age = random.randint(18, 85)
    sex = random.choice(["M", "F"])
    
    # Specific demographic heuristics
    if "preeclampsia" in condition_name.lower() or "ectopic" in condition_name.lower() or "pid" in condition_name.lower() or "ovarian" in condition_name.lower():
        sex = "F"
        age = random.randint(18, 42)
    elif "prostatic" in condition_name.lower():
        sex = "M"
        age = random.randint(55, 88)
        
    symptoms_dict = cond_meta.get("symptoms", {})
    cardinal_evs = list(symptoms_dict.keys())
    
    if not cardinal_evs:
        cardinal_evs = ["E_55", "E_53", "E_54", "E_56"]
        
    # Sample 4 to 10 positive evidences
    k = min(len(cardinal_evs), random.randint(3, max(3, len(cardinal_evs))))
    chosen_evs = set(random.sample(cardinal_evs, k))
    
    # Add random background/noise evidences (1-3)
    noise_pool = ["E_50", "E_14", "E_151", "E_91", "E_66", "E_124"]
    chosen_evs.update(random.sample(noise_pool, random.randint(1, 3)))
    
    ev_list = sorted(list(chosen_evs))
    initial_ev = random.choice(ev_list)
    
    # Differential candidates
    other_conds = random.sample([c for c in all_conditions_list if c != condition_name], 4)
    ddx = [[condition_name, round(random.uniform(0.45, 0.85), 3)]]
    rem = 1.0 - ddx[0][1]
    for oc in other_conds:
        p = round(rem * random.uniform(0.15, 0.45), 3)
        ddx.append([oc, p])
        rem = max(0.01, rem - p)
        
    return {
        "AGE": age,
        "DIFFERENTIAL_DIAGNOSIS": str(ddx),
        "SEX": sex,
        "PATHOLOGY": condition_name,
        "EVIDENCES": str(ev_list),
        "INITIAL_EVIDENCE": initial_ev
    }

# Generate 100,000 train cases (uniform representation across all conditions)
TOTAL_TRAIN_CASES = 100000
TOTAL_VAL_CASES = 15000

print(f"Generating {TOTAL_TRAIN_CASES:,} training cases...")
with open(train_patients_out, "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    for i in range(TOTAL_TRAIN_CASES):
        cond = all_conditions_list[i % len(all_conditions_list)]
        writer.writerow(generate_patient_case(cond))

print(f"Generating {TOTAL_VAL_CASES:,} validation cases...")
with open(val_patients_out, "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    for i in range(TOTAL_VAL_CASES):
        cond = all_conditions_list[i % len(all_conditions_list)]
        writer.writerow(generate_patient_case(cond))

print(f"[COMPLETE] Saved {train_patients_out} and {val_patients_out}")
print("=" * 80)
print(f"AkiMed Medical Universe successfully expanded to {len(all_conditions_list)} conditions!")
print("=" * 80)
