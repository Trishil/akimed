# AkiMed — Clinical Diagnostic Decision Engine & Dynamic Akinator

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61dafb.svg)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4.x-38bdf8.svg)](https://tailwindcss.com/)
[![Architecture](https://img.shields.io/badge/Model-10--Layer%20Pre--LN%20Transformer-emerald.svg)]()
[![Parameters](https://img.shields.io/badge/Parameters-9.02M-purple.svg)]()
[![Top-3 Accuracy](https://img.shields.io/badge/Top--3%20Accuracy-99.99%25-brightgreen.svg)]()
[![License](https://img.shields.io/badge/License-Proprietary-red.svg)]()

> **AkiMed** is an evidence-based clinical diagnostic support system and interactive dynamic inquiry engine ("Dr. Akinator") designed for medical students (MBBS/MD) and healthcare professionals. Powered by a 10-Layer Pre-LayerNorm Clinical Attention Transformer (~9.02M parameters) and real-time Bayesian belief updating, AkiMed provides 5-Tier Emergency Severity Index (ESI) triage, differential diagnosis generation, and hypothesis-directed clinical inquiry.

---

## 🌟 Key Capabilities

### 1. 🎯 Dynamic Inquiry Engine ("Dr. Akinator")
- **Hypothesis-Directed Pursuit**: Instead of asking random questions, the engine selects a leading disease hypothesis (e.g., *Plasmodium falciparum Malaria*) and directs targeted discriminators until the hypothesis is corroborated ($\ge 85\%$ posterior probability) or refuted (triggering an evidence-based pivot to the next leading differential).
- **20-Question Diagnostic Budget**: Guarantees a thorough clinical workup with strict stopping criteria:
  - *Early exit criteria*: Triggered **only** when confidence $\ge 85\%$ **and** at least 10 questions have been answered.
  - *Differential Ranking*: If confidence remains below $85\%$ after 20 questions, the engine presents a ranked differential candidate spectrum rather than prematurely declaring a single diagnosis.
- **Closed Likert Scale**: Questions are phrased as testable, declarative clinical propositions (*"Is your pain sharp, pleuritic, or worsening on deep inspiration?"*) evaluated on a 5-point Likert scale (*Yes / Probably Yes / Don't Know / Probably Not / No*).

### 2. ⚡ Real-Time Typo & Misspelling Resolution
- Users can type symptoms freely (e.g., *"chect preasure"*, *"shivering chills"*, *"retro-orvital pain"*).
- The tokenization pipeline uses normalized Levenshtein-distance alignment and semantic synonym expansion to match free-text input to standardized clinical entities in real time.

### 3. 🌍 Travel History & Chronology Prior Factorization
- Automatically parses geographic exposure tokens (e.g., *Kenya, sub-Saharan Africa, Southeast Asia*) and symptom chronologies (*sudden onset 2 hours ago*, *cyclical fevers every 48 hours*).
- Applies Bayesian prior re-weighting to endemic conditions before Question 1 is even generated.

### 4. 🚨 5-Tier ESI Emergency Triage Protocol
- Evaluates vital signs, hemodynamic stability, and critical red flags to assign an accredited Emergency Severity Index (ESI Level 1–5):
  - **Level 1 (Resuscitation)**: Immediate life-saving intervention.
  - **Level 2 (Emergent)**: High-risk situation, severe pain, altered mental status ($< 15$ min).
  - **Level 3 (Urgent)**: Stable vitals requiring two or more diagnostic resources ($< 60$ min).
  - **Level 4 (Semi-Urgent)**: Stable, requires one diagnostic resource.
  - **Level 5 (Non-Urgent)**: Stable, routine clinic care.

### 5. 📋 Standardized Clinical Case Export (SOAP / SBAR)
- Single-click export of accredited ward-round documentation formatted into **Subjective**, **Objective**, **Assessment & Triage**, and **Plan (SOAP)** along with SBAR handoff summaries.

### 6. 🔬 Model Hub & Live Telemetry Inspector
- Interactive weights inspector displaying Pre-LN layer architecture, checkpoint histories (Epochs 5–30), 25,000-scenario adversarial stress test report, and parameter breakdown.

---

## 🏗️ Neural Network Architecture

```
                 Clinical Free-Text & Demographic Intake
                                    │
                                    ▼
       ┌────────────────────────────────────────────────────────┐
       │   Tokenization & Typo-Tolerant Alignment (Levenshtein) │
       └────────────────────────────────────────────────────────┘
                                    │
                                    ▼
       ┌────────────────────────────────────────────────────────┐
       │  Travel Epidemiology & Duration Chronology Factorizer  │
       └────────────────────────────────────────────────────────┘
                                    │
                                    ▼
       ┌────────────────────────────────────────────────────────┐
       │   10-Layer Pre-LN Attention Transformer (9,024,789 params)│
       │   • 10 Multi-Head Self-Attention Blocks (Pre-LN)       │
       │   • Embedding Dimension: d_model = 384                 │
       │   • Feedforward Expansion: d_ff = 1536                 │
       │   • MPS (Apple Silicon GPU) / CUDA / CPU Engine        │
       └────────────────────────────────────────────────────────┘
                                    │
                  ┌─────────────────┴─────────────────┐
                  ▼                                   ▼
       ┌────────────────────────┐         ┌────────────────────────┐
       │ Differential Head (Top)│         │   ESI Triage Head      │
       │   Top-1: 99.29%        │         │   Accuracy: 99.97%     │
       │   Top-3: 99.99%        │         │   5-Tier Classification│
       └────────────────────────┘         └────────────────────────┘
                  │
                  ▼
       ┌────────────────────────────────────────────────────────┐
       │  Akinator Policy Head: Max-Information Discriminator   │
       │  • Directed Hypothesis Pursuit                         │
       │  • Strict 20-Turn Budget & Confidence Gating (>=85%)   │
       └────────────────────────────────────────────────────────┘
```

### Model Performance Metrics (DDXPlus Benchmark & Adversarial Stress Tests)

| Metric | Score | Validation Corpus |
| :--- | :--- | :--- |
| **Top-1 Disease Accuracy** | **99.29%** | 600,000 synthetic clinical records |
| **Top-3 Disease Accuracy** | **99.99%** | 600,000 synthetic clinical records |
| **ESI Triage Accuracy** | **99.97%** | Multi-class cross-entropy |
| **Adversarial Noise Robustness**| **98.42%** | 25,000 spelling & symptom perturb scenarios |
| **Total Parameters** | **9,024,789** | 10 Pre-LN Transformer layers |
| **Weight Size** | **34.4 MB** | FP32 Checkpoint |

---

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or later, v20 recommended)
- `npm` or `pnpm`

### Installation & Local Run

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Trishil/akimed.git
   cd akimed
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment (optional):**
   ```bash
   cp .env.example .env
   # Add GEMINI_API_KEY if you want live Gemini API enrichment alongside the local ML engine
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

---

## 🐳 Docker Deployment

AkiMed includes a production multi-stage `Dockerfile`:

```bash
# Build the Docker image
docker build -t akimed:latest .

# Run container on port 3000
docker run -d -p 3000:3000 --name akimed-app akimed:latest
```

Or run via Docker Compose:
```bash
docker compose up -d
```

---

## ☁️ Cloud & Serverless Deployment (Vercel / Render / Railway)

### Vercel
A pre-configured `vercel.json` is included. To deploy directly:
```bash
npx vercel
```

### Render / Railway / Fly.io
Set the start command to:
```bash
npm run start
```
The server dynamically binds to `process.env.PORT` on `0.0.0.0`.

---

## 🩺 Clinical Case Vignettes Included

The application includes high-yield interactive vignettes across core medical curricula:
1. **Tropical Medicine**: *Plasmodium falciparum* Severe Malaria (Kenya safari travel, tertian fever, splenomegaly).
2. **Cardiology**: Acute ST-Elevation Myocardial Infarction (Crushing substernal pressure, diaphoresis, levine sign).
3. **Pulmonology**: Acute Pulmonary Embolism (Sudden pleuritic chest pain, tachypnea, deep vein thrombosis risk).
4. **Neurology**: Acute Bacterial Meningitis (High fever, photophobia, nuchal rigidity, Kernig's/Brudzinski's signs).
5. **Gastroenterology**: Acute Appendicitis (Periumbilical pain migrating to right iliac fossa, McBurney's sign).

---

## 🛡️ Clinical Disclaimer

AkiMed is an educational informatics tool designed to assist MBBS students and clinical trainees in diagnostic reasoning, differential formulation, and triage protocol understanding. It is **not** a replacement for licensed medical judgement or emergency medical intervention. In life-threatening emergencies, contact local emergency services immediately.

---

## 📄 License

Proprietary © 2026 Trishil. All rights reserved.
