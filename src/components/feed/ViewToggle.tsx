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
      className="flex items-center p-1 rounded-xl bg-[#141720] border border-[#232733] shrink-0"
      role="group"
      aria-label="View layout toggle"
    >
      <button
        onClick={() => onChange('grid')}
        className={`p-1.5 rounded-lg transition-colors ${
          viewMode === 'grid'
            ? 'bg-indigo-600 text-white shadow-sm'
            : 'text-neutral-400 hover:text-white'
        }`}
        title="Grid view"
        aria-label="Grid view"
      >
        <LayoutGrid className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={() => onChange('table')}
        className={`p-1.5 rounded-lg transition-colors ${
          viewMode === 'table'
            ? 'bg-indigo-600 text-white shadow-sm'
            : 'text-neutral-400 hover:text-white'
        }`}
        title="Compact list view"
        aria-label="Compact list view"
      >
        <List className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
