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

  // Format stars / forks count (e.g. 14.2k)
  const formatCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
    return count.toLocaleString();
  };

  // Format relative updated date
  const formatRelativeTime = (isoString: string) => {
    const diff = Date.now() - new Date(isoString).getTime();
    const hours = Math.floor(diff / (1000 * 3600));
    if (hours < 1) return 'Updated just now';
    if (hours < 24) return `Updated ${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `Updated ${days}d ago`;
    return `Updated ${new Date(isoString).toLocaleDateString([], { month: 'short', day: 'numeric' })}`;
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
      className="group relative flex flex-col justify-between p-5 rounded-2xl bg-[#12141A] border border-[#232733] hover:border-[#383E52] hover:bg-[#151821] hover:shadow-xl hover:shadow-black/40 transition-all duration-200 cursor-pointer"
    >
      <div>
        {/* Top Header: Owner Avatar, Repo Name, Actions */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <img
              src={repository.owner.avatar_url}
              alt={repository.owner.login}
              className="w-8 h-8 rounded-full border border-neutral-700/80 shrink-0 bg-neutral-800"
              loading="lazy"
            />
            <div className="min-w-0 flex-1">
              <span className="text-[11px] font-mono text-neutral-400 block truncate leading-none mb-1">
                {repository.owner.login}
              </span>
              <h3 className="text-sm sm:text-base font-semibold text-white group-hover:text-indigo-400 transition-colors truncate font-sans tracking-tight">
                {repository.name}
              </h3>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={handleBookmark}
              className={`p-1.5 rounded-lg transition-colors ${
                isBookmarked
                  ? 'text-amber-400 bg-amber-400/10 hover:bg-amber-400/20'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
              title={isBookmarked ? 'Remove bookmark' : 'Bookmark repository'}
              aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark repository'}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-400' : ''}`} />
            </button>

            <button
              onClick={handleShare}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              title="Share repository"
              aria-label="Share repository"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <a
              href={repository.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              title="Open on GitHub"
              aria-label="Open on GitHub"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs sm:text-[13px] text-neutral-400 line-clamp-2 leading-relaxed mb-3.5 min-h-[36px]">
          {repository.description || 'No description provided by repository maintainers.'}
        </p>

        {/* Topics / Tags */}
        {repository.topics && repository.topics.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap mb-4" onClick={(e) => e.stopPropagation()}>
            {repository.topics.slice(0, 3).map((topic) => (
              <button
                key={topic}
                onClick={() => onFilterTopic && onFilterTopic(topic)}
                className="px-2 py-0.5 rounded-md bg-[#1A1D27] hover:bg-indigo-600/20 border border-[#272B38] hover:border-indigo-500/40 text-[11px] font-mono text-neutral-300 hover:text-indigo-300 transition-colors"
              >
                #{topic}
              </button>
            ))}
            {repository.topics.length > 3 && (
              <span className="text-[10px] font-mono text-neutral-500">
                +{repository.topics.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer Metadata & Stats */}
      <div className="pt-3 border-t border-[#232733]/80 flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          {/* Language & Growth */}
          <div className="flex items-center gap-2">
            <LanguageBadge language={repository.language} />
            <GrowthBadge growth={repository.observedGrowth} compact />
          </div>

          {/* Viral Score Badge if available */}
          {repository.viralScore !== undefined && repository.viralScore > 0 && (
            <div
              className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/25 text-[10px] font-mono text-indigo-300"
              title={`Viral Score: ${repository.viralScore}/100. ${repository.viralScoreBreakdown?.reasoning || ''}`}
            >
              <Zap className="w-3 h-3 text-indigo-400" />
              <span>{repository.viralScore}</span>
            </div>
          )}
        </div>

        {/* Stars, Forks, Updated & Clone */}
        <div className="flex items-center justify-between text-xs text-neutral-400 font-mono">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-neutral-200" title={`${repository.stargazers_count.toLocaleString()} stars`}>
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
              <span>{formatCount(repository.stargazers_count)}</span>
            </span>

            <span className="flex items-center gap-1" title={`${repository.forks_count.toLocaleString()} forks`}>
              <GitFork className="w-3.5 h-3.5 text-neutral-500" />
              <span>{formatCount(repository.forks_count)}</span>
            </span>

            {repository.open_issues_count > 0 && (
              <span className="hidden sm:flex items-center gap-1 text-neutral-500" title={`${repository.open_issues_count} open issues`}>
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{repository.open_issues_count}</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <span className="text-[11px] text-neutral-500 truncate">
              {formatRelativeTime(repository.pushed_at || repository.updated_at)}
            </span>
            <button
              onClick={handleCopyClone}
              className="p-1 rounded hover:bg-neutral-800 text-neutral-500 hover:text-white transition-colors"
              title="Copy git clone command"
              aria-label="Copy git clone command"
            >
              {copiedClone ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};
