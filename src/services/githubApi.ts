import { GitHubRepository, GitHubSearchResponse, RateLimitStatus, ReadmeData } from '../types/github';
import { FilterState, TimePeriod } from '../types/filters';
import { recordBatchSnapshots, getGrowthMeasurement } from './snapshotStore';
import { calculateViralScore } from './viralScoring';
import { GENUINE_FALLBACK_REPOSITORIES } from './fallbackData';

const GITHUB_TOKEN_KEY = 'reporadar_github_pat_v1';
const CACHE_PREFIX = 'reporadar_cache_v1_';
const CACHE_TTL_MS = 8 * 60 * 1000; // 8 minutes cache to preserve rate limits

// In-memory rate limit status
let currentRateLimitStatus: RateLimitStatus = {
  limit: 10,
  remaining: 10,
  resetTimestamp: Date.now() + 60 * 1000,
  isAuthenticated: false,
  lastChecked: Date.now(),
};

type RateLimitListener = (status: RateLimitStatus) => void;
const rateLimitListeners = new Set<RateLimitListener>();

export function subscribeToRateLimit(listener: RateLimitListener): () => void {
  rateLimitListeners.add(listener);
  listener(currentRateLimitStatus);
  return () => {
    rateLimitListeners.delete(listener);
  };
}

function notifyRateLimitListeners(status: RateLimitStatus) {
  currentRateLimitStatus = status;
  rateLimitListeners.forEach((l) => l(status));
}

export function getStoredToken(): string {
  try {
    return localStorage.getItem(GITHUB_TOKEN_KEY) || import.meta.env.VITE_GITHUB_TOKEN || '';
  } catch {
    return '';
  }
}

export function setStoredToken(token: string): void {
  try {
    if (token) {
      localStorage.setItem(GITHUB_TOKEN_KEY, token.trim());
    } else {
      localStorage.removeItem(GITHUB_TOKEN_KEY);
    }
  } catch (err) {
    console.error('Failed to store token:', err);
  }
}

function updateRateLimitFromHeaders(headers: Headers, isAuthenticated: boolean) {
  const limitHeader = headers.get('x-ratelimit-limit');
  const remainingHeader = headers.get('x-ratelimit-remaining');
  const resetHeader = headers.get('x-ratelimit-reset');

  if (limitHeader && remainingHeader && resetHeader) {
    const limit = parseInt(limitHeader, 10);
    const remaining = parseInt(remainingHeader, 10);
    const reset = parseInt(resetHeader, 10) * 1000;

    notifyRateLimitListeners({
      limit,
      remaining,
      resetTimestamp: reset,
      isAuthenticated,
      lastChecked: Date.now(),
    });
  }
}

// Helpers for cache
function getCache<T>(key: string): T | null {
  try {
    const item = sessionStorage.getItem(CACHE_PREFIX + key);
    if (!item) return null;
    const { timestamp, data } = JSON.parse(item);
    if (Date.now() - timestamp > CACHE_TTL_MS) {
      sessionStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }
    return data as T;
  } catch {
    return null;
  }
}

function setCache<T>(key: string, data: T): void {
  try {
    sessionStorage.setItem(
      CACHE_PREFIX + key,
      JSON.stringify({
        timestamp: Date.now(),
        data,
      })
    );
  } catch {
    // Session storage quota might be full; ignore gracefully
  }
}

export function clearApiCache(): void {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith(CACHE_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((k) => sessionStorage.removeItem(k));
  } catch (err) {
    console.error('Failed to clear cache:', err);
  }
}

/**
 * Format relative date for GitHub Search qualifier (e.g. 2026-10-14)
 */
function getDateNDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
}

/**
 * Construct transparent GitHub Search query
 */
export function buildSearchQuery(filters: Partial<FilterState>): { query: string; sort: string; order: string } {
  const parts: string[] = [];
  const period = filters.period || 'today';

  // Period activity date window
  if (period === 'today') {
    // Projects active in the last 48 hours
    parts.push(`pushed:>=${getDateNDaysAgo(2)}`);
  } else if (period === 'week') {
    parts.push(`pushed:>=${getDateNDaysAgo(7)}`);
  } else if (period === 'month') {
    parts.push(`pushed:>=${getDateNDaysAgo(30)}`);
  }

  // Minimum stars qualifier
  const minStars = filters.minStars !== undefined ? filters.minStars : 50;
  if (minStars > 0) {
    parts.push(`stars:>=${minStars}`);
  }

  // Language filter
  if (filters.language && filters.language.toLowerCase() !== 'all') {
    parts.push(`language:${encodeURIComponent(filters.language)}`);
  }

  // Topic filter
  if (filters.topic && filters.topic.trim()) {
    parts.push(`topic:${encodeURIComponent(filters.topic.trim().toLowerCase())}`);
  }

  // Keyword search
  if (filters.searchQuery && filters.searchQuery.trim()) {
    parts.push(`${filters.searchQuery.trim()} in:name,description,topics`);
  }

  // GitHub Search API sort parameter
  let sort = 'stars';
  let order = 'desc';

  if (filters.sortBy === 'forks') {
    sort = 'forks';
  } else if (filters.sortBy === 'updated') {
    sort = 'updated';
  } else {
    sort = 'stars';
  }

  return {
    query: parts.join(' '),
    sort,
    order,
  };
}

export interface FetchResult {
  repositories: GitHubRepository[];
  totalCount: number;
  fromCache: boolean;
  isRateLimited: boolean;
  rateLimitReset?: number;
  lastRefreshed: number;
  error?: string;
}

/**
 * Fetch repositories matching criteria from GitHub REST API
 */
export async function fetchRepositories(
  filters: Partial<FilterState>,
  forceRefresh = false
): Promise<FetchResult> {
  const { query, sort, order } = buildSearchQuery(filters);
  const cacheKey = `search_${encodeURIComponent(query)}_${sort}_${order}`;

  if (!forceRefresh) {
    const cached = getCache<FetchResult>(cacheKey);
    if (cached) {
      return { ...cached, fromCache: true };
    }
  }

  const token = getStoredToken();
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(
    query
  )}&sort=${sort}&order=${order}&per_page=30`;

  try {
    const response = await fetch(url, { headers });
    updateRateLimitFromHeaders(response.headers, !!token);

    if (response.status === 403 || response.status === 429) {
      const resetHeader = response.headers.get('x-ratelimit-reset');
      const resetTime = resetHeader ? parseInt(resetHeader, 10) * 1000 : Date.now() + 60000;

      // Rate limited: enrich fallback data so user has immediate high quality dataset
      const enrichedFallback = enrichRepositories(GENUINE_FALLBACK_REPOSITORIES, filters);

      return {
        repositories: enrichedFallback,
        totalCount: enrichedFallback.length,
        fromCache: false,
        isRateLimited: true,
        rateLimitReset: resetTime,
        lastRefreshed: Date.now(),
        error: 'GitHub API rate limit reached. Displaying baseline dataset with growth tracking. Configure a Personal Access Token in Settings to get 5,000 requests/hour.',
      };
    }

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    const data: GitHubSearchResponse = await response.json();

    // Record snapshot baseline for all returned repositories
    recordBatchSnapshots(data.items);

    // Enrich with growth measurements and transparent viral scores
    const enriched = enrichRepositories(data.items, filters);

    const result: FetchResult = {
      repositories: enriched,
      totalCount: data.total_count,
      fromCache: false,
      isRateLimited: false,
      lastRefreshed: Date.now(),
    };

    setCache(cacheKey, result);
    return result;
  } catch (err: unknown) {
    console.warn('GitHub search fetch failed, attempting cache/fallback recovery:', err);

    // Try any stale cache
    const staleCache = getCache<FetchResult>(cacheKey);
    if (staleCache) {
      return {
        ...staleCache,
        fromCache: true,
        error: 'Network connection issue. Displaying cached data.',
      };
    }

    const enrichedFallback = enrichRepositories(GENUINE_FALLBACK_REPOSITORIES, filters);
    const errorMessage = err instanceof Error ? err.message : 'Unknown network failure';
    return {
      repositories: enrichedFallback,
      totalCount: enrichedFallback.length,
      fromCache: false,
      isRateLimited: false,
      lastRefreshed: Date.now(),
      error: `Could not reach GitHub API: ${errorMessage}. Displaying offline baseline catalog.`,
    };
  }
}

/**
 * Enriches repositories with honest growth measurements and transparent viral scores
 */
export function enrichRepositories(
  repos: GitHubRepository[],
  filters?: Partial<FilterState>
): GitHubRepository[] {
  const enriched = repos.map((repo) => {
    const growth = getGrowthMeasurement(repo.id, repo.stargazers_count);
    const viral = calculateViralScore(repo, growth);

    return {
      ...repo,
      observedGrowth: growth,
      viralScore: viral.score,
      viralScoreBreakdown: {
        velocityScore: viral.velocityComponent,
        freshnessScore: viral.freshnessComponent,
        engagementScore: viral.engagementComponent,
        growthRateScore: viral.growthRateComponent,
        reasoning: viral.summary,
      },
    };
  });

  // Apply in-memory sorting if custom sort like viral or growth is selected
  if (filters?.sortBy === 'viral') {
    return enriched.sort((a, b) => (b.viralScore || 0) - (a.viralScore || 0));
  } else if (filters?.sortBy === 'growth') {
    return enriched.sort((a, b) => {
      const growthA = a.observedGrowth?.starsGained || 0;
      const growthB = b.observedGrowth?.starsGained || 0;
      return growthB - growthA;
    });
  }

  return enriched;
}

/**
 * Fetch raw README for a repository
 */
export async function fetchRepositoryReadme(owner: string, repo: string): Promise<ReadmeData | null> {
  const cacheKey = `readme_${owner}_${repo}`;
  const cached = getCache<ReadmeData>(cacheKey);
  if (cached) return cached;

  const token = getStoredToken();
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3.raw',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, {
      headers,
    });

    if (response.status === 404) return null;
    if (!response.ok) throw new Error(`Readme fetch failed: ${response.status}`);

    const text = await response.text();
    const data: ReadmeData = {
      content: text,
      download_url: null,
      encoding: 'utf-8',
    };
    setCache(cacheKey, data);
    return data;
  } catch (err) {
    console.warn(`Could not load readme for ${owner}/${repo}:`, err);
    return null;
  }
}

/**
 * Test a Personal Access Token validity and return user details or rate limit info
 */
export async function validateToken(token: string): Promise<{ valid: boolean; username?: string; error?: string }> {
  try {
    const response = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${token.trim()}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (response.ok) {
      const user = await response.json();
      updateRateLimitFromHeaders(response.headers, true);
      return { valid: true, username: user.login };
    } else if (response.status === 401) {
      return { valid: false, error: 'Invalid token: Bad credentials' };
    } else {
      return { valid: false, error: `Authentication failed (${response.status})` };
    }
  } catch (err) {
    return { valid: false, error: err instanceof Error ? err.message : 'Network failure' };
  }
}
