import React, { useState } from 'react';
import { Zap, HelpCircle, Flame, ShieldAlert, Sparkles, Filter } from 'lucide-react';
import { GitHubRepository } from '../../types/github';
import { RepositoryCard } from '../feed/RepositoryCard';
import { ScoringMethodologyModal } from './ScoringMethodologyModal';

interface ViralWatchViewProps {
  repositories: GitHubRepository[];
  bookmarks: number[];
  onToggleBookmark: (repo: GitHubRepository) => void;
  onSelectRepo: (repo: GitHubRepository) => void;
  onFilterTopic: (topic: string) => void;
}

export const ViralWatchView: React.FC<ViralWatchViewProps> = ({
  repositories,
  bookmarks,
  onToggleBookmark,
  onSelectRepo,
  onFilterTopic,
}) => {
  const [showMethodology, setShowMethodology] = useState(false);
  const [filterMode, setFilterMode] = useState<'all' | 'verified' | 'newcomers'>('all');

  const sorted = [...repositories].sort(
    (a, b) => (b.viralScore || 0) - (a.viralScore || 0)
  );

  const filtered = sorted.filter((repo) => {
    if (filterMode === 'verified') {
      return repo.observedGrowth?.measured && (repo.observedGrowth.starsGained || 0) > 0;
    }
    if (filterMode === 'newcomers') {
      const daysOld =
        (Date.now() - new Date(repo.created_at).getTime()) / (1000 * 3600 * 24);
      return daysOld <= 90;
    }
    return true;
  });

  const topScorer = sorted[0];
  const verifiedCount = sorted.filter((r) => r.observedGrowth?.measured).length;
  const newcomerCount = sorted.filter((r) => {
    const daysOld =
      (Date.now() - new Date(r.created_at).getTime()) / (1000 * 3600 * 24);
    return daysOld <= 90;
  }).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="p-7 rounded-[26px] bg-white dark:bg-[#1C1C1E] border border-black/[0.04] dark:border-white/[0.06] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0071E3]/10 dark:bg-[#0A84FF]/20 text-[#0071E3] dark:text-[#0A84FF] text-xs font-semibold mb-3">
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>Velocity & Momentum Engine</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
            Viral Watch
          </h2>
          <p className="text-xs sm:text-sm text-[#86868B] mt-1.5 leading-relaxed">
            Spotlighting breakout open-source projects using snapshot star velocity, creation freshness, and developer community branching.
          </p>
        </div>

        <button
          onClick={() => setShowMethodology(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-black/[0.04] dark:bg-white/[0.08] hover:bg-black/[0.08] dark:hover:bg-white/[0.12] text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] transition-all self-start md:self-auto shadow-xs"
        >
          <HelpCircle className="w-4 h-4 text-[#0071E3] dark:text-[#0A84FF]" />
          <span>Methodology</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-[#1C1C1E] border border-black/[0.04] dark:border-white/[0.06] shadow-sm">
          <span className="text-xs font-semibold text-[#86868B] uppercase tracking-wider block mb-1">
            Top Momentum Score
          </span>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-[#0071E3] dark:text-[#0A84FF]">
            {topScorer ? `${topScorer.viralScore}/100` : '—'}
          </div>
          <div className="text-xs text-[#86868B] mt-1 truncate">
            {topScorer?.name || 'No data'}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#1C1C1E] border border-black/[0.04] dark:border-white/[0.06] shadow-sm">
          <span className="text-xs font-semibold text-[#86868B] uppercase tracking-wider block mb-1">
            Verified Deltas
          </span>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-[#34C759] dark:text-[#30D158]">
            {verifiedCount}
          </div>
          <div className="text-xs text-[#86868B] mt-1">
            Repositories with 2+ snapshots
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#1C1C1E] border border-black/[0.04] dark:border-white/[0.06] shadow-sm">
          <span className="text-xs font-semibold text-[#86868B] uppercase tracking-wider block mb-1">
            New Projects (&lt;90d)
          </span>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-[#FF9500] dark:text-[#FF9F0A]">
            {newcomerCount}
          </div>
          <div className="text-xs text-[#86868B] mt-1">
            Rapidly created modern projects
          </div>
        </div>
      </div>

      {/* Segmented Filter Control */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center p-1 rounded-full bg-black/[0.05] dark:bg-white/[0.08] border border-black/[0.02] dark:border-white/[0.04] select-none">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs transition-all font-medium ${
              filterMode === 'all'
                ? 'bg-white dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-[#F5F5F7] shadow-sm font-semibold'
                : 'text-[#6E6E73] dark:text-[#A1A1A6] hover:text-[#1D1D1F] dark:hover:text-white'
            }`}
          >
            All Breakouts ({sorted.length})
          </button>
          <button
            onClick={() => setFilterMode('verified')}
            className={`px-3.5 py-1.5 rounded-full text-xs transition-all font-medium ${
              filterMode === 'verified'
                ? 'bg-white dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-[#F5F5F7] shadow-sm font-semibold'
                : 'text-[#6E6E73] dark:text-[#A1A1A6] hover:text-[#1D1D1F] dark:hover:text-white'
            }`}
          >
            Verified Growth ({verifiedCount})
          </button>
          <button
            onClick={() => setFilterMode('newcomers')}
            className={`px-3.5 py-1.5 rounded-full text-xs transition-all font-medium ${
              filterMode === 'newcomers'
                ? 'bg-white dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-[#F5F5F7] shadow-sm font-semibold'
                : 'text-[#6E6E73] dark:text-[#A1A1A6] hover:text-[#1D1D1F] dark:hover:text-white'
            }`}
          >
            New Projects ({newcomerCount})
          </button>
        </div>

        <span className="text-xs text-[#86868B]">
          Ranked by composite viral momentum
        </span>
      </div>

      {/* Grid of Viral Repositories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((repo) => (
          <RepositoryCard
            key={repo.id}
            repository={repo}
            isBookmarked={bookmarks.includes(repo.id)}
            onToggleBookmark={onToggleBookmark}
            onSelect={onSelectRepo}
            onFilterTopic={onFilterTopic}
          />
        ))}
      </div>

      {/* Scoring Methodology Modal */}
      <ScoringMethodologyModal
        isOpen={showMethodology}
        onClose={() => setShowMethodology(false)}
      />
    </div>
  );
};
