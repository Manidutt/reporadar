import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { GitHubIcon } from '../common/GitHubIcon';

interface FooterProps {
  lastRefreshed: number;
}

export const Footer: React.FC<FooterProps> = ({ lastRefreshed }) => {
  return (
    <footer className="mt-16 border-t border-black/[0.05] dark:border-white/[0.06] py-8 text-xs text-[#86868B] font-sans transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
            <GitHubIcon className="w-4 h-4 text-[#1D1D1F] dark:text-[#F5F5F7]" />
            <span>RepoRadar</span>
          </div>
          <span className="text-[#86868B]/40">•</span>
          <span className="text-[#86868B]">Daily GitHub Viral Repository Discovery</span>
        </div>

        <div className="flex items-center gap-4 text-[11px] text-[#86868B]">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#34C759]" />
            GitHub REST API v3
          </span>
          <span className="text-[#86868B]/40 hidden sm:inline">•</span>
          <span className="hidden sm:inline">
            Updated {new Date(lastRefreshed).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          <span className="text-[#86868B]/40 hidden md:inline">•</span>
          <span className="hidden md:inline">Zero Fabricated Stats</span>
        </div>
      </div>
    </footer>
  );
};
