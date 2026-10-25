import React, { useState, useEffect } from 'react';
import { Brain, Activity, Cpu } from 'lucide-react';
import { TrainingTelemetryModal } from './TrainingTelemetryModal';

interface HeaderProps {
  activeTab: 'akinator' | 'triage';
  setActiveTab: (tab: 'akinator' | 'triage') => void;
  onResetPatient: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const [engineStatus, setEngineStatus] = useState<{
    activeEngine: string;
    engineName: string;
    details?: any;
  }>({
    activeEngine: 'local_ml',
    engineName: 'Clinical Transformer (Apple MPS)'
  });
  const [showTelemetryModal, setShowTelemetryModal] = useState(false);

  useEffect(() => {
    const pollStatus = () => {
      fetch('/api/engine-status')
        .then(res => res.json())
        .then(data => setEngineStatus(data))
        .catch(() => {});
    };
    pollStatus();
    const interval = setInterval(pollStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-zinc-200/80 text-zinc-900 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3">
            
            {/* Clean Brand Mark & Status */}
            <div 
              className="flex items-center gap-3 cursor-pointer select-none group" 
              onClick={() => setActiveTab('akinator')}
            >
              <div className="w-9 h-9 rounded-xl bg-zinc-950 text-white flex items-center justify-center shadow-xs ring-1 ring-zinc-800/20 transition-transform group-hover:scale-105">
                <svg className="w-5 h-5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3v18" />
                  <path d="M3 12h5l2-4 4 8 2-4h5" />
                </svg>
              </div>

              <div className="flex items-center gap-2.5">
                <span className="text-xl font-bold tracking-tight text-zinc-950">
                  AkiMed
                </span>
                
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-100 border border-zinc-200/80 text-[11px] font-semibold text-zinc-700">
                  <span className="relative flex h-2 w-2">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${
                      engineStatus.activeEngine === 'local_ml' ? 'bg-emerald-400' : 'bg-amber-400'
                    } opacity-75`}></span>
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${
                      engineStatus.activeEngine === 'local_ml' ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}></span>
                  </span>
                  <span>{engineStatus.activeEngine === 'local_ml' ? 'MPS GPU • 212.9M' : 'Engine Ready'}</span>
                </div>
              </div>
            </div>

            {/* Unified Segmented Nav Tab Bar */}
            <nav className="flex items-center gap-2">
              <div className="flex items-center p-1 bg-zinc-200/60 rounded-xl border border-zinc-300/40">
                <button
                  type="button"
                  onClick={() => setActiveTab('akinator')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === 'akinator'
                      ? 'bg-white text-zinc-950 shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-950 hover:bg-white/40'
                  }`}
                >
                  <Brain className={`w-3.5 h-3.5 ${activeTab === 'akinator' ? 'text-zinc-900' : 'text-zinc-400'}`} />
                  <span>Dr. Akinator</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('triage')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === 'triage'
                      ? 'bg-white text-zinc-950 shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-950 hover:bg-white/40'
                  }`}
                >
                  <Activity className={`w-3.5 h-3.5 ${activeTab === 'triage' ? 'text-rose-600' : 'text-zinc-400'}`} />
                  <span>Emergency Triage</span>
                </button>
              </div>

              {/* Clean Telemetry Modal Trigger */}
              <button
                type="button"
                onClick={() => setShowTelemetryModal(true)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-700 hover:text-zinc-950 text-xs font-semibold transition-all shadow-xs cursor-pointer"
                title="Inspect 212.9M Attention Transformer Specs, MPS Kernel Telemetry, and Tensor Dimensions"
              >
                <Cpu className="w-3.5 h-3.5 text-zinc-500" />
                <span>212.9M Model Specs</span>
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Training Telemetry & Saved Weights Modal */}
      <TrainingTelemetryModal 
        isOpen={showTelemetryModal} 
        onClose={() => setShowTelemetryModal(false)} 
      />
    </>
  );
};
