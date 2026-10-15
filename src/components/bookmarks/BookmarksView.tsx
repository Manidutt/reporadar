import React, { useState, useRef } from 'react';
import {
  Bookmark,
  Search,
  Download,
  Upload,
  Trash2,
  ExternalLink,
  Star,
  GitFork,
  Calendar,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { BookmarkedRepo, exportBookmarksAsJson, importBookmarksFromJson } from '../../services/bookmarkStore';
import { GitHubRepository } from '../../types/github';
import { LanguageBadge } from '../common/LanguageBadge';
import { GrowthBadge } from '../common/GrowthBadge';
import { useToast } from '../../context/ToastContext';

interface BookmarksViewProps {
  bookmarks: BookmarkedRepo[];
  onRemoveBookmark: (repoId: number) => void;
  onClearAll: () => void;
  onSelectRepo: (repo: GitHubRepository) => void;
  onRefreshBookmarks: () => void;
}

export const BookmarksView: React.FC<BookmarksViewProps> = ({
  bookmarks,
  onRemoveBookmark,
  onClearAll,
  onSelectRepo,
  onRefreshBookmarks,
}) => {
  const { success, error } = useToast();
  const [search, setSearch] = useState('');
  const [selectedLang, setSelectedLang] = useState('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Available languages within bookmarks
  const availableLanguages = Array.from(
    new Set(bookmarks.map((b) => b.repo.language).filter(Boolean))
  ) as string[];

  // Filter bookmarks
  const filtered = bookmarks.filter((b) => {
    const matchesSearch =
      b.repo.name.toLowerCase().includes(search.toLowerCase()) ||
      b.repo.owner.login.toLowerCase().includes(search.toLowerCase()) ||
      (b.repo.description && b.repo.description.toLowerCase().includes(search.toLowerCase()));

    const matchesLang =
      selectedLang === 'all' || (b.repo.language && b.repo.language.toLowerCase() === selectedLang.toLowerCase());

    return matchesSearch && matchesLang;
  });

  const handleExport = () => {
    if (bookmarks.length === 0) {
      error('No bookmarks to export');
      return;
    }
    exportBookmarksAsJson();
    success('Bookmarks exported', 'JSON file saved to your downloads');
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = importBookmarksFromJson(content);
      if (res.success) {
        success('Bookmarks imported', `Successfully added ${res.count} repositories`);
        onRefreshBookmarks();
      } else {
        error('Import failed', res.error || 'Invalid file format');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#171924] via-[#151722] to-[#12141A] border border-[#2A2E3D]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-mono font-medium mb-3">
              <Bookmark className="w-3.5 h-3.5 fill-amber-400" />
              <span>Saved Collections</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Bookmarked Repositories
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1">
              Your curated library of high-potential open-source projects.
            </p>
          </div>

          {/* Action buttons: Export / Import / Clear */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleExport}
              disabled={bookmarks.length === 0}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1D212E] hover:bg-[#252A3B] border border-[#2F3547] text-xs font-medium text-neutral-200 hover:text-white disabled:opacity-40 transition-colors"
              title="Export bookmarks as JSON"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              <span>Export JSON</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1D212E] hover:bg-[#252A3B] border border-[#2F3547] text-xs font-medium text-neutral-200 hover:text-white transition-colors"
              title="Import bookmarks from JSON"
            >
              <Upload className="w-3.5 h-3.5 text-indigo-400" />
              <span>Import</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportFile}
              accept=".json"
              className="hidden"
            />

            {bookmarks.length > 0 && (
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to clear all bookmarks?')) {
                    onClearAll();
                    success('All bookmarks cleared');
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-xs font-medium text-rose-400 transition-colors"
                title="Clear all bookmarks"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clear All</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Storage Integrity Notice */}
      <div className="p-3.5 rounded-xl bg-[#12141A] border border-[#232733] flex items-start gap-3 text-xs text-neutral-400">
        <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
        <p>
          Bookmarks are persisted in your browser's local storage. They survive page refreshes and browser restarts, but do not synchronize automatically across different devices or incognito sessions. Export to JSON to create backups or transfer between computers.
        </p>
      </div>

      {/* Search and Filters Bar within Bookmarks */}
      {bookmarks.length > 0 && (
        <div className="p-4 rounded-xl bg-[#12141A] border border-[#232733] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search in bookmarked repos..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#181B24] border border-[#262936] text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400 font-mono">Language:</span>
            <select
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-[#181B24] border border-[#262936] text-xs text-neutral-200 focus:outline-none font-sans"
            >
              <option value="all">All ({bookmarks.length})</option>
              {availableLanguages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Bookmarks List */}
      {bookmarks.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#12141A] border border-[#232733] max-w-md mx-auto my-8">
          <div className="w-12 h-12 rounded-2xl bg-[#181B24] border border-[#262936] flex items-center justify-center text-amber-400 mb-4 mx-auto">
            <Bookmark className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-white mb-2">No Bookmarks Saved Yet</h3>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Click the bookmark icon on any repository card while exploring trending repositories or viral watch to save them here for quick access.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-8 text-center rounded-xl bg-[#12141A] border border-[#232733] text-xs text-neutral-400">
          No bookmarked repositories match "{search}".
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(({ repo, savedAt }) => (
            <div
              key={repo.id}
              onClick={() => onSelectRepo(repo)}
              className="group p-4 rounded-xl bg-[#12141A] border border-[#232733] hover:border-[#383E52] hover:bg-[#151821] transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                <img
                  src={repo.owner.avatar_url}
                  alt={repo.owner.login}
                  className="w-8 h-8 rounded-full border border-neutral-700 shrink-0 mt-0.5 sm:mt-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white group-hover:text-indigo-400 transition-colors truncate">
                      {repo.full_name}
                    </span>
                    <LanguageBadge language={repo.language} />
                  </div>
                  <p className="text-xs text-neutral-400 line-clamp-1 mt-0.5">
                    {repo.description || 'No description provided.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 sm:gap-6 shrink-0 self-end sm:self-auto text-xs font-mono text-neutral-400">
                <span className="flex items-center gap-1 text-neutral-300">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
                  <span>{repo.stargazers_count.toLocaleString()}</span>
                </span>

                <span className="hidden md:inline-flex items-center gap-1 text-neutral-500 text-[11px]">
                  <Calendar className="w-3 h-3" />
                  Saved {new Date(savedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                </span>

                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => {
                      onRemoveBookmark(repo.id);
                      success('Bookmark removed', repo.full_name);
                    }}
                    className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Remove from bookmarks"
                    aria-label="Remove from bookmarks"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <a
                    href={repo.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                    title="Open on GitHub"
                    aria-label="Open on GitHub"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
