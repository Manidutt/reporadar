import React from 'react';
import { Search, RefreshCw, Calendar, Menu } from 'lucide-react';
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
  // Compute time-appropriate greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning, developer.';
    if (hour < 18) return 'Good afternoon, developer.';
    return 'Good evening, developer.';
  };

  // Format current date
  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  // Format last refreshed time
  const formatRefreshedTime = (timestamp: number) => {
    if (!timestamp) return 'Never refreshed';
    const date = new Date(timestamp);
    const now = Date.now();
    const diffSec = Math.floor((now - timestamp) / 1000);

    if (diffSec < 45) return 'Just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const periodOptions: { id: TimePeriod; label: string; desc: string }[] = [
    { id: 'today', label: 'Today', desc: 'Active in 24-48h' },
    { id: 'week', label: 'This Week', desc: 'Last 7 days' },
    { id: 'month', label: 'This Month', desc: 'Last 30 days' },
  ];

  return (
    <header className="border-b border-[#222634] bg-[#0A0B0E]/80 backdrop-blur-md sticky top-0 z-10 px-4 sm:px-6 lg:px-8 py-4 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col gap-4">
        {/* Top Row: Greeting, Mobile Trigger, Date & Refresh */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleMobileNav}
              className="lg:hidden p-2 rounded-xl bg-[#141720] border border-[#232733] text-neutral-300 hover:text-white"
              aria-label="Open mobile navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                {getGreeting()}
              </h1>
              <p className="text-xs sm:text-sm text-neutral-400">
                Your daily pulse on the open-source universe.
              </p>
            </div>
          </div>

          {/* Date, Refresh & Status */}
          <div className="flex items-center gap-3 self-end sm:self-auto">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-neutral-400 font-mono px-3 py-1.5 rounded-xl bg-[#12141A] border border-[#232733]">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              <span>{todayFormatted}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-neutral-400 font-mono hidden md:inline">
                Refreshed {formatRefreshedTime(lastRefreshed)}
              </span>
              <button
                onClick={onRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-neutral-200 bg-[#151821] hover:bg-[#1E2230] border border-[#232733] transition-all hover:border-neutral-600 disabled:opacity-50"
                title="Fetch latest repository updates"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 text-indigo-400 ${
                    isRefreshing ? 'animate-spin' : ''
                  }`}
                />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Row: Search & Period Selector */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
          {/* Search bar with Cmd+K hint */}
          <div className="relative flex-1 max-w-lg">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search repository, owner, description, or topic..."
              className="w-full pl-10 pr-20 py-2 rounded-xl bg-[#12141A] border border-[#232733] text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all font-sans"
            />
            <button
              onClick={onOpenCommandPalette}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-[#1B1E29] border border-neutral-700/80 text-[11px] font-mono text-neutral-400 hover:text-white transition-colors"
              title="Open command palette"
            >
              <span>⌘</span>
              <span>K</span>
            </button>
          </div>

          {/* Period Selector Tabs: Today, This Week, This Month */}
          <div
            className="flex items-center p-1 rounded-xl bg-[#12141A] border border-[#232733] shrink-0 self-start sm:self-auto"
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
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-indigo-600 text-white font-semibold shadow-sm shadow-indigo-600/30'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                  title={opt.desc}
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
