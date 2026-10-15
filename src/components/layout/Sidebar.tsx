import React, { useEffect, useState } from 'react';
import {
  Compass,
  Flame,
  Zap,
  Code2,
  Bookmark,
  Settings,
  Radar,
  Moon,
  Sun,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';
import { GitHubIcon } from '../common/GitHubIcon';
import { ActiveTab } from '../../types/filters';
import { useTheme } from '../../context/ThemeContext';
import { subscribeToRateLimit } from '../../services/githubApi';
import { RateLimitStatus } from '../../types/github';

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  bookmarkCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  bookmarkCount,
}) => {
  const { theme, toggleTheme } = useTheme();
  const [rateLimit, setRateLimit] = useState<RateLimitStatus>({
    limit: 10,
    remaining: 10,
    resetTimestamp: Date.now() + 60000,
    isAuthenticated: false,
    lastChecked: Date.now(),
  });

  useEffect(() => {
    const unsubscribe = subscribeToRateLimit(setRateLimit);
    return unsubscribe;
  }, []);

  const navItems: { id: ActiveTab; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'discover', label: 'Discover', icon: Compass },
    { id: 'trending', label: 'Trending Today', icon: Flame },
    { id: 'viral', label: 'Viral Watch', icon: Zap },
    { id: 'languages', label: 'Explore Languages', icon: Code2 },
    { id: 'bookmarks', label: 'Bookmarks', icon: Bookmark, badge: bookmarkCount },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 shrink-0 bg-[#0F1117] border-r border-[#222634] flex flex-col justify-between h-screen sticky top-0 select-none z-20">
      {/* Brand Header */}
      <div>
        <div className="p-5 pb-4 flex items-center justify-between border-b border-[#222634]/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Radar className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base tracking-tight text-white font-sans">RepoRadar</span>
                <span className="text-[10px] uppercase font-mono font-bold px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 font-mono tracking-tight">Viral Repo Discovery</p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1" aria-label="Main Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600/15 text-indigo-300 font-semibold border border-indigo-500/30 shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-[#181B24]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-indigo-400' : 'text-neutral-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-mono font-medium ${
                      isActive
                        ? 'bg-indigo-500 text-white'
                        : 'bg-neutral-800 text-neutral-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Area: API Status, Theme Toggle & Version */}
      <div className="p-4 border-t border-[#222634]/80 space-y-3">
        {/* API Rate Limit Status Pill */}
        <div
          onClick={() => onTabChange('settings')}
          className="p-2.5 rounded-xl bg-[#141720] border border-[#232733] hover:border-neutral-700 cursor-pointer transition-colors group"
          title="Click to manage GitHub API credentials & rate limits in Settings"
        >
          <div className="flex items-center justify-between text-xs mb-1">
            <div className="flex items-center gap-1.5 text-neutral-300 font-medium">
              <GitHubIcon className="w-3.5 h-3.5 text-neutral-400" />
              <span>GitHub API</span>
            </div>
            {rateLimit.isAuthenticated ? (
              <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
                <ShieldCheck className="w-3 h-3" />
                Auth
              </span>
            ) : (
              <span className="text-[10px] text-neutral-400 font-mono">Public</span>
            )}
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
            <span>Remaining:</span>
            <span
              className={`font-semibold ${
                rateLimit.remaining <= 2
                  ? 'text-rose-400'
                  : rateLimit.remaining <= 5
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }`}
            >
              {rateLimit.remaining} / {rateLimit.limit}
            </span>
          </div>
          {/* Progress bar */}
          <div className="w-full h-1 bg-neutral-800 rounded-full mt-1.5 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                rateLimit.remaining <= 2
                  ? 'bg-rose-500'
                  : rateLimit.remaining <= 5
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{
                width: `${Math.min(100, (rateLimit.remaining / Math.max(1, rateLimit.limit)) * 100)}%`,
              }}
            />
          </div>
        </div>

        {/* Theme Toggle & Version */}
        <div className="flex items-center justify-between text-xs text-neutral-400 pt-1">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#181B24] border border-[#262936] hover:text-white transition-colors text-xs font-medium"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
                <span>Dark Mode</span>
              </>
            )}
          </button>
          <span className="text-[11px] font-mono text-neutral-500">v1.2.0</span>
        </div>
      </div>
    </aside>
  );
};
