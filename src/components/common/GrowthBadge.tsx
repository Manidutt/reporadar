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
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-mono font-medium transition-colors ${
            isPositive
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
          }`}
          aria-label={`Observed ${isPositive ? '+' : ''}${gained} stars over ${hours} hours`}
        >
          <TrendingUp className="w-3 h-3 shrink-0" />
          <span>
            {isPositive ? '+' : ''}
            {gained.toLocaleString()}
          </span>
          {!compact && (
            <span className="text-[10px] text-emerald-400/70 font-normal">
              /{hours}h
            </span>
          )}
        </button>

        {showTooltip && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 p-2.5 rounded-lg bg-neutral-900 border border-neutral-700 shadow-xl text-xs text-neutral-300 z-50 pointer-events-none">
            <div className="font-semibold text-white mb-1 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              Observed Star Growth
            </div>
            <p className="text-[11px] leading-tight text-neutral-400 mb-1.5">
              Gained {gained.toLocaleString()} stars across a measured {hours}-hour window.
            </p>
            {growth.velocityPerHour !== undefined && (
              <div className="text-[10px] font-mono text-neutral-400">
                Pace: <span className="text-white">{growth.velocityPerHour}</span> stars/hr
              </div>
            )}
            {growth.growthPercent !== undefined && (
              <div className="text-[10px] font-mono text-neutral-400">
                Delta: <span className="text-emerald-400">+{growth.growthPercent}%</span>
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
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono text-neutral-400 bg-neutral-800/60 border border-neutral-700/60 hover:text-neutral-300 transition-colors"
        aria-label="Growth not measured yet. Baseline established."
      >
        <Clock className="w-3 h-3 text-neutral-500 shrink-0" />
        <span>Not measured yet</span>
      </button>

      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2.5 rounded-lg bg-neutral-900 border border-neutral-700 shadow-xl text-xs text-neutral-300 z-50 pointer-events-none">
          <div className="font-semibold text-white mb-1 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-indigo-400" />
            Growth Baseline Set
          </div>
          <p className="text-[11px] leading-relaxed text-neutral-400">
            Initial star snapshot recorded. Star growth delta requires two or more genuine snapshots over time.
          </p>
        </div>
      )}
    </div>
  );
};
