#!/usr/bin/env python3
"""
AkiMed 100+ Clinical Disease Deep Attention Transformer Trainer (with Vitals & Margins)
Trains the 10-Layer Pre-LN Attention Transformer on Apple Silicon MPS across
the expanded 111-condition medical ontology with continuous physiological vitals,
margin noise tolerance, and vitals dropout augmentation.
"""

import os
import sys
import json
import csv
import time
import math
import random
import argparse
import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F
from torch.utils.data import Dataset, DataLoader

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from clinical_transformer_architecture import AkiMedClinicalTransformer

DATA_ROOT = "/Volumes/Trishil/Akimed_data"
PROCESSED_DIR = os.path.join(DATA_ROOT, "processed")
MODELS_DIR = os.path.join(DATA_ROOT, "models")
CHECKPOINTS_DIR = os.path.join(MODELS_DIR, "checkpoints")
LOGS_DIR = os.path.join(DATA_ROOT, "logs")

os.makedirs(CHECKPOINTS_DIR, exist_ok=True)
os.makedirs(LOGS_DIR, exist_ok=True)

# 1. Load 111-condition ontology, evidences, and vitals ontology
with open(os.path.join(PROCESSED_DIR, "conditions_lookup_expanded.json"), "r", encoding="utf-8") as f:
    conditions = json.load(f)

with open(os.path.join(PROCESSED_DIR, "evidences_lookup.json"), "r", encoding="utf-8") as f:
    evidences = json.load(f)

with open(os.path.join(PROCESSED_DIR, "disease_vitals_ontology.json"), "r", encoding="utf-8") as f:
    vitals_ontology = json.load(f)

cond_names = sorted(list(conditions.keys()))
cond_to_idx = {name: idx for idx, name in enumerate(cond_names)}
idx_to_cond = {idx: name for idx, name in enumerate(cond_names)}

ev_names = sorted(list(evidences.keys()))
ev_to_idx = {name: idx for idx, name in enumerate(ev_names)}
idx_to_ev = {idx: name for idx, name in enumerate(ev_names)}

num_conditions = len(cond_names)
num_evidences = len(ev_names)

# Default vital parameters if not found
DEFAULT_VITALS = {
    "hr": {"mean": 75, "std": 12, "margin": 15, "min": 50, "max": 120},
    "sbp": {"mean": 120, "std": 15, "margin": 20, "min": 90, "max": 160},
    "dbp": {"mean": 80, "std": 10, "margin": 12, "min": 60, "max": 100},
    "rr": {"mean": 16, "std": 3, "margin": 3, "min": 12, "max": 24},
    "spo2": {"mean": 98, "std": 2, "margin": 2, "min": 94, "max": 100},
    "temp": {"mean": 37.0, "std": 0.5, "margin": 0.6, "min": 36.2, "max": 38.0}
}

# 2. Vitals-Aware Patient Dataset Loader
class VitalsPatientDataset(Dataset):
    def __init__(self, patient_file: str, is_training: bool = True, max_samples: int = None):
        self.is_training = is_training
        self.samples = []
        
        print(f"[DATASET] Loading patient encounters from {os.path.basename(patient_file)}...")
        count = 0
        with open(patient_file, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                pathology = row.get("PATHOLOGY", "").strip()
                if not pathology or pathology not in cond_to_idx:
                    continue
                    
                dx_idx = cond_to_idx[pathology]
                ev_str = row.get("EVIDENCES", "[]")
                try:
                    ev_list = eval(ev_str) if ev_str.startswith("[") else []
                except Exception:
                    ev_list = []
                    
                ev_indices = []
                for ev_token in ev_list:
                    base_ev = ev_token.split("_@_")[0]
                    if base_ev in ev_to_idx:
                        ev_indices.append(ev_to_idx[base_ev])
                        
                initial_ev = row.get("INITIAL_EVIDENCE", "")
                init_idx = ev_to_idx.get(initial_ev, -1)
                if not ev_indices and init_idx >= 0:
                    ev_indices = [init_idx]
                if not ev_indices:
                    continue
                
                cond_info = conditions.get(pathology, {})
                sev = cond_info.get("severity", 3)
                esi = max(1, min(5, sev))
                triage_idx = esi - 1
                
                age = float(row.get("AGE", 35))
                sex = 1.0 if row.get("SEX", "M") == "M" else 0.0
                
                self.samples.append({
                    "pathology": pathology,
                    "ev_indices": ev_indices,
                    "init_idx": init_idx,
                    "dx_idx": dx_idx,
                    "triage_idx": triage_idx,
                    "age": age,
                    "sex": sex,
                    "esi": esi
                })
                count += 1
                if max_samples and count >= max_samples:
                    break
        print(f"  -> Successfully loaded {len(self.samples):,} encounters.")

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, idx):
        item = self.samples[idx]
        ev_indices = item["ev_indices"]
        init_idx = item["init_idx"]
        pathology = item["pathology"]
        
        symptom_vec = np.zeros(num_evidences, dtype=np.float32)
        policy_target = np.zeros(num_evidences, dtype=np.float32)
        
        if self.is_training:
            # Inquiry progression simulation:
            # 20% Turn 1 (Chief complaint only)
            # 80% Turn 2+ (Subset of revealed symptoms)
            if random.random() < 0.20 and init_idx >= 0:
                symptom_vec[init_idx] = 1.0
            elif ev_indices:
                k = random.randint(1, len(ev_indices))
                revealed = set(random.sample(ev_indices, k))
                for ev_i in revealed:
                    symptom_vec[ev_i] = 1.0
            elif init_idx >= 0:
                symptom_vec[init_idx] = 1.0
                    
            for ev_i in ev_indices:
                if symptom_vec[ev_i] == 0:
                    policy_target[ev_i] = 1.0
        else:
            # Validation: full symptom presentation
            for ev_i in ev_indices:
                symptom_vec[ev_i] = 1.0

        # Sample Physiological Vitals from Ontology
        prof = vitals_ontology.get(pathology, DEFAULT_VITALS)
        
        # 15% random vital dropout during training to ensure model handles missing vitals
        omit_vitals = self.is_training and (random.random() < 0.15)
        
        if omit_vitals:
            sbp = 120.0
            dbp = 80.0
            hr = 75.0
            rr = 16.0
            spo2 = 98.0
            temp = 37.0
        else:
            def sample_vital(p):
                mean = p["mean"]
                std = p["std"]
                margin = p["margin"]
                min_v = p["min"]
                max_v = p["max"]
                
                # Base Gaussian sample
                val = random.gauss(mean, std)
                # Random margin jitter (+- 0.5 * margin)
                val += random.uniform(-0.5 * margin, 0.5 * margin)
                return max(min_v, min(max_v, val))
                
            sbp = sample_vital(prof.get("sbp", DEFAULT_VITALS["sbp"]))
            dbp = sample_vital(prof.get("dbp", DEFAULT_VITALS["dbp"]))
            hr = sample_vital(prof.get("hr", DEFAULT_VITALS["hr"]))
            rr = sample_vital(prof.get("rr", DEFAULT_VITALS["rr"]))
            spo2 = sample_vital(prof.get("spo2", DEFAULT_VITALS["spo2"]))
            temp = sample_vital(prof.get("temp", DEFAULT_VITALS["temp"]))
            
        # 10 Normalized vitals & demographics vector:
        vitals_vec = np.zeros(10, dtype=np.float32)
        vitals_vec[0] = (item["age"] - 18.0) / 70.0
        vitals_vec[1] = item["sex"]
        vitals_vec[2] = float(np.clip((sbp - 60.0) / 160.0, 0.0, 1.0))
        vitals_vec[3] = float(np.clip((dbp - 40.0) / 100.0, 0.0, 1.0))
        vitals_vec[4] = float(np.clip((hr - 40.0) / 160.0, 0.0, 1.0))
        vitals_vec[5] = float(np.clip((rr - 10.0) / 40.0, 0.0, 1.0))
        vitals_vec[6] = float(np.clip((spo2 - 70.0) / 30.0, 0.0, 1.0))
        vitals_vec[7] = float(np.clip((temp - 35.0) / 7.0, 0.0, 1.0))
        vitals_vec[8] = float(len(ev_indices)) / 15.0
        vitals_vec[9] = float(np.clip((hr / max(sbp, 40.0) - 0.4) / 1.0, 0.0, 1.0))
        
        x = np.concatenate([symptom_vec, vitals_vec])
        
        return {
            "x": torch.tensor(x, dtype=torch.float32),
            "dx_target": torch.tensor(item["dx_idx"], dtype=torch.long),
            "triage_target": torch.tensor(item["triage_idx"], dtype=torch.long),
            "policy_target": torch.tensor(policy_target, dtype=torch.float32)
        }

# 3. Training Execution Function
def train(args):
    device = torch.device(args.device if (args.device == "cpu" or torch.backends.mps.is_available()) else "cpu")
    num_heads = 16 if args.embed_dim >= 1024 else 8

    print("=" * 80)
    print(f" AkiMed 100+ Clinical Attention Transformer (200M Parameter Scale)")
    print(f" Compute Device: {device} | Epochs: {args.epochs} | Batch Size: {args.batch_size} (Accum: {args.grad_accum})")
    print(f" Train Samples: {args.train_samples:,} | Val Samples: {args.val_samples:,}")
    print(f" Transformer Layers: {args.layers} | Embed Dim: {args.embed_dim} | Heads: {num_heads}")
    print("=" * 80)

    train_file = os.path.join(PROCESSED_DIR, "patients_expanded_train.csv")
    val_file = os.path.join(PROCESSED_DIR, "patients_expanded_val.csv")

    train_dataset = VitalsPatientDataset(train_file, is_training=True)
    val_dataset = VitalsPatientDataset(val_file, is_training=False)

    if args.train_samples and args.train_samples < len(train_dataset):
        train_sampler = torch.utils.data.RandomSampler(train_dataset, replacement=False, num_samples=args.train_samples)
        train_loader = DataLoader(train_dataset, batch_size=args.batch_size, sampler=train_sampler, drop_last=True)
    else:
        train_loader = DataLoader(train_dataset, batch_size=args.batch_size, shuffle=True, drop_last=True)

    if args.val_samples and args.val_samples < len(val_dataset):
        val_sampler = torch.utils.data.RandomSampler(val_dataset, replacement=False, num_samples=args.val_samples)
        val_loader = DataLoader(val_dataset, batch_size=args.batch_size * 2, sampler=val_sampler, drop_last=False)
    else:
        val_loader = DataLoader(val_dataset, batch_size=args.batch_size * 2, shuffle=False)

    # Instantiate 16-Layer Deep Clinical Attention Transformer (Gen 4 - 212.9M Parameters)
    model = AkiMedClinicalTransformer(
        num_evidences=num_evidences,
        num_vitals=10,
        num_conditions=num_conditions,
        num_triage_levels=5,
        embed_dim=args.embed_dim,
        num_tokens=16,
        num_attention_heads=num_heads,
        num_transformer_layers=args.layers,
        dropout=args.dropout
    ).to(device)

    total_params = sum(p.numel() for p in model.parameters() if p.requires_grad)
    print(f"[MODEL] Initialized {args.layers}-Layer Deep Attention Transformer ({total_params:,} parameters, d={args.embed_dim}, 16 tokens).")

    optimizer = torch.optim.AdamW(model.parameters(), lr=args.lr, weight_decay=1e-4)
    
    # Warmup for 2 epochs, followed by Cosine Annealing decay
    optimizer_steps_per_epoch = math.ceil(len(train_loader) / args.grad_accum)
    warmup_steps = 2 * optimizer_steps_per_epoch
    total_steps = args.epochs * optimizer_steps_per_epoch
    def lr_lambda(current_step):
        if current_step < warmup_steps:
            return float(current_step) / float(max(1, warmup_steps))
        progress = float(current_step - warmup_steps) / float(max(1, total_steps - warmup_steps))
        return max(0.01, 0.5 * (1.0 + math.cos(math.pi * progress)))
        
    scheduler = torch.optim.lr_scheduler.LambdaLR(optimizer, lr_lambda=lr_lambda)

    dx_criterion = nn.CrossEntropyLoss()
    triage_criterion = nn.CrossEntropyLoss()
    policy_criterion = nn.BCEWithLogitsLoss()

    best_val_top1 = 0.0
    out_model_path = os.path.join(MODELS_DIR, "clinical_transformer_100plus_best.pt")
    history_file = os.path.join(MODELS_DIR, "training_history_vitals.csv")

    with open(history_file, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["epoch", "train_loss", "train_dx_acc", "val_top1_acc", "val_top3_acc", "time_sec"])

    print("\n" + "=" * 80)
    print(f"[START] Training 200M Transformer across {num_conditions} conditions with Vitals & Margins for {args.epochs} epochs...")
    print("=" * 80)

    use_autocast = (device.type in ["mps", "cuda"])

    for epoch in range(1, args.epochs + 1):
        model.train()
        start_time = time.time()
        total_loss = 0.0
        correct_dx = 0
        total_train = 0
        
        optimizer.zero_grad()
        for batch_idx, batch in enumerate(train_loader):
            x = batch["x"].to(device)
            dx_tgt = batch["dx_target"].to(device)
            triage_tgt = batch["triage_target"].to(device)
            policy_tgt = batch["policy_target"].to(device)
            
            with torch.autocast(device_type=device.type, dtype=torch.float16, enabled=use_autocast):
                out = model(x)
                loss_dx = dx_criterion(out["dx_logits"], dx_tgt)
                loss_triage = triage_criterion(out["triage_logits"], triage_tgt)
                loss_policy = policy_criterion(out["policy_logits"], policy_tgt)
                loss = (loss_dx + 0.5 * loss_triage + 0.3 * loss_policy) / args.grad_accum
                
            loss.backward()
            
            if (batch_idx + 1) % args.grad_accum == 0 or (batch_idx + 1) == len(train_loader):
                nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.5)
                optimizer.step()
                scheduler.step()
                optimizer.zero_grad()
            
            total_loss += loss.item() * args.grad_accum
            preds = out["dx_logits"].argmax(dim=-1)
            correct_dx += (preds == dx_tgt).sum().item()
            total_train += x.size(0)
            
            if (batch_idx + 1) % 100 == 0:
                elapsed = time.time() - start_time
                print(f"Epoch {epoch}/{args.epochs} | Batch {batch_idx+1}/{len(train_loader)} | Loss: {loss.item()*args.grad_accum:.4f} | Train Acc: {100.0 * correct_dx / total_train:.1f}% | Time: {elapsed:.1f}s")
                
        # Validation Evaluation
        model.eval()
        val_correct_top1 = 0
        val_correct_top3 = 0
        val_total = 0
        
        with torch.no_grad():
            for batch in val_loader:
                x = batch["x"].to(device)
                dx_tgt = batch["dx_target"].to(device)
                with torch.autocast(device_type=device.type, dtype=torch.float16, enabled=use_autocast):
                    out = model(x)
                
                top3 = out["dx_logits"].topk(3, dim=-1).indices
                for i in range(dx_tgt.size(0)):
                    target = dx_tgt[i].item()
                    if top3[i, 0].item() == target:
                        val_correct_top1 += 1
                    if target in top3[i].tolist():
                        val_correct_top3 += 1
                    val_total += 1
                    
        top1_acc = 100.0 * val_correct_top1 / val_total
        top3_acc = 100.0 * val_correct_top3 / val_total
        train_acc = 100.0 * correct_dx / total_train
        avg_loss = total_loss / len(train_loader)
        epoch_time = time.time() - start_time
        
        print("-" * 80)
        print(f"[EPOCH {epoch}/{args.epochs}] Train Acc: {train_acc:.2f}% | Val Top-1: {top1_acc:.2f}% | Val Top-3: {top3_acc:.2f}% | Time: {epoch_time:.1f}s")
        print("-" * 80)
        
        with open(history_file, "a", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow([epoch, f"{avg_loss:.4f}", f"{train_acc:.2f}", f"{top1_acc:.2f}", f"{top3_acc:.2f}", f"{epoch_time:.1f}"])
            
        if top1_acc > best_val_top1:
            best_val_top1 = top1_acc
            torch.save({
                "model_state_dict": model.state_dict(),
                "num_conditions": num_conditions,
                "num_evidences": num_evidences,
                "embed_dim": args.embed_dim,
                "num_transformer_layers": args.layers,
                "num_tokens": 16,
                "num_attention_heads": num_heads,
                "top1_acc": top1_acc,
                "top3_acc": top3_acc,
                "epoch": epoch
            }, out_model_path)
            
            # Save clinical transformer metadata
            meta_path = os.path.join(MODELS_DIR, "clinical_transformer_metadata.json")
            with open(meta_path, "w", encoding="utf-8") as mf:
                json.dump({
                    "model_type": "AkiMedClinicalTransformer200M",
                    "num_parameters": total_params,
                    "num_conditions": num_conditions,
                    "num_evidences": num_evidences,
                    "embed_dim": args.embed_dim,
                    "num_transformer_layers": args.layers,
                    "num_tokens": 16,
                    "num_attention_heads": num_heads,
                    "val_top1_accuracy": top1_acc,
                    "val_top3_accuracy": top3_acc,
                    "best_epoch": epoch,
                    "idx_to_cond": idx_to_cond,
                    "cond_to_idx": cond_to_idx,
                    "ev_to_idx": ev_to_idx,
                    "idx_to_ev": idx_to_ev
                }, mf, indent=2)
            print(f"  >>> [SAVED BEST] Checkpoint saved to {out_model_path} (Top-1: {top1_acc:.2f}%)")

    print("=" * 80)
    print(f"[COMPLETE] Model training across {num_conditions} conditions finished! Best Val Top-1: {best_val_top1:.2f}%")
    print(f"Saved weights: {out_model_path}")
    print("=" * 80)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train AkiMed 200M Clinical Attention Transformer (Gen 4) with Vitals & Margins")
    parser.add_argument("--epochs", type=int, default=35, help="Number of training epochs (default: 35)")
    parser.add_argument("--batch_size", type=int, default=64, help="Batch size (default: 64)")
    parser.add_argument("--grad_accum", type=int, default=1, help="Gradient accumulation steps (default: 1)")
    parser.add_argument("--train_samples", type=int, default=7104, help="Training samples per epoch (default: 7104)")
    parser.add_argument("--val_samples", type=int, default=2000, help="Validation samples per epoch (default: 2000)")
    parser.add_argument("--layers", type=int, default=16, help="Number of transformer layers (default: 16)")
    parser.add_argument("--embed_dim", type=int, default=1024, help="Embedding dimension (default: 1024)")
    parser.add_argument("--lr", type=float, default=3e-4, help="Learning rate (default: 0.0003)")
    parser.add_argument("--dropout", type=float, default=0.10, help="Dropout (default: 0.10)")
    parser.add_argument("--device", type=str, default="mps", help="Device: mps or cpu (default: mps)")
    args = parser.parse_args()
    train(args)


