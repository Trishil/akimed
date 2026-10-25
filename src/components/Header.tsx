import React, { useState, useEffect } from 'react';
import { Stethoscope, Brain, Activity, Cpu } from 'lucide-react';
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
      <header className="sticky top-0 z-40 bg-[#FAF8F5]/90 backdrop-blur-md border-b-2 border-zinc-900/10 text-zinc-900 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3.5 gap-3">
            
            {/* Brand Logo - Akademia Humanist Aesthetic */}
            <div 
              className="flex items-center space-x-3 cursor-pointer select-none group" 
              onClick={() => setActiveTab('akinator')}
            >
              <div className="w-10 h-10 rounded-2xl bg-zinc-900 text-white flex items-center justify-center shadow-tactile-sm border-2 border-zinc-900 transition-transform hover:-rotate-3">
                <Stethoscope className="w-5 h-5 text-teal-400 font-bold" />
              </div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-2xl font-black tracking-tight text-zinc-900">
                  AkiMed<span className="text-teal-600">.</span>
                </span>
                <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full border-2 border-zinc-900 shadow-tactile-sm inline-flex items-center gap-1.5 ${
                  engineStatus.activeEngine === 'local_ml'
                    ? 'bg-emerald-300 text-zinc-950'
                    : 'bg-amber-300 text-zinc-950'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    engineStatus.activeEngine === 'local_ml' ? 'bg-emerald-700 animate-pulse' : 'bg-amber-700 animate-ping'
                  }`}></span>
                  {engineStatus.activeEngine === 'local_ml' ? 'MPS GPU Active (212.9M)' : 'Engine Initializing...'}
                </span>
              </div>
            </div>

            {/* Nav Tabs - Tactile Neobrutalist Action Pills */}
            <nav className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              <button
                type="button"
                onClick={() => setActiveTab('akinator')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs transition-all whitespace-nowrap cursor-pointer border-2 border-zinc-900 shadow-tactile-sm ${
                  activeTab === 'akinator'
                    ? 'bg-zinc-900 text-white font-black'
                    : 'bg-white hover:bg-yellow-200 text-zinc-900 font-bold'
                }`}
              >
                <Brain className={`w-3.5 h-3.5 ${activeTab === 'akinator' ? 'text-teal-400' : 'text-zinc-800'}`} />
                <span>Dr. Akinator Game</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('triage')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs transition-all whitespace-nowrap cursor-pointer border-2 border-zinc-900 shadow-tactile-sm ${
                  activeTab === 'triage'
                    ? 'bg-zinc-900 text-white font-black'
                    : 'bg-white hover:bg-yellow-200 text-zinc-900 font-bold'
                }`}
              >
                <Activity className={`w-3.5 h-3.5 ${activeTab === 'triage' ? 'text-rose-400' : 'text-rose-600'}`} />
                <span>Direct Emergency Triage</span>
              </button>

              {/* Nerdy AI Model Hub Pill Button */}
              <button
                type="button"
                onClick={() => setShowTelemetryModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border-2 border-zinc-900 bg-yellow-300 hover:bg-yellow-200 text-zinc-950 text-xs font-black shadow-tactile-sm transition-all ml-1 cursor-pointer"
                title="Inspect 212.9M Attention Transformer Specs, MPS Kernel Telemetry, and Tensor Dimensions"
              >
                <Cpu className="w-3.5 h-3.5 text-zinc-950" />
                <span>212.9M Neural Model Info</span>
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
