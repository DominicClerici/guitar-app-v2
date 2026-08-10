// Turning a ranked list into something browsable: grouped by where your hand
// goes, a couple of shapes per region for the default view, everything for the
// "see all".

import type { Chord } from '../chord-library';

import { fretsFromChart, chartFor } from './chart';
import { PINNED_SHAPES } from './pins';
import { REGION_ORDER } from './region';
import type { NeckRegion, Voicing } from './types';

export interface VoicingGroup {
  region: NeckRegion;
  voicings: Voicing[];
}

/** How many shapes a region contributes to the default view. */
export const FEATURED_PER_REGION = 2;

export function pinKey(chord: Chord): string {
  return `${chord.root}:${chord.type.id}`;
}

/** The pinned patterns for a chord, normalised to the app's string order. */
export function pinnedFor(chord: Chord): string[] {
  const charts = PINNED_SHAPES[pinKey(chord)] ?? [];
  return charts
    .map(fretsFromChart)
    .filter((frets): frets is (number | null)[] => frets !== null)
    .map(chartFor);
}

/**
 * Hoist the curated shapes to the front, leaving everything else in score order.
 * Pins that the generator did not produce are simply absent here — the verify
 * script is what turns that silence into a failure.
 */
export function applyPins(chord: Chord, voicings: Voicing[]): Voicing[] {
  const pins = pinnedFor(chord);
  if (pins.length === 0) return voicings;

  const rank = new Map(pins.map((id, index) => [id, index]));
  const pinned: Voicing[] = [];
  const rest: Voicing[] = [];

  for (const voicing of voicings) {
    if (rank.has(voicing.id)) pinned.push(voicing);
    else rest.push(voicing);
  }

  pinned.sort((a, b) => rank.get(a.id)! - rank.get(b.id)!);
  return [...pinned, ...rest];
}

/** Group in neck order, dropping regions this chord has no shapes in. */
export function groupByRegion(voicings: Voicing[], limit?: number): VoicingGroup[] {
  return REGION_ORDER.map((region) => ({
    region,
    voicings: voicings.filter((voicing) => voicing.region === region).slice(0, limit),
  })).filter((group) => group.voicings.length > 0);
}
