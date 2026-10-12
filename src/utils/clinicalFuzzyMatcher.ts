/**
 * AkiMed Fuzzy Clinical Term & Typo Resolver
 * Uses Damerau-Levenshtein edit distance, phonetic normalization,
 * and clinical synonym expansion to recognize medical symptoms despite typos and misspellings.
 */

export interface RecognizedClinicalConcept {
  evidenceCode: string;
  canonicalName: string;
  matchedWord: string;
  isTypoCorrected: boolean;
  editDistance: number;
  category: string;
}

// Canonical medical concepts with comprehensive synonym and common typo patterns
const MEDICAL_THESAURUS: Array<{
  code: string;
  canonical: string;
  category: string;
  keywords: string[];
}> = [
  {
    code: 'E_53',
    canonical: 'Chest Pain / Angina',
    category: 'Cardiovascular',
    keywords: [
      'chest pain', 'angina', 'retrosternal', 'substernal', 'precordial',
      'chest pressure', 'chest tightness', 'crushing chest', 'heavy chest',
      // Common typos & misspellings
      'cheast', 'cheast pain', 'ches pain', 'chest pane', 'chestpain',
      'substurnal', 'retrosternul', 'anginal', 'angia'
    ]
  },
  {
    code: 'E_57',
    canonical: 'Radiation of Pain to Arm/Jaw/Neck',
    category: 'Cardiovascular',
    keywords: [
      'radiating', 'radiation', 'radiates', 'left arm pain', 'jaw pain', 'neck pain',
      'radiat', 'radiatin', 'radating', 'radation', 'left arm', 'shoulder pain'
    ]
  },
  {
    code: 'E_50',
    canonical: 'Diaphoresis (Profuse Sweating)',
    category: 'Autonomic / Constitutional',
    keywords: [
      'diaphoresis', 'diaphoretic', 'profuse sweating', 'cold sweats', 'sweaty', 'perspiration',
      // Common typos & phonetic spellings
      'diaforetic', 'diaforesis', 'diaferetic', 'sweating', 'sweaty', 'sweting', 'cold sweat'
    ]
  },
  {
    code: 'E_66',
    canonical: 'Dyspnea / Shortness of Breath',
    category: 'Respiratory',
    keywords: [
      'shortness of breath', 'dyspnea', 'breathlessness', 'sob', 'difficulty breathing',
      'air hunger', 'labored breathing', 'gasping', 'winded',
      // Common typos
      'shorness', 'shorness of breath', 'shorness of breth', 'breathlesness',
      'breathless', 'disnea', 'dispnea', 'dyspnoea', 'diff breathing', 'short of breath'
    ]
  },
  {
    code: 'E_91',
    canonical: 'Fever / Pyrexia',
    category: 'Constitutional',
    keywords: [
      'fever', 'pyrexia', 'high temperature', 'chills', 'rigors', 'febrile', 'feverish',
      // Common typos
      'feever', 'fevr', 'feverr', 'temprature', 'high temp', 'chill', 'shivering'
    ]
  },
  {
    code: 'E_89',
    canonical: 'Palpitations / Tachycardia',
    category: 'Cardiovascular',
    keywords: [
      'palpitations', 'racing heart', 'fluttering', 'tachycardia', 'fast heart beat', 'pounding heart',
      // Common typos
      'palpatation', 'palpitation', 'palpataions', 'palpitations', 'tackicardia', 'tacicardia', 'tachicardia', 'fast heart'
    ]
  },
  {
    code: 'E_154',
    canonical: 'Nausea & Vomiting',
    category: 'Gastrointestinal',
    keywords: [
      'nausea', 'vomiting', 'emesis', 'throwing up', 'queasy', 'nauseous',
      // Common typos
      'naucea', 'nauseas', 'naucious', 'vomitting', 'vomit', 'vomiting', 'puking'
    ]
  },
  {
    code: 'E_157',
    canonical: 'Dizziness / Syncope / Lightheadedness',
    category: 'Neurological',
    keywords: [
      'dizziness', 'lightheadedness', 'syncope', 'fainting', 'passed out', 'presyncope', 'blacked out',
      // Common typos
      'dizzy', 'dizzines', 'dizines', 'lightheaded', 'faint', 'faintd', 'pass out'
    ]
  },
  {
    code: 'E_124',
    canonical: 'Headache / Cephalea',
    category: 'Neurological',
    keywords: [
      'headache', 'head ache', 'migraine', 'cranial pain', 'throbbing head',
      // Common typos
      'headche', 'hedache', 'headac', 'migrain', 'throbing head'
    ]
  },
  {
    code: 'E_201',
    canonical: 'Cough',
    category: 'Respiratory',
    keywords: [
      'cough', 'coughing', 'hack', 'productive cough', 'dry cough',
      // Common typos
      'cought', 'couph', 'caugh', 'caughing'
    ]
  },
  {
    code: 'E_45',
    canonical: 'Hemoptysis (Coughing Blood)',
    category: 'Respiratory',
    keywords: [
      'hemoptysis', 'coughing blood', 'blood in sputum', 'bloody sputum',
      // Common typos
      'haemoptysis', 'hemoptosis', 'blood cough', 'bloody cough'
    ]
  },
  {
    code: 'E_220',
    canonical: 'Pleuritic Chest Pain / Wheezing',
    category: 'Respiratory',
    keywords: [
      'pleuritic', 'sharp on breathing', 'pain with deep breath', 'wheezing', 'wheeze', 'stridor',
      // Common typos
      'pleurisy', 'pluritic', 'whezing', 'weezing', 'weeze'
    ]
  },
  {
    code: 'E_113',
    canonical: 'Peripheral Edema / Leg Swelling',
    category: 'Cardiovascular / Renal',
    keywords: [
      'edema', 'leg swelling', 'ankle swelling', 'puffy feet', 'swollen leg', 'calf pain',
      // Common typos
      'oedema', 'sweling', 'swolen', 'swollen ankles'
    ]
  },
  {
    code: 'E_168',
    canonical: 'Abdominal Pain',
    category: 'Gastrointestinal',
    keywords: [
      'abdominal pain', 'stomach ache', 'belly pain', 'cramping', 'epigastric', 'rlq pain',
      // Common typos
      'stomachache', 'abdomnal', 'stomache', 'bellyache', 'apendicitis', 'appendicitis'
    ]
  },
  {
    code: 'E_173',
    canonical: 'Allergic Reaction / Urticaria',
    category: 'Immunological',
    keywords: [
      'hives', 'urticaria', 'rash', 'itching', 'pruritus', 'anaphylaxis', 'lip swelling', 'throat swelling',
      // Common typos
      'anafilaxis', 'anaphylactic', 'rashe', 'itchey', 'allergic'
    ]
  }
];

/**
 * Calculates Damerau-Levenshtein distance between two strings
 * (insertion, deletion, substitution, and transposition of two adjacent characters).
 */
function damerauLevenshtein(a: string, b: string): number {
  const al = a.length;
  const bl = b.length;
  if (al === 0) return bl;
  if (bl === 0) return al;

  const matrix: number[][] = [];
  for (let i = 0; i <= al; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= bl; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= al; i++) {
    for (let j = 1; j <= bl; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,       // deletion
        matrix[i][j - 1] + 1,       // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );

      // Transposition
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        matrix[i][j] = Math.min(matrix[i][j], matrix[i - 2][j - 2] + 1);
      }
    }
  }

  return matrix[al][bl];
}

/**
 * Simplified Metaphone-like phonetic transform for medical syllables
 */
function phoneticSimplify(str: string): string {
  return str
    .toLowerCase()
    .replace(/ph/g, 'f')
    .replace(/oe|ae/g, 'e')
    .replace(/ea/g, 'e')
    .replace(/ck|k|c(?=[aou])/g, 'k')
    .replace(/c(?=[eiy])/g, 's')
    .replace(/rh/g, 'r')
    .replace(/y(?=[aeiou])/g, 'y')
    .replace(/y/g, 'i')
    .replace(/tion/g, 'shn')
    .replace(/ss|s/g, 's')
    .replace(/tt|t/g, 't')
    .replace(/mm|m/g, 'm')
    .replace(/pp|p/g, 'p')
    .replace(/nn|n/g, 'n');
}

/**
 * Extracts clinical concepts from free-form user text using fuzzy matching,
 * typo tolerance, and phonetic normalization.
 */
export function extractClinicalConceptsFuzzy(inputText: string): RecognizedClinicalConcept[] {
  if (!inputText || !inputText.trim()) return [];

  const rawLower = inputText.toLowerCase();
  // Tokenize into clean words and 2-3 word n-grams
  const words = rawLower.replace(/[^\w\s]/g, ' ').split(/\s+/).filter(w => w.length >= 2);
  
  const ngrams: string[] = [...words];
  for (let i = 0; i < words.length - 1; i++) {
    ngrams.push(`${words[i]} ${words[i + 1]}`);
  }
  for (let i = 0; i < words.length - 2; i++) {
    ngrams.push(`${words[i]} ${words[i + 1]} ${words[i + 2]}`);
  }

  const recognized: Map<string, RecognizedClinicalConcept> = new Map();

  for (const item of MEDICAL_THESAURUS) {
    let bestMatch: { word: string; dist: number; isTypo: boolean } | null = null;

    // Check direct and fuzzy matches across all keywords
    for (const kw of item.keywords) {
      const kwPhonetic = phoneticSimplify(kw);

      // 1. Direct Substring Check
      if (rawLower.includes(kw)) {
        bestMatch = { word: kw, dist: 0, isTypo: false };
        break;
      }

      // 2. Fuzzy N-Gram Check
      for (const phrase of ngrams) {
        // Skip comparing wildly different lengths
        if (Math.abs(phrase.length - kw.length) > 3) continue;

        const dist = damerauLevenshtein(phrase, kw);
        const threshold = kw.length <= 4 ? 1 : (kw.length <= 8 ? 2 : 3);

        if (dist <= threshold) {
          if (!bestMatch || dist < bestMatch.dist) {
            bestMatch = { word: phrase, dist, isTypo: dist > 0 };
          }
        } else {
          // 3. Phonetic matching fallback
          const phrasePhonetic = phoneticSimplify(phrase);
          const pDist = damerauLevenshtein(phrasePhonetic, kwPhonetic);
          if (pDist <= 1) {
            if (!bestMatch || pDist < bestMatch.dist) {
              bestMatch = { word: phrase, dist: pDist, isTypo: true };
            }
          }
        }
      }

      if (bestMatch && bestMatch.dist === 0) break;
    }

    if (bestMatch) {
      recognized.set(item.code, {
        evidenceCode: item.code,
        canonicalName: item.canonical,
        matchedWord: bestMatch.word,
        isTypoCorrected: bestMatch.isTypo,
        editDistance: bestMatch.dist,
        category: item.category
      });
    }
  }

  return Array.from(recognized.values());
}

