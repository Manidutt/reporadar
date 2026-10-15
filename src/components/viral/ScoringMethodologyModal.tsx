import React from 'react';
import { X, ShieldCheck, Zap, TrendingUp, Sparkles, Clock, AlertTriangle } from 'lucide-react';

interface ScoringMethodologyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ScoringMethodologyModal: React.FC<ScoringMethodologyModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        className="relative w-full max-w-2xl bg-[#0F1117] border border-[#262B3A] rounded-2xl p-6 shadow-2xl z-10 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="scoring-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#222634]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h2 id="scoring-title" className="text-base font-bold text-white">
                Viral Score Methodology
              </h2>
              <p className="text-xs text-neutral-400 font-mono">
                Transparent, defensible momentum metrics
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="py-4 space-y-5 text-xs text-neutral-300 leading-relaxed">
          {/* Integrity pledge */}
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-emerald-400 block mb-0.5">
                Data Integrity Principle
              </span>
              <p className="text-neutral-300">
                RepoRadar never invents growth numbers or treats lifetime star counts as viral proof.
                A 10-year-old repository with 100,000 stars is classified as <em>Popular</em>, not <em>Viral</em>, unless it exhibits genuine rapid breakout momentum.
              </p>
            </div>
          </div>

          {/* Formulas */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              1. When Verified Snapshots Exist (Highest Confidence)
            </h3>
            <p className="mb-2 text-neutral-400">
              When two or more genuine snapshots exist across an observation window:
            </p>
            <div className="p-3 rounded-xl bg-[#151822] border border-[#232733] font-mono text-[11px] space-y-1.5">
              <div>
                <span className="text-indigo-400 font-semibold">Velocity (40%):</span> (Stars Gained / Hours Elapsed) normalized to 0–100.
              </div>
              <div>
                <span className="text-indigo-400 font-semibold">Growth Rate (25%):</span> Percentage delta relative to baseline snapshot stars.
              </div>
              <div>
                <span className="text-indigo-400 font-semibold">Engagement Ratio (15%):</span> Fork-to-star ratio (validating active community code branching).
              </div>
              <div>
                <span className="text-indigo-400 font-semibold">Push Recency (10%):</span> Fresh commits and releases in past 6–24 hours.
              </div>
              <div>
                <span className="text-indigo-400 font-semibold">Project Freshness (10%):</span> Boost for newer projects gaining stars rapidly.
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              2. When No Delta Snapshots Exist (Initial Baseline)
            </h3>
            <p className="mb-2 text-neutral-400">
              On first discovery, only an initial baseline snapshot exists. In this case, we compute <strong>Creation Momentum</strong>:
            </p>
            <div className="p-3 rounded-xl bg-[#151822] border border-[#232733] font-mono text-[11px] space-y-1.5">
              <div>
                <span className="text-amber-400 font-semibold">Creation Velocity (50%):</span> Total Stars / Days Since Repo Creation. A repo created 10 days ago with 1,500 stars has 150 stars/day.
              </div>
              <div>
                <span className="text-amber-400 font-semibold">Push Recency (25%):</span> Active code pushes in the past 24 hours.
              </div>
              <div>
                <span className="text-amber-400 font-semibold">Fork Engagement (25%):</span> Proportion of developers cloning and contributing.
              </div>
            </div>
            <p className="mt-2 text-[11px] text-neutral-500 italic">
              Labeled honestly as "Estimated Creation Momentum" until subsequent observation snapshots are recorded.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-[#151822] border border-[#232733]">
            <h4 className="font-semibold text-white mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              How to Track More Snapshots
            </h4>
            <p className="text-[11px] text-neutral-400">
              Snapshots are stored in your browser's local store. Keep RepoRadar open, revisit daily, or use the "Take Snapshot" action in Settings to record new data points and calculate live star deltas!
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-[#222634] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-colors"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
