import { noteToSemitone, type ChordResult, type IntervalSlot } from '@/lib/chord-analysis';

import type { ChordFeature, Quality, SeventhQuality, TriadQuality } from './types';

function present(row: IntervalSlot[], label: string): boolean {
  const slot = row.find((s) => s.interval === label);
  return !!slot && slot.note !== null;
}

/**
 * Reduce one accepted chord reading to the compact feature the key engine scores.
 * Takes the reading the *user* accepted, not the engine's primary, so an
 * alternate interpretation genuinely steers the estimate.
 */
export function extractFeature(chord: ChordResult): ChordFeature {
  const t = chord.chordTones;

  let triad: TriadQuality;
  if (present(t.triad, '3')) {
    triad = present(t.triad, '#5') ? 'aug' : 'maj';
  } else if (present(t.triad, 'm3')) {
    triad = present(t.triad, 'b5') ? 'dim' : 'min';
  } else if (present(t.triad, 'sus2') || present(t.triad, 'sus4')) {
    triad = 'sus';
  } else if (present(t.triad, '5')) {
    triad = 'power';
  } else {
    triad = 'unknown';
  }

  let seventh: SeventhQuality;
  if (present(t.seventh, 'maj7')) seventh = 'maj7';
  else if (present(t.seventh, 'dim7')) seventh = 'dim7';
  else if (present(t.seventh, '7')) seventh = 'min7';
  else seventh = 'none';

  const rootPc = noteToSemitone(t.root);
  const bassPc = t.bass ? noteToSemitone(t.bass) : null;

  const pcs = new Set<number>([rootPc]);
  for (const row of [t.triad, t.seventh, t.extensions]) {
    for (const slot of row) {
      if (slot.note) pcs.add(noteToSemitone(slot.note));
    }
  }

  return { rootPc, bassPc, triad, seventh, pitchClasses: [...pcs] };
}

/** Collapse triad + seventh into the single label the scoring tables key on. */
export function qualityOf(feature: ChordFeature): Quality {
  const { triad, seventh } = feature;
  switch (triad) {
    case 'maj':
      if (seventh === 'min7') return 'dom7';
      if (seventh === 'maj7') return 'maj7';
      return 'maj';
    case 'min':
      if (seventh === 'min7') return 'min7';
      if (seventh === 'maj7') return 'minMaj7';
      return 'min';
    case 'dim':
      if (seventh === 'dim7') return 'dim7';
      if (seventh === 'min7') return 'min7b5';
      return 'dim';
    case 'aug':
      return 'aug';
    case 'sus':
      return 'sus';
    case 'power':
      return 'power';
    default:
      return 'unknown';
  }
}
