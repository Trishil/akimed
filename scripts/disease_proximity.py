"""
AkiMed Clinical Disease Proximity & Dynamic Akinator Nearest-Neighbor Graph
Implements the authentic 20-Questions Akinator Algorithm for Clinical Medicine:
1. Lock on prominent disease.
2. Ask targeted questions for that disease as long as user answers 'Yes' / 'Probably Yes'.
3. As soon as user answers 'No' / 'Probably No', REFUTE that disease and SWITCH to the nearest non-refuted disease in the clinical proximity space.
4. Continue until >=95% diagnostic certainty or hallmark confirmation.
"""

import os
import json
import math
from typing import Dict, List, Optional, Tuple, Set, Any

DATA_ROOT = os.environ.get("AKIMED_DATA_ROOT", "/Volumes/Trishil/Akimed_data")
PROCESSED_DIR = os.path.join(DATA_ROOT, "processed")

# High-fidelity Clinical Proximity Graph for Emergency & Differential Diagnosis
CLINICAL_PROXIMITY_RULES: Dict[str, List[Dict[str, Any]]] = {
    "Acute ischemic stroke (MCA territory)": [
        {"name": "Acute hypoglycemia", "similarity": 0.94, "reason": "Neuroglycopenia produces focal hemiplegia and acute confusion identical to hemispheric MCA stroke."},
        {"name": "Spontaneous subarachnoid hemorrhage (SAH)", "similarity": 0.88, "reason": "Acute vascular insult with sudden neurological compromise and altered sensorium."},
        {"name": "Bell's palsy (Idiopathic CN VII paralysis)", "similarity": 0.82, "reason": "Unilateral facial weakness; distinguished by forehead involvement (LMN vs UMN)."},
        {"name": "Migraine headache", "similarity": 0.78, "reason": "Hemiplegic migraine causes reversible focal neurological deficits and headache."},
        {"name": "Acute bacterial meningitis", "similarity": 0.72, "reason": "Acute confusion, neurological depression, and meningeal irritation."}
    ],
    "Acute hypoglycemia": [
        {"name": "Acute ischemic stroke (MCA territory)", "similarity": 0.94, "reason": "Focal motor weakness, dysarthria, and acute confusion mimicking ischemic stroke."},
        {"name": "Diabetic ketoacidosis (DKA)", "similarity": 0.85, "reason": "Diabetic medication mismatch causing acute metabolic decompensation."},
        {"name": "Primary adrenal insufficiency (Addisonian crisis)", "similarity": 0.79, "reason": "Glucocorticoid deficiency causing refractory hypoglycemia and vascular collapse."},
        {"name": "Hyperosmolar hyperglycemic state (HHS)", "similarity": 0.75, "reason": "Severe neuro-glycemic disturbance in diabetic patients."}
    ],
    "Acute ST-elevation myocardial infarction (STEMI)": [
        {"name": "Possible NSTEMI / STEMI", "similarity": 0.96, "reason": "Acute coronary syndrome spectrum with non-ST-elevation or atypical anginal presentation."},
        {"name": "Acute Stanford Type A aortic dissection", "similarity": 0.89, "reason": "Catastrophic chest pain radiating to back with profound cardiovascular instability."},
        {"name": "Pulmonary embolism", "similarity": 0.84, "reason": "Sudden chest pain, marked dyspnea, tachycardia, and acute right ventricular strain."},
        {"name": "Pericarditis", "similarity": 0.79, "reason": "Retrosternal chest discomfort exacerbated by supine positioning."},
        {"name": "GERD", "similarity": 0.74, "reason": "Substernal burning ache radiating to back and jaw mimicking angina."}
    ],
    "Possible NSTEMI / STEMI": [
        {"name": "Acute ST-elevation myocardial infarction (STEMI)", "similarity": 0.96, "reason": "Transmural coronary occlusion vs subendocardial ischemia."},
        {"name": "Acute pancreatitis", "similarity": 0.82, "reason": "Epigastric pain radiating through to the back with nausea/vomiting."},
        {"name": "Acute Stanford Type A aortic dissection", "similarity": 0.80, "reason": "Aortic tear involving coronary ostia or presenting with epigastric/back pain."},
        {"name": "GERD", "similarity": 0.75, "reason": "Epigastric discomfort and acid burning mimicking atypical anginal equivalents."}
    ],
    "Acute Stanford Type A aortic dissection": [
        {"name": "Acute ST-elevation myocardial infarction (STEMI)", "similarity": 0.89, "reason": "Severe acute chest pain with diaphoresis and impending cardiovascular collapse."},
        {"name": "Possible NSTEMI / STEMI", "similarity": 0.85, "reason": "Tear near coronary arteries causing ischemic ECG changes."},
        {"name": "Pulmonary embolism", "similarity": 0.81, "reason": "Sudden catastrophic thoracic pain and dyspnea with tachycardia."},
        {"name": "Perforated peptic ulcer disease", "similarity": 0.72, "reason": "Sudden excruciating visceral pain with rigid abdomen and shock."}
    ],
    "Ruptured ectopic pregnancy": [
        {"name": "Ovarian torsion", "similarity": 0.89, "reason": "Severe sudden unilateral pelvic/lower quadrant pain and acute abdomen in reproductive-age females."},
        {"name": "Acute appendicitis", "similarity": 0.85, "reason": "Right lower quadrant abdominal pain with tenderness and peritoneal signs."},
        {"name": "Pelvic inflammatory disease (PID)", "similarity": 0.81, "reason": "Cervical motion tenderness, adnexal fullness, and lower abdominal pain."},
        {"name": "Nephrolithiasis (Renal colic)", "similarity": 0.74, "reason": "Severe unilateral lower quadrant/flank pain radiating to groin."}
    ],
    "Acute appendicitis": [
        {"name": "Ruptured ectopic pregnancy", "similarity": 0.85, "reason": "Acute right lower quadrant pain with peritoneal signs in females."},
        {"name": "Ovarian torsion", "similarity": 0.83, "reason": "Unilateral lower abdominal pain with acute onset and vomiting."},
        {"name": "Acute diverticulitis", "similarity": 0.79, "reason": "Focal lower quadrant abdominal pain with guarding and leukocytosis."},
        {"name": "Nephrolithiasis (Renal colic)", "similarity": 0.76, "reason": "Colicky abdominal/flank pain with nausea and dysuria."}
    ],
    "Plasmodium falciparum malaria": [
        {"name": "Dengue fever / Severe dengue", "similarity": 0.88, "reason": "Endemic tropical mosquito-borne acute febrile illness with severe myalgias and thrombocytopenia."},
        {"name": "Enteric (Typhoid) fever", "similarity": 0.84, "reason": "Prolonged persistent fevers, gastrointestinal symptoms, and step-ladder temperature curves."},
        {"name": "Leptospirosis (Weil's disease)", "similarity": 0.80, "reason": "Biphasic fever, conjunctival suffusion, jaundice, and acute renal/hepatic dysfunction."},
        {"name": "Severe sepsis / Septic shock", "similarity": 0.75, "reason": "Systemic inflammatory response with high fevers, rigors, and hypotension."}
    ],
    "Dengue fever / Severe dengue": [
        {"name": "Plasmodium falciparum malaria", "similarity": 0.88, "reason": "Tropical acute febrile illness with thrombocytopenia and headache."},
        {"name": "Enteric (Typhoid) fever", "similarity": 0.82, "reason": "Persistent fevers, constitutional symptoms, and hepatosplenomegaly."},
        {"name": "Chagas", "similarity": 0.70, "reason": "Endemic vector-borne parasitic infection with acute febrile phase."}
    ],
    "Acute bacterial meningitis": [
        {"name": "Herpes simplex viral encephalitis", "similarity": 0.89, "reason": "Acute fever, headache, altered sensorium, and neurological irritability."},
        {"name": "Spontaneous subarachnoid hemorrhage (SAH)", "similarity": 0.85, "reason": "Sudden severe headache with nuchal rigidity and meningismus."},
        {"name": "Acute ischemic stroke (MCA territory)", "similarity": 0.72, "reason": "Acute altered mental status and focal neurological deficits."}
    ],
    "Diabetic ketoacidosis (DKA)": [
        {"name": "Hyperosmolar hyperglycemic state (HHS)", "similarity": 0.92, "reason": "Severe hyperglycemia, profound dehydration, and altered sensorium in diabetics."},
        {"name": "Acute pancreatitis", "similarity": 0.81, "reason": "Severe abdominal pain, intractable vomiting, and metabolic acidosis."},
        {"name": "Acute hypoglycemia", "similarity": 0.80, "reason": "Diabetic metabolic decompensation and acute neuroglycopenic distress."}
    ],
    "Organophosphate / Carbamate Poisoning (Acute Cholinergic Toxidrome)": [
        {"name": "Scombroid food poisoning", "similarity": 0.76, "reason": "Histamine toxicity with sudden flushing, gastrointestinal cramping, and diaphoresis."},
        {"name": "Severe sepsis / Septic shock", "similarity": 0.71, "reason": "Profound diaphoresis, respiratory secretions, and hemodynamic instability."},
        {"name": "Anaphylaxis", "similarity": 0.69, "reason": "Acute bronchospasm, mucosal secretions, and cardiovascular collapse."},
        {"name": "Acute hypoglycemia", "similarity": 0.64, "reason": "Diaphoresis, altered sensorium, and autonomic instability."}
    ]
}

# Hallmark diagnostic questions ladder for key conditions
HALLMARK_QUESTIONS: Dict[str, List[Dict[str, Any]]] = {
    "Organophosphate / Carbamate Poisoning (Acute Cholinergic Toxidrome)": [
        {
            "questionId": "Q_TOX_CROP_SPRAY",
            "questionText": "Was the patient directly mixing, spraying, or handling agricultural pesticides or organophosphate insecticides prior to symptom onset?",
            "category": "Epidemiology",
            "clinicalRationale": "Occupational chemical crop spraying provides cardinal exposure route for acute acetylcholinesterase inhibition.",
            "expectedAnswer": "yes",
            "diagnosticYield": 10
        },
        {
            "questionId": "Q_TOX_KILLER_BS",
            "questionText": "Does the patient demonstrate the classic 'Killer B' triad: profuse Bronchorrhea (frothy respiratory secretions), severe Bronchospasm (wheezing), and Bradycardia?",
            "category": "Physical Exam",
            "clinicalRationale": "Massive muscarinic hyperstimulation produces fatal respiratory hypersecretion and severe airway obstruction.",
            "expectedAnswer": "yes",
            "diagnosticYield": 10
        },
        {
            "questionId": "Q_TOX_PINPOINT_PUPILS",
            "questionText": "On physical exam, are there pinpoint pupils (miosis < 2 mm) accompanied by diffuse visible muscle twitches or fasciculations?",
            "category": "Physical Exam",
            "clinicalRationale": "Muscarinic miosis combined with nicotinic neuromuscular junction acetylcholine excess causing fasciculations.",
            "expectedAnswer": "yes",
            "diagnosticYield": 9
        }
    ],
    "Acute ischemic stroke (MCA territory)": [
        {
            "questionId": "Q_STROKE_FAST_WEAKNESS",
            "questionText": "Did the patient develop sudden, abrupt weakness or numbness primarily on one side of their face, arm, or leg (unilateral hemiparesis)?",
            "category": "Physical Exam",
            "clinicalRationale": "Unilateral cortical/capsular motor ischemia produces hallmark contralateral hemiparesis (FAST criteria).",
            "expectedAnswer": "yes",
            "diagnosticYield": 10
        },
        {
            "questionId": "Q_STROKE_SPEECH",
            "questionText": "Is there noticeable slurred speech (dysarthria) or difficulty finding words and comprehending conversation (aphasia)?",
            "category": "Bedside Sign",
            "clinicalRationale": "Disruption of Broca's/Wernicke's cortical areas or corticobulbar fibers in dominant MCA territory.",
            "expectedAnswer": "yes",
            "diagnosticYield": 9
        },
        {
            "questionId": "Q_STROKE_FACIAL_DROOP",
            "questionText": "Does the patient show an asymmetric facial droop or unilateral pronator drift when holding both arms outstretched?",
            "category": "Physical Exam",
            "clinicalRationale": "Cincinnati Prehospital Stroke Scale physical hallmark for acute hemispheric arterial occlusion.",
            "expectedAnswer": "yes",
            "diagnosticYield": 9
        },
        {
            "questionId": "Q_STROKE_TIME_WINDOW",
            "questionText": "Was the patient last known to be completely normal within the past 4.5 hours (qualifying for immediate IV thrombolysis)?",
            "category": "Red Flag",
            "clinicalRationale": "Confirms hyperacute ischemic penumbra amenable to Alteplase/Tenecteplase or endovascular thrombectomy.",
            "expectedAnswer": "yes",
            "diagnosticYield": 10
        }
    ],
    "Acute hypoglycemia": [
        {
            "questionId": "Q_HYPO_SWEAT_TREMOR",
            "questionText": "Is the confusion accompanied by profuse cold diaphoresis (clamminess), fine hand tremors, palpitations, and intense hunger?",
            "category": "History",
            "clinicalRationale": "Autonomic sympathoadrenal surge triggered by rapid decline of blood glucose (< 55 mg/dL).",
            "expectedAnswer": "yes",
            "diagnosticYield": 9
        },
        {
            "questionId": "Q_HYPO_DIABETIC_MEDS",
            "questionText": "Does the patient take insulin or sulfonylurea medications (e.g. Glimepiride, Gliclazide) with a recent skipped meal or strenuous activity?",
            "category": "History",
            "clinicalRationale": "Excess insulin/secretagogue relative to caloric intake is the predominant trigger for neuroglycopenia.",
            "expectedAnswer": "yes",
            "diagnosticYield": 9
        },
        {
            "questionId": "Q_HYPO_WHIPPLE_REVERSAL",
            "questionText": "Did capillary fingerstick confirm glucose < 60 mg/dL, with rapid symptom resolution after glucose or dextrose administration (Whipple triad)?",
            "category": "Bedside Sign",
            "clinicalRationale": "Whipple triad provides pathognomonic confirmation of hypoglycemia over primary structural stroke.",
            "expectedAnswer": "yes",
            "diagnosticYield": 10
        }
    ],
    "Acute ST-elevation myocardial infarction (STEMI)": [
        {
            "questionId": "Q_STEMI_CHEST_PRESSURE",
            "questionText": "Is there heavy, squeezing, pressure-like substernal chest discomfort radiating to the left arm, shoulder, or jaw lasting > 20 minutes?",
            "category": "History",
            "clinicalRationale": "Classic ischemic visceral pain mediated by sympathetic C7-T4 cardiac afferents from acute coronary occlusion.",
            "expectedAnswer": "yes",
            "diagnosticYield": 10
        },
        {
            "questionId": "Q_STEMI_DIAPHORESIS_DYSPNEA",
            "questionText": "Is the chest pain accompanied by cold profuse sweating, dyspnea, or an impending sense of doom?",
            "category": "History",
            "clinicalRationale": "Severe sympathetic activation and acute left ventricular dysfunction during coronary hypoperfusion.",
            "expectedAnswer": "yes",
            "diagnosticYield": 9
        },
        {
            "questionId": "Q_STEMI_ECG_ST_ELEVATION",
            "questionText": "Does an immediate 12-lead ECG demonstrate ST-segment elevation >= 1-2 mm in two anatomically contiguous leads?",
            "category": "Red Flag",
            "clinicalRationale": "Definitive criteria for emergent catheterization laboratory activation and primary percutaneous intervention (PCI).",
            "expectedAnswer": "yes",
            "diagnosticYield": 10
        }
    ],
    "Possible NSTEMI / STEMI": [
        {
            "questionId": "Q_NSTEMI_ANGINAL_EQUIVALENT",
            "questionText": "In this diabetic or elderly patient, is there severe unprovoked epigastric or back discomfort with nausea and unexplained diaphoresis without classic chest pain?",
            "category": "History",
            "clinicalRationale": "Diabetic autonomic neuropathy blunts typical somatic cardiac pain, causing atypical anginal equivalents.",
            "expectedAnswer": "yes",
            "diagnosticYield": 10
        },
        {
            "questionId": "Q_NSTEMI_HEART_FAILURE_CRACKLES",
            "questionText": "On auscultation, are there bibasilar lung crackles or a faint S4 gallop indicating acute left ventricular stiffness?",
            "category": "Physical Exam",
            "clinicalRationale": "Killip class II heart failure secondary to acute subendocardial ischemia.",
            "expectedAnswer": "yes",
            "diagnosticYield": 9
        },
        {
            "questionId": "Q_NSTEMI_TROPONIN_RISE",
            "questionText": "Does high-sensitivity cardiac troponin (hs-cTnI / hs-cTnT) show elevated or rising delta values above the 99th percentile?",
            "category": "Bedside Sign",
            "clinicalRationale": "Biomarker confirmation of ongoing myocardial necrosis and non-ST-elevation myocardial infarction.",
            "expectedAnswer": "yes",
            "diagnosticYield": 10
        }
    ],
    "Acute Stanford Type A aortic dissection": [
        {
            "questionId": "Q_AORTIC_TEARING_PAIN",
            "questionText": "Is the thoracic pain described as an instantaneous, maximum-intensity 'tearing' or 'ripping' sensation that radiates between the shoulder blades?",
            "category": "Red Flag",
            "clinicalRationale": "Propagation of intramural hematoma down the aortic media generates hallmark shearing interscapular pain.",
            "expectedAnswer": "yes",
            "diagnosticYield": 10
        },
        {
            "questionId": "Q_AORTIC_BP_PULSE_ASYMMETRY",
            "questionText": "Is there a significant blood pressure difference (> 20 mmHg) or pulse deficit between the right and left upper extremities?",
            "category": "Physical Exam",
            "clinicalRationale": "Compromise of the subclavian or brachiocephalic arterial takeoffs by the dissecting flap.",
            "expectedAnswer": "yes",
            "diagnosticYield": 9
        }
    ],
    "Ruptured ectopic pregnancy": [
        {
            "questionId": "Q_ECTOPIC_AMENORRHEA_SPOTTING",
            "questionText": "Does the female patient have a history of 6 to 8 weeks of amenorrhea (missed period) with recent onset of dark vaginal spotting or bleeding?",
            "category": "History",
            "clinicalRationale": "Decidual breakdown in the absence of intrauterine gestation following extrauterine implantation.",
            "expectedAnswer": "yes",
            "diagnosticYield": 10
        },
        {
            "questionId": "Q_ECTOPIC_CERVICAL_MOTION_TENDER",
            "questionText": "On bimanual pelvic examination, is there exquisite cervical motion tenderness (Chandelier sign) and severe adnexal fullness?",
            "category": "Physical Exam",
            "clinicalRationale": "Peritoneal irritation from hemoperitoneum pooling in the pouch of Douglas.",
            "expectedAnswer": "yes",
            "diagnosticYield": 9
        },
        {
            "questionId": "Q_ECTOPIC_SHOULDER_KEHR_SIGN",
            "questionText": "Does the patient report sudden sharp pain in the right shoulder tip when lying supine (positive Kehr's sign from subdiaphragmatic blood)?",
            "category": "Bedside Sign",
            "clinicalRationale": "Phrenic nerve (C3-C5) irritation by free intraperitoneal blood pools under the hemidiaphragm.",
            "expectedAnswer": "yes",
            "diagnosticYield": 10
        }
    ],
    "Acute appendicitis": [
        {
            "questionId": "Q_APPEND_MIGRATORY_PAIN",
            "questionText": "Did the abdominal pain start around the periumbilical region before migrating and localizing specifically to the right lower quadrant (RLQ)?",
            "category": "History",
            "clinicalRationale": "Classic transition from visceral T10 midgut stretch pain to parietal peritoneal irritation at McBurney's point.",
            "expectedAnswer": "yes",
            "diagnosticYield": 10
        },
        {
            "questionId": "Q_APPEND_MCBURNEY_REBOUND",
            "questionText": "Is there point tenderness at McBurney's point with local rebound tenderness, involuntary guarding, or positive Rovsing's sign?",
            "category": "Physical Exam",
            "clinicalRationale": "Inflammation of the somatic parietal peritoneum overlying the inflamed appendix.",
            "expectedAnswer": "yes",
            "diagnosticYield": 9
        }
    ],
    "Plasmodium falciparum malaria": [
        {
            "questionId": "Q_MALARIA_PAROXYSMAL_FEVERS",
            "questionText": "Does the fever follow cyclical paroxysms (violent shaking chills/rigors -> burning high fever -> profuse sweating)?",
            "category": "History",
            "clinicalRationale": "Synchronized intraerythrocytic schizont rupture releasing pyrogens, hemozoin, and merozoites every 48 hours.",
            "expectedAnswer": "yes",
            "diagnosticYield": 9
        },
        {
            "questionId": "Q_MALARIA_ENDEMIC_EXPOSURE",
            "questionText": "Has the patient traveled to a known malaria-endemic country (e.g. Sub-Saharan Africa, South Asia) within the past 3 months without full chemoprophylaxis?",
            "category": "Epidemiology",
            "clinicalRationale": "Anopheles mosquito transmission in endemic regions with hepatic incubation phase of 7 to 30 days.",
            "expectedAnswer": "yes",
            "diagnosticYield": 10
        },
        {
            "questionId": "Q_MALARIA_HEMOLYTIC_ICTERUS",
            "questionText": "On examination, is there mild scleral icterus (yellowish eyes) or dark 'tea-colored' urine indicating intravascular hemolysis?",
            "category": "Physical Exam",
            "clinicalRationale": "Extensive erythrocyte destruction releasing unconjugated bilirubin and free hemoglobin.",
            "expectedAnswer": "yes",
            "diagnosticYield": 9
        }
    ],
    "Dengue fever / Severe dengue": [
        {
            "questionId": "Q_DENGUE_RETRO_ORBITAL",
            "questionText": "Is the high fever accompanied by intense retro-orbital (behind the eyes) pain and excruciating muscle/bone aches ('breakbone fever')?",
            "category": "History",
            "clinicalRationale": "Hallmark viral presentation of Flavivirus infection transmitted by day-biting Aedes aegypti mosquitoes.",
            "expectedAnswer": "yes",
            "diagnosticYield": 9
        },
        {
            "questionId": "Q_DENGUE_TOURNIQUET_PETECHIAE",
            "questionText": "Are there scattered petechial skin hemorrhages or a positive tourniquet test (> 10 petechiae per square inch)?",
            "category": "Physical Exam",
            "clinicalRationale": "Capillary fragility and rapid thrombocytopenia caused by immune complex-mediated endothelial activation.",
            "expectedAnswer": "yes",
            "diagnosticYield": 9
        }
    ],
    "Acute bacterial meningitis": [
        {
            "questionId": "Q_MENING_NUCHAL_RIGIDITY",
            "questionText": "On physical examination, is there severe resistance to passive neck flexion (nuchal rigidity), positive Kernig's, or positive Brudzinski's sign?",
            "category": "Physical Exam",
            "clinicalRationale": "Stretching of acutely inflamed leptomeninges along the spinal cord triggers involuntary spasm.",
            "expectedAnswer": "yes",
            "diagnosticYield": 10
        },
        {
            "questionId": "Q_MENING_PETECHIAL_PURPURA",
            "questionText": "Is there a rapidly spreading non-blanching petechial or purpuric rash on the trunk or lower extremities (suggestive of meningococcemia)?",
            "category": "Red Flag",
            "clinicalRationale": "Neisseria meningitidis endotoxemia and disseminated intravascular microvascular thrombosis.",
            "expectedAnswer": "yes",
            "diagnosticYield": 10
        }
    ],
    "Diabetic ketoacidosis (DKA)": [
        {
            "questionId": "Q_DKA_KUSSMAUL_ACETONE",
            "questionText": "Is the patient displaying rapid, deep sighing respirations (Kussmaul breathing) with a distinctive fruity, sweet acetone odor on their breath?",
            "category": "Physical Exam",
            "clinicalRationale": "Respiratory compensation (blowing off CO2) for severe high-anion-gap metabolic acidosis and ketone excretion.",
            "expectedAnswer": "yes",
            "diagnosticYield": 10
        },
        {
            "questionId": "Q_DKA_GLUCOSE_KETONES",
            "questionText": "Did point-of-care testing confirm severe hyperglycemia (> 250 mg/dL) with large 3+ urine or capillary beta-hydroxybutyrate ketones?",
            "category": "Bedside Sign",
            "clinicalRationale": "Pathognomonic triad of hyperglycemia, high-anion gap metabolic acidosis, and hyperketonemia.",
            "expectedAnswer": "yes",
            "diagnosticYield": 10
        }
    ]
}


class ClinicalProximityManager:
    """
    Manages disease proximity lookups, cosine similarity matrix across 111 diseases,
    and hallmark inquiry ladders.
    """
    def __init__(self, prob_matrix: Dict[str, Dict[str, float]], evidences_lookup: Dict[str, Any]):
        self.prob_matrix = prob_matrix
        self.evidences_lookup = evidences_lookup
        self.conditions = sorted(list(prob_matrix.keys()))
        self.all_evidences = sorted(list(evidences_lookup.keys()))
        self.ev_map = {e: i for i, e in enumerate(self.all_evidences)}

        # Precompute condition symptom vectors & cosine similarity matrix (111 x 111)
        self.cond_vectors = {}
        for c in self.conditions:
            vec = [0.0] * len(self.all_evidences)
            for e, p in prob_matrix.get(c, {}).items():
                if e in self.ev_map:
                    vec[self.ev_map[e]] = float(p)
            # Normalize vector
            mag = math.sqrt(sum(v * v for v in vec))
            if mag > 0:
                vec = [v / mag for v in vec]
            self.cond_vectors[c] = vec

    def compute_cosine_similarity(self, cond1: str, cond2: str) -> float:
        v1 = self.cond_vectors.get(cond1)
        v2 = self.cond_vectors.get(cond2)
        if not v1 or not v2:
            return 0.0
        return sum(a * b for a, b in zip(v1, v2))

    def find_nearest_non_refuted(
        self,
        current_condition: str,
        refuted_conditions: Set[str],
        allowed_gender: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Finds the closest non-refuted differential look-alike disease.
        Checks clinical knowledge graph first, then falls back to 111-disease cosine similarity.
        """
        # 1. Check explicit clinical proximity rules
        if current_condition in CLINICAL_PROXIMITY_RULES:
            for neighbor in CLINICAL_PROXIMITY_RULES[current_condition]:
                cand_name = neighbor["name"]
                if cand_name not in refuted_conditions and cand_name in self.prob_matrix:
                    return neighbor

        # 2. Dynamic 111-disease Cosine Similarity fallback
        best_cand = None
        best_sim = -1.0
        for cand in self.conditions:
            if cand == current_condition or cand in refuted_conditions:
                continue
            sim = self.compute_cosine_similarity(current_condition, cand)
            if sim > best_sim:
                best_sim = sim
                best_cand = cand

        if best_cand:
            return {
                "name": best_cand,
                "similarity": round(best_sim, 3),
                "reason": f"High symptom profile similarity ({round(best_sim * 100, 1)}% cosine correlation in 223-evidence latent space)."
            }
        return None

    def get_hallmark_questions_for_disease(self, condition_name: str) -> List[Dict[str, Any]]:
        if condition_name in HALLMARK_QUESTIONS:
            return HALLMARK_QUESTIONS[condition_name]
        return []

    def get_next_question_for_disease(
        self,
        condition_name: str,
        asked_q_ids: Set[str],
        asked_ev_codes: Set[str]
    ) -> Optional[Dict[str, Any]]:
        """
        Gets next hallmark question for the condition.
        If hallmark ladder exhausted, dynamically picks highest probability unasked symptom from prob_matrix!
        """
        # 1. Check structured hallmark questions
        hallmarks = self.get_hallmark_questions_for_disease(condition_name)
        for hq in hallmarks:
            if hq["questionId"] not in asked_q_ids:
                return hq

        # 2. Dynamic fallback to high-probability symptom from prob_matrix
        cond_probs = self.prob_matrix.get(condition_name, {})
        sorted_evs = sorted(cond_probs.items(), key=lambda x: x[1], reverse=True)

        for ev_code, prob in sorted_evs:
            if ev_code not in asked_ev_codes and ev_code not in asked_q_ids:
                ev_info = self.evidences_lookup.get(ev_code, {})
                q_text = ev_info.get("question_en")
                if q_text:
                    return {
                        "questionId": ev_code,
                        "questionText": q_text,
                        "category": "Symptom Character" if "pain" in q_text.lower() else "Physical Exam",
                        "clinicalRationale": f"Cardinal hallmark feature for {condition_name} (Sensitivity: {round(prob * 100)}%).",
                        "expectedAnswer": "yes",
                        "diagnosticYield": 8
                    }

        return None
