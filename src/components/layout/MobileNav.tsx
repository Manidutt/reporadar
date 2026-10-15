import React from 'react';
import {
  Compass,
  Flame,
  Zap,
  Code2,
  Bookmark,
  Settings,
  X,
  Radar,
  Moon,
  Sun,
} from 'lucide-react';
import { ActiveTab } from '../../types/filters';
import { useTheme } from '../../context/ThemeContext';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  bookmarkCount: number;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  isOpen,
  onClose,
  activeTab,
  onTabChange,
  bookmarkCount,
}) => {
  const { theme, toggleTheme } = useTheme();

  if (!isOpen) return null;

  const navItems: { id: ActiveTab; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'discover', label: 'Discover', icon: Compass },
    { id: 'trending', label: 'Trending Today', icon: Flame },
    { id: 'viral', label: 'Viral Watch', icon: Zap },
    { id: 'languages', label: 'Explore Languages', icon: Code2 },
    { id: 'bookmarks', label: 'Bookmarks', icon: Bookmark, badge: bookmarkCount },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-md transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* iOS Modal Drawer */}
      <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-[#FBFBFC]/95 dark:bg-[#161618]/95 backdrop-blur-2xl border-r border-black/[0.06] dark:border-white/[0.08] p-5 flex flex-col justify-between shadow-2xl z-50 animate-in slide-in-from-left duration-200">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-black/[0.06] dark:border-white/[0.08]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-2xl bg-[#0071E3] dark:bg-[#0A84FF] flex items-center justify-center text-white">
                <Radar className="w-4 h-4" />
              </div>
              <span className="font-bold text-base text-[#1D1D1F] dark:text-[#F5F5F7]">RepoRadar</span>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-black/[0.05] dark:bg-white/[0.08] flex items-center justify-center text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white"
              aria-label="Close navigation"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Links */}
          <nav className="mt-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-[#0071E3] text-white font-semibold shadow-sm'
                      : 'text-[#6E6E73] dark:text-[#A1A1A6] hover:bg-black/[0.03] dark:hover:bg-white/[0.05]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-white/20 text-white">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-black/[0.06] dark:border-white/[0.08] space-y-3">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full bg-white dark:bg-[#242426] border border-black/[0.06] dark:border-white/[0.08] text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] shadow-xs"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-[#FF9500]" />
                <span>Switch to Light Theme</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-[#0071E3]" />
                <span>Switch to Dark Theme</span>
              </>
            )}
          </button>
          <div className="flex items-center justify-between text-[11px] text-[#86868B] px-1 font-mono">
            <span>RepoRadar</span>
            <span>Real GitHub Data</span>
          </div>
        </div>
      </div>
    </div>
  );
};
