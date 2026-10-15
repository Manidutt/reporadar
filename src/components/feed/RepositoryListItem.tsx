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
      className="group flex items-center justify-between gap-3 p-3 sm:px-4 rounded-xl bg-[#12141A] border border-[#232733] hover:border-[#383E52] hover:bg-[#151821] transition-all cursor-pointer"
    >
      {/* Left: Rank, Avatar, Title & Description */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <span className="w-6 text-center text-xs font-mono text-neutral-500 font-semibold shrink-0">
          #{index + 1}
        </span>

        <img
          src={repository.owner.avatar_url}
          alt={repository.owner.login}
          className="w-7 h-7 rounded-full border border-neutral-700/80 shrink-0 bg-neutral-800"
          loading="lazy"
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white group-hover:text-indigo-400 transition-colors truncate">
              {repository.full_name}
            </span>
            {repository.viralScore !== undefined && repository.viralScore > 0 && (
              <span
                className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                title={`Viral Score: ${repository.viralScore}`}
              >
                <Zap className="w-2.5 h-2.5" />
                {repository.viralScore}
              </span>
            )}
          </div>
          <p className="text-xs text-neutral-400 truncate max-w-xl hidden sm:block">
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

        <div className="flex items-center gap-3 font-mono text-xs text-neutral-300">
          <span className="flex items-center gap-1 w-16 justify-end" title={`${repository.stargazers_count.toLocaleString()} stars`}>
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
            <span>{formatCount(repository.stargazers_count)}</span>
          </span>

          <span className="hidden sm:flex items-center gap-1 w-14 justify-end text-neutral-400" title={`${repository.forks_count.toLocaleString()} forks`}>
            <GitFork className="w-3 h-3 text-neutral-500" />
            <span>{formatCount(repository.forks_count)}</span>
          </span>
        </div>

        <span className="text-[11px] font-mono text-neutral-500 w-16 text-right hidden xl:block">
          {formatRelativeTime(repository.pushed_at || repository.updated_at)}
        </span>

        {/* Action icons */}
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onToggleBookmark(repository)}
            className={`p-1.5 rounded-lg transition-colors ${
              isBookmarked
                ? 'text-amber-400 bg-amber-400/10'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
            title={isBookmarked ? 'Remove bookmark' : 'Bookmark repository'}
            aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark repository'}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-400' : ''}`} />
          </button>

          <button
            onClick={handleShare}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors hidden sm:block"
            title="Share repository"
            aria-label="Share repository"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>

          <a
            href={repository.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
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
