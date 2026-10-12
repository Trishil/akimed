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
    name: "AkiMed 10-Layer Clinical Attention Transformer",
    version: "2.4.0",
    weights_path: "/Volumes/Trishil/Akimed_data/models/akimed_clinical_transformer_best.pt",
    weights_size_mb: 34.48,
    device: "Apple Silicon MPS (Metal Performance Shaders)",
    architecture: "10 Pre-LN Attention Layers (8 tokens x 256d embed_dim, 4 heads)",
    trained_samples: 600000,
    val_top1_acc: 99.50,
    val_top3_acc: 100.0,
    val_triage_acc: 100.0,
    saved_root_dir: "/Volumes/Trishil/Akimed_data/models"
  },
  checkpoints: [
    {
      name: "checkpoint_mastery_epoch_1.pt",
      path: "/Volumes/Trishil/Akimed_data/models/checkpoints/checkpoint_mastery_epoch_1.pt",
      size_mb: 34.48,
      modified: "2026-10-12 21:12:30"
    },
    {
      name: "checkpoint_mastery_epoch_2.pt",
      path: "/Volumes/Trishil/Akimed_data/models/checkpoints/checkpoint_mastery_epoch_2.pt",
      size_mb: 34.48,
      modified: "2026-10-12 21:22:42"
    },
    {
      name: "checkpoint_mastery_epoch_3.pt",
      path: "/Volumes/Trishil/Akimed_data/models/checkpoints/checkpoint_mastery_epoch_3.pt",
      size_mb: 34.48,
      modified: "2026-10-12 21:36:18"
    },
    {
      name: "checkpoint_mastery_epoch_4.pt",
      path: "/Volumes/Trishil/Akimed_data/models/checkpoints/checkpoint_mastery_epoch_4.pt",
      size_mb: 34.48,
      modified: "2026-10-12 21:47:20"
    },
    {
      name: "checkpoint_mastery_epoch_5.pt",
      path: "/Volumes/Trishil/Akimed_data/models/checkpoints/checkpoint_mastery_epoch_5.pt",
      size_mb: 34.48,
      modified: "2026-10-12 21:58:05"
    },
    {
      name: "checkpoint_mastery_epoch_6_best.pt",
      path: "/Volumes/Trishil/Akimed_data/models/checkpoints/checkpoint_mastery_epoch_6.pt",
      size_mb: 34.48,
      modified: "2026-10-12 22:09:15"
    }
  ],
  training_history: [
    {
      epoch: 1,
      train_loss: 1.0078,
      train_dx_acc: 73.47,
      val_top1_acc: 99.35,
      val_top3_acc: 100.0,
      val_triage_acc: 100.0,
      elapsed_sec: 624.0
    },
    {
      epoch: 2,
      train_loss: 0.9773,
      train_dx_acc: 73.83,
      val_top1_acc: 99.40,
      val_top3_acc: 100.0,
      val_triage_acc: 100.0,
      elapsed_sec: 612.0
    },
    {
      epoch: 3,
      train_loss: 0.9643,
      train_dx_acc: 74.01,
      val_top1_acc: 99.35,
      val_top3_acc: 100.0,
      val_triage_acc: 100.0,
      elapsed_sec: 882.0
    },
    {
      epoch: 4,
      train_loss: 0.9460,
      train_dx_acc: 74.32,
      val_top1_acc: 99.60,
      val_top3_acc: 100.0,
      val_triage_acc: 100.0,
      elapsed_sec: 660.0
    },
    {
      epoch: 5,
      train_loss: 0.9381,
      train_dx_acc: 74.50,
      val_top1_acc: 99.25,
      val_top3_acc: 100.0,
      val_triage_acc: 100.0,
      elapsed_sec: 642.0
    },
    {
      epoch: 6,
      train_loss: 0.9330,
      train_dx_acc: 74.61,
      val_top1_acc: 99.50,
      val_top3_acc: 100.0,
      val_triage_acc: 100.0,
      elapsed_sec: 672.0
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

