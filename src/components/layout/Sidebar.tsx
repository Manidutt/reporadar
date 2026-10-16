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
    <aside className="w-64 shrink-0 bg-[#FBFBFC]/90 dark:bg-[#161618]/90 backdrop-blur-2xl border-r border-black/[0.06] dark:border-white/[0.08] flex flex-col justify-between h-screen sticky top-0 select-none z-20 transition-colors">
      <div>
        {/* macOS Traffic Lights & Brand */}
        <div className="p-5 pb-3">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-3 h-3 rounded-full bg-[#FF5F57] border border-[#E0443E]/50 shadow-sm" />
            <span className="w-3 h-3 rounded-full bg-[#FEBC2E] border border-[#D89E24]/50 shadow-sm" />
            <span className="w-3 h-3 rounded-full bg-[#28C840] border border-[#1AAB29]/50 shadow-sm" />
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-[#0071E3] dark:bg-[#0A84FF] flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Radar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-base tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
                  RepoRadar
                </span>
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-[#0071E3]/10 dark:bg-[#0A84FF]/20 text-[#0071E3] dark:text-[#0A84FF]">
                  Daily
                </span>
              </div>
              <p className="text-[11px] text-[#86868B] flex items-center gap-1 font-medium mt-0.5">
                Ideated by <span className="text-[#1D1D1F] dark:text-[#F5F5F7] font-semibold">Manender</span>
              </p>
            </div>
          </div>
        </div>

        {/* Section title */}
        <div className="px-5 pt-3 pb-1 text-[11px] font-semibold text-[#86868B] uppercase tracking-wider">
          Library
        </div>

        {/* Navigation Items */}
        <nav className="px-3 space-y-0.5" aria-label="Main Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                  isActive
                    ? 'bg-[#0071E3] text-white shadow-sm font-semibold'
                    : 'text-[#6E6E73] dark:text-[#A1A1A6] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] hover:text-[#1D1D1F] dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-white' : 'text-[#86868B]'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full font-mono ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-black/[0.06] dark:bg-white/10 text-[#6E6E73] dark:text-[#A1A1A6]'
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

      {/* Footer Area: API Status & Theme Switcher */}
      <div className="p-4 border-t border-black/[0.06] dark:border-white/[0.08] space-y-3">
        {/* Apple Status Widget */}
        <div
          onClick={() => onTabChange('settings')}
          className="p-3 rounded-2xl bg-white dark:bg-[#242426] border border-black/[0.04] dark:border-white/[0.06] shadow-sm hover:shadow-md cursor-pointer transition-all group"
          title="Manage API settings"
        >
          <div className="flex items-center justify-between text-xs mb-1.5">
            <div className="flex items-center gap-1.5 text-[#1D1D1F] dark:text-[#F5F5F7] font-medium">
              <GitHubIcon className="w-3.5 h-3.5 text-[#86868B]" />
              <span>GitHub API</span>
            </div>
            {rateLimit.isAuthenticated ? (
              <span className="flex items-center gap-1 text-[10px] text-[#34C759] font-medium">
                <ShieldCheck className="w-3 h-3" />
                Auth
              </span>
            ) : (
              <span className="text-[10px] text-[#86868B]">Public</span>
            )}
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-[#86868B]">
            <span>Rate Quota</span>
            <span className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
              {rateLimit.remaining} / {rateLimit.limit}
            </span>
          </div>
          <div className="w-full h-1 bg-black/[0.06] dark:bg-white/10 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                rateLimit.remaining <= 2
                  ? 'bg-[#FF3B30]'
                  : rateLimit.remaining <= 5
                  ? 'bg-[#FF9500]'
                  : 'bg-[#34C759]'
              }`}
              style={{
                width: `${Math.min(100, (rateLimit.remaining / Math.max(1, rateLimit.limit)) * 100)}%`,
              }}
            />
          </div>
        </div>

        {/* Theme Segmented Switch */}
        <div className="flex items-center justify-between text-xs text-[#86868B]">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-[#242426] border border-black/[0.04] dark:border-white/[0.06] text-[#1D1D1F] dark:text-[#F5F5F7] text-xs font-medium shadow-sm hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-[#FF9500]" />
                <span>Light</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-[#0071E3]" />
                <span>Dark</span>
              </>
            )}
          </button>
          <span className="text-[11px] font-mono text-[#86868B]">v1.2</span>
        </div>

        {/* Creator Signature */}
        <div className="pt-2.5 border-t border-black/[0.04] dark:border-white/[0.04] flex items-center justify-between text-[11px]">
          <a
            href="https://github.com/Manidutt"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-1.5 text-[#86868B] hover:text-[#0071E3] dark:hover:text-[#0A84FF] transition-colors"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#0071E3] group-hover:scale-125 transition-transform" />
            <span>
              Ideated by{' '}
              <strong className="text-[#1D1D1F] dark:text-[#F5F5F7] group-hover:text-[#0071E3] dark:group-hover:text-[#0A84FF] font-semibold">
                Manender
              </strong>
            </span>
          </a>
          <span className="text-[10px] text-[#86868B]/60 font-mono"> HIG</span>
        </div>
      </div>
    </aside>
  );
};
