// Single source of truth for the top-tab order. The tab bar and the pager both
// read this array, so adding or reordering a tab happens in one place.
export type TabKey = 'home' | 'tools' | 'play' | 'learn' | 'account' | 'ear';

export interface TabConfig {
  key: TabKey;
  label: string;
}

export const TABS: TabConfig[] = [
  { key: 'home', label: 'Home' },
  { key: 'tools', label: 'Tools' },
  { key: 'play', label: 'Play' },
  { key: 'learn', label: 'Learn' },
  { key: 'account', label: 'Account' },
  { key: 'ear', label: 'Ear' },
];
