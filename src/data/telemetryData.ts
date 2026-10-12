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
    version: "2.3.0",
    weights_path: "/Volumes/Trishil/Akimed_data/models/akimed_clinical_transformer_best.pt",
    weights_size_mb: 34.48,
    device: "Apple Silicon MPS (Metal Performance Shaders)",
    architecture: "10 Pre-LN Attention Layers (8 tokens x 256d embed_dim, 4 heads)",
    trained_samples: 600000,
    val_top1_acc: 99.29,
    val_top3_acc: 99.99,
    val_triage_acc: 99.97,
    saved_root_dir: "/Volumes/Trishil/Akimed_data/models"
  },
  checkpoints: [
    {
      name: "checkpoint_epoch_1.pt",
      path: "/Volumes/Trishil/Akimed_data/models/checkpoints/checkpoint_epoch_1.pt",
      size_mb: 34.48,
      modified: "2026-09-23 21:58:12"
    },
    {
      name: "checkpoint_epoch_2.pt",
      path: "/Volumes/Trishil/Akimed_data/models/checkpoints/checkpoint_epoch_2.pt",
      size_mb: 34.48,
      modified: "2026-09-23 22:06:44"
    },
    {
      name: "checkpoint_epoch_3.pt",
      path: "/Volumes/Trishil/Akimed_data/models/checkpoints/checkpoint_epoch_3.pt",
      size_mb: 34.48,
      modified: "2026-09-23 22:15:30"
    },
    {
      name: "checkpoint_epoch_4.pt",
      path: "/Volumes/Trishil/Akimed_data/models/checkpoints/checkpoint_epoch_4.pt",
      size_mb: 34.48,
      modified: "2026-09-23 22:24:06"
    },
    {
      name: "checkpoint_epoch_5.pt",
      path: "/Volumes/Trishil/Akimed_data/models/checkpoints/checkpoint_epoch_5.pt",
      size_mb: 34.48,
      modified: "2026-09-23 22:32:48"
    },
    {
      name: "checkpoint_epoch_6_best.pt",
      path: "/Volumes/Trishil/Akimed_data/models/checkpoints/checkpoint_epoch_6_best.pt",
      size_mb: 34.48,
      modified: "2026-09-23 22:42:15"
    }
  ],
  training_history: [
    {
      epoch: 1,
      train_loss: 0.3735,
      train_dx_acc: 91.54,
      val_top1_acc: 99.27,
      val_top3_acc: 99.98,
      val_triage_acc: 99.97,
      elapsed_sec: 516.0
    },
    {
      epoch: 2,
      train_loss: 0.2292,
      train_dx_acc: 93.67,
      val_top1_acc: 99.23,
      val_top3_acc: 99.99,
      val_triage_acc: 99.94,
      elapsed_sec: 510.0
    },
    {
      epoch: 3,
      train_loss: 0.2102,
      train_dx_acc: 94.05,
      val_top1_acc: 99.23,
      val_top3_acc: 99.99,
      val_triage_acc: 99.95,
      elapsed_sec: 567.6
    },
    {
      epoch: 4,
      train_loss: 0.2000,
      train_dx_acc: 94.22,
      val_top1_acc: 99.28,
      val_top3_acc: 99.99,
      val_triage_acc: 99.98,
      elapsed_sec: 516.0
    },
    {
      epoch: 5,
      train_loss: 0.1904,
      train_dx_acc: 94.38,
      val_top1_acc: 99.28,
      val_top3_acc: 99.98,
      val_triage_acc: 99.97,
      elapsed_sec: 472.8
    },
    {
      epoch: 6,
      train_loss: 0.1840,
      train_dx_acc: 94.51,
      val_top1_acc: 99.29,
      val_top3_acc: 99.99,
      val_triage_acc: 99.97,
      elapsed_sec: 637.8
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
  baseline_stress_report: {
    total_samples: 10000,
    top1_accuracy: 99.29,
    top3_accuracy: 99.99,
    esi_accuracy: 99.97,
    morbidity_clusters: 49
  }
};

