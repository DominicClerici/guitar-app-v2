# Chord Analysis

`src/lib/chord-analysis/` turns a set of notes placed on a fretboard into a
ranked list of chord names, an interval breakdown, and warnings about unusual
voicings. It's a self-contained, dependency-free TypeScript module (pure
string/number math — no React, no native modules, safe to call from anywhere
including a worklet or a plain function).

Import from the folder index; the shared primitives come from `@/lib/theory`:

```ts
import { analyzeChord } from '@/lib/chord-analysis'
import type { ChordAnalysis, ChordTones } from '@/lib/chord-analysis'
import { noteToSemitone, OPEN_PITCHES } from '@/lib/theory'
```

## What it does (and doesn't)

- **Chord identification** — given the notes of one voicing, name the chord(s),
  show the intervals, and flag anything unusual. This is what `analyzeChord`
  does and it's ready to use.
- **Chord construction** — the opposite direction (a chord identity → its
  tones) lives in `@/lib/chord-library`. Both modules share the spelling core
  in `@/lib/theory`, so `Gb7` reads `Gb Bb Db Fb` in either tool.
- **Key / progression analysis** — lives in `@/lib/key-analysis`, which
  consumes the `ChordResult`s this module produces.

## Public API

| Export | What it is |
|--------|------------|
| `analyzeChord(notes: FretboardNote[]): ChordAnalysis \| null` | The entry point. Returns `null` for fewer than 3 notes. |
| `EMPTY_CHORD_TONES` | The blank `ChordTones` grid, for drawing the slot panel before a chord exists. |
| types | `ChordAnalysis`, `ChordResult`, `ChordTones`, `IntervalSlot`, `FretboardNote`, `Warning`. |

The chromatic tables (`notesFlat`, `notesSharp`), `noteToSemitone`, and the
tuning constants (`OPEN_PITCHES`, `OPEN_PITCHES_MIDI`) used to be re-exported
here. They now live in `@/lib/theory` — import them from there.

### Input — `FretboardNote`

```ts
interface FretboardNote {
  string: number   // 0 = high e, 5 = low E
  fret: number     // 0 = open
}
```

The visual fretboard produces one `FretboardNote` per placed dot. String index
runs **0 = high e … 5 = low E**. A given pitch class is `(OPEN_PITCHES[string] +
fret) % 12`.

### Output — `ChordAnalysis`

```ts
interface ChordAnalysis {
  chordNames: ChordResult[]   // up to 5, primary first
  chordTones: ChordTones      // interval grid for the primary reading
}

interface ChordResult {
  name: string                // e.g. "Cm7", "C/G", "Cmaj9"
  primary: boolean            // true for chordNames[0]
  warnings: Warning[]         // fired rules for this reading — see Warnings below
  chordTones: ChordTones      // interval grid for this reading, not just the primary
}
```

`chordNames[0]` is the most likely chord — use `.name` as the headline label.
The rest are alternate readings (often slash chords or re-rootings).

### Interval display — `ChordTones`

`chordTones` is a fixed-shape grid built for a stable UI layout: three rows
(triad / seventh / extensions), each a list of slots in a fixed order. A slot
has a spelled note when that interval is present, or `null` when it isn't.

```ts
interface ChordTones {
  root: string
  bass: string | null          // null when the bass note is the root
  triad:      IntervalSlot[]   // sus2, m3, 3, sus4, b5, 5, #5
  seventh:    IntervalSlot[]   // b6, dim7, 6, 7, maj7
  extensions: IntervalSlot[]   // b9, #9, 9, #11, 11, b13, 13
}

interface IntervalSlot {
  interval: string             // the slot's label, e.g. "3", "b5"
  note: string | null          // spelled note name, or null if not in the chord
  altered: boolean             // true for b5/#5/b9/#9/#11/b13 (e.g. highlight color)
}
```

Render every slot in order; show the note where `note !== null`, dim or hide the
rest. `altered` is a hint for emphasis (the "spicy" tones).

## Example

```ts
// Open C major voiced with G in the bass: low‑E f3, A f3, D f2, G open, B f1, e open.
const notes: FretboardNote[] = [
  { string: 5, fret: 3 }, // G  (bass)
  { string: 4, fret: 3 }, // C
  { string: 3, fret: 2 }, // E
  { string: 2, fret: 0 }, // G
  { string: 1, fret: 1 }, // C
  { string: 0, fret: 0 }, // E
]

const analysis = analyzeChord(notes)
analysis?.chordNames[0].name          // "C/G"
analysis?.chordNames.map(c => c.name) // ["C/G", "Emb6/G", "G6sus"]
analysis?.chordTones.root             // "C"
analysis?.chordTones.bass             // "G"
```

## How a name is chosen (ranking)

Each unique pitch class in the voicing is read as a candidate root, producing
one interpretation each. They're then scored for plausibility and the cleanest
one becomes primary:

- Readings flagged as a **likely inversion / fragment** are heavily penalized
  (the warning rules literally mean "this wants a different root").
- Simpler names beat complex ones (sus, omitted tones, stacked tensions add
  cost). `b5` and `#5` are exempt: they alter the triad rather than stacking on
  top of it, and charging them as tensions made `m7(b5)` lose to the `m6` a
  minor third above it on every root.
- A reading rooted on the actual **bass** note is preferred by more than any
  single tension, so a clean root-position chord stays primary and renders
  without a slash.

A reading whose root isn't the bass renders as a **slash chord** (`C/G`); a
root-position reading renders plain (`C`). This is why an open C major over a G
bass surfaces as `C/G` rather than the literal bass-rooted `G6sus`.

## Warnings

`ChordResult.warnings` is a list of fired rules describing why a voicing is
unusual or ambiguous — e.g. *"Likely an inversion"*, *"Has both 5 and b5"*,
*"No third"*, cluster/dissonance flags. Surface them next to the chord name (the
primary chord is usually warning-free; alternates carry most of them).

```ts
interface Warning {
  id: string       // rule id, e.g. "sus2b5"
  cat?: 'omitted' | 'cluster' | 'double' | 'inversion' | 'fragment'
      | 'uncommon' | 'enharmonic' | 'dissonance' | ''
  short: string    // tag, e.g. "Likely an inversion"
  long: string     // the explanation behind the tag
  assumedRoot?: string
}
```

Use `short` for the tag and `long` for the expanded explanation; `cat` groups
rules by the kind of oddity, which is what a colour-coded list keys on.

## Formatting conventions (fixed)

The engine has no user-facing settings. Names are always rendered:

- with letter qualities — `m` / `dim` / `aug` (never `−` / `°` / `+`)
- with tensions in parentheses — `Cm7(b5,11)`
- abbreviated where unambiguous — `C9` not `C7add9`, `sus` not `sus4`
- with the sus after the extension number — `C9sus`, `C13sus`, `C6/9sus`
- `6/9`, `b6/9` with a slash
- with a tritone or b6 spelled as a **fifth** (`b5` / `#5`) when the voicing has
  no perfect 5th, and as a **tension** (`#11` / `b13`) when it does — so `C7(b5)`
  is C E Gb Bb and `C7(#11)` is C E G Bb Gb
- with an 11 printed whenever the extension number doesn't imply it — `C13` is
  C E G Bb D A, `C13(11)` is C E G Bb F A
- as plain strings (no markup)
- extreme enharmonics collapsed — `B##` → `C#`, `Cbb` → `Bb`

## Internals (for maintainers)

`analyzeChord` is the only thing the UI calls; the pipeline lives in small
modules:

| File | Job |
|------|-----|
| `chord-info.ts` | The core: half-steps → triad quality, extension, sus, tensions, per-semitone interval labels, and a slash-chord reading. |
| `chord-symbol.ts` | Format the printed chord symbol. |
| `variations.ts` | For each input pitch class, run identification + spelling and pick flat/sharp side. |
| `ranking.ts` | Score variations and pick the primary (see above). |
| `warnings.ts` | 25 rules flagging unusual voicings. |
| `adapter.ts` | Map the primary reading into the `ChordTones` grid. |
| `index.ts` | `analyzeChord` + the public surface. |

The pieces this module builds on — `constants.ts` (chromatic tables, mixolydian
skeleton, tuning), `half-steps.ts` (note name ↔ pitch class), and
`notes-from-intervals.ts` (interval label → spelled note, the `F#`-vs-`Gb`
decision) — live in `@/lib/theory` and are shared with `chord-library`.

## Tests

`chord-analysis.test.ts` names chords from note sets and round-trips the whole
`chord-library` catalogue (17 roots × every quality) back through
`analyzeChord`, so a ranking change that breaks a standard chord fails the
build. `scripts/verify-chord-library.ts` exercises the shared spelling core the
other way. Run both with `pnpm lint` (`tsc --noEmit` + `expo lint` + `vitest`).
