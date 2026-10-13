export interface VitalParameter {
  mean: number;
  std: number;
  margin: number;
  min: number;
  max: number;
}

export interface DiseaseVitalsProfile {
  hr: VitalParameter;
  sbp: VitalParameter;
  dbp: VitalParameter;
  rr: VitalParameter;
  spo2: VitalParameter;
  temp: VitalParameter;
}

export interface VitalLikelihoodResult {
  multiplier: number;
  deviation: number;
  note?: string;
}

export interface VitalsEliminationEvaluation {
  diseaseId: string;
  diseaseName: string;
  status: "favored" | "compatible" | "eliminated";
  overallMultiplier: number;
  vitalMultipliers: {
    hr: number;
    sbp: number;
    dbp: number;
    rr: number;
    spo2: number;
    temp: number;
  };
  eliminationReasons: string[];
  supportingReasons: string[];
}

/**
 * DISEASE VITALS ONTOLOGY (111 Conditions with Continuous Likelihood Parameters & Clinical Margins)
 * Accessible by both snake_case ID and formal Disease Name.
 */
export const DISEASE_VITALS_ONTOLOGY: Record<string, DiseaseVitalsProfile> = {
  "Acute COPD exacerbation / infection": {
    "hr": {
      "mean": 110,
      "std": 18,
      "margin": 18,
      "min": 70,
      "max": 160
    },
    "sbp": {
      "mean": 125,
      "std": 20,
      "margin": 22,
      "min": 85,
      "max": 175
    },
    "dbp": {
      "mean": 78,
      "std": 12,
      "margin": 15,
      "min": 50,
      "max": 105
    },
    "rr": {
      "mean": 26,
      "std": 6,
      "margin": 4,
      "min": 16,
      "max": 45
    },
    "spo2": {
      "mean": 90,
      "std": 5,
      "margin": 4,
      "min": 75,
      "max": 98
    },
    "temp": {
      "mean": 37.2,
      "std": 0.6,
      "margin": 0.6,
      "min": 36.2,
      "max": 39.5
    }
  },
  "Acute ST-elevation myocardial infarction (STEMI)": {
    "hr": {
      "mean": 100,
      "std": 22,
      "margin": 20,
      "min": 45,
      "max": 180
    },
    "sbp": {
      "mean": 130,
      "std": 30,
      "margin": 25,
      "min": 70,
      "max": 220
    },
    "dbp": {
      "mean": 80,
      "std": 18,
      "margin": 18,
      "min": 40,
      "max": 130
    },
    "rr": {
      "mean": 22,
      "std": 5,
      "margin": 4,
      "min": 14,
      "max": 38
    },
    "spo2": {
      "mean": 94,
      "std": 4,
      "margin": 3,
      "min": 82,
      "max": 100
    },
    "temp": {
      "mean": 37.0,
      "std": 0.4,
      "margin": 0.6,
      "min": 36.2,
      "max": 38.2
    }
  },
  "Acute Stanford Type A aortic dissection": {
    "hr": {
      "mean": 100,
      "std": 22,
      "margin": 20,
      "min": 45,
      "max": 180
    },
    "sbp": {
      "mean": 130,
      "std": 30,
      "margin": 25,
      "min": 70,
      "max": 220
    },
    "dbp": {
      "mean": 80,
      "std": 18,
      "margin": 18,
      "min": 40,
      "max": 130
    },
    "rr": {
      "mean": 22,
      "std": 5,
      "margin": 4,
      "min": 14,
      "max": 38
    },
    "spo2": {
      "mean": 94,
      "std": 4,
      "margin": 3,
      "min": 82,
      "max": 100
    },
    "temp": {
      "mean": 37.0,
      "std": 0.4,
      "margin": 0.6,
      "min": 36.2,
      "max": 38.2
    }
  },
  "Acute appendicitis": {
    "hr": {
      "mean": 92,
      "std": 15,
      "margin": 15,
      "min": 60,
      "max": 140
    },
    "sbp": {
      "mean": 122,
      "std": 18,
      "margin": 20,
      "min": 85,
      "max": 165
    },
    "dbp": {
      "mean": 76,
      "std": 12,
      "margin": 15,
      "min": 50,
      "max": 100
    },
    "rr": {
      "mean": 18,
      "std": 3,
      "margin": 3,
      "min": 12,
      "max": 28
    },
    "spo2": {
      "mean": 98,
      "std": 2,
      "margin": 2,
      "min": 94,
      "max": 100
    },
    "temp": {
      "mean": 37.5,
      "std": 0.7,
      "margin": 0.6,
      "min": 36.4,
      "max": 39.5
    }
  },
  "Acute bacterial meningitis": {
    "hr": {
      "mean": 118,
      "std": 15,
      "margin": 15,
      "min": 85,
      "max": 160
    },
    "sbp": {
      "mean": 115,
      "std": 20,
      "margin": 20,
      "min": 80,
      "max": 165
    },
    "dbp": {
      "mean": 70,
      "std": 14,
      "margin": 15,
      "min": 48,
      "max": 100
    },
    "rr": {
      "mean": 24,
      "std": 4,
      "margin": 4,
      "min": 16,
      "max": 36
    },
    "spo2": {
      "mean": 96,
      "std": 3,
      "margin": 3,
      "min": 90,
      "max": 100
    },
    "temp": {
      "mean": 39.5,
      "std": 0.7,
      "margin": 0.6,
      "min": 38.2,
      "max": 41.5
    }
  },
  "Acute calculous cholecystitis": {
    "hr": {
      "mean": 92,
      "std": 15,
      "margin": 15,
      "min": 60,
      "max": 140
    },
    "sbp": {
      "mean": 122,
      "std": 18,
      "margin": 20,
      "min": 85,
      "max": 165
    },
    "dbp": {
      "mean": 76,
      "std": 12,
      "margin": 15,
      "min": 50,
      "max": 100
    },
    "rr": {
      "mean": 18,
      "std": 3,
      "margin": 3,
      "min": 12,
      "max": 28
    },
    "spo2": {
      "mean": 98,
      "std": 2,
      "margin": 2,
      "min": 94,
      "max": 100
    },
    "temp": {
      "mean": 37.5,
      "std": 0.7,
      "margin": 0.6,
      "min": 36.4,
      "max": 39.5
    }
  },
  "Acute decompensated heart failure": {
    "hr": {
      "mean": 100,
      "std": 22,
      "margin": 20,
      "min": 45,
      "max": 180
    },
    "sbp": {
      "mean": 130,
      "std": 30,
      "margin": 25,
      "min": 70,
      "max": 220
    },
    "dbp": {
      "mean": 80,
      "std": 18,
      "margin": 18,
      "min": 40,
      "max": 130
    },
    "rr": {
      "mean": 22,
      "std": 5,
      "margin": 4,
      "min": 14,
      "max": 38
    },
    "spo2": {
      "mean": 94,
      "std": 4,
      "margin": 3,
      "min": 82,
      "max": 100
    },
    "temp": {
      "mean": 37.0,
      "std": 0.4,
      "margin": 0.6,
      "min": 36.2,
      "max": 38.2
    }
  },
  "Acute diverticulitis": {
    "hr": {
      "mean": 92,
      "std": 15,
      "margin": 15,
      "min": 60,
      "max": 140
    },
    "sbp": {
      "mean": 122,
      "std": 18,
      "margin": 20,
      "min": 85,
      "max": 165
    },
    "dbp": {
      "mean": 76,
      "std": 12,
      "margin": 15,
      "min": 50,
      "max": 100
    },
    "rr": {
      "mean": 18,
      "std": 3,
      "margin": 3,
      "min": 12,
      "max": 28
    },
    "spo2": {
      "mean": 98,
      "std": 2,
      "margin": 2,
      "min": 94,
      "max": 100
    },
    "temp": {
      "mean": 37.5,
      "std": 0.7,
      "margin": 0.6,
      "min": 36.4,
      "max": 39.5
    }
  },
  "Acute dystonic reactions": {
    "hr": {
      "mean": 82,
      "std": 16,
      "margin": 16,
      "min": 50,
      "max": 130
    },
    "sbp": {
      "mean": 135,
      "std": 25,
      "margin": 25,
      "min": 90,
      "max": 210
    },
    "dbp": {
      "mean": 82,
      "std": 15,
      "margin": 18,
      "min": 55,
      "max": 120
    },
    "rr": {
      "mean": 17,
      "std": 3,
      "margin": 3,
      "min": 12,
      "max": 26
    },
    "spo2": {
      "mean": 98,
      "std": 2,
      "margin": 2,
      "min": 93,
      "max": 100
    },
    "temp": {
      "mean": 36.9,
      "std": 0.4,
      "margin": 0.6,
      "min": 36.2,
      "max": 38.0
    }
  },
  "Acute gouty arthritis": {
    "hr": {
      "mean": 86,
      "std": 12,
      "margin": 14,
      "min": 60,
      "max": 120
    },
    "sbp": {
      "mean": 136,
      "std": 16,
      "margin": 18,
      "min": 105,
      "max": 175
    },
    "dbp": {
      "mean": 84,
      "std": 10,
      "margin": 14,
      "min": 65,
      "max": 105
    },
    "rr": {
      "mean": 16,
      "std": 2,
      "margin": 3,
      "min": 12,
      "max": 22
    },
    "spo2": {
      "mean": 99,
      "std": 1,
      "margin": 2,
      "min": 96,
      "max": 100
    },
    "temp": {
      "mean": 37.2,
      "std": 0.5,
      "margin": 0.6,
      "min": 36.4,
      "max": 38.6
    }
  },
  "Acute hypoglycemia": {
    "hr": {
      "mean": 105,
      "std": 20,
      "margin": 18,
      "min": 55,
      "max": 160
    },
    "sbp": {
      "mean": 118,
      "std": 25,
      "margin": 22,
      "min": 75,
      "max": 170
    },
    "dbp": {
      "mean": 72,
      "std": 15,
      "margin": 16,
      "min": 45,
      "max": 105
    },
    "rr": {
      "mean": 22,
      "std": 6,
      "margin": 4,
      "min": 12,
      "max": 40
    },
    "spo2": {
      "mean": 98,
      "std": 2,
      "margin": 2,
      "min": 94,
      "max": 100
    },
    "temp": {
      "mean": 37.0,
      "std": 0.5,
      "margin": 0.6,
      "min": 35.8,
      "max": 38.8
    }
  },
  "Acute ischemic stroke (MCA territory)": {
    "hr": {
      "mean": 82,
      "std": 16,
      "margin": 16,
      "min": 50,
      "max": 130
    },
    "sbp": {
      "mean": 135,
      "std": 25,
      "margin": 25,
      "min": 90,
      "max": 210
    },
    "dbp": {
      "mean": 82,
      "std": 15,
      "margin": 18,
      "min": 55,
      "max": 120
    },
    "rr": {
      "mean": 17,
      "std": 3,
      "margin": 3,
      "min": 12,
      "max": 26
    },
    "spo2": {
      "mean": 98,
      "std": 2,
      "margin": 2,
      "min": 93,
      "max": 100
    },
    "temp": {
      "mean": 36.9,
      "std": 0.4,
      "margin": 0.6,
      "min": 36.2,
      "max": 38.0
    }
  },
  "Acute kidney injury (Prerenal azotemia)": {
    "hr": {
      "mean": 95,
      "std": 18,
      "margin": 18,
      "min": 60,
      "max": 145
    },
    "sbp": {
      "mean": 138,
      "std": 22,
      "margin": 22,
      "min": 90,
      "max": 190
    },
    "dbp": {
      "mean": 85,
      "std": 14,
      "margin": 16,
      "min": 55,
      "max": 115
    },
    "rr": {
      "mean": 18,
      "std": 3,
      "margin": 3,
      "min": 12,
      "max": 28
    },
    "spo2": {
      "mean": 98,
      "std": 2,
      "margin": 2,
      "min": 94,
      "max": 100
    },
    "temp": {
      "mean": 37.2,
      "std": 0.6,
      "margin": 0.6,
      "min": 36.4,
      "max": 39.2
    }
  },
  "Acute laryngitis": {
    "hr": {
      "mean": 90,
      "std": 18,
      "margin": 18,
      "min": 55,
      "max": 145
    },
    "sbp": {
      "mean": 122,
      "std": 20,
      "margin": 22,
      "min": 85,
      "max": 175
    },
    "dbp": {
      "mean": 76,
      "std": 14,
      "margin": 16,
      "min": 50,
      "max": 105
    },
    "rr": {
      "mean": 18,
      "std": 4,
      "margin": 4,
      "min": 12,
      "max": 32
    },
    "spo2": {
      "mean": 97,
      "std": 3,
      "margin": 3,
      "min": 90,
      "max": 100
    },
    "temp": {
      "mean": 37.1,
      "std": 0.5,
      "margin": 0.6,
      "min": 36.2,
      "max": 38.5
    }
  },
  "Acute limb ischemia": {
    "hr": {
      "mean": 100,
      "std": 22,
      "margin": 20,
      "min": 45,
      "max": 180
    },
    "sbp": {
      "mean": 130,
      "std": 30,
      "margin": 25,
      "min": 70,
      "max": 220
    },
    "dbp": {
      "mean": 80,
      "std": 18,
      "margin": 18,
      "min": 40,
      "max": 130
    },
    "rr": {
      "mean": 22,
      "std": 5,
      "margin": 4,
      "min": 14,
      "max": 38
    },
    "spo2": {
      "mean": 94,
      "std": 4,
      "margin": 3,
      "min": 82,
      "max": 100
    },
    "temp": {
      "mean": 37.0,
      "std": 0.4,
      "margin": 0.6,
      "min": 36.2,
      "max": 38.2
    }
  },
  "Acute otitis media": {
    "hr": {
      "mean": 90,
      "std": 18,
      "margin": 18,
      "min": 55,
      "max": 145
    },
    "sbp": {
      "mean": 122,
      "std": 20,
      "margin": 22,
      "min": 85,
      "max": 175
    },
    "dbp": {
      "mean": 76,
      "std": 14,
      "margin": 16,
      "min": 50,
      "max": 105
    },
    "rr": {
      "mean": 18,
      "std": 4,
      "margin": 4,
      "min": 12,
      "max": 32
    },
    "spo2": {
      "mean": 97,
      "std": 3,
      "margin": 3,
      "min": 90,
      "max": 100
    },
    "temp": {
      "mean": 37.1,
      "std": 0.5,
      "margin": 0.6,
      "min": 36.2,
      "max": 38.5
    }
  },
  "Acute pancreatitis": {
    "hr": {
      "mean": 92,
      "std": 15,
      "margin": 15,
      "min": 60,
      "max": 140
    },
    "sbp": {
      "mean": 122,
      "std": 18,
      "margin": 20,
      "min": 85,
      "max": 165
    },
    "dbp": {
      "mean": 76,
      "std": 12,
      "margin": 15,
      "min": 50,
      "max": 100
    },
    "rr": {
      "mean": 18,
      "std": 3,
      "margin": 3,
      "min": 12,
      "max": 28
    },
    "spo2": {
      "mean": 98,
      "std": 2,
      "margin": 2,
      "min": 94,
      "max": 100
    },
    "temp": {
      "mean": 37.5,
      "std": 0.7,
      "margin": 0.6,
      "min": 36.4,
      "max": 39.5
    }
  },
  "Acute pulmonary edema": {
    "hr": {
      "mean": 100,
      "std": 22,
      "margin": 20,
      "min": 45,
      "max": 180
    },
    "sbp": {
      "mean": 130,
      "std": 30,
      "margin": 25,
      "min": 70,
      "max": 220
    },
    "dbp": {
      "mean": 80,
      "std": 18,
      "margin": 18,
      "min": 40,
      "max": 130
    },
    "rr": {
      "mean": 22,
      "std": 5,
      "margin": 4,
      "min": 14,
      "max": 38
    },
    "spo2": {
      "mean": 94,
      "std": 4,
      "margin": 3,
      "min": 82,
      "max": 100
    },
    "temp": {
      "mean": 37.0,
      "std": 0.4,
      "margin": 0.6,
      "min": 36.2,
      "max": 38.2
    }
  },
  "Acute pulmonary embolism": {
    "hr": {
      "mean": 122,
      "std": 15,
      "margin": 15,
      "min": 90,
      "max": 165
    },
    "sbp": {
      "mean": 102,
      "std": 22,
      "margin": 20,
      "min": 68,
      "max": 150
    },
    "dbp": {
      "mean": 65,
      "std": 14,
      "margin": 15,
      "min": 42,
      "max": 95
    },
    "rr": {
      "mean": 28,
      "std": 4,
      "margin": 4,
      "min": 18,
      "max": 42
    },
    "spo2": {
      "mean": 89,
      "std": 4,
      "margin": 4,
      "min": 78,
      "max": 96
    },
    "temp": {
      "mean": 37.4,
      "std": 0.5,
      "margin": 0.6,
      "min": 36.4,
      "max": 38.6
    }
  },
  "Acute pyelonephritis": {
    "hr": {
      "mean": 95,
      "std": 18,
      "margin": 18,
      "min": 60,
      "max": 145
    },
    "sbp": {
      "mean": 138,
      "std": 22,
      "margin": 22,
      "min": 90,
      "max": 190
    },
    "dbp": {
      "mean": 85,
      "std": 14,
      "margin": 16,
      "min": 55,
      "max": 115
    },
    "rr": {
      "mean": 18,
      "std": 3,
      "margin": 3,
      "min": 12,
      "max": 28
    },
    "spo2": {
      "mean": 98,
      "std": 2,
      "margin": 2,
      "min": 94,
      "max": 100
    },
    "temp": {
      "mean": 37.2,
      "std": 0.6,
      "margin": 0.6,
      "min": 36.4,
      "max": 39.2
    }
  },
  "Acute rhinosinusitis": {
    "hr": {
      "mean": 90,
      "std": 18,
      "margin": 18,
      "min": 55,
      "max": 145
    },
    "sbp": {
      "mean": 122,
      "std": 20,
      "margin": 22,
      "min": 85,
      "max": 175
    },
    "dbp": {
      "mean": 76,
      "std": 14,
      "margin": 16,
      "min": 50,
      "max": 105
    },
    "rr": {
      "mean": 18,
      "std": 4,
      "margin": 4,
      "min": 12,
      "max": 32
    },
    "spo2": {
      "mean": 97,
      "std": 3,
      "margin": 3,
      "min": 90,
      "max": 100
    },
    "temp": {
      "mean": 37.1,
      "std": 0.5,
      "margin": 0.6,
      "min": 36.2,
      "max": 38.5
    }
  },
  "Acute viral hepatitis (Hepatitis A/B/C)": {
    "hr": {
      "mean": 105,
      "std": 15,
      "margin": 15,
      "min": 60,
      "max": 160
    },
    "sbp": {
      "mean": 115,
      "std": 18,
      "margin": 20,
      "min": 85,
      "max": 160
    },
    "dbp": {
      "mean": 72,
      "std": 12,
      "margin": 15,
      "min": 50,
      "max": 100
    },
    "rr": {
      "mean": 20,
      "std": 4,
      "margin": 4,
      "min": 12,
      "max": 35
    },
    "spo2": {
      "mean": 97,
      "std": 2,
      "margin": 2,
      "min": 92,
      "max": 100
    },
    "temp": {
      "mean": 38.8,
      "std": 0.8,
      "margin": 0.6,
      "min": 37.5,
      "max": 41.2
    }
  },
  "Allergic sinusitis": {
    "hr": {
      "mean": 90,
      "std": 18,
      "margin": 18,
      "min": 55,
      "max": 145
    },
    "sbp": {
      "mean": 122,
      "std": 20,
      "margin": 22,
      "min": 85,
      "max": 175
    },
    "dbp": {
      "mean": 76,
      "std": 14,
      "margin": 16,
      "min": 50,
      "max": 105
    },
    "rr": {
      "mean": 18,
      "std": 4,
      "margin": 4,
      "min": 12,
      "max": 32
    },
    "spo2": {
      "mean": 97,
      "std": 3,
      "margin": 3,
      "min": 90,
      "max": 100
    },
    "temp": {
      "mean": 37.1,
      "std": 0.5,
      "margin": 0.6,
      "min": 36.2,
      "max": 38.5
    }
  },
  "Anaphylaxis": {
    "hr": {
      "mean": 132,
      "std": 15,
      "margin": 15,
      "min": 90,
      "max": 180
    },
    "sbp": {
      "mean": 78,
      "std": 14,
      "margin": 14,
      "min": 55,
      "max": 105
    },
    "dbp": {
      "mean": 46,
      "std": 10,
      "margin": 10,
      "min": 30,
      "max": 65
    },
    "rr": {
      "mean": 30,
      "std": 5,
      "margin": 4,
      "min": 20,
      "max": 45
    },
    "spo2": {
      "mean": 88,
      "std": 6,
      "margin": 4,
      "min": 75,
      "max": 96
    },
    "temp": {
      "mean": 36.9,
      "std": 0.4,
      "margin": 0.6,
      "min": 36.2,
      "max": 37.8
    }
  },
  "Anemia": {
    "hr": {
      "mean": 100,
      "std": 18,
      "margin": 16,
      "min": 65,
      "max": 150
    },
    "sbp": {
      "mean": 120,
      "std": 20,
      "margin": 20,
      "min": 85,
      "max": 165
    },
    "dbp": {
      "mean": 75,
      "std": 12,
      "margin": 15,
      "min": 50,
      "max": 100
    },
    "rr": {
      "mean": 19,
      "std": 4,
      "margin": 4,
      "min": 12,
      "max": 30
    },
    "spo2": {
      "mean": 97,
      "std": 3,
      "margin": 3,
      "min": 90,
      "max": 100
    },
    "temp": {
      "mean": 37.3,
      "std": 0.6,
      "margin": 0.6,
      "min": 36.4,
      "max": 39.2
    }
  },
  "Atrial fibrillation": {
    "hr": {
      "mean": 100,
      "std": 22,
      "margin": 20,
      "min": 45,
      "max": 180
    },
    "sbp": {
      "mean": 130,
      "std": 30,
      "margin": 25,
      "min": 70,
      "max": 220
    },
    "dbp": {
      "mean": 80,
      "std": 18,
      "margin": 18,
      "min": 40,
      "max": 130
    },
    "rr": {
      "mean": 22,
      "std": 5,
      "margin": 4,
      "min": 14,
      "max": 38
    },
    "spo2": {
      "mean": 94,
      "std": 4,
      "margin": 3,
      "min": 82,
      "max": 100
    },
    "temp": {
      "mean": 37.0,
      "std": 0.4,
      "margin": 0.6,
      "min": 36.2,
      "max": 38.2
    }
  },
  "Bell's palsy (Idiopathic CN VII paralysis)": {
    "hr": {
      "mean": 82,
      "std": 16,
      "margin": 16,
      "min": 50,
      "max": 130
    },
    "sbp": {
      "mean": 135,
      "std": 25,
      "margin": 25,
      "min": 90,
      "max": 210
    },
    "dbp": {
      "mean": 82,
      "std": 15,
      "margin": 18,
      "min": 55,
      "max": 120
    },
    "rr": {
      "mean": 17,
      "std": 3,
      "margin": 3,
      "min": 12,
      "max": 26
    },
    "spo2": {
      "mean": 98,
      "std": 2,
      "margin": 2,
      "min": 93,
      "max": 100
    },
    "temp": {
      "mean": 36.9,
      "std": 0.4,
      "margin": 0.6,
      "min": 36.2,
      "max": 38.0
    }
  },
  "Benign paroxysmal positional vertigo (BPPV)": {
    "hr": {
      "mean": 82,
      "std": 16,
      "margin": 16,
      "min": 50,
      "max": 130
    },
    "sbp": {
      "mean": 135,
      "std": 25,
      "margin": 25,
      "min": 90,
      "max": 210
    },
    "dbp": {
      "mean": 82,
      "std": 15,
      "margin": 18,
      "min": 55,
      "max": 120
    },
    "rr": {
      "mean": 17,
      "std": 3,
      "margin": 3,
      "min": 12,
      "max": 26
    },
    "spo2": {
      "mean": 98,
      "std": 2,
      "margin": 2,
      "min": 93,
      "max": 100
    },
    "temp": {
      "mean": 36.9,
      "std": 0.4,
      "margin": 0.6,
      "min": 36.2,
      "max": 38.0
    }
  },
  "Benign prostatic hyperplasia with acute retention": {
    "hr": {
      "mean": 95,
      "std": 18,
      "margin": 18,
      "min": 60,
      "max": 145
    },
    "sbp": {
      "mean": 138,
      "std": 22,
      "margin": 22,
      "min": 90,
      "max": 190
    },
    "dbp": {
      "mean": 85,
      "std": 14,
      "margin": 16,
      "min": 55,
      "max": 115
    },
    "rr": {
      "mean": 18,
      "std": 3,
      "margin": 3,
      "min": 12,
      "max": 28
    },
    "spo2": {
      "mean": 98,
      "std": 2,
      "margin": 2,
      "min": 94,
      "max": 100
    },
    "temp": {
      "mean": 37.2,
      "std": 0.6,
      "margin": 0.6,
      "min": 36.4,
      "max": 39.2
    }
  },
  "Boerhaave": {
    "hr": {
      "mean": 92,
      "std": 15,
      "margin": 15,
      "min": 60,
      "max": 140
    },
    "sbp": {
      "mean": 122,
      "std": 18,
      "margin": 20,
      "min": 85,
      "max": 165
    },
    "dbp": {
      "mean": 76,
      "std": 12,
      "margin": 15,
      "min": 50,
      "max": 100
    },
    "rr": {
      "mean": 18,
      "std": 3,
      "margin": 3,
      "min": 12,
      "max": 28
    },
    "spo2": {
      "mean": 98,
      "std": 2,
      "margin": 2,
      "min": 94,
      "max": 100
    },
    "temp": {
      "mean": 37.5,
      "std": 0.7,
      "margin": 0.6,
      "min": 36.4,
      "max": 39.5
    }
  },
  "Bronchiectasis": {
    "hr": {
      "mean": 110,
      "std": 18,
      "margin": 18,
      "min": 70,
      "max": 160
    },
    "sbp": {
      "mean": 125,
      "std": 20,
      "margin": 22,
      "min": 85,
      "max": 175
    },
    "dbp": {
      "mean": 78,
      "std": 12,
      "margin": 15,
      "min": 50,
      "max": 105
    },
    "rr": {
      "mean": 26,
      "std": 6,
      "margin": 4,
      "min": 16,
      "max": 45
    },
    "spo2": {
      "mean": 90,
      "std": 5,
      "margin": 4,
      "min": 75,
      "max": 98
    },
    "temp": {
      "mean": 37.2,
      "std": 0.6,
      "margin": 0.6,
      "min": 36.2,
      "max": 39.5
    }
  },
  "Bronchiolitis": {
    "hr": {
      "mean": 110,
      "std": 18,
      "margin": 18,
      "min": 70,
      "max": 160
    },
    "sbp": {
      "mean": 125,
      "std": 20,
      "margin": 22,
      "min": 85,
      "max": 175
    },
    "dbp": {
      "mean": 78,
      "std": 12,
      "margin": 15,
      "min": 50,
      "max": 105
    },
    "rr": {
      "mean": 26,
      "std": 6,
      "margin": 4,
      "min": 16,
      "max": 45
    },
    "spo2": {
      "mean": 90,
      "std": 5,
      "margin": 4,
      "min": 75,
      "max": 98
    },
    "temp": {
      "mean": 37.2,
      "std": 0.6,
      "margin": 0.6,
      "min": 36.2,
      "max": 39.5
    }
  },
  "Bronchitis": {
    "hr": {
      "mean": 110,
      "std": 18,
      "margin": 18,
      "min": 70,
      "max": 160
    },
    "sbp": {
      "mean": 125,
      "std": 20,
      "margin": 22,
      "min": 85,
      "max": 175
    },
    "dbp": {
      "mean": 78,
      "std": 12,
      "margin": 15,
      "min": 50,
      "max": 105
    },
    "rr": {
      "mean": 26,
      "std": 6,
      "margin": 4,
      "min": 16,
      "max": 45
    },
    "spo2": {
      "mean": 90,
      "std": 5,
      "margin": 4,
      "min": 75,
      "max": 98
    },
    "temp": {
      "mean": 37.2,
      "std": 0.6,
      "margin": 0.6,
      "min": 36.2,
      "max": 39.5
    }
  },
  "Bronchospasm / acute asthma exacerbation": {
    "hr": {
      "mean": 110,
      "std": 18,
      "margin": 18,
      "min": 70,
      "max": 160
    },
    "sbp": {
      "mean": 125,
      "std": 20,
      "margin": 22,
      "min": 85,
      "max": 175
    },
    "dbp": {
      "mean": 78,
      "std": 12,
      "margin": 15,
      "min": 50,
      "max": 105
    },
    "rr": {
      "mean": 26,
      "std": 6,
      "margin": 4,
      "min": 16,
      "max": 45
    },
    "spo2": {
      "mean": 90,
      "std": 5,
      "margin": 4,
      "min": 75,
      "max": 98
    },
    "temp": {
      "mean": 37.2,
      "std": 0.6,
      "margin": 0.6,
      "min": 36.2,
      "max": 39.5
    }
  },
  "Cardiac tamponade": {
    "hr": {
      "mean": 100,
      "std": 22,
      "margin": 20,
      "min": 45,
      "max": 180
    },
    "sbp": {
      "mean": 130,
      "std": 30,
      "margin": 25,
      "min": 70,
      "max": 220
    },
    "dbp": {
      "mean": 80,
      "std": 18,
      "margin": 18,
      "min": 40,
      "max": 130
    },
    "rr": {
      "mean": 22,
      "std": 5,
      "margin": 4,
      "min": 14,
      "max": 38
    },
    "spo2": {
      "mean": 94,
      "std": 4,
      "margin": 3,
      "min": 82,
      "max": 100
    },
    "temp": {
      "mean": 37.0,
      "std": 0.4,
      "margin": 0.6,
      "min": 36.2,
      "max": 38.2
    }
  },
  "Celiac disease": {
    "hr": {
      "mean": 92,
      "std": 15,
      "margin": 15,
      "min": 60,
      "max": 140
    },
    "sbp": {
      "mean": 122,
      "std": 18,
      "margin": 20,
      "min": 85,
      "max": 165
    },
    "dbp": {
      "mean": 76,
      "std": 12,
      "margin": 15,
      "min": 50,
      "max": 100
    },
    "rr": {
      "mean": 18,
      "std": 3,
      "margin": 3,
      "min": 12,
      "max": 28
    },
    "spo2": {
      "mean": 98,
      "std": 2,
      "margin": 2,
      "min": 94,
      "max": 100
    },
    "temp": {
      "mean": 37.5,
      "std": 0.7,
      "margin": 0.6,
      "min": 36.4,
      "max": 39.5
    }
  },
  "Cellulitis / Erysipelas": {
    "hr": {
      "mean": 105,
      "std": 15,
      "margin": 15,
      "min": 60,
      "max": 160
    },
    "sbp": {
      "mean": 115,
      "std": 18,
      "margin": 20,
      "min": 85,
      "max": 160
    },
    "dbp": {
      "mean": 72,
      "std": 12,
      "margin": 15,
      "min": 50,
      "max": 100
    },
    "rr": {
      "mean": 20,
      "std": 4,
      "margin": 4,
      "min": 12,
      "max": 35
    },
    "spo2": {
      "mean": 97,
      "std": 2,
      "margin": 2,
      "min": 92,
      "max": 100
    },
    "temp": {
      "mean": 38.8,
      "std": 0.8,
      "margin": 0.6,
      "min": 37.5,
      "max": 41.2
    }
  },
  "Chagas": {
    "hr": {
      "mean": 105,
      "std": 15,
      "margin": 15,
      "min": 60,
      "max": 160
    },
    "sbp": {
      "mean": 115,
      "std": 18,
      "margin": 20,
      "min": 85,
      "max": 160
    },
    "dbp": {
      "mean": 72,
      "std": 12,
      "margin": 15,
      "min": 50,
      "max": 100
    },
    "rr": {
      "mean": 20,
      "std": 4,
      "margin": 4,
      "min": 12,
      "max": 35
    },
    "spo2": {
      "mean": 97,
      "std": 2,
      "margin": 2,
      "min": 92,
      "max": 100
    },
    "temp": {
      "mean": 38.8,
      "std": 0.8,
      "margin": 0.6,
      "min": 37.5,
      "max": 41.2
    }
  },
  "Chronic rhinosinusitis": {
    "hr": {
      "mean": 90,
      "std": 18,
      "margin": 18,
      "min": 55,
      "max": 145
    },
    "sbp": {
      "mean": 122,
      "std": 20,
      "margin": 22,
      "min": 85,
      "max": 175
    },
    "dbp": {
      "mean": 76,
      "std": 14,
      "margin": 16,
      "min": 50,
      "max": 105
    },
    "rr": {
      "mean": 18,
      "std": 4,
      "margin": 4,
      "min": 12,
      "max": 32
    },
    "spo2": {
      "mean": 97,
      "std": 3,
      "margin": 3,
      "min": 90,
      "max": 100
    },
    "temp": {
      "mean": 37.1,
      "std": 0.5,
      "margin": 0.6,
      "min": 36.2,
      "max": 38.5
    }
  },
  "Clostridioides difficile colitis": {
    "hr": {
      "mean": 105,
      "std": 15,
      "margin": 15,
      "min": 60,
      "max": 160
    },
    "sbp": {
      "mean": 115,
      "std": 18,
      "margin": 20,
      "min": 85,
      "max": 160
    },
    "dbp": {
      "mean": 72,
      "std": 12,
      "margin": 15,
      "min": 50,
      "max": 100
    },
    "rr": {
      "mean": 20,
      "std": 4,
      "margin": 4,
      "min": 12,
      "max": 35
    },
    "spo2": {
      "mean": 97,
      "std": 2,
      "margin": 2,
      "min": 92,
      "max": 100
    },
    "temp": {
      "mean": 38.8,
      "std": 0.8,
      "margin": 0.6,
      "min": 37.5,
      "max": 41.2
    }
  },
  "Cluster headache": {
    "hr": {
      "mean": 82,
      "std": 16,
      "margin": 16,
      "min": 50,
      "max": 130
    },
    "sbp": {
      "mean": 135,
      "std": 25,
      "margin": 25,
      "min": 90,
      "max": 210
    },
    "dbp": {
      "mean": 82,
      "std": 15,
      "margin": 18,
      "min": 55,
      "max": 120
    },
    "rr": {
      "mean": 17,
      "std": 3,
      "margin": 3,
      "min": 12,
      "max": 26
    },
    "spo2": {
      "mean": 98,
      "std": 2,
      "margin": 2,
      "min": 93,
      "max": 100
    },
    "temp": {
      "mean": 36.9,
      "std": 0.4,
      "margin": 0.6,
      "min": 36.2,
      "max": 38.0
    }
  },
  "Crohn's disease": {
    "hr": {
      "mean": 92,
      "std": 15,
      "margin": 15,
      "min": 60,
      "max": 140
    },
    "sbp": {
      "mean": 122,
      "std": 18,
      "margin": 20,
      "min": 85,
      "max": 165
    },
    "dbp": {
      "mean": 76,
      "std": 12,
      "margin": 15,
      "min": 50,
      "max": 100
    },
    "rr": {
      "mean": 18,
      "std": 3,
      "margin": 3,
      "min": 12,
      "max": 28
    },
    "spo2": {
      "mean": 98,
      "std": 2,
      "margin": 2,
      "min": 94,
      "max": 100
    },
    "temp": {
      "mean": 37.5,
      "std": 0.7,
      "margin": 0.6,
      "min": 36.4,
      "max": 39.5
    }
  },
  "Croup": {
    "hr": {
      "mean": 105,
      "std": 15,
      "margin": 15,
      "min": 60,
      "max": 160
    },
    "sbp": {
      "mean": 115,
      "std": 18,
      "margin": 20,
      "min": 85,
      "max": 160
    },
    "dbp": {
      "mean": 72,
      "std": 12,
      "margin": 15,
      "min": 50,
      "max": 100
    },
    "rr": {
      "mean": 20,
      "std": 4,
      "margin": 4,
      "min": 12,
      "max": 35
    },
    "spo2": {
      "mean": 97,
      "std": 2,
      "margin": 2,
      "min": 92,
      "max": 100
    },
    "temp": {
      "mean": 38.8,
      "std": 0.8,
      "margin": 0.6,
      "min": 37.5,
      "max": 41.2
    }
  },
  "Decompensated liver cirrhosis / Ascites": {
    "hr": {
      "mean": 92,
      "std": 15,
      "margin": 15,
      "min": 60,
      "max": 140
    },
    "sbp": {
      "mean": 122,
      "std": 18,
      "margin": 20,
      "min": 85,
      "max": 165
    },
    "dbp": {
      "mean": 76,
      "std": 12,
      "margin": 15,
      "min": 50,
      "max": 100
    },
    "rr": {
      "mean": 18,
      "std": 3,
      "margin": 3,
      "min": 12,
      "max": 28
    },
    "spo2": {
      "mean": 98,
      "std": 2,
      "margin": 2,
      "min": 94,
      "max": 100
    },
    "temp": {
      "mean": 37.5,
      "std": 0.7,
      "margin": 0.6,
      "min": 36.4,
      "max": 39.5
    }
  },
  "Deep vein thrombosis (DVT)": {
    "hr": {
      "mean": 100,
      "std": 22,
      "margin": 20,
      "min": 45,
      "max": 180
    },
    "sbp": {
      "mean": 130,
      "std": 30,
      "margin": 25,
      "min": 70,
      "max": 220
    },
    "dbp": {
      "mean": 80,
      "std": 18,
      "margin": 18,
      "min": 40,
      "max": 130
    },
    "rr": {
      "mean": 22,
      "std": 5,
      "margin": 4,
      "min": 14,
      "max": 38
    },
    "spo2": {
      "mean": 94,
      "std": 4,
      "margin": 3,
      "min": 82,
      "max": 100
    },
    "temp": {
      "mean": 37.0,
      "std": 0.4,
      "margin": 0.6,
      "min": 36.2,
      "max": 38.2
    }
  },
  "Dengue fever / Severe dengue": {
    "hr": {
      "mean": 105,
      "std": 15,
      "margin": 15,
      "min": 60,
      "max": 160
    },
    "sbp": {
      "mean": 115,
      "std": 18,
      "margin": 20,
      "min": 85,
      "max": 160
    },
    "dbp": {
      "mean": 72,
      "std": 12,
      "margin": 15,
      "min": 50,
      "max": 100
    },
    "rr": {
      "mean": 20,
      "std": 4,
      "margin": 4,
      "min": 12,
      "max": 35
    },
    "spo2": {
      "mean": 97,
      "std": 2,
      "margin": 2,
      "min": 92,
      "max": 100
    },
    "temp": {
      "mean": 38.8,
      "std": 0.8,
      "margin": 0.6,
      "min": 37.5,
      "max": 41.2
    }
  },
  "Diabetic ketoacidosis (DKA)": {
    "hr": {
      "mean": 120,
      "std": 12,
      "margin": 15,
      "min": 90,
      "max": 155
    },
    "sbp": {
      "mean": 98,
      "std": 15,
      "margin": 18,
      "min": 75,
      "max": 135
    },
    "dbp": {
      "mean": 60,
      "std": 10,
      "margin": 14,
      "min": 45,
      "max": 85
    },
    "rr": {
      "mean": 32,
      "std": 5,
      "margin": 4,
      "min": 22,
      "max": 45
    },
    "spo2": {
      "mean": 98,
      "std": 2,
      "margin": 2,
      "min": 94,
      "max": 100
    },
    "temp": {
      "mean": 37.2,
      "std": 0.6,
      "margin": 0.6,
      "min": 36.2,
      "max": 38.9
    }
  },
  "Ebola": {
    "hr": {
      "mean": 105,
      "std": 15,
      "margin": 15,
      "min": 60,
      "max": 160
    },
    "sbp": {
      "mean": 115,
      "std": 18,
      "margin": 20,
      "min": 85,
      "max": 160
    },
    "dbp": {
      "mean": 72,
      "std": 12,
      "margin": 15,
      "min": 50,
      "max": 100
    },
    "rr": {
      "mean": 20,
      "std": 4,
      "margin": 4,
      "min": 12,
      "max": 35
    },
    "spo2": {
      "mean": 97,
      "std": 2,
      "margin": 2,
      "min": 92,
      "max": 100
    },
    "temp": {
      "mean": 38.8,
      "std": 0.8,
      "margin": 0.6,
      "min": 37.5,
      "max": 41.2
    }
  },
  "Enteric (Typhoid) fever": {
    "hr": {
      "mean": 72,
      "std": 8,
      "margin": 10,
      "min": 55,
      "max": 88
    },
    "sbp": {
      "mean": 110,
      "std": 12,
      "margin": 15,
      "min": 90,
      "max": 135
    },
    "dbp": {
      "mean": 70,
      "std": 10,
      "margin": 12,
      "min": 55,
      "max": 88
    },
    "rr": {
      "mean": 18,
      "std": 2,
      "margin": 3,
      "min": 14,
      "max": 24
    },
    "spo2": {
      "mean": 98,
      "std": 1,
      "margin": 2,
      "min": 95,
      "max": 100
    },
    "temp": {
      "mean": 39.6,
      "std": 0.6,
      "margin": 0.6,
      "min": 38.5,
      "max": 41.2
    }
  },
  "Epiglottitis": {
    "hr": {
      "mean": 105,
      "std": 15,
      "margin": 15,
      "min": 60,
      "max": 160
    },
    "sbp": {
      "mean": 115,
      "std": 18,
      "margin": 20,
      "min": 85,
      "max": 160
    },
    "dbp": {
      "mean": 72,
      "std": 12,
      "margin": 15,
      "min": 50,
      "max": 100
    },
    "rr": {
      "mean": 20,
      "std": 4,
      "margin": 4,
      "min": 12,
      "max": 35
    },
    "spo2": {
      "mean": 97,
      "std": 2,
      "margin": 2,
      "min": 92,
      "max": 100
    },
    "temp": {
      "mean": 38.8,
      "std": 0.8,
      "margin": 0.6,
      "min": 37.5,
      "max": 41.2
    }
  },
  "GERD": {
    "hr": {
      "mean": 92,
      "std": 15,
      "margin": 15,
      "min": 60,
      "max": 140
    },
    "sbp": {
      "mean": 122,
      "std": 18,
      "margin": 20,
      "min": 85,
      "max": 165
    },
    "dbp": {
      "mean": 76,
      "std": 12,
      "margin": 15,
      "min": 50,
      "max": 100
    },
    "rr": {
      "mean": 18,
      "std": 3,
      "margin": 3,
      "min": 12,
      "max": 28
    },
    "spo2": {
      "mean": 98,
      "std": 2,
      "margin": 2,
      "min": 94,
      "max": 100
    },
    "temp": {
      "mean": 37.5,
      "std": 0.7,
      "margin": 0.6,
      "min": 36.4,
      "max": 39.5
    }
  },
  "Generalized tonic-clonic status epilepticus": {
    "hr": {
      "mean": 82,
      "std": 16,
      "margin": 16,
      "min": 50,
      "max": 130
    },
    "sbp": {
      "mean": 135,
      "std": 25,
      "margin": 25,
      "min": 90,
      "max": 210
    },
    "dbp": {
      "mean": 82,
      "std": 15,
      "margin": 18,
      "min": 55,
      "max": 120
    },
    "rr": {
      "mean": 17,
      "std": 3,
      "margin": 3,
      "min": 12,
      "max": 26
    },
    "spo2": {
      "mean": 98,
      "std": 2,
      "margin": 2,
      "min": 93,
      "max": 100
    },
    "temp": {
      "mean": 36.9,
      "std": 0.4,
      "margin": 0.6,
      "min": 36.2,
      "max": 38.0
    }
  },
  "Guillain-Barr\u00e9 syndrome": {
    "hr": {
      "mean": 82,
      "std": 16,
      "margin": 16,
      "min": 50,
      "max": 130
    },
    "sbp": {
      "mean": 135,
      "std": 25,
      "margin": 25,
      "min": 90,
      "max": 210
    },
    "dbp": {
      "mean": 82,
      "std": 15,
      "margin": 18,
      "min": 55,
      "max": 120
    },
    "rr": {
      "mean": 17,
      "std": 3,
      "margin": 3,
      "min": 12,
      "max": 26
    },
    "spo2": {
      "mean": 98,
      "std": 2,
      "margin": 2,
      "min": 93,
      "max": 100
    },
    "temp": {
      "mean": 36.9,
      "std": 0.4,
      "margin": 0.6,
      "min": 36.2,
      "max": 38.0
    }
  },
  "HIV (initial infection)": {
    "hr": {
      "mean": 105,
      "std": 15,
      "margin": 15,
      "min": 60,
      "max": 160
    },
    "sbp": {
      "mean": 115,
      "std": 18,
      "margin": 20,
      "min": 85,
      "max": 160
    },
    "dbp": {
      "mean": 72,
      "std": 12,
      "margin": 15,
      "min": 50,
      "max": 100
    },
    "rr": {
      "mean": 20,
      "std": 4,
      "margin": 4,
      "min": 12,
      "max": 35
    },
    "spo2": {
      "mean": 97,
      "std": 2,
      "margin": 2,
      "min": 92,
      "max": 100
    },
    "temp": {
      "mean": 38.8,
      "std": 0.8,
      "margin": 0.6,
      "min": 37.5,
      "max": 41.2
    }
  },
  "Herpes simplex viral encephalitis": {
    "hr": {
      "mean": 105,
      "std": 15,
      "margin": 15,
      "min": 60,
      "max": 160
    },
    "sbp": {
      "mean": 115,
      "std": 18,
      "margin": 20,
      "min": 85,
      "max": 160
    },
    "dbp": {
      "mean": 72,
      "std": 12,
      "margin": 15,
      "min": 50,
      "max": 100
    },
    "rr": {
      "mean": 20,
      "std": 4,
      "margin": 4,
      "min": 12,
      "max": 35
    },
    "spo2": {
      "mean": 97,
      "std": 2,
      "margin": 2,
      "min": 92,
      "max": 100
    },
    "temp": {
      "mean": 38.8,
      "std": 0.8,
      "margin": 0.6,
      "min": 37.5,
      "max": 41.2
    }
  },
  "Herpes zoster (Shingles)": {
    "hr": {
      "mean": 105,
      "std": 15,
      "margin": 15,
      "min": 60,
      "max": 160
    },
    "sbp": {
      "mean": 115,
      "std": 18,
      "margin": 20,
      "min": 85,
      "max": 160
    },
    "dbp": {
      "mean": 72,
      "std": 12,
      "margin": 15,
      "min": 50,
      "max": 100
    },
    "rr": {
      "mean": 20,
      "std": 4,
      "margin": 4,
      "min": 12,
      "max": 35
    },
    "spo2": {
      "mean": 97,
      "std": 2,
      "margin": 2,
      "min": 92,
      "max": 100
    },
    "temp": {
      "mean": 38.8,
      "std": 0.8,
      "margin": 0.6,
      "min": 37.5,
      "max": 41.2
    }
  },
  "Hyperosmolar hyperglycemic state (HHS)": {
    "hr": {
      "mean": 105,
      "std": 20,
      "margin": 18,
      "min": 55,
      "max": 160
    },
    "sbp": {
      "mean": 118,
      "std": 25,
      "margin": 22,
      "min": 75,
      "max": 170
    },
    "dbp": {
      "mean": 72,
      "std": 15,
      "margin": 16,
      "min": 45,
      "max": 105
    },
    "rr": {
      "mean": 22,
      "std": 6,
      "margin": 4,
      "min": 12,
      "max": 40
    },
    "spo2": {
      "mean": 98,
      "std": 2,
      "margin": 2,
      "min": 94,
      "max": 100
    },
    "temp": {
      "mean": 37.0,
      "std": 0.5,
      "margin": 0.6,
      "min": 35.8,
      "max": 38.8
    }
  },
  "Hypertensive emergency": {
    "hr": {
      "mean": 98,
      "std": 16,
      "margin": 16,
      "min": 65,
      "max": 140
    },
    "sbp": {
      "mean": 195,
      "std": 18,
      "margin": 20,
      "min": 175,
      "max": 250
    },
    "dbp": {
      "mean": 122,
      "std": 12,
      "margin": 14,
      "min": 110,
      "max": 155
    },
    "rr": {
      "mean": 20,
      "std": 4,
      "margin": 4,
      "min": 12,
      "max": 32
    },
    "spo2": {
      "mean": 97,
      "std": 2,
      "margin": 2,
      "min": 92,
      "max": 100
    },
    "temp": {
      "mean": 36.9,
      "std": 0.4,
      "margin": 0.6,
      "min": 36.2,
      "max": 37.8
    }
  },
  "Hyperthyroidism / Graves disease": {
    "hr": {
      "mean": 105,
      "std": 20,
      "margin": 18,
      "min": 55,
      "max": 160
    },
    "sbp": {
      "mean": 118,
      "std": 25,
      "margin": 22,
      "min": 75,
      "max": 170
    },
    "dbp": {
      "mean": 72,
      "std": 15,
      "margin": 16,
      "min": 45,
      "max": 105
    },
    "rr": {
      "mean": 22,
      "std": 6,
      "margin": 4,
      "min": 12,
      "max": 40
    },
    "spo2": {
      "mean": 98,
      "std": 2,
      "margin": 2,
      "min": 94,
      "max": 100
    },
    "temp": {
      "mean": 37.0,
      "std": 0.5,
      "margin": 0.6,
      "min": 35.8,
      "max": 38.8
    }
  },
  "Hypothyroidism / Hashimoto thyroiditis": {
    "hr": {
      "mean": 105,
      "std": 20,
      "margin": 18,
      "min": 55,
      "max": 160
    },
    "sbp": {
      "mean": 118,
      "std": 25,
      "margin": 22,
      "min": 75,
      "max": 170
    },
    "dbp": {
      "mean": 72,
      "std": 15,
      "margin": 16,
      "min": 45,
      "max": 105
    },
    "rr": {
      "mean": 22,
      "std": 6,
      "margin": 4,
      "min": 12,
      "max": 40
    },
    "spo2": {
      "mean": 98,
      "std": 2,
      "margin": 2,
      "min": 94,
      "max": 100
    },
    "temp": {
      "mean": 37.0,
      "std": 0.5,
      "margin": 0.6,
      "min": 35.8,
      "max": 38.8
    }
  },
  "Immune thrombocytopenic purpura (ITP)": {
    "hr": {
      "mean": 100,
      "std": 18,
      "margin": 16,
      "min": 65,
      "max": 150
    },
    "sbp": {
      "mean": 120,
      "std": 20,
      "margin": 20,
      "min": 85,
      "max": 165
    },
    "dbp": {
      "mean": 75,
      "std": 12,
      "margin": 15,
      "min": 50,
      "max": 100
    },
    "rr": {
      "mean": 19,
      "std": 4,
      "margin": 4,
      "min": 12,
      "max": 30
    },
    "spo2": {
      "mean": 97,
      "std": 3,
      "margin": 3,
      "min": 90,
      "max": 100
    },
    "temp": {
      "mean": 37.3,
      "std": 0.6,
      "margin": 0.6,
      "min": 36.4,
      "max": 39.2
    }
  },
  "Infectious mononucleosis (EBV)": {
    "hr": {
      "mean": 105,
      "std": 15,
      "margin": 15,
      "min": 60,
      "max": 160
    },
    "sbp": {
      "mean": 115,
      "std": 18,
      "margin": 20,
      "min": 85,
      "max": 160
    },
    "dbp": {
      "mean": 72,
      "std": 12,
      "margin": 15,
      "min": 50,
      "max": 100
    },
    "rr": {
      "mean": 20,
      "std": 4,
      "margin": 4,
      "min": 12,
      "max": 35
    },
    "spo2": {
      "mean": 97,
      "std": 2,
      "margin": 2,
      "min": 92,
      "max": 100
    },
    "temp": {
      "mean": 38.8,
      "std": 0.8,
      "margin": 0.6,
      "min": 37.5,
      "max": 41.2
    }
  },
  "Infective endocarditis": {
    "hr": {
      "mean": 105,
      "std": 15,
      "margin": 15,
      "min": 60,
      "max": 160
    },
    "sbp": {
      "mean": 115,
      "std": 18,
      "margin": 20,
      "min": 85,
      "max": 160
    },
    "dbp": {
      "mean": 72,
      "std": 12,
      "margin": 15,
      "min": 50,
      "max": 100
    },
    "rr": {
      "mean": 20,
      "std": 4,
      "margin": 4,
      "min": 12,
      "max": 35
    },
    "spo2": {
      "mean": 97,
      "std": 2,
      "margin": 2,
      "min": 92,
      "max": 100
    },
    "temp": {
      "mean": 38.8,
      "std": 0.8,
      "margin": 0.6,
      "min": 37.5,
      "max": 41.2
    }
  },
  "Influenza": {
    "hr": {
      "mean": 105,
      "std": 15,
      "margin": 15,
      "min": 60,
      "max": 160
    },
    "sbp": {
      "mean": 115,
      "std": 18,
      "margin": 20,
      "min": 85,
      "max": 160
    },
    "dbp": {
      "mean": 72,
      "std": 12,
      "margin": 15,
      "min": 50,
      "max": 100
    },
    "rr": {
      "mean": 20,
      "std": 4,
      "margin": 4,
      "min": 12,
      "max": 35
    },
    "spo2": {
      "mean": 97,
      "std": 2,
      "margin": 2,
      "min": 92,
      "max": 100
    },
    "temp": {
      "mean": 38.8,
      "std": 0.8,
      "margin": 0.6,
      "min": 37.5,
      "max": 41.2
    }
  },
  "Inguinal hernia": {
    "hr": {
      "mean": 92,
      "std": 15,
      "margin": 15,
      "min": 60,
      "max": 140
    },
    "sbp": {
      "mean": 122,
      "std": 18,
      "margin": 20,
      "min": 85,
      "max": 165
    },
    "dbp": {
      "mean": 76,
      "std": 12,
      "margin": 15,
      "min": 50,
      "max": 100
    },
    "rr": {
      "mean": 18,
      "std": 3,
      "margin": 3,
      "min": 12,
      "max": 28
    },
    "spo2": {
      "mean": 98,
      "std": 2,
      "margin": 2,
      "min": 94,
      "max": 100
    },
    "temp": {
      "mean": 37.5,
      "std": 0.7,
      "margin": 0.6,
      "min": 36.4,
      "max": 39.5
    }
  },
  "Iron deficiency anemia": {
    "hr": {
      "mean": 100,
      "std": 18,
      "margin": 16,
      "min": 65,
      "max": 150
    },
    "sbp": {
      "mean": 120,
      "std": 20,
      "margin": 20,
      "min": 85,
      "max": 165
    },
    "dbp": {
      "mean": 75,
      "std": 12,
      "margin": 15,
      "min": 50,
      "max": 100
    },
    "rr": {
      "mean": 19,
      "std": 4,
      "margin": 4,
      "min": 12,
      "max": 30
    },
    "spo2": {
      "mean": 97,
      "std": 3,
      "margin": 3,
      "min": 90,
      "max": 100
    },
    "temp": {
      "mean": 37.3,
      "std": 0.6,
      "margin": 0.6,
      "min": 36.4,
      "max": 39.2
    }
  },
  "Larygospasm": {
    "hr": {
      "mean": 110,
      "std": 18,
      "margin": 18,
      "min": 70,
      "max": 160
    },
    "sbp": {
      "mean": 125,
      "std": 20,
      "margin": 22,
      "min": 85,
      "max": 175
    },
    "dbp": {
      "mean": 78,
      "std": 12,
      "margin": 15,
      "min": 50,
      "max": 105
    },
    "rr": {
      "mean": 26,
      "std": 6,
      "margin": 4,
      "min": 16,
      "max": 45
    },
    "spo2": {
      "mean": 90,
      "std": 5,
      "margin": 4,
      "min": 75,
      "max": 98
    },
    "temp": {
      "mean": 37.2,
      "std": 0.6,
      "margin": 0.6,
      "min": 36.2,
      "max": 39.5
    }
  },
  "Leptospirosis (Weil's disease)": {
    "hr": {
      "mean": 105,
      "std": 15,
      "margin": 15,
      "min": 60,
      "max": 160
    },
    "sbp": {
      "mean": 115,
      "std": 18,
      "margin": 20,
      "min": 85,
      "max": 160
    },
    "dbp": {
      "mean": 72,
      "std": 12,
      "margin": 15,
      "min": 50,
      "max": 100
    },
    "rr": {
      "mean": 20,
      "std": 4,
      "margin": 4,
      "min": 12,
      "max": 35
    },
    "spo2": {
      "mean": 97,
      "std": 2,
      "margin": 2,
      "min": 92,
      "max": 100
    },
    "temp": {
      "mean": 38.8,
      "std": 0.8,
      "margin": 0.6,
      "min": 37.5,
      "max": 41.2
    }
  },
  "Localized edema": {
    "hr": {
      "mean": 90,
      "std": 18,
      "margin": 18,
      "min": 55,
      "max": 145
    },
    "sbp": {
      "mean": 122,
      "std": 20,
      "margin": 22,
      "min": 85,
      "max": 175
    },
    "dbp": {
      "mean": 76,
      "std": 14,
      "margin": 16,
      "min": 50,
      "max": 105
    },
    "rr": {
      "mean": 18,
      "std": 4,
      "margin": 4,
      "min": 12,
      "max": 32
    },
    "spo2": {
      "mean": 97,
      "std": 3,
      "margin": 3,
      "min": 90,
      "max": 100
    },
    "temp": {
      "mean": 37.1,
      "std": 0.5,
      "margin": 0.6,
      "min": 36.2,
      "max": 38.5
    }
  },
  "Lyme disease (Borrelia burgdorferi)": {
    "hr": {
      "mean": 105,
      "std": 15,
      "margin": 15,
      "min": 60,
      "max": 160
    },
    "sbp": {
      "mean": 115,
      "std": 18,
      "margin": 20,
      "min": 85,
      "max": 160
    },
    "dbp": {
      "mean": 72,
      "std": 12,
      "margin": 15,
      "min": 50,
      "max": 100
    },
    "rr": {
      "mean": 20,
      "std": 4,
      "margin": 4,
      "min": 12,
      "max": 35
    },
    "spo2": {
      "mean": 97,
      "std": 2,
      "margin": 2,
      "min": 92,
      "max": 100
    },
    "temp": {
      "mean": 38.8,
      "std": 0.8,
      "margin": 0.6,
      "min": 37.5,
      "max": 41.2
    }
  },
  "Migraine headache": {
    "hr": {
      "mean": 82,
      "std": 16,
      "margin": 16,
      "min": 50,
      "max": 130
    },
    "sbp": {
      "mean": 135,
      "std": 25,
      "margin": 25,
      "min": 90,
      "max": 210
    },
    "dbp": {
      "mean": 82,
      "std": 15,
      "margin": 18,
      "min": 55,
      "max": 120
    },
    "rr": {
      "mean": 17,
      "std": 3,
      "margin": 3,
      "min": 12,
      "max": 26
    },
    "spo2": {
      "mean": 98,
      "std": 2,
      "margin": 2,
      "min": 93,
      "max": 100
    },
    "temp": {
      "mean": 36.9,
      "std": 0.4,
      "margin": 0.6,
      "min": 36.2,
      "max": 38.0
    }
  },
  "Multiple myeloma": {
    "hr": {
      "mean": 100,
      "std": 18,
      "margin": 16,
      "min": 65,
      "max": 150
    },
    "sbp": {
      "mean": 120,
      "std": 20,
      "margin": 20,
      "min": 85,
      "max": 165
    },
    "dbp": {
      "mean": 75,
      "std": 12,
      "margin": 15,
      "min": 50,
      "max": 100
    },
    "rr": {
      "mean": 19,
      "std": 4,
      "margin": 4,
      "min": 12,
      "max": 30
    },
    "spo2": {
      "mean": 97,
      "std": 3,
      "margin": 3,
      "min": 90,
      "max": 100
    },
    "temp": {
      "mean": 37.3,
      "std": 0.6,
      "margin": 0.6,
      "min": 36.4,
      "max": 39.2
    }
  },
  "Multiple sclerosis": {
    "hr": {
      "mean": 82,
      "std": 16,
      "margin": 16,
      "min": 50,
      "max": 130
    },
    "sbp": {
      "mean": 135,
      "std": 25,
      "margin": 25,
      "min": 90,
      "max": 210
    },
    "dbp": {
      "mean": 82,
      "std": 15,
      "margin": 18,
      "min": 55,
      "max": 120
    },
    "rr": {
      "mean": 17,
      "std": 3,
      "margin": 3,
      "min": 12,
      "max": 26
    },
    "spo2": {
      "mean": 98,
      "std": 2,
      "margin": 2,
      "min": 93,
      "max": 100
    },
    "temp": {
      "mean": 36.9,
      "std": 0.4,
      "margin": 0.6,
      "min": 36.2,
      "max": 38.0
    }
  },
  "Myasthenia gravis": {
    "hr": {
      "mean": 82,
      "std": 16,
      "margin": 16,
      "min": 50,
      "max": 130
    },
    "sbp": {
      "mean": 135,
      "std": 25,
      "margin": 25,
      "min": 90,
      "max": 210
    },
    "dbp": {
      "mean": 82,
      "std": 15,
      "margin": 18,
      "min": 55,
      "max": 120
    },
    "rr": {
      "mean": 17,
      "std": 3,
      "margin": 3,
      "min": 12,
      "max": 26
    },
    "spo2": {
      "mean": 98,
      "std": 2,
      "margin": 2,
      "min": 93,
      "max": 100
    },
    "temp": {
      "mean": 36.9,
      "std": 0.4,
      "margin": 0.6,
      "min": 36.2,
      "max": 38.0
    }
  },
  "Myocarditis": {
    "hr": {
      "mean": 100,
      "std": 22,
      "margin": 20,
      "min": 45,
      "max": 180
    },
    "sbp": {
      "mean": 130,
      "std": 30,
      "margin": 25,
      "min": 70,
      "max": 220
    },
    "dbp": {
      "mean": 80,
      "std": 18,
      "margin": 18,
      "min": 40,
      "max": 130
    },
    "rr": {
      "mean": 22,
      "std": 5,
      "margin": 4,
      "min": 14,
      "max": 38
    },
    "spo2": {
      "mean": 94,
      "std": 4,
      "margin": 3,
      "min": 82,
      "max": 100
    },
    "temp": {
      "mean": 37.0,
      "std": 0.4,
      "margin": 0.6,
      "min": 36.2,
      "max": 38.2
    }
  },
  "Nephrolithiasis (Renal colic)": {
    "hr": {
      "mean": 98,
      "std": 15,
      "margin": 15,
      "min": 65,
      "max": 140
    },
    "sbp": {
      "mean": 146,
      "std": 18,
      "margin": 20,
      "min": 110,
      "max": 185
    },
    "dbp": {
      "mean": 88,
      "std": 12,
      "margin": 14,
      "min": 65,
      "max": 115
    },
    "rr": {
      "mean": 19,
      "std": 3,
      "margin": 3,
      "min": 14,
      "max": 28
    },
    "spo2": {
      "mean": 99,
      "std": 1,
      "margin": 2,
      "min": 96,
      "max": 100
    },
    "temp": {
      "mean": 36.8,
      "std": 0.4,
      "margin": 0.5,
      "min": 36.2,
      "max": 37.8
    }
  },
  "Ovarian torsion": {
    "hr": {
      "mean": 102,
      "std": 20,
      "margin": 18,
      "min": 60,
      "max": 155
    },
    "sbp": {
      "mean": 110,
      "std": 28,
      "margin": 25,
      "min": 65,
      "max": 195
    },
    "dbp": {
      "mean": 68,
      "std": 18,
      "margin": 18,
      "min": 40,
      "max": 125
    },
    "rr": {
      "mean": 20,
      "std": 4,
      "margin": 4,
      "min": 12,
      "max": 32
    },
    "spo2": {
      "mean": 98,
      "std": 2,
      "margin": 2,
      "min": 93,
      "max": 100
    },
    "temp": {
      "mean": 37.1,
      "std": 0.5,
      "margin": 0.6,
      "min": 36.2,
      "max": 38.6
    }
  },
  "PSVT": {
    "hr": {
      "mean": 100,
      "std": 22,
      "margin": 20,
      "min": 45,
      "max": 180
    },
    "sbp": {
      "mean": 130,
      "std": 30,
      "margin": 25,
      "min": 70,
      "max": 220
    },
    "dbp": {
      "mean": 80,
      "std": 18,
      "margin": 18,
      "min": 40,
      "max": 130
    },
    "rr": {
      "mean": 22,
      "std": 5,
      "margin": 4,
      "min": 14,
      "max": 38
    },
    "spo2": {
      "mean": 94,
      "std": 4,
      "margin": 3,
      "min": 82,
      "max": 100
    },
    "temp": {
      "mean": 37.0,
      "std": 0.4,
      "margin": 0.6,
      "min": 36.2,
      "max": 38.2
    }
  },
  "Pancreatic neoplasm": {
    "hr": {
      "mean": 92,
      "std": 15,
      "margin": 15,
      "min": 60,
      "max": 140
    },
    "sbp": {
      "mean": 122,
      "std": 18,
      "margin": 20,
      "min": 85,
      "max": 165
    },
    "dbp": {
      "mean": 76,
      "std": 12,
      "margin": 15,
      "min": 50,
      "max": 100
    },
    "rr": {
      "mean": 18,
      "std": 3,
      "margin": 3,
      "min": 12,
      "max": 28
    },
    "spo2": {
      "mean": 98,
      "std": 2,
      "margin": 2,
      "min": 94,
      "max": 100
    },
    "temp": {
      "mean": 37.5,
      "std": 0.7,
      "margin": 0.6,
      "min": 36.4,
      "max": 39.5
    }
  },
  "Panic attack": {
    "hr": {
      "mean": 90,
      "std": 18,
      "margin": 18,
      "min": 55,
      "max": 145
    },
    "sbp": {
      "mean": 122,
      "std": 20,
      "margin": 22,
      "min": 85,
      "max": 175
    },
    "dbp": {
      "mean": 76,
      "std": 14,
      "margin": 16,
      "min": 50,
      "max": 105
    },
    "rr": {
      "mean": 18,
      "std": 4,
      "margin": 4,
      "min": 12,
      "max": 32
    },
    "spo2": {
      "mean": 97,
      "std": 3,
      "margin": 3,
      "min": 90,
      "max": 100
    },
    "temp": {
      "mean": 37.1,
      "std": 0.5,
      "margin": 0.6,
      "min": 36.2,
      "max": 38.5
    }
  },
  "Parkinson's disease": {
    "hr": {
      "mean": 82,
      "std": 16,
      "margin": 16,
      "min": 50,
      "max": 130
    },
    "sbp": {
      "mean": 135,
      "std": 25,
      "margin": 25,
      "min": 90,
      "max": 210
    },
    "dbp": {
      "mean": 82,
      "std": 15,
      "margin": 18,
      "min": 55,
      "max": 120
    },
    "rr": {
      "mean": 17,
      "std": 3,
      "margin": 3,
      "min": 12,
      "max": 26
    },
    "spo2": {
      "mean": 98,
      "std": 2,
      "margin": 2,
      "min": 93,
      "max": 100
    },
    "temp": {
      "mean": 36.9,
      "std": 0.4,
      "margin": 0.6,
      "min": 36.2,
      "max": 38.0
    }
  },
  "Pelvic inflammatory disease (PID)": {
    "hr": {
      "mean": 102,
      "std": 20,
      "margin": 18,
      "min": 60,
      "max": 155
    },
    "sbp": {
      "mean": 110,
      "std": 28,
      "margin": 25,
      "min": 65,
      "max": 195
    },
    "dbp": {
      "mean": 68,
      "std": 18,
      "margin": 18,
      "min": 40,
      "max": 125
    },
    "rr": {
      "mean": 20,
      "std": 4,
      "margin": 4,
      "min": 12,
      "max": 32
    },
    "spo2": {
      "mean": 98,
      "std": 2,
      "margin": 2,
      "min": 93,
      "max": 100
    },
    "temp": {
      "mean": 37.1,
      "std": 0.5,
      "margin": 0.6,
      "min": 36.2,
      "max": 38.6
    }
  },
  "Perforated peptic ulcer disease": {
    "hr": {
      "mean": 92,
      "std": 15,
      "margin": 15,
      "min": 60,
      "max": 140
    },
    "sbp": {
      "mean": 122,
      "std": 18,
      "margin": 20,
      "min": 85,
      "max": 165
    },
    "dbp": {
      "mean": 76,
      "std": 12,
      "margin": 15,
      "min": 50,
      "max": 100
    },
    "rr": {
      "mean": 18,
      "std": 3,
      "margin": 3,
      "min": 12,
      "max": 28
    },
    "spo2": {
      "mean": 98,
      "std": 2,
      "margin": 2,
      "min": 94,
      "max": 100
    },
    "temp": {
      "mean": 37.5,
      "std": 0.7,
      "margin": 0.6,
      "min": 36.4,
      "max": 39.5
    }
  },
  "Pericarditis": {
    "hr": {
      "mean": 100,
      "std": 22,
      "margin": 20,
      "min": 45,
      "max": 180
    },
    "sbp": {
      "mean": 130,
      "std": 30,
      "margin": 25,
      "min": 70,
      "max": 220
    },
    "dbp": {
      "mean": 80,
      "std": 18,
      "margin": 18,
      "min": 40,
      "max": 130
    },
    "rr": {
      "mean": 22,
      "std": 5,
      "margin": 4,
      "min": 14,
      "max": 38
    },
    "spo2": {
      "mean": 94,
      "std": 4,
      "margin": 3,
      "min": 82,
      "max": 100
    },
    "temp": {
      "mean": 37.0,
      "std": 0.4,
      "margin": 0.6,
      "min": 36.2,
      "max": 38.2
    }
  },
  "Plasmodium falciparum malaria": {
    "hr": {
      "mean": 115,
      "std": 15,
      "margin": 15,
      "min": 80,
      "max": 155
    },
    "sbp": {
      "mean": 105,
      "std": 16,
      "margin": 18,
      "min": 80,
      "max": 140
    },
    "dbp": {
      "mean": 65,
      "std": 12,
      "margin": 14,
      "min": 48,
      "max": 90
    },
    "rr": {
      "mean": 22,
      "std": 4,
      "margin": 4,
      "min": 16,
      "max": 34
    },
    "spo2": {
      "mean": 97,
      "std": 2,
      "margin": 2,
      "min": 92,
      "max": 100
    },
    "temp": {
      "mean": 39.8,
      "std": 0.8,
      "margin": 0.7,
      "min": 38.0,
      "max": 41.6
    }
  },
  "Pneumonia": {
    "hr": {
      "mean": 110,
      "std": 18,
      "margin": 18,
      "min": 70,
      "max": 160
    },
    "sbp": {
      "mean": 125,
      "std": 20,
      "margin": 22,
      "min": 85,
      "max": 175
    },
    "dbp": {
      "mean": 78,
      "std": 12,
      "margin": 15,
      "min": 50,
      "max": 105
    },
    "rr": {
      "mean": 26,
      "std": 6,
      "margin": 4,
      "min": 16,
      "max": 45
    },
    "spo2": {
      "mean": 90,
      "std": 5,
      "margin": 4,
      "min": 75,
      "max": 98
    },
    "temp": {
      "mean": 37.2,
      "std": 0.6,
      "margin": 0.6,
      "min": 36.2,
      "max": 39.5
    }
  },
  "Possible NSTEMI / STEMI": {
    "hr": {
      "mean": 100,
      "std": 22,
      "margin": 20,
      "min": 45,
      "max": 180
    },
    "sbp": {
      "mean": 130,
      "std": 30,
      "margin": 25,
      "min": 70,
      "max": 220
    },
    "dbp": {
      "mean": 80,
      "std": 18,
      "margin": 18,
      "min": 40,
      "max": 130
    },
    "rr": {
      "mean": 22,
      "std": 5,
      "margin": 4,
      "min": 14,
      "max": 38
    },
    "spo2": {
      "mean": 94,
      "std": 4,
      "margin": 3,
      "min": 82,
      "max": 100
    },
    "temp": {
      "mean": 37.0,
      "std": 0.4,
      "margin": 0.6,
      "min": 36.2,
      "max": 38.2
    }
  },
  "Preeclampsia with severe features": {
    "hr": {
      "mean": 92,
      "std": 12,
      "margin": 14,
      "min": 68,
      "max": 125
    },
    "sbp": {
      "mean": 178,
      "std": 14,
      "margin": 15,
      "min": 155,
      "max": 220
    },
    "dbp": {
      "mean": 114,
      "std": 10,
      "margin": 12,
      "min": 100,
      "max": 140
    },
    "rr": {
      "mean": 18,
      "std": 3,
      "margin": 3,
      "min": 12,
      "max": 26
    },
    "spo2": {
      "mean": 98,
      "std": 2,
      "margin": 2,
      "min": 94,
      "max": 100
    },
    "temp": {
      "mean": 36.8,
      "std": 0.4,
      "margin": 0.6,
      "min": 36.2,
      "max": 37.8
    }
  },
  "Primary adrenal insufficiency (Addisonian crisis)": {
    "hr": {
      "mean": 105,
      "std": 20,
      "margin": 18,
      "min": 55,
      "max": 160
    },
    "sbp": {
      "mean": 118,
      "std": 25,
      "margin": 22,
      "min": 75,
      "max": 170
    },
    "dbp": {
      "mean": 72,
      "std": 15,
      "margin": 16,
      "min": 45,
      "max": 105
    },
    "rr": {
      "mean": 22,
      "std": 6,
      "margin": 4,
      "min": 12,
      "max": 40
    },
    "spo2": {
      "mean": 98,
      "std": 2,
      "margin": 2,
      "min": 94,
      "max": 100
    },
    "temp": {
      "mean": 37.0,
      "std": 0.5,
      "margin": 0.6,
      "min": 35.8,
      "max": 38.8
    }
  },
  "Pulmonary embolism": {
    "hr": {
      "mean": 120,
      "std": 15,
      "margin": 15,
      "min": 90,
      "max": 165
    },
    "sbp": {
      "mean": 105,
      "std": 22,
      "margin": 20,
      "min": 70,
      "max": 150
    },
    "dbp": {
      "mean": 66,
      "std": 14,
      "margin": 15,
      "min": 45,
      "max": 95
    },
    "rr": {
      "mean": 28,
      "std": 4,
      "margin": 4,
      "min": 18,
      "max": 40
    },
    "spo2": {
      "mean": 90,
      "std": 4,
      "margin": 4,
      "min": 80,
      "max": 96
    },
    "temp": {
      "mean": 37.3,
      "std": 0.5,
      "margin": 0.6,
      "min": 36.4,
      "max": 38.5
    }
  },
  "Pulmonary neoplasm": {
    "hr": {
      "mean": 110,
      "std": 18,
      "margin": 18,
      "min": 70,
      "max": 160
    },
    "sbp": {
      "mean": 125,
      "std": 20,
      "margin": 22,
      "min": 85,
      "max": 175
    },
    "dbp": {
      "mean": 78,
      "std": 12,
      "margin": 15,
      "min": 50,
      "max": 105
    },
    "rr": {
      "mean": 26,
      "std": 6,
      "margin": 4,
      "min": 16,
      "max": 45
    },
    "spo2": {
      "mean": 90,
      "std": 5,
      "margin": 4,
      "min": 75,
      "max": 98
    },
    "temp": {
      "mean": 37.2,
      "std": 0.6,
      "margin": 0.6,
      "min": 36.2,
      "max": 39.5
    }
  },
  "Rheumatoid arthritis": {
    "hr": {
      "mean": 85,
      "std": 14,
      "margin": 15,
      "min": 60,
      "max": 130
    },
    "sbp": {
      "mean": 128,
      "std": 18,
      "margin": 20,
      "min": 95,
      "max": 170
    },
    "dbp": {
      "mean": 80,
      "std": 12,
      "margin": 15,
      "min": 60,
      "max": 105
    },
    "rr": {
      "mean": 16,
      "std": 3,
      "margin": 3,
      "min": 12,
      "max": 24
    },
    "spo2": {
      "mean": 98,
      "std": 2,
      "margin": 2,
      "min": 94,
      "max": 100
    },
    "temp": {
      "mean": 37.2,
      "std": 0.5,
      "margin": 0.6,
      "min": 36.4,
      "max": 38.8
    }
  },
  "Ruptured ectopic pregnancy": {
    "hr": {
      "mean": 126,
      "std": 16,
      "margin": 15,
      "min": 88,
      "max": 165
    },
    "sbp": {
      "mean": 78,
      "std": 14,
      "margin": 14,
      "min": 55,
      "max": 105
    },
    "dbp": {
      "mean": 48,
      "std": 10,
      "margin": 12,
      "min": 32,
      "max": 68
    },
    "rr": {
      "mean": 24,
      "std": 4,
      "margin": 4,
      "min": 16,
      "max": 36
    },
    "spo2": {
      "mean": 97,
      "std": 2,
      "margin": 2,
      "min": 92,
      "max": 100
    },
    "temp": {
      "mean": 36.9,
      "std": 0.4,
      "margin": 0.6,
      "min": 36.2,
      "max": 37.8
    }
  },
  "SLE": {
    "hr": {
      "mean": 85,
      "std": 14,
      "margin": 15,
      "min": 60,
      "max": 130
    },
    "sbp": {
      "mean": 128,
      "std": 18,
      "margin": 20,
      "min": 95,
      "max": 170
    },
    "dbp": {
      "mean": 80,
      "std": 12,
      "margin": 15,
      "min": 60,
      "max": 105
    },
    "rr": {
      "mean": 16,
      "std": 3,
      "margin": 3,
      "min": 12,
      "max": 24
    },
    "spo2": {
      "mean": 98,
      "std": 2,
      "margin": 2,
      "min": 94,
      "max": 100
    },
    "temp": {
      "mean": 37.2,
      "std": 0.5,
      "margin": 0.6,
      "min": 36.4,
      "max": 38.8
    }
  },
  "Sarcoidosis": {
    "hr": {
      "mean": 110,
      "std": 18,
      "margin": 18,
      "min": 70,
      "max": 160
    },
    "sbp": {
      "mean": 125,
      "std": 20,
      "margin": 22,
      "min": 85,
      "max": 175
    },
    "dbp": {
      "mean": 78,
      "std": 12,
      "margin": 15,
      "min": 50,
      "max": 105
    },
    "rr": {
      "mean": 26,
      "std": 6,
      "margin": 4,
      "min": 16,
      "max": 45
    },
    "spo2": {
      "mean": 90,
      "std": 5,
      "margin": 4,
      "min": 75,
      "max": 98
    },
    "temp": {
      "mean": 37.2,
      "std": 0.6,
      "margin": 0.6,
      "min": 36.2,
      "max": 39.5
    }
  },
  "Scombroid food poisoning": {
    "hr": {
      "mean": 90,
      "std": 18,
      "margin": 18,
      "min": 55,
      "max": 145
    },
    "sbp": {
      "mean": 122,
      "std": 20,
      "margin": 22,
      "min": 85,
      "max": 175
    },
    "dbp": {
      "mean": 76,
      "std": 14,
      "margin": 16,
      "min": 50,
      "max": 105
    },
    "rr": {
      "mean": 18,
      "std": 4,
      "margin": 4,
      "min": 12,
      "max": 32
    },
    "spo2": {
      "mean": 97,
      "std": 3,
      "margin": 3,
      "min": 90,
      "max": 100
    },
    "temp": {
      "mean": 37.1,
      "std": 0.5,
      "margin": 0.6,
      "min": 36.2,
      "max": 38.5
    }
  },
  "Septic arthritis": {
    "hr": {
      "mean": 85,
      "std": 14,
      "margin": 15,
      "min": 60,
      "max": 130
    },
    "sbp": {
      "mean": 128,
      "std": 18,
      "margin": 20,
      "min": 95,
      "max": 170
    },
    "dbp": {
      "mean": 80,
      "std": 12,
      "margin": 15,
      "min": 60,
      "max": 105
    },
    "rr": {
      "mean": 16,
      "std": 3,
      "margin": 3,
      "min": 12,
      "max": 24
    },
    "spo2": {
      "mean": 98,
      "std": 2,
      "margin": 2,
      "min": 94,
      "max": 100
    },
    "temp": {
      "mean": 37.2,
      "std": 0.5,
      "margin": 0.6,
      "min": 36.4,
      "max": 38.8
    }
  },
  "Severe sepsis / Septic shock": {
    "hr": {
      "mean": 128,
      "std": 14,
      "margin": 15,
      "min": 95,
      "max": 175
    },
    "sbp": {
      "mean": 82,
      "std": 12,
      "margin": 12,
      "min": 60,
      "max": 105
    },
    "dbp": {
      "mean": 48,
      "std": 10,
      "margin": 10,
      "min": 35,
      "max": 65
    },
    "rr": {
      "mean": 28,
      "std": 4,
      "margin": 4,
      "min": 20,
      "max": 44
    },
    "spo2": {
      "mean": 92,
      "std": 4,
      "margin": 3,
      "min": 82,
      "max": 97
    },
    "temp": {
      "mean": 39.2,
      "std": 0.8,
      "margin": 0.7,
      "min": 35.5,
      "max": 41.5
    }
  },
  "Sickle cell vaso-occlusive crisis": {
    "hr": {
      "mean": 100,
      "std": 18,
      "margin": 16,
      "min": 65,
      "max": 150
    },
    "sbp": {
      "mean": 120,
      "std": 20,
      "margin": 20,
      "min": 85,
      "max": 165
    },
    "dbp": {
      "mean": 75,
      "std": 12,
      "margin": 15,
      "min": 50,
      "max": 100
    },
    "rr": {
      "mean": 19,
      "std": 4,
      "margin": 4,
      "min": 12,
      "max": 30
    },
    "spo2": {
      "mean": 97,
      "std": 3,
      "margin": 3,
      "min": 90,
      "max": 100
    },
    "temp": {
      "mean": 37.3,
      "std": 0.6,
      "margin": 0.6,
      "min": 36.4,
      "max": 39.2
    }
  },
  "Spontaneous pneumothorax": {
    "hr": {
      "mean": 118,
      "std": 16,
      "margin": 16,
      "min": 85,
      "max": 160
    },
    "sbp": {
      "mean": 105,
      "std": 22,
      "margin": 20,
      "min": 70,
      "max": 150
    },
    "dbp": {
      "mean": 68,
      "std": 14,
      "margin": 15,
      "min": 45,
      "max": 95
    },
    "rr": {
      "mean": 30,
      "std": 5,
      "margin": 4,
      "min": 20,
      "max": 44
    },
    "spo2": {
      "mean": 87,
      "std": 5,
      "margin": 4,
      "min": 76,
      "max": 96
    },
    "temp": {
      "mean": 36.9,
      "std": 0.4,
      "margin": 0.6,
      "min": 36.2,
      "max": 37.8
    }
  },
  "Spontaneous rib fracture": {
    "hr": {
      "mean": 110,
      "std": 18,
      "margin": 18,
      "min": 70,
      "max": 160
    },
    "sbp": {
      "mean": 125,
      "std": 20,
      "margin": 22,
      "min": 85,
      "max": 175
    },
    "dbp": {
      "mean": 78,
      "std": 12,
      "margin": 15,
      "min": 50,
      "max": 105
    },
    "rr": {
      "mean": 26,
      "std": 6,
      "margin": 4,
      "min": 16,
      "max": 45
    },
    "spo2": {
      "mean": 90,
      "std": 5,
      "margin": 4,
      "min": 75,
      "max": 98
    },
    "temp": {
      "mean": 37.2,
      "std": 0.6,
      "margin": 0.6,
      "min": 36.2,
      "max": 39.5
    }
  },
  "Spontaneous subarachnoid hemorrhage (SAH)": {
    "hr": {
      "mean": 82,
      "std": 16,
      "margin": 16,
      "min": 50,
      "max": 130
    },
    "sbp": {
      "mean": 135,
      "std": 25,
      "margin": 25,
      "min": 90,
      "max": 210
    },
    "dbp": {
      "mean": 82,
      "std": 15,
      "margin": 18,
      "min": 55,
      "max": 120
    },
    "rr": {
      "mean": 17,
      "std": 3,
      "margin": 3,
      "min": 12,
      "max": 26
    },
    "spo2": {
      "mean": 98,
      "std": 2,
      "margin": 2,
      "min": 93,
      "max": 100
    },
    "temp": {
      "mean": 36.9,
      "std": 0.4,
      "margin": 0.6,
      "min": 36.2,
      "max": 38.0
    }
  },
  "Stable angina": {
    "hr": {
      "mean": 100,
      "std": 22,
      "margin": 20,
      "min": 45,
      "max": 180
    },
    "sbp": {
      "mean": 130,
      "std": 30,
      "margin": 25,
      "min": 70,
      "max": 220
    },
    "dbp": {
      "mean": 80,
      "std": 18,
      "margin": 18,
      "min": 40,
      "max": 130
    },
    "rr": {
      "mean": 22,
      "std": 5,
      "margin": 4,
      "min": 14,
      "max": 38
    },
    "spo2": {
      "mean": 94,
      "std": 4,
      "margin": 3,
      "min": 82,
      "max": 100
    },
    "temp": {
      "mean": 37.0,
      "std": 0.4,
      "margin": 0.6,
      "min": 36.2,
      "max": 38.2
    }
  },
  "Testicular torsion": {
    "hr": {
      "mean": 95,
      "std": 18,
      "margin": 18,
      "min": 60,
      "max": 145
    },
    "sbp": {
      "mean": 138,
      "std": 22,
      "margin": 22,
      "min": 90,
      "max": 190
    },
    "dbp": {
      "mean": 85,
      "std": 14,
      "margin": 16,
      "min": 55,
      "max": 115
    },
    "rr": {
      "mean": 18,
      "std": 3,
      "margin": 3,
      "min": 12,
      "max": 28
    },
    "spo2": {
      "mean": 98,
      "std": 2,
      "margin": 2,
      "min": 94,
      "max": 100
    },
    "temp": {
      "mean": 37.2,
      "std": 0.6,
      "margin": 0.6,
      "min": 36.4,
      "max": 39.2
    }
  },
  "Trigeminal neuralgia": {
    "hr": {
      "mean": 82,
      "std": 16,
      "margin": 16,
      "min": 50,
      "max": 130
    },
    "sbp": {
      "mean": 135,
      "std": 25,
      "margin": 25,
      "min": 90,
      "max": 210
    },
    "dbp": {
      "mean": 82,
      "std": 15,
      "margin": 18,
      "min": 55,
      "max": 120
    },
    "rr": {
      "mean": 17,
      "std": 3,
      "margin": 3,
      "min": 12,
      "max": 26
    },
    "spo2": {
      "mean": 98,
      "std": 2,
      "margin": 2,
      "min": 93,
      "max": 100
    },
    "temp": {
      "mean": 36.9,
      "std": 0.4,
      "margin": 0.6,
      "min": 36.2,
      "max": 38.0
    }
  },
  "Tuberculosis": {
    "hr": {
      "mean": 105,
      "std": 15,
      "margin": 15,
      "min": 60,
      "max": 160
    },
    "sbp": {
      "mean": 115,
      "std": 18,
      "margin": 20,
      "min": 85,
      "max": 160
    },
    "dbp": {
      "mean": 72,
      "std": 12,
      "margin": 15,
      "min": 50,
      "max": 100
    },
    "rr": {
      "mean": 20,
      "std": 4,
      "margin": 4,
      "min": 12,
      "max": 35
    },
    "spo2": {
      "mean": 97,
      "std": 2,
      "margin": 2,
      "min": 92,
      "max": 100
    },
    "temp": {
      "mean": 38.8,
      "std": 0.8,
      "margin": 0.6,
      "min": 37.5,
      "max": 41.2
    }
  },
  "URTI": {
    "hr": {
      "mean": 105,
      "std": 15,
      "margin": 15,
      "min": 60,
      "max": 160
    },
    "sbp": {
      "mean": 115,
      "std": 18,
      "margin": 20,
      "min": 85,
      "max": 160
    },
    "dbp": {
      "mean": 72,
      "std": 12,
      "margin": 15,
      "min": 50,
      "max": 100
    },
    "rr": {
      "mean": 20,
      "std": 4,
      "margin": 4,
      "min": 12,
      "max": 35
    },
    "spo2": {
      "mean": 97,
      "std": 2,
      "margin": 2,
      "min": 92,
      "max": 100
    },
    "temp": {
      "mean": 38.8,
      "std": 0.8,
      "margin": 0.6,
      "min": 37.5,
      "max": 41.2
    }
  },
  "Ulcerative colitis (Acute severe flare)": {
    "hr": {
      "mean": 92,
      "std": 15,
      "margin": 15,
      "min": 60,
      "max": 140
    },
    "sbp": {
      "mean": 122,
      "std": 18,
      "margin": 20,
      "min": 85,
      "max": 165
    },
    "dbp": {
      "mean": 76,
      "std": 12,
      "margin": 15,
      "min": 50,
      "max": 100
    },
    "rr": {
      "mean": 18,
      "std": 3,
      "margin": 3,
      "min": 12,
      "max": 28
    },
    "spo2": {
      "mean": 98,
      "std": 2,
      "margin": 2,
      "min": 94,
      "max": 100
    },
    "temp": {
      "mean": 37.5,
      "std": 0.7,
      "margin": 0.6,
      "min": 36.4,
      "max": 39.5
    }
  },
  "Unstable angina": {
    "hr": {
      "mean": 100,
      "std": 22,
      "margin": 20,
      "min": 45,
      "max": 180
    },
    "sbp": {
      "mean": 130,
      "std": 30,
      "margin": 25,
      "min": 70,
      "max": 220
    },
    "dbp": {
      "mean": 80,
      "std": 18,
      "margin": 18,
      "min": 40,
      "max": 130
    },
    "rr": {
      "mean": 22,
      "std": 5,
      "margin": 4,
      "min": 14,
      "max": 38
    },
    "spo2": {
      "mean": 94,
      "std": 4,
      "margin": 3,
      "min": 82,
      "max": 100
    },
    "temp": {
      "mean": 37.0,
      "std": 0.4,
      "margin": 0.6,
      "min": 36.2,
      "max": 38.2
    }
  },
  "Viral pharyngitis": {
    "hr": {
      "mean": 105,
      "std": 15,
      "margin": 15,
      "min": 60,
      "max": 160
    },
    "sbp": {
      "mean": 115,
      "std": 18,
      "margin": 20,
      "min": 85,
      "max": 160
    },
    "dbp": {
      "mean": 72,
      "std": 12,
      "margin": 15,
      "min": 50,
      "max": 100
    },
    "rr": {
      "mean": 20,
      "std": 4,
      "margin": 4,
      "min": 12,
      "max": 35
    },
    "spo2": {
      "mean": 97,
      "std": 2,
      "margin": 2,
      "min": 92,
      "max": 100
    },
    "temp": {
      "mean": 38.8,
      "std": 0.8,
      "margin": 0.6,
      "min": 37.5,
      "max": 41.2
    }
  },
  "Whooping cough": {
    "hr": {
      "mean": 105,
      "std": 15,
      "margin": 15,
      "min": 60,
      "max": 160
    },
    "sbp": {
      "mean": 115,
      "std": 18,
      "margin": 20,
      "min": 85,
      "max": 160
    },
    "dbp": {
      "mean": 72,
      "std": 12,
      "margin": 15,
      "min": 50,
      "max": 100
    },
    "rr": {
      "mean": 20,
      "std": 4,
      "margin": 4,
      "min": 12,
      "max": 35
    },
    "spo2": {
      "mean": 97,
      "std": 2,
      "margin": 2,
      "min": 92,
      "max": 100
    },
    "temp": {
      "mean": 38.8,
      "std": 0.8,
      "margin": 0.6,
      "min": 37.5,
      "max": 41.2
    }
  },
  "acute_gout": {
    "hr": {
      "mean": 86,
      "std": 12,
      "margin": 14,
      "min": 60,
      "max": 120
    },
    "sbp": {
      "mean": 136,
      "std": 16,
      "margin": 18,
      "min": 105,
      "max": 175
    },
    "dbp": {
      "mean": 84,
      "std": 10,
      "margin": 14,
      "min": 65,
      "max": 105
    },
    "rr": {
      "mean": 16,
      "std": 2,
      "margin": 3,
      "min": 12,
      "max": 22
    },
    "spo2": {
      "mean": 99,
      "std": 1,
      "margin": 2,
      "min": 96,
      "max": 100
    },
    "temp": {
      "mean": 37.2,
      "std": 0.5,
      "margin": 0.6,
      "min": 36.4,
      "max": 38.6
    }
  },
  "acute_heart_failure": {
    "hr": {
      "mean": 100,
      "std": 22,
      "margin": 20,
      "min": 45,
      "max": 180
    },
    "sbp": {
      "mean": 130,
      "std": 30,
      "margin": 25,
      "min": 70,
      "max": 220
    },
    "dbp": {
      "mean": 80,
      "std": 18,
      "margin": 18,
      "min": 40,
      "max": 130
    },
    "rr": {
      "mean": 22,
      "std": 5,
      "margin": 4,
      "min": 14,
      "max": 38
    },
    "spo2": {
      "mean": 94,
      "std": 4,
      "margin": 3,
      "min": 82,
      "max": 100
    },
    "temp": {
      "mean": 37.0,
      "std": 0.4,
      "margin": 0.6,
      "min": 36.2,
      "max": 38.2
    }
  },
  "acute_hypoglycemia": {
    "hr": {
      "mean": 105,
      "std": 20,
      "margin": 18,
      "min": 55,
      "max": 160
    },
    "sbp": {
      "mean": 118,
      "std": 25,
      "margin": 22,
      "min": 75,
      "max": 170
    },
    "dbp": {
      "mean": 72,
      "std": 15,
      "margin": 16,
      "min": 45,
      "max": 105
    },
    "rr": {
      "mean": 22,
      "std": 6,
      "margin": 4,
      "min": 12,
      "max": 40
    },
    "spo2": {
      "mean": 98,
      "std": 2,
      "margin": 2,
      "min": 94,
      "max": 100
    },
    "temp": {
      "mean": 37.0,
      "std": 0.5,
      "margin": 0.6,
      "min": 35.8,
      "max": 38.8
    }
  },
  "acute_ischemic_stroke": {
    "hr": {
      "mean": 82,
      "std": 16,
      "margin": 16,
      "min": 50,
      "max": 130
    },
    "sbp": {
      "mean": 135,
      "std": 25,
      "margin": 25,
      "min": 90,
      "max": 210
    },
    "dbp": {
      "mean": 82,
      "std": 15,
      "margin": 18,
      "min": 55,
      "max": 120
    },
    "rr": {
      "mean": 17,
      "std": 3,
      "margin": 3,
      "min": 12,
      "max": 26
    },
    "spo2": {
      "mean": 98,
      "std": 2,
      "margin": 2,
      "min": 93,
      "max": 100
    },
    "temp": {
      "mean": 36.9,
      "std": 0.4,
      "margin": 0.6,
      "min": 36.2,
      "max": 38.0
    }
  },
  "acute_limb_ischemia": {
    "hr": {
      "mean": 100,
      "std": 22,
      "margin": 20,
      "min": 45,
      "max": 180
    },
    "sbp": {
      "mean": 130,
      "std": 30,
      "margin": 25,
      "min": 70,
      "max": 220
    },
    "dbp": {
      "mean": 80,
      "std": 18,
      "margin": 18,
      "min": 40,
      "max": 130
    },
    "rr": {
      "mean": 22,
      "std": 5,
      "margin": 4,
      "min": 14,
      "max": 38
    },
    "spo2": {
      "mean": 94,
      "std": 4,
      "margin": 3,
      "min": 82,
      "max": 100
    },
    "temp": {
      "mean": 37.0,
      "std": 0.4,
      "margin": 0.6,
      "min": 36.2,
      "max": 38.2
    }
  },
  "acute_pulmonary_edema": {
    "hr": {
      "mean": 100,
      "std": 22,
      "margin": 20,
      "min": 45,
      "max": 180
    },
    "sbp": {
      "mean": 130,
      "std": 30,
      "margin": 25,
      "min": 70,
      "max": 220
    },
    "dbp": {
      "mean": 80,
      "std": 18,
      "margin": 18,
      "min": 40,
      "max": 130
    },
    "rr": {
      "mean": 22,
      "std": 5,
      "margin": 4,
      "min": 14,
      "max": 38
    },
    "spo2": {
      "mean": 94,
      "std": 4,
      "margin": 3,
      "min": 82,
      "max": 100
    },
    "temp": {
      "mean": 37.0,
      "std": 0.4,
      "margin": 0.6,
      "min": 36.2,
      "max": 38.2
    }
  },
  "acute_pyelonephritis": {
    "hr": {
      "mean": 95,
      "std": 18,
      "margin": 18,
      "min": 60,
      "max": 145
    },
    "sbp": {
      "mean": 138,
      "std": 22,
      "margin": 22,
      "min": 90,
      "max": 190
    },
    "dbp": {
      "mean": 85,
      "std": 14,
      "margin": 16,
      "min": 55,
      "max": 115
    },
    "rr": {
      "mean": 18,
      "std": 3,
      "margin": 3,
      "min": 12,
      "max": 28
    },
    "spo2": {
      "mean": 98,
      "std": 2,
      "margin": 2,
      "min": 94,
      "max": 100
    },
    "temp": {
      "mean": 37.2,
      "std": 0.6,
      "margin": 0.6,
      "min": 36.4,
      "max": 39.2
    }
  },
  "acute_viral_hepatitis": {
    "hr": {
      "mean": 105,
      "std": 15,
      "margin": 15,
      "min": 60,
      "max": 160
    },
    "sbp": {
      "mean": 115,
      "std": 18,
      "margin": 20,
      "min": 85,
      "max": 160
    },
    "dbp": {
      "mean": 72,
      "std": 12,
      "margin": 15,
      "min": 50,
      "max": 100
    },
    "rr": {
      "mean": 20,
      "std": 4,
      "margin": 4,
      "min": 12,
      "max": 35
    },
    "spo2": {
      "mean": 97,
      "std": 2,
      "margin": 2,
      "min": 92,
      "max": 100
    },
    "temp": {
      "mean": 38.8,
      "std": 0.8,
      "margin": 0.6,
      "min": 37.5,
      "max": 41.2
    }
  },
  "addisonian_crisis": {
    "hr": {
      "mean": 105,
      "std": 20,
      "margin": 18,
      "min": 55,
      "max": 160
    },
    "sbp": {
      "mean": 118,
      "std": 25,
      "margin": 22,
      "min": 75,
      "max": 170
    },
    "dbp": {
      "mean": 72,
      "std": 15,
      "margin": 16,
      "min": 45,
      "max": 105
    },
    "rr": {
      "mean": 22,
      "std": 6,
      "margin": 4,
      "min": 12,
      "max": 40
    },
    "spo2": {
      "mean": 98,
      "std": 2,
      "margin": 2,
      "min": 94,
      "max": 100
    },
    "temp": {
      "mean": 37.0,
      "std": 0.5,
      "margin": 0.6,
      "min": 35.8,
      "max": 38.8
    }
  },
  "allergic_sinusitis": {
    "hr": {
      "mean": 90,
      "std": 18,
      "margin": 18,
      "min": 55,
      "max": 145
    },
    "sbp": {
      "mean": 122,
      "std": 20,
      "margin": 22,
      "min": 85,
      "max": 175
    },
    "dbp": {
      "mean": 76,
      "std": 14,
      "margin": 16,
      "min": 50,
      "max": 105
    },
    "rr": {
      "mean": 18,
      "std": 4,
      "margin": 4,
      "min": 12,
      "max": 32
    },
    "spo2": {
      "mean": 97,
      "std": 3,
      "margin": 3,
      "min": 90,
      "max": 100
    },
    "temp": {
      "mean": 37.1,
      "std": 0.5,
      "margin": 0.6,
      "min": 36.2,
      "max": 38.5
    }
  },
  "anaphylaxis": {
    "hr": {
      "mean": 132,
      "std": 15,
      "margin": 15,
      "min": 90,
      "max": 180
    },
    "sbp": {
      "mean": 78,
      "std": 14,
      "margin": 14,
      "min": 55,
      "max": 105
    },
    "dbp": {
      "mean": 46,
      "std": 10,
      "margin": 10,
      "min": 30,
      "max": 65
    },
    "rr": {
      "mean": 30,
      "std": 5,
      "margin": 4,
      "min": 20,
      "max": 45
    },
    "spo2": {
      "mean": 88,
      "std": 6,
      "margin": 4,
      "min": 75,
      "max": 96
    },
    "temp": {
      "mean": 36.9,
      "std": 0.4,
      "margin": 0.6,
      "min": 36.2,
      "max": 37.8
    }
  },
  "anemia": {
    "hr": {
      "mean": 100,
      "std": 18,
      "margin": 16,
      "min": 65,
      "max": 150
    },
    "sbp": {
      "mean": 120,
      "std": 20,
      "margin": 20,
      "min": 85,
      "max": 165
    },
    "dbp": {
      "mean": 75,
      "std": 12,
      "margin": 15,
      "min": 50,
      "max": 100
    },
    "rr": {
      "mean": 19,
      "std": 4,
      "margin": 4,
      "min": 12,
      "max": 30
    },
    "spo2": {
      "mean": 97,
      "std": 3,
      "margin": 3,
      "min": 90,
      "max": 100
    },
    "temp": {
      "mean": 37.3,
      "std": 0.6,
      "margin": 0.6,
      "min": 36.4,
      "max": 39.2
    }
  },
  "aortic_dissection": {
    "hr": {
      "mean": 100,
      "std": 22,
      "margin": 20,
      "min": 45,
      "max": 180
    },
    "sbp": {
      "mean": 130,
      "std": 30,
      "margin": 25,
      "min": 70,
      "max": 220
    },
    "dbp": {
      "mean": 80,
      "std": 18,
      "margin": 18,
      "min": 40,
      "max": 130
    },
    "rr": {
      "mean": 22,
      "std": 5,
      "margin": 4,
      "min": 14,
      "max": 38
    },
    "spo2": {
      "mean": 94,
      "std": 4,
      "margin": 3,
      "min": 82,
      "max": 100
    },
    "temp": {
      "mean": 37.0,
      "std": 0.4,
      "margin": 0.6,
      "min": 36.2,
      "max": 38.2
    }
  },
  "appendicitis": {
    "hr": {
      "mean": 92,
      "std": 15,
      "margin": 15,
      "min": 60,
      "max": 140
    },
    "sbp": {
      "mean": 122,
      "std": 18,
      "margin": 20,
      "min": 85,
      "max": 165
    },
    "dbp": {
      "mean": 76,
      "std": 12,
      "margin": 15,
      "min": 50,
      "max": 100
    },
    "rr": {
      "mean": 18,
      "std": 3,
      "margin": 3,
      "min": 12,
      "max": 28
    },
    "spo2": {
      "mean": 98,
      "std": 2,
      "margin": 2,
      "min": 94,
      "max": 100
    },
    "temp": {
      "mean": 37.5,
      "std": 0.7,
      "margin": 0.6,
      "min": 36.4,
      "max": 39.5
    }
  },
  "asthma_exacerbation": {
    "hr": {
      "mean": 110,
      "std": 18,
      "margin": 18,
      "min": 70,
      "max": 160
    },
    "sbp": {
      "mean": 125,
      "std": 20,
      "margin": 22,
      "min": 85,
      "max": 175
    },
    "dbp": {
      "mean": 78,
      "std": 12,
      "margin": 15,
      "min": 50,
      "max": 105
    },
    "rr": {
      "mean": 26,
      "std": 6,
      "margin": 4,
      "min": 16,
      "max": 45
    },
    "spo2": {
      "mean": 90,
      "std": 5,
      "margin": 4,
      "min": 75,
      "max": 98
    },
    "temp": {
      "mean": 37.2,
      "std": 0.6,
      "margin": 0.6,
      "min": 36.2,
      "max": 39.5
    }
  },
  "atrial_fibrillation": {
    "hr": {
      "mean": 100,
      "std": 22,
      "margin": 20,
      "min": 45,
      "max": 180
    },
    "sbp": {
      "mean": 130,
      "std": 30,
      "margin": 25,
      "min": 70,
      "max": 220
    },
    "dbp": {
      "mean": 80,
      "std": 18,
      "margin": 18,
      "min": 40,
      "max": 130
    },
    "rr": {
      "mean": 22,
      "std": 5,
      "margin": 4,
      "min": 14,
      "max": 38
    },
    "spo2": {
      "mean": 94,
      "std": 4,
      "margin": 3,
      "min": 82,
      "max": 100
    },
    "temp": {
      "mean": 37.0,
      "std": 0.4,
      "margin": 0.6,
      "min": 36.2,
      "max": 38.2
    }
  },
  "bacterial_meningitis": {
    "hr": {
      "mean": 118,
      "std": 15,
      "margin": 15,
      "min": 85,
      "max": 160
    },
    "sbp": {
      "mean": 115,
      "std": 20,
      "margin": 20,
      "min": 80,
      "max": 165
    },
    "dbp": {
      "mean": 70,
      "std": 14,
      "margin": 15,
      "min": 48,
      "max": 100
    },
    "rr": {
      "mean": 24,
      "std": 4,
      "margin": 4,
      "min": 16,
      "max": 36
    },
    "spo2": {
      "mean": 96,
      "std": 3,
      "margin": 3,
      "min": 90,
      "max": 100
    },
    "temp": {
      "mean": 39.5,
      "std": 0.7,
      "margin": 0.6,
      "min": 38.2,
      "max": 41.5
    }
  },
  "bells_palsy": {
    "hr": {
      "mean": 82,
      "std": 16,
      "margin": 16,
      "min": 50,
      "max": 130
    },
    "sbp": {
      "mean": 135,
      "std": 25,
      "margin": 25,
      "min": 90,
      "max": 210
    },
    "dbp": {
      "mean": 82,
      "std": 15,
      "margin": 18,
      "min": 55,
      "max": 120
    },
    "rr": {
      "mean": 17,
      "std": 3,
      "margin": 3,
      "min": 12,
      "max": 26
    },
    "spo2": {
      "mean": 98,
      "std": 2,
      "margin": 2,
      "min": 93,
      "max": 100
    },
    "temp": {
      "mean": 36.9,
      "std": 0.4,
      "margin": 0.6,
      "min": 36.2,
      "max": 38.0
    }
  },
  "benign_paroxysmal_positional_vertigo": {
    "hr": {
      "mean": 82,
      "std": 16,
      "margin": 16,
      "min": 50,
      "max": 130
    },
    "sbp": {
      "mean": 135,
      "std": 25,
      "margin": 25,
      "min": 90,
      "max": 210
    },
    "dbp": {
      "mean": 82,
      "std": 15,
      "margin": 18,
      "min": 55,
      "max": 120
    },
    "rr": {
      "mean": 17,
      "std": 3,
      "margin": 3,
      "min": 12,
      "max": 26
    },
    "spo2": {
      "mean": 98,
      "std": 2,
      "margin": 2,
      "min": 93,
      "max": 100
    },
    "temp": {
      "mean": 36.9,
      "std": 0.4,
      "margin": 0.6,
      "min": 36.2,
      "max": 38.0
    }
  },
  "boerhaave": {
    "hr": {
      "mean": 92,
      "std": 15,
      "margin": 15,
      "min": 60,
      "max": 140
    },
    "sbp": {
      "mean": 122,
      "std": 18,
      "margin": 20,
      "min": 85,
      "max": 165
    },
    "dbp": {
      "mean": 76,
      "std": 12,
      "margin": 15,
      "min": 50,
      "max": 100
    },
    "rr": {
      "mean": 18,
      "std": 3,
      "margin": 3,
      "min": 12,
      "max": 28
    },
    "spo2": {
      "mean": 98,
      "std": 2,
      "margin": 2,
      "min": 94,
      "max": 100
    },
    "temp": {
      "mean": 37.5,
      "std": 0.7,
      "margin": 0.6,
      "min": 36.4,
      "max": 39.5
    }
  },
  "bph_urinary_retention": {
    "hr": {
      "mean": 95,
      "std": 18,
      "margin": 18,
      "min": 60,
      "max": 145
    },
    "sbp": {
      "mean": 138,
      "std": 22,
      "margin": 22,
      "min": 90,
      "max": 190
    },
    "dbp": {
      "mean": 85,
      "std": 14,
      "margin": 16,
      "min": 55,
      "max": 115
    },
    "rr": {
      "mean": 18,
      "std": 3,
      "margin": 3,
      "min": 12,
      "max": 28
    },
    "spo2": {
      "mean": 98,
      "std": 2,
      "margin": 2,
      "min": 94,
      "max": 100
    },
    "temp": {
      "mean": 37.2,
      "std": 0.6,
      "margin": 0.6,
      "min": 36.4,
      "max": 39.2
    }
  },
  "bronchiectasis": {
    "hr": {
      "mean": 110,
      "std": 18,
      "margin": 18,
      "min": 70,
      "max": 160
    },
    "sbp": {
      "mean": 125,
      "std": 20,
      "margin": 22,
      "min": 85,
      "max": 175
    },
    "dbp": {
      "mean": 78,
      "std": 12,
      "margin": 15,
      "min": 50,
      "max": 105
    },
    "rr": {
      "mean": 26,
      "std": 6,
      "margin": 4,
      "min": 16,
      "max": 45
    },
    "spo2": {
      "mean": 90,
      "std": 5,
      "margin": 4,
      "min": 75,
      "max": 98
    },
    "temp": {
      "mean": 37.2,
      "std": 0.6,
      "margin": 0.6,
      "min": 36.2,
      "max": 39.5
    }
  },
  "bronchiolitis": {
    "hr": {
      "mean": 110,
      "std": 18,
      "margin": 18,
      "min": 70,
      "max": 160
    },
    "sbp": {
      "mean": 125,
      "std": 20,
      "margin": 22,
      "min": 85,
      "max": 175
    },
    "dbp": {
      "mean": 78,
      "std": 12,
      "margin": 15,
      "min": 50,
      "max": 105
    },
    "rr": {
      "mean": 26,
      "std": 6,
      "margin": 4,
      "min": 16,
      "max": 45
    },
    "spo2": {
      "mean": 90,
      "std": 5,
      "margin": 4,
      "min": 75,
      "max": 98
    },
    "temp": {
      "mean": 37.2,
      "std": 0.6,
      "margin": 0.6,
      "min": 36.2,
      "max": 39.5
    }
  },
  "bronchitis": {
    "hr": {
      "mean": 110,
      "std": 18,
      "margin": 18,
      "min": 70,
      "max": 160
    },
    "sbp": {
      "mean": 125,
      "std": 20,
      "margin": 22,
      "min": 85,
      "max": 175
    },
    "dbp": {
      "mean": 78,
      "std": 12,
      "margin": 15,
      "min": 50,
      "max": 105
    },
    "rr": {
      "mean": 26,
      "std": 6,
      "margin": 4,
      "min": 16,
      "max": 45
    },
    "spo2": {
      "mean": 90,
      "std": 5,
      "margin": 4,
      "min": 75,
      "max": 98
    },
    "temp": {
      "mean": 37.2,
      "std": 0.6,
      "margin": 0.6,
      "min": 36.2,
      "max": 39.5
    }
  },
  "c_difficile_colitis": {
    "hr": {
      "mean": 105,
      "std": 15,
      "margin": 15,
      "min": 60,
      "max": 160
    },
    "sbp": {
      "mean": 115,
      "std": 18,
      "margin": 20,
      "min": 85,
      "max": 160
    },
    "dbp": {
      "mean": 72,
      "std": 12,
      "margin": 15,
      "min": 50,
      "max": 100
    },
    "rr": {
      "mean": 20,
      "std": 4,
      "margin": 4,
      "min": 12,
      "max": 35
    },
    "spo2": {
      "mean": 97,
      "std": 2,
      "margin": 2,
      "min": 92,
      "max": 100
    },
    "temp": {
      "mean": 38.8,
      "std": 0.8,
      "margin": 0.6,
      "min": 37.5,
      "max": 41.2
    }
  },
  "cardiac_tamponade": {
    "hr": {
      "mean": 100,
      "std": 22,
      "margin": 20,
      "min": 45,
      "max": 180
    },
    "sbp": {
      "mean": 130,
      "std": 30,
      "margin": 25,
      "min": 70,
      "max": 220
    },
    "dbp": {
      "mean": 80,
      "std": 18,
      "margin": 18,
      "min": 40,
      "max": 130
    },
    "rr": {
      "mean": 22,
      "std": 5,
      "margin": 4,
      "min": 14,
      "max": 38
    },
    "spo2": {
      "mean": 94,
      "std": 4,
      "margin": 3,
      "min": 82,
      "max": 100
    },
    "temp": {
      "mean": 37.0,
      "std": 0.4,
      "margin": 0.6,
      "min": 36.2,
      "max": 38.2
    }
  },
  "celiac_disease": {
    "hr": {
      "mean": 92,
      "std": 15,
      "margin": 15,
      "min": 60,
      "max": 140
    },
    "sbp": {
      "mean": 122,
      "std": 18,
      "margin": 20,
      "min": 85,
      "max": 165
    },
    "dbp": {
      "mean": 76,
      "std": 12,
      "margin": 15,
      "min": 50,
      "max": 100
    },
    "rr": {
      "mean": 18,
      "std": 3,
      "margin": 3,
      "min": 12,
      "max": 28
    },
    "spo2": {
      "mean": 98,
      "std": 2,
      "margin": 2,
      "min": 94,
      "max": 100
    },
    "temp": {
      "mean": 37.5,
      "std": 0.7,
      "margin": 0.6,
      "min": 36.4,
      "max": 39.5
    }
  },
  "cellulitis_erysipelas": {
    "hr": {
      "mean": 105,
      "std": 15,
      "margin": 15,
      "min": 60,
      "max": 160
    },
    "sbp": {
      "mean": 115,
      "std": 18,
      "margin": 20,
      "min": 85,
      "max": 160
    },
    "dbp": {
      "mean": 72,
      "std": 12,
      "margin": 15,
      "min": 50,
      "max": 100
    },
    "rr": {
      "mean": 20,
      "std": 4,
      "margin": 4,
      "min": 12,
      "max": 35
    },
    "spo2": {
      "mean": 97,
      "std": 2,
      "margin": 2,
      "min": 92,
      "max": 100
    },
    "temp": {
      "mean": 38.8,
      "std": 0.8,
      "margin": 0.6,
      "min": 37.5,
      "max": 41.2
    }
  },
  "chagas": {
    "hr": {
      "mean": 105,
      "std": 15,
      "margin": 15,
      "min": 60,
      "max": 160
    },
    "sbp": {
      "mean": 115,
      "std": 18,
      "margin": 20,
      "min": 85,
      "max": 160
    },
    "dbp": {
      "mean": 72,
      "std": 12,
      "margin": 15,
      "min": 50,
      "max": 100
    },
    "rr": {
      "mean": 20,
      "std": 4,
      "margin": 4,
      "min": 12,
      "max": 35
    },
    "spo2": {
      "mean": 97,
      "std": 2,
      "margin": 2,
      "min": 92,
      "max": 100
    },
    "temp": {
      "mean": 38.8,
      "std": 0.8,
      "margin": 0.6,
      "min": 37.5,
      "max": 41.2
    }
  },
  "cholecystitis": {
    "hr": {
      "mean": 92,
      "std": 15,
      "margin": 15,
      "min": 60,
      "max": 140
    },
    "sbp": {
      "mean": 122,
      "std": 18,
      "margin": 20,
      "min": 85,
      "max": 165
    },
    "dbp": {
      "mean": 76,
      "std": 12,
      "margin": 15,
      "min": 50,
      "max": 100
    },
    "rr": {
      "mean": 18,
      "std": 3,
      "margin": 3,
      "min": 12,
      "max": 28
    },
    "spo2": {
      "mean": 98,
      "std": 2,
      "margin": 2,
      "min": 94,
      "max": 100
    },
    "temp": {
      "mean": 37.5,
      "std": 0.7,
      "margin": 0.6,
      "min": 36.4,
      "max": 39.5
    }
  },
  "chronic_rhinosinusitis": {
    "hr": {
      "mean": 90,
      "std": 18,
      "margin": 18,
      "min": 55,
      "max": 145
    },
    "sbp": {
      "mean": 122,
      "std": 20,
      "margin": 22,
      "min": 85,
      "max": 175
    },
    "dbp": {
      "mean": 76,
      "std": 14,
      "margin": 16,
      "min": 50,
      "max": 105
    },
    "rr": {
      "mean": 18,
      "std": 4,
      "margin": 4,
      "min": 12,
      "max": 32
    },
    "spo2": {
      "mean": 97,
      "std": 3,
      "margin": 3,
      "min": 90,
      "max": 100
    },
    "temp": {
      "mean": 37.1,
      "std": 0.5,
      "margin": 0.6,
      "min": 36.2,
      "max": 38.5
    }
  },
  "cluster_headache": {
    "hr": {
      "mean": 82,
      "std": 16,
      "margin": 16,
      "min": 50,
      "max": 130
    },
    "sbp": {
      "mean": 135,
      "std": 25,
      "margin": 25,
      "min": 90,
      "max": 210
    },
    "dbp": {
      "mean": 82,
      "std": 15,
      "margin": 18,
      "min": 55,
      "max": 120
    },
    "rr": {
      "mean": 17,
      "std": 3,
      "margin": 3,
      "min": 12,
      "max": 26
    },
    "spo2": {
      "mean": 98,
      "std": 2,
      "margin": 2,
      "min": 93,
      "max": 100
    },
    "temp": {
      "mean": 36.9,
      "std": 0.4,
      "margin": 0.6,
      "min": 36.2,
      "max": 38.0
    }
  },
  "copd_exacerbation": {
    "hr": {
      "mean": 110,
      "std": 18,
      "margin": 18,
      "min": 70,
      "max": 160
    },
    "sbp": {
      "mean": 125,
      "std": 20,
      "margin": 22,
      "min": 85,
      "max": 175
    },
    "dbp": {
      "mean": 78,
      "std": 12,
      "margin": 15,
      "min": 50,
      "max": 105
    },
    "rr": {
      "mean": 26,
      "std": 6,
      "margin": 4,
      "min": 16,
      "max": 45
    },
    "spo2": {
      "mean": 90,
      "std": 5,
      "margin": 4,
      "min": 75,
      "max": 98
    },
    "temp": {
      "mean": 37.2,
      "std": 0.6,
      "margin": 0.6,
      "min": 36.2,
      "max": 39.5
    }
  },
  "crohns_disease": {
    "hr": {
      "mean": 92,
      "std": 15,
      "margin": 15,
      "min": 60,
      "max": 140
    },
    "sbp": {
      "mean": 122,
      "std": 18,
      "margin": 20,
      "min": 85,
      "max": 165
    },
    "dbp": {
      "mean": 76,
      "std": 12,
      "margin": 15,
      "min": 50,
      "max": 100
    },
    "rr": {
      "mean": 18,
      "std": 3,
      "margin": 3,
      "min": 12,
      "max": 28
    },
    "spo2": {
      "mean": 98,
      "std": 2,
      "margin": 2,
      "min": 94,
      "max": 100
    },
    "temp": {
      "mean": 37.5,
      "std": 0.7,
      "margin": 0.6,
      "min": 36.4,
      "max": 39.5
    }
  },
  "croup": {
    "hr": {
      "mean": 105,
      "std": 15,
      "margin": 15,
      "min": 60,
      "max": 160
    },
    "sbp": {
      "mean": 115,
      "std": 18,
      "margin": 20,
      "min": 85,
      "max": 160
    },
    "dbp": {
      "mean": 72,
      "std": 12,
      "margin": 15,
      "min": 50,
      "max": 100
    },
    "rr": {
      "mean": 20,
      "std": 4,
      "margin": 4,
      "min": 12,
      "max": 35
    },
    "spo2": {
      "mean": 97,
      "std": 2,
      "margin": 2,
      "min": 92,
      "max": 100
    },
    "temp": {
      "mean": 38.8,
      "std": 0.8,
      "margin": 0.6,
      "min": 37.5,
      "max": 41.2
    }
  },
  "deep_vein_thrombosis": {
    "hr": {
      "mean": 100,
      "std": 22,
      "margin": 20,
      "min": 45,
      "max": 180
    },
    "sbp": {
      "mean": 130,
      "std": 30,
      "margin": 25,
      "min": 70,
      "max": 220
    },
    "dbp": {
      "mean": 80,
      "std": 18,
      "margin": 18,
      "min": 40,
      "max": 130
    },
    "rr": {
      "mean": 22,
      "std": 5,
      "margin": 4,
      "min": 14,
      "max": 38
    },
    "spo2": {
      "mean": 94,
      "std": 4,
      "margin": 3,
      "min": 82,
      "max": 100
    },
    "temp": {
      "mean": 37.0,
      "std": 0.4,
      "margin": 0.6,
      "min": 36.2,
      "max": 38.2
    }
  },
  "dengue": {
    "hr": {
      "mean": 105,
      "std": 15,
      "margin": 15,
      "min": 60,
      "max": 160
    },
    "sbp": {
      "mean": 115,
      "std": 18,
      "margin": 20,
      "min": 85,
      "max": 160
    },
    "dbp": {
      "mean": 72,
      "std": 12,
      "margin": 15,
      "min": 50,
      "max": 100
    },
    "rr": {
      "mean": 20,
      "std": 4,
      "margin": 4,
      "min": 12,
      "max": 35
    },
    "spo2": {
      "mean": 97,
      "std": 2,
      "margin": 2,
      "min": 92,
      "max": 100
    },
    "temp": {
      "mean": 38.8,
      "std": 0.8,
      "margin": 0.6,
      "min": 37.5,
      "max": 41.2
    }
  },
  "diabetic_ketoacidosis": {
    "hr": {
      "mean": 120,
      "std": 12,
      "margin": 15,
      "min": 90,
      "max": 155
    },
    "sbp": {
      "mean": 98,
      "std": 15,
      "margin": 18,
      "min": 75,
      "max": 135
    },
    "dbp": {
      "mean": 60,
      "std": 10,
      "margin": 14,
      "min": 45,
      "max": 85
    },
    "rr": {
      "mean": 32,
      "std": 5,
      "margin": 4,
      "min": 22,
      "max": 45
    },
    "spo2": {
      "mean": 98,
      "std": 2,
      "margin": 2,
      "min": 94,
      "max": 100
    },
    "temp": {
      "mean": 37.2,
      "std": 0.6,
      "margin": 0.6,
      "min": 36.2,
      "max": 38.9
    }
  },
  "diverticulitis": {
    "hr": {
      "mean": 92,
      "std": 15,
      "margin": 15,
      "min": 60,
      "max": 140
    },
    "sbp": {
      "mean": 122,
      "std": 18,
      "margin": 20,
      "min": 85,
      "max": 165
    },
    "dbp": {
      "mean": 76,
      "std": 12,
      "margin": 15,
      "min": 50,
      "max": 100
    },
    "rr": {
      "mean": 18,
      "std": 3,
      "margin": 3,
      "min": 12,
      "max": 28
    },
    "spo2": {
      "mean": 98,
      "std": 2,
      "margin": 2,
      "min": 94,
      "max": 100
    },
    "temp": {
      "mean": 37.5,
      "std": 0.7,
      "margin": 0.6,
      "min": 36.4,
      "max": 39.5
    }
  },
  "dystonic_reactions": {
    "hr": {
      "mean": 82,
      "std": 16,
      "margin": 16,
      "min": 50,
      "max": 130
    },
    "sbp": {
      "mean": 135,
      "std": 25,
      "margin": 25,
      "min": 90,
      "max": 210
    },
    "dbp": {
      "mean": 82,
      "std": 15,
      "margin": 18,
      "min": 55,
      "max": 120
    },
    "rr": {
      "mean": 17,
      "std": 3,
      "margin": 3,
      "min": 12,
      "max": 26
    },
    "spo2": {
      "mean": 98,
      "std": 2,
      "margin": 2,
      "min": 93,
      "max": 100
    },
    "temp": {
      "mean": 36.9,
      "std": 0.4,
      "margin": 0.6,
      "min": 36.2,
      "max": 38.0
    }
  },
  "ebola": {
    "hr": {
      "mean": 105,
      "std": 15,
      "margin": 15,
      "min": 60,
      "max": 160
    },
    "sbp": {
      "mean": 115,
      "std": 18,
      "margin": 20,
      "min": 85,
      "max": 160
    },
    "dbp": {
      "mean": 72,
      "std": 12,
      "margin": 15,
      "min": 50,
      "max": 100
    },
    "rr": {
      "mean": 20,
      "std": 4,
      "margin": 4,
      "min": 12,
      "max": 35
    },
    "spo2": {
      "mean": 97,
      "std": 2,
      "margin": 2,
      "min": 92,
      "max": 100
    },
    "temp": {
      "mean": 38.8,
      "std": 0.8,
      "margin": 0.6,
      "min": 37.5,
      "max": 41.2
    }
  },
  "epiglottitis": {
    "hr": {
      "mean": 105,
      "std": 15,
      "margin": 15,
      "min": 60,
      "max": 160
    },
    "sbp": {
      "mean": 115,
      "std": 18,
      "margin": 20,
      "min": 85,
      "max": 160
    },
    "dbp": {
      "mean": 72,
      "std": 12,
      "margin": 15,
      "min": 50,
      "max": 100
    },
    "rr": {
      "mean": 20,
      "std": 4,
      "margin": 4,
      "min": 12,
      "max": 35
    },
    "spo2": {
      "mean": 97,
      "std": 2,
      "margin": 2,
      "min": 92,
      "max": 100
    },
    "temp": {
      "mean": 38.8,
      "std": 0.8,
      "margin": 0.6,
      "min": 37.5,
      "max": 41.2
    }
  },
  "gerd": {
    "hr": {
      "mean": 92,
      "std": 15,
      "margin": 15,
      "min": 60,
      "max": 140
    },
    "sbp": {
      "mean": 122,
      "std": 18,
      "margin": 20,
      "min": 85,
      "max": 165
    },
    "dbp": {
      "mean": 76,
      "std": 12,
      "margin": 15,
      "min": 50,
      "max": 100
    },
    "rr": {
      "mean": 18,
      "std": 3,
      "margin": 3,
      "min": 12,
      "max": 28
    },
    "spo2": {
      "mean": 98,
      "std": 2,
      "margin": 2,
      "min": 94,
      "max": 100
    },
    "temp": {
      "mean": 37.5,
      "std": 0.7,
      "margin": 0.6,
      "min": 36.4,
      "max": 39.5
    }
  },
  "guillain_barre": {
    "hr": {
      "mean": 82,
      "std": 16,
      "margin": 16,
      "min": 50,
      "max": 130
    },
    "sbp": {
      "mean": 135,
      "std": 25,
      "margin": 25,
      "min": 90,
      "max": 210
    },
    "dbp": {
      "mean": 82,
      "std": 15,
      "margin": 18,
      "min": 55,
      "max": 120
    },
    "rr": {
      "mean": 17,
      "std": 3,
      "margin": 3,
      "min": 12,
      "max": 26
    },
    "spo2": {
      "mean": 98,
      "std": 2,
      "margin": 2,
      "min": 93,
      "max": 100
    },
    "temp": {
      "mean": 36.9,
      "std": 0.4,
      "margin": 0.6,
      "min": 36.2,
      "max": 38.0
    }
  },
  "herpes_zoster_shingles": {
    "hr": {
      "mean": 105,
      "std": 15,
      "margin": 15,
      "min": 60,
      "max": 160
    },
    "sbp": {
      "mean": 115,
      "std": 18,
      "margin": 20,
      "min": 85,
      "max": 160
    },
    "dbp": {
      "mean": 72,
      "std": 12,
      "margin": 15,
      "min": 50,
      "max": 100
    },
    "rr": {
      "mean": 20,
      "std": 4,
      "margin": 4,
      "min": 12,
      "max": 35
    },
    "spo2": {
      "mean": 97,
      "std": 2,
      "margin": 2,
      "min": 92,
      "max": 100
    },
    "temp": {
      "mean": 38.8,
      "std": 0.8,
      "margin": 0.6,
      "min": 37.5,
      "max": 41.2
    }
  },
  "hiv_initial_infection": {
    "hr": {
      "mean": 105,
      "std": 15,
      "margin": 15,
      "min": 60,
      "max": 160
    },
    "sbp": {
      "mean": 115,
      "std": 18,
      "margin": 20,
      "min": 85,
      "max": 160
    },
    "dbp": {
      "mean": 72,
      "std": 12,
      "margin": 15,
      "min": 50,
      "max": 100
    },
    "rr": {
      "mean": 20,
      "std": 4,
      "margin": 4,
      "min": 12,
      "max": 35
    },
    "spo2": {
      "mean": 97,
      "std": 2,
      "margin": 2,
      "min": 92,
      "max": 100
    },
    "temp": {
      "mean": 38.8,
      "std": 0.8,
      "margin": 0.6,
      "min": 37.5,
      "max": 41.2
    }
  },
  "hsv_encephalitis": {
    "hr": {
      "mean": 105,
      "std": 15,
      "margin": 15,
      "min": 60,
      "max": 160
    },
    "sbp": {
      "mean": 115,
      "std": 18,
      "margin": 20,
      "min": 85,
      "max": 160
    },
    "dbp": {
      "mean": 72,
      "std": 12,
      "margin": 15,
      "min": 50,
      "max": 100
    },
    "rr": {
      "mean": 20,
      "std": 4,
      "margin": 4,
      "min": 12,
      "max": 35
    },
    "spo2": {
      "mean": 97,
      "std": 2,
      "margin": 2,
      "min": 92,
      "max": 100
    },
    "temp": {
      "mean": 38.8,
      "std": 0.8,
      "margin": 0.6,
      "min": 37.5,
      "max": 41.2
    }
  },
  "hyperosmolar_hyperglycemic_state": {
    "hr": {
      "mean": 105,
      "std": 20,
      "margin": 18,
      "min": 55,
      "max": 160
    },
    "sbp": {
      "mean": 118,
      "std": 25,
      "margin": 22,
      "min": 75,
      "max": 170
    },
    "dbp": {
      "mean": 72,
      "std": 15,
      "margin": 16,
      "min": 45,
      "max": 105
    },
    "rr": {
      "mean": 22,
      "std": 6,
      "margin": 4,
      "min": 12,
      "max": 40
    },
    "spo2": {
      "mean": 98,
      "std": 2,
      "margin": 2,
      "min": 94,
      "max": 100
    },
    "temp": {
      "mean": 37.0,
      "std": 0.5,
      "margin": 0.6,
      "min": 35.8,
      "max": 38.8
    }
  },
  "hypertensive_emergency": {
    "hr": {
      "mean": 98,
      "std": 16,
      "margin": 16,
      "min": 65,
      "max": 140
    },
    "sbp": {
      "mean": 195,
      "std": 18,
      "margin": 20,
      "min": 175,
      "max": 250
    },
    "dbp": {
      "mean": 122,
      "std": 12,
      "margin": 14,
      "min": 110,
      "max": 155
    },
    "rr": {
      "mean": 20,
      "std": 4,
      "margin": 4,
      "min": 12,
      "max": 32
    },
    "spo2": {
      "mean": 97,
      "std": 2,
      "margin": 2,
      "min": 92,
      "max": 100
    },
    "temp": {
      "mean": 36.9,
      "std": 0.4,
      "margin": 0.6,
      "min": 36.2,
      "max": 37.8
    }
  },
  "hyperthyroidism": {
    "hr": {
      "mean": 105,
      "std": 20,
      "margin": 18,
      "min": 55,
      "max": 160
    },
    "sbp": {
      "mean": 118,
      "std": 25,
      "margin": 22,
      "min": 75,
      "max": 170
    },
    "dbp": {
      "mean": 72,
      "std": 15,
      "margin": 16,
      "min": 45,
      "max": 105
    },
    "rr": {
      "mean": 22,
      "std": 6,
      "margin": 4,
      "min": 12,
      "max": 40
    },
    "spo2": {
      "mean": 98,
      "std": 2,
      "margin": 2,
      "min": 94,
      "max": 100
    },
    "temp": {
      "mean": 37.0,
      "std": 0.5,
      "margin": 0.6,
      "min": 35.8,
      "max": 38.8
    }
  },
  "hypothyroidism": {
    "hr": {
      "mean": 105,
      "std": 20,
      "margin": 18,
      "min": 55,
      "max": 160
    },
    "sbp": {
      "mean": 118,
      "std": 25,
      "margin": 22,
      "min": 75,
      "max": 170
    },
    "dbp": {
      "mean": 72,
      "std": 15,
      "margin": 16,
      "min": 45,
      "max": 105
    },
    "rr": {
      "mean": 22,
      "std": 6,
      "margin": 4,
      "min": 12,
      "max": 40
    },
    "spo2": {
      "mean": 98,
      "std": 2,
      "margin": 2,
      "min": 94,
      "max": 100
    },
    "temp": {
      "mean": 37.0,
      "std": 0.5,
      "margin": 0.6,
      "min": 35.8,
      "max": 38.8
    }
  },
  "infectious_mononucleosis_ebv": {
    "hr": {
      "mean": 105,
      "std": 15,
      "margin": 15,
      "min": 60,
      "max": 160
    },
    "sbp": {
      "mean": 115,
      "std": 18,
      "margin": 20,
      "min": 85,
      "max": 160
    },
    "dbp": {
      "mean": 72,
      "std": 12,
      "margin": 15,
      "min": 50,
      "max": 100
    },
    "rr": {
      "mean": 20,
      "std": 4,
      "margin": 4,
      "min": 12,
      "max": 35
    },
    "spo2": {
      "mean": 97,
      "std": 2,
      "margin": 2,
      "min": 92,
      "max": 100
    },
    "temp": {
      "mean": 38.8,
      "std": 0.8,
      "margin": 0.6,
      "min": 37.5,
      "max": 41.2
    }
  },
  "infective_endocarditis": {
    "hr": {
      "mean": 105,
      "std": 15,
      "margin": 15,
      "min": 60,
      "max": 160
    },
    "sbp": {
      "mean": 115,
      "std": 18,
      "margin": 20,
      "min": 85,
      "max": 160
    },
    "dbp": {
      "mean": 72,
      "std": 12,
      "margin": 15,
      "min": 50,
      "max": 100
    },
    "rr": {
      "mean": 20,
      "std": 4,
      "margin": 4,
      "min": 12,
      "max": 35
    },
    "spo2": {
      "mean": 97,
      "std": 2,
      "margin": 2,
      "min": 92,
      "max": 100
    },
    "temp": {
      "mean": 38.8,
      "std": 0.8,
      "margin": 0.6,
      "min": 37.5,
      "max": 41.2
    }
  },
  "influenza": {
    "hr": {
      "mean": 105,
      "std": 15,
      "margin": 15,
      "min": 60,
      "max": 160
    },
    "sbp": {
      "mean": 115,
      "std": 18,
      "margin": 20,
      "min": 85,
      "max": 160
    },
    "dbp": {
      "mean": 72,
      "std": 12,
      "margin": 15,
      "min": 50,
      "max": 100
    },
    "rr": {
      "mean": 20,
      "std": 4,
      "margin": 4,
      "min": 12,
      "max": 35
    },
    "spo2": {
      "mean": 97,
      "std": 2,
      "margin": 2,
      "min": 92,
      "max": 100
    },
    "temp": {
      "mean": 38.8,
      "std": 0.8,
      "margin": 0.6,
      "min": 37.5,
      "max": 41.2
    }
  },
  "inguinal_hernia": {
    "hr": {
      "mean": 92,
      "std": 15,
      "margin": 15,
      "min": 60,
      "max": 140
    },
    "sbp": {
      "mean": 122,
      "std": 18,
      "margin": 20,
      "min": 85,
      "max": 165
    },
    "dbp": {
      "mean": 76,
      "std": 12,
      "margin": 15,
      "min": 50,
      "max": 100
    },
    "rr": {
      "mean": 18,
      "std": 3,
      "margin": 3,
      "min": 12,
      "max": 28
    },
    "spo2": {
      "mean": 98,
      "std": 2,
      "margin": 2,
      "min": 94,
      "max": 100
    },
    "temp": {
      "mean": 37.5,
      "std": 0.7,
      "margin": 0.6,
      "min": 36.4,
      "max": 39.5
    }
  },
  "iron_deficiency_anemia": {
    "hr": {
      "mean": 100,
      "std": 18,
      "margin": 16,
      "min": 65,
      "max": 150
    },
    "sbp": {
      "mean": 120,
      "std": 20,
      "margin": 20,
      "min": 85,
      "max": 165
    },
    "dbp": {
      "mean": 75,
      "std": 12,
      "margin": 15,
      "min": 50,
      "max": 100
    },
    "rr": {
      "mean": 19,
      "std": 4,
      "margin": 4,
      "min": 12,
      "max": 30
    },
    "spo2": {
      "mean": 97,
      "std": 3,
      "margin": 3,
      "min": 90,
      "max": 100
    },
    "temp": {
      "mean": 37.3,
      "std": 0.6,
      "margin": 0.6,
      "min": 36.4,
      "max": 39.2
    }
  },
  "itp": {
    "hr": {
      "mean": 100,
      "std": 18,
      "margin": 16,
      "min": 65,
      "max": 150
    },
    "sbp": {
      "mean": 120,
      "std": 20,
      "margin": 20,
      "min": 85,
      "max": 165
    },
    "dbp": {
      "mean": 75,
      "std": 12,
      "margin": 15,
      "min": 50,
      "max": 100
    },
    "rr": {
      "mean": 19,
      "std": 4,
      "margin": 4,
      "min": 12,
      "max": 30
    },
    "spo2": {
      "mean": 97,
      "std": 3,
      "margin": 3,
      "min": 90,
      "max": 100
    },
    "temp": {
      "mean": 37.3,
      "std": 0.6,
      "margin": 0.6,
      "min": 36.4,
      "max": 39.2
    }
  },
  "kidney_injury_prerenal_azotemia": {
    "hr": {
      "mean": 95,
      "std": 18,
      "margin": 18,
      "min": 60,
      "max": 145
    },
    "sbp": {
      "mean": 138,
      "std": 22,
      "margin": 22,
      "min": 90,
      "max": 190
    },
    "dbp": {
      "mean": 85,
      "std": 14,
      "margin": 16,
      "min": 55,
      "max": 115
    },
    "rr": {
      "mean": 18,
      "std": 3,
      "margin": 3,
      "min": 12,
      "max": 28
    },
    "spo2": {
      "mean": 98,
      "std": 2,
      "margin": 2,
      "min": 94,
      "max": 100
    },
    "temp": {
      "mean": 37.2,
      "std": 0.6,
      "margin": 0.6,
      "min": 36.4,
      "max": 39.2
    }
  },
  "larygospasm": {
    "hr": {
      "mean": 110,
      "std": 18,
      "margin": 18,
      "min": 70,
      "max": 160
    },
    "sbp": {
      "mean": 125,
      "std": 20,
      "margin": 22,
      "min": 85,
      "max": 175
    },
    "dbp": {
      "mean": 78,
      "std": 12,
      "margin": 15,
      "min": 50,
      "max": 105
    },
    "rr": {
      "mean": 26,
      "std": 6,
      "margin": 4,
      "min": 16,
      "max": 45
    },
    "spo2": {
      "mean": 90,
      "std": 5,
      "margin": 4,
      "min": 75,
      "max": 98
    },
    "temp": {
      "mean": 37.2,
      "std": 0.6,
      "margin": 0.6,
      "min": 36.2,
      "max": 39.5
    }
  },
  "laryngitis": {
    "hr": {
      "mean": 90,
      "std": 18,
      "margin": 18,
      "min": 55,
      "max": 145
    },
    "sbp": {
      "mean": 122,
      "std": 20,
      "margin": 22,
      "min": 85,
      "max": 175
    },
    "dbp": {
      "mean": 76,
      "std": 14,
      "margin": 16,
      "min": 50,
      "max": 105
    },
    "rr": {
      "mean": 18,
      "std": 4,
      "margin": 4,
      "min": 12,
      "max": 32
    },
    "spo2": {
      "mean": 97,
      "std": 3,
      "margin": 3,
      "min": 90,
      "max": 100
    },
    "temp": {
      "mean": 37.1,
      "std": 0.5,
      "margin": 0.6,
      "min": 36.2,
      "max": 38.5
    }
  },
  "leptospirosis": {
    "hr": {
      "mean": 105,
      "std": 15,
      "margin": 15,
      "min": 60,
      "max": 160
    },
    "sbp": {
      "mean": 115,
      "std": 18,
      "margin": 20,
      "min": 85,
      "max": 160
    },
    "dbp": {
      "mean": 72,
      "std": 12,
      "margin": 15,
      "min": 50,
      "max": 100
    },
    "rr": {
      "mean": 20,
      "std": 4,
      "margin": 4,
      "min": 12,
      "max": 35
    },
    "spo2": {
      "mean": 97,
      "std": 2,
      "margin": 2,
      "min": 92,
      "max": 100
    },
    "temp": {
      "mean": 38.8,
      "std": 0.8,
      "margin": 0.6,
      "min": 37.5,
      "max": 41.2
    }
  },
  "liver_cirrhosis": {
    "hr": {
      "mean": 92,
      "std": 15,
      "margin": 15,
      "min": 60,
      "max": 140
    },
    "sbp": {
      "mean": 122,
      "std": 18,
      "margin": 20,
      "min": 85,
      "max": 165
    },
    "dbp": {
      "mean": 76,
      "std": 12,
      "margin": 15,
      "min": 50,
      "max": 100
    },
    "rr": {
      "mean": 18,
      "std": 3,
      "margin": 3,
      "min": 12,
      "max": 28
    },
    "spo2": {
      "mean": 98,
      "std": 2,
      "margin": 2,
      "min": 94,
      "max": 100
    },
    "temp": {
      "mean": 37.5,
      "std": 0.7,
      "margin": 0.6,
      "min": 36.4,
      "max": 39.5
    }
  },
  "localized_edema": {
    "hr": {
      "mean": 90,
      "std": 18,
      "margin": 18,
      "min": 55,
      "max": 145
    },
    "sbp": {
      "mean": 122,
      "std": 20,
      "margin": 22,
      "min": 85,
      "max": 175
    },
    "dbp": {
      "mean": 76,
      "std": 14,
      "margin": 16,
      "min": 50,
      "max": 105
    },
    "rr": {
      "mean": 18,
      "std": 4,
      "margin": 4,
      "min": 12,
      "max": 32
    },
    "spo2": {
      "mean": 97,
      "std": 3,
      "margin": 3,
      "min": 90,
      "max": 100
    },
    "temp": {
      "mean": 37.1,
      "std": 0.5,
      "margin": 0.6,
      "min": 36.2,
      "max": 38.5
    }
  },
  "lyme_disease_borrelia_burgdorferi": {
    "hr": {
      "mean": 105,
      "std": 15,
      "margin": 15,
      "min": 60,
      "max": 160
    },
    "sbp": {
      "mean": 115,
      "std": 18,
      "margin": 20,
      "min": 85,
      "max": 160
    },
    "dbp": {
      "mean": 72,
      "std": 12,
      "margin": 15,
      "min": 50,
      "max": 100
    },
    "rr": {
      "mean": 20,
      "std": 4,
      "margin": 4,
      "min": 12,
      "max": 35
    },
    "spo2": {
      "mean": 97,
      "std": 2,
      "margin": 2,
      "min": 92,
      "max": 100
    },
    "temp": {
      "mean": 38.8,
      "std": 0.8,
      "margin": 0.6,
      "min": 37.5,
      "max": 41.2
    }
  },
  "malaria": {
    "hr": {
      "mean": 115,
      "std": 15,
      "margin": 15,
      "min": 80,
      "max": 155
    },
    "sbp": {
      "mean": 105,
      "std": 16,
      "margin": 18,
      "min": 80,
      "max": 140
    },
    "dbp": {
      "mean": 65,
      "std": 12,
      "margin": 14,
      "min": 48,
      "max": 90
    },
    "rr": {
      "mean": 22,
      "std": 4,
      "margin": 4,
      "min": 16,
      "max": 34
    },
    "spo2": {
      "mean": 97,
      "std": 2,
      "margin": 2,
      "min": 92,
      "max": 100
    },
    "temp": {
      "mean": 39.8,
      "std": 0.8,
      "margin": 0.7,
      "min": 38.0,
      "max": 41.6
    }
  },
  "migraine_headache": {
    "hr": {
      "mean": 82,
      "std": 16,
      "margin": 16,
      "min": 50,
      "max": 130
    },
    "sbp": {
      "mean": 135,
      "std": 25,
      "margin": 25,
      "min": 90,
      "max": 210
    },
    "dbp": {
      "mean": 82,
      "std": 15,
      "margin": 18,
      "min": 55,
      "max": 120
    },
    "rr": {
      "mean": 17,
      "std": 3,
      "margin": 3,
      "min": 12,
      "max": 26
    },
    "spo2": {
      "mean": 98,
      "std": 2,
      "margin": 2,
      "min": 93,
      "max": 100
    },
    "temp": {
      "mean": 36.9,
      "std": 0.4,
      "margin": 0.6,
      "min": 36.2,
      "max": 38.0
    }
  },
  "multiple_myeloma": {
    "hr": {
      "mean": 100,
      "std": 18,
      "margin": 16,
      "min": 65,
      "max": 150
    },
    "sbp": {
      "mean": 120,
      "std": 20,
      "margin": 20,
      "min": 85,
      "max": 165
    },
    "dbp": {
      "mean": 75,
      "std": 12,
      "margin": 15,
      "min": 50,
      "max": 100
    },
    "rr": {
      "mean": 19,
      "std": 4,
      "margin": 4,
      "min": 12,
      "max": 30
    },
    "spo2": {
      "mean": 97,
      "std": 3,
      "margin": 3,
      "min": 90,
      "max": 100
    },
    "temp": {
      "mean": 37.3,
      "std": 0.6,
      "margin": 0.6,
      "min": 36.4,
      "max": 39.2
    }
  },
  "multiple_sclerosis": {
    "hr": {
      "mean": 82,
      "std": 16,
      "margin": 16,
      "min": 50,
      "max": 130
    },
    "sbp": {
      "mean": 135,
      "std": 25,
      "margin": 25,
      "min": 90,
      "max": 210
    },
    "dbp": {
      "mean": 82,
      "std": 15,
      "margin": 18,
      "min": 55,
      "max": 120
    },
    "rr": {
      "mean": 17,
      "std": 3,
      "margin": 3,
      "min": 12,
      "max": 26
    },
    "spo2": {
      "mean": 98,
      "std": 2,
      "margin": 2,
      "min": 93,
      "max": 100
    },
    "temp": {
      "mean": 36.9,
      "std": 0.4,
      "margin": 0.6,
      "min": 36.2,
      "max": 38.0
    }
  },
  "myasthenia_gravis": {
    "hr": {
      "mean": 82,
      "std": 16,
      "margin": 16,
      "min": 50,
      "max": 130
    },
    "sbp": {
      "mean": 135,
      "std": 25,
      "margin": 25,
      "min": 90,
      "max": 210
    },
    "dbp": {
      "mean": 82,
      "std": 15,
      "margin": 18,
      "min": 55,
      "max": 120
    },
    "rr": {
      "mean": 17,
      "std": 3,
      "margin": 3,
      "min": 12,
      "max": 26
    },
    "spo2": {
      "mean": 98,
      "std": 2,
      "margin": 2,
      "min": 93,
      "max": 100
    },
    "temp": {
      "mean": 36.9,
      "std": 0.4,
      "margin": 0.6,
      "min": 36.2,
      "max": 38.0
    }
  },
  "myocarditis": {
    "hr": {
      "mean": 100,
      "std": 22,
      "margin": 20,
      "min": 45,
      "max": 180
    },
    "sbp": {
      "mean": 130,
      "std": 30,
      "margin": 25,
      "min": 70,
      "max": 220
    },
    "dbp": {
      "mean": 80,
      "std": 18,
      "margin": 18,
      "min": 40,
      "max": 130
    },
    "rr": {
      "mean": 22,
      "std": 5,
      "margin": 4,
      "min": 14,
      "max": 38
    },
    "spo2": {
      "mean": 94,
      "std": 4,
      "margin": 3,
      "min": 82,
      "max": 100
    },
    "temp": {
      "mean": 37.0,
      "std": 0.4,
      "margin": 0.6,
      "min": 36.2,
      "max": 38.2
    }
  },
  "nephrolithiasis": {
    "hr": {
      "mean": 98,
      "std": 15,
      "margin": 15,
      "min": 65,
      "max": 140
    },
    "sbp": {
      "mean": 146,
      "std": 18,
      "margin": 20,
      "min": 110,
      "max": 185
    },
    "dbp": {
      "mean": 88,
      "std": 12,
      "margin": 14,
      "min": 65,
      "max": 115
    },
    "rr": {
      "mean": 19,
      "std": 3,
      "margin": 3,
      "min": 14,
      "max": 28
    },
    "spo2": {
      "mean": 99,
      "std": 1,
      "margin": 2,
      "min": 96,
      "max": 100
    },
    "temp": {
      "mean": 36.8,
      "std": 0.4,
      "margin": 0.5,
      "min": 36.2,
      "max": 37.8
    }
  },
  "otitis_media": {
    "hr": {
      "mean": 90,
      "std": 18,
      "margin": 18,
      "min": 55,
      "max": 145
    },
    "sbp": {
      "mean": 122,
      "std": 20,
      "margin": 22,
      "min": 85,
      "max": 175
    },
    "dbp": {
      "mean": 76,
      "std": 14,
      "margin": 16,
      "min": 50,
      "max": 105
    },
    "rr": {
      "mean": 18,
      "std": 4,
      "margin": 4,
      "min": 12,
      "max": 32
    },
    "spo2": {
      "mean": 97,
      "std": 3,
      "margin": 3,
      "min": 90,
      "max": 100
    },
    "temp": {
      "mean": 37.1,
      "std": 0.5,
      "margin": 0.6,
      "min": 36.2,
      "max": 38.5
    }
  },
  "ovarian_torsion": {
    "hr": {
      "mean": 102,
      "std": 20,
      "margin": 18,
      "min": 60,
      "max": 155
    },
    "sbp": {
      "mean": 110,
      "std": 28,
      "margin": 25,
      "min": 65,
      "max": 195
    },
    "dbp": {
      "mean": 68,
      "std": 18,
      "margin": 18,
      "min": 40,
      "max": 125
    },
    "rr": {
      "mean": 20,
      "std": 4,
      "margin": 4,
      "min": 12,
      "max": 32
    },
    "spo2": {
      "mean": 98,
      "std": 2,
      "margin": 2,
      "min": 93,
      "max": 100
    },
    "temp": {
      "mean": 37.1,
      "std": 0.5,
      "margin": 0.6,
      "min": 36.2,
      "max": 38.6
    }
  },
  "pancreatic_neoplasm": {
    "hr": {
      "mean": 92,
      "std": 15,
      "margin": 15,
      "min": 60,
      "max": 140
    },
    "sbp": {
      "mean": 122,
      "std": 18,
      "margin": 20,
      "min": 85,
      "max": 165
    },
    "dbp": {
      "mean": 76,
      "std": 12,
      "margin": 15,
      "min": 50,
      "max": 100
    },
    "rr": {
      "mean": 18,
      "std": 3,
      "margin": 3,
      "min": 12,
      "max": 28
    },
    "spo2": {
      "mean": 98,
      "std": 2,
      "margin": 2,
      "min": 94,
      "max": 100
    },
    "temp": {
      "mean": 37.5,
      "std": 0.7,
      "margin": 0.6,
      "min": 36.4,
      "max": 39.5
    }
  },
  "pancreatitis": {
    "hr": {
      "mean": 92,
      "std": 15,
      "margin": 15,
      "min": 60,
      "max": 140
    },
    "sbp": {
      "mean": 122,
      "std": 18,
      "margin": 20,
      "min": 85,
      "max": 165
    },
    "dbp": {
      "mean": 76,
      "std": 12,
      "margin": 15,
      "min": 50,
      "max": 100
    },
    "rr": {
      "mean": 18,
      "std": 3,
      "margin": 3,
      "min": 12,
      "max": 28
    },
    "spo2": {
      "mean": 98,
      "std": 2,
      "margin": 2,
      "min": 94,
      "max": 100
    },
    "temp": {
      "mean": 37.5,
      "std": 0.7,
      "margin": 0.6,
      "min": 36.4,
      "max": 39.5
    }
  },
  "panic_attack": {
    "hr": {
      "mean": 90,
      "std": 18,
      "margin": 18,
      "min": 55,
      "max": 145
    },
    "sbp": {
      "mean": 122,
      "std": 20,
      "margin": 22,
      "min": 85,
      "max": 175
    },
    "dbp": {
      "mean": 76,
      "std": 14,
      "margin": 16,
      "min": 50,
      "max": 105
    },
    "rr": {
      "mean": 18,
      "std": 4,
      "margin": 4,
      "min": 12,
      "max": 32
    },
    "spo2": {
      "mean": 97,
      "std": 3,
      "margin": 3,
      "min": 90,
      "max": 100
    },
    "temp": {
      "mean": 37.1,
      "std": 0.5,
      "margin": 0.6,
      "min": 36.2,
      "max": 38.5
    }
  },
  "parkinson_s_disease": {
    "hr": {
      "mean": 82,
      "std": 16,
      "margin": 16,
      "min": 50,
      "max": 130
    },
    "sbp": {
      "mean": 135,
      "std": 25,
      "margin": 25,
      "min": 90,
      "max": 210
    },
    "dbp": {
      "mean": 82,
      "std": 15,
      "margin": 18,
      "min": 55,
      "max": 120
    },
    "rr": {
      "mean": 17,
      "std": 3,
      "margin": 3,
      "min": 12,
      "max": 26
    },
    "spo2": {
      "mean": 98,
      "std": 2,
      "margin": 2,
      "min": 93,
      "max": 100
    },
    "temp": {
      "mean": 36.9,
      "std": 0.4,
      "margin": 0.6,
      "min": 36.2,
      "max": 38.0
    }
  },
  "pelvic_inflammatory_disease": {
    "hr": {
      "mean": 102,
      "std": 20,
      "margin": 18,
      "min": 60,
      "max": 155
    },
    "sbp": {
      "mean": 110,
      "std": 28,
      "margin": 25,
      "min": 65,
      "max": 195
    },
    "dbp": {
      "mean": 68,
      "std": 18,
      "margin": 18,
      "min": 40,
      "max": 125
    },
    "rr": {
      "mean": 20,
      "std": 4,
      "margin": 4,
      "min": 12,
      "max": 32
    },
    "spo2": {
      "mean": 98,
      "std": 2,
      "margin": 2,
      "min": 93,
      "max": 100
    },
    "temp": {
      "mean": 37.1,
      "std": 0.5,
      "margin": 0.6,
      "min": 36.2,
      "max": 38.6
    }
  },
  "peptic_ulcer": {
    "hr": {
      "mean": 92,
      "std": 15,
      "margin": 15,
      "min": 60,
      "max": 140
    },
    "sbp": {
      "mean": 122,
      "std": 18,
      "margin": 20,
      "min": 85,
      "max": 165
    },
    "dbp": {
      "mean": 76,
      "std": 12,
      "margin": 15,
      "min": 50,
      "max": 100
    },
    "rr": {
      "mean": 18,
      "std": 3,
      "margin": 3,
      "min": 12,
      "max": 28
    },
    "spo2": {
      "mean": 98,
      "std": 2,
      "margin": 2,
      "min": 94,
      "max": 100
    },
    "temp": {
      "mean": 37.5,
      "std": 0.7,
      "margin": 0.6,
      "min": 36.4,
      "max": 39.5
    }
  },
  "pericarditis": {
    "hr": {
      "mean": 100,
      "std": 22,
      "margin": 20,
      "min": 45,
      "max": 180
    },
    "sbp": {
      "mean": 130,
      "std": 30,
      "margin": 25,
      "min": 70,
      "max": 220
    },
    "dbp": {
      "mean": 80,
      "std": 18,
      "margin": 18,
      "min": 40,
      "max": 130
    },
    "rr": {
      "mean": 22,
      "std": 5,
      "margin": 4,
      "min": 14,
      "max": 38
    },
    "spo2": {
      "mean": 94,
      "std": 4,
      "margin": 3,
      "min": 82,
      "max": 100
    },
    "temp": {
      "mean": 37.0,
      "std": 0.4,
      "margin": 0.6,
      "min": 36.2,
      "max": 38.2
    }
  },
  "pneumonia": {
    "hr": {
      "mean": 110,
      "std": 18,
      "margin": 18,
      "min": 70,
      "max": 160
    },
    "sbp": {
      "mean": 125,
      "std": 20,
      "margin": 22,
      "min": 85,
      "max": 175
    },
    "dbp": {
      "mean": 78,
      "std": 12,
      "margin": 15,
      "min": 50,
      "max": 105
    },
    "rr": {
      "mean": 26,
      "std": 6,
      "margin": 4,
      "min": 16,
      "max": 45
    },
    "spo2": {
      "mean": 90,
      "std": 5,
      "margin": 4,
      "min": 75,
      "max": 98
    },
    "temp": {
      "mean": 37.2,
      "std": 0.6,
      "margin": 0.6,
      "min": 36.2,
      "max": 39.5
    }
  },
  "possible_nstemi_stemi": {
    "hr": {
      "mean": 100,
      "std": 22,
      "margin": 20,
      "min": 45,
      "max": 180
    },
    "sbp": {
      "mean": 130,
      "std": 30,
      "margin": 25,
      "min": 70,
      "max": 220
    },
    "dbp": {
      "mean": 80,
      "std": 18,
      "margin": 18,
      "min": 40,
      "max": 130
    },
    "rr": {
      "mean": 22,
      "std": 5,
      "margin": 4,
      "min": 14,
      "max": 38
    },
    "spo2": {
      "mean": 94,
      "std": 4,
      "margin": 3,
      "min": 82,
      "max": 100
    },
    "temp": {
      "mean": 37.0,
      "std": 0.4,
      "margin": 0.6,
      "min": 36.2,
      "max": 38.2
    }
  },
  "preeclampsia": {
    "hr": {
      "mean": 92,
      "std": 12,
      "margin": 14,
      "min": 68,
      "max": 125
    },
    "sbp": {
      "mean": 178,
      "std": 14,
      "margin": 15,
      "min": 155,
      "max": 220
    },
    "dbp": {
      "mean": 114,
      "std": 10,
      "margin": 12,
      "min": 100,
      "max": 140
    },
    "rr": {
      "mean": 18,
      "std": 3,
      "margin": 3,
      "min": 12,
      "max": 26
    },
    "spo2": {
      "mean": 98,
      "std": 2,
      "margin": 2,
      "min": 94,
      "max": 100
    },
    "temp": {
      "mean": 36.8,
      "std": 0.4,
      "margin": 0.6,
      "min": 36.2,
      "max": 37.8
    }
  },
  "psvt": {
    "hr": {
      "mean": 100,
      "std": 22,
      "margin": 20,
      "min": 45,
      "max": 180
    },
    "sbp": {
      "mean": 130,
      "std": 30,
      "margin": 25,
      "min": 70,
      "max": 220
    },
    "dbp": {
      "mean": 80,
      "std": 18,
      "margin": 18,
      "min": 40,
      "max": 130
    },
    "rr": {
      "mean": 22,
      "std": 5,
      "margin": 4,
      "min": 14,
      "max": 38
    },
    "spo2": {
      "mean": 94,
      "std": 4,
      "margin": 3,
      "min": 82,
      "max": 100
    },
    "temp": {
      "mean": 37.0,
      "std": 0.4,
      "margin": 0.6,
      "min": 36.2,
      "max": 38.2
    }
  },
  "pulmonary_embolism": {
    "hr": {
      "mean": 122,
      "std": 15,
      "margin": 15,
      "min": 90,
      "max": 165
    },
    "sbp": {
      "mean": 102,
      "std": 22,
      "margin": 20,
      "min": 68,
      "max": 150
    },
    "dbp": {
      "mean": 65,
      "std": 14,
      "margin": 15,
      "min": 42,
      "max": 95
    },
    "rr": {
      "mean": 28,
      "std": 4,
      "margin": 4,
      "min": 18,
      "max": 42
    },
    "spo2": {
      "mean": 89,
      "std": 4,
      "margin": 4,
      "min": 78,
      "max": 96
    },
    "temp": {
      "mean": 37.4,
      "std": 0.5,
      "margin": 0.6,
      "min": 36.4,
      "max": 38.6
    }
  },
  "pulmonary_embolism_recurrent": {
    "hr": {
      "mean": 120,
      "std": 15,
      "margin": 15,
      "min": 90,
      "max": 165
    },
    "sbp": {
      "mean": 105,
      "std": 22,
      "margin": 20,
      "min": 70,
      "max": 150
    },
    "dbp": {
      "mean": 66,
      "std": 14,
      "margin": 15,
      "min": 45,
      "max": 95
    },
    "rr": {
      "mean": 28,
      "std": 4,
      "margin": 4,
      "min": 18,
      "max": 40
    },
    "spo2": {
      "mean": 90,
      "std": 4,
      "margin": 4,
      "min": 80,
      "max": 96
    },
    "temp": {
      "mean": 37.3,
      "std": 0.5,
      "margin": 0.6,
      "min": 36.4,
      "max": 38.5
    }
  },
  "pulmonary_neoplasm": {
    "hr": {
      "mean": 110,
      "std": 18,
      "margin": 18,
      "min": 70,
      "max": 160
    },
    "sbp": {
      "mean": 125,
      "std": 20,
      "margin": 22,
      "min": 85,
      "max": 175
    },
    "dbp": {
      "mean": 78,
      "std": 12,
      "margin": 15,
      "min": 50,
      "max": 105
    },
    "rr": {
      "mean": 26,
      "std": 6,
      "margin": 4,
      "min": 16,
      "max": 45
    },
    "spo2": {
      "mean": 90,
      "std": 5,
      "margin": 4,
      "min": 75,
      "max": 98
    },
    "temp": {
      "mean": 37.2,
      "std": 0.6,
      "margin": 0.6,
      "min": 36.2,
      "max": 39.5
    }
  },
  "rheumatoid_arthritis": {
    "hr": {
      "mean": 85,
      "std": 14,
      "margin": 15,
      "min": 60,
      "max": 130
    },
    "sbp": {
      "mean": 128,
      "std": 18,
      "margin": 20,
      "min": 95,
      "max": 170
    },
    "dbp": {
      "mean": 80,
      "std": 12,
      "margin": 15,
      "min": 60,
      "max": 105
    },
    "rr": {
      "mean": 16,
      "std": 3,
      "margin": 3,
      "min": 12,
      "max": 24
    },
    "spo2": {
      "mean": 98,
      "std": 2,
      "margin": 2,
      "min": 94,
      "max": 100
    },
    "temp": {
      "mean": 37.2,
      "std": 0.5,
      "margin": 0.6,
      "min": 36.4,
      "max": 38.8
    }
  },
  "rhinosinusitis": {
    "hr": {
      "mean": 90,
      "std": 18,
      "margin": 18,
      "min": 55,
      "max": 145
    },
    "sbp": {
      "mean": 122,
      "std": 20,
      "margin": 22,
      "min": 85,
      "max": 175
    },
    "dbp": {
      "mean": 76,
      "std": 14,
      "margin": 16,
      "min": 50,
      "max": 105
    },
    "rr": {
      "mean": 18,
      "std": 4,
      "margin": 4,
      "min": 12,
      "max": 32
    },
    "spo2": {
      "mean": 97,
      "std": 3,
      "margin": 3,
      "min": 90,
      "max": 100
    },
    "temp": {
      "mean": 37.1,
      "std": 0.5,
      "margin": 0.6,
      "min": 36.2,
      "max": 38.5
    }
  },
  "ruptured_ectopic_pregnancy": {
    "hr": {
      "mean": 126,
      "std": 16,
      "margin": 15,
      "min": 88,
      "max": 165
    },
    "sbp": {
      "mean": 78,
      "std": 14,
      "margin": 14,
      "min": 55,
      "max": 105
    },
    "dbp": {
      "mean": 48,
      "std": 10,
      "margin": 12,
      "min": 32,
      "max": 68
    },
    "rr": {
      "mean": 24,
      "std": 4,
      "margin": 4,
      "min": 16,
      "max": 36
    },
    "spo2": {
      "mean": 97,
      "std": 2,
      "margin": 2,
      "min": 92,
      "max": 100
    },
    "temp": {
      "mean": 36.9,
      "std": 0.4,
      "margin": 0.6,
      "min": 36.2,
      "max": 37.8
    }
  },
  "sarcoidosis": {
    "hr": {
      "mean": 110,
      "std": 18,
      "margin": 18,
      "min": 70,
      "max": 160
    },
    "sbp": {
      "mean": 125,
      "std": 20,
      "margin": 22,
      "min": 85,
      "max": 175
    },
    "dbp": {
      "mean": 78,
      "std": 12,
      "margin": 15,
      "min": 50,
      "max": 105
    },
    "rr": {
      "mean": 26,
      "std": 6,
      "margin": 4,
      "min": 16,
      "max": 45
    },
    "spo2": {
      "mean": 90,
      "std": 5,
      "margin": 4,
      "min": 75,
      "max": 98
    },
    "temp": {
      "mean": 37.2,
      "std": 0.6,
      "margin": 0.6,
      "min": 36.2,
      "max": 39.5
    }
  },
  "scombroid_food_poisoning": {
    "hr": {
      "mean": 90,
      "std": 18,
      "margin": 18,
      "min": 55,
      "max": 145
    },
    "sbp": {
      "mean": 122,
      "std": 20,
      "margin": 22,
      "min": 85,
      "max": 175
    },
    "dbp": {
      "mean": 76,
      "std": 14,
      "margin": 16,
      "min": 50,
      "max": 105
    },
    "rr": {
      "mean": 18,
      "std": 4,
      "margin": 4,
      "min": 12,
      "max": 32
    },
    "spo2": {
      "mean": 97,
      "std": 3,
      "margin": 3,
      "min": 90,
      "max": 100
    },
    "temp": {
      "mean": 37.1,
      "std": 0.5,
      "margin": 0.6,
      "min": 36.2,
      "max": 38.5
    }
  },
  "septic_arthritis": {
    "hr": {
      "mean": 85,
      "std": 14,
      "margin": 15,
      "min": 60,
      "max": 130
    },
    "sbp": {
      "mean": 128,
      "std": 18,
      "margin": 20,
      "min": 95,
      "max": 170
    },
    "dbp": {
      "mean": 80,
      "std": 12,
      "margin": 15,
      "min": 60,
      "max": 105
    },
    "rr": {
      "mean": 16,
      "std": 3,
      "margin": 3,
      "min": 12,
      "max": 24
    },
    "spo2": {
      "mean": 98,
      "std": 2,
      "margin": 2,
      "min": 94,
      "max": 100
    },
    "temp": {
      "mean": 37.2,
      "std": 0.5,
      "margin": 0.6,
      "min": 36.4,
      "max": 38.8
    }
  },
  "septic_shock": {
    "hr": {
      "mean": 128,
      "std": 14,
      "margin": 15,
      "min": 95,
      "max": 175
    },
    "sbp": {
      "mean": 82,
      "std": 12,
      "margin": 12,
      "min": 60,
      "max": 105
    },
    "dbp": {
      "mean": 48,
      "std": 10,
      "margin": 10,
      "min": 35,
      "max": 65
    },
    "rr": {
      "mean": 28,
      "std": 4,
      "margin": 4,
      "min": 20,
      "max": 44
    },
    "spo2": {
      "mean": 92,
      "std": 4,
      "margin": 3,
      "min": 82,
      "max": 97
    },
    "temp": {
      "mean": 39.2,
      "std": 0.8,
      "margin": 0.7,
      "min": 35.5,
      "max": 41.5
    }
  },
  "sickle_cell_crisis": {
    "hr": {
      "mean": 100,
      "std": 18,
      "margin": 16,
      "min": 65,
      "max": 150
    },
    "sbp": {
      "mean": 120,
      "std": 20,
      "margin": 20,
      "min": 85,
      "max": 165
    },
    "dbp": {
      "mean": 75,
      "std": 12,
      "margin": 15,
      "min": 50,
      "max": 100
    },
    "rr": {
      "mean": 19,
      "std": 4,
      "margin": 4,
      "min": 12,
      "max": 30
    },
    "spo2": {
      "mean": 97,
      "std": 3,
      "margin": 3,
      "min": 90,
      "max": 100
    },
    "temp": {
      "mean": 37.3,
      "std": 0.6,
      "margin": 0.6,
      "min": 36.4,
      "max": 39.2
    }
  },
  "sle": {
    "hr": {
      "mean": 85,
      "std": 14,
      "margin": 15,
      "min": 60,
      "max": 130
    },
    "sbp": {
      "mean": 128,
      "std": 18,
      "margin": 20,
      "min": 95,
      "max": 170
    },
    "dbp": {
      "mean": 80,
      "std": 12,
      "margin": 15,
      "min": 60,
      "max": 105
    },
    "rr": {
      "mean": 16,
      "std": 3,
      "margin": 3,
      "min": 12,
      "max": 24
    },
    "spo2": {
      "mean": 98,
      "std": 2,
      "margin": 2,
      "min": 94,
      "max": 100
    },
    "temp": {
      "mean": 37.2,
      "std": 0.5,
      "margin": 0.6,
      "min": 36.4,
      "max": 38.8
    }
  },
  "spontaneous_pneumothorax": {
    "hr": {
      "mean": 118,
      "std": 16,
      "margin": 16,
      "min": 85,
      "max": 160
    },
    "sbp": {
      "mean": 105,
      "std": 22,
      "margin": 20,
      "min": 70,
      "max": 150
    },
    "dbp": {
      "mean": 68,
      "std": 14,
      "margin": 15,
      "min": 45,
      "max": 95
    },
    "rr": {
      "mean": 30,
      "std": 5,
      "margin": 4,
      "min": 20,
      "max": 44
    },
    "spo2": {
      "mean": 87,
      "std": 5,
      "margin": 4,
      "min": 76,
      "max": 96
    },
    "temp": {
      "mean": 36.9,
      "std": 0.4,
      "margin": 0.6,
      "min": 36.2,
      "max": 37.8
    }
  },
  "spontaneous_rib_fracture": {
    "hr": {
      "mean": 110,
      "std": 18,
      "margin": 18,
      "min": 70,
      "max": 160
    },
    "sbp": {
      "mean": 125,
      "std": 20,
      "margin": 22,
      "min": 85,
      "max": 175
    },
    "dbp": {
      "mean": 78,
      "std": 12,
      "margin": 15,
      "min": 50,
      "max": 105
    },
    "rr": {
      "mean": 26,
      "std": 6,
      "margin": 4,
      "min": 16,
      "max": 45
    },
    "spo2": {
      "mean": 90,
      "std": 5,
      "margin": 4,
      "min": 75,
      "max": 98
    },
    "temp": {
      "mean": 37.2,
      "std": 0.6,
      "margin": 0.6,
      "min": 36.2,
      "max": 39.5
    }
  },
  "stable_angina": {
    "hr": {
      "mean": 100,
      "std": 22,
      "margin": 20,
      "min": 45,
      "max": 180
    },
    "sbp": {
      "mean": 130,
      "std": 30,
      "margin": 25,
      "min": 70,
      "max": 220
    },
    "dbp": {
      "mean": 80,
      "std": 18,
      "margin": 18,
      "min": 40,
      "max": 130
    },
    "rr": {
      "mean": 22,
      "std": 5,
      "margin": 4,
      "min": 14,
      "max": 38
    },
    "spo2": {
      "mean": 94,
      "std": 4,
      "margin": 3,
      "min": 82,
      "max": 100
    },
    "temp": {
      "mean": 37.0,
      "std": 0.4,
      "margin": 0.6,
      "min": 36.2,
      "max": 38.2
    }
  },
  "status_epilepticus": {
    "hr": {
      "mean": 82,
      "std": 16,
      "margin": 16,
      "min": 50,
      "max": 130
    },
    "sbp": {
      "mean": 135,
      "std": 25,
      "margin": 25,
      "min": 90,
      "max": 210
    },
    "dbp": {
      "mean": 82,
      "std": 15,
      "margin": 18,
      "min": 55,
      "max": 120
    },
    "rr": {
      "mean": 17,
      "std": 3,
      "margin": 3,
      "min": 12,
      "max": 26
    },
    "spo2": {
      "mean": 98,
      "std": 2,
      "margin": 2,
      "min": 93,
      "max": 100
    },
    "temp": {
      "mean": 36.9,
      "std": 0.4,
      "margin": 0.6,
      "min": 36.2,
      "max": 38.0
    }
  },
  "stemi": {
    "hr": {
      "mean": 100,
      "std": 22,
      "margin": 20,
      "min": 45,
      "max": 180
    },
    "sbp": {
      "mean": 130,
      "std": 30,
      "margin": 25,
      "min": 70,
      "max": 220
    },
    "dbp": {
      "mean": 80,
      "std": 18,
      "margin": 18,
      "min": 40,
      "max": 130
    },
    "rr": {
      "mean": 22,
      "std": 5,
      "margin": 4,
      "min": 14,
      "max": 38
    },
    "spo2": {
      "mean": 94,
      "std": 4,
      "margin": 3,
      "min": 82,
      "max": 100
    },
    "temp": {
      "mean": 37.0,
      "std": 0.4,
      "margin": 0.6,
      "min": 36.2,
      "max": 38.2
    }
  },
  "subarachnoid_hemorrhage": {
    "hr": {
      "mean": 82,
      "std": 16,
      "margin": 16,
      "min": 50,
      "max": 130
    },
    "sbp": {
      "mean": 135,
      "std": 25,
      "margin": 25,
      "min": 90,
      "max": 210
    },
    "dbp": {
      "mean": 82,
      "std": 15,
      "margin": 18,
      "min": 55,
      "max": 120
    },
    "rr": {
      "mean": 17,
      "std": 3,
      "margin": 3,
      "min": 12,
      "max": 26
    },
    "spo2": {
      "mean": 98,
      "std": 2,
      "margin": 2,
      "min": 93,
      "max": 100
    },
    "temp": {
      "mean": 36.9,
      "std": 0.4,
      "margin": 0.6,
      "min": 36.2,
      "max": 38.0
    }
  },
  "testicular_torsion": {
    "hr": {
      "mean": 95,
      "std": 18,
      "margin": 18,
      "min": 60,
      "max": 145
    },
    "sbp": {
      "mean": 138,
      "std": 22,
      "margin": 22,
      "min": 90,
      "max": 190
    },
    "dbp": {
      "mean": 85,
      "std": 14,
      "margin": 16,
      "min": 55,
      "max": 115
    },
    "rr": {
      "mean": 18,
      "std": 3,
      "margin": 3,
      "min": 12,
      "max": 28
    },
    "spo2": {
      "mean": 98,
      "std": 2,
      "margin": 2,
      "min": 94,
      "max": 100
    },
    "temp": {
      "mean": 37.2,
      "std": 0.6,
      "margin": 0.6,
      "min": 36.4,
      "max": 39.2
    }
  },
  "trigeminal_neuralgia": {
    "hr": {
      "mean": 82,
      "std": 16,
      "margin": 16,
      "min": 50,
      "max": 130
    },
    "sbp": {
      "mean": 135,
      "std": 25,
      "margin": 25,
      "min": 90,
      "max": 210
    },
    "dbp": {
      "mean": 82,
      "std": 15,
      "margin": 18,
      "min": 55,
      "max": 120
    },
    "rr": {
      "mean": 17,
      "std": 3,
      "margin": 3,
      "min": 12,
      "max": 26
    },
    "spo2": {
      "mean": 98,
      "std": 2,
      "margin": 2,
      "min": 93,
      "max": 100
    },
    "temp": {
      "mean": 36.9,
      "std": 0.4,
      "margin": 0.6,
      "min": 36.2,
      "max": 38.0
    }
  },
  "tuberculosis": {
    "hr": {
      "mean": 105,
      "std": 15,
      "margin": 15,
      "min": 60,
      "max": 160
    },
    "sbp": {
      "mean": 115,
      "std": 18,
      "margin": 20,
      "min": 85,
      "max": 160
    },
    "dbp": {
      "mean": 72,
      "std": 12,
      "margin": 15,
      "min": 50,
      "max": 100
    },
    "rr": {
      "mean": 20,
      "std": 4,
      "margin": 4,
      "min": 12,
      "max": 35
    },
    "spo2": {
      "mean": 97,
      "std": 2,
      "margin": 2,
      "min": 92,
      "max": 100
    },
    "temp": {
      "mean": 38.8,
      "std": 0.8,
      "margin": 0.6,
      "min": 37.5,
      "max": 41.2
    }
  },
  "typhoid": {
    "hr": {
      "mean": 72,
      "std": 8,
      "margin": 10,
      "min": 55,
      "max": 88
    },
    "sbp": {
      "mean": 110,
      "std": 12,
      "margin": 15,
      "min": 90,
      "max": 135
    },
    "dbp": {
      "mean": 70,
      "std": 10,
      "margin": 12,
      "min": 55,
      "max": 88
    },
    "rr": {
      "mean": 18,
      "std": 2,
      "margin": 3,
      "min": 14,
      "max": 24
    },
    "spo2": {
      "mean": 98,
      "std": 1,
      "margin": 2,
      "min": 95,
      "max": 100
    },
    "temp": {
      "mean": 39.6,
      "std": 0.6,
      "margin": 0.6,
      "min": 38.5,
      "max": 41.2
    }
  },
  "ulcerative_colitis": {
    "hr": {
      "mean": 92,
      "std": 15,
      "margin": 15,
      "min": 60,
      "max": 140
    },
    "sbp": {
      "mean": 122,
      "std": 18,
      "margin": 20,
      "min": 85,
      "max": 165
    },
    "dbp": {
      "mean": 76,
      "std": 12,
      "margin": 15,
      "min": 50,
      "max": 100
    },
    "rr": {
      "mean": 18,
      "std": 3,
      "margin": 3,
      "min": 12,
      "max": 28
    },
    "spo2": {
      "mean": 98,
      "std": 2,
      "margin": 2,
      "min": 94,
      "max": 100
    },
    "temp": {
      "mean": 37.5,
      "std": 0.7,
      "margin": 0.6,
      "min": 36.4,
      "max": 39.5
    }
  },
  "unstable_angina": {
    "hr": {
      "mean": 100,
      "std": 22,
      "margin": 20,
      "min": 45,
      "max": 180
    },
    "sbp": {
      "mean": 130,
      "std": 30,
      "margin": 25,
      "min": 70,
      "max": 220
    },
    "dbp": {
      "mean": 80,
      "std": 18,
      "margin": 18,
      "min": 40,
      "max": 130
    },
    "rr": {
      "mean": 22,
      "std": 5,
      "margin": 4,
      "min": 14,
      "max": 38
    },
    "spo2": {
      "mean": 94,
      "std": 4,
      "margin": 3,
      "min": 82,
      "max": 100
    },
    "temp": {
      "mean": 37.0,
      "std": 0.4,
      "margin": 0.6,
      "min": 36.2,
      "max": 38.2
    }
  },
  "urti": {
    "hr": {
      "mean": 105,
      "std": 15,
      "margin": 15,
      "min": 60,
      "max": 160
    },
    "sbp": {
      "mean": 115,
      "std": 18,
      "margin": 20,
      "min": 85,
      "max": 160
    },
    "dbp": {
      "mean": 72,
      "std": 12,
      "margin": 15,
      "min": 50,
      "max": 100
    },
    "rr": {
      "mean": 20,
      "std": 4,
      "margin": 4,
      "min": 12,
      "max": 35
    },
    "spo2": {
      "mean": 97,
      "std": 2,
      "margin": 2,
      "min": 92,
      "max": 100
    },
    "temp": {
      "mean": 38.8,
      "std": 0.8,
      "margin": 0.6,
      "min": 37.5,
      "max": 41.2
    }
  },
  "viral_pharyngitis": {
    "hr": {
      "mean": 105,
      "std": 15,
      "margin": 15,
      "min": 60,
      "max": 160
    },
    "sbp": {
      "mean": 115,
      "std": 18,
      "margin": 20,
      "min": 85,
      "max": 160
    },
    "dbp": {
      "mean": 72,
      "std": 12,
      "margin": 15,
      "min": 50,
      "max": 100
    },
    "rr": {
      "mean": 20,
      "std": 4,
      "margin": 4,
      "min": 12,
      "max": 35
    },
    "spo2": {
      "mean": 97,
      "std": 2,
      "margin": 2,
      "min": 92,
      "max": 100
    },
    "temp": {
      "mean": 38.8,
      "std": 0.8,
      "margin": 0.6,
      "min": 37.5,
      "max": 41.2
    }
  },
  "whooping_cough": {
    "hr": {
      "mean": 105,
      "std": 15,
      "margin": 15,
      "min": 60,
      "max": 160
    },
    "sbp": {
      "mean": 115,
      "std": 18,
      "margin": 20,
      "min": 85,
      "max": 160
    },
    "dbp": {
      "mean": 72,
      "std": 12,
      "margin": 15,
      "min": 50,
      "max": 100
    },
    "rr": {
      "mean": 20,
      "std": 4,
      "margin": 4,
      "min": 12,
      "max": 35
    },
    "spo2": {
      "mean": 97,
      "std": 2,
      "margin": 2,
      "min": 92,
      "max": 100
    },
    "temp": {
      "mean": 38.8,
      "std": 0.8,
      "margin": 0.6,
      "min": 37.5,
      "max": 41.2
    }
  }
};

/**
 * Helper to fetch a disease vitals profile by ID or Name
 */
export function getDiseaseVitals(idOrName: string): DiseaseVitalsProfile | undefined {
  if (DISEASE_VITALS_ONTOLOGY[idOrName]) {
    return DISEASE_VITALS_ONTOLOGY[idOrName];
  }
  const norm = idOrName.toLowerCase().replace(/[^a-z0-9]/g, "");
  for (const [k, v] of Object.entries(DISEASE_VITALS_ONTOLOGY)) {
    if (k.toLowerCase().replace(/[^a-z0-9]/g, "") === norm) {
      return v;
    }
  }
  return undefined;
}

/**
 * Calculates continuous Gaussian likelihood with clinical margin buffer:
 * - If value is within [mean - margin, mean + margin]: Multiplier = 1.0 (Zero penalty)
 * - If value is outside margin: effective_dev = (|val - mean| - margin) / std
 *   Multiplier = exp(-0.5 * effective_dev^2)
 * - If value is missing / undefined / 0: Multiplier = 1.0 (Neutral)
 */
export function calculateVitalLikelihood(
  measured: number | undefined | null,
  param: VitalParameter,
  vitalName: string,
  unit: string
): VitalLikelihoodResult {
  if (measured === undefined || measured === null || isNaN(measured) || measured <= 0) {
    return { multiplier: 1.0, deviation: 0 };
  }

  const delta = Math.abs(measured - param.mean);
  if (delta <= param.margin) {
    return {
      multiplier: 1.0,
      deviation: 0,
      note: `${vitalName} ${measured}${unit} within tolerance margin (${param.mean} ± ${param.margin}${unit})`
    };
  }

  const effectiveDev = (delta - param.margin) / Math.max(1.0, param.std);
  // Soft exponential decay; lower bounded at 0.005 to avoid numerical vanishing
  const multiplier = Math.max(0.005, Math.exp(-0.5 * effectiveDev * effectiveDev));

  const direction = measured > param.mean ? "elevated above" : "depressed below";
  const note = `${vitalName} ${measured}${unit} is ${direction} expected window (${param.mean} ± ${param.margin}${unit}, dev: ${effectiveDev.toFixed(1)}σ)`;

  return {
    multiplier,
    deviation: effectiveDev,
    note
  };
}

/**
 * Evaluates patient vitals against a disease profile with soft margin tolerance.
 * Returns status: "favored" | "compatible" | "eliminated"
 */
export function evaluatePatientVitalsForDisease(
  vitals: {
    bpSystolic?: number;
    bpDiastolic?: number;
    heartRate?: number;
    respiratoryRate?: number;
    spo2?: number;
    temperatureC?: number;
  } | undefined,
  diseaseId: string,
  diseaseName: string
): VitalsEliminationEvaluation {
  const profile = getDiseaseVitals(diseaseId) || getDiseaseVitals(diseaseName);

  if (!profile || !vitals) {
    return {
      diseaseId,
      diseaseName,
      status: "compatible",
      overallMultiplier: 1.0,
      vitalMultipliers: { hr: 1, sbp: 1, dbp: 1, rr: 1, spo2: 1, temp: 1 },
      eliminationReasons: [],
      supportingReasons: ["No contradictory vital signs recorded"]
    };
  }

  const resHr = calculateVitalLikelihood(vitals.heartRate, profile.hr, "Heart Rate", " bpm");
  const resSbp = calculateVitalLikelihood(vitals.bpSystolic, profile.sbp, "Systolic BP", " mmHg");
  const resDbp = calculateVitalLikelihood(vitals.bpDiastolic, profile.dbp, "Diastolic BP", " mmHg");
  const resRr = calculateVitalLikelihood(vitals.respiratoryRate, profile.rr, "Resp Rate", " /min");
  const resSpo2 = calculateVitalLikelihood(vitals.spo2, profile.spo2, "SpO2", "%");
  const resTemp = calculateVitalLikelihood(vitals.temperatureC, profile.temp, "Temperature", "°C");

  const overallMultiplier =
    resHr.multiplier *
    resSbp.multiplier *
    resDbp.multiplier *
    resRr.multiplier *
    resSpo2.multiplier *
    resTemp.multiplier;

  const eliminationReasons: string[] = [];
  const supportingReasons: string[] = [];

  [resHr, resSbp, resDbp, resRr, resSpo2, resTemp].forEach(r => {
    if (r.note) {
      if (r.multiplier < 0.25) {
        eliminationReasons.push(r.note);
      } else if (r.multiplier >= 0.95 && r.deviation === 0) {
        supportingReasons.push(r.note);
      }
    }
  });

  let status: "favored" | "compatible" | "eliminated" = "compatible";
  if (overallMultiplier < 0.15 || eliminationReasons.length >= 2) {
    status = "eliminated";
  } else if (overallMultiplier >= 0.70 && supportingReasons.length >= 2) {
    status = "favored";
  }

  return {
    diseaseId,
    diseaseName,
    status,
    overallMultiplier,
    vitalMultipliers: {
      hr: resHr.multiplier,
      sbp: resSbp.multiplier,
      dbp: resDbp.multiplier,
      rr: resRr.multiplier,
      spo2: resSpo2.multiplier,
      temp: resTemp.multiplier
    },
    eliminationReasons,
    supportingReasons
  };
}
