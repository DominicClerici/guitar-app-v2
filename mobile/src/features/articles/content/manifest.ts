import majorVsMinor from './major-vs-minor.json';

// Every article bundled with the app, keyed by slug. Adding an article is a
// two-step: drop the JSON in this directory, add its line here. This file goes
// away when articles come from the backend — the repository is the seam.
export const BUNDLED_ARTICLES: Record<string, unknown> = {
  'major-vs-minor': majorVsMinor,
};
