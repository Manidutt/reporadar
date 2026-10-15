import { GitHubRepository } from '../types/github';

const BOOKMARKS_STORAGE_KEY = 'reporadar_bookmarks_v1';

export interface BookmarkedRepo {
  repo: GitHubRepository;
  savedAt: number; // Unix timestamp
  notes?: string;
}

export function getBookmarks(): BookmarkedRepo[] {
  try {
    const raw = localStorage.getItem(BOOKMARKS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load bookmarks from localStorage:', err);
    return [];
  }
}

export function saveBookmarks(bookmarks: BookmarkedRepo[]): void {
  try {
    localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(bookmarks));
  } catch (err) {
    console.error('Failed to save bookmarks to localStorage:', err);
  }
}

export function isBookmarked(repoId: number): boolean {
  const bookmarks = getBookmarks();
  return bookmarks.some((b) => b.repo.id === repoId);
}

export function addBookmark(repo: GitHubRepository): void {
  const bookmarks = getBookmarks();
  if (!bookmarks.some((b) => b.repo.id === repo.id)) {
    bookmarks.unshift({
      repo,
      savedAt: Date.now(),
    });
    saveBookmarks(bookmarks);
  }
}

export function removeBookmark(repoId: number): void {
  const bookmarks = getBookmarks();
  const filtered = bookmarks.filter((b) => b.repo.id !== repoId);
  saveBookmarks(filtered);
}

export function toggleBookmark(repo: GitHubRepository): boolean {
  if (isBookmarked(repo.id)) {
    removeBookmark(repo.id);
    return false;
  } else {
    addBookmark(repo);
    return true;
  }
}

export function exportBookmarksAsJson(): void {
  const bookmarks = getBookmarks();
  const exportPayload = {
    app: 'RepoRadar',
    version: '1.2.0',
    exportDate: new Date().toISOString(),
    totalBookmarks: bookmarks.length,
    bookmarks,
  };

  const jsonStr = JSON.stringify(exportPayload, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `reporadar-bookmarks-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function importBookmarksFromJson(jsonString: string): { success: boolean; count: number; error?: string } {
  try {
    const parsed = JSON.parse(jsonString);
    let itemsToImport: BookmarkedRepo[] = [];

    if (Array.isArray(parsed)) {
      itemsToImport = parsed;
    } else if (parsed && Array.isArray(parsed.bookmarks)) {
      itemsToImport = parsed.bookmarks;
    } else {
      return { success: false, count: 0, error: 'Invalid JSON format: expected list of bookmarks' };
    }

    const currentBookmarks = getBookmarks();
    const existingIds = new Set(currentBookmarks.map((b) => b.repo.id));

    let importedCount = 0;
    for (const item of itemsToImport) {
      if (item && item.repo && item.repo.id && !existingIds.has(item.repo.id)) {
        currentBookmarks.push({
          repo: item.repo,
          savedAt: item.savedAt || Date.now(),
          notes: item.notes,
        });
        existingIds.add(item.repo.id);
        importedCount++;
      }
    }

    saveBookmarks(currentBookmarks);
    return { success: true, count: importedCount };
  } catch (err) {
    return { success: false, count: 0, error: err instanceof Error ? err.message : 'Unknown parsing error' };
  }
}
