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
      <span className={`inline-flex items-center text-xs text-neutral-400 font-mono ${className}`}>
        <span className="w-2 h-2 rounded-full bg-neutral-600 mr-1.5 shrink-0" />
        Plain text
      </span>
    );
  }

  const color = getLanguageColor(language);

  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center text-xs font-mono font-medium text-neutral-300 transition-colors ${
        onClick ? 'cursor-pointer hover:text-white' : ''
      } ${className}`}
    >
      <span
        className="w-2 h-2 rounded-full mr-1.5 shrink-0 shadow-sm"
        style={{ backgroundColor: color }}
      />
      <span>{language}</span>
      {count !== undefined && (
        <span className="ml-1 px-1.5 py-0.2 text-[10px] bg-white/10 text-neutral-400 rounded-full">
          {count}
        </span>
      )}
    </span>
  );
};
