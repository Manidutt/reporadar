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
  description = 'Try adjusting your search query, language filters, or star threshold to discover more projects.',
  onResetFilters,
  actionLabel = 'Reset all filters',
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl bg-[#12141A] border border-[#232733] max-w-md mx-auto my-8">
      <div className="w-12 h-12 rounded-2xl bg-[#181B24] border border-[#262936] flex items-center justify-center text-neutral-400 mb-4">
        <SearchX className="w-6 h-6 text-indigo-400" />
      </div>
      <h3 className="text-base font-semibold text-white mb-2">{title}</h3>
      <p className="text-xs text-neutral-400 leading-relaxed mb-6">
        {description}
      </p>
      {onResetFilters && (
        <button
          onClick={onResetFilters}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
};
