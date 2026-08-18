# Guitar Voicings

`src/lib/guitar-voicings/` puts a chord on a neck: give it a `Chord` from
`chord-library` and get back every way a hand can hold it, ranked. It is the
other half of the sentence `LIBRARY.md` starts — the chord library decides
_which notes have to be there_, this decides _where they go and whether anyone
can play them_.

Pure string/number math — no React, no native modules. The neck is an argument:
pass the user's `Tuning` (`useTuning()` from `@/lib/preferences`), or `STANDARD`
from `@/lib/tuning` where the shapes belong to something authored in standard
tuning.

```ts
import { buildChord } from '@/lib/chord-library';
import { chordShapes } from '@/lib/guitar-voicings';

const shapes = chordShapes(tuning, buildChord('C', 'maj7'));
shapes.featured; // a couple per neck region — the default view
shapes.all; // every root-position shape, grouped
shapes.inversions; // the second pass: another chord tone in the bass
shapes.total; // 118
```

## String order

**Every six-element array here is indexed 0 = high e … 5 = low E**, matching
`OPEN_PITCHES`, `PlacedNote` and the fretboard UI. Charts are written the other
way round, low E first. That reversal happens in exactly two places — `chartFor`
and `ChordDiagram` — and nowhere else. Reading `frets[0]` as the low E is the
easiest mistake to make against this module.

```ts
chartFor([0, 1, 0, 2, 3, null]); // "x 3 2 0 1 0"  — open C
```

## How the search works

The space is partitioned by hand position, so no shape is generated twice:

- **position 0** — shapes with no fingered notes at all.
- **position p** — shapes whose _lowest fingered fret_ is exactly `p`, reaching
  up to `p+3`.

Each string may be silent, ring open, or take a fret in the window, and only
pitches belonging to the chord are ever offered — so "does this spell the chord"
is answered before the search starts rather than filtered afterwards. That is
~50k combinations per chord, a few milliseconds, which is why nothing is
precomputed. `chordShapes` memoises per chord symbol.

## What makes a shape valid

Two of these are theory and come from the chord library; the rest are anatomy.

| Rule                                   | Why                                                          |
| -------------------------------------- | ------------------------------------------------------------ |
| Every sounding pitch is a chord tone   | Built into the candidate set                                 |
| Every essential tone is present        | `essentialTones(chord, n)` — the library's `dropOrder`       |
| Three voices, or two for a power chord | Fewer is an interval, not a chord                            |
| At most one interior muted string      | A string deadened mid-chord is the hardest thing on the list |
| Fingered span ≤ 4 frets                | Longer stretches exist; not in a reference tool              |
| Four fingers, after any barre          | —                                                            |
| No mud (see below)                     | Correct on paper, unusable in the room                       |

### Mud

Two adjacent voices too close together, too low down. The thresholds are on the
lower note's register, because the same interval is a problem at the bottom of
the neck and a colour an octave up:

| Below   | Minimum gap |                                 |
| ------- | ----------- | ------------------------------- |
| A2 (45) | 4 semitones | thirds and wider only           |
| C3 (48) | 3 semitones | no seconds at all               |
| A3 (57) | 2 semitones | whole tones fine, semitones not |

The last two thresholds are deliberately loose enough to allow the sound a chord
is _named_ for: `x 3 3 0 1 1` puts F3 against G3, and that whole tone is what a
sus4 chord is.

### Barres

A barre is taken only when the shape cannot be fingered without one, so
`x 3 2 0 1 0` never comes back as a barre chord. It sits at the lowest fingered
fret and spans from the first string at that fret to the last. Three rules make
it a hand rather than a diagram:

- Nothing inside the span may be **muted or ringing open** — the finger is
  already lying across it.
- Strings inside the span _may_ be fretted higher; that is how a D-shape barre
  (`x 5 7 7 7 5`) works.
- Every remaining fretted note must fall on **one side** of the barre. A barre
  across the middle three strings with notes above and below it wants the ring
  finger on the low E and the pinky on the high e simultaneously.

Separately, notes sharing the lowest fret more than two strings apart must be
barred rather than fingered individually — `x 0 2 0 2 0` is fine either side of
an open G, `1 0 3 2 1 x` is the index arching over half the neck.

## Ranking vs difficulty

Two different numbers, on purpose.

`score` ranks: fingers, span, barre, interior mutes, position, and omitted tones
charged **in proportion to the chord's size** — losing one of a triad's three
notes guts it, losing one of a thirteenth's six is how the chord is normally
played. Credits for open strings, strings sounding, and a doubled root.

`difficulty` is physical effort only. A five-string barre at the eighth fret can
rank first for a rare quality and still be honestly labelled `hard`.

Two weights are load-bearing and were found by looking at output, not by taste:
`sounding` must exceed `finger` (or every shape wins by dropping its outer
string — the five-string G beat the canonical six-string one), and `position`
has to be firm enough that a three-string shape at fret 10 cannot outrank the
open chord by using fewer fingers.

## The bass is a pitch, not a string

A low E fretted at the eighth fret sounds _above_ an open A. The bass degree is
taken from the lowest sounding **pitch**, which is why `[8 0 0 0 11 0]` is a
C13 with its thirteenth in the bass and belongs in the inversions pass.

## Regions

A ringing open string decides the region on its own, whatever the fingers are
doing — it is what gives a shape its sound and how a player reaches for it. C
major is `x 3 2 0 1 0`, fingered at frets 1 to 3, and it belongs with the open
chords rather than the barre shapes at the same position.

`open` · `low` (1–4) · `mid` (5–8) · `high` (9+)

## Pins

`pins.ts` hoists the shape a player expects to see first. **Pins reorder, never
inject**: a pin is matched against what the generator produced, and a pin the
generator did _not_ produce fails the verify script. It is a generator bug, not
a missing chord — so the list can never paper over a filter throwing away real
voicings, and it doubles as a regression test.

The list is short because the scorer does the work. Of fifteen candidate pins
written from memory, fourteen turned out to be redundant once the weights were
right; the script reports any that become redundant again.

The charts are written in standard tuning, so `chordShapes` applies them only
when the tuning is standard. On a retuned neck they name grips the generator no
longer produces; leaving them on would be a no-op with a misleading name, and
the scorer's own order — which is what the pins were measured against — stands.

## Verification

There is no test runner in this project. `scripts/verify-guitar-voicings.ts`
checks every shape of all 510 chords — spelling, essential tones, the declared
degree on each string, bass and slash labelling, geometry, fingering, barre
coherence, register, and that the two passes are disjoint.

```
node --import ./scripts/ts-resolver.mjs scripts/verify-guitar-voicings.ts
node --import ./scripts/ts-resolver.mjs scripts/verify-guitar-voicings.ts --dump "Cmaj7"
```

`--dump` prints a chord's shapes as ASCII, which is how the pin list is authored
and how the ranking gets eyeballed after touching the weights. Run the whole
check after changing the generator, the scorer, or anything in `@/lib/theory`.

## API

| Export                               | What it is                                                        |
| ------------------------------------ | ----------------------------------------------------------------- |
| `chordShapes(tuning, chord)`         | The entry point. Featured, all, inversions, total. Memoised per tuning. |
| `generateVoicings(tuning, chord, options?)` | The raw ranked list. `{ inversions: true }` runs the second pass. |
| `groupByRegion(voicings, limit?)`    | Group in neck order, dropping empty regions.                      |
| `chartFor` / `fretsFromChart`        | The `x 3 2 0 1 0` shorthand, both directions.                     |
| `REGION_ORDER` / `REGION_LABELS`     | Browse order and display names.                                   |
| `pinnedFor(chord)` / `pinKey(chord)` | The curated ordering hints.                                       |
