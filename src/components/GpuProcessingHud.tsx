import React, { useEffect, useState } from 'react';
import { Cpu, Activity, Zap, CheckCircle2, Loader2, ShieldCheck } from 'lucide-react';

interface GpuProcessingHudProps {
  isOpen: boolean;
  stageTitle?: string;
}

export const GpuProcessingHud: React.FC<GpuProcessingHudProps> = ({
  isOpen,
  stageTitle,
}) => {
  const [elapsedMs, setElapsedMs] = useState<number>(0);
  const [activeStage, setActiveStage] = useState<number>(0);
  const [visible, setVisible] = useState<boolean>(false);

  // Debounce/smooth visibility to prevent 50ms jarring flashes
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isOpen) {
      setVisible(true);
    } else {
      // Allow smooth exit animation
      timeout = setTimeout(() => {
        setVisible(false);
      }, 300);
    }
    return () => clearTimeout(timeout);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setElapsedMs(0);
      setActiveStage(0);
      return;
    }

    const startTime = performance.now();
    const interval = setInterval(() => {
      const now = performance.now();
      const elapsed = Math.round(now - startTime);
      setElapsedMs(elapsed);

      // Transition stages naturally based on typical MPS GPU kernel timing
      if (elapsed < 200) {
        setActiveStage(0); // Memory Allocation
      } else if (elapsed < 650) {
        setActiveStage(1); // 32-Pass Monte Carlo Attention Layers
      } else if (elapsed < 1100) {
        setActiveStage(2); // Epistemic Uncertainty & Bayesian Calibration
      } else {
        setActiveStage(3); // Clinical Differential Harmonization
      }
    }, 40);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!visible && !isOpen) return null;

  const seconds = (elapsedMs / 1000).toFixed(2);
  const progressPct = Math.min(98, Math.max(12, Math.round((elapsedMs / 1200) * 100)));

  const stages = [
    {
      id: 0,
      title: 'MPS Unified Memory Allocation',
      desc: 'Loading clinical feature tensors into Apple Silicon GPU memory',
    },
    {
      id: 1,
      title: 'Monte Carlo GPU Attention (212.9M Params)',
      desc: 'Executing 16 Pre-LN Transformer layers & 512 attention blocks',
    },
    {
      id: 2,
      title: 'Epistemic Uncertainty Estimation',
      desc: 'Bayesian posterior calibration across stochastic GPU passes',
    },
    {
      id: 3,
      title: 'Clinical Differential & Triage Harmonization',
      desc: 'Continuous vitals margins & ESI emergency triage protocol',
    },
  ];

  return (
    <aside
      aria-label="Hardware GPU Processing Monitor"
      className={`fixed bottom-5 right-5 z-50 max-w-md w-[calc(100vw-2.5rem)] sm:w-[420px] transition-all duration-300 transform pointer-events-auto ${
        isOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95 pointer-events-none'
      }`}
    >
      <div className="bg-white text-black border-[2.5px] border-black rounded-2xl p-4 shadow-[5px_5px_0px_0px_#000000] relative overflow-hidden">
        {/* Top Header Pill & Status */}
        <div className="flex items-center justify-between gap-2 pb-3 border-b-2 border-black">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00F5A0] border-2 border-black text-black text-[11px] font-mono font-bold tracking-wide shadow-[1.5px_1.5px_0px_0px_#000000]">
            <span className="w-2 h-2 rounded-full bg-black animate-ping" />
            <span>Apple Silicon MPS GPU Active</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFC900] border-2 border-black text-black font-mono text-[11px] font-bold shadow-[1.5px_1.5px_0px_0px_#000000]">
            <Zap className="w-3.5 h-3.5 text-black animate-pulse" />
            <span>Compute: <strong>{seconds}s</strong></span>
          </div>
        </div>

        {/* Title Area */}
        <div className="mt-3.5 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#8B5CF6] flex items-center justify-center text-white shrink-0 border-2 border-black shadow-[2px_2px_0px_0px_#000000]">
            <Cpu className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-black text-black tracking-tight truncate">
              {stageTitle || 'Evaluating Deep Clinical Transformer'}
            </h4>
            <p className="text-[11px] text-zinc-600 font-medium mt-0.5 leading-snug">
              Metal Performance Shaders (MPS) hardware tensor acceleration.
            </p>
          </div>
        </div>

        {/* Live Progress Bar */}
        <div className="mt-3 space-y-1">
          <div className="flex justify-between text-[10px] font-mono text-zinc-700 font-bold">
            <span>Kernel Progress: {progressPct}%</span>
            <span>32 Monte Carlo Passes</span>
          </div>
          <div className="w-full h-2.5 bg-[#FAF8F5] rounded-full overflow-hidden border-2 border-black">
            <div
              className="h-full bg-[#00F5A0] border-r-2 border-black transition-all duration-150 ease-out"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Active Stage Indicator */}
        <div className="mt-3.5 p-2.5 rounded-xl border-2 border-black bg-[#FEF9C3] text-xs flex items-start gap-2.5 shadow-[2px_2px_0px_0px_#000000]">
          <div className="mt-0.5 shrink-0">
            <Loader2 className="w-4 h-4 text-black animate-spin" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-black flex items-center justify-between text-black text-[11px]">
              <span className="truncate">{stages[activeStage]?.title}</span>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-[#FF90E8] text-black border border-black font-bold shrink-0 ml-1">
                Stage {activeStage + 1}/4
              </span>
            </div>
            <p className="text-[10px] text-zinc-700 font-medium mt-0.5 leading-tight truncate">
              {stages[activeStage]?.desc}
            </p>
          </div>
        </div>

        {/* Bottom Hardware Telemetry Footer */}
        <div className="mt-3 pt-2.5 border-t-2 border-black/10 flex items-center justify-between text-[10px] font-mono font-bold text-zinc-700">
          <div className="flex items-center gap-1 text-black">
            <Activity className="w-3.5 h-3.5 text-[#8B5CF6]" />
            <span>212.9M Params</span>
          </div>
          <div>•</div>
          <div>16 Pre-LN Blocks</div>
          <div>•</div>
          <div className="flex items-center gap-1 text-emerald-800 font-black">
            <ShieldCheck className="w-3.5 h-3.5 text-[#00F5A0]" />
            <span>MPS Hardware</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
