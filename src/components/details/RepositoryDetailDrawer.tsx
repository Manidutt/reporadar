import React, { useEffect, useState } from 'react';
import {
  X,
  ExternalLink,
  Star,
  GitFork,
  AlertCircle,
  Eye,
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
        className="fixed inset-0 bg-black/35 backdrop-blur-md transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Container */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <aside
          className="w-screen max-w-2xl bg-white dark:bg-[#1C1C1E] border-l border-black/[0.06] dark:border-white/[0.08] shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200"
          role="dialog"
          aria-modal="true"
          aria-labelledby="repo-drawer-title"
        >
          {/* Top Header */}
          <div className="p-6 border-b border-black/[0.05] dark:border-white/[0.06] sticky top-0 bg-white/95 dark:bg-[#1C1C1E]/95 backdrop-blur-xl z-10">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                <img
                  src={repository.owner.avatar_url}
                  alt={repository.owner.login}
                  className="w-11 h-11 rounded-2xl border border-black/[0.06] dark:border-white/[0.08] shrink-0 bg-neutral-100 dark:bg-neutral-800 object-cover"
                />
                <div className="min-w-0 flex-1">
                  <span className="text-xs text-[#86868B] block truncate">
                    {repository.owner.login}
                  </span>
                  <h2
                    id="repo-drawer-title"
                    className="text-lg sm:text-xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight truncate"
                  >
                    {repository.name}
                  </h2>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => onToggleBookmark(repository)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    isBookmarked
                      ? 'bg-[#FF9500]/15 text-[#FF9500]'
                      : 'bg-black/[0.04] dark:bg-white/[0.08] text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white'
                  }`}
                  title={isBookmarked ? 'Remove bookmark' : 'Bookmark repository'}
                  aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark repository'}
                >
                  <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-[#FF9500]' : ''}`} />
                </button>

                <button
                  onClick={handleShare}
                  className="w-8 h-8 rounded-full bg-black/[0.04] dark:bg-white/[0.08] flex items-center justify-center text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white transition-all"
                  title="Share repository"
                >
                  <Share2 className="w-4 h-4" />
                </button>

                <a
                  href={repository.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-black/[0.04] dark:bg-white/[0.08] flex items-center justify-center text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white transition-all"
                  title="Open on GitHub"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>

                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-black/[0.04] dark:bg-white/[0.08] text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white flex items-center justify-center ml-1 transition-all"
                  aria-label="Close drawer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-[13px] text-[#6E6E73] dark:text-[#A1A1A6] mt-3 leading-relaxed">
              {repository.description || 'No description provided by repository author.'}
            </p>

            {/* Topics */}
            {repository.topics && repository.topics.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap mt-3">
                {repository.topics.map((t) => (
                  <span
                    key={t}
                    className="px-2.5 py-0.5 rounded-full bg-black/[0.04] dark:bg-white/[0.06] text-[11px] text-[#6E6E73] dark:text-[#A1A1A6]"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}

            {/* Clone Command Bar */}
            <div className="mt-4 flex items-center justify-between p-2.5 rounded-full bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.04] dark:border-white/[0.06]">
              <div className="flex items-center gap-2 text-xs font-mono text-[#1D1D1F] dark:text-[#F5F5F7] truncate pl-2">
                <span className="text-[#86868B] select-none">$</span>
                <span className="truncate">git clone {repository.clone_url}</span>
              </div>
              <button
                onClick={handleCopyClone}
                className="flex items-center gap-1 px-3 py-1 rounded-full bg-white dark:bg-[#2C2C2E] shadow-xs text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] transition-all shrink-0 hover:scale-102"
              >
                {copiedClone ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#34C759]" />
                    <span className="text-[#34C759]">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#86868B]" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-3 mt-4 border-b border-black/[0.05] dark:border-white/[0.06] -mb-6 pb-2 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('readme')}
                className={`flex items-center gap-1.5 pb-2 border-b-2 transition-all ${
                  activeTab === 'readme'
                    ? 'border-[#0071E3] dark:border-[#0A84FF] text-[#0071E3] dark:text-[#0A84FF]'
                    : 'border-transparent text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>README</span>
              </button>
              <button
                onClick={() => setActiveTab('growth')}
                className={`flex items-center gap-1.5 pb-2 border-b-2 transition-all ${
                  activeTab === 'growth'
                    ? 'border-[#0071E3] dark:border-[#0A84FF] text-[#0071E3] dark:text-[#0A84FF]'
                    : 'border-transparent text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Growth Analytics</span>
              </button>
              <button
                onClick={() => setActiveTab('meta')}
                className={`flex items-center gap-1.5 pb-2 border-b-2 transition-all ${
                  activeTab === 'meta'
                    ? 'border-[#0071E3] dark:border-[#0A84FF] text-[#0071E3] dark:text-[#0A84FF]'
                    : 'border-transparent text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white'
                }`}
              >
                <Info className="w-3.5 h-3.5" />
                <span>Details</span>
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
                    <div className="h-6 bg-black/[0.06] dark:bg-white/[0.08] rounded-full w-1/3" />
                    <div className="h-4 bg-black/[0.04] dark:bg-white/[0.06] rounded-full w-full" />
                    <div className="h-4 bg-black/[0.04] dark:bg-white/[0.06] rounded-full w-5/6" />
                  </div>
                ) : readme ? (
                  <div className="prose max-w-none text-xs sm:text-sm leading-relaxed text-[#1D1D1F] dark:text-[#F5F5F7]">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        a: ({ ...props }) => (
                          <a
                            {...props}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#0071E3] dark:text-[#0A84FF] hover:underline"
                          />
                        ),
                        h1: ({ ...props }) => (
                          <h1 {...props} className="text-xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7] mt-4 mb-2 pb-1 border-b border-black/[0.06] dark:border-white/[0.08]" />
                        ),
                        h2: ({ ...props }) => (
                          <h2 {...props} className="text-lg font-bold text-[#1D1D1F] dark:text-[#F5F5F7] mt-4 mb-2 pb-1 border-b border-black/[0.06] dark:border-white/[0.08]" />
                        ),
                        p: ({ ...props }) => <p {...props} className="mb-3 text-[#333336] dark:text-[#D1D1D6]" />,
                        ul: ({ ...props }) => <ul {...props} className="list-disc pl-5 mb-3 space-y-1" />,
                        ol: ({ ...props }) => <ol {...props} className="list-decimal pl-5 mb-3 space-y-1" />,
                        pre: ({ ...props }) => (
                          <pre
                            {...props}
                            className="p-3.5 rounded-2xl bg-[#F5F5F7] dark:bg-[#2C2C2E] border border-black/[0.04] dark:border-white/[0.06] overflow-x-auto my-3 font-mono text-xs text-[#1D1D1F] dark:text-[#F5F5F7]"
                          />
                        ),
                        code: ({ className, children, ...props }) => {
                          const isInline = !className;
                          return isInline ? (
                            <code
                              {...props}
                              className="px-1.5 py-0.5 rounded-md bg-black/[0.05] dark:bg-white/[0.08] text-[#1D1D1F] dark:text-[#F5F5F7] font-mono text-[11px]"
                            >
                              {children}
                            </code>
                          ) : (
                            <code {...props} className={className}>
                              {children}
                            </code>
                          );
                        },
                      }}
                    >
                      {readme}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="p-8 text-center rounded-2xl bg-[#F5F5F7] dark:bg-[#2C2C2E] text-xs text-[#86868B]">
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
                    <h3 className="text-sm font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">Observed Star Growth</h3>
                    <p className="text-xs text-[#86868B] mt-0.5">
                      Empirical snapshot observations recorded in local store.
                    </p>
                  </div>
                  <GrowthBadge growth={repository.observedGrowth} />
                </div>

                {hasChartData ? (
                  <div className="p-4 rounded-2xl bg-[#F5F5F7] dark:bg-[#2C2C2E] border border-black/[0.04] dark:border-white/[0.06]">
                    <div className="h-60 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                          <defs>
                            <linearGradient id="appleGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#0071E3" stopOpacity={0.35} />
                              <stop offset="95%" stopColor="#0071E3" stopOpacity={0.0} />
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="time" stroke="#86868B" fontSize={11} tickLine={false} />
                          <YAxis stroke="#86868B" fontSize={11} domain={['dataMin - 10', 'dataMax + 10']} tickLine={false} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#1C1C1E',
                              borderColor: 'rgba(255,255,255,0.1)',
                              borderRadius: '12px',
                              fontSize: '11px',
                              color: '#FFFFFF',
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="stars"
                            stroke="#0071E3"
                            strokeWidth={2.5}
                            fillOpacity={1}
                            fill="url(#appleGradient)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex justify-between text-[11px] font-mono text-[#86868B] mt-2">
                      <span>Baseline: {chartData[0].stars.toLocaleString()} stars</span>
                      <span>Latest: {chartData[chartData.length - 1].stars.toLocaleString()} stars</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl bg-[#F5F5F7] dark:bg-[#2C2C2E] text-center space-y-3">
                    <div className="w-10 h-10 rounded-full bg-black/[0.05] dark:bg-white/[0.08] flex items-center justify-center text-[#0071E3] dark:text-[#0A84FF] mx-auto">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">Baseline Initialized</h4>
                      <p className="text-xs text-[#86868B] mt-1 max-w-sm mx-auto">
                        RepoRadar has captured the baseline snapshot ({repository.stargazers_count.toLocaleString()} stars).
                        Progression charts automatically render as additional snapshots accumulate over time.
                      </p>
                    </div>
                  </div>
                )}

                {/* Viral Score Breakdown */}
                {repository.viralScoreBreakdown && (
                  <div className="p-5 rounded-2xl bg-[#F5F5F7] dark:bg-[#2C2C2E] space-y-3">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-[#86868B] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#0071E3] dark:text-[#0A84FF]" />
                      Viral Score Component Breakdown
                    </h4>
                    <p className="text-xs text-[#1D1D1F] dark:text-[#F5F5F7]">
                      {repository.viralScoreBreakdown.reasoning}
                    </p>

                    <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                      <div className="p-3 rounded-xl bg-white dark:bg-[#1C1C1E] border border-black/[0.04] dark:border-white/[0.06] shadow-xs">
                        <span className="text-[#86868B] text-[10px] block">Velocity</span>
                        <span className="text-sm font-bold text-[#0071E3] dark:text-[#0A84FF]">
                          {repository.viralScoreBreakdown.velocityScore}/100
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-white dark:bg-[#1C1C1E] border border-black/[0.04] dark:border-white/[0.06] shadow-xs">
                        <span className="text-[#86868B] text-[10px] block">Freshness</span>
                        <span className="text-sm font-bold text-[#FF9500]">
                          {repository.viralScoreBreakdown.freshnessScore}/100
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-white dark:bg-[#1C1C1E] border border-black/[0.04] dark:border-white/[0.06] shadow-xs">
                        <span className="text-[#86868B] text-[10px] block">Engagement</span>
                        <span className="text-sm font-bold text-[#34C759]">
                          {repository.viralScoreBreakdown.engagementScore}/100
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-white dark:bg-[#1C1C1E] border border-black/[0.04] dark:border-white/[0.06] shadow-xs">
                        <span className="text-[#86868B] text-[10px] block">Growth Rate</span>
                        <span className="text-sm font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
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
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3.5 rounded-2xl bg-[#F5F5F7] dark:bg-[#2C2C2E]">
                    <span className="text-[#86868B] text-[11px] block mb-1">Stars</span>
                    <span className="text-sm font-bold text-[#FF9500] flex items-center gap-1 font-mono">
                      <Star className="w-3.5 h-3.5 fill-[#FF9500]" />
                      {repository.stargazers_count.toLocaleString()}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#F5F5F7] dark:bg-[#2C2C2E]">
                    <span className="text-[#86868B] text-[11px] block mb-1">Forks</span>
                    <span className="text-sm font-bold text-[#1D1D1F] dark:text-[#F5F5F7] flex items-center gap-1 font-mono">
                      <GitFork className="w-3.5 h-3.5" />
                      {repository.forks_count.toLocaleString()}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#F5F5F7] dark:bg-[#2C2C2E]">
                    <span className="text-[#86868B] text-[11px] block mb-1">Open Issues</span>
                    <span className="text-sm font-bold text-[#1D1D1F] dark:text-[#F5F5F7] flex items-center gap-1 font-mono">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {repository.open_issues_count.toLocaleString()}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#F5F5F7] dark:bg-[#2C2C2E]">
                    <span className="text-[#86868B] text-[11px] block mb-1">Watchers</span>
                    <span className="text-sm font-bold text-[#1D1D1F] dark:text-[#F5F5F7] flex items-center gap-1 font-mono">
                      <Eye className="w-3.5 h-3.5" />
                      {repository.watchers_count.toLocaleString()}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#F5F5F7] dark:bg-[#2C2C2E]">
                    <span className="text-[#86868B] text-[11px] block mb-1">License</span>
                    <span className="text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] truncate flex items-center gap-1">
                      <Scale className="w-3.5 h-3.5" />
                      {repository.license ? repository.license.spdx_id || repository.license.name : 'None'}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#F5F5F7] dark:bg-[#2C2C2E]">
                    <span className="text-[#86868B] text-[11px] block mb-1">Default Branch</span>
                    <span className="text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] truncate flex items-center gap-1">
                      <GitBranch className="w-3.5 h-3.5" />
                      {repository.default_branch || 'main'}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#F5F5F7] dark:bg-[#2C2C2E] space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-black/[0.04] dark:border-white/[0.06]">
                    <span className="text-[#86868B]">Created:</span>
                    <span className="text-[#1D1D1F] dark:text-[#F5F5F7] font-mono">
                      {new Date(repository.created_at).toLocaleDateString([], {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-black/[0.04] dark:border-white/[0.06]">
                    <span className="text-[#86868B]">Last Pushed:</span>
                    <span className="text-[#1D1D1F] dark:text-[#F5F5F7] font-mono">
                      {new Date(repository.pushed_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-[#86868B]">Repository Size:</span>
                    <span className="text-[#1D1D1F] dark:text-[#F5F5F7] font-mono">
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
