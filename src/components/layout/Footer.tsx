import React from 'react';
import { ShieldCheck, Heart, ExternalLink, Terminal } from 'lucide-react';
import { GitHubIcon } from '../common/GitHubIcon';

interface FooterProps {
  lastRefreshed: number;
}

export const Footer: React.FC<FooterProps> = ({ lastRefreshed }) => {
  return (
    <footer className="mt-16 border-t border-[#222634] py-8 text-xs text-neutral-400 font-sans transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-semibold text-neutral-300">
            <GitHubIcon className="w-4 h-4 text-white" />
            <span>RepoRadar</span>
          </div>
          <span className="text-neutral-600">•</span>
          <span className="text-neutral-400">Daily GitHub Viral Repository Discovery</span>
        </div>

        <div className="flex items-center gap-4 text-[11px] font-mono text-neutral-400">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Official GitHub REST API v3
          </span>
          <span className="text-neutral-600 hidden sm:inline">•</span>
          <span className="hidden sm:inline">
            Refreshed {new Date(lastRefreshed).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          <span className="text-neutral-600 hidden md:inline">•</span>
          <span className="hidden md:inline">Zero Fabricated Stats</span>
        </div>
      </div>
    </footer>
  );
};
