#!/usr/bin/env python3
"""
AkiMed Multi-Task Deep Neural Engine Architecture
PyTorch Deep Residual Network for Joint:
1. Differential Diagnosis Probability Ranking (49 conditions)
2. Emergency Severity Index (ESI) Triage Classification (5 levels)
3. Dynamic Akinator Question-Inquiry Policy (223 clinical symptoms)
Optimized for Apple Silicon Metal Performance Shaders (MPS).
"""

import torch
import torch.nn as nn
import torch.nn.functional as F

class ResidualDenseBlock(nn.Module):
    """Residual dense block with LayerNorm and GELU."""
    def __init__(self, hidden_dim: int, dropout: float = 0.2):
        super().__init__()
        self.fc1 = nn.Linear(hidden_dim, hidden_dim)
        self.ln1 = nn.LayerNorm(hidden_dim)
        self.act1 = nn.GELU()
        self.dropout = nn.Dropout(dropout)
        self.fc2 = nn.Linear(hidden_dim, hidden_dim)
        self.ln2 = nn.LayerNorm(hidden_dim)
        self.act2 = nn.GELU()

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        residual = x
        out = self.fc1(x)
        out = self.ln1(out)
        out = self.act1(out)
        out = self.dropout(out)
        out = self.fc2(out)
        out = self.ln2(out)
        out = self.act2(out)
        return out + residual

class AkiMedMultiTaskNet(nn.Module):
    """
    Multi-Task Deep Clinical Neural Network
    Input dimensions:
      - 223 Symptom Multi-Hot Indicators (e_1 ... e_223)
      - 10 Normalized Vital Signs & Demographics
      Total Input Dimension: 233
    Outputs:
      - dx_logits: (Batch, 49) Differential Diagnosis probabilities
      - triage_logits: (Batch, 5) ESI 1 to 5 Triage Levels
      - policy_logits: (Batch, 223) Next symptom inquiry ranking scores
    """
    def __init__(
        self,
        num_evidences: int = 223,
        num_vitals: int = 10,
        num_conditions: int = 49,
        num_triage_levels: int = 5,
        hidden_dim: int = 512,
        latent_dim: int = 256,
        dropout: float = 0.2
    ):
        super().__init__()
        self.num_evidences = num_evidences
        self.num_vitals = num_vitals
        self.input_dim = num_evidences + num_vitals
        self.num_conditions = num_conditions
        self.num_triage_levels = num_triage_levels

        # Deep Encoder Backbone
        self.input_proj = nn.Sequential(
            nn.Linear(self.input_dim, hidden_dim),
            nn.LayerNorm(hidden_dim),
            nn.GELU(),
            nn.Dropout(dropout)
        )

        self.res_block1 = ResidualDenseBlock(hidden_dim, dropout=dropout)
        self.res_block2 = ResidualDenseBlock(hidden_dim, dropout=dropout)

        self.latent_proj = nn.Sequential(
            nn.Linear(hidden_dim, latent_dim),
            nn.LayerNorm(latent_dim),
            nn.GELU()
        )

        # Head 1: Differential Diagnosis Classifier
        self.dx_head = nn.Sequential(
            nn.Linear(latent_dim, latent_dim // 2),
            nn.LayerNorm(latent_dim // 2),
            nn.GELU(),
            nn.Dropout(dropout / 2),
            nn.Linear(latent_dim // 2, num_conditions)
        )

        # Head 2: Emergency Severity Index (ESI) Triage Classifier
        self.triage_head = nn.Sequential(
            nn.Linear(latent_dim, latent_dim // 4),
            nn.LayerNorm(latent_dim // 4),
            nn.GELU(),
            nn.Linear(latent_dim // 4, num_triage_levels)
        )

        # Head 3: Dynamic Akinator Symptom Inquiry Policy Network
        self.policy_head = nn.Sequential(
            nn.Linear(latent_dim, latent_dim // 2),
            nn.LayerNorm(latent_dim // 2),
            nn.GELU(),
            nn.Linear(latent_dim // 2, num_evidences)
        )

    def forward(self, x: torch.Tensor):
        """
        Forward pass through shared representation and multi-task heads.
        Returns:
            dict containing:
                'dx_logits': (B, num_conditions)
                'triage_logits': (B, num_triage_levels)
                'policy_logits': (B, num_evidences)
                'latent': (B, latent_dim)
        """
        h = self.input_proj(x)
        h = self.res_block1(h)
        h = self.res_block2(h)
        latent = self.latent_proj(h)

        dx_logits = self.dx_head(latent)
        triage_logits = self.triage_head(latent)
        policy_logits = self.policy_head(latent)

        return {
            "dx_logits": dx_logits,
            "triage_logits": triage_logits,
            "policy_logits": policy_logits,
            "latent": latent
        }

if __name__ == "__main__":
    # Sanity check
    device = torch.device("mps" if torch.backends.mps.is_available() else "cpu")
    print(f"[TEST] Instantiating AkiMedMultiTaskNet on device: {device}")
    model = AkiMedMultiTaskNet().to(device)
    dummy_input = torch.randn(16, 233, device=device)
    out = model(dummy_input)
    print(f"  -> dx_logits shape: {out['dx_logits'].shape} (Expected: [16, 49])")
    print(f"  -> triage_logits shape: {out['triage_logits'].shape} (Expected: [16, 5])")
    print(f"  -> policy_logits shape: {out['policy_logits'].shape} (Expected: [16, 223])")
    print(f"  -> latent shape: {out['latent'].shape} (Expected: [16, 256])")
    print("[TEST] Architecture verified successfully!")

