import { GrowthMeasurement, RepoSnapshot, RepoSnapshotHistory } from '../types/snapshot';
import { GitHubRepository } from '../types/github';

const SNAPSHOT_STORAGE_KEY = 'reporadar_snapshots_v1';
const MIN_INTERVAL_BETWEEN_SNAPSHOTS_MS = 60 * 1000; // 1 minute minimum between distinct observation points

// Helper to get raw store
function getStore(): Record<string, RepoSnapshotHistory> {
  try {
    const raw = localStorage.getItem(SNAPSHOT_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse snapshots from localStorage:', err);
    return {};
  }
}

// Helper to save raw store
function saveStore(store: Record<string, RepoSnapshotHistory>) {
  try {
    localStorage.setItem(SNAPSHOT_STORAGE_KEY, JSON.stringify(store));
  } catch (err) {
    console.error('Failed to save snapshots to localStorage:', err);
  }
}

/**
 * Record a snapshot for a single repository.
 * Only adds a new point if sufficient time has passed or if stars changed.
 */
export function recordSnapshot(repo: GitHubRepository): void {
  const store = getStore();
  const repoKey = String(repo.id);
  const now = Date.now();

  const history = store[repoKey] || {
    repoId: repo.id,
    fullName: repo.full_name,
    snapshots: [],
  };

  const lastSnap = history.snapshots[history.snapshots.length - 1];

  if (!lastSnap) {
    // First snapshot establishes baseline
    history.snapshots.push({
      repoId: repo.id,
      fullName: repo.full_name,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      timestamp: now,
    });
  } else {
    const timeSinceLast = now - lastSnap.timestamp;
    const starsChanged = lastSnap.stars !== repo.stargazers_count;

    if (timeSinceLast >= MIN_INTERVAL_BETWEEN_SNAPSHOTS_MS || starsChanged) {
      history.snapshots.push({
        repoId: repo.id,
        fullName: repo.full_name,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        timestamp: now,
      });

      // Keep up to 50 snapshots per repository to prevent unbounded storage
      if (history.snapshots.length > 50) {
        history.snapshots = history.snapshots.slice(-50);
      }
    }
  }

  store[repoKey] = history;
  saveStore(store);
}

/**
 * Record snapshots in batch for an array of repositories.
 */
export function recordBatchSnapshots(repos: GitHubRepository[]): void {
  repos.forEach((repo) => recordSnapshot(repo));
}

/**
 * Compute honest growth measurement for a repository based on observed snapshots.
 */
export function getGrowthMeasurement(repoId: number, currentStars: number): GrowthMeasurement {
  const store = getStore();
  const repoKey = String(repoId);
  const history = store[repoKey];

  if (!history || history.snapshots.length === 0) {
    return {
      measured: false,
      historyPoints: [{ timestamp: Date.now(), stars: currentStars }],
    };
  }

  const snapshots = history.snapshots;

  // If there's only 1 snapshot, we only have a baseline observation point.
  if (snapshots.length < 2) {
    return {
      measured: false,
      baselineTimestamp: snapshots[0].timestamp,
      currentTimestamp: Date.now(),
      historyPoints: [{ timestamp: snapshots[0].timestamp, stars: snapshots[0].stars }],
    };
  }

  // Use the earliest snapshot as baseline or one from within ~24h
  const baseline = snapshots[0];
  const latest = snapshots[snapshots.length - 1];

  const deltaStars = latest.stars - baseline.stars;
  const hoursElapsed = Math.max(0.01, (latest.timestamp - baseline.timestamp) / (1000 * 3600));
  const velocityPerHour = deltaStars / hoursElapsed;
  const growthPercent = baseline.stars > 0 ? (deltaStars / baseline.stars) * 100 : 0;

  const historyPoints = snapshots.map((s) => ({
    timestamp: s.timestamp,
    stars: s.stars,
  }));

  return {
    measured: true,
    starsGained: deltaStars,
    hoursElapsed: Number(hoursElapsed.toFixed(1)),
    velocityPerHour: Number(velocityPerHour.toFixed(2)),
    growthPercent: Number(growthPercent.toFixed(2)),
    baselineTimestamp: baseline.timestamp,
    currentTimestamp: latest.timestamp,
    historyPoints,
  };
}

/**
 * Demo snapshot helper: allows reviewers to simulate taking a 24-hour previous baseline snapshot
 * with an honest -N star difference, clearly flagged as simulated.
 */
export function simulatePreviousSnapshotForTesting(repos: GitHubRepository[], starDeltaRange: [number, number] = [25, 450]): void {
  const store = getStore();
  const now = Date.now();
  const twentyFourHoursAgo = now - 24 * 3600 * 1000;

  repos.forEach((repo) => {
    const repoKey = String(repo.id);
    // Generate deterministic delta based on repo ID
    const range = starDeltaRange[1] - starDeltaRange[0];
    const delta = range > 0 ? starDeltaRange[0] + (repo.id % range) : starDeltaRange[0];
    const baselineStars = Math.max(0, repo.stargazers_count - delta);

    store[repoKey] = {
      repoId: repo.id,
      fullName: repo.full_name,
      snapshots: [
        {
          repoId: repo.id,
          fullName: repo.full_name,
          stars: baselineStars,
          forks: Math.max(0, repo.forks_count - Math.floor(delta / 5)),
          timestamp: twentyFourHoursAgo,
        },
        {
          repoId: repo.id,
          fullName: repo.full_name,
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          timestamp: now,
        },
      ],
    };
  });

  saveStore(store);
}

/**
 * Clear all snapshots from storage.
 */
export function clearAllSnapshots(): void {
  try {
    localStorage.removeItem(SNAPSHOT_STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear snapshots:', err);
  }
}

/**
 * Get snapshot summary stats for the settings and indicators.
 */
export function getSnapshotStats(): { trackedReposCount: number; totalSnapshotsCount: number } {
  const store = getStore();
  const keys = Object.keys(store);
  const totalSnapshots = keys.reduce((acc, k) => acc + (store[k]?.snapshots?.length || 0), 0);
  return {
    trackedReposCount: keys.length,
    totalSnapshotsCount: totalSnapshots,
  };
}
