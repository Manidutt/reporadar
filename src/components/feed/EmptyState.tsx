import React from 'react';
import { SearchX, RotateCcw } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  onResetFilters?: () => void;
  actionLabel?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No repositories found',
  description = 'Try adjusting your search criteria, ecosystem filters, or star threshold to discover more projects.',
  onResetFilters,
  actionLabel = 'Reset Filters',
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-[24px] bg-white dark:bg-[#1C1C1E] border border-black/[0.04] dark:border-white/[0.06] shadow-sm max-w-md mx-auto my-8">
      <div className="w-14 h-14 rounded-full bg-black/[0.04] dark:bg-white/[0.06] flex items-center justify-center text-[#86868B] mb-4">
        <SearchX className="w-7 h-7 text-[#0071E3] dark:text-[#0A84FF]" />
      </div>
      <h3 className="text-base font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] mb-1.5">{title}</h3>
      <p className="text-xs text-[#86868B] leading-relaxed mb-6 max-w-sm">
        {description}
      </p>
      {onResetFilters && (
        <button
          onClick={onResetFilters}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0071E3] dark:bg-[#0A84FF] hover:opacity-95 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition-all hover:scale-102"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
};
