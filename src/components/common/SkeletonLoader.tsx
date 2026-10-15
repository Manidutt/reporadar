import React from 'react';

export const RepositoryCardSkeleton: React.FC = () => {
  return (
    <div className="p-5 rounded-2xl bg-[#12141A] border border-[#232733] animate-pulse flex flex-col justify-between h-[230px]">
      <div>
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5 flex-1">
            <div className="w-8 h-8 rounded-full bg-neutral-800 shrink-0" />
            <div className="h-4 bg-neutral-800 rounded w-1/2" />
          </div>
          <div className="w-6 h-6 rounded bg-neutral-800 shrink-0" />
        </div>
        <div className="space-y-2 mb-4">
          <div className="h-3.5 bg-neutral-800/80 rounded w-full" />
          <div className="h-3.5 bg-neutral-800/60 rounded w-3/4" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          <div className="h-5 w-14 rounded-full bg-neutral-800" />
          <div className="h-5 w-16 rounded-full bg-neutral-800" />
          <div className="h-5 w-12 rounded-full bg-neutral-800" />
        </div>
      </div>
      <div className="pt-3 border-t border-[#232733]/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-4 w-12 bg-neutral-800 rounded" />
          <div className="h-4 w-10 bg-neutral-800 rounded" />
        </div>
        <div className="h-4 w-20 bg-neutral-800 rounded" />
      </div>
    </div>
  );
};

export const RepositoryListItemSkeleton: React.FC = () => {
  return (
    <div className="p-4 rounded-xl bg-[#12141A] border border-[#232733] animate-pulse flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="w-7 h-7 rounded-full bg-neutral-800 shrink-0" />
        <div className="space-y-1.5 flex-1">
          <div className="h-4 bg-neutral-800 rounded w-1/3" />
          <div className="h-3 bg-neutral-800/60 rounded w-2/3" />
        </div>
      </div>
      <div className="flex items-center gap-6 shrink-0">
        <div className="h-4 w-14 bg-neutral-800 rounded hidden sm:block" />
        <div className="h-4 w-14 bg-neutral-800 rounded" />
        <div className="h-4 w-20 bg-neutral-800 rounded hidden md:block" />
        <div className="w-8 h-8 rounded bg-neutral-800" />
      </div>
    </div>
  );
};

export const MetricCardSkeleton: React.FC = () => {
  return (
    <div className="p-4 rounded-xl bg-[#12141A] border border-[#232733] animate-pulse">
      <div className="flex items-center justify-between mb-2">
        <div className="h-3 bg-neutral-800 rounded w-1/3" />
        <div className="w-4 h-4 bg-neutral-800 rounded" />
      </div>
      <div className="h-7 bg-neutral-800 rounded w-1/2 mb-1" />
      <div className="h-2.5 bg-neutral-800/60 rounded w-2/3" />
    </div>
  );
};
