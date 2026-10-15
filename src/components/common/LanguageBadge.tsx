import React from 'react';
import { getLanguageColor } from '../../utils/languages';

interface LanguageBadgeProps {
  language: string | null | undefined;
  className?: string;
  onClick?: () => void;
  count?: number;
}

export const LanguageBadge: React.FC<LanguageBadgeProps> = ({
  language,
  className = '',
  onClick,
  count,
}) => {
  if (!language) {
    return (
      <span className={`inline-flex items-center text-xs text-[#86868B] ${className}`}>
        <span className="w-2 h-2 rounded-full bg-[#86868B] mr-1.5 shrink-0" />
        Plain text
      </span>
    );
  }

  const color = getLanguageColor(language);

  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center text-xs font-medium text-[#1D1D1F] dark:text-[#F5F5F7] transition-colors ${
        onClick ? 'cursor-pointer hover:text-[#0071E3] dark:hover:text-[#0A84FF]' : ''
      } ${className}`}
    >
      <span
        className="w-2 h-2 rounded-full mr-1.5 shrink-0 shadow-xs"
        style={{ backgroundColor: color }}
      />
      <span>{language}</span>
      {count !== undefined && (
        <span className="ml-1 px-1.5 py-0.2 text-[10px] bg-black/[0.05] dark:bg-white/10 text-[#86868B] rounded-full">
          {count}
        </span>
      )}
    </span>
  );
};
