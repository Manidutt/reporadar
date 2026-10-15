import React, { useState, useEffect } from 'react';
import {
  KeyRound,
  ShieldCheck,
  Database,
  Trash2,
  RefreshCw,
  Eye,
  EyeOff,
  Camera,
  Sparkles,
  Info,
  Moon,
  Sun,
} from 'lucide-react';
import { GitHubIcon } from '../common/GitHubIcon';
import {
  getStoredToken,
  setStoredToken,
  validateToken,
  clearApiCache,
  subscribeToRateLimit,
} from '../../services/githubApi';
import {
  getSnapshotStats,
  recordBatchSnapshots,
  clearAllSnapshots,
  simulatePreviousSnapshotForTesting,
} from '../../services/snapshotStore';
import { GitHubRepository, RateLimitStatus } from '../../types/github';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/ThemeContext';

interface SettingsViewProps {
  currentRepositories: GitHubRepository[];
  onDataRefreshNeeded: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentRepositories,
  onDataRefreshNeeded,
}) => {
  const { success, error, info } = useToast();
  const { theme, toggleTheme } = useTheme();

  const [tokenInput, setTokenInput] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  const [rateLimit, setRateLimit] = useState<RateLimitStatus>({
    limit: 10,
    remaining: 10,
    resetTimestamp: Date.now() + 60000,
    isAuthenticated: false,
    lastChecked: Date.now(),
  });

  const [snapshotStats, setSnapshotStats] = useState({
    trackedReposCount: 0,
    totalSnapshotsCount: 0,
  });

  useEffect(() => {
    const existing = getStoredToken();
    if (existing) {
      setTokenInput(existing);
    }
    setSnapshotStats(getSnapshotStats());

    const unsubscribe = subscribeToRateLimit(setRateLimit);
    return unsubscribe;
  }, []);

  const handleSaveToken = async () => {
    if (!tokenInput.trim()) {
      setStoredToken('');
      success('Token removed', 'Reverted to unauthenticated GitHub API access (60 req/hr)');
      onDataRefreshNeeded();
      return;
    }

    setIsValidating(true);
    const result = await validateToken(tokenInput);
    setIsValidating(false);

    if (result.valid) {
      setStoredToken(tokenInput);
      success('Token saved', `Authenticated as @${result.username || 'user'}. Rate limit upgraded to 5,000 req/hr!`);
      onDataRefreshNeeded();
    } else {
      error('Token validation failed', result.error || 'Please check token permissions');
    }
  };

  const handleRemoveToken = () => {
    setStoredToken('');
    setTokenInput('');
    success('Token removed');
    onDataRefreshNeeded();
  };

  const handleTakeSnapshot = () => {
    if (currentRepositories.length === 0) {
      info('No repositories loaded to snapshot');
      return;
    }
    recordBatchSnapshots(currentRepositories);
    setSnapshotStats(getSnapshotStats());
    success('Snapshot recorded', `Saved baseline observation for ${currentRepositories.length} repositories`);
    onDataRefreshNeeded();
  };

  const handleSimulateHistorical = () => {
    if (currentRepositories.length === 0) {
      info('Load repositories before generating demo snapshots');
      return;
    }
    simulatePreviousSnapshotForTesting(currentRepositories);
    setSnapshotStats(getSnapshotStats());
    success(
      'Demo baseline created',
      'Created a 24-hour previous snapshot baseline. You can now view observed growth badges and chart deltas!'
    );
    onDataRefreshNeeded();
  };

  const handleClearSnapshots = () => {
    if (confirm('Clear all snapshot observations from storage?')) {
      clearAllSnapshots();
      setSnapshotStats(getSnapshotStats());
      success('Snapshots cleared', 'Tracking baselines reset');
      onDataRefreshNeeded();
    }
  };

  const handleClearCache = () => {
    clearApiCache();
    success('Search cache cleared', 'Next requests will query GitHub freshly');
  };

  const resetMinutes = Math.max(0, Math.ceil((rateLimit.resetTimestamp - Date.now()) / (1000 * 60)));

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="p-7 rounded-[26px] bg-white dark:bg-[#1C1C1E] border border-black/[0.04] dark:border-white/[0.06] shadow-sm">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0071E3]/10 dark:bg-[#0A84FF]/20 text-[#0071E3] dark:text-[#0A84FF] text-xs font-semibold mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>macOS Preferences</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
            Settings
          </h2>
          <p className="text-xs sm:text-sm text-[#86868B] mt-1.5">
            Configure GitHub API tokens, monitor rate limit quotas, and manage local snapshot growth observations.
          </p>
        </div>
      </div>

      {/* 1. GitHub API & Personal Access Token */}
      <div className="p-6 rounded-[22px] bg-white dark:bg-[#1C1C1E] border border-black/[0.04] dark:border-white/[0.06] shadow-sm space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-[#0071E3] dark:text-[#0A84FF]" />
              GitHub Personal Access Token (Optional)
            </h3>
            <p className="text-xs text-[#86868B] mt-1 leading-relaxed">
              GitHub provides 60 public requests/hour unauthenticated. Supplying a free personal access token with public read permissions elevates your limit to <strong>5,000 requests/hour</strong>.
            </p>
          </div>

          {rateLimit.isAuthenticated ? (
            <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#34C759]/15 text-[#28A745] dark:text-[#30D158] text-xs font-semibold shrink-0">
              <ShieldCheck className="w-3.5 h-3.5" />
              Authenticated
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full bg-black/[0.05] dark:bg-white/[0.08] text-[#86868B] text-xs font-medium shrink-0">
              Public (60/hr)
            </span>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative flex-1">
            <input
              type={showToken ? 'text' : 'password'}
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="github_pat_... or ghp_..."
              className="w-full pl-4 pr-10 py-2.5 rounded-full bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.08] text-xs text-[#1D1D1F] dark:text-[#F5F5F7] placeholder-[#86868B] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/30 font-mono"
            />
            <button
              type="button"
              onClick={() => setShowToken(!showToken)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white"
            >
              {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <button
            onClick={handleSaveToken}
            disabled={isValidating}
            className="px-5 py-2.5 rounded-full bg-[#0071E3] dark:bg-[#0A84FF] hover:opacity-95 disabled:opacity-50 text-white text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-2 shrink-0"
          >
            {isValidating && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
            <span>Save & Verify</span>
          </button>

          {tokenInput && (
            <button
              onClick={handleRemoveToken}
              className="px-4 py-2.5 rounded-full bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white text-xs font-medium transition-colors shrink-0"
            >
              Remove
            </button>
          )}
        </div>

        <div className="p-3.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.05] flex items-start gap-2.5 text-xs text-[#86868B]">
          <Info className="w-4 h-4 text-[#0071E3] dark:text-[#0A84FF] shrink-0 mt-0.5" />
          <p>
            Your token is stored <strong>locally in your browser's private storage</strong>. It is only sent over HTTPS to GitHub API endpoints (<code className="font-mono text-[#1D1D1F] dark:text-[#F5F5F7]">api.github.com</code>).
          </p>
        </div>
      </div>

      {/* 2. Live Rate Limit Status */}
      <div className="p-6 rounded-[22px] bg-white dark:bg-[#1C1C1E] border border-black/[0.04] dark:border-white/[0.06] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] flex items-center gap-2">
            <GitHubIcon className="w-4 h-4 text-[#86868B]" />
            Live GitHub Quota
          </h3>
          <span className="text-xs text-[#86868B]">
            Refills in ~{resetMinutes} min
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-[#F5F5F7] dark:bg-[#2C2C2E] border border-black/[0.03] dark:border-white/[0.05]">
            <span className="text-[11px] text-[#86868B] uppercase tracking-wider block mb-1">
              Remaining
            </span>
            <div className="text-2xl font-bold font-mono text-[#1D1D1F] dark:text-[#F5F5F7]">
              {rateLimit.remaining} <span className="text-sm font-normal text-[#86868B]">/ {rateLimit.limit}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#F5F5F7] dark:bg-[#2C2C2E] border border-black/[0.03] dark:border-white/[0.05]">
            <span className="text-[11px] text-[#86868B] uppercase tracking-wider block mb-1">
              Reset Epoch
            </span>
            <div className="text-sm font-semibold font-mono text-[#1D1D1F] dark:text-[#F5F5F7] mt-1">
              {new Date(rateLimit.resetTimestamp).toLocaleTimeString()}
            </div>
            <div className="text-[11px] text-[#86868B] mt-0.5">
              Auto-replenishing
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#F5F5F7] dark:bg-[#2C2C2E] border border-black/[0.03] dark:border-white/[0.05]">
            <span className="text-[11px] text-[#86868B] uppercase tracking-wider block mb-1">
              Cache Storage
            </span>
            <div className="text-sm font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] mt-1 flex items-center justify-between">
              <span>TTL: 8 mins</span>
              <button
                onClick={handleClearCache}
                className="text-xs text-[#0071E3] dark:text-[#0A84FF] hover:underline"
              >
                Clear
              </button>
            </div>
            <div className="text-[11px] text-[#86868B] mt-0.5">
              Avoids duplicate queries
            </div>
          </div>
        </div>
      </div>

      {/* 3. Snapshot Engine Management */}
      <div className="p-6 rounded-[22px] bg-white dark:bg-[#1C1C1E] border border-black/[0.04] dark:border-white/[0.06] shadow-sm space-y-4">
        <div>
          <h3 className="text-base font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] flex items-center gap-2">
            <Database className="w-4 h-4 text-[#34C759]" />
            Snapshot Growth Store
          </h3>
          <p className="text-xs text-[#86868B] mt-1 leading-relaxed">
            RepoRadar records snapshots over time to measure honest star gains. Currently tracking <strong>{snapshotStats.trackedReposCount}</strong> repositories with <strong>{snapshotStats.totalSnapshotsCount}</strong> observation snapshots.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          <button
            onClick={handleTakeSnapshot}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/[0.04] dark:bg-white/[0.08] hover:bg-black/[0.08] dark:hover:bg-white/[0.12] text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] transition-all"
            title="Record current snapshot"
          >
            <Camera className="w-3.5 h-3.5 text-[#34C759]" />
            <span>Record Snapshot ({currentRepositories.length} repos)</span>
          </button>

          <button
            onClick={handleSimulateHistorical}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#0071E3]/10 dark:bg-[#0A84FF]/20 hover:bg-[#0071E3]/15 text-xs font-semibold text-[#0071E3] dark:text-[#0A84FF] transition-all"
            title="Simulate 24h previous baseline for test evaluation"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Simulate 24h Baseline (Demo / Test)</span>
          </button>

          {snapshotStats.totalSnapshotsCount > 0 && (
            <button
              onClick={handleClearSnapshots}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#FF3B30]/10 hover:bg-[#FF3B30]/20 text-xs font-semibold text-[#FF3B30] transition-colors ml-auto"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Snapshots</span>
            </button>
          )}
        </div>
      </div>

      {/* 4. Appearance Toggle */}
      <div className="p-6 rounded-[22px] bg-white dark:bg-[#1C1C1E] border border-black/[0.04] dark:border-white/[0.06] shadow-sm flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">Appearance</h3>
          <p className="text-xs text-[#86868B] mt-0.5">
            Switch between Apple Light and Dark modes.
          </p>
        </div>

        <button
          onClick={toggleTheme}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/[0.05] dark:bg-white/[0.08] text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-black/[0.08] dark:hover:bg-white/[0.12] transition-colors"
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-4 h-4 text-[#FF9500]" />
              <span>Apple Light</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-[#0071E3]" />
              <span>Apple Dark</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
