import React, { useState, useEffect } from 'react';
import {
  KeyRound,
  ShieldCheck,
  ShieldAlert,
  Database,
  Trash2,
  RefreshCw,
  Eye,
  EyeOff,
  Camera,
  Layers,
  Sparkles,
  Info,
  CheckCircle2,
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
  const [authenticatedUser, setAuthenticatedUser] = useState<string | null>(null);

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
      setAuthenticatedUser(null);
      success('Token removed', 'Reverted to unauthenticated GitHub API access (60 req/hr)');
      onDataRefreshNeeded();
      return;
    }

    setIsValidating(true);
    const result = await validateToken(tokenInput);
    setIsValidating(false);

    if (result.valid) {
      setStoredToken(tokenInput);
      setAuthenticatedUser(result.username || null);
      success('Token validated & saved', `Authenticated as @${result.username || 'user'}. Rate limit upgraded to 5,000 req/hr!`);
      onDataRefreshNeeded();
    } else {
      error('Token validation failed', result.error || 'Please check token permissions');
    }
  };

  const handleRemoveToken = () => {
    setStoredToken('');
    setTokenInput('');
    setAuthenticatedUser(null);
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
    success('Search cache cleared', 'Future requests will fetch fresh data from GitHub');
  };

  // Format reset countdown
  const resetMinutes = Math.max(0, Math.ceil((rateLimit.resetTimestamp - Date.now()) / (1000 * 60)));

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#171924] via-[#151722] to-[#12141A] border border-[#2A2E3D]">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 text-xs font-mono font-medium mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Settings & Controls</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            System Configuration
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Manage your GitHub credentials, monitor rate limits, and inspect snapshot growth storage.
          </p>
        </div>
      </div>

      {/* 1. GitHub API & Personal Access Token */}
      <div className="p-6 rounded-2xl bg-[#12141A] border border-[#232733] space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-indigo-400" />
              GitHub Personal Access Token (Optional)
            </h3>
            <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
              GitHub allows 60 public requests/hour without a token. Providing a fine-grained token with public repository read permissions upgrades your limit to <strong>5,000 requests/hour</strong> (and 30 search requests/minute).
            </p>
          </div>

          {rateLimit.isAuthenticated ? (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-mono shrink-0">
              <ShieldCheck className="w-3.5 h-3.5" />
              Authenticated
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full bg-neutral-800 border border-neutral-700 text-neutral-400 text-xs font-mono shrink-0">
              Unauthenticated (60/hr)
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
              className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-[#181B24] border border-[#262936] text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500 font-mono"
            />
            <button
              type="button"
              onClick={() => setShowToken(!showToken)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
            >
              {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <button
            onClick={handleSaveToken}
            disabled={isValidating}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 shrink-0"
          >
            {isValidating && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
            <span>Save & Validate</span>
          </button>

          {tokenInput && (
            <button
              onClick={handleRemoveToken}
              className="px-3 py-2.5 rounded-xl bg-[#1E2230] hover:bg-[#282E40] text-neutral-300 hover:text-white text-xs font-medium transition-colors shrink-0"
            >
              Remove
            </button>
          )}
        </div>

        <div className="p-3 rounded-xl bg-[#181B24]/70 border border-[#262936]/80 flex items-start gap-2.5 text-[11px] text-neutral-400">
          <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <p>
            Your token is stored <strong>exclusively in your browser's local storage</strong>. It is never logged or transmitted anywhere other than direct HTTPS requests to official GitHub API endpoints (<code className="text-neutral-300 font-mono">api.github.com</code>).
          </p>
        </div>
      </div>

      {/* 2. Live Rate Limit Status */}
      <div className="p-6 rounded-2xl bg-[#12141A] border border-[#232733] space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <GitHubIcon className="w-4 h-4 text-neutral-400" />
            Live GitHub Rate Limit
          </h3>
          <span className="text-xs font-mono text-neutral-400">
            Resets in ~{resetMinutes} min
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-3.5 rounded-xl bg-[#181B24] border border-[#262936]">
            <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider block mb-1">
              Remaining Quota
            </span>
            <div className="text-2xl font-bold font-mono text-white">
              {rateLimit.remaining} <span className="text-sm font-normal text-neutral-500">/ {rateLimit.limit}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#181B24] border border-[#262936]">
            <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider block mb-1">
              Reset Epoch
            </span>
            <div className="text-sm font-semibold font-mono text-neutral-200 mt-1">
              {new Date(rateLimit.resetTimestamp).toLocaleTimeString()}
            </div>
            <div className="text-[10px] text-neutral-500 mt-0.5 font-mono">
              Auto-replenishing
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#181B24] border border-[#262936]">
            <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider block mb-1">
              Search API Cache
            </span>
            <div className="text-sm font-semibold text-neutral-200 mt-1 flex items-center justify-between">
              <span>TTL: 8 mins</span>
              <button
                onClick={handleClearCache}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-mono"
              >
                Clear Cache
              </button>
            </div>
            <div className="text-[10px] text-neutral-500 mt-0.5">
              Prevents duplicate API calls
            </div>
          </div>
        </div>
      </div>

      {/* 3. Snapshot Engine Management */}
      <div className="p-6 rounded-2xl bg-[#12141A] border border-[#232733] space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-400" />
              Snapshot Storage & Growth Verification
            </h3>
            <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
              RepoRadar records repository snapshots over time to measure honest star deltas.
              Currently tracking <strong>{snapshotStats.trackedReposCount}</strong> repositories with <strong>{snapshotStats.totalSnapshotsCount}</strong> total observation snapshots.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          <button
            onClick={handleTakeSnapshot}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#181B24] hover:bg-[#202430] border border-[#262936] text-xs font-semibold text-neutral-200 hover:text-white transition-colors"
            title="Record snapshot for currently loaded repositories"
          >
            <Camera className="w-3.5 h-3.5 text-emerald-400" />
            <span>Take Snapshot Now ({currentRepositories.length} repos)</span>
          </button>

          <button
            onClick={handleSimulateHistorical}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600/15 hover:bg-indigo-600/25 border border-indigo-500/30 text-xs font-semibold text-indigo-300 hover:text-white transition-colors"
            title="Generate a simulated 24h baseline snapshot for demonstration and delta verification"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Simulate 24h Baseline (Demo / Test)</span>
          </button>

          {snapshotStats.totalSnapshotsCount > 0 && (
            <button
              onClick={handleClearSnapshots}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-xs font-medium text-rose-400 transition-colors ml-auto"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Snapshots</span>
            </button>
          )}
        </div>
      </div>

      {/* 4. Appearance & Preferences */}
      <div className="p-6 rounded-2xl bg-[#12141A] border border-[#232733] flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-white">Interface Theme</h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            Switch between default dark mode and light theme.
          </p>
        </div>

        <button
          onClick={toggleTheme}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#181B24] border border-[#262936] text-xs font-medium text-white hover:border-neutral-600 transition-colors"
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-4 h-4 text-amber-400" />
              <span>Light Theme</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-indigo-400" />
              <span>Dark Theme</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
