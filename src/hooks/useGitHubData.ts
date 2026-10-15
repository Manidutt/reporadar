import { useState, useEffect, useCallback, useRef } from 'react';
import { FilterState } from '../types/filters';
import { GitHubRepository } from '../types/github';
import { fetchRepositories, enrichRepositories } from '../services/githubApi';

export function useGitHubData(filters: FilterState) {
  const [repositories, setRepositories] = useState<GitHubRepository[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isRateLimited, setIsRateLimited] = useState<boolean>(false);
  const [rateLimitReset, setRateLimitReset] = useState<number | undefined>(undefined);
  const [lastRefreshed, setLastRefreshed] = useState<number>(Date.now());
  const [error, setError] = useState<string | null>(null);

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadData = useCallback(
    async (isForce = false) => {
      if (isForce) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      try {
        const result = await fetchRepositories(filters, isForce);
        setRepositories(result.repositories);
        setTotalCount(result.totalCount);
        setIsRateLimited(result.isRateLimited);
        setRateLimitReset(result.rateLimitReset);
        setLastRefreshed(result.lastRefreshed);
        setError(result.error || null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch repositories');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [
      filters.period,
      filters.language,
      filters.minStars,
      filters.topic,
      filters.searchQuery,
      filters.sortBy,
      filters.sortOrder,
    ]
  );

  // Trigger fetch with debouncing on search query
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (filters.searchQuery) {
      debounceTimerRef.current = setTimeout(() => {
        loadData(false);
      }, 400);
    } else {
      loadData(false);
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [loadData, filters.searchQuery]);

  // Re-enrich repos without refetching from network if only client snapshot or local sort changed
  const reEnrich = useCallback(() => {
    setRepositories((prev) => enrichRepositories(prev, filters));
  }, [filters]);

  const refresh = useCallback(() => {
    loadData(true);
  }, [loadData]);

  return {
    repositories,
    totalCount,
    isLoading,
    isRefreshing,
    isRateLimited,
    rateLimitReset,
    lastRefreshed,
    error,
    refresh,
    reEnrich,
  };
}
