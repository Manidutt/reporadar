import React from 'react';
import { Layers, Star, TrendingUp, Code2, ArrowUpRight } from 'lucide-react';
import { GitHubRepository } from '../../types/github';
import { getLanguageColor } from '../../utils/languages';

interface SummaryCardsProps {
  repositories: GitHubRepository[];
  onSelectRepo: (repo: GitHubRepository) => void;
  onFilterLanguage: (language: string) => void;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  repositories,
  onSelectRepo,
  onFilterLanguage,
}) => {
  const totalCount = repositories.length;
  const totalStars = repositories.reduce((acc, r) => acc + (r.stargazers_count || 0), 0);

  // Fastest-growing repository
  const measuredRepos = repositories.filter(
    (r) => r.observedGrowth?.measured && (r.observedGrowth.starsGained || 0) > 0
  );

  let fastestRepo: GitHubRepository | null = null;
  let fastestGrowthLabel = '';
  let fastestSubtext = '';

  if (measuredRepos.length > 0) {
    fastestRepo = [...measuredRepos].sort(
      (a, b) =>
        (b.observedGrowth?.velocityPerHour || 0) - (a.observedGrowth?.velocityPerHour || 0)
    )[0];
    const gained = fastestRepo.observedGrowth?.starsGained || 0;
    const hours = fastestRepo.observedGrowth?.hoursElapsed || 24;
    fastestGrowthLabel = `+${gained.toLocaleString()} stars`;
    fastestSubtext = `Observed over ${hours}h`;
  } else if (repositories.length > 0) {
    fastestRepo = [...repositories].sort(
      (a, b) => (b.viralScore || 0) - (a.viralScore || 0)
    )[0];
    fastestGrowthLabel = `${fastestRepo.viralScore || 0}/100`;
    fastestSubtext = 'Breakout creation momentum';
  }

  // Top Language
  const languageCounts: Record<string, number> = {};
  repositories.forEach((r) => {
    if (r.language) {
      languageCounts[r.language] = (languageCounts[r.language] || 0) + 1;
    }
  });

  const sortedLanguages = Object.entries(languageCounts).sort((a, b) => b[1] - a[1]);
  const topLanguage = sortedLanguages.length > 0 ? sortedLanguages[0] : null;
  const topLanguageName = topLanguage ? topLanguage[0] : null;
  const topLanguageCount = topLanguage ? topLanguage[1] : 0;
  const topLanguagePercent =
    totalCount > 0 && topLanguageCount > 0
      ? Math.round((topLanguageCount / totalCount) * 100)
      : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Repositories Discovered */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#1C1C1E] border border-black/[0.04] dark:border-white/[0.06] shadow-sm hover:shadow transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-[#86868B] uppercase tracking-wider">
            Discovered
          </span>
          <div className="w-8 h-8 rounded-full bg-[#0071E3]/10 text-[#0071E3] dark:bg-[#0A84FF]/20 dark:text-[#0A84FF] flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
          {totalCount.toLocaleString()}
        </div>
        <div className="text-xs text-[#86868B] mt-1.5 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#34C759]" />
          <span>Active projects in scope</span>
        </div>
      </div>

      {/* 2. Total Stars */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#1C1C1E] border border-black/[0.04] dark:border-white/[0.06] shadow-sm hover:shadow transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-[#86868B] uppercase tracking-wider">
            Total Stars
          </span>
          <div className="w-8 h-8 rounded-full bg-[#FF9500]/10 text-[#FF9500] dark:bg-[#FF9F0A]/20 dark:text-[#FF9F0A] flex items-center justify-center">
            <Star className="w-4 h-4 fill-[#FF9500]/20" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
          {totalStars >= 1000000
            ? `${(totalStars / 1000000).toFixed(1)}M`
            : totalStars >= 1000
            ? `${(totalStars / 1000).toFixed(1)}k`
            : totalStars.toLocaleString()}
        </div>
        <div className="text-xs text-[#86868B] mt-1.5">
          Cumulative star volume
        </div>
      </div>

      {/* 3. Fastest-Growing Repository */}
      <div
        onClick={() => fastestRepo && onSelectRepo(fastestRepo)}
        className={`p-5 rounded-2xl bg-white dark:bg-[#1C1C1E] border border-black/[0.04] dark:border-white/[0.06] shadow-sm transition-all ${
          fastestRepo
            ? 'cursor-pointer hover:shadow hover:border-[#34C759]/40 group'
            : ''
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-[#86868B] uppercase tracking-wider">
            Fastest Pace
          </span>
          <div className="w-8 h-8 rounded-full bg-[#34C759]/10 text-[#34C759] dark:bg-[#30D158]/20 dark:text-[#30D158] flex items-center justify-center group-hover:scale-105 transition-transform">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        {fastestRepo ? (
          <div>
            <div className="text-sm font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] truncate group-hover:text-[#0071E3] dark:group-hover:text-[#0A84FF] transition-colors">
              {fastestRepo.name}
            </div>
            <div className="text-xs font-semibold text-[#34C759] dark:text-[#30D158] mt-0.5">
              {fastestGrowthLabel}
            </div>
            <div className="text-[11px] text-[#86868B] truncate mt-1">
              {fastestSubtext}
            </div>
          </div>
        ) : (
          <div className="text-xs text-[#86868B] mt-2">Unavailable in current filter</div>
        )}
      </div>

      {/* 4. Top Programming Language */}
      <div
        onClick={() => topLanguageName && onFilterLanguage(topLanguageName)}
        className={`p-5 rounded-2xl bg-white dark:bg-[#1C1C1E] border border-black/[0.04] dark:border-white/[0.06] shadow-sm transition-all ${
          topLanguageName
            ? 'cursor-pointer hover:shadow hover:border-[#AF52DE]/40 group'
            : ''
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-[#86868B] uppercase tracking-wider">
            Top Language
          </span>
          <div className="w-8 h-8 rounded-full bg-[#AF52DE]/10 text-[#AF52DE] dark:bg-[#BF5AF2]/20 dark:text-[#BF5AF2] flex items-center justify-center group-hover:scale-105 transition-transform">
            <Code2 className="w-4 h-4" />
          </div>
        </div>
        {topLanguageName ? (
          <div>
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: getLanguageColor(topLanguageName) }}
              />
              <span className="text-lg font-bold text-[#1D1D1F] dark:text-[#F5F5F7] group-hover:text-[#0071E3] dark:group-hover:text-[#0A84FF] transition-colors">
                {topLanguageName}
              </span>
            </div>
            <div className="text-xs text-[#86868B] mt-1">
              {topLanguageCount} projects ({topLanguagePercent}% share)
            </div>
          </div>
        ) : (
          <div className="text-xs text-[#86868B] mt-2">No language data</div>
        )}
      </div>
    </div>
  );
};
