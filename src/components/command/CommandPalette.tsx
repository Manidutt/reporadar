import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Compass,
  Flame,
  Zap,
  Code2,
  Bookmark,
  Settings,
  Sun,
  Moon,
  RefreshCw,
  Download,
} from 'lucide-react';
import { GitHubRepository } from '../../types/github';
import { ActiveTab } from '../../types/filters';
import { useTheme } from '../../context/ThemeContext';
import { exportBookmarksAsJson } from '../../services/bookmarkStore';
import { useToast } from '../../context/ToastContext';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  repositories: GitHubRepository[];
  onSelectRepo: (repo: GitHubRepository) => void;
  onNavigateTab: (tab: ActiveTab) => void;
  onRefresh: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  repositories,
  onSelectRepo,
  onNavigateTab,
  onRefresh,
}) => {
  const { theme, toggleTheme } = useTheme();
  const { success } = useToast();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const navActions: { id: string; label: string; icon: React.ElementType; action: () => void; category: 'Navigation' | 'Actions' }[] = [
    {
      id: 'nav-discover',
      label: 'Discover Projects',
      icon: Compass,
      category: 'Navigation',
      action: () => {
        onNavigateTab('discover');
        onClose();
      },
    },
    {
      id: 'nav-trending',
      label: 'Trending Today',
      icon: Flame,
      category: 'Navigation',
      action: () => {
        onNavigateTab('trending');
        onClose();
      },
    },
    {
      id: 'nav-viral',
      label: 'Viral Watch Radar',
      icon: Zap,
      category: 'Navigation',
      action: () => {
        onNavigateTab('viral');
        onClose();
      },
    },
    {
      id: 'nav-languages',
      label: 'Explore by Language',
      icon: Code2,
      category: 'Navigation',
      action: () => {
        onNavigateTab('languages');
        onClose();
      },
    },
    {
      id: 'nav-bookmarks',
      label: 'View Bookmarks',
      icon: Bookmark,
      category: 'Navigation',
      action: () => {
        onNavigateTab('bookmarks');
        onClose();
      },
    },
    {
      id: 'nav-settings',
      label: 'Settings & Tokens',
      icon: Settings,
      category: 'Navigation',
      action: () => {
        onNavigateTab('settings');
        onClose();
      },
    },
    {
      id: 'act-theme',
      label: `Switch to ${theme === 'dark' ? 'Apple Light' : 'Apple Dark'} Mode`,
      icon: theme === 'dark' ? Sun : Moon,
      category: 'Actions',
      action: () => {
        toggleTheme();
        onClose();
      },
    },
    {
      id: 'act-refresh',
      label: 'Refresh GitHub Data',
      icon: RefreshCw,
      category: 'Actions',
      action: () => {
        onRefresh();
        onClose();
      },
    },
    {
      id: 'act-export',
      label: 'Export Bookmarks JSON',
      icon: Download,
      category: 'Actions',
      action: () => {
        exportBookmarksAsJson();
        success('Bookmarks exported');
        onClose();
      },
    },
  ];

  const filteredActions = navActions.filter((a) =>
    a.label.toLowerCase().includes(query.toLowerCase())
  );

  const matchingRepos = repositories.filter(
    (r) =>
      r.full_name.toLowerCase().includes(query.toLowerCase()) ||
      (r.description && r.description.toLowerCase().includes(query.toLowerCase())) ||
      (r.language && r.language.toLowerCase().includes(query.toLowerCase()))
  ).slice(0, 8);

  const totalItems = filteredActions.length + matchingRepos.length;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, totalItems));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + totalItems) % Math.max(1, totalItems));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex < filteredActions.length) {
        filteredActions[selectedIndex].action();
      } else {
        const repoIndex = selectedIndex - filteredActions.length;
        if (matchingRepos[repoIndex]) {
          onSelectRepo(matchingRepos[repoIndex]);
          onClose();
        }
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/35 backdrop-blur-md"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Apple Spotlight Window */}
      <div
        className="relative w-full max-w-xl bg-white/95 dark:bg-[#1C1C1E]/95 backdrop-blur-3xl border border-black/[0.08] dark:border-white/[0.1] rounded-[24px] shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-100 flex flex-col max-h-[70vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Search Input Bar */}
        <div className="p-4 border-b border-black/[0.05] dark:border-white/[0.06] flex items-center gap-3">
          <Search className="w-5 h-5 text-[#86868B] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Spotlight Search or jump to action..."
            className="w-full bg-transparent text-sm text-[#1D1D1F] dark:text-[#F5F5F7] placeholder-[#86868B] focus:outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full bg-black/[0.05] dark:bg-white/[0.08] text-[10px] font-mono text-[#86868B]">
            esc
          </kbd>
        </div>

        {/* List of items */}
        <div className="overflow-y-auto p-2 space-y-1">
          {filteredActions.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#86868B]">
                Actions & Navigation
              </div>
              {filteredActions.map((action, idx) => {
                const Icon = action.icon;
                const isSelected = selectedIndex === idx;
                return (
                  <button
                    key={action.id}
                    onClick={action.action}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-[#0071E3] text-white font-semibold shadow-sm'
                        : 'text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-black/[0.04] dark:hover:bg-white/[0.06]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4" />
                      <span>{action.label}</span>
                    </div>
                    <span className="text-[10px] opacity-75">
                      {action.category}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {matchingRepos.length > 0 && (
            <div className="pt-2">
              <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#86868B]">
                Matching Repositories
              </div>
              {matchingRepos.map((repo, idx) => {
                const globalIdx = filteredActions.length + idx;
                const isSelected = selectedIndex === globalIdx;
                return (
                  <button
                    key={repo.id}
                    onClick={() => {
                      onSelectRepo(repo);
                      onClose();
                    }}
                    onMouseEnter={() => setSelectedIndex(globalIdx)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-[#0071E3] text-white font-semibold shadow-sm'
                        : 'text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-black/[0.04] dark:hover:bg-white/[0.06]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={repo.owner.avatar_url}
                        alt={repo.owner.login}
                        className="w-5 h-5 rounded-md shrink-0 object-cover"
                      />
                      <span className="truncate">{repo.full_name}</span>
                    </div>
                    <div className="flex items-center gap-2.5 shrink-0 text-[11px] opacity-80">
                      {repo.language && <span>{repo.language}</span>}
                      <span>★ {repo.stargazers_count.toLocaleString()}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {totalItems === 0 && (
            <div className="p-8 text-center text-xs text-[#86868B]">
              No results found for "{query}".
            </div>
          )}
        </div>

        {/* Footer Shortcut Bar */}
        <div className="p-3 border-t border-black/[0.05] dark:border-white/[0.06] bg-black/[0.02] dark:bg-white/[0.02] flex items-center justify-between text-[11px] text-[#86868B] px-4">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>Esc Close</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline">Spotlight Search</span>
            <span className="text-[#86868B]/40 hidden sm:inline">•</span>
            <span className="text-[#1D1D1F] dark:text-[#F5F5F7] font-medium">Ideated by Manender</span>
          </div>
        </div>
      </div>
    </div>
  );
};
