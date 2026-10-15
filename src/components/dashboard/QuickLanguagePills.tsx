import React from 'react';
import { POPULAR_LANGUAGES } from '../../utils/languages';

interface QuickLanguagePillsProps {
  selectedLanguage: string;
  onSelectLanguage: (language: string) => void;
  availableCounts?: Record<string, number>;
}

export const QuickLanguagePills: React.FC<QuickLanguagePillsProps> = ({
  selectedLanguage,
  onSelectLanguage,
  availableCounts = {},
}) => {
  const languagesToShow = POPULAR_LANGUAGES.slice(0, 9);

  return (
    <div
      className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs select-none"
      role="group"
      aria-label="Filter by programming language"
    >
      <button
        onClick={() => onSelectLanguage('all')}
        className={`px-3.5 py-1.5 rounded-full text-xs font-medium shrink-0 transition-all ${
          selectedLanguage.toLowerCase() === 'all'
            ? 'bg-[#1D1D1F] dark:bg-[#F5F5F7] text-white dark:text-[#1D1D1F] shadow-sm font-semibold'
            : 'bg-white dark:bg-[#1C1C1E] border border-black/[0.05] dark:border-white/[0.08] text-[#6E6E73] dark:text-[#A1A1A6] hover:text-[#1D1D1F] dark:hover:text-white shadow-sm'
        }`}
      >
        All Ecosystems
      </button>

      {languagesToShow.map((lang) => {
        const isSelected = selectedLanguage.toLowerCase() === lang.name.toLowerCase();
        const count = availableCounts[lang.name];
        return (
          <button
            key={lang.name}
            onClick={() => onSelectLanguage(lang.name)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium shrink-0 transition-all ${
              isSelected
                ? 'bg-[#0071E3] dark:bg-[#0A84FF] text-white shadow-sm font-semibold'
                : 'bg-white dark:bg-[#1C1C1E] border border-black/[0.05] dark:border-white/[0.08] text-[#6E6E73] dark:text-[#A1A1A6] hover:text-[#1D1D1F] dark:hover:text-white shadow-sm'
            }`}
          >
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: lang.color }}
            />
            <span>{lang.name}</span>
            {count !== undefined && count > 0 && (
              <span
                className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  isSelected
                    ? 'bg-white/20 text-white'
                    : 'bg-black/[0.05] dark:bg-white/10 text-[#86868B]'
                }`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
