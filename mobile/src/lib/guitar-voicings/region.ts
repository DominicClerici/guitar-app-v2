import type { NeckRegion } from './types';

export const REGION_ORDER: readonly NeckRegion[] = ['open', 'low', 'mid', 'high'];

export const REGION_LABELS: Record<NeckRegion, string> = {
  open: 'Open',
  low: 'Frets 1–4',
  mid: 'Frets 5–8',
  high: 'Frets 9+',
};

/**
 * A ringing open string decides the region on its own, whatever the fingers are
 * doing: it is what gives the shape its sound and how a player reaches for it.
 * C major is x32010 — fingers at frets 1 to 3 — and it belongs with the open
 * chords, not with the barre shapes at the same position.
 */
export function regionOf(position: number, openStrings: number): NeckRegion {
  if (openStrings > 0) return 'open';
  if (position <= 4) return 'low';
  if (position <= 8) return 'mid';
  return 'high';
}
