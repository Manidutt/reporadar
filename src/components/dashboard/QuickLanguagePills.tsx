import React from 'react';
import { POPULAR_LANGUAGES, getLanguageColor } from '../../utils/languages';

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
        className={`px-3 py-1.5 rounded-xl font-medium shrink-0 transition-all ${
          selectedLanguage.toLowerCase() === 'all'
            ? 'bg-white text-black font-semibold shadow-sm'
            : 'bg-[#141720] border border-[#232733] text-neutral-400 hover:text-white hover:border-neutral-600'
        }`}
      >
        All Languages
      </button>

      {languagesToShow.map((lang) => {
        const isSelected = selectedLanguage.toLowerCase() === lang.name.toLowerCase();
        const count = availableCounts[lang.name];
        return (
          <button
            key={lang.name}
            onClick={() => onSelectLanguage(lang.name)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium shrink-0 transition-all ${
              isSelected
                ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                : 'bg-[#141720] border border-[#232733] text-neutral-300 hover:text-white hover:border-neutral-600'
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
                  isSelected ? 'bg-indigo-700 text-white' : 'bg-neutral-800 text-neutral-400'
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
