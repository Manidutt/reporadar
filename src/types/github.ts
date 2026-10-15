export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
    avatar_url: string;
    html_url: string;
    type: string;
  };
  html_url: string;
  description: string | null;
  fork: boolean;
  url: string;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  git_url: string;
  ssh_url: string;
  clone_url: string;
  homepage: string | null;
  size: number;
  stargazers_count: number;
  watchers_count: number;
  language: string | null;
  forks_count: number;
  open_issues_count: number;
  license: {
    key: string;
    name: string;
    spdx_id: string;
    url: string | null;
  } | null;
  topics: string[];
  default_branch: string;
  // Computed & enriched fields
  observedGrowth?: {
    measured: boolean;
    starsGained?: number;
    hoursElapsed?: number;
    velocityPerHour?: number;
    growthPercent?: number;
    baselineTimestamp?: number;
    currentTimestamp?: number;
    historyPoints?: { timestamp: number; stars: number }[];
    isSimulated?: boolean;
  };
  viralScore?: number;
  viralScoreBreakdown?: {
    velocityScore: number;
    freshnessScore: number;
    engagementScore: number;
    growthRateScore: number;
    reasoning: string;
  };
}

export interface GitHubSearchResponse {
  total_count: number;
  incomplete_results: boolean;
  items: GitHubRepository[];
}

export interface GitHubRateLimit {
  limit: number;
  remaining: number;
  reset: number;
  used: number;
  resource: string;
}

export interface RateLimitStatus {
  limit: number;
  remaining: number;
  resetTimestamp: number;
  isAuthenticated: boolean;
  lastChecked: number;
}

export interface ReadmeData {
  content: string; // decoded utf-8 markdown
  download_url: string | null;
  encoding: string;
}
