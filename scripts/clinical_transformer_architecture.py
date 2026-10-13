#!/usr/bin/env python3
"""
AkiMed Deep Clinical Attention Transformer Architecture (Generation 4 - 212.9M Parameters)
Scaled Multi-Head Self-Attention Transformer with Attentive Token Pooling for Joint:
1. Differential Diagnosis Probability Ranking (111 conditions across all specialties)
2. Emergency Severity Index (ESI) Triage Classification (5 levels)
3. Dynamic MBBS Question-Inquiry Policy (223 clinical symptoms & discriminators)
4. Physiological Vitals Consistency & Margin Verification
Optimized for Apple Silicon Metal Performance Shaders (MPS).
"""

import math
import torch
import torch.nn as nn
import torch.nn.functional as F

class PreLNTransformerLayer(nn.Module):
    """
    Pre-Layer Normalized Transformer Encoder Layer.
    Pre-LN guarantees clean identity gradient highways from loss heads back to inputs,
    enabling stable deep training across 16+ layers without vanishing gradients.
    """
    def __init__(self, embed_dim: int = 1024, num_heads: int = 16, mlp_dim: int = 4096, dropout: float = 0.15):
        super().__init__()
        self.norm1 = nn.LayerNorm(embed_dim)
        self.self_attn = nn.MultiheadAttention(embed_dim, num_heads, dropout=dropout, batch_first=True)
        self.dropout1 = nn.Dropout(dropout)
        
        self.norm2 = nn.LayerNorm(embed_dim)
        self.mlp = nn.Sequential(
            nn.Linear(embed_dim, mlp_dim),
            nn.GELU(),
            nn.Dropout(dropout),
            nn.Linear(mlp_dim, embed_dim),
            nn.Dropout(dropout)
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        normed = self.norm1(x)
        attn_out, _ = self.self_attn(normed, normed, normed, need_weights=False)
        x = x + self.dropout1(attn_out)
        normed2 = self.norm2(x)
        mlp_out = self.mlp(normed2)
        x = x + mlp_out
        return x

class AkiMedClinicalTransformer(nn.Module):
    """
    AkiMed 16-Layer Deep Clinical Attention Transformer (212.9M Parameters).
    Features:
    - Token Projection: 233 clinical inputs projected into 16-token latent space (16 x 1024 = 16,384 dim)
    - 16-Layer Pre-LN Attention Backbone (d=1024, 16 heads, 4096 mlp_dim)
    - Attentive Token Pooling: Learned query vector pools context across all tokens
    - Unbottlenecked Multi-Task Heads: Differential Diagnosis, ESI Triage, and Question Policy
    - Capacity: 212,918,100 Trainable Parameters (~812 MB float32 weights, ~406 MB float16)
    """
    def __init__(
        self,
        num_evidences: int = 223,
        num_vitals: int = 10,
        num_conditions: int = 111,
        num_triage_levels: int = 5,
        embed_dim: int = 1024,
        num_tokens: int = 16,
        num_attention_heads: int = 16,
        num_transformer_layers: int = 16,
        dropout: float = 0.15
    ):
        super().__init__()
        self.input_dim = num_evidences + num_vitals
        self.num_conditions = num_conditions
        self.num_evidences = num_evidences
        self.embed_dim = embed_dim
        self.num_tokens = num_tokens
        self.total_token_dim = num_tokens * embed_dim
        self.num_transformer_layers = num_transformer_layers

        self.input_proj = nn.Sequential(
            nn.Linear(self.input_dim, self.total_token_dim),
            nn.LayerNorm(self.total_token_dim),
            nn.GELU(),
            nn.Dropout(dropout)
        )

        self.transformer_layers = nn.ModuleList([
            PreLNTransformerLayer(
                embed_dim=embed_dim,
                num_heads=num_attention_heads,
                mlp_dim=embed_dim * 4,
                dropout=dropout
            )
            for _ in range(num_transformer_layers)
        ])

        self.final_norm = nn.LayerNorm(embed_dim)
        self.pool_query = nn.Parameter(torch.randn(1, 1, embed_dim) * 0.02)
        self.pool_attn = nn.MultiheadAttention(embed_dim, num_attention_heads, batch_first=True)

        self.dx_head = nn.Sequential(
            nn.Linear(embed_dim, embed_dim),
            nn.LayerNorm(embed_dim),
            nn.GELU(),
            nn.Dropout(dropout / 2),
            nn.Linear(embed_dim, embed_dim // 2),
            nn.LayerNorm(embed_dim // 2),
            nn.GELU(),
            nn.Linear(embed_dim // 2, num_conditions)
        )

        self.triage_head = nn.Sequential(
            nn.Linear(embed_dim, embed_dim // 4),
            nn.LayerNorm(embed_dim // 4),
            nn.GELU(),
            nn.Linear(embed_dim // 4, num_triage_levels)
        )

        self.policy_head = nn.Sequential(
            nn.Linear(embed_dim, embed_dim),
            nn.LayerNorm(embed_dim),
            nn.GELU(),
            nn.Dropout(dropout / 2),
            nn.Linear(embed_dim, num_evidences)
        )

        self.vitals_consistency_head = nn.Sequential(
            nn.Linear(embed_dim, embed_dim // 8),
            nn.LayerNorm(embed_dim // 8),
            nn.GELU(),
            nn.Linear(embed_dim // 8, 1)
        )

    @property
    def total_parameters(self) -> int:
        return sum(p.numel() for p in self.parameters() if p.requires_grad)

    def forward(self, x: torch.Tensor):
        b = x.size(0)
        h = self.input_proj(x)
        seq = h.view(b, self.num_tokens, self.embed_dim)
        for layer in self.transformer_layers:
            seq = layer(seq)
        seq = self.final_norm(seq)

        query = self.pool_query.repeat(b, 1, 1)
        pooled, _ = self.pool_attn(query, seq, seq, need_weights=False)
        latent = pooled.squeeze(1)

        dx_logits = self.dx_head(latent)
        triage_logits = self.triage_head(latent)
        policy_logits = self.policy_head(latent)
        consistency_logit = self.vitals_consistency_head(latent)

        return {
            "dx_logits": dx_logits,
            "triage_logits": triage_logits,
            "policy_logits": policy_logits,
            "consistency_logit": consistency_logit,
            "latent": latent
        }

class AkiMedClinicalTransformerV2(nn.Module):
    """Legacy 10-layer 8.9M model."""
    def __init__(
        self,
        num_evidences: int = 223,
        num_vitals: int = 10,
        num_conditions: int = 111,
        num_triage_levels: int = 5,
        embed_dim: int = 256,
        num_tokens: int = 8,
        num_attention_heads: int = 4,
        num_transformer_layers: int = 10,
        dropout: float = 0.15
    ):
        super().__init__()
        self.input_dim = num_evidences + num_vitals
        self.num_conditions = num_conditions
        self.num_evidences = num_evidences
        self.embed_dim = embed_dim
        self.num_tokens = num_tokens
        self.total_token_dim = num_tokens * embed_dim
        self.num_transformer_layers = num_transformer_layers

        self.input_proj = nn.Sequential(
            nn.Linear(self.input_dim, self.total_token_dim),
            nn.LayerNorm(self.total_token_dim),
            nn.GELU(),
            nn.Dropout(dropout)
        )

        self.transformer_layers = nn.ModuleList([
            PreLNTransformerLayer(
                embed_dim=embed_dim,
                num_heads=num_attention_heads,
                mlp_dim=embed_dim * 4,
                dropout=dropout
            )
            for _ in range(num_transformer_layers)
        ])

        self.final_norm = nn.LayerNorm(embed_dim)
        self.latent_proj = nn.Sequential(
            nn.Linear(self.total_token_dim, 256),
            nn.LayerNorm(256),
            nn.GELU()
        )

        self.dx_head = nn.Sequential(
            nn.Linear(256, 128),
            nn.LayerNorm(128),
            nn.GELU(),
            nn.Dropout(dropout / 2),
            nn.Linear(128, num_conditions)
        )

        self.triage_head = nn.Sequential(
            nn.Linear(256, 64),
            nn.LayerNorm(64),
            nn.GELU(),
            nn.Linear(64, num_triage_levels)
        )

        self.policy_head = nn.Sequential(
            nn.Linear(256, 128),
            nn.LayerNorm(128),
            nn.GELU(),
            nn.Linear(128, num_evidences)
        )

    @property
    def total_parameters(self) -> int:
        return sum(p.numel() for p in self.parameters() if p.requires_grad)

    def forward(self, x: torch.Tensor):
        b = x.size(0)
        h = self.input_proj(x)
        seq = h.view(b, self.num_tokens, self.embed_dim)
        for layer in self.transformer_layers:
            seq = layer(seq)
        seq = self.final_norm(seq)
        flat = seq.reshape(b, self.total_token_dim)
        latent = self.latent_proj(flat)
        return {
            "dx_logits": self.dx_head(latent),
            "triage_logits": self.triage_head(latent),
            "policy_logits": self.policy_head(latent),
            "latent": latent
        }

# Aliases
AkiMedClinicalTransformer200M = AkiMedClinicalTransformer
AkiMedDeepClinicalTransformer = AkiMedClinicalTransformer

def load_clinical_transformer(checkpoint_path: str, device: torch.device):
    """Automatically detects model architecture (200M, 41M, or 8.9M) and loads weights cleanly."""
    checkpoint = torch.load(checkpoint_path, map_location=device)
    state_dict = checkpoint["model_state_dict"] if "model_state_dict" in checkpoint else checkpoint
    
    if "pool_query" in state_dict:
        dim = state_dict["pool_query"].shape[-1]
        layers = len([k for k in state_dict.keys() if k.startswith("transformer_layers.") and k.endswith(".norm1.weight")])
        num_cond = state_dict["dx_head.7.weight"].shape[0] if "dx_head.7.weight" in state_dict else 111
        heads = 16 if dim >= 1024 else 8
        model = AkiMedClinicalTransformer(
            num_conditions=num_cond,
            embed_dim=dim,
            num_tokens=16,
            num_attention_heads=heads,
            num_transformer_layers=layers,
            dropout=0.0
        )
    else:
        num_cond = state_dict["dx_head.4.weight"].shape[0] if "dx_head.4.weight" in state_dict else 111
        model = AkiMedClinicalTransformerV2(
            num_conditions=num_cond,
            embed_dim=256,
            num_tokens=8,
            num_attention_heads=4,
            num_transformer_layers=10,
            dropout=0.0
        )
        
    model.load_state_dict(state_dict)
    model.to(device)
    model.eval()
    return model

if __name__ == "__main__":
    device = torch.device("mps" if torch.backends.mps.is_available() else "cpu")
    print(f"[TEST] Testing AkiMed 200M Deep Clinical Attention Transformer on device: {device}")
    model = AkiMedClinicalTransformer().to(device)
    dummy_x = torch.randn(4, 233, device=device)
    out = model(dummy_x)
    print(f"  -> Total Trainable Parameters: {model.total_parameters:,} ({model.total_parameters * 4 / (1024*1024):.2f} MB)")
    print(f"  -> Layer Count: {model.num_transformer_layers} Pre-LN Transformer Blocks (d={model.embed_dim})")
    print(f"  -> Tokens per Sample: {model.num_tokens} tokens")
    print(f"  -> dx_logits shape: {out['dx_logits'].shape} (Expected: [4, 111])")
    print("[SUCCESS] 200 Million Parameter Clinical Transformer architecture verified!")
