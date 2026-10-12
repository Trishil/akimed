import React from 'react';
import { MBBS_DATASETS_AND_RESOURCES, ARCHITECTURE_EXPLANATION } from '../data/mbbsGuide';
import { 
  BookOpen, 
  ExternalLink, 
  Cpu, 
  Database, 
  Award, 
  Code, 
  CheckCircle2, 
  Compass,
  ArrowUpRight,
  HardDrive
} from 'lucide-react';

export const MbbsProjectGuide: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="bg-white border-2 border-zinc-900 rounded-3xl p-6 md:p-8 shadow-tactile">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-yellow-300 border-2 border-zinc-900 text-zinc-900 flex items-center justify-center shrink-0 shadow-tactile-sm">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider px-3 py-0.5 rounded-full bg-yellow-300 text-zinc-900 border border-zinc-900 shadow-tactile-sm">
                1st Year MBBS Medical Informatics Blueprint
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-serif font-black text-zinc-900">
              How to Build & Train a Clinical Diagnostic Akinator
            </h2>
            <p className="text-xs md:text-sm text-zinc-600 mt-2 leading-relaxed max-w-4xl font-normal">
              {ARCHITECTURE_EXPLANATION.summary}
            </p>
          </div>
        </div>
      </div>

      {/* Real-World Trained Production AI Model Card */}
      <div className="bg-white border-2 border-zinc-900 rounded-3xl p-6 shadow-tactile space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 border-2 border-zinc-900 text-emerald-950 flex items-center justify-center font-bold shadow-tactile-sm">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base md:text-lg font-serif font-black text-zinc-900">
                  Active Trained Model: AkiMed 10-Layer Clinical Transformer (Pre-LN)
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Certified Active
                </span>
              </div>
              <p className="text-xs text-zinc-600 mt-0.5 font-normal">
                10 Pre-LN Self-Attention Layers (8 tokens x 256d) • 9,024,789 parameters (~34.4 MB) • Apple Silicon MPS
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-mono font-bold text-zinc-900 bg-yellow-100 px-3 py-1 rounded-full border border-yellow-300 shadow-tactile-sm">
              Val Top-3: 99.99% • Triage: 99.97%
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#FAF8F5] border-2 border-zinc-900/15 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-zinc-600 font-bold flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
              <HardDrive className="w-4 h-4 text-zinc-900" />
              Persistent Storage Location on Disk:
            </span>
            <span className="text-zinc-500 font-mono text-[11px]">Primary External Model Drive</span>
          </div>
          <div className="p-2.5 rounded-xl bg-white border border-zinc-300 font-mono text-xs text-zinc-900 select-all break-all font-semibold">
            /Volumes/Trishil/Akimed_data/models/
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-zinc-700 text-[11px]">
            <div>• <strong className="text-zinc-900">Best Weights:</strong> akimed_clinical_transformer_best.pt (~34.4 MB)</div>
            <div>• <strong className="text-zinc-900">Checkpoints:</strong> models/checkpoints/ (checkpoint_epoch_*.pt)</div>
            <div>• <strong className="text-zinc-900">Adversarial Report:</strong> models/adversarial_stress_report.json</div>
          </div>
        </div>
      </div>

      {/* Datasets & Direct Download Links */}
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-serif font-black text-zinc-900 flex items-center gap-2">
            <Database className="w-5 h-5 text-zinc-900" />
            1. What Data Do You Need to Train On? (Direct Download Links)
          </h3>
          <p className="text-xs text-zinc-600 mt-0.5">
            Verified open-access clinical datasets, knowledge graphs, and board-exam benchmarks
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MBBS_DATASETS_AND_RESOURCES.map((resource, idx) => (
            <div
              key={idx}
              className="bg-white border-2 border-zinc-900 rounded-3xl p-6 shadow-tactile transition-all flex flex-col justify-between hover:-translate-y-0.5"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-bold px-3 py-0.5 rounded-full bg-yellow-300 text-zinc-900 border border-zinc-900 shadow-tactile-sm">
                    {resource.category}
                  </span>
                  <span className="text-[11px] text-zinc-500 font-mono">
                    {resource.source}
                  </span>
                </div>

                <h4 className="text-base font-serif font-black text-zinc-900 mb-2 flex items-center justify-between">
                  <span>{resource.title}</span>
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-600 hover:text-zinc-900 transition-colors p-1"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </h4>

                <p className="text-xs text-zinc-600 mb-3 leading-relaxed font-normal">
                  {resource.description}
                </p>

                <div className="bg-[#FAF8F5] border border-zinc-200 rounded-xl p-3 text-xs text-zinc-700">
                  <strong className="text-zinc-900 block mb-0.5 font-bold">MBBS Student Value:</strong>
                  {resource.mbbsRelevance}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-100">
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-tactile-sm cursor-pointer border-2 border-zinc-900"
                >
                  <span>Visit Dataset Repository</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-yellow-300" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Comparison of Architectural Routes */}
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-serif font-black text-zinc-900 flex items-center gap-2">
            <Compass className="w-5 h-5 text-zinc-900" />
            2. Which Route Should You Take? (Architectural Comparison)
          </h3>
          <p className="text-xs text-zinc-600 mt-0.5">
            Comparing classical decision trees, pure LLM fine-tuning, and the modern hybrid approach
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {ARCHITECTURE_EXPLANATION.approaches.map((appr, idx) => (
            <div
              key={idx}
              className={`bg-white border-2 border-zinc-900 rounded-3xl p-6 shadow-tactile flex flex-col justify-between ${
                idx === 2 ? 'ring-2 ring-zinc-900 bg-[#FAF8F5]' : ''
              }`}
            >
              <div>
                {idx === 2 && (
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-yellow-300 text-zinc-900 border border-zinc-900 uppercase tracking-wider block w-max mb-2.5 shadow-tactile-sm">
                    Implemented in this Applet
                  </span>
                )}
                <h4 className="text-base font-serif font-black text-zinc-900 mb-2 leading-snug">{appr.name}</h4>
                <p className="text-xs text-zinc-600 mb-4 leading-relaxed font-normal">{appr.howItWorks}</p>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="font-bold text-emerald-800 block mb-1">Strengths:</span>
                    <ul className="space-y-1 text-zinc-700">
                      {appr.pros.map((p, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <span className="font-bold text-rose-800 block mb-1">Limitations:</span>
                    <ul className="space-y-1 text-zinc-700">
                      {appr.cons.map((c, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-rose-600 font-bold">•</span>
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Step-by-Step Training Code & Pipeline */}
      <div className="bg-white border-2 border-zinc-900 rounded-3xl p-6 md:p-8 shadow-tactile space-y-4">
        <h3 className="text-base font-serif font-black text-zinc-900 flex items-center gap-2">
          <Code className="w-5 h-5 text-zinc-900" />
          3. How to Train It (The Mathematical Algorithm Behind the Akinator)
        </h3>

        <div className="space-y-3 text-xs md:text-sm text-zinc-700 leading-relaxed font-normal">
          <p>
            An Akinator works by minimizing <strong>Shannon Entropy (Information Gain)</strong> at each question:
          </p>

          <div className="bg-[#FAF8F5] border-2 border-zinc-900/20 rounded-2xl p-4 font-mono text-xs text-zinc-900 overflow-x-auto font-semibold">
            {`H(Diseases) = - ∑ P(d_i) * log2( P(d_i) )

Information Gain = H(Diseases) - [ P(Yes)*H(Diseases|Yes) + P(No)*H(Diseases|No) ]`}
          </div>

          <p>
            In medical diagnosis, you cannot rely <em>only</em> on pure mathematical entropy because clinical medicine has <strong>Red Flags</strong> (e.g. Aortic Dissection or Meningococcemia cannot be eliminated just because it is statistically rare). Therefore, the optimal engine calculates:
          </p>

          <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 font-mono text-xs text-amber-950 overflow-x-auto font-semibold">
            {`Clinical_Utility(Question) = Information_Gain(Question) + Red_Flag_Urgency_Weight(Question)`}
          </div>
        </div>
      </div>

      {/* MBBS Year-by-Year Research Roadmap */}
      <div className="bg-white border-2 border-zinc-900 rounded-3xl p-6 md:p-8 shadow-tactile space-y-4">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-zinc-900" />
          <h3 className="text-base font-serif font-black text-zinc-900">
            4. Your Roadmap: From 1st Year MBBS to Published Student Paper
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {ARCHITECTURE_EXPLANATION.studentMilestones.map((m, idx) => (
            <div key={idx} className="bg-[#FAF8F5] border-2 border-zinc-900/15 rounded-2xl p-5 space-y-2">
              <span className="text-xs font-bold text-zinc-900 font-mono uppercase tracking-wider block bg-yellow-200 px-2 py-0.5 rounded-full w-max border border-yellow-400">
                {m.year}
              </span>
              <h5 className="text-xs font-bold text-zinc-900">{m.focus}</h5>
              <p className="text-xs text-zinc-600 leading-relaxed font-normal">{m.appContribution}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
