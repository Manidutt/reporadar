import React from 'react';
import { POPULAR_LANGUAGES, getLanguageColor } from '../../utils/languages';
import { Code2, ArrowRight, Layers } from 'lucide-react';
import { GitHubRepository } from '../../types/github';

interface LanguageExplorerViewProps {
  currentLanguage: string;
  onSelectLanguage: (language: string) => void;
  repositories: GitHubRepository[];
}

export const LanguageExplorerView: React.FC<LanguageExplorerViewProps> = ({
  currentLanguage,
  onSelectLanguage,
  repositories,
}) => {
  const languageStats: Record<string, { count: number; totalStars: number; topRepo?: GitHubRepository }> = {};

  repositories.forEach((repo) => {
    if (repo.language) {
      if (!languageStats[repo.language]) {
        languageStats[repo.language] = { count: 0, totalStars: 0 };
      }
      languageStats[repo.language].count += 1;
      languageStats[repo.language].totalStars += repo.stargazers_count;

      if (
        !languageStats[repo.language].topRepo ||
        repo.stargazers_count > languageStats[repo.language].topRepo!.stargazers_count
      ) {
        languageStats[repo.language].topRepo = repo;
      }
    }
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="p-7 rounded-[26px] bg-white dark:bg-[#1C1C1E] border border-black/[0.04] dark:border-white/[0.06] shadow-sm">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#AF52DE]/10 dark:bg-[#BF5AF2]/20 text-[#AF52DE] dark:text-[#BF5AF2] text-xs font-semibold mb-3">
            <Code2 className="w-3.5 h-3.5" />
            <span>Developer Ecosystems</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
            Explore by Language
          </h2>
          <p className="text-xs sm:text-sm text-[#86868B] mt-1.5 leading-relaxed">
            Discover trending projects categorized by language communities. Metrics reflect actual repositories discovered in the current time window.
          </p>
        </div>
      </div>

      {/* All Languages Reset Card */}
      <div
        onClick={() => onSelectLanguage('all')}
        className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
          currentLanguage.toLowerCase() === 'all'
            ? 'bg-[#0071E3]/10 dark:bg-[#0A84FF]/20 border-[#0071E3]/30 dark:border-[#0A84FF]/40 shadow-sm'
            : 'bg-white dark:bg-[#1C1C1E] border-black/[0.04] dark:border-white/[0.06] hover:shadow-sm hover:border-black/[0.08]'
        }`}
      >
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-black/[0.04] dark:bg-white/[0.08] flex items-center justify-center text-[#1D1D1F] dark:text-[#F5F5F7]">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] flex items-center gap-2">
              All Languages
              {currentLanguage.toLowerCase() === 'all' && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#0071E3] dark:bg-[#0A84FF] text-white">
                  Active
                </span>
              )}
            </h3>
            <p className="text-xs text-[#86868B]">
              Show all trending repositories across every open-source ecosystem
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-[#0071E3] dark:text-[#0A84FF]">
          <span>{repositories.length} repos</span>
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>

      {/* Grid of Languages */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {POPULAR_LANGUAGES.map((lang) => {
          const stats = languageStats[lang.name];
          const count = stats?.count || 0;
          const totalStars = stats?.totalStars || 0;
          const isSelected = currentLanguage.toLowerCase() === lang.name.toLowerCase();

          return (
            <div
              key={lang.name}
              onClick={() => onSelectLanguage(lang.name)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between h-48 group ${
                isSelected
                  ? 'bg-[#0071E3]/10 dark:bg-[#0A84FF]/20 border-[#0071E3]/30 dark:border-[#0A84FF]/40 shadow-sm'
                  : 'bg-white dark:bg-[#1C1C1E] border-black/[0.04] dark:border-white/[0.06] hover:shadow-md hover:border-[#0071E3]/25'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3.5 h-3.5 rounded-full shadow-xs"
                      style={{ backgroundColor: lang.color }}
                    />
                    <h3 className="text-base font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] group-hover:text-[#0071E3] dark:group-hover:text-[#0A84FF] transition-colors">
                      {lang.name}
                    </h3>
                  </div>

                  {isSelected && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#0071E3] dark:bg-[#0A84FF] text-white">
                      Selected
                    </span>
                  )}
                </div>

                <div className="space-y-1 text-xs text-[#86868B]">
                  <div className="flex justify-between">
                    <span>Discovered:</span>
                    <span className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">{count} repos</span>
                  </div>
                  {count > 0 && (
                    <div className="flex justify-between">
                      <span>Stars:</span>
                      <span className="text-[#FF9500] font-semibold">
                        {totalStars >= 1000
                          ? `${(totalStars / 1000).toFixed(1)}k`
                          : totalStars.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                {stats?.topRepo && (
                  <div className="mt-3 p-2 rounded-xl bg-black/[0.03] dark:bg-white/[0.06] text-[11px] text-[#86868B] truncate">
                    <span>Top: </span>
                    <span className="text-[#1D1D1F] dark:text-[#F5F5F7] font-medium">{stats.topRepo.name}</span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between text-xs text-[#86868B] font-medium">
                <span>Filter by {lang.name}</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#86868B] group-hover:text-[#0071E3] dark:group-hover:text-[#0A84FF] group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
