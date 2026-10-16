import React from 'react';
import { Search, RefreshCw, Menu, Sparkles } from 'lucide-react';
import { TimePeriod } from '../../types/filters';

interface HeaderProps {
  period: TimePeriod;
  onPeriodChange: (period: TimePeriod) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenCommandPalette: () => void;
  lastRefreshed: number;
  isRefreshing: boolean;
  onRefresh: () => void;
  onToggleMobileNav: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  period,
  onPeriodChange,
  searchQuery,
  onSearchChange,
  onOpenCommandPalette,
  lastRefreshed,
  isRefreshing,
  onRefresh,
  onToggleMobileNav,
}) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning, developer.';
    if (hour < 18) return 'Good afternoon, developer.';
    return 'Good evening, developer.';
  };

  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).format(new Date());

  const formatRefreshedTime = (timestamp: number) => {
    if (!timestamp) return 'Never';
    const diffSec = Math.floor((Date.now() - timestamp) / 1000);
    if (diffSec < 45) return 'Just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const periodOptions: { id: TimePeriod; label: string }[] = [
    { id: 'today', label: 'Today' },
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
  ];

  return (
    <header className="border-b border-black/[0.05] dark:border-white/[0.06] bg-[#F5F5F7]/85 dark:bg-[#000000]/85 backdrop-blur-2xl sticky top-0 z-10 px-4 sm:px-6 lg:px-8 py-4 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col gap-4">
        {/* Top Row: Date, Title & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleMobileNav}
              className="lg:hidden p-2 rounded-full bg-white dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] shadow-sm text-[#1D1D1F] dark:text-[#F5F5F7]"
              aria-label="Open menu"
            >
              <Menu className="w-4 h-4" />
            </button>

            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[#86868B]">
                {todayFormatted}
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
                {getGreeting()}
              </h1>
              <p className="text-xs sm:text-[13px] text-[#86868B]">
                Your daily pulse on the open-source universe.{' '}
                <span className="hidden sm:inline text-[#86868B]/40">•</span>{' '}
                <span className="hidden sm:inline text-[#6E6E73] dark:text-[#A1A1A6]">
                  Ideated by <strong className="text-[#1D1D1F] dark:text-[#F5F5F7] font-semibold">Manender</strong>
                </span>
              </p>
            </div>
          </div>

          {/* Right Status, Ideation Badge & Refresh */}
          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            <a
              href="https://github.com/Manidutt/reporadar"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0071E3]/10 dark:bg-[#0A84FF]/15 text-[#0071E3] dark:text-[#0A84FF] text-xs font-medium border border-[#0071E3]/20 hover:bg-[#0071E3]/20 transition-all"
              title="RepoRadar — Ideated by Manender"
            >
              <Sparkles className="w-3 h-3" />
              <span>Ideated by <strong>Manender</strong></span>
            </a>

            <span className="text-[11px] text-[#86868B] font-mono hidden md:inline">
              Updated {formatRefreshedTime(lastRefreshed)}
            </span>

            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] shadow-sm hover:shadow text-xs font-medium text-[#1D1D1F] dark:text-[#F5F5F7] transition-all disabled:opacity-50"
              title="Refresh repository feed"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-[#0071E3] dark:text-[#0A84FF] ${
                  isRefreshing ? 'animate-spin' : ''
                }`}
              />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* Bottom Row: Apple Search Pill & Segmented Control */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
          {/* Apple Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#86868B] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search repositories, authors, or topics..."
              className="w-full pl-9 pr-16 py-2 rounded-full bg-white dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] text-xs sm:text-sm text-[#1D1D1F] dark:text-[#F5F5F7] placeholder-[#86868B] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/30 shadow-sm transition-all"
            />
            <button
              onClick={onOpenCommandPalette}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-black/[0.04] dark:bg-white/10 text-[10px] font-mono text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white transition-colors"
              title="Open command palette"
            >
              <span>⌘</span>
              <span>K</span>
            </button>
          </div>

          {/* Apple Segmented Control: Today, This Week, This Month */}
          <div
            className="flex items-center p-1 rounded-full bg-black/[0.05] dark:bg-white/[0.08] border border-black/[0.02] dark:border-white/[0.04] shrink-0 self-start sm:self-auto select-none"
            role="tablist"
            aria-label="Time discovery window"
          >
            {periodOptions.map((opt) => {
              const isSelected = period === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => onPeriodChange(opt.id)}
                  role="tab"
                  aria-selected={isSelected}
                  className={`px-3.5 py-1.5 rounded-full text-xs transition-all font-medium ${
                    isSelected
                      ? 'bg-white dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-[#F5F5F7] shadow-sm font-semibold'
                      : 'text-[#6E6E73] dark:text-[#A1A1A6] hover:text-[#1D1D1F] dark:hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
};
