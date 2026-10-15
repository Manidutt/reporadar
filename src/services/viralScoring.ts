import { GitHubRepository } from '../types/github';
import { GrowthMeasurement } from '../types/snapshot';

export interface ViralScoreBreakdown {
  score: number; // 0 - 100
  isMeasuredGrowth: boolean;
  velocityComponent: number;
  freshnessComponent: number;
  engagementComponent: number;
  growthRateComponent: number;
  summary: string;
  signals: {
    label: string;
    value: string;
    impact: 'high' | 'medium' | 'neutral';
  }[];
}

/**
 * Calculate a transparent, defensible Viral Score (0-100)
 */
export function calculateViralScore(
  repo: GitHubRepository,
  growth: GrowthMeasurement
): ViralScoreBreakdown {
  const now = Date.now();
  const createdAt = new Date(repo.created_at).getTime();
  const pushedAt = new Date(repo.pushed_at).getTime();

  const daysSinceCreation = Math.max(1, (now - createdAt) / (1000 * 3600 * 24));
  const hoursSincePushed = Math.max(0.1, (now - pushedAt) / (1000 * 3600));

  // Signal 1: Engagement ratio (forks / stars)
  // Healthy active developer ratio is usually 5% - 20%
  const forkRatio = repo.stargazers_count > 0 ? repo.forks_count / repo.stargazers_count : 0;
  const engagementComponent = Math.min(100, Math.round(Math.min(forkRatio * 300, 100)));

  // Signal 2: Push recency
  // Pushed within last 6 hours = 100, within 24 hours = 80, within 3 days = 50, etc.
  let pushScore = 20;
  if (hoursSincePushed <= 6) pushScore = 100;
  else if (hoursSincePushed <= 24) pushScore = 85;
  else if (hoursSincePushed <= 72) pushScore = 65;
  else if (hoursSincePushed <= 168) pushScore = 40;

  // Signal 3: Creation freshness & daily star velocity since birth
  // Repos created recently gaining high stars show rapid breakout momentum
  const lifetimeVelocity = repo.stargazers_count / daysSinceCreation; // stars per day
  let freshnessComponent = 0;
  if (daysSinceCreation <= 30) {
    freshnessComponent = Math.min(100, Math.round(lifetimeVelocity * 4));
  } else if (daysSinceCreation <= 90) {
    freshnessComponent = Math.min(80, Math.round(lifetimeVelocity * 2));
  } else {
    freshnessComponent = Math.min(50, Math.round(lifetimeVelocity * 0.5));
  }

  // Case A: Measured growth is available from snapshots
  if (growth.measured && growth.starsGained !== undefined && growth.hoursElapsed !== undefined) {
    const starsGained = Math.max(0, growth.starsGained);
    const velocityPerHour = growth.velocityPerHour || 0;

    // Normalize velocity (e.g. 5 stars/hr = ~60 pts, 20 stars/hr = 100 pts)
    const velocityComponent = Math.min(100, Math.round(velocityPerHour * 5));

    // Percentage growth relative to baseline
    const growthPercent = growth.growthPercent || 0;
    const growthRateComponent = Math.min(100, Math.round(growthPercent * 8));

    // Weighted composite score (measured growth has high confidence)
    const totalScore = Math.min(
      99,
      Math.max(
        10,
        Math.round(
          velocityComponent * 0.40 +
            growthRateComponent * 0.25 +
            engagementComponent * 0.15 +
            pushScore * 0.10 +
            freshnessComponent * 0.10
        )
      )
    );

    return {
      score: totalScore,
      isMeasuredGrowth: true,
      velocityComponent,
      freshnessComponent,
      engagementComponent,
      growthRateComponent,
      summary: `Verified +${starsGained} stars over ${growth.hoursElapsed}h (${velocityPerHour.toFixed(1)} stars/hr)`,
      signals: [
        {
          label: 'Observed Gain',
          value: `+${starsGained} stars`,
          impact: starsGained > 50 ? 'high' : 'medium',
        },
        {
          label: 'Velocity',
          value: `${velocityPerHour.toFixed(1)}/hr`,
          impact: velocityPerHour > 5 ? 'high' : 'medium',
        },
        {
          label: 'Fork Ratio',
          value: `${(forkRatio * 100).toFixed(1)}%`,
          impact: forkRatio > 0.1 ? 'high' : 'neutral',
        },
        {
          label: 'Recent Push',
          value: hoursSincePushed < 24 ? `${Math.round(hoursSincePushed)}h ago` : `${Math.round(hoursSincePushed / 24)}d ago`,
          impact: hoursSincePushed < 24 ? 'high' : 'neutral',
        },
      ],
    };
  }

  // Case B: No verified delta snapshots yet — transparent creation momentum
  // Emphasizes creation velocity and push activity, clearly marked as unverified snapshot growth
  const creationScore = Math.min(
    95,
    Math.max(
      15,
      Math.round(
        freshnessComponent * 0.50 +
          pushScore * 0.25 +
          engagementComponent * 0.25
      )
    )
  );

  return {
    score: creationScore,
    isMeasuredGrowth: false,
    velocityComponent: 0,
    freshnessComponent,
    engagementComponent,
    growthRateComponent: 0,
    summary: daysSinceCreation <= 60
      ? `Breakout momentum: ~${Math.round(lifetimeVelocity)} stars/day since creation (${Math.round(daysSinceCreation)}d old)`
      : `Active project with sustained momentum (${Math.round(lifetimeVelocity)} avg stars/day)`,
    signals: [
      {
        label: 'Lifetime Pace',
        value: `~${Math.round(lifetimeVelocity)} stars/day`,
        impact: lifetimeVelocity > 30 ? 'high' : 'medium',
      },
      {
        label: 'Age',
        value: `${Math.round(daysSinceCreation)} days`,
        impact: daysSinceCreation <= 30 ? 'high' : 'neutral',
      },
      {
        label: 'Fork Ratio',
        value: `${(forkRatio * 100).toFixed(1)}%`,
        impact: forkRatio > 0.08 ? 'medium' : 'neutral',
      },
      {
        label: 'Status',
        value: 'Baseline initialized',
        impact: 'neutral',
      },
    ],
  };
}
