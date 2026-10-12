import React from 'react';
import { SAMPLE_CLINICAL_VIGNETTES } from '../data/vignettes';
import { PrebuiltVignette } from '../types/clinical';
import { Sparkles, ArrowRight, Activity, AlertCircle, Compass } from 'lucide-react';

interface VignetteSelectorProps {
  onSelectVignette: (vignette: PrebuiltVignette) => void;
}

export const VignetteSelector: React.FC<VignetteSelectorProps> = ({ onSelectVignette }) => {
  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white border-2 border-zinc-900 rounded-3xl p-6 md:p-8 shadow-tactile">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-yellow-300 border-2 border-zinc-900 text-zinc-900 flex items-center justify-center shadow-tactile-sm">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-serif font-black text-zinc-900">
              High-Yield MBBS Clinical Vignettes
            </h2>
            <p className="text-xs md:text-sm text-zinc-600 mt-0.5">
              Select a standardized patient scenario to test Dr. Akinator's question policy and emergency triage engine
            </p>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {SAMPLE_CLINICAL_VIGNETTES.map((vignette, idx) => {
          const isEven = idx % 2 === 0;
          return (
            <div
              key={vignette.id}
              className={`bg-white border-2 border-zinc-900 rounded-3xl p-6 shadow-tactile transition-all flex flex-col justify-between group ${
                isEven ? 'hover:-rotate-0.5' : 'hover:rotate-0.5'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-yellow-300 text-zinc-900 border-2 border-zinc-900 shadow-tactile-sm">
                    {vignette.specialty}
                  </span>
                  <span className="text-[10px] text-zinc-600 font-mono font-bold px-2 py-0.5 rounded-full bg-[#FAF8F5] border border-zinc-300 uppercase">
                    {vignette.difficulty}
                  </span>
                </div>

                <h3 className="text-lg md:text-xl font-serif font-black text-zinc-900 group-hover:text-zinc-700 transition-colors mb-2">
                  {vignette.title}
                </h3>

                <p className="text-xs md:text-sm text-zinc-600 mb-4 leading-relaxed font-normal">
                  {vignette.tagline}
                </p>

                {/* Patient Quick Vitals & Factors preview */}
                <div className="bg-[#FAF8F5] border-2 border-zinc-900/10 rounded-2xl p-4 text-xs space-y-2 text-zinc-700 mb-5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-zinc-500">Demographics:</span>
                    <strong className="text-zinc-900 font-bold">
                      {vignette.patient.age}y {vignette.patient.gender}
                    </strong>
                  </div>
                  {vignette.patient.travelHistory && (
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-zinc-500 flex items-center gap-1">
                        <Compass className="w-3.5 h-3.5 text-zinc-500" />
                        Travel:
                      </span>
                      <strong className="text-zinc-900 truncate max-w-[200px] font-bold">
                        {vignette.patient.travelHistory}
                      </strong>
                    </div>
                  )}
                  {vignette.patient.preExistingConditions && vignette.patient.preExistingConditions.length > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-zinc-500 flex items-center gap-1">
                        <Activity className="w-3.5 h-3.5 text-zinc-500" />
                        History:
                      </span>
                      <strong className="text-zinc-900 font-bold truncate max-w-[200px]">
                        {vignette.patient.preExistingConditions.join(', ')}
                      </strong>
                    </div>
                  )}
                  {vignette.patient.allergies && vignette.patient.allergies.length > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-zinc-500 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                        Allergies:
                      </span>
                      <strong className="text-rose-700 font-bold">
                        {vignette.patient.allergies.join(', ')}
                      </strong>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => onSelectVignette(vignette)}
                className="w-full py-3 px-5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer border-2 border-zinc-900 shadow-tactile-sm hover:translate-x-0.5 hover:translate-y-0.5"
              >
                <span>Load Case into Dr. Akinator</span>
                <ArrowRight className="w-4 h-4 text-yellow-300" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
