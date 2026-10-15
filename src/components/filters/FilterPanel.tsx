import React, { useState } from 'react';
import { FilterState, SortOption } from '../../types/filters';
import { POPULAR_LANGUAGES } from '../../utils/languages';
import { Filter, X, RotateCcw, ChevronDown, SlidersHorizontal, Sparkles } from 'lucide-react';

interface FilterPanelProps {
  filters: FilterState;
  onChange: (updated: Partial<FilterState>) => void;
  onReset: () => void;
  resultCount: number;
  totalAvailable: number;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onChange,
  onReset,
  resultCount,
  totalAvailable,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const activeFilterCount =
    (filters.language.toLowerCase() !== 'all' ? 1 : 0) +
    (filters.minStars > 0 ? 1 : 0) +
    (filters.minGrowth > 0 ? 1 : 0) +
    (filters.topic.trim() ? 1 : 0) +
    (filters.searchQuery.trim() ? 1 : 0);

  const starPresets = [
    { label: 'Any', value: 0 },
    { label: '>100', value: 100 },
    { label: '>1k', value: 1000 },
    { label: '>5k', value: 5000 },
    { label: '>10k', value: 10000 },
    { label: '>50k', value: 50000 },
  ];

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'stars', label: 'Total Stars' },
    { value: 'growth', label: 'Observed Star Growth' },
    { value: 'viral', label: 'Viral Momentum Score' },
    { value: 'forks', label: 'Most Forks' },
    { value: 'updated', label: 'Recently Updated' },
  ];

  return (
    <div className="rounded-2xl bg-[#12141A] border border-[#232733] overflow-hidden transition-all">
      {/* Header Bar */}
      <div className="p-3.5 sm:px-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#181B24] border border-[#262936] text-xs font-medium text-neutral-200 hover:text-white transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-indigo-600 text-white font-mono text-[10px]">
                {activeFilterCount}
              </span>
            )}
            <ChevronDown
              className={`w-3.5 h-3.5 text-neutral-400 transition-transform duration-200 ${
                isOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Result Count Indicator */}
          <div className="text-xs font-mono text-neutral-400">
            Showing <span className="text-white font-semibold">{resultCount}</span> of{' '}
            <span className="text-neutral-300">{totalAvailable}</span> repositories
          </div>
        </div>

        {/* Quick Sorting Selector */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-neutral-400 font-mono hidden sm:inline">Sort:</span>
          <select
            value={filters.sortBy}
            onChange={(e) => onChange({ sortBy: e.target.value as SortOption })}
            className="px-2.5 py-1.5 rounded-xl bg-[#181B24] border border-[#262936] text-xs text-neutral-200 focus:outline-none focus:border-indigo-500 font-sans cursor-pointer"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {activeFilterCount > 0 && (
            <button
              onClick={onReset}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#1E2230] text-neutral-300 hover:text-white text-xs transition-colors"
              title="Reset all filters"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Expandable Filter Body */}
      {isOpen && (
        <div className="p-4 sm:p-5 border-t border-[#232733] bg-[#0E1015] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-1 duration-150">
          {/* 1. Language Filter */}
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5 font-mono">
              Programming Language
            </label>
            <select
              value={filters.language}
              onChange={(e) => onChange({ language: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-[#161821] border border-[#262936] text-xs text-white focus:outline-none focus:border-indigo-500 font-sans cursor-pointer"
            >
              <option value="all">All Languages</option>
              {POPULAR_LANGUAGES.map((l) => (
                <option key={l.name} value={l.name}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Minimum Stars */}
          <div>
            <div className="flex items-center justify-between text-xs font-mono text-neutral-300 mb-1.5">
              <span>Min. Stars</span>
              <span className="text-indigo-400 font-semibold">
                {filters.minStars > 0 ? `≥ ${filters.minStars.toLocaleString()}` : 'Any'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {starPresets.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => onChange({ minStars: preset.value })}
                  className={`px-2 py-1 rounded-lg text-[11px] font-mono transition-colors ${
                    filters.minStars === preset.value
                      ? 'bg-indigo-600 text-white font-medium'
                      : 'bg-[#181B24] border border-[#262936] text-neutral-400 hover:text-white'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Topic Tag */}
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5 font-mono">
              Topic / Tag
            </label>
            <div className="relative">
              <input
                type="text"
                value={filters.topic}
                onChange={(e) => onChange({ topic: e.target.value })}
                placeholder="e.g. ai, cli, agent, rust"
                className="w-full px-3 py-2 rounded-xl bg-[#161821] border border-[#262936] text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500 font-sans"
              />
              {filters.topic && (
                <button
                  onClick={() => onChange({ topic: '' })}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* 4. Minimum Observed Growth */}
          <div>
            <div className="flex items-center justify-between text-xs font-mono text-neutral-300 mb-1.5">
              <span>Min. Observed Gain</span>
              <span className="text-emerald-400 font-semibold">
                {filters.minGrowth > 0 ? `≥ +${filters.minGrowth} stars` : 'Any'}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="500"
              step="25"
              value={filters.minGrowth}
              onChange={(e) => onChange({ minGrowth: parseInt(e.target.value, 10) })}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-neutral-500 mt-1">
              <span>0 (Any)</span>
              <span>+250</span>
              <span>+500 stars</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
