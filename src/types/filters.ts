export type TimePeriod = 'today' | 'week' | 'month';

export type SortOption =
  | 'stars'
  | 'growth'
  | 'forks'
  | 'updated'
  | 'viral';

export type ViewMode = 'grid' | 'table';

export type ActiveTab =
  | 'discover'
  | 'trending'
  | 'viral'
  | 'languages'
  | 'bookmarks'
  | 'settings';

export interface FilterState {
  searchQuery: string;
  language: string;
  minStars: number;
  minGrowth: number;
  topic: string;
  period: TimePeriod;
  sortBy: SortOption;
  sortOrder: 'desc' | 'asc';
}

export interface LanguageOption {
  name: string;
  color: string;
  count?: number;
}
