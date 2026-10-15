import React from 'react';
import { LayoutGrid, List } from 'lucide-react';
import { ViewMode } from '../../types/filters';

interface ViewToggleProps {
  viewMode: ViewMode;
  onChange: (mode: ViewMode) => void;
}

export const ViewToggle: React.FC<ViewToggleProps> = ({ viewMode, onChange }) => {
  return (
    <div
      className="flex items-center p-1 rounded-full bg-black/[0.05] dark:bg-white/[0.08] border border-black/[0.02] dark:border-white/[0.04] shrink-0 select-none"
      role="group"
      aria-label="View layout toggle"
    >
      <button
        onClick={() => onChange('grid')}
        className={`p-1.5 rounded-full transition-all ${
          viewMode === 'grid'
            ? 'bg-white dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-[#F5F5F7] shadow-sm'
            : 'text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white'
        }`}
        title="Grid view"
        aria-label="Grid view"
      >
        <LayoutGrid className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={() => onChange('table')}
        className={`p-1.5 rounded-full transition-all ${
          viewMode === 'table'
            ? 'bg-white dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-[#F5F5F7] shadow-sm'
            : 'text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white'
        }`}
        title="List view"
        aria-label="List view"
      >
        <List className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
