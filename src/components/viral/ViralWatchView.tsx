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

  // Sort by Viral Score descending
  const sorted = [...repositories].sort(
    (a, b) => (b.viralScore || 0) - (a.viralScore || 0)
  );

  // Filter based on selected mode
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
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#171924] via-[#151722] to-[#12141A] border border-[#2A2E3D] relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 text-xs font-mono font-medium mb-3">
              <Zap className="w-3.5 h-3.5" />
              <span>Momentum & Velocity Engine</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Viral Watch Radar
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1 leading-relaxed">
              Detecting breakout repositories using genuine snapshot star deltas, creation acceleration, and developer engagement ratios.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <button
              onClick={() => setShowMethodology(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#1D212E] hover:bg-[#252A3B] border border-[#2F3547] text-xs font-semibold text-neutral-200 hover:text-white transition-all shadow-sm"
            >
              <HelpCircle className="w-4 h-4 text-indigo-400" />
              <span>Scoring Methodology</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-[#12141A] border border-[#232733]">
          <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider block mb-1">
            Top Momentum Score
          </span>
          <div className="text-2xl font-bold font-mono text-indigo-400">
            {topScorer ? `${topScorer.viralScore}/100` : '—'}
          </div>
          <div className="text-xs text-neutral-400 mt-0.5 truncate">
            {topScorer?.name || 'No data'}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#12141A] border border-[#232733]">
          <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider block mb-1">
            Verified Snapshot Deltas
          </span>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            {verifiedCount}
          </div>
          <div className="text-xs text-neutral-400 mt-0.5">
            Repositories with 2+ snapshots
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#12141A] border border-[#232733]">
          <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider block mb-1">
            Breakout Newcomers (&lt;90d)
          </span>
          <div className="text-2xl font-bold font-mono text-amber-400">
            {newcomerCount}
          </div>
          <div className="text-xs text-neutral-400 mt-0.5">
            Rapidly created modern projects
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-3 border-b border-[#232733] pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filterMode === 'all'
                ? 'bg-indigo-600 text-white font-semibold'
                : 'text-neutral-400 hover:text-white bg-[#141720]'
            }`}
          >
            All Breakouts ({sorted.length})
          </button>
          <button
            onClick={() => setFilterMode('verified')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filterMode === 'verified'
                ? 'bg-indigo-600 text-white font-semibold'
                : 'text-neutral-400 hover:text-white bg-[#141720]'
            }`}
          >
            Verified Growth ({verifiedCount})
          </button>
          <button
            onClick={() => setFilterMode('newcomers')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filterMode === 'newcomers'
                ? 'bg-indigo-600 text-white font-semibold'
                : 'text-neutral-400 hover:text-white bg-[#141720]'
            }`}
          >
            New Projects (&lt;90d) ({newcomerCount})
          </button>
        </div>

        <span className="text-xs font-mono text-neutral-400 hidden sm:inline">
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
