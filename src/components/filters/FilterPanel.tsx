import React, { useState } from 'react';
import { FilterState, SortOption } from '../../types/filters';
import { POPULAR_LANGUAGES } from '../../utils/languages';
import { SlidersHorizontal, ChevronDown, RotateCcw, X } from 'lucide-react';

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
    <div className="rounded-2xl bg-white dark:bg-[#1C1C1E] border border-black/[0.04] dark:border-white/[0.06] shadow-sm overflow-hidden transition-all">
      {/* Header Bar */}
      <div className="p-3 sm:px-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/[0.04] dark:bg-white/[0.08] text-xs font-medium text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-black/[0.07] dark:hover:bg-white/[0.12] transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#0071E3] dark:text-[#0A84FF]" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-[#0071E3] dark:bg-[#0A84FF] text-white text-[10px] font-mono">
                {activeFilterCount}
              </span>
            )}
            <ChevronDown
              className={`w-3.5 h-3.5 text-[#86868B] transition-transform duration-200 ${
                isOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Result Count Indicator */}
          <div className="text-xs text-[#86868B]">
            Showing <span className="text-[#1D1D1F] dark:text-[#F5F5F7] font-semibold">{resultCount}</span> of{' '}
            <span>{totalAvailable}</span> repositories
          </div>
        </div>

        {/* Quick Sorting Selector */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-[#86868B] hidden sm:inline">Sort:</span>
          <select
            value={filters.sortBy}
            onChange={(e) => onChange({ sortBy: e.target.value as SortOption })}
            className="px-3 py-1.5 rounded-full bg-black/[0.04] dark:bg-white/[0.08] border border-black/[0.03] dark:border-white/[0.05] text-xs text-[#1D1D1F] dark:text-[#F5F5F7] focus:outline-none focus:ring-1 focus:ring-[#0071E3] cursor-pointer"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-white dark:bg-[#1C1C1E]">
                {opt.label}
              </option>
            ))}
          </select>

          {activeFilterCount > 0 && (
            <button
              onClick={onReset}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-black/[0.04] dark:bg-white/[0.08] text-[#6E6E73] dark:text-[#A1A1A6] hover:text-[#1D1D1F] dark:hover:text-white text-xs transition-colors"
              title="Reset all filters"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Expandable Filter Body */}
      {isOpen && (
        <div className="p-5 border-t border-black/[0.04] dark:border-white/[0.06] bg-[#FBFBFC] dark:bg-[#161618] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-150">
          {/* 1. Language Filter */}
          <div>
            <label className="block text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] mb-1.5">
              Programming Ecosystem
            </label>
            <select
              value={filters.language}
              onChange={(e) => onChange({ language: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#242426] border border-black/[0.08] dark:border-white/[0.1] text-xs text-[#1D1D1F] dark:text-[#F5F5F7] focus:outline-none focus:border-[#0071E3] cursor-pointer"
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
            <div className="flex items-center justify-between text-xs font-medium text-[#1D1D1F] dark:text-[#F5F5F7] mb-1.5">
              <span>Min. Stars</span>
              <span className="text-[#0071E3] dark:text-[#0A84FF] font-semibold">
                {filters.minStars > 0 ? `≥ ${filters.minStars.toLocaleString()}` : 'Any'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {starPresets.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => onChange({ minStars: preset.value })}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors ${
                    filters.minStars === preset.value
                      ? 'bg-[#0071E3] dark:bg-[#0A84FF] text-white shadow-sm'
                      : 'bg-white dark:bg-[#242426] border border-black/[0.06] dark:border-white/[0.08] text-[#6E6E73] dark:text-[#A1A1A6] hover:text-[#1D1D1F] dark:hover:text-white'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Topic Tag */}
          <div>
            <label className="block text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] mb-1.5">
              Topic Filter
            </label>
            <div className="relative">
              <input
                type="text"
                value={filters.topic}
                onChange={(e) => onChange({ topic: e.target.value })}
                placeholder="e.g. ai, cli, rust, agent"
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#242426] border border-black/[0.08] dark:border-white/[0.1] text-xs text-[#1D1D1F] dark:text-[#F5F5F7] placeholder-[#86868B] focus:outline-none focus:border-[#0071E3]"
              />
              {filters.topic && (
                <button
                  onClick={() => onChange({ topic: '' })}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* 4. Minimum Observed Growth */}
          <div>
            <div className="flex items-center justify-between text-xs font-medium text-[#1D1D1F] dark:text-[#F5F5F7] mb-1.5">
              <span>Min. Observed Gain</span>
              <span className="text-[#34C759] dark:text-[#30D158] font-semibold">
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
              className="w-full accent-[#0071E3] dark:accent-[#0A84FF] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#86868B] mt-1 font-mono">
              <span>Any</span>
              <span>+250</span>
              <span>+500 stars</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
