import React from 'react';
import { POPULAR_LANGUAGES, getLanguageColor } from '../../utils/languages';
import { Code2, ArrowRight, Layers, Sparkles } from 'lucide-react';
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
  // Compute counts from current loaded dataset
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
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#171924] via-[#151722] to-[#12141A] border border-[#2A2E3D]">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 text-xs font-mono font-medium mb-3">
            <Code2 className="w-3.5 h-3.5" />
            <span>Ecosystem Hub</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Explore by Technology
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1 leading-relaxed">
            Browse trending repositories segmented by language communities. Metrics reflect actual repositories discovered in the current time window.
          </p>
        </div>
      </div>

      {/* All Languages Reset Card */}
      <div
        onClick={() => onSelectLanguage('all')}
        className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
          currentLanguage.toLowerCase() === 'all'
            ? 'bg-indigo-600/15 border-indigo-500/50 shadow-md'
            : 'bg-[#12141A] border-[#232733] hover:border-[#383E52] hover:bg-[#151821]'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              All Languages
              {currentLanguage.toLowerCase() === 'all' && (
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-indigo-500 text-white">
                  Active Filter
                </span>
              )}
            </h3>
            <p className="text-xs text-neutral-400">
              Show all trending repositories across every programming ecosystem
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono font-medium text-neutral-300">
          <span>{repositories.length} repos</span>
          <ArrowRight className="w-4 h-4 text-indigo-400" />
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
                  ? 'bg-indigo-600/15 border-indigo-500/60 shadow-lg shadow-indigo-500/10'
                  : 'bg-[#12141A] border-[#232733] hover:border-[#383E52] hover:bg-[#151821]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3.5 h-3.5 rounded-full shadow-sm"
                      style={{ backgroundColor: lang.color }}
                    />
                    <h3 className="text-base font-bold text-white group-hover:text-indigo-400 transition-colors">
                      {lang.name}
                    </h3>
                  </div>

                  {isSelected && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500 text-white">
                      Selected
                    </span>
                  )}
                </div>

                <div className="space-y-1 text-xs text-neutral-400 font-mono">
                  <div className="flex justify-between">
                    <span>Active in result set:</span>
                    <span className="font-semibold text-white">{count} repos</span>
                  </div>
                  {count > 0 && (
                    <div className="flex justify-between">
                      <span>Stars represented:</span>
                      <span className="text-amber-400">
                        {totalStars >= 1000
                          ? `${(totalStars / 1000).toFixed(1)}k`
                          : totalStars.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                {stats?.topRepo && (
                  <div className="mt-2.5 p-2 rounded-lg bg-[#181B25] border border-[#252836] text-[11px] text-neutral-400 truncate">
                    <span className="text-neutral-500 font-mono">Top: </span>
                    <span className="text-neutral-200 font-medium">{stats.topRepo.name}</span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-[#232733]/60 flex items-center justify-between text-xs text-neutral-400 font-medium">
                <span className="text-[11px] font-mono">Filter by {lang.name}</span>
                <ArrowRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
