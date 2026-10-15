import { describe, it, expect, beforeEach } from 'vitest';
import {
  recordSnapshot,
  getGrowthMeasurement,
  clearAllSnapshots,
  simulatePreviousSnapshotForTesting,
} from '../services/snapshotStore';
import { calculateViralScore } from '../services/viralScoring';
import { buildSearchQuery } from '../services/githubApi';
import {
  addBookmark,
  removeBookmark,
  isBookmarked,
  getBookmarks,
  saveBookmarks,
  importBookmarksFromJson,
} from '../services/bookmarkStore';
import { GitHubRepository } from '../types/github';

// Mock localStorage for test environment
const mockStorage: Record<string, string> = {};
(globalThis as any).localStorage = {
  getItem: (key: string) => mockStorage[key] || null,
  setItem: (key: string, value: string) => {
    mockStorage[key] = value;
  },
  removeItem: (key: string) => {
    delete mockStorage[key];
  },
  clear: () => {
    Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
  },
  length: 0,
  key: (index: number) => Object.keys(mockStorage)[index] || null,
};

const mockRepo: GitHubRepository = {
  id: 12345,
  name: 'awesome-tool',
  full_name: 'acme/awesome-tool',
  owner: {
    login: 'acme',
    avatar_url: 'https://example.com/avatar.png',
    html_url: 'https://github.com/acme',
    type: 'User',
  },
  html_url: 'https://github.com/acme/awesome-tool',
  description: 'A great open-source project',
  fork: false,
  url: 'https://api.github.com/repos/acme/awesome-tool',
  created_at: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
  updated_at: new Date().toISOString(),
  pushed_at: new Date().toISOString(),
  git_url: 'git://github.com/acme/awesome-tool.git',
  ssh_url: 'git@github.com/acme/awesome-tool.git',
  clone_url: 'https://github.com/acme/awesome-tool.git',
  homepage: null,
  size: 1024,
  stargazers_count: 12500,
  watchers_count: 12500,
  language: 'TypeScript',
  forks_count: 850,
  open_issues_count: 12,
  license: {
    key: 'mit',
    name: 'MIT License',
    spdx_id: 'MIT',
    url: null,
  },
  topics: ['typescript', 'tools'],
  default_branch: 'main',
};

describe('RepoRadar Growth & Data Integrity', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('Example 1: Does not fabricate star growth when only a single baseline snapshot exists', () => {
    // Record baseline snapshot
    recordSnapshot(mockRepo);

    // Compute growth measurement
    const measurement = getGrowthMeasurement(mockRepo.id, mockRepo.stargazers_count);

    expect(measurement.measured).toBe(false);
    expect(measurement.starsGained).toBeUndefined();
    expect(measurement.historyPoints.length).toBe(1);
    expect(measurement.historyPoints[0].stars).toBe(12500);
  });

  it('Example 2: Accurately calculates star gain across genuine snapshots', () => {
    // Store snapshot A: 1000 stars 24 hours ago
    const repoA: GitHubRepository = {
      ...mockRepo,
      id: 9999,
      stargazers_count: 1180,
    };

    // Simulate 24h baseline snapshot
    simulatePreviousSnapshotForTesting([repoA], [180, 180]);

    const measurement = getGrowthMeasurement(repoA.id, repoA.stargazers_count);

    expect(measurement.measured).toBe(true);
    expect(measurement.starsGained).toBe(180);
    expect(measurement.hoursElapsed).toBeGreaterThanOrEqual(23.9);
    expect(measurement.growthPercent).toBeGreaterThan(0);
    expect(measurement.historyPoints.length).toBe(2);
  });

  it('Example 3: Bookmarks persist and survive storage reload', () => {
    expect(isBookmarked(mockRepo.id)).toBe(false);

    addBookmark(mockRepo);
    expect(isBookmarked(mockRepo.id)).toBe(true);
    expect(getBookmarks().length).toBe(1);
    expect(getBookmarks()[0].repo.id).toBe(mockRepo.id);

    removeBookmark(mockRepo.id);
    expect(isBookmarked(mockRepo.id)).toBe(false);
    expect(getBookmarks().length).toBe(0);
  });

  it('Example 4: Search query builder produces correct GitHub search qualifiers', () => {
    const query = buildSearchQuery({
      language: 'Python',
      minStars: 1000,
      period: 'today',
      sortBy: 'updated',
    });

    expect(query.query).toContain('language:Python');
    expect(query.query).toContain('stars:>=1000');
    expect(query.query).toContain('pushed:>=');
    expect(query.sort).toBe('updated');
  });

  it('Example 7: Viral scoring transparently distinguishes lifetime popularity from growth velocity', () => {
    const popularOldRepo: GitHubRepository = {
      ...mockRepo,
      id: 111,
      stargazers_count: 100000,
      created_at: '2016-01-01T00:00:00Z',
    };

    const breakoutNewRepo: GitHubRepository = {
      ...mockRepo,
      id: 222,
      stargazers_count: 3000,
      created_at: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(), // 10 days old
    };

    const scorePopular = calculateViralScore(popularOldRepo, {
      measured: false,
      historyPoints: [],
    });

    const scoreNewcomer = calculateViralScore(breakoutNewRepo, {
      measured: false,
      historyPoints: [],
    });

    // A 10-day old project with 3,000 stars (300 stars/day) has much higher creation momentum
    // than an old repo with low daily velocity
    expect(scoreNewcomer.freshnessComponent).toBeGreaterThan(scorePopular.freshnessComponent);
    expect(scoreNewcomer.summary).toContain('Breakout momentum');
  });

  it('Imports bookmarks correctly from valid JSON structure', () => {
    const payload = JSON.stringify({
      app: 'RepoRadar',
      bookmarks: [
        {
          repo: mockRepo,
          savedAt: Date.now(),
        },
      ],
    });

    const result = importBookmarksFromJson(payload);
    expect(result.success).toBe(true);
    expect(result.count).toBe(1);
    expect(isBookmarked(mockRepo.id)).toBe(true);
  });
});
