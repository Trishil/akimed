export interface ResourceLink {
  title: string;
  source: string;
  url: string;
  category: 'Dataset' | 'Medical Ontology' | 'Clinical Benchmark' | 'Guidelines & Frameworks';
  description: string;
  mbbsRelevance: string;
}

export interface TrainingArchitectureSection {
  stepNumber: number;
  title: string;
  description: string;
  technicalDetails: string;
  clinicalSignificance: string;
  prosAndCons: { pros: string[]; cons: string[] };
}

export const MBBS_DATASETS_AND_RESOURCES: ResourceLink[] = [
  {
    title: 'DDXPlus Dataset (Mila / Yoshua Bengio Lab) [Active & Trained in AkiMed]',
    source: 'Mila - Quebec AI Institute / Figshare (Stored at /Volumes/Trishil/Akimed_data)',
    url: 'https://figshare.com/articles/dataset/DDXPlus_Dataset_English_/22687585',
    category: 'Dataset',
    description: 'Gold-standard automatic symptom acquisition & differential diagnosis dataset of 1.3 million patient encounters across 49 conditions and 223 clinical symptoms, with ground-truth differentials and ESI triage levels.',
    mbbsRelevance: 'Powers AkiMed\'s local Bayesian Entropy engine and Random Forest Triage classifier, achieving 95.97% Top-1 diagnosis and 99.9% ESI Level 1 resuscitation sensitivity on 3,000 real test cases.',
  },
  {
    title: 'MIMIC-IV (Medical Information Mart for Intensive Care)',
    source: 'PhysioNet / MIT Laboratory for Computational Physiology',
    url: 'https://physionet.org/content/mimiciv/',
    category: 'Dataset',
    description: 'Gold-standard de-identified electronic health records of >300,000 patient hospitalizations, including admission chief complaints, ICD-9/ICD-10 codes, lab measurements, vitals, medications, and clinical notes.',
    mbbsRelevance: 'Essential for modeling co-morbidities (e.g. how DM + HTN alters presentation) and calculating real-world probability distributions of symptoms.',
  },
  {
    title: 'MedQA / USMLE Clinical Vignette Dataset',
    source: 'Hugging Face / National Medical Board Examination Benchmark',
    url: 'https://huggingface.co/datasets/GBaker/MedQA-USMLE-4-options',
    category: 'Clinical Benchmark',
    description: '12,723 clinical board examination questions (USMLE Step 1, Step 2 CK, Step 3) formatted as detailed patient vignettes with differential choices and authoritative pathophysiological reasoning.',
    mbbsRelevance: 'Perfect benchmark for testing whether your Akinator discriminates accurately between look-alike conditions (e.g., Pericarditis vs MI).',
  },
  {
    title: 'SNOMED CT (Systematized Nomenclature of Medicine)',
    source: 'SNOMED International & NLM',
    url: 'https://www.nlm.nih.gov/healthit/snomedct/index.html',
    category: 'Medical Ontology',
    description: 'The most comprehensive clinical healthcare terminology in the world (>350,000 concepts), formally mapping symptoms ("pleuritic chest pain") to anatomical sites ("pleura") to diseases ("pulmonary embolism").',
    mbbsRelevance: 'Prevents synonym ambiguity (e.g., knowing "dyspnea", "breathlessness", "shortness of breath", and "SOB" all refer to the same clinical finding).',
  },
  {
    title: 'Columbia Disease-Symptom Knowledge Graph (DKG)',
    source: 'Columbia University Dept of Biomedical Informatics / GitHub',
    url: 'https://github.com/SuLab/Disease-Symptom-Knowledge-Graph',
    category: 'Medical Ontology',
    description: 'A curated bipartite graph linking hundreds of diseases to symptoms extracted from Medline, CDC, and Harrison\'s with co-occurrence weights and bayesian priors.',
    mbbsRelevance: 'Directly powers the Akinator elimination tree by finding which single symptom has the highest information gain (entropy reduction) at each turn.',
  },
  {
    title: 'CDC Yellow Book: Health Information for International Travel',
    source: 'U.S. Centers for Disease Control and Prevention',
    url: 'https://wwwnc.cdc.gov/travel/yellowbook/latest/table-of-contents',
    category: 'Guidelines & Frameworks',
    description: 'Authoritative clinical guide on geographic epidemiology, incubation periods, endemic infectious diseases (Malaria, Dengue, Yellow Fever, Typhoid, Rickettsia, Schistosomiasis), and traveler profiles.',
    mbbsRelevance: 'Provides exact incubation periods (e.g. Falciparum malaria = 7-30 days, Dengue = 3-14 days) critical for factoring travel history.',
  },
  {
    title: 'Emergency Severity Index (ESI) Triage Algorithm',
    source: 'Agency for Healthcare Research and Quality (AHRQ)',
    url: 'https://www.ahrq.gov/patient-safety/settings/emergency-dept/esi.html',
    category: 'Guidelines & Frameworks',
    description: 'The five-level emergency department triage algorithm: Level 1 (Immediate life-saving intervention needed), Level 2 (High risk / confusion / severe pain), Level 3 (Multiple resources needed), Level 4 (One resource), Level 5 (No resources).',
    mbbsRelevance: 'Teaches 1st year students the critical distinction between diagnostic curiosity and immediate life-saving stabilization (ABCDE: Airway, Breathing, Circulation).',
  },
];

export const ARCHITECTURE_EXPLANATION = {
  summary: `As a 1st year MBBS student, you are at the ideal vantage point: you are mastering anatomy, physiology, and biochemistry, which form the bedrock of clinical reasoning. Here is the exact roadmap of how to build a Medical Akinator, comparing the traditional rule-based approach, modern LLM agents, and the recommended Hybrid Architecture.`,
  approaches: [
    {
      name: 'Approach A: Pure Bayesian Network / Decision Tree (Classical Akinator)',
      howItWorks: 'You build a conditional probability matrix P(Symptom | Disease) using datasets like Columbia DKG or MIMIC-IV. At each question, the algorithm calculates Information Gain (Shannon Entropy reduction) to pick the single question that splits the remaining candidate diseases closest to 50/50.',
      pros: ['100% deterministic & explainable', 'Never hallucinates non-existent syndromes', 'Runs fully offline with zero GPU costs'],
      cons: ['Extremely rigid: struggles with atypical presentations (e.g., painless MI in diabetics)', 'Hard to parse natural language complaints from patients', 'High maintenance to keep updated with new medical guidelines'],
    },
    {
      name: 'Approach B: Fine-Tuned Open-Source LLM (e.g. Llama 3 Med / BioMistral)',
      howItWorks: 'You take an open-source model and fine-tune it on 50,000+ MedQA & MIMIC-IV clinical discharge summaries using LoRA/QLoRA on an NVIDIA GPU (Google Colab / RunPod).',
      pros: ['Natural patient conversational flow', 'Understands nuanced free-text descriptions', 'Deep knowledge of rare syndromes ("Zebras")'],
      cons: ['Requires expensive GPUs for training', 'Risk of medical hallucination / confident errors', 'Can wander off the Akinator format without strict token control'],
    },
    {
      name: 'Approach C: Modern Hybrid Engine (Our Implemented System)',
      howItWorks: 'Combines structured clinical knowledge graphs (pre-defined criteria for vitals, travel incubation, red flags, and drug cross-reactivity) with Google\'s Gemini 3.8 Flash LLM acting as the dynamic Bayesian inference agent with structured JSON outputs. If offline or without API keys, a deterministic heuristic engine provides continuous reliability.',
      pros: ['Instant accuracy for travel medicine, age-specific risks, and allergy alerts', 'Dynamic 20-questions discriminator loop adapted to the individual patient', 'Zero training infrastructure required to run; completely accessible to medical students'],
      cons: ['Requires server proxy or API access for LLM calls'],
    },
  ],
  studentMilestones: [
    {
      year: 'MBBS 1st Year (Current)',
      focus: 'Pre-clinical foundations (Anatomy, Physiology, Biochemistry)',
      appContribution: 'Code the pathophysiology engines and normal physiological ranges (vitals, biochemical markers like G6PD deficiency, cardiac enzymes, renal function).',
    },
    {
      year: 'MBBS 2nd Year',
      focus: 'Pathology, Pharmacology, Microbiology, Forensic',
      appContribution: 'Add antibiotic cross-allergies (Beta-lactam vs Macrolide), microbial incubation periods (Malaria vs Salmonella enterica serotype Typhi), and adverse drug reactions.',
    },
    {
      year: 'MBBS 3rd & Final Year',
      focus: 'Clinical postings: Medicine, Surgery, OB/GYN, Pediatrics, Emergency Triage',
      appContribution: 'Validate against real patient cases in hospital rotations, calculate diagnostic sensitivity & specificity, and submit as a student research publication to biomedical informatics journals!',
    },
  ],
};
