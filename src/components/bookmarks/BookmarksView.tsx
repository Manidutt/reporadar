import React, { useState, useRef } from 'react';
import {
  Bookmark,
  Search,
  Download,
  Upload,
  Trash2,
  ExternalLink,
  Star,
  Info,
} from 'lucide-react';
import { BookmarkedRepo, exportBookmarksAsJson, importBookmarksFromJson } from '../../services/bookmarkStore';
import { GitHubRepository } from '../../types/github';
import { LanguageBadge } from '../common/LanguageBadge';
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

  const availableLanguages = Array.from(
    new Set(bookmarks.map((b) => b.repo.language).filter(Boolean))
  ) as string[];

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
    success('Bookmarks exported', 'JSON backup saved to your downloads');
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = importBookmarksFromJson(content);
      if (res.success) {
        success('Bookmarks imported', `Successfully imported ${res.count} repositories`);
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
      <div className="p-7 rounded-[26px] bg-white dark:bg-[#1C1C1E] border border-black/[0.04] dark:border-white/[0.06] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF9500]/10 dark:bg-[#FF9F0A]/20 text-[#FF9500] dark:text-[#FF9F0A] text-xs font-semibold mb-3">
            <Bookmark className="w-3.5 h-3.5 fill-current" />
            <span>Saved Collections</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
            Bookmarks
          </h2>
          <p className="text-xs sm:text-sm text-[#86868B] mt-1.5">
            Your personal library of standout open-source repositories.
          </p>
        </div>

        {/* Action pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExport}
            disabled={bookmarks.length === 0}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-black/[0.04] dark:bg-white/[0.08] hover:bg-black/[0.08] dark:hover:bg-white/[0.12] text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] disabled:opacity-40 transition-all shadow-xs"
            title="Export bookmarks as JSON"
          >
            <Download className="w-3.5 h-3.5 text-[#0071E3] dark:text-[#0A84FF]" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-black/[0.04] dark:bg-white/[0.08] hover:bg-black/[0.08] dark:hover:bg-white/[0.12] text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] transition-all shadow-xs"
            title="Import bookmarks from JSON"
          >
            <Upload className="w-3.5 h-3.5 text-[#0071E3] dark:text-[#0A84FF]" />
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
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#FF3B30]/10 hover:bg-[#FF3B30]/20 text-xs font-semibold text-[#FF3B30] transition-colors"
              title="Clear all bookmarks"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear All</span>
            </button>
          )}
        </div>
      </div>

      {/* Storage Integrity Notice */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#1C1C1E] border border-black/[0.04] dark:border-white/[0.06] shadow-xs flex items-start gap-3 text-xs text-[#86868B]">
        <Info className="w-4 h-4 text-[#0071E3] dark:text-[#0A84FF] shrink-0 mt-0.5" />
        <p>
          Bookmarks are persisted in your browser's local storage. They survive page refreshes and browser restarts, but do not synchronize across devices. Use the JSON export to create local backups or move bookmarks between computers.
        </p>
      </div>

      {/* Search and Filters Bar within Bookmarks */}
      {bookmarks.length > 0 && (
        <div className="p-4 rounded-2xl bg-white dark:bg-[#1C1C1E] border border-black/[0.04] dark:border-white/[0.06] shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#86868B] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search in bookmarks..."
              className="w-full pl-9 pr-3 py-1.5 rounded-full bg-black/[0.04] dark:bg-white/[0.08] text-xs text-[#1D1D1F] dark:text-[#F5F5F7] placeholder-[#86868B] focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#86868B]">Language:</span>
            <select
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value)}
              className="px-3 py-1.5 rounded-full bg-black/[0.04] dark:bg-white/[0.08] text-xs text-[#1D1D1F] dark:text-[#F5F5F7] focus:outline-none"
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
        <div className="p-12 text-center rounded-[24px] bg-white dark:bg-[#1C1C1E] border border-black/[0.04] dark:border-white/[0.06] shadow-sm max-w-md mx-auto my-8">
          <div className="w-14 h-14 rounded-full bg-[#FF9500]/10 flex items-center justify-center text-[#FF9500] mb-4 mx-auto">
            <Bookmark className="w-6 h-6 fill-current" />
          </div>
          <h3 className="text-base font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] mb-1.5">No Bookmarks Saved</h3>
          <p className="text-xs text-[#86868B] leading-relaxed">
            Click the bookmark icon on any repository card while exploring trending repositories or viral watch to keep them saved here.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-white dark:bg-[#1C1C1E] border border-black/[0.04] dark:border-white/[0.06] text-xs text-[#86868B]">
          No bookmarked repositories match "{search}".
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map(({ repo, savedAt }) => (
            <div
              key={repo.id}
              onClick={() => onSelectRepo(repo)}
              className="group p-4 rounded-2xl bg-white dark:bg-[#1C1C1E] border border-black/[0.04] dark:border-white/[0.06] shadow-xs hover:shadow-sm hover:border-[#0071E3]/20 dark:hover:border-[#0A84FF]/25 hover:bg-neutral-50 dark:hover:bg-[#222224] transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                <img
                  src={repo.owner.avatar_url}
                  alt={repo.owner.login}
                  className="w-8 h-8 rounded-xl border border-black/[0.05] dark:border-white/[0.08] shrink-0 object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] group-hover:text-[#0071E3] dark:group-hover:text-[#0A84FF] transition-colors truncate tracking-tight">
                      {repo.full_name}
                    </span>
                    <LanguageBadge language={repo.language} />
                  </div>
                  <p className="text-xs text-[#86868B] line-clamp-1 mt-0.5">
                    {repo.description || 'No description provided.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 sm:gap-6 shrink-0 self-end sm:self-auto text-xs text-[#86868B]">
                <span className="flex items-center gap-1 font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] font-mono">
                  <Star className="w-3.5 h-3.5 text-[#FF9500] fill-[#FF9500]" />
                  <span>{repo.stargazers_count.toLocaleString()}</span>
                </span>

                <span className="hidden md:inline-flex text-[11px] text-[#86868B]">
                  Saved {new Date(savedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                </span>

                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => {
                      onRemoveBookmark(repo.id);
                      success('Bookmark removed', repo.full_name);
                    }}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-[#FF3B30] hover:bg-[#FF3B30]/10 transition-colors"
                    title="Remove from bookmarks"
                    aria-label="Remove from bookmarks"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <a
                    href={repo.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-7 h-7 rounded-full bg-black/[0.04] dark:bg-white/[0.06] flex items-center justify-center text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white transition-colors"
                    title="Open on GitHub"
                    aria-label="Open on GitHub"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
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
