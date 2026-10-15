import React, { useState } from 'react';
import { TrendingUp, Clock, Info } from 'lucide-react';
import { GitHubRepository } from '../../types/github';

interface GrowthBadgeProps {
  growth: GitHubRepository['observedGrowth'];
  compact?: boolean;
}

export const GrowthBadge: React.FC<GrowthBadgeProps> = ({ growth, compact = false }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  if (growth && growth.measured && growth.starsGained !== undefined) {
    const gained = growth.starsGained;
    const hours = growth.hoursElapsed || 24;
    const isPositive = gained >= 0;

    return (
      <div className="relative inline-flex items-center">
        <button
          type="button"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          onFocus={() => setShowTooltip(true)}
          onBlur={() => setShowTooltip(false)}
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium transition-all ${
            isPositive
              ? 'bg-[#34C759]/12 text-[#28A745] dark:text-[#30D158] border border-[#34C759]/20'
              : 'bg-[#FF3B30]/12 text-[#FF3B30] border border-[#FF3B30]/20'
          }`}
          aria-label={`Observed ${isPositive ? '+' : ''}${gained} stars over ${hours} hours`}
        >
          <TrendingUp className="w-3 h-3 shrink-0" />
          <span>
            {isPositive ? '+' : ''}
            {gained.toLocaleString()}
          </span>
          {!compact && (
            <span className="text-[10px] opacity-75 font-normal">
              /{hours}h
            </span>
          )}
        </button>

        {showTooltip && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 p-3 rounded-2xl bg-white dark:bg-[#2C2C2E] border border-black/[0.08] dark:border-white/[0.1] shadow-xl text-xs text-[#1D1D1F] dark:text-[#F5F5F7] z-50 pointer-events-none">
            <div className="font-semibold mb-1 flex items-center gap-1.5 text-[#34C759] dark:text-[#30D158]">
              <TrendingUp className="w-3.5 h-3.5" />
              Observed Star Growth
            </div>
            <p className="text-[11px] leading-tight text-[#86868B] mb-1.5">
              +{gained.toLocaleString()} stars across a measured {hours}-hour observation window.
            </p>
            {growth.velocityPerHour !== undefined && (
              <div className="text-[10px] font-mono text-[#86868B]">
                Pace: <span className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">{growth.velocityPerHour}</span> stars/hr
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Honest unmeasured baseline state
  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] text-[#86868B] bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.04] dark:border-white/[0.06] hover:text-[#1D1D1F] dark:hover:text-white transition-colors"
        aria-label="Growth not measured yet. Baseline established."
      >
        <Clock className="w-3 h-3 text-[#86868B] shrink-0" />
        <span>Baseline tracking</span>
      </button>

      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-3 rounded-2xl bg-white dark:bg-[#2C2C2E] border border-black/[0.08] dark:border-white/[0.1] shadow-xl text-xs text-[#1D1D1F] dark:text-[#F5F5F7] z-50 pointer-events-none">
          <div className="font-semibold mb-1 flex items-center gap-1.5 text-[#0071E3] dark:text-[#0A84FF]">
            <Info className="w-3.5 h-3.5" />
            Growth Baseline Set
          </div>
          <p className="text-[11px] leading-relaxed text-[#86868B]">
            Initial snapshot recorded. Star delta will calculate once subsequent observations accumulate.
          </p>
        </div>
      )}
    </div>
  );
};
