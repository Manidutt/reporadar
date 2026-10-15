import React, { useState, useEffect, useMemo } from 'react';
import { ActiveTab, FilterState, TimePeriod, ViewMode } from './types/filters';
import { GitHubRepository } from './types/github';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { MobileNav } from './components/layout/MobileNav';
import { Footer } from './components/layout/Footer';
import { SummaryCards } from './components/dashboard/SummaryCards';
import { QuickLanguagePills } from './components/dashboard/QuickLanguagePills';
import { FilterPanel } from './components/filters/FilterPanel';
import { ViewToggle } from './components/feed/ViewToggle';
import { RepositoryCard } from './components/feed/RepositoryCard';
import { RepositoryListItem } from './components/feed/RepositoryListItem';
import { EmptyState } from './components/feed/EmptyState';
import { RepositoryCardSkeleton, RepositoryListItemSkeleton, MetricCardSkeleton } from './components/common/SkeletonLoader';
import { ViralWatchView } from './components/viral/ViralWatchView';
import { LanguageExplorerView } from './components/languages/LanguageExplorerView';
import { BookmarksView } from './components/bookmarks/BookmarksView';
import { SettingsView } from './components/settings/SettingsView';
import { RepositoryDetailDrawer } from './components/details/RepositoryDetailDrawer';
import { CommandPalette } from './components/command/CommandPalette';
import { ToastContainer } from './components/common/ToastContainer';
import { useBookmarks } from './hooks/useBookmarks';
import { useGitHubData } from './hooks/useGitHubData';
import { ShieldAlert } from 'lucide-react';

const INITIAL_FILTERS: FilterState = {
  searchQuery: '',
  language: 'all',
  minStars: 50,
  minGrowth: 0,
  topic: '',
  period: 'today',
  sortBy: 'stars',
  sortOrder: 'desc',
};

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab') as ActiveTab;
      if (['discover', 'trending', 'viral', 'languages', 'bookmarks', 'settings'].includes(tabParam)) {
        return tabParam;
      }
    } catch {}
    return 'discover';
  });

  const [filters, setFilters] = useState<FilterState>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return {
        ...INITIAL_FILTERS,
        searchQuery: params.get('q') || '',
        language: params.get('lang') || 'all',
        period: (params.get('period') as TimePeriod) || 'today',
      };
    } catch {
      return INITIAL_FILTERS;
    }
  });

  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepository | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Bookmarks hook
  const {
    bookmarks,
    bookmarkIds,
    toggleBookmark,
    removeBookmark,
    clearAllBookmarks,
    reloadBookmarks,
  } = useBookmarks();

  // GitHub Data hook
  const {
    repositories,
    isLoading,
    isRefreshing,
    isRateLimited,
    lastRefreshed,
    refresh,
    reEnrich,
  } = useGitHubData(filters);

  // Sync state to URL search parameters for shareable links
  useEffect(() => {
    try {
      const params = new URLSearchParams();
      if (activeTab !== 'discover') params.set('tab', activeTab);
      if (filters.searchQuery) params.set('q', filters.searchQuery);
      if (filters.language !== 'all') params.set('lang', filters.language);
      if (filters.period !== 'today') params.set('period', filters.period);

      const newUrl = params.toString()
        ? `${window.location.pathname}?${params.toString()}`
        : window.location.pathname;

      window.history.replaceState({}, '', newUrl);
    } catch {}
  }, [activeTab, filters.searchQuery, filters.language, filters.period]);

  // Language counts from current loaded dataset
  const languageCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    repositories.forEach((r) => {
      if (r.language) {
        counts[r.language] = (counts[r.language] || 0) + 1;
      }
    });
    return counts;
  }, [repositories]);

  // Client-side filtering for minGrowth and minStars
  const displayedRepositories = useMemo(() => {
    return repositories.filter((repo) => {
      if (filters.minGrowth > 0) {
        const gained = repo.observedGrowth?.starsGained || 0;
        if (gained < filters.minGrowth) return false;
      }
      return true;
    });
  }, [repositories, filters.minGrowth]);

  const handleUpdateFilters = (updated: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...updated }));
  };

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS);
  };

  const handleOpenRepoDetails = (repo: GitHubRepository) => {
    setSelectedRepo(repo);
    setIsDetailOpen(true);
  };

  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
    if (tab === 'trending') {
      handleUpdateFilters({ period: 'today', sortBy: 'stars' });
    } else if (tab === 'viral') {
      handleUpdateFilters({ sortBy: 'viral' });
    }
  };

  const handleSelectLanguageFromExplorer = (lang: string) => {
    handleUpdateFilters({ language: lang });
    setActiveTab('discover');
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] dark:bg-[#000000] text-[#1D1D1F] dark:text-[#F5F5F7] flex flex-col font-sans selection:bg-[#0071E3] selection:text-white transition-colors duration-200 antialiased">
      <div className="flex flex-1 min-h-screen">
        {/* Desktop Sidebar Navigation */}
        <div className="hidden lg:block">
          <Sidebar
            activeTab={activeTab}
            onTabChange={handleTabChange}
            bookmarkCount={bookmarks.length}
          />
        </div>

        {/* Mobile Navigation Drawer */}
        <MobileNav
          isOpen={isMobileNavOpen}
          onClose={() => setIsMobileNavOpen(false)}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          bookmarkCount={bookmarks.length}
        />

        {/* Main Application Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <Header
            period={filters.period}
            onPeriodChange={(period) => handleUpdateFilters({ period })}
            searchQuery={filters.searchQuery}
            onSearchChange={(searchQuery) => handleUpdateFilters({ searchQuery })}
            onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
            lastRefreshed={lastRefreshed}
            isRefreshing={isRefreshing}
            onRefresh={refresh}
            onToggleMobileNav={() => setIsMobileNavOpen(true)}
          />

          {/* Main Content Body */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            {/* Rate limit warning banner if applicable */}
            {isRateLimited && (
              <div className="p-4 rounded-2xl bg-[#FF9500]/10 border border-[#FF9500]/25 flex items-start gap-3 text-xs text-[#1D1D1F] dark:text-[#F5F5F7]">
                <ShieldAlert className="w-5 h-5 text-[#FF9500] shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="font-semibold text-[#FF9500] mb-0.5 flex items-center gap-1.5">
                    GitHub Search Rate Limit Active
                  </div>
                  <p className="leading-relaxed text-[#6E6E73] dark:text-[#A1A1A6]">
                    Unauthenticated GitHub Search allows 10 queries per minute. Displaying verified baseline repositories with active growth tracking.
                    Add a free Personal Access Token in{' '}
                    <button
                      onClick={() => setActiveTab('settings')}
                      className="underline font-semibold text-[#0071E3] dark:text-[#0A84FF]"
                    >
                      Settings
                    </button>{' '}
                    to elevate your quota to 5,000 requests/hour.
                  </p>
                </div>
              </div>
            )}

            {/* TAB: DISCOVER / TRENDING TODAY */}
            {(activeTab === 'discover' || activeTab === 'trending') && (
              <div className="space-y-6 animate-in fade-in duration-150">
                {/* Metric Summary Cards */}
                {isLoading && repositories.length === 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <MetricCardSkeleton />
                    <MetricCardSkeleton />
                    <MetricCardSkeleton />
                    <MetricCardSkeleton />
                  </div>
                ) : (
                  <SummaryCards
                    repositories={repositories}
                    onSelectRepo={handleOpenRepoDetails}
                    onFilterLanguage={(lang) => handleUpdateFilters({ language: lang })}
                  />
                )}

                {/* Quick Language Chips */}
                <QuickLanguagePills
                  selectedLanguage={filters.language}
                  onSelectLanguage={(language) => handleUpdateFilters({ language })}
                  availableCounts={languageCounts}
                />

                {/* Filter and Sorting Panel */}
                <FilterPanel
                  filters={filters}
                  onChange={handleUpdateFilters}
                  onReset={handleResetFilters}
                  resultCount={displayedRepositories.length}
                  totalAvailable={repositories.length}
                />

                {/* Feed Header with View Mode Switch */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
                      {activeTab === 'trending' ? 'Trending Today' : 'Discovered Repositories'}
                    </h2>
                    <span className="text-xs font-mono text-[#86868B] px-2.5 py-0.5 rounded-full bg-white dark:bg-[#1C1C1E] border border-black/[0.04] dark:border-white/[0.06] shadow-xs">
                      {displayedRepositories.length}
                    </span>
                  </div>

                  <ViewToggle viewMode={viewMode} onChange={setViewMode} />
                </div>

                {/* Repository Feed */}
                {isLoading && repositories.length === 0 ? (
                  viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Array.from({ length: 9 }).map((_, i) => (
                        <RepositoryCardSkeleton key={i} />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <RepositoryListItemSkeleton key={i} />
                      ))}
                    </div>
                  )
                ) : displayedRepositories.length === 0 ? (
                  <EmptyState
                    title="No repositories match your criteria"
                    description={`No projects found with min stars ${filters.minStars} and language "${filters.language}". Try relaxing filters or clearing keyword searches.`}
                    onResetFilters={handleResetFilters}
                  />
                ) : viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {displayedRepositories.map((repo) => (
                      <RepositoryCard
                        key={repo.id}
                        repository={repo}
                        isBookmarked={bookmarkIds.includes(repo.id)}
                        onToggleBookmark={toggleBookmark}
                        onSelect={handleOpenRepoDetails}
                        onFilterTopic={(topic) => handleUpdateFilters({ topic })}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {displayedRepositories.map((repo, idx) => (
                      <RepositoryListItem
                        key={repo.id}
                        repository={repo}
                        index={idx}
                        isBookmarked={bookmarkIds.includes(repo.id)}
                        onToggleBookmark={toggleBookmark}
                        onSelect={handleOpenRepoDetails}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: VIRAL WATCH */}
            {activeTab === 'viral' && (
              <ViralWatchView
                repositories={repositories}
                bookmarks={bookmarkIds}
                onToggleBookmark={toggleBookmark}
                onSelectRepo={handleOpenRepoDetails}
                onFilterTopic={(topic) => {
                  handleUpdateFilters({ topic });
                  setActiveTab('discover');
                }}
              />
            )}

            {/* TAB: EXPLORE LANGUAGES */}
            {activeTab === 'languages' && (
              <LanguageExplorerView
                currentLanguage={filters.language}
                onSelectLanguage={handleSelectLanguageFromExplorer}
                repositories={repositories}
              />
            )}

            {/* TAB: BOOKMARKS */}
            {activeTab === 'bookmarks' && (
              <BookmarksView
                bookmarks={bookmarks}
                onRemoveBookmark={removeBookmark}
                onClearAll={clearAllBookmarks}
                onSelectRepo={handleOpenRepoDetails}
                onRefreshBookmarks={reloadBookmarks}
              />
            )}

            {/* TAB: SETTINGS */}
            {activeTab === 'settings' && (
              <SettingsView
                currentRepositories={repositories}
                onDataRefreshNeeded={() => {
                  reEnrich();
                  refresh();
                }}
              />
            )}
          </main>

          {/* Footer */}
          <Footer lastRefreshed={lastRefreshed} />
        </div>
      </div>

      {/* Details Drawer */}
      <RepositoryDetailDrawer
        repository={selectedRepo}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        isBookmarked={selectedRepo ? bookmarkIds.includes(selectedRepo.id) : false}
        onToggleBookmark={toggleBookmark}
      />

      {/* Command Palette (Cmd+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        repositories={repositories}
        onSelectRepo={handleOpenRepoDetails}
        onNavigateTab={handleTabChange}
        onRefresh={refresh}
      />

      {/* Toast Notification Container */}
      <ToastContainer />
    </div>
  );
}
