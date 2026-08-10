import { accidentalSideFor, assignedFeature, isDominantIdiom, qualityOf } from '@/lib/key-analysis';
import type { KeyCandidate, ProgressionChord } from '@/lib/key-analysis';
import { buildScale } from '@/lib/scale-library';
import type { RootName } from '@/lib/chord-library';

import { buildExceptionSpans } from './deltas';
import type { PentatonicVerdict, ScalePlan } from './types';

function mod12(n: number): number {
  return ((n % 12) + 12) % 12;
}

// Chromatic spellings per accidental side. These agree with the key-name tables
// in key-analysis: a flat key names its tones in flats, a sharp key in sharps.
const FLAT_NAMES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'] as const;
const SHARP_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;

function sideNames(side: 'sharp' | 'flat'): readonly RootName[] {
  return (side === 'sharp' ? SHARP_NAMES : FLAT_NAMES) as readonly RootName[];
}

/**
 * The scale plan for a progression against one key: the key's own scale, the
 * pentatonic lens on it, and the minimal note changes where the scale stops
 * covering the chords. Consumes the key engine's verdict the same way
 * romanLabelsFor does — `key.assignment` picks each chord's reading, so the
 * advice always describes the analysis the user is looking at.
 */
export function scalePlanFor(
  chords: readonly ProgressionChord[],
  key: KeyCandidate,
  accidentalPreference: 'sharp' | 'flat' = 'flat',
): ScalePlan | null {
  if (chords.length === 0) return null;

  const { tonicPc, mode } = key;
  const features = chords.map((chord, i) => assignedFeature(chord, key, i));
  const side = accidentalSideFor(tonicPc, mode, accidentalPreference);
  const names = sideNames(side);

  const global = buildScale(names[tonicPc], mode === 'major' ? 'major' : 'minor');
  let globalMask = 0;
  for (const pc of global.pitchClasses) globalMask |= 1 << pc;

  const covered = features.map((f) =>
    f.pitchClasses.every((pc) => ((globalMask >> pc) & 1) === 1),
  );

  // The blues gate: with dom7s saturating I/IV/V, the tonic minor pentatonic and
  // blues scale are the idiomatic answer, and the ♭7 rubs are the sound rather
  // than clashes. Major keys only — the same saturation in minor never reads as
  // an idiom the key engine recognises.
  const blues = mode === 'major' && isDominantIdiom(features, tonicPc);

  const relativePc = mode === 'major' ? mod12(tonicPc + 9) : mod12(tonicPc + 3);

  // Which five notes count as "the" pentatonic: the tonic minor pentatonic for a
  // blues or a minor key, the relative minor pentatonic for a plain major key —
  // the same five notes as the tonic major pentatonic, under the name guitarists
  // reach for first.
  const pentRootPc = blues || mode === 'minor' ? tonicPc : relativePc;
  const pentScale = buildScale(names[pentRootPc], 'minor-pentatonic');
  const alias = blues
    ? null
    : buildScale(names[mode === 'major' ? tonicPc : relativePc], 'major-pentatonic');

  const clashes: number[] = [];
  features.forEach((feature, index) => {
    // A chord the key's scale covers is idiomatic ground — the classic avoid
    // notes (C over G7 in C) live here and are a phrasing concern, not a
    // switch-scales concern. Only chords from outside the scale can clash.
    if (covered[index]) return;
    if (blues && qualityOf(feature) === 'dom7') return;
    const pcs = new Set(feature.pitchClasses);
    const hit = pentScale.pitchClasses.some(
      (p) => !pcs.has(p) && (pcs.has(mod12(p - 1)) || pcs.has(mod12(p + 1))),
    );
    if (hit) clashes.push(index);
  });

  const pentatonic: PentatonicVerdict = {
    scale: pentScale,
    alias,
    survives: clashes.length === 0,
    clashes,
  };

  return {
    global,
    pentatonic,
    blues: blues ? buildScale(names[tonicPc], 'blues') : null,
    covered,
    exceptions: buildExceptionSpans(features, covered, global, relativePc, names),
  };
}
