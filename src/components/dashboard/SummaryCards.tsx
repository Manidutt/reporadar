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
  // 1. Repositories discovered
  const totalCount = repositories.length;

  // 2. Total stars
  const totalStars = repositories.reduce((acc, r) => acc + (r.stargazers_count || 0), 0);

  // 3. Fastest-growing repository
  // First check if any repo has verified measured growth
  const measuredRepos = repositories.filter(
    (r) => r.observedGrowth?.measured && (r.observedGrowth.starsGained || 0) > 0
  );

  let fastestRepo: GitHubRepository | null = null;
  let fastestGrowthLabel = '';
  let fastestSubtext = '';

  if (measuredRepos.length > 0) {
    // Sort by velocity per hour or stars gained
    fastestRepo = [...measuredRepos].sort(
      (a, b) =>
        (b.observedGrowth?.velocityPerHour || 0) - (a.observedGrowth?.velocityPerHour || 0)
    )[0];
    const gained = fastestRepo.observedGrowth?.starsGained || 0;
    const hours = fastestRepo.observedGrowth?.hoursElapsed || 24;
    fastestGrowthLabel = `+${gained} stars`;
    fastestSubtext = `Measured over ${hours}h snapshot window`;
  } else if (repositories.length > 0) {
    // If no verified deltas exist yet, find the highest creation velocity / viral score
    fastestRepo = [...repositories].sort(
      (a, b) => (b.viralScore || 0) - (a.viralScore || 0)
    )[0];
    fastestGrowthLabel = `Score ${fastestRepo.viralScore || 0}/100`;
    fastestSubtext = 'High creation momentum (snapshot baseline tracking)';
  }

  // 4. Most represented language
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
  const topLanguagePercent = totalCount > 0 && topLanguageCount > 0
    ? Math.round((topLanguageCount / totalCount) * 100)
    : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Repositories Discovered */}
      <div className="p-4 rounded-2xl bg-[#12141A] border border-[#232733] hover:border-[#323749] transition-all">
        <div className="flex items-center justify-between text-neutral-400 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider font-mono">Discovered</span>
          <Layers className="w-4 h-4 text-indigo-400" />
        </div>
        <div className="text-2xl font-bold font-mono text-white tracking-tight">
          {totalCount.toLocaleString()}
        </div>
        <div className="text-xs text-neutral-400 mt-1 flex items-center gap-1.5">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Active matching repositories</span>
        </div>
      </div>

      {/* 2. Total Stars */}
      <div className="p-4 rounded-2xl bg-[#12141A] border border-[#232733] hover:border-[#323749] transition-all">
        <div className="flex items-center justify-between text-neutral-400 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider font-mono">Total Stars</span>
          <Star className="w-4 h-4 text-amber-400" />
        </div>
        <div className="text-2xl font-bold font-mono text-white tracking-tight">
          {totalStars >= 1000000
            ? `${(totalStars / 1000000).toFixed(1)}M`
            : totalStars >= 1000
            ? `${(totalStars / 1000).toFixed(1)}k`
            : totalStars.toLocaleString()}
        </div>
        <div className="text-xs text-neutral-400 mt-1">
          Sum across current discovery set
        </div>
      </div>

      {/* 3. Fastest-Growing Repository */}
      <div
        onClick={() => fastestRepo && onSelectRepo(fastestRepo)}
        className={`p-4 rounded-2xl bg-[#12141A] border border-[#232733] transition-all ${
          fastestRepo ? 'cursor-pointer hover:border-emerald-500/40 hover:bg-[#151922] group' : ''
        }`}
      >
        <div className="flex items-center justify-between text-neutral-400 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider font-mono">Fastest Pace</span>
          <div className="flex items-center gap-1">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            {fastestRepo && (
              <ArrowUpRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-emerald-400 transition-colors" />
            )}
          </div>
        </div>
        {fastestRepo ? (
          <div>
            <div className="text-sm font-semibold text-white truncate group-hover:text-emerald-300 transition-colors font-mono">
              {fastestRepo.name}
            </div>
            <div className="text-xs font-mono font-medium text-emerald-400 mt-0.5">
              {fastestGrowthLabel}
            </div>
            <div className="text-[11px] text-neutral-500 truncate mt-1">
              {fastestSubtext}
            </div>
          </div>
        ) : (
          <div className="text-xs text-neutral-500 mt-2">Unavailable in current filter</div>
        )}
      </div>

      {/* 4. Top Programming Language */}
      <div
        onClick={() => topLanguageName && onFilterLanguage(topLanguageName)}
        className={`p-4 rounded-2xl bg-[#12141A] border border-[#232733] transition-all ${
          topLanguageName ? 'cursor-pointer hover:border-indigo-500/40 hover:bg-[#151922] group' : ''
        }`}
      >
        <div className="flex items-center justify-between text-neutral-400 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider font-mono">Top Language</span>
          <Code2 className="w-4 h-4 text-indigo-400" />
        </div>
        {topLanguageName ? (
          <div>
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: getLanguageColor(topLanguageName) }}
              />
              <span className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                {topLanguageName}
              </span>
            </div>
            <div className="text-xs font-mono text-neutral-400 mt-1">
              {topLanguageCount} repos ({topLanguagePercent}% of set)
            </div>
          </div>
        ) : (
          <div className="text-xs text-neutral-500 mt-2">No language data</div>
        )}
      </div>
    </div>
  );
};
