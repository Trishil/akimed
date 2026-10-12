import React, { useState, useEffect } from 'react';
import { Stethoscope, Brain, Activity, Sparkles, BookOpen, Cpu, RotateCcw } from 'lucide-react';
import { TrainingTelemetryModal } from './TrainingTelemetryModal';

interface HeaderProps {
  activeTab: 'akinator' | 'triage' | 'vignettes' | 'guide';
  setActiveTab: (tab: 'akinator' | 'triage' | 'vignettes' | 'guide') => void;
  onResetPatient: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, onResetPatient }) => {
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
    fetch('/api/engine-status')
      .then(res => res.json())
      .then(data => setEngineStatus(data))
      .catch(() => {});
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#FAF8F5]/90 backdrop-blur-md border-b-2 border-zinc-900/10 text-zinc-900 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3.5 gap-3">
            
            {/* Brand Logo - Akademia Humanist Aesthetic */}
            <div className="flex items-center space-x-3 cursor-pointer select-none" onClick={() => setActiveTab('akinator')}>
              <div className="w-10 h-10 rounded-2xl bg-zinc-900 text-white flex items-center justify-center shadow-tactile-sm border-2 border-zinc-900 transition-transform hover:-rotate-3">
                <Stethoscope className="w-5 h-5 text-teal-400 font-bold" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-2xl font-black tracking-tight text-zinc-900">
                    AkiMed<span className="text-teal-600">.</span>
                  </span>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-950 border border-emerald-300">
                    Clinical AI
                  </span>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-950 border border-amber-300 hidden sm:inline-flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                    MPS GPU Active
                  </span>
                </div>
                <p className="text-[11px] font-medium text-zinc-500 -mt-0.5">
                  Clinical Akinator • 5-Tier ESI Triage • Fuzzy Typo AI
                </p>
              </div>
            </div>

            {/* Nav Tabs - Akademia Clean Pill Style */}
            <nav className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              <button
                onClick={() => setActiveTab('akinator')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'akinator'
                    ? 'bg-zinc-900 text-white shadow-tactile-sm'
                    : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200/60'
                }`}
              >
                <Brain className="w-3.5 h-3.5 text-teal-400" />
                <span>Dr. Akinator Game</span>
              </button>

              <button
                onClick={() => setActiveTab('triage')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'triage'
                    ? 'bg-zinc-900 text-white shadow-tactile-sm'
                    : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200/60'
                }`}
              >
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                <span>Triage & Differential</span>
              </button>

              <button
                onClick={() => setActiveTab('vignettes')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'vignettes'
                    ? 'bg-zinc-900 text-white shadow-tactile-sm'
                    : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200/60'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Case Vignettes</span>
              </button>

              <button
                onClick={() => setActiveTab('guide')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'guide'
                    ? 'bg-zinc-900 text-white shadow-tactile-sm'
                    : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200/60'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                <span>MBBS Blueprint</span>
              </button>

              {/* Model Hub Pill Button (Akademia "Get in touch" style) */}
              <button
                onClick={() => setShowTelemetryModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border-2 border-zinc-900 bg-white hover:bg-zinc-900 hover:text-white text-zinc-900 text-xs font-extrabold shadow-tactile-sm transition-all ml-1 cursor-pointer"
                title="Inspect Saved Model Checkpoints, Training Curves, and 25,000-Scenario Stress Test"
              >
                <Cpu className="w-3.5 h-3.5 text-teal-600" />
                <span>Model Hub</span>
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
