import { useState, useEffect, useCallback } from 'react';
import {
  getBookmarks,
  toggleBookmark,
  removeBookmark,
  saveBookmarks,
  BookmarkedRepo,
} from '../services/bookmarkStore';
import { GitHubRepository } from '../types/github';
import { useToast } from '../context/ToastContext';

export function useBookmarks() {
  const { success, info } = useToast();
  const [bookmarks, setBookmarks] = useState<BookmarkedRepo[]>([]);

  const reloadBookmarks = useCallback(() => {
    setBookmarks(getBookmarks());
  }, []);

  useEffect(() => {
    reloadBookmarks();
  }, [reloadBookmarks]);

  const toggle = useCallback(
    (repo: GitHubRepository) => {
      const isNowSaved = toggleBookmark(repo);
      reloadBookmarks();
      if (isNowSaved) {
        success('Repository bookmarked', `Saved ${repo.full_name} to your local collection`);
      } else {
        info('Bookmark removed', `Removed ${repo.full_name}`);
      }
    },
    [reloadBookmarks, success, info]
  );

  const remove = useCallback(
    (repoId: number) => {
      removeBookmark(repoId);
      reloadBookmarks();
    },
    [reloadBookmarks]
  );

  const clear = useCallback(() => {
    saveBookmarks([]);
    reloadBookmarks();
  }, [reloadBookmarks]);

  const bookmarkIds = bookmarks.map((b) => b.repo.id);

  return {
    bookmarks,
    bookmarkIds,
    toggleBookmark: toggle,
    removeBookmark: remove,
    clearAllBookmarks: clear,
    reloadBookmarks,
  };
}
