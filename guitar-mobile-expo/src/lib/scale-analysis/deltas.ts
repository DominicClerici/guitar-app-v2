import { qualityOf } from '@/lib/key-analysis';
import type { ChordFeature } from '@/lib/key-analysis';
import { buildScale, pitchClassMask, preferredRoot, SCALE_TYPES } from '@/lib/scale-library';
import type { Scale, ScaleType } from '@/lib/scale-library';

import type { ExceptionSpan, NoteDelta, ScaleTone } from './types';

function mod12(n: number): number {
  return ((n % 12) + 12) % 12;
}

function has(mask: number, pc: number): boolean {
  return ((mask >> pc) & 1) === 1;
}

/** A displacement before it has names: which scale tone leaves, which pc arrives. */
interface Swap {
  fromPc: number | null;
  toPc: number;
}

/**
 * Which direction an out-of-key note inflects the scale, read from its role in
 * its own chord. A secondary dominant's major third is a *raised* tone (G♯ in
 * C major displaces G); a borrowed chord's minor third is a *lowered* one (A♭
 * displaces A). The chord's spelling isn't stored, but its interval structure
 * says the same thing: major thirds and sevenths are raisings, minor thirds,
 * sevenths and sixths are lowerings. Null when the role doesn't commit (the
 * note is the chord's root, 9th, 11th or 13th).
 */
function inflectionDirection(outPc: number, feature: ChordFeature): 'raise' | 'lower' | null {
  const interval = mod12(outPc - feature.rootPc);
  const quality = qualityOf(feature);
  switch (interval) {
    case 1:
    case 3:
    case 10:
      return 'lower';
    case 4:
    case 11:
      return 'raise';
    case 6:
      // A ♭5 in a diminished-family chord is lowered; anywhere else the same pc
      // reads as a ♯11 (Lydian colour) and raises.
      return quality === 'dim' || quality === 'dim7' || quality === 'min7b5' ? 'lower' : 'raise';
    case 8:
      return quality === 'aug' ? 'raise' : 'lower';
    default:
      return null;
  }
}

/** Scale-type ids in the order a name should be preferred when several match. */
const TYPE_PRIORITY = [
  'major',
  'minor',
  'harmonic-minor',
  'melodic-minor',
  'mixolydian',
  'dorian',
  'lydian',
  'phrygian',
  'lydian-dominant',
  'phrygian-dominant',
  'locrian-natural2',
  'lydian-sharp2',
  'minor-pentatonic',
  'major-pentatonic',
  'blues',
  'major-blues',
  'altered',
  'locrian',
];

function typeRank(type: ScaleType): number {
  const index = TYPE_PRIORITY.indexOf(type.id);
  return index === -1 ? TYPE_PRIORITY.length : index;
}

interface NameMatch {
  rootPc: number;
  type: ScaleType;
}

/**
 * The best dictionary name for a pitch-class set, if it has one. Every root ×
 * type whose mask matches is a candidate; the winner is the one that keeps the
 * most familiar frame — rooted on the key's tonic first, then its relative,
 * then a chord root inside the span, and only then anywhere else.
 */
function bestName(
  mask: number,
  tonicPc: number,
  relativePc: number,
  spanRootPcs: ReadonlySet<number>,
): NameMatch | null {
  const rootRank = (pc: number) =>
    pc === tonicPc ? 0 : pc === relativePc ? 1 : spanRootPcs.has(pc) ? 2 : 3;

  let best: NameMatch | null = null;
  let bestKey = Infinity;
  for (const type of SCALE_TYPES) {
    for (let pc = 0; pc < 12; pc += 1) {
      if (pitchClassMask(pc, type) !== mask) continue;
      const key = rootRank(pc) * 1000 + typeRank(type) * 12 + mod12(pc - tonicPc);
      if (key < bestKey) {
        bestKey = key;
        best = { rootPc: pc, type };
      }
    }
  }
  return best;
}

function applySwaps(mask: number, swaps: readonly Swap[]): number {
  let out = mask;
  for (const swap of swaps) {
    if (swap.fromPc !== null) out &= ~(1 << swap.fromPc);
    out |= 1 << swap.toPc;
  }
  return out;
}

/**
 * The minimal set of swaps that fits one chord into the global scale. Each
 * out-of-scale note displaces a chromatic neighbour the chord doesn't use,
 * chosen by the note's inflection direction. When the direction doesn't commit
 * and both neighbours are free, the tie goes to whichever displacement lands
 * the whole modified set on a dictionary scale, then to the upper neighbour —
 * chromatic visitors are flat-side borrowings more often than raisings.
 */
function chordSwaps(feature: ChordFeature, globalMask: number): Swap[] {
  const pcs = new Set(feature.pitchClasses);
  const swaps: Swap[] = [];
  const open: number[] = [];

  for (const pc of pcs) {
    if (has(globalMask, pc)) continue;
    const lower = mod12(pc - 1);
    const upper = mod12(pc + 1);
    const lowerFree = has(globalMask, lower) && !pcs.has(lower);
    const upperFree = has(globalMask, upper) && !pcs.has(upper);
    const direction = inflectionDirection(pc, feature);

    if (direction === 'raise' && lowerFree) swaps.push({ fromPc: lower, toPc: pc });
    else if (direction === 'lower' && upperFree) swaps.push({ fromPc: upper, toPc: pc });
    else if (lowerFree && upperFree) open.push(pc);
    else if (upperFree) swaps.push({ fromPc: upper, toPc: pc });
    else if (lowerFree) swaps.push({ fromPc: lower, toPc: pc });
    else swaps.push({ fromPc: null, toPc: pc });
  }

  for (const pc of open) {
    const asFlat: Swap = { fromPc: mod12(pc + 1), toPc: pc };
    const asSharp: Swap = { fromPc: mod12(pc - 1), toPc: pc };
    const flatNamed = hasAnyName(applySwaps(globalMask, [...swaps, asFlat]));
    const sharpNamed = hasAnyName(applySwaps(globalMask, [...swaps, asSharp]));
    swaps.push(sharpNamed && !flatNamed ? asSharp : asFlat);
  }

  return swaps;
}

function hasAnyName(mask: number): boolean {
  for (const type of SCALE_TYPES) {
    for (let pc = 0; pc < 12; pc += 1) {
      if (pitchClassMask(pc, type) === mask) return true;
    }
  }
  return false;
}

/** Move a spelled note by a semitone without changing its letter: A→A♭, B♭→B. */
function alterNote(name: string, by: number): string {
  const letter = name[0];
  let alter = 0;
  for (const char of name.slice(1)) alter += char === '#' ? 1 : -1;
  alter += by;
  return letter + (alter > 0 ? '#'.repeat(alter) : 'b'.repeat(-alter));
}

interface OpenSpan {
  start: number;
  end: number;
  swaps: Swap[];
  memberPcs: Set<number>;
  rootPcs: Set<number>;
}

/**
 * True when a chord's swaps can join a span without contradicting it: no tone
 * displaced two different ways, and no chord in the merged span using a tone
 * another chord's swap removes.
 */
function compatible(span: OpenSpan, feature: ChordFeature, swaps: readonly Swap[]): boolean {
  for (const swap of swaps) {
    for (const existing of span.swaps) {
      if (swap.toPc === existing.toPc && swap.fromPc !== existing.fromPc) return false;
    }
    if (swap.fromPc !== null && span.memberPcs.has(swap.fromPc)) return false;
  }
  for (const existing of span.swaps) {
    if (existing.fromPc !== null && feature.pitchClasses.includes(existing.fromPc)) return false;
  }
  return true;
}

function addToSpan(span: OpenSpan, index: number, feature: ChordFeature, swaps: readonly Swap[]) {
  span.end = index;
  for (const swap of swaps) {
    if (!span.swaps.some((s) => s.toPc === swap.toPc && s.fromPc === swap.fromPc)) {
      span.swaps.push(swap);
    }
  }
  for (const pc of feature.pitchClasses) span.memberPcs.add(pc);
  span.rootPcs.add(feature.rootPc);
}

/**
 * Close an open span into its public shape: name the modified set if the
 * dictionary knows it, and spell every tone — the named scale's own spelling
 * when there is one, otherwise the global spelling with the swapped notes
 * altered in place.
 */
function closeSpan(
  span: OpenSpan,
  global: Scale,
  tonicPc: number,
  relativePc: number,
  sideNames: readonly string[],
): ExceptionSpan {
  const mask = applySwaps(maskFrom(global), span.swaps);
  const match = bestName(mask, tonicPc, relativePc, span.rootPcs);
  const named = match ? buildScale(preferredRoot(match.rootPc, match.type), match.type.id) : null;

  let tones: ScaleTone[];
  if (named) {
    tones = named.pitchClasses.map((pc, i) => ({ pc, name: named.notes[i] }));
  } else {
    tones = global.pitchClasses
      .map((pc, i) => ({ pc, name: global.notes[i] }))
      .filter((tone) => !span.swaps.some((swap) => swap.fromPc === tone.pc));
    for (const swap of span.swaps) {
      const fromPc = swap.fromPc;
      const fromIndex = fromPc === null ? -1 : global.pitchClasses.indexOf(fromPc);
      tones.push({
        pc: swap.toPc,
        name:
          fromPc === null || fromIndex === -1
            ? sideNames[swap.toPc]
            : alterNote(global.notes[fromIndex], mod12(swap.toPc - fromPc) === 1 ? 1 : -1),
      });
    }
  }
  tones.sort((a, b) => mod12(a.pc - tonicPc) - mod12(b.pc - tonicPc));

  const nameAt = (pc: number) => tones.find((tone) => tone.pc === pc)?.name ?? sideNames[pc];
  const deltas: NoteDelta[] = span.swaps.map((swap) => {
    const fromIndex = swap.fromPc === null ? -1 : global.pitchClasses.indexOf(swap.fromPc);
    return {
      fromPc: swap.fromPc,
      toPc: swap.toPc,
      fromName: fromIndex === -1 ? null : global.notes[fromIndex],
      toName: nameAt(swap.toPc),
    };
  });
  deltas.sort((a, b) => mod12(a.toPc - tonicPc) - mod12(b.toPc - tonicPc));

  return { start: span.start, end: span.end, deltas, scale: named, tones };
}

function maskFrom(scale: Scale): number {
  let mask = 0;
  for (const pc of scale.pitchClasses) mask |= 1 << pc;
  return mask;
}

/**
 * Partition the uncovered chords into exception spans. Contiguous uncovered
 * chords merge for as long as their swaps agree — one "flat zone" instead of a
 * warning per chord — and split the moment they contradict, which is also what
 * keeps each dominant in a blues carrying its own colour.
 */
export function buildExceptionSpans(
  features: readonly ChordFeature[],
  covered: readonly boolean[],
  global: Scale,
  relativePc: number,
  sideNames: readonly string[],
): ExceptionSpan[] {
  const tonicPc = global.pitchClasses[0];
  const globalMask = maskFrom(global);
  const spans: ExceptionSpan[] = [];
  let open: OpenSpan | null = null;

  const close = () => {
    if (open) spans.push(closeSpan(open, global, tonicPc, relativePc, sideNames));
    open = null;
  };

  features.forEach((feature, index) => {
    if (covered[index]) {
      close();
      return;
    }
    const swaps = chordSwaps(feature, globalMask);
    if (open && open.end === index - 1 && compatible(open, feature, swaps)) {
      addToSpan(open, index, feature, swaps);
      return;
    }
    close();
    open = {
      start: index,
      end: index,
      swaps: [],
      memberPcs: new Set(),
      rootPcs: new Set(),
    };
    addToSpan(open, index, feature, swaps);
  });
  close();

  return spans;
}
