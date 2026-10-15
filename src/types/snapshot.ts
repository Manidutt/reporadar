export interface RepoSnapshot {
  repoId: number;
  fullName: string;
  stars: number;
  forks: number;
  timestamp: number; // Unix timestamp in milliseconds
}

export interface RepoSnapshotHistory {
  repoId: number;
  fullName: string;
  snapshots: RepoSnapshot[];
}

export interface GrowthMeasurement {
  measured: boolean;
  starsGained?: number;
  hoursElapsed?: number;
  velocityPerHour?: number;
  growthPercent?: number;
  baselineTimestamp?: number;
  currentTimestamp?: number;
  historyPoints: { timestamp: number; stars: number }[];
  isSimulated?: boolean;
}
