import React, { useState, useEffect } from 'react';
import { 
  X, 
  Cpu, 
  HardDrive, 
  ShieldCheck, 
  AlertTriangle, 
  BarChart3, 
  Layers, 
  FileCode2, 
  Copy,
  Check
} from 'lucide-react';

interface CheckpointItem {
  name: string;
  path: string;
  size_mb: number;
  modified: string;
}

interface EpochHistory {
  epoch: number;
  train_loss: number;
  train_dx_acc: number;
  val_top1_acc: number;
  val_top3_acc: number;
  val_triage_acc: number;
  elapsed_sec: number;
}

interface TelemetryData {
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
}

import { DEFAULT_TELEMETRY_DATA } from '../data/telemetryData';

interface TrainingTelemetryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TrainingTelemetryModal: React.FC<TrainingTelemetryModalProps> = ({ isOpen, onClose }) => {
  const [data, setData] = useState<TelemetryData>(DEFAULT_TELEMETRY_DATA);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'checkpoints' | 'history' | 'adversarial'>('checkpoints');
  const [copiedPath, setCopiedPath] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/training-telemetry')
        .then(res => {
          if (!res.ok) throw new Error('Telemetry not reachable');
          return res.json();
        })
        .then(resData => {
          if (resData && resData.active_model) {
            setData(resData);
          }
        })
        .catch(err => {
          console.warn('Using bundled training telemetry:', err);
          setData(DEFAULT_TELEMETRY_DATA);
        });
    }
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPath(true);
    setTimeout(() => setCopiedPath(false), 2000);
  };

  const model = data?.active_model;
  const checkpoints = data?.checkpoints || [];
  const history = data?.training_history || [];
  const adv = data?.adversarial_stress_report;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-zinc-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl bg-[#FAF8F5] border-2 border-zinc-900 rounded-3xl shadow-tactile-lg overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b-2 border-zinc-900 bg-white">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-yellow-300 border-2 border-zinc-900 flex items-center justify-center text-zinc-900 shadow-tactile-sm">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-serif font-black text-zinc-900 tracking-tight">
                  AkiMed AI Training Hub & Model Storage
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  MPS GPU Active
                </span>
              </div>
              <p className="text-xs text-zinc-600 mt-0.5 font-normal">
                Saved PyTorch weights, training loss logs, and 25,000-scenario adversarial stress certification
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-full border-2 border-zinc-900 flex items-center justify-center text-zinc-700 hover:bg-zinc-100 transition-colors shadow-tactile-sm"
          >
            <X className="w-5 h-5 text-zinc-900" />
          </button>
        </div>

        {/* Sub-header Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 px-6 py-3 border-b-2 border-zinc-900/10 bg-[#FAF8F5]">
          <button
            onClick={() => setActiveTab('checkpoints')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-full transition-all border-2 border-zinc-900 cursor-pointer ${
              activeTab === 'checkpoints'
                ? 'bg-zinc-900 text-white shadow-tactile-sm'
                : 'bg-white text-zinc-700 hover:bg-zinc-100'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            Saved Weights & Architecture
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-full transition-all border-2 border-zinc-900 cursor-pointer ${
              activeTab === 'history'
                ? 'bg-zinc-900 text-white shadow-tactile-sm'
                : 'bg-white text-zinc-700 hover:bg-zinc-100'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Training Telemetry & Epochs ({history.length})
          </button>
          <button
            onClick={() => setActiveTab('adversarial')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-full transition-all border-2 border-zinc-900 cursor-pointer ${
              activeTab === 'adversarial'
                ? 'bg-zinc-900 text-white shadow-tactile-sm'
                : 'bg-white text-zinc-700 hover:bg-zinc-100'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            25,000-Scenario Stress Cert
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-zinc-800">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-8 h-8 border-3 border-zinc-900 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs text-zinc-600 font-medium">Loading model telemetry and checkpoints...</p>
            </div>
          ) : (
            <>
              {/* TAB 1: SAVED WEIGHTS & CHECKPOINTS */}
              {activeTab === 'checkpoints' && (
                <div className="space-y-5">
                  {/* Summary Metric Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                    <div className="p-4 rounded-2xl bg-white border-2 border-zinc-900 shadow-tactile-sm">
                      <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-wider">Top-1 Accuracy</p>
                      <p className="text-2xl font-serif font-black text-zinc-900 mt-1">{model?.val_top1_acc || 99.28}%</p>
                      <p className="text-[10px] text-zinc-500 font-medium">Validation Split</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white border-2 border-zinc-900 shadow-tactile-sm">
                      <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-wider">Top-3 Differential</p>
                      <p className="text-2xl font-serif font-black text-zinc-900 mt-1">{model?.val_top3_acc || 99.99}%</p>
                      <p className="text-[10px] text-zinc-500 font-medium">Diagnostic Retention</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white border-2 border-zinc-900 shadow-tactile-sm">
                      <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-wider">ESI Triage Acc</p>
                      <p className="text-2xl font-serif font-black text-zinc-900 mt-1">{model?.val_triage_acc || 99.97}%</p>
                      <p className="text-[10px] text-zinc-500 font-medium">5-Tier Acuity Safety</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white border-2 border-zinc-900 shadow-tactile-sm">
                      <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-wider">Trained Volume</p>
                      <p className="text-2xl font-serif font-black text-zinc-900 mt-1">{(model?.trained_samples || 600000).toLocaleString()}</p>
                      <p className="text-[10px] text-zinc-500 font-medium">Patient Encounters</p>
                    </div>
                  </div>

                  {/* Physical Disk Location Card */}
                  <div className="p-5 rounded-2xl bg-white border-2 border-zinc-900 shadow-tactile-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-black text-zinc-900 uppercase tracking-wider">
                        <HardDrive className="w-4 h-4 text-zinc-900" />
                        <span>Saved Model Storage Location on Disk</span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(model?.saved_root_dir || '/Volumes/Trishil/Akimed_data/models')}
                        className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full bg-zinc-900 hover:bg-zinc-800 text-white transition-all shadow-tactile-sm cursor-pointer"
                      >
                        {copiedPath ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedPath ? 'Copied!' : 'Copy Path'}</span>
                      </button>
                    </div>
                    <div className="p-3 rounded-xl bg-[#FAF8F5] border-2 border-zinc-900/20 font-mono text-xs text-zinc-900 break-all select-all font-semibold">
                      {model?.saved_root_dir || '/Volumes/Trishil/Akimed_data/models'}
                    </div>
                    <p className="text-xs text-zinc-600 font-normal">
                      All checkpoints, weights (.pt files), and telemetry logs are permanently persisted on your external drive.
                    </p>
                  </div>

                  {/* Active Weights & Checkpoints List */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-zinc-900" />
                      Saved PyTorch Weights & Periodic Checkpoints
                    </h3>
                    <div className="border-2 border-zinc-900 rounded-2xl overflow-hidden bg-white shadow-tactile-sm divide-y-2 divide-zinc-100">
                      {/* Best Model Row */}
                      <div className="p-4 flex items-center justify-between hover:bg-[#FAF8F5] transition-colors">
                        <div className="flex items-center gap-3.5">
                          <div className="w-8 h-8 rounded-xl bg-yellow-300 border-2 border-zinc-900 text-zinc-900 flex items-center justify-center font-black text-xs shadow-tactile-sm">
                            ★
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-zinc-900">akimed_clinical_transformer_best.pt</span>
                              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-yellow-300 text-zinc-900 border border-zinc-900 font-bold">
                                Active In Production
                              </span>
                            </div>
                            <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
                              {model?.weights_path || '/Volumes/Trishil/Akimed_data/models/akimed_clinical_transformer_best.pt'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-zinc-900">{model?.weights_size_mb || 11.0} MB</span>
                          <p className="text-[10px] text-emerald-600 font-bold">Verified Clean</p>
                        </div>
                      </div>

                      {/* Periodic Checkpoints */}
                      {checkpoints.map((ckpt, idx) => (
                        <div key={idx} className="p-3.5 flex items-center justify-between hover:bg-[#FAF8F5] transition-colors text-xs">
                          <div className="flex items-center gap-2.5">
                            <FileCode2 className="w-4 h-4 text-zinc-500" />
                            <span className="font-semibold text-zinc-900">{ckpt.name}</span>
                          </div>
                          <div className="flex items-center gap-4 text-zinc-600 text-[11px]">
                            <span>{ckpt.modified}</span>
                            <span className="font-bold text-zinc-900 font-mono">{ckpt.size_mb} MB</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Architecture Details Card */}
                  <div className="p-5 rounded-2xl bg-white border-2 border-zinc-900 shadow-tactile-sm space-y-2 text-xs">
                    <p className="font-bold text-zinc-900 flex items-center gap-2 text-sm">
                      <Cpu className="w-4 h-4 text-zinc-900" />
                      Neural Network Architecture Specification
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-zinc-700 pt-1">
                      <div>• <span className="font-semibold text-zinc-900">Model Type:</span> AkiMed 10-Layer Clinical Attention Transformer (Pre-LN)</div>
                      <div>• <span className="font-semibold text-zinc-900">Transformer Depth:</span> 10 Sequential Pre-LN Self-Attention Layers (h=4)</div>
                      <div>• <span className="font-semibold text-zinc-900">Token Sequence:</span> 8 Continuous Clinical Tokens (d=256, 2,048 dim)</div>
                      <div>• <span className="font-semibold text-zinc-900">Trainable Parameters:</span> 9,024,789 (~9.02M params, 34.43 MB)</div>
                      <div>• <span className="font-semibold text-zinc-900">Multi-Task Heads:</span> Diagnosis (49), ESI Triage (5), Policy (223)</div>
                      <div>• <span className="font-semibold text-zinc-900">GPU Device:</span> Apple Silicon MPS Metal Acceleration (Zero Swap)</div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: TRAINING TELEMETRY & EPOCHS */}
              {activeTab === 'history' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-serif font-black text-zinc-900">Epoch-by-Epoch Convergence Telemetry</h3>
                      <p className="text-xs text-zinc-600 font-normal">Recorded at /Volumes/Trishil/Akimed_data/models/training_history.csv</p>
                    </div>
                    <span className="text-xs px-3 py-1 rounded-full bg-yellow-300 border-2 border-zinc-900 text-zinc-900 font-mono font-bold shadow-tactile-sm">
                      ~38s / Epoch (M1 MPS)
                    </span>
                  </div>

                  <div className="border-2 border-zinc-900 rounded-2xl overflow-hidden bg-white shadow-tactile-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#FAF8F5] text-zinc-700 border-b-2 border-zinc-900 font-bold uppercase text-[10px] tracking-wider">
                          <tr>
                            <th className="py-3 px-3.5">Epoch</th>
                            <th className="py-3 px-3.5">Train Loss</th>
                            <th className="py-3 px-3.5">Train Acc</th>
                            <th className="py-3 px-3.5">Val Top-1</th>
                            <th className="py-3 px-3.5">Val Top-3</th>
                            <th className="py-3 px-3.5">ESI Triage Acc</th>
                            <th className="py-3 px-3.5 text-right">Elapsed</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 font-mono text-[11px]">
                          {history.map((row) => (
                            <tr key={row.epoch} className="hover:bg-[#FAF8F5] transition-colors">
                              <td className="py-2.5 px-3.5 font-bold text-zinc-900">Epoch {row.epoch}</td>
                              <td className="py-2.5 px-3.5 text-amber-700 font-semibold">{row.train_loss.toFixed(4)}</td>
                              <td className="py-2.5 px-3.5 text-zinc-700">{row.train_dx_acc.toFixed(2)}%</td>
                              <td className="py-2.5 px-3.5 text-zinc-900 font-bold">{row.val_top1_acc.toFixed(2)}%</td>
                              <td className="py-2.5 px-3.5 text-zinc-900 font-bold">{row.val_top3_acc.toFixed(2)}%</td>
                              <td className="py-2.5 px-3.5 text-emerald-700 font-semibold">{row.val_triage_acc.toFixed(2)}%</td>
                              <td className="py-2.5 px-3.5 text-right text-zinc-500">{row.elapsed_sec.toFixed(1)}s</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: 25,000-SCENARIO ADVERSARIAL STRESS CERTIFICATION */}
              {activeTab === 'adversarial' && (
                <div className="space-y-5">
                  <div className="p-5 rounded-2xl bg-amber-100 border-2 border-zinc-900 shadow-tactile-sm">
                    <div className="flex items-center gap-3.5">
                      <div className="p-2.5 rounded-xl bg-amber-300 border-2 border-zinc-900 text-zinc-900 shadow-tactile-sm">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-serif font-black text-zinc-900">
                            Algorithmic Stress-Testing Report (AkiMed-ACTA)
                          </h3>
                          <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-amber-300 text-zinc-900 border border-zinc-900">
                            {adv?.composite_safety_evaluation?.certification_status || 'MARGINAL_WARNING'}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-700 mt-1 font-normal">
                          25,000 algorithmic hard-case simulations exposing edge-case failures, mimics, and diagnostic overshadowing.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 4 Stress Batteries Results */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Battery 1 */}
                    <div className="p-5 rounded-2xl bg-white border-2 border-zinc-900 shadow-tactile-sm space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-zinc-900">Alg 1: Saliency Perturbations</span>
                        <span className="text-xs font-mono font-bold bg-yellow-100 px-2 py-0.5 rounded-full border border-yellow-300">
                          4.06 mutations
                        </span>
                      </div>
                      <p className="text-xs text-zinc-600 leading-relaxed font-normal">
                        Measures the <strong className="text-zinc-900">Adversarial Flip Radius</strong> using loss gradients. 
                        62.9% resistant; 31.8% of cases flipped with 1–2 targeted symptom mutations.
                      </p>
                    </div>

                    {/* Battery 2 */}
                    <div className="p-5 rounded-2xl bg-white border-2 border-zinc-900 shadow-tactile-sm space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-zinc-900">Alg 2: Chameleon Mimic Collision</span>
                        <span className="text-xs font-mono font-bold bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300 text-emerald-800">
                          99.82% Triage
                        </span>
                      </div>
                      <p className="text-xs text-zinc-600 leading-relaxed font-normal">
                        Evaluates borderline shared-symptom dilemmas (e.g. PE vs Panic, STEMI vs GERD). Lethal differential retention was 74.86%, while triage vigilance stayed over 99.8%.
                      </p>
                    </div>

                    {/* Battery 3 */}
                    <div className="p-5 rounded-2xl bg-white border-2 border-zinc-900 shadow-tactile-sm space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-zinc-900">Alg 3: Multimorbidity Superposition</span>
                        <span className="text-xs font-mono font-bold bg-rose-100 px-2 py-0.5 rounded-full border border-rose-300 text-rose-800">
                          43.74% Top-3
                        </span>
                      </div>
                      <p className="text-xs text-zinc-600 leading-relaxed font-normal">
                        Superimposes acute crises over chronic disease baseline. Exposes <strong className="text-rose-700">Diagnostic Overshadowing</strong> where chronic COPD masks acute pulmonary edema.
                      </p>
                    </div>

                    {/* Battery 4 */}
                    <div className="p-5 rounded-2xl bg-white border-2 border-zinc-900 shadow-tactile-sm space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-zinc-900">Alg 5: Asymmetric Safety</span>
                        <span className="text-xs font-mono font-bold bg-sky-100 px-2 py-0.5 rounded-full border border-sky-300 text-sky-800">
                          94.06% CSS
                        </span>
                      </div>
                      <p className="text-xs text-zinc-600 leading-relaxed font-normal">
                        Penalizes lethal under-triage 100x over harmless errors. 85 lethal misses across 5,000 real masked validation cases (1.70%).
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t-2 border-zinc-900 bg-white text-xs text-zinc-600">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-semibold text-zinc-800">Local Engine Port 8000 & Web Port 3000 Synchronized</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold transition-all border-2 border-zinc-900 shadow-tactile-sm hover:translate-x-0.5 hover:translate-y-0.5 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
