import React from 'react';
import {
  Star,
  GitFork,
  ExternalLink,
  Bookmark,
  Share2,
  Zap,
} from 'lucide-react';
import { GitHubRepository } from '../../types/github';
import { LanguageBadge } from '../common/LanguageBadge';
import { GrowthBadge } from '../common/GrowthBadge';
import { useToast } from '../../context/ToastContext';

interface RepositoryListItemProps {
  repository: GitHubRepository;
  index: number;
  isBookmarked: boolean;
  onToggleBookmark: (repo: GitHubRepository) => void;
  onSelect: (repo: GitHubRepository) => void;
}

export const RepositoryListItem: React.FC<RepositoryListItemProps> = ({
  repository,
  index,
  isBookmarked,
  onToggleBookmark,
  onSelect,
}) => {
  const { success } = useToast();

  const formatCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
    return count.toLocaleString();
  };

  const formatRelativeTime = (isoString: string) => {
    const diff = Date.now() - new Date(isoString).getTime();
    const hours = Math.floor(diff / (1000 * 3600));
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return `${Math.floor(days / 30)}mo ago`;
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(repository.html_url);
    success('Link copied to clipboard', repository.html_url);
  };

  return (
    <div
      onClick={() => onSelect(repository)}
      className="group flex items-center justify-between gap-3 p-3.5 sm:px-4 rounded-2xl bg-white dark:bg-[#1C1C1E] border border-black/[0.04] dark:border-white/[0.06] shadow-xs hover:shadow-sm hover:border-[#0071E3]/20 dark:hover:border-[#0A84FF]/25 hover:bg-neutral-50 dark:hover:bg-[#222224] transition-all cursor-pointer"
    >
      {/* Left: Rank, Avatar, Title & Description */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <span className="w-6 text-center text-xs font-mono text-[#86868B] font-medium shrink-0">
          {index + 1}
        </span>

        <img
          src={repository.owner.avatar_url}
          alt={repository.owner.login}
          className="w-8 h-8 rounded-xl border border-black/[0.05] dark:border-white/[0.08] shrink-0 bg-neutral-100 dark:bg-neutral-800 object-cover"
          loading="lazy"
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] group-hover:text-[#0071E3] dark:group-hover:text-[#0A84FF] transition-colors truncate tracking-tight">
              {repository.full_name}
            </span>
            {repository.viralScore !== undefined && repository.viralScore > 0 && (
              <span
                className="hidden md:inline-flex items-center gap-0.5 px-2 py-0.2 rounded-full text-[10px] font-semibold bg-[#0071E3]/10 dark:bg-[#0A84FF]/20 text-[#0071E3] dark:text-[#0A84FF]"
                title={`Viral Score: ${repository.viralScore}`}
              >
                <Zap className="w-2.5 h-2.5 fill-current" />
                {repository.viralScore}
              </span>
            )}
          </div>
          <p className="text-xs text-[#86868B] truncate max-w-xl hidden sm:block">
            {repository.description || 'No description provided.'}
          </p>
        </div>
      </div>

      {/* Right: Language, Stats, Growth, Actions */}
      <div className="flex items-center gap-4 sm:gap-6 shrink-0">
        <div className="hidden md:block w-24">
          <LanguageBadge language={repository.language} />
        </div>

        <div className="hidden lg:block">
          <GrowthBadge growth={repository.observedGrowth} compact />
        </div>

        <div className="flex items-center gap-3 font-mono text-xs text-[#1D1D1F] dark:text-[#F5F5F7]">
          <span className="flex items-center gap-1 w-16 justify-end font-semibold" title={`${repository.stargazers_count.toLocaleString()} stars`}>
            <Star className="w-3.5 h-3.5 text-[#FF9500] fill-[#FF9500]" />
            <span>{formatCount(repository.stargazers_count)}</span>
          </span>

          <span className="hidden sm:flex items-center gap-1 w-14 justify-end text-[#86868B]" title={`${repository.forks_count.toLocaleString()} forks`}>
            <GitFork className="w-3 h-3" />
            <span>{formatCount(repository.forks_count)}</span>
          </span>
        </div>

        <span className="text-[11px] text-[#86868B] w-16 text-right hidden xl:block font-sans">
          {formatRelativeTime(repository.pushed_at || repository.updated_at)}
        </span>

        {/* Action icons */}
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onToggleBookmark(repository)}
            className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
              isBookmarked
                ? 'bg-[#FF9500]/15 text-[#FF9500]'
                : 'bg-black/[0.04] dark:bg-white/[0.06] text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white'
            }`}
            title={isBookmarked ? 'Remove bookmark' : 'Bookmark repository'}
            aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark repository'}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-[#FF9500]' : ''}`} />
          </button>

          <button
            onClick={handleShare}
            className="w-7 h-7 rounded-full bg-black/[0.04] dark:bg-white/[0.06] flex items-center justify-center text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white transition-all hidden sm:flex"
            title="Share repository"
            aria-label="Share repository"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>

          <a
            href={repository.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-7 h-7 rounded-full bg-black/[0.04] dark:bg-white/[0.06] flex items-center justify-center text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white transition-all"
            title="Open on GitHub"
            aria-label="Open on GitHub"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
