import React, { useState } from 'react';
import {
  Star,
  GitFork,
  AlertCircle,
  ExternalLink,
  Bookmark,
  Share2,
  Copy,
  Check,
  Zap,
} from 'lucide-react';
import { GitHubRepository } from '../../types/github';
import { LanguageBadge } from '../common/LanguageBadge';
import { GrowthBadge } from '../common/GrowthBadge';
import { useToast } from '../../context/ToastContext';

interface RepositoryCardProps {
  repository: GitHubRepository;
  isBookmarked: boolean;
  onToggleBookmark: (repo: GitHubRepository) => void;
  onSelect: (repo: GitHubRepository) => void;
  onFilterTopic?: (topic: string) => void;
}

export const RepositoryCard: React.FC<RepositoryCardProps> = ({
  repository,
  isBookmarked,
  onToggleBookmark,
  onSelect,
  onFilterTopic,
}) => {
  const { success } = useToast();
  const [copiedClone, setCopiedClone] = useState(false);

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
    return new Date(isoString).toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const handleCopyClone = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`git clone ${repository.clone_url}`);
    setCopiedClone(true);
    success('Clone URL copied', `git clone ${repository.clone_url}`);
    setTimeout(() => setCopiedClone(false), 2000);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareData = {
      title: repository.full_name,
      text: repository.description || `Check out ${repository.full_name} on GitHub`,
      url: repository.html_url,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        success('Shared successfully');
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          navigator.clipboard.writeText(repository.html_url);
          success('Link copied to clipboard', repository.html_url);
        }
      }
    } else {
      navigator.clipboard.writeText(repository.html_url);
      success('Link copied to clipboard', repository.html_url);
    }
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleBookmark(repository);
  };

  return (
    <article
      onClick={() => onSelect(repository)}
      className="group relative flex flex-col justify-between p-5 rounded-[22px] bg-white dark:bg-[#1C1C1E] border border-black/[0.04] dark:border-white/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_12px_28px_rgba(0,0,0,0.5)] hover:border-[#0071E3]/25 dark:hover:border-[#0A84FF]/30 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
    >
      <div>
        {/* Top Header: Owner Avatar, Repo Name, Actions */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <img
              src={repository.owner.avatar_url}
              alt={repository.owner.login}
              className="w-9 h-9 rounded-2xl border border-black/[0.06] dark:border-white/[0.08] shrink-0 bg-neutral-100 dark:bg-neutral-800 object-cover"
              loading="lazy"
            />
            <div className="min-w-0 flex-1">
              <span className="text-[11px] text-[#86868B] block truncate leading-none mb-1">
                {repository.owner.login}
              </span>
              <h3 className="text-base font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] group-hover:text-[#0071E3] dark:group-hover:text-[#0A84FF] transition-colors truncate tracking-tight">
                {repository.name}
              </h3>
            </div>
          </div>

          {/* Apple Circular Action Buttons */}
          <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={handleBookmark}
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
              className="w-7 h-7 rounded-full bg-black/[0.04] dark:bg-white/[0.06] flex items-center justify-center text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white transition-all"
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

        {/* Description */}
        <p className="text-xs sm:text-[13px] text-[#6E6E73] dark:text-[#A1A1A6] line-clamp-2 leading-relaxed mb-3.5 min-h-[38px]">
          {repository.description || 'No description provided by repository maintainers.'}
        </p>

        {/* Topics / Tags */}
        {repository.topics && repository.topics.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap mb-4" onClick={(e) => e.stopPropagation()}>
            {repository.topics.slice(0, 3).map((topic) => (
              <button
                key={topic}
                onClick={() => onFilterTopic && onFilterTopic(topic)}
                className="px-2.5 py-0.5 rounded-full bg-black/[0.03] dark:bg-white/[0.06] hover:bg-[#0071E3]/10 dark:hover:bg-[#0A84FF]/20 text-[11px] text-[#6E6E73] dark:text-[#A1A1A6] hover:text-[#0071E3] dark:hover:text-[#0A84FF] transition-colors"
              >
                #{topic}
              </button>
            ))}
            {repository.topics.length > 3 && (
              <span className="text-[10px] text-[#86868B]">
                +{repository.topics.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer Metadata & Stats */}
      <div className="pt-3 border-t border-black/[0.04] dark:border-white/[0.06] flex flex-col gap-2.5">
        <div className="flex items-center justify-between gap-2">
          {/* Language & Growth */}
          <div className="flex items-center gap-2">
            <LanguageBadge language={repository.language} />
            <GrowthBadge growth={repository.observedGrowth} compact />
          </div>

          {/* Viral Score Badge */}
          {repository.viralScore !== undefined && repository.viralScore > 0 && (
            <div
              className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#0071E3]/10 dark:bg-[#0A84FF]/20 text-[10px] font-semibold text-[#0071E3] dark:text-[#0A84FF]"
              title={`Viral Score: ${repository.viralScore}/100. ${repository.viralScoreBreakdown?.reasoning || ''}`}
            >
              <Zap className="w-3 h-3 fill-current" />
              <span>{repository.viralScore}</span>
            </div>
          )}
        </div>

        {/* Stars, Forks, Updated & Clone */}
        <div className="flex items-center justify-between text-xs text-[#86868B] font-mono">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-[#1D1D1F] dark:text-[#F5F5F7] font-semibold" title={`${repository.stargazers_count.toLocaleString()} stars`}>
              <Star className="w-3.5 h-3.5 text-[#FF9500] fill-[#FF9500]" />
              <span>{formatCount(repository.stargazers_count)}</span>
            </span>

            <span className="flex items-center gap-1 text-[#86868B]" title={`${repository.forks_count.toLocaleString()} forks`}>
              <GitFork className="w-3.5 h-3.5" />
              <span>{formatCount(repository.forks_count)}</span>
            </span>

            {repository.open_issues_count > 0 && (
              <span className="hidden sm:flex items-center gap-1 text-[#86868B]" title={`${repository.open_issues_count} open issues`}>
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{repository.open_issues_count}</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <span className="text-[11px] text-[#86868B] truncate font-sans">
              {formatRelativeTime(repository.pushed_at || repository.updated_at)}
            </span>
            <button
              onClick={handleCopyClone}
              className="p-1 rounded-md hover:bg-black/[0.05] dark:hover:bg-white/[0.08] text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white transition-colors"
              title="Copy git clone command"
              aria-label="Copy git clone command"
            >
              {copiedClone ? <Check className="w-3.5 h-3.5 text-[#34C759]" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};
