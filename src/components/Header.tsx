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
      <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b-[2.5px] border-black text-black transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3.5 gap-3">
            
            {/* Brand Logo - Authentic Neobrutalism UI */}
            <div 
              className="flex items-center space-x-3 cursor-pointer select-none group" 
              onClick={() => setActiveTab('akinator')}
            >
              <div className="w-12 h-12 rounded-2xl bg-[#8B5CF6] text-white flex items-center justify-center border-[2.5px] border-black shadow-[3px_3px_0px_0px_#000000] transition-all hover:translate-x-[-1.5px] hover:translate-y-[-1.5px] hover:shadow-[5px_5px_0px_0px_#000000]">
                <Stethoscope className="w-6 h-6 text-white font-black stroke-[2.5]" />
              </div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-2xl font-black tracking-tight text-black">
                  AkiMed<span className="text-[#8B5CF6]">.</span>
                </span>
                <span className={`text-[11px] font-black px-3 py-1 rounded-full border-2 border-black shadow-[2px_2px_0px_0px_#000000] inline-flex items-center gap-1.5 ${
                  engineStatus.activeEngine === 'local_ml'
                    ? 'bg-[#DCFCE7] text-[#064E3B]'
                    : 'bg-[#EDE9FE] text-[#4C1D95]'
                }`}>
                  <span className={`w-2 h-2 rounded-full border border-black ${
                    engineStatus.activeEngine === 'local_ml' ? 'bg-[#00F5A0] animate-pulse' : 'bg-[#8B5CF6] animate-ping'
                  }`}></span>
                  {engineStatus.activeEngine === 'local_ml' ? 'MPS GPU Active (212.9M)' : 'Engine Initializing...'}
                </span>
              </div>
            </div>

            {/* Nav Tabs - Authentic Neobrutalism Action Buttons */}
            <nav className="flex items-center gap-2.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              <button
                type="button"
                onClick={() => setActiveTab('akinator')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs transition-all whitespace-nowrap cursor-pointer border-2 border-black ${
                  activeTab === 'akinator'
                    ? 'bg-[#8B5CF6] text-white font-black shadow-[3px_3px_0px_0px_#000000] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4.5px_4.5px_0px_0px_#000000]'
                    : 'bg-white hover:bg-[#EDE9FE] text-black font-bold shadow-[2px_2px_0px_0px_#000000]'
                }`}
              >
                <Brain className={`w-3.5 h-3.5 stroke-[2.5] ${activeTab === 'akinator' ? 'text-white' : 'text-[#8B5CF6]'}`} />
                <span>Dr. Akinator Game</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('triage')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs transition-all whitespace-nowrap cursor-pointer border-2 border-black ${
                  activeTab === 'triage'
                    ? 'bg-[#3B82F6] text-white font-black shadow-[3px_3px_0px_0px_#000000] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4.5px_4.5px_0px_0px_#000000]'
                    : 'bg-white hover:bg-[#DBEAFE] text-black font-bold shadow-[2px_2px_0px_0px_#000000]'
                }`}
              >
                <Activity className={`w-3.5 h-3.5 stroke-[2.5] ${activeTab === 'triage' ? 'text-white' : 'text-[#3B82F6]'}`} />
                <span>Direct Emergency Triage</span>
              </button>

              {/* Neobrutalism Marigold AI Model Spec Button */}
              <button
                type="button"
                onClick={() => setShowTelemetryModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border-2 border-black bg-[#FFC900] hover:bg-[#E5B400] text-black text-xs font-black shadow-[3px_3px_0px_0px_#000000] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4.5px_4.5px_0px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_#000000] transition-all ml-1 cursor-pointer"
                title="Inspect 212.9M Attention Transformer Specs, MPS Kernel Telemetry, and Tensor Dimensions"
              >
                <Cpu className="w-3.5 h-3.5 text-black stroke-[2.5]" />
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
