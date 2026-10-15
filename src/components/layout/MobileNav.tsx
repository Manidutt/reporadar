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
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-[#0F1117] border-r border-[#222634] p-5 flex flex-col justify-between shadow-2xl z-50">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#222634]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <Radar className="w-4 h-4" />
              </div>
              <span className="font-bold text-base text-white">RepoRadar</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800"
              aria-label="Close navigation drawer"
            >
              <X className="w-5 h-5" />
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
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600/20 text-indigo-400 font-semibold border border-indigo-500/30'
                      : 'text-neutral-300 hover:bg-[#181B24]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-indigo-600 text-white">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-[#222634] space-y-3">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#181B24] border border-[#262936] text-xs font-medium text-neutral-300"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span>Switch to Light Theme</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-indigo-400" />
                <span>Switch to Dark Theme</span>
              </>
            )}
          </button>
          <div className="flex items-center justify-between text-[11px] text-neutral-500 font-mono">
            <span>RepoRadar v1.2.0</span>
            <span>Real GitHub Data</span>
          </div>
        </div>
      </div>
    </div>
  );
};
