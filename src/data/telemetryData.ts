export interface CheckpointItem {
  name: string;
  path: string;
  size_mb: number;
  modified: string;
}

export interface EpochHistory {
  epoch: number;
  train_loss: number;
  train_dx_acc: number;
  val_top1_acc: number;
  val_top3_acc: number;
  val_triage_acc: number;
  elapsed_sec: number;
}

export interface ClinicalMasteryReport {
  benchmark_title: string;
  timestamp: string;
  compute_device: string;
  total_test_duration_sec: number;
  overall_mastery_index: number;
  overall_mastery_grade: string;
  certification_status: string;
  battery_scores: {
    chatbox_nlp_extraction_score: number;
    inquiry_policy_mastery_score: number;
    diagnostic_triage_mastery_score: number;
  };
  battery_a_chatbox_extraction: {
    battery_name: string;
    precision: number;
    recall: number;
    f1_score: number;
    typo_recovery_rate: number;
    protected_vocab_violations: number;
    cases_tested: number;
  };
  battery_b_inquiry_policy: {
    battery_name: string;
    deduplication_rate: number;
    hypothesis_alignment_rate: number;
    average_game_turns: number;
    stopping_compliance_rate: number;
    early_conclusions: number;
    full_budget_conclusions: number;
    games_simulated: number;
  };
  battery_c_diagnostic_triage: {
    battery_name: string;
    top1_accuracy: number;
    top3_accuracy: number;
    triage_accuracy: number;
    critical_emergency_safety_rate: number;
    cases_evaluated: number;
  };
}

export interface TelemetryData {
  active_model: {
    name: string;
    version: string;
    weights_path: string;
    weights_size_mb: number;
    device: string;
    architecture: string;
    trained_samples: number;
    val_top1_acc: number;
    val_top3_acc: number;
    val_triage_acc: number;
    saved_root_dir: string;
  };
  checkpoints: CheckpointItem[];
  training_history: EpochHistory[];
  clinical_mastery_report?: ClinicalMasteryReport;
  adversarial_stress_report?: {
    total_adversarial_cases_evaluated?: number;
    total_benchmark_time_seconds?: number;
    composite_safety_evaluation?: {
      asymmetric_clinical_safety_score_pct: number;
      chameleon_lethal_differential_top3_pct: number;
      multimorbid_crisis_top3_pct: number;
      certification_status: string;
    };
    algorithms_evaluated?: any;
  };
  baseline_stress_report?: any;
}

export const DEFAULT_TELEMETRY_DATA: TelemetryData = {
  active_model: {
    name: "AkiMed 16-Layer Deep Clinical Attention Transformer (200M Scale)",
    version: "2.5.0",
    weights_path: "/Volumes/Trishil/Akimed_data/models/clinical_transformer_100plus_best.pt",
    weights_size_mb: 812.30,
    device: "Apple Silicon MPS (Metal Performance Shaders)",
    architecture: "16 Pre-LN Attention Layers (16 tokens x 1024d embed_dim, 16 heads, 212.9M params)",
    trained_samples: 155400,
    val_top1_acc: 98.56,
    val_top3_acc: 99.82,
    val_triage_acc: 99.80,
    saved_root_dir: "/Volumes/Trishil/Akimed_data/models"
  },
  checkpoints: [
    {
      name: "clinical_transformer_100plus_best.pt",
      path: "/Volumes/Trishil/Akimed_data/models/clinical_transformer_100plus_best.pt",
      size_mb: 812.30,
      modified: "2026-10-13 23:05:00"
    }
  ],
  training_history: [
    {
      epoch: 1,
      train_loss: 4.7143,
      train_dx_acc: 18.64,
      val_top1_acc: 51.44,
      val_top3_acc: 74.41,
      val_triage_acc: 99.80,
      elapsed_sec: 438.0
    },
    {
      epoch: 2,
      train_loss: 3.3331,
      train_dx_acc: 33.85,
      val_top1_acc: 58.47,
      val_top3_acc: 85.86,
      val_triage_acc: 99.80,
      elapsed_sec: 235.5
    },
    {
      epoch: 3,
      train_loss: 2.8456,
      train_dx_acc: 36.66,
      val_top1_acc: 66.58,
      val_top3_acc: 91.98,
      val_triage_acc: 99.80,
      elapsed_sec: 208.9
    },
    {
      epoch: 4,
      train_loss: 2.3217,
      train_dx_acc: 47.15,
      val_top1_acc: 76.13,
      val_top3_acc: 98.29,
      val_triage_acc: 99.80,
      elapsed_sec: 192.3
    },
    {
      epoch: 5,
      train_loss: 2.0557,
      train_dx_acc: 54.39,
      val_top1_acc: 80.99,
      val_top3_acc: 97.84,
      val_triage_acc: 99.80,
      elapsed_sec: 155.1
    },
    {
      epoch: 6,
      train_loss: 1.8417,
      train_dx_acc: 56.93,
      val_top1_acc: 88.29,
      val_top3_acc: 99.37,
      val_triage_acc: 99.80,
      elapsed_sec: 199.8
    },
    {
      epoch: 7,
      train_loss: 1.7895,
      train_dx_acc: 58.31,
      val_top1_acc: 89.91,
      val_top3_acc: 99.46,
      val_triage_acc: 99.80,
      elapsed_sec: 182.5
    },
    {
      epoch: 8,
      train_loss: 1.6721,
      train_dx_acc: 62.39,
      val_top1_acc: 89.37,
      val_top3_acc: 99.28,
      val_triage_acc: 99.80,
      elapsed_sec: 188.5
    },
    {
      epoch: 9,
      train_loss: 1.6066,
      train_dx_acc: 62.64,
      val_top1_acc: 91.35,
      val_top3_acc: 99.01,
      val_triage_acc: 99.80,
      elapsed_sec: 184.7
    },
    {
      epoch: 10,
      train_loss: 1.5515,
      train_dx_acc: 63.56,
      val_top1_acc: 93.78,
      val_top3_acc: 98.83,
      val_triage_acc: 99.80,
      elapsed_sec: 182.6
    },
    {
      epoch: 11,
      train_loss: 1.5077,
      train_dx_acc: 64.33,
      val_top1_acc: 92.70,
      val_top3_acc: 99.55,
      val_triage_acc: 99.80,
      elapsed_sec: 208.6
    },
    {
      epoch: 12,
      train_loss: 1.4545,
      train_dx_acc: 65.78,
      val_top1_acc: 90.81,
      val_top3_acc: 99.82,
      val_triage_acc: 99.80,
      elapsed_sec: 221.8
    },
    {
      epoch: 13,
      train_loss: 1.4212,
      train_dx_acc: 66.92,
      val_top1_acc: 92.70,
      val_top3_acc: 99.64,
      val_triage_acc: 99.80,
      elapsed_sec: 361.3
    },
    {
      epoch: 14,
      train_loss: 1.3558,
      train_dx_acc: 67.21,
      val_top1_acc: 95.95,
      val_top3_acc: 99.82,
      val_triage_acc: 99.80,
      elapsed_sec: 301.1
    },
    {
      epoch: 15,
      train_loss: 1.3717,
      train_dx_acc: 66.96,
      val_top1_acc: 94.59,
      val_top3_acc: 100.00,
      val_triage_acc: 99.80,
      elapsed_sec: 163.1
    },
    {
      epoch: 16,
      train_loss: 1.3154,
      train_dx_acc: 68.57,
      val_top1_acc: 95.23,
      val_top3_acc: 99.73,
      val_triage_acc: 99.80,
      elapsed_sec: 541.0
    },
    {
      epoch: 17,
      train_loss: 1.2884,
      train_dx_acc: 68.91,
      val_top1_acc: 96.13,
      val_top3_acc: 100.00,
      val_triage_acc: 99.80,
      elapsed_sec: 265.6
    },
    {
      epoch: 18,
      train_loss: 1.2600,
      train_dx_acc: 69.18,
      val_top1_acc: 96.67,
      val_top3_acc: 99.73,
      val_triage_acc: 99.80,
      elapsed_sec: 400.8
    },
    {
      epoch: 19,
      train_loss: 1.2246,
      train_dx_acc: 69.45,
      val_top1_acc: 96.31,
      val_top3_acc: 99.91,
      val_triage_acc: 99.80,
      elapsed_sec: 650.2
    },
    {
      epoch: 20,
      train_loss: 1.2154,
      train_dx_acc: 69.36,
      val_top1_acc: 96.40,
      val_top3_acc: 100.00,
      val_triage_acc: 99.80,
      elapsed_sec: 396.4
    },
    {
      epoch: 21,
      train_loss: 1.1490,
      train_dx_acc: 71.31,
      val_top1_acc: 95.23,
      val_top3_acc: 99.91,
      val_triage_acc: 99.80,
      elapsed_sec: 309.6
    },
    {
      epoch: 22,
      train_loss: 1.1527,
      train_dx_acc: 72.44,
      val_top1_acc: 96.67,
      val_top3_acc: 100.00,
      val_triage_acc: 99.80,
      elapsed_sec: 339.1
    },
    {
      epoch: 23,
      train_loss: 1.1371,
      train_dx_acc: 71.08,
      val_top1_acc: 97.12,
      val_top3_acc: 99.91,
      val_triage_acc: 99.80,
      elapsed_sec: 273.9
    },
    {
      epoch: 24,
      train_loss: 1.0658,
      train_dx_acc: 73.41,
      val_top1_acc: 97.57,
      val_top3_acc: 99.82,
      val_triage_acc: 99.80,
      elapsed_sec: 257.9
    },
    {
      epoch: 25,
      train_loss: 1.0734,
      train_dx_acc: 72.98,
      val_top1_acc: 96.94,
      val_top3_acc: 99.73,
      val_triage_acc: 99.80,
      elapsed_sec: 262.3
    },
    {
      epoch: 26,
      train_loss: 1.0481,
      train_dx_acc: 72.64,
      val_top1_acc: 97.48,
      val_top3_acc: 99.73,
      val_triage_acc: 99.80,
      elapsed_sec: 310.2
    },
    {
      epoch: 27,
      train_loss: 1.0853,
      train_dx_acc: 72.28,
      val_top1_acc: 98.02,
      val_top3_acc: 100.00,
      val_triage_acc: 99.80,
      elapsed_sec: 284.0
    },
    {
      epoch: 28,
      train_loss: 1.0400,
      train_dx_acc: 73.87,
      val_top1_acc: 97.03,
      val_top3_acc: 99.91,
      val_triage_acc: 99.80,
      elapsed_sec: 293.0
    },
    {
      epoch: 29,
      train_loss: 1.0240,
      train_dx_acc: 73.23,
      val_top1_acc: 97.03,
      val_top3_acc: 99.82,
      val_triage_acc: 99.80,
      elapsed_sec: 308.7
    },
    {
      epoch: 30,
      train_loss: 1.0208,
      train_dx_acc: 74.32,
      val_top1_acc: 98.20,
      val_top3_acc: 99.82,
      val_triage_acc: 99.80,
      elapsed_sec: 301.3
    },
    {
      epoch: 31,
      train_loss: 0.9951,
      train_dx_acc: 74.66,
      val_top1_acc: 98.56,
      val_top3_acc: 99.82,
      val_triage_acc: 99.80,
      elapsed_sec: 254.7
    },
    {
      epoch: 32,
      train_loss: 1.0047,
      train_dx_acc: 74.34,
      val_top1_acc: 97.66,
      val_top3_acc: 99.64,
      val_triage_acc: 99.80,
      elapsed_sec: 257.3
    },
    {
      epoch: 33,
      train_loss: 1.0224,
      train_dx_acc: 73.89,
      val_top1_acc: 98.38,
      val_top3_acc: 99.91,
      val_triage_acc: 99.80,
      elapsed_sec: 240.9
    },
    {
      epoch: 34,
      train_loss: 1.0003,
      train_dx_acc: 74.21,
      val_top1_acc: 98.20,
      val_top3_acc: 99.91,
      val_triage_acc: 99.80,
      elapsed_sec: 306.2
    },
    {
      epoch: 35,
      train_loss: 0.9893,
      train_dx_acc: 74.39,
      val_top1_acc: 98.20,
      val_top3_acc: 99.82,
      val_triage_acc: 99.80,
      elapsed_sec: 283.9
    }
  ],
  adversarial_stress_report: {
    total_adversarial_cases_evaluated: 25000,
    total_benchmark_time_seconds: 214.45,
    composite_safety_evaluation: {
      asymmetric_clinical_safety_score_pct: 94.15,
      chameleon_lethal_differential_top3_pct: 75.1,
      multimorbid_crisis_top3_pct: 43.68,
      certification_status: "SAFETY_CERTIFIED"
    },
    algorithms_evaluated: {
      algorithm_1_saliency_guided_perturbation: {
        trials: 3000,
        resistance_rate_pct: 62.83,
        avg_flip_radius: 4.06,
        flipped_within_1_to_2_symptoms_pct: 32.1
      },
      algorithm_2_chameleon_mimic_collision: {
        cases_tested: 5000,
        lethal_dilemmas_evaluated: 490,
        lethal_top3_preservation_rate_pct: 75.1,
        protective_triage_rate_pct: 99.39,
        top_mimic_pairs_evaluated: 20
      },
      algorithm_3_multimorbidity_superposition: {
        cases_tested: 5000,
        multimorbid_acute_top1_pct: 29.72,
        multimorbid_acute_top3_pct: 43.68,
        multimorbid_triage_protective_pct: 93.36
      },
      algorithm_4_stochastic_patient_archetypes: {
        minimalist_cases: 3500,
        minimalist_top3_retrieval_pct: 33.0,
        minimalist_catastrophic_under_triage_count: 236,
        somatizer_cases: 3500,
        somatizer_top1_accuracy_pct: 20.51,
        somatizer_top3_inclusion_pct: 35.09
      },
      algorithm_5_asymmetric_clinical_safety: {
        evaluated_cases: 5000,
        asymmetric_clinical_safety_score_pct: 94.15,
        total_penalty_accumulated: 51161.0,
        lethal_miss_count: 81,
        lethal_miss_rate_pct: 1.62
      }
    }
  },
  clinical_mastery_report: {
    benchmark_title: "AkiMed Clinical AI Autonomous Mastery Certification Report",
    timestamp: "2026-10-12 22:12:18",
    compute_device: "Apple Silicon MPS (Metal Performance Shaders)",
    total_test_duration_sec: 159.2,
    overall_mastery_index: 97.73,
    overall_mastery_grade: "Grade A+ (Clinical AI Master)",
    certification_status: "CERTIFIED_MASTER",
    battery_scores: {
      chatbox_nlp_extraction_score: 92.55,
      inquiry_policy_mastery_score: 99.07,
      diagnostic_triage_mastery_score: 99.80
    },
    battery_a_chatbox_extraction: {
      battery_name: "Battery A: Chatbox NLP Extraction",
      precision: 90.60,
      recall: 96.70,
      f1_score: 92.55,
      typo_recovery_rate: 100.0,
      protected_vocab_violations: 0,
      cases_tested: 1000
    },
    battery_b_inquiry_policy: {
      battery_name: "Battery B: Autonomous 20-Question Inquiry Policy",
      deduplication_rate: 100.0,
      hypothesis_alignment_rate: 98.13,
      average_game_turns: 14.45,
      stopping_compliance_rate: 100.0,
      early_conclusions: 745,
      full_budget_conclusions: 255,
      games_simulated: 1000
    },
    battery_c_diagnostic_triage: {
      battery_name: "Battery C: Diagnostic Identification & Triage",
      top1_accuracy: 99.50,
      top3_accuracy: 100.0,
      triage_accuracy: 100.0,
      critical_emergency_safety_rate: 100.0,
      cases_evaluated: 2000
    }
  },
  baseline_stress_report: {
    total_samples: 10000,
    top1_accuracy: 99.29,
    top3_accuracy: 99.99,
    esi_accuracy: 99.97,
    morbidity_clusters: 49
  }
};

