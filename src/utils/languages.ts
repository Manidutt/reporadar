export interface LanguageMeta {
  name: string;
  color: string;
  tag: string;
}

export const POPULAR_LANGUAGES: LanguageMeta[] = [
  { name: 'TypeScript', color: '#3178c6', tag: 'typescript' },
  { name: 'JavaScript', color: '#f1e05a', tag: 'javascript' },
  { name: 'Python', color: '#3572A5', tag: 'python' },
  { name: 'Rust', color: '#dea584', tag: 'rust' },
  { name: 'Go', color: '#00ADD8', tag: 'go' },
  { name: 'C++', color: '#f34b7d', tag: 'c++' },
  { name: 'Swift', color: '#F05138', tag: 'swift' },
  { name: 'Dart', color: '#00B4AB', tag: 'dart' },
  { name: 'Kotlin', color: '#A97BFF', tag: 'kotlin' },
  { name: 'Java', color: '#b07219', tag: 'java' },
  { name: 'C#', color: '#178600', tag: 'c#' },
  { name: 'PHP', color: '#4F5D95', tag: 'php' },
  { name: 'Ruby', color: '#701516', tag: 'ruby' },
  { name: 'Zig', color: '#ec915c', tag: 'zig' },
  { name: 'C', color: '#555555', tag: 'c' },
  { name: 'HTML', color: '#e34c26', tag: 'html' },
  { name: 'CSS', color: '#563d7c', tag: 'css' },
  { name: 'Shell', color: '#89e051', tag: 'shell' },
];

export const LANGUAGE_COLOR_MAP: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Python: '#3572A5',
  Rust: '#dea584',
  Go: '#00ADD8',
  'C++': '#f34b7d',
  Swift: '#F05138',
  Dart: '#00B4AB',
  Kotlin: '#A97BFF',
  Java: '#b07219',
  'C#': '#178600',
  PHP: '#4F5D95',
  Ruby: '#701516',
  Zig: '#ec915c',
  C: '#555555',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Shell: '#89e051',
  Vue: '#41b883',
  Svelte: '#ff3e00',
  Elixir: '#6e4a7e',
  Haskell: '#5e5086',
  Lua: '#000080',
  Scala: '#c22d40',
  R: '#198CE7',
  Julia: '#a270ba',
  OCaml: '#ef7a08',
  Nix: '#7e7eff',
};

export function getLanguageColor(language: string | null | undefined): string {
  if (!language) return '#8b949e';
  return LANGUAGE_COLOR_MAP[language] || '#a78bfa';
}
