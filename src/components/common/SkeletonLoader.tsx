import React from 'react';

export const RepositoryCardSkeleton: React.FC = () => {
  return (
    <div className="p-5 rounded-[22px] bg-white dark:bg-[#1C1C1E] border border-black/[0.04] dark:border-white/[0.06] shadow-sm animate-pulse flex flex-col justify-between h-[230px]">
      <div>
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5 flex-1">
            <div className="w-9 h-9 rounded-2xl bg-black/[0.06] dark:bg-white/[0.08] shrink-0" />
            <div className="h-4 bg-black/[0.06] dark:bg-white/[0.08] rounded-full w-1/2" />
          </div>
          <div className="w-7 h-7 rounded-full bg-black/[0.06] dark:bg-white/[0.08] shrink-0" />
        </div>
        <div className="space-y-2 mb-4">
          <div className="h-3.5 bg-black/[0.06] dark:bg-white/[0.08] rounded-full w-full" />
          <div className="h-3.5 bg-black/[0.04] dark:bg-white/[0.05] rounded-full w-3/4" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          <div className="h-5 w-14 rounded-full bg-black/[0.05] dark:bg-white/[0.07]" />
          <div className="h-5 w-16 rounded-full bg-black/[0.05] dark:bg-white/[0.07]" />
        </div>
      </div>
      <div className="pt-3 border-t border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-4 w-12 bg-black/[0.06] dark:bg-white/[0.08] rounded-full" />
          <div className="h-4 w-10 bg-black/[0.06] dark:bg-white/[0.08] rounded-full" />
        </div>
        <div className="h-4 w-16 bg-black/[0.06] dark:bg-white/[0.08] rounded-full" />
      </div>
    </div>
  );
};

export const RepositoryListItemSkeleton: React.FC = () => {
  return (
    <div className="p-4 rounded-2xl bg-white dark:bg-[#1C1C1E] border border-black/[0.04] dark:border-white/[0.06] shadow-xs animate-pulse flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="w-8 h-8 rounded-xl bg-black/[0.06] dark:bg-white/[0.08] shrink-0" />
        <div className="space-y-1.5 flex-1">
          <div className="h-4 bg-black/[0.06] dark:bg-white/[0.08] rounded-full w-1/3" />
          <div className="h-3 bg-black/[0.04] dark:bg-white/[0.05] rounded-full w-2/3" />
        </div>
      </div>
      <div className="flex items-center gap-6 shrink-0">
        <div className="h-4 w-14 bg-black/[0.06] dark:bg-white/[0.08] rounded-full hidden sm:block" />
        <div className="h-4 w-14 bg-black/[0.06] dark:bg-white/[0.08] rounded-full" />
        <div className="w-7 h-7 rounded-full bg-black/[0.06] dark:bg-white/[0.08]" />
      </div>
    </div>
  );
};

export const MetricCardSkeleton: React.FC = () => {
  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-[#1C1C1E] border border-black/[0.04] dark:border-white/[0.06] shadow-sm animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="h-3 bg-black/[0.06] dark:bg-white/[0.08] rounded-full w-1/3" />
        <div className="w-8 h-8 rounded-full bg-black/[0.06] dark:bg-white/[0.08]" />
      </div>
      <div className="h-8 bg-black/[0.06] dark:bg-white/[0.08] rounded-full w-1/2 mb-2" />
      <div className="h-2.5 bg-black/[0.04] dark:bg-white/[0.05] rounded-full w-2/3" />
    </div>
  );
};
