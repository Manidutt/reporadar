import React, { useEffect, useState } from 'react';
import {
  X,
  ExternalLink,
  Star,
  GitFork,
  AlertCircle,
  Eye,
  Calendar,
  Scale,
  GitBranch,
  Copy,
  Check,
  Bookmark,
  Share2,
  TrendingUp,
  FileText,
  Clock,
  Sparkles,
  Info,
} from 'lucide-react';
import { GitHubRepository, ReadmeData } from '../../types/github';
import { fetchRepositoryReadme } from '../../services/githubApi';
import { LanguageBadge } from '../common/LanguageBadge';
import { GrowthBadge } from '../common/GrowthBadge';
import { useToast } from '../../context/ToastContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface RepositoryDetailDrawerProps {
  repository: GitHubRepository | null;
  isOpen: boolean;
  onClose: () => void;
  isBookmarked: boolean;
  onToggleBookmark: (repo: GitHubRepository) => void;
}

export const RepositoryDetailDrawer: React.FC<RepositoryDetailDrawerProps> = ({
  repository,
  isOpen,
  onClose,
  isBookmarked,
  onToggleBookmark,
}) => {
  const { success } = useToast();
  const [activeTab, setActiveTab] = useState<'readme' | 'growth' | 'meta'>('readme');
  const [readme, setReadme] = useState<string | null>(null);
  const [isLoadingReadme, setIsLoadingReadme] = useState(false);
  const [copiedClone, setCopiedClone] = useState(false);

  useEffect(() => {
    if (!repository || !isOpen) {
      setReadme(null);
      return;
    }

    let isMounted = true;
    setIsLoadingReadme(true);

    fetchRepositoryReadme(repository.owner.login, repository.name)
      .then((data: ReadmeData | null) => {
        if (isMounted) {
          setReadme(data ? data.content : null);
          setIsLoadingReadme(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setIsLoadingReadme(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [repository, isOpen]);

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !repository) return null;

  const handleCopyClone = () => {
    navigator.clipboard.writeText(`git clone ${repository.clone_url}`);
    setCopiedClone(true);
    success('Clone URL copied to clipboard');
    setTimeout(() => setCopiedClone(false), 2000);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(repository.html_url);
    success('Repository link copied');
  };

  const historyPoints = repository.observedGrowth?.historyPoints || [];
  const chartData = historyPoints.map((pt: { timestamp: number; stars: number }) => ({
    time: new Date(pt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    date: new Date(pt.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' }),
    stars: pt.stars,
  }));

  const hasChartData = chartData.length >= 2;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Container */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <aside
          className="w-screen max-w-2xl bg-[#0F1117] border-l border-[#222634] shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200"
          role="dialog"
          aria-modal="true"
          aria-labelledby="repo-drawer-title"
        >
          {/* Top Header */}
          <div className="p-6 border-b border-[#222634] sticky top-0 bg-[#0F1117]/95 backdrop-blur-md z-10">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <img
                  src={repository.owner.avatar_url}
                  alt={repository.owner.login}
                  className="w-10 h-10 rounded-full border border-neutral-700 shrink-0 bg-neutral-800"
                />
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-mono text-neutral-400 block truncate">
                    {repository.owner.login}
                  </span>
                  <h2
                    id="repo-drawer-title"
                    className="text-lg sm:text-xl font-bold text-white tracking-tight truncate font-sans"
                  >
                    {repository.name}
                  </h2>
                </div>
              </div>

              {/* Quick actions & close */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => onToggleBookmark(repository)}
                  className={`p-2 rounded-xl transition-colors ${
                    isBookmarked
                      ? 'text-amber-400 bg-amber-400/10'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                  }`}
                  title={isBookmarked ? 'Remove bookmark' : 'Bookmark repository'}
                  aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark repository'}
                >
                  <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-400' : ''}`} />
                </button>

                <button
                  onClick={handleShare}
                  className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                  title="Share repository"
                >
                  <Share2 className="w-4 h-4" />
                </button>

                <a
                  href={repository.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                  title="Open on GitHub"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>

                <button
                  onClick={onClose}
                  className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 ml-1 transition-colors"
                  aria-label="Close drawer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-neutral-300 mt-3 leading-relaxed">
              {repository.description || 'No description provided by author.'}
            </p>

            {/* Topics */}
            {repository.topics && repository.topics.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap mt-3">
                {repository.topics.map((t) => (
                  <span
                    key={t}
                    className="px-2 py-0.5 rounded-md bg-[#181B24] border border-[#262936] text-[11px] font-mono text-neutral-300"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}

            {/* Clone Command Bar */}
            <div className="mt-4 flex items-center justify-between p-2.5 rounded-xl bg-[#141720] border border-[#232733]">
              <div className="flex items-center gap-2 text-xs font-mono text-neutral-300 truncate">
                <span className="text-neutral-500 select-none">$</span>
                <span className="truncate">git clone {repository.clone_url}</span>
              </div>
              <button
                onClick={handleCopyClone}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#1E2230] hover:bg-[#282E40] text-neutral-200 text-xs font-mono transition-colors shrink-0"
              >
                {copiedClone ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 mt-4 border-b border-[#222634] -mb-6 pb-2 text-xs font-medium">
              <button
                onClick={() => setActiveTab('readme')}
                className={`flex items-center gap-1.5 pb-2 border-b-2 transition-all ${
                  activeTab === 'readme'
                    ? 'border-indigo-500 text-white font-semibold'
                    : 'border-transparent text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>README</span>
              </button>
              <button
                onClick={() => setActiveTab('growth')}
                className={`flex items-center gap-1.5 pb-2 border-b-2 transition-all ${
                  activeTab === 'growth'
                    ? 'border-indigo-500 text-white font-semibold'
                    : 'border-transparent text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Growth Analytics</span>
              </button>
              <button
                onClick={() => setActiveTab('meta')}
                className={`flex items-center gap-1.5 pb-2 border-b-2 transition-all ${
                  activeTab === 'meta'
                    ? 'border-indigo-500 text-white font-semibold'
                    : 'border-transparent text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Info className="w-3.5 h-3.5" />
                <span>Metadata</span>
              </button>
            </div>
          </div>

          {/* Drawer Body */}
          <div className="p-6 flex-1">
            {/* TAB 1: README Preview */}
            {activeTab === 'readme' && (
              <div>
                {isLoadingReadme ? (
                  <div className="space-y-4 animate-pulse">
                    <div className="h-6 bg-neutral-800 rounded w-1/3" />
                    <div className="h-4 bg-neutral-800/70 rounded w-full" />
                    <div className="h-4 bg-neutral-800/70 rounded w-5/6" />
                    <div className="h-24 bg-neutral-800/50 rounded" />
                  </div>
                ) : readme ? (
                  <div className="prose prose-invert max-w-none text-xs sm:text-sm leading-relaxed text-neutral-300">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        a: ({ ...props }) => (
                          <a
                            {...props}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-400 hover:underline"
                          />
                        ),
                        h1: ({ ...props }) => (
                          <h1 {...props} className="text-xl font-bold text-white mt-4 mb-2 pb-1 border-b border-[#232733]" />
                        ),
                        h2: ({ ...props }) => (
                          <h2 {...props} className="text-lg font-bold text-white mt-4 mb-2 pb-1 border-b border-[#232733]" />
                        ),
                        h3: ({ ...props }) => (
                          <h3 {...props} className="text-base font-semibold text-white mt-3 mb-1" />
                        ),
                        p: ({ ...props }) => <p {...props} className="mb-3 text-neutral-300" />,
                        ul: ({ ...props }) => <ul {...props} className="list-disc pl-5 mb-3 space-y-1" />,
                        ol: ({ ...props }) => <ol {...props} className="list-decimal pl-5 mb-3 space-y-1" />,
                        li: ({ ...props }) => <li {...props} className="text-neutral-300" />,
                        pre: ({ ...props }) => (
                          <pre
                            {...props}
                            className="p-3 rounded-xl bg-[#141720] border border-[#232733] overflow-x-auto my-3 font-mono text-xs text-neutral-200"
                          />
                        ),
                        code: ({ className, children, ...props }) => {
                          const isInline = !className;
                          return isInline ? (
                            <code
                              {...props}
                              className="px-1.5 py-0.5 rounded bg-[#181B24] text-neutral-200 font-mono text-[11px]"
                            >
                              {children}
                            </code>
                          ) : (
                            <code {...props} className={className}>
                              {children}
                            </code>
                          );
                        },
                        blockquote: ({ ...props }) => (
                          <blockquote
                            {...props}
                            className="border-l-4 border-indigo-500 pl-3 italic text-neutral-400 my-2"
                          />
                        ),
                      }}
                    >
                      {readme}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="p-8 text-center rounded-xl bg-[#141720] border border-[#232733] text-xs text-neutral-400">
                    README could not be loaded or is not provided by repository.
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: Growth Analytics */}
            {activeTab === 'growth' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-white">Observed Star Growth</h3>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Empirical snapshot observations recorded in RepoRadar local store.
                    </p>
                  </div>
                  <GrowthBadge growth={repository.observedGrowth} />
                </div>

                {hasChartData ? (
                  <div className="p-4 rounded-xl bg-[#141720] border border-[#232733]">
                    <div className="h-60 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                          <defs>
                            <linearGradient id="starGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                              <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="time" stroke="#52525B" fontSize={11} tickLine={false} />
                          <YAxis stroke="#52525B" fontSize={11} domain={['dataMin - 10', 'dataMax + 10']} tickLine={false} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#181B24',
                              borderColor: '#2E3345',
                              borderRadius: '8px',
                              fontSize: '11px',
                              color: '#FFFFFF',
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="stars"
                            stroke="#6366F1"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#starGradient)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex justify-between text-[11px] font-mono text-neutral-500 mt-2">
                      <span>Baseline: {chartData[0].stars.toLocaleString()} stars</span>
                      <span>Latest: {chartData[chartData.length - 1].stars.toLocaleString()} stars</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 rounded-xl bg-[#141720] border border-[#232733] text-center space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-neutral-800 flex items-center justify-center text-neutral-400 mx-auto">
                      <Clock className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">Baseline Snapshot Initialized</h4>
                      <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
                        RepoRadar has recorded the initial star count ({repository.stargazers_count.toLocaleString()} stars).
                        As subsequent snapshots are collected over time, the progression chart will automatically render.
                      </p>
                    </div>
                  </div>
                )}

                {/* Viral Score Breakdown */}
                {repository.viralScoreBreakdown && (
                  <div className="p-4 rounded-xl bg-[#141720] border border-[#232733] space-y-3">
                    <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      Viral Score Component Breakdown
                    </h4>
                    <p className="text-xs text-neutral-300">
                      {repository.viralScoreBreakdown.reasoning}
                    </p>

                    <div className="grid grid-cols-2 gap-3 pt-2 text-xs font-mono">
                      <div className="p-2.5 rounded-lg bg-[#181B24] border border-[#262936]">
                        <span className="text-neutral-500 text-[10px] block">Velocity Component</span>
                        <span className="text-sm font-bold text-indigo-400">
                          {repository.viralScoreBreakdown.velocityScore}/100
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-[#181B24] border border-[#262936]">
                        <span className="text-neutral-500 text-[10px] block">Freshness Component</span>
                        <span className="text-sm font-bold text-amber-400">
                          {repository.viralScoreBreakdown.freshnessScore}/100
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-[#181B24] border border-[#262936]">
                        <span className="text-neutral-500 text-[10px] block">Engagement Ratio</span>
                        <span className="text-sm font-bold text-emerald-400">
                          {repository.viralScoreBreakdown.engagementScore}/100
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-[#181B24] border border-[#262936]">
                        <span className="text-neutral-500 text-[10px] block">Growth Rate Component</span>
                        <span className="text-sm font-bold text-neutral-200">
                          {repository.viralScoreBreakdown.growthRateScore}/100
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: Metadata */}
            {activeTab === 'meta' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs">
                  <div className="p-3 rounded-xl bg-[#141720] border border-[#232733]">
                    <span className="text-neutral-500 text-[11px] block mb-1">Stars</span>
                    <span className="text-sm font-bold text-amber-400 flex items-center gap-1">
                      <Star className="w-3.5 h-3.5" />
                      {repository.stargazers_count.toLocaleString()}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#141720] border border-[#232733]">
                    <span className="text-neutral-500 text-[11px] block mb-1">Forks</span>
                    <span className="text-sm font-bold text-neutral-200 flex items-center gap-1">
                      <GitFork className="w-3.5 h-3.5" />
                      {repository.forks_count.toLocaleString()}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#141720] border border-[#232733]">
                    <span className="text-neutral-500 text-[11px] block mb-1">Open Issues</span>
                    <span className="text-sm font-bold text-neutral-200 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {repository.open_issues_count.toLocaleString()}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#141720] border border-[#232733]">
                    <span className="text-neutral-500 text-[11px] block mb-1">Watchers</span>
                    <span className="text-sm font-bold text-neutral-200 flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      {repository.watchers_count.toLocaleString()}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#141720] border border-[#232733]">
                    <span className="text-neutral-500 text-[11px] block mb-1">License</span>
                    <span className="text-xs font-semibold text-neutral-200 truncate flex items-center gap-1">
                      <Scale className="w-3.5 h-3.5" />
                      {repository.license ? repository.license.spdx_id || repository.license.name : 'None'}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#141720] border border-[#232733]">
                    <span className="text-neutral-500 text-[11px] block mb-1">Default Branch</span>
                    <span className="text-xs font-semibold text-neutral-200 truncate flex items-center gap-1">
                      <GitBranch className="w-3.5 h-3.5" />
                      {repository.default_branch || 'main'}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#141720] border border-[#232733] space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-[#232733]">
                    <span className="text-neutral-400">Created:</span>
                    <span className="text-neutral-200 font-mono">
                      {new Date(repository.created_at).toLocaleDateString([], {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#232733]">
                    <span className="text-neutral-400">Last Pushed:</span>
                    <span className="text-neutral-200 font-mono">
                      {new Date(repository.pushed_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-neutral-400">Repository Size:</span>
                    <span className="text-neutral-200 font-mono">
                      {(repository.size / 1024).toFixed(1)} MB
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};
