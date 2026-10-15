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
  ExternalLink,
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

  // Global Cmd+K / Ctrl+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open handled by parent or event
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Filter actions and repositories
  const navActions: { id: string; label: string; icon: React.ElementType; action: () => void; category: 'Navigation' | 'Actions' }[] = [
    {
      id: 'nav-discover',
      label: 'Go to Discover',
      icon: Compass,
      category: 'Navigation',
      action: () => {
        onNavigateTab('discover');
        onClose();
      },
    },
    {
      id: 'nav-trending',
      label: 'Go to Trending Today',
      icon: Flame,
      category: 'Navigation',
      action: () => {
        onNavigateTab('trending');
        onClose();
      },
    },
    {
      id: 'nav-viral',
      label: 'Go to Viral Watch',
      icon: Zap,
      category: 'Navigation',
      action: () => {
        onNavigateTab('viral');
        onClose();
      },
    },
    {
      id: 'nav-languages',
      label: 'Go to Explore Languages',
      icon: Code2,
      category: 'Navigation',
      action: () => {
        onNavigateTab('languages');
        onClose();
      },
    },
    {
      id: 'nav-bookmarks',
      label: 'Go to Bookmarks',
      icon: Bookmark,
      category: 'Navigation',
      action: () => {
        onNavigateTab('bookmarks');
        onClose();
      },
    },
    {
      id: 'nav-settings',
      label: 'Go to Settings',
      icon: Settings,
      category: 'Navigation',
      action: () => {
        onNavigateTab('settings');
        onClose();
      },
    },
    {
      id: 'act-theme',
      label: `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`,
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
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Palette Container */}
      <div
        className="relative w-full max-w-xl bg-[#0F1117] border border-[#2A2E3D] rounded-2xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-100 flex flex-col max-h-[70vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Search Input Bar */}
        <div className="p-4 border-b border-[#222634] flex items-center gap-3">
          <Search className="w-5 h-5 text-neutral-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search repositories..."
            className="w-full bg-transparent text-sm text-white placeholder-neutral-500 focus:outline-none font-sans"
          />
          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded bg-neutral-800 text-[10px] font-mono text-neutral-400 border border-neutral-700">
            ESC
          </kbd>
        </div>

        {/* List of items */}
        <div className="overflow-y-auto p-2 space-y-1">
          {filteredActions.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-neutral-500">
                Commands
              </div>
              {filteredActions.map((action, idx) => {
                const Icon = action.icon;
                const isSelected = selectedIndex === idx;
                return (
                  <button
                    key={action.id}
                    onClick={action.action}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white font-semibold'
                        : 'text-neutral-300 hover:bg-[#181B24]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4" />
                      <span>{action.label}</span>
                    </div>
                    <span className="text-[10px] font-mono opacity-60">
                      {action.category}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {matchingRepos.length > 0 && (
            <div className="pt-2">
              <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-neutral-500">
                Discovered Repositories
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
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white font-semibold'
                        : 'text-neutral-300 hover:bg-[#181B24]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={repo.owner.avatar_url}
                        alt={repo.owner.login}
                        className="w-4 h-4 rounded-full shrink-0"
                      />
                      <span className="truncate">{repo.full_name}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 font-mono text-[11px] opacity-80">
                      {repo.language && <span>{repo.language}</span>}
                      <span>★ {repo.stargazers_count.toLocaleString()}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {totalItems === 0 && (
            <div className="p-8 text-center text-xs text-neutral-500">
              No results found for "{query}".
            </div>
          )}
        </div>

        {/* Footer Shortcut Bar */}
        <div className="p-2.5 border-t border-[#222634] bg-[#0A0B0E] flex items-center justify-between text-[11px] font-mono text-neutral-500 px-4">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
          </div>
          <span>RepoRadar Quick Navigation</span>
        </div>
      </div>
    </div>
  );
};
