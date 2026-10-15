import React from 'react';
import { X, ShieldCheck, Zap, TrendingUp, Sparkles, Clock } from 'lucide-react';

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
        className="fixed inset-0 bg-black/40 backdrop-blur-md animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Sheet */}
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-[#1C1C1E] border border-black/[0.08] dark:border-white/[0.1] rounded-[28px] p-7 shadow-2xl z-10 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="scoring-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-black/[0.06] dark:border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-[#0071E3]/10 dark:bg-[#0A84FF]/20 text-[#0071E3] dark:text-[#0A84FF] flex items-center justify-center">
              <Zap className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h2 id="scoring-title" className="text-base font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
                Viral Score Methodology
              </h2>
              <p className="text-xs text-[#86868B]">
                Transparent & defensible momentum indicators
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/[0.05] dark:bg-white/[0.08] text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white flex items-center justify-center transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="py-4 space-y-5 text-xs text-[#1D1D1F] dark:text-[#F5F5F7] leading-relaxed">
          {/* Integrity pledge */}
          <div className="p-4 rounded-2xl bg-[#34C759]/10 border border-[#34C759]/20 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-[#34C759] shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-[#28A745] dark:text-[#30D158] block mb-0.5">
                Integrity Guarantee
              </span>
              <p className="text-[#6E6E73] dark:text-[#A1A1A6] text-xs">
                RepoRadar never fabricates growth numbers. A ten-year-old repository with 100,000 stars is classified as <em>Popular</em>, not <em>Viral</em>, unless it exhibits genuine rapid breakout momentum.
              </p>
            </div>
          </div>

          {/* Formulas */}
          <div>
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#0071E3] dark:text-[#0A84FF]" />
              1. When Verified Snapshots Exist (Highest Confidence)
            </h3>
            <p className="mb-2 text-[#86868B]">
              Calculated when two or more genuine snapshots exist across an observation window:
            </p>
            <div className="p-3.5 rounded-2xl bg-[#F5F5F7] dark:bg-[#2C2C2E] border border-black/[0.04] dark:border-white/[0.06] text-xs space-y-1.5 font-sans">
              <div>
                <span className="font-semibold text-[#0071E3] dark:text-[#0A84FF]">Velocity (40%):</span> (Stars Gained / Hours Elapsed) normalized to 0–100.
              </div>
              <div>
                <span className="font-semibold text-[#0071E3] dark:text-[#0A84FF]">Growth Rate (25%):</span> Percentage delta relative to baseline snapshot stars.
              </div>
              <div>
                <span className="font-semibold text-[#0071E3] dark:text-[#0A84FF]">Engagement (15%):</span> Fork-to-star ratio (validating active community code branching).
              </div>
              <div>
                <span className="font-semibold text-[#0071E3] dark:text-[#0A84FF]">Push Recency (10%):</span> Fresh commits and releases in past 6–24 hours.
              </div>
              <div>
                <span className="font-semibold text-[#0071E3] dark:text-[#0A84FF]">Project Freshness (10%):</span> Boost for newer projects gaining stars rapidly.
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#FF9500]" />
              2. When No Delta Snapshots Exist (Initial Baseline)
            </h3>
            <p className="mb-2 text-[#86868B]">
              On initial discovery, only an initial baseline snapshot exists. In this case, we compute <strong>Creation Momentum</strong>:
            </p>
            <div className="p-3.5 rounded-2xl bg-[#F5F5F7] dark:bg-[#2C2C2E] border border-black/[0.04] dark:border-white/[0.06] text-xs space-y-1.5 font-sans">
              <div>
                <span className="font-semibold text-[#FF9500]">Creation Velocity (50%):</span> Total Stars / Days Since Repo Creation.
              </div>
              <div>
                <span className="font-semibold text-[#FF9500]">Push Recency (25%):</span> Active code pushes in the past 24 hours.
              </div>
              <div>
                <span className="font-semibold text-[#FF9500]">Fork Engagement (25%):</span> Proportion of developers cloning and contributing.
              </div>
            </div>
            <p className="mt-2 text-[11px] text-[#86868B] italic">
              Labeled honestly as "Baseline Tracking" until subsequent observation snapshots are recorded.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-black/[0.06] dark:border-white/[0.08] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-full bg-[#0071E3] dark:bg-[#0A84FF] text-white text-xs font-semibold shadow-md transition-all hover:scale-102"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
