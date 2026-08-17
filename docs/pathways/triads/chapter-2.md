# Chapter 2 — Major Triads Everywhere

- **Chapter id**: `triads.ch2`
- **Slug**: `major-everywhere`
- **7 article lessons + 2 optional activities + 1 checkpoint**
- **`publishedAt`**: `2026-08-14`

**Arc line.** After this chapter the learner can put a major triad anywhere on the neck, knows why
the shapes change from set to set, and has played actual music with them.

---

## Verified reference (recomputed from open-string pitches, not copied)

Everything below was computed from open-string MIDI (string 1 = E4/64, 2 = B3/59, 3 = G3/55,
4 = D3/50, 5 = A2/45, 6 = E2/40) using the same rule `mobile/src/lib/guitar-positions/triads.ts`
uses — bass tone on the set's lowest string, then each remaining tone at its first occurrence
strictly above the note before it, span ≤ 4 frets. It agrees with
`mobile/src/lib/guitar-positions/triads.test.ts`. **A lesson whose chart disagrees with this table
is wrong.**

### The twelve grips (C major), six-slot charts, low E first

| Set | Root position | First inversion | Second inversion |
| --- | --- | --- | --- |
| 1-2-3 | `x x x 5 5 3` | `x x x 9 8 8` | `x x x 0 1 0` |
| 2-3-4 | `x x 10 9 8 x` | `x x 2 0 1 x` | `x x 5 5 5 x` |
| 3-4-5 | `x 3 2 0 x x` | `x 7 5 5 x x` | `x 10 10 9 x x` |
| 4-5-6 | `8 7 5 x x x` | `12 10 10 x x x` | `3 3 2 x x x` |

### Every grip, note by note

| Set | Inversion | Chart | Positions (string·fret), low → high | Notes | Degrees |
| --- | --- | --- | --- | --- | --- |
| 1-2-3 | root | `x x x 5 5 3` | `3·5` `2·5` `1·3` | C4 E4 G4 | `1 3 5` |
| 1-2-3 | first | `x x x 9 8 8` | `3·9` `2·8` `1·8` | E4 G4 C5 | `3 5 1` |
| 1-2-3 | second | `x x x 0 1 0` | `3·0` `2·1` `1·0` | G3 C4 E4 | `5 1 3` |
| 2-3-4 | root | `x x 10 9 8 x` | `4·10` `3·9` `2·8` | C4 E4 G4 | `1 3 5` |
| 2-3-4 | first | `x x 2 0 1 x` | `4·2` `3·0` `2·1` | E3 G3 C4 | `3 5 1` |
| 2-3-4 | second | `x x 5 5 5 x` | `4·5` `3·5` `2·5` | G3 C4 E4 | `5 1 3` |
| 3-4-5 | root | `x 3 2 0 x x` | `5·3` `4·2` `3·0` | C3 E3 G3 | `1 3 5` |
| 3-4-5 | first | `x 7 5 5 x x` | `5·7` `4·5` `3·5` | E3 G3 C4 | `3 5 1` |
| 3-4-5 | second | `x 10 10 9 x x` | `5·10` `4·10` `3·9` | G3 C4 E4 | `5 1 3` |
| 4-5-6 | root | `8 7 5 x x x` | `6·8` `5·7` `4·5` | C3 E3 G3 | `1 3 5` |
| 4-5-6 | first | `12 10 10 x x x` | `6·12` `5·10` `4·10` | E3 G3 C4 | `3 5 1` |
| 4-5-6 | second | `3 3 2 x x x` | `6·3` `5·3` `4·2` | G2 C3 E3 | `5 1 3` |

### Neck order on each set (what `triad-ladder` draws, lowest first)

| Set | Order, with fret spans |
| --- | --- |
| 1-2-3 | second `0–1`, root `3–5`, first `8–9`, then second again `12–13` |
| 2-3-4 | first `0–2`, second `5`, root `8–10`, then first again `12–14` |
| 3-4-5 | root `0–3`, first `5–7`, second `9–10`, then root again `12–15` |
| 4-5-6 | second `2–3`, root `5–8`, first `10–12`, then second again `14–15` |

**Each set starts its cycle on a different inversion.** That is not a bonus fact — it is why the
learner cannot just memorise "second, root, first" and carry it around.

### Relative shapes — frets measured from the bass note

| Set | Root | First | Second |
| --- | --- | --- | --- |
| 4-5-6 | `0 −1 −3` | `0 −2 −2` | `0 0 −1` |
| 3-4-5 | `0 −1 −3` | `0 −2 −2` | `0 0 −1` |
| 2-3-4 | `0 −1 −2` | `0 −2 −1` | `0 0 0` |
| 1-2-3 | `0 0 −2` | `0 −1 −1` | `0 +1 0` |

### The shift, stated the way lesson 4 must state it

Measure every set against the all-fourths shape (which is what 3-4-5 and 4-5-6 both are). The
number of notes lifted is exactly the number of the set's strings that sit **above** the G→B break:

| Set | Strings used, low → high | Above the break | Lift vs all-fourths, low → high |
| --- | --- | --- | --- |
| 4-5-6 | 6, 5, 4 | none | `(0, 0, 0)` |
| 3-4-5 | 5, 4, 3 | none | `(0, 0, 0)` |
| 2-3-4 | 4, 3, 2 | string 2 | `(0, 0, +1)` |
| 1-2-3 | 3, 2, 1 | strings 2 and 1 | `(0, +1, +1)` |

**Verified: this lift vector is the same for all three inversions on every set.** Subtracting
neighbours gives the two facts the chapter is built on, and each also holds for all three
inversions:

- `1-2-3` − `2-3-4` = `(0, +1, 0)` — **only the middle note moves.** (Both sets have their top
  voice lifted, so the top cancels.)
- `2-3-4` − `3-4-5` = `(0, 0, +1)` — **only the top note moves.**
- `3-4-5` − `4-5-6` = `(0, 0, 0)` — **identical.**

And the absolute frets confirm the last one concretely: every 3-4-5 grip is the 4-5-6 grip five
frets lower on the neck (`8 7 5` → `3 2 0`; `12 10 10` → `7 5 5`), because string 6 to string 5 is
a fourth and a fourth is five frets. The second inversion is the same relationship one octave over:
`3 3 2` on 4-5-6 is `10 10 9` on 3-4-5 minus seven frets, i.e. five frets up and twelve down.

### Which voice carries the third — the gift to chapter 3

Verified on all four sets: the third's position inside the grip depends **only on the inversion**,
never on the set.

| Inversion | Degrees low → high | The third is… |
| --- | --- | --- |
| root position | `1 3 5` | the **middle** note |
| first inversion | `3 5 1` | the **lowest** note |
| second inversion | `5 1 3` | the **highest** note |

Chapter 3's whole move is lowering that note one fret, so **every lesson in this chapter must make
the third easy to point at.** Lesson 5 states the rule outright.

### The naive wrong move (lesson 1's opening)

Sliding a strings 1-2-3 grip straight down onto strings 2-3-4, frets unchanged:

| 1-2-3 grip | Slid onto strings 4, 3, 2 | Sounds | Verdict |
| --- | --- | --- | --- |
| `5 5 3` | `x x 5 5 3 x` | G3 C4 D4 | not a C chord — there is a `D` in it |
| `9 8 8` | `x x 9 8 8 x` | B3 D#4 G4 | not a C chord at all |
| `0 1 0` | `x x 0 1 0 x` | D3 G#3 B3 | not a C chord at all |

### Register of C major on each set

| Set | Lowest note across the three inversions | Highest |
| --- | --- | --- |
| 1-2-3 | G3 | C5 |
| 2-3-4 | E3 | G4 |
| 3-4-5 | C3 | E4 |
| 4-5-6 | G2 | C4 |

### Mud — the real thresholds, and what they actually say about these grips

`mobile/src/lib/guitar-voicings/VOICINGS.md` §"Mud", implemented as `MUD_RULES` / `isMuddy` in
`mobile/src/lib/guitar-voicings/generate.ts`. The threshold is set by the **lower** note of an
adjacent pair, compared strictly:

| Lower note below | Minimum gap between the two |
| --- | --- |
| A2 | 4 semitones (a major third) |
| C3 | 3 semitones |
| A3 | 2 semitones |

**Recomputed result, and it corrects the chapter brief: not one of the twelve C major grips is
muddy.** Every pair clears. What is true is that the margin is thin and it runs out just below C
major:

| Grip | Notes | Gaps | Margin over the rule |
| --- | --- | --- | --- |
| 4-5-6 root `8 7 5` | C3 E3 G3 | 4, 3 | 2 and 1 |
| 4-5-6 second `3 3 2` | G2 C3 E3 | 5, 4 | **1** and 2 |
| 3-4-5 root `x 3 2 0` | C3 E3 G3 | 4, 3 | 2 and 1 |
| **G major** root on 4-5-6, `3 2 0 x x x` | G2 B2 D3 | 4, 3 | **0 and 0** |

That last row is the honest floor and lesson 3 should use it: **the bottom three strings of the
open G chord** (`3 2 0 0 0 3`) are a G major triad in root position on strings 4-5-6, they are the
lowest close major triad on the instrument, and both of their gaps sit *exactly* on the app's
limit. One semitone tighter anywhere and the voicing engine throws it out.

This is also a clean callback: chapter 1 used open G's **top** three strings (`0 0 3`, G3 B3 G4) as
its counterexample — a doubled root and no fifth. Its **bottom** three are a complete triad.

> **Naming a deliberate departure from C.** The pathway anchors on C major. Lesson 3 leaves it for
> exactly one example, because G major root position on strings 4-5-6 is the grip that sits on the
> limit and it is inside a chord the learner already plays. Say why in the prose.

### Why the first inversion on strings 4-5-6 cannot be held low

The first inversion needs the third, `E`, in the bass. On string 6 the lowest `E` is the open
string, E2. The close voicing then wants the next `G` **above** E2, which is G2 — but string 5 open
is A2, two semitones **higher** than G2, so string 5 cannot produce a G2 at all. The lowest `G`
string 5 can play is G3 at `5·10`, a tenth above E2 rather than a minor third: no longer a close
voicing, and no hand spans ten frets. So the close first inversion has to wait until the `E` on
string 6 is E3 at `6·12` — giving `12 10 10 x x x`. `triad-shape` finds this on its own; the lesson
says why it had to.

### Why "the middle of the guitar sounds full" — researched, and partly idiom

Two things are true and one common claim is not:

- **True, measurable.** A typical acoustic guitar body has its Helmholtz (air) resonance around
  100 Hz and a coupled top-plate resonance around 200 Hz. Open strings 5, 4 and 3 are A2 (110 Hz),
  D3 (147 Hz) and G3 (196 Hz) — sitting essentially on top of those two peaks, so the box itself
  reinforces notes in that region. Sources: DTU, *Simple model for low-frequency guitar function*;
  Savart Journal, *Frequency Response Evaluation of Acoustic Guitar*; Euphonics §4.2.2.
- **True.** In that register the fundamentals are still far enough apart that a close triad's notes
  land in separate critical bands, while carrying a dense set of audible harmonics — weight without
  roughness.
- **NOT true, do not write it.** "The ear is most sensitive there." Equal-loudness sensitivity
  peaks much higher, around 2–4 kHz. Do not conflate body resonance with hearing sensitivity.
- **Partly idiom, and say so.** A large part of "the middle sounds full" is convention: it is the
  register most comping vocabulary was built in. Be honest that this half is learned taste.

### Why close low voicings go muddy at all — the one-sentence version that is true

Two notes close together low down fall inside a single **critical band** on the basilar membrane
and are heard as one beating, rough sound rather than two pitches. A critical band is roughly
**6 semitones** wide around 100 Hz but only about **2–3 semitones** wide around 1 kHz (Glasberg &
Moore ERB model; Zwicker's Bark table gives ≈3 semitones at 1 kHz), so the same interval that rings
clean up high smears down low. **Keep it to one or two sentences and do not quote a single
"critical bandwidth" figure as *the* number** — the two standard models disagree at 1 kHz.

### Choosing a register in practice — researched

- **The bass owns roughly E1–G3.** Strings 4-5-6 close triads sit inside that, which is the real
  practical objection to them in a band, more than mud is.
- **A sung lead usually lives around C3–C5**, higher for many female pop leads. Comping guitarists
  are told to stay out of the singer's range — frame it from above and below rather than sitting
  inside it, and fill the top register between phrases rather than under a held note.
- **Strings 1-2-3 (C major: G3–C5) sit at the top of or above most sung melodies.** That is why
  they cut through and why they carry so much rhythm work. Chapter 1 said "above the bass and above
  most vocal melodies" — do not contradict it, but this chapter can be more precise: unambiguously
  clear of the bass, and at or above the top of the melody.
- **Piano's "left hand no lower than about C3, or the voicing muddies"** is the same low-interval
  logic stated as hand geography. The guitar analogue is not a two-hand split; it is *which set and
  inversion you pick*, which is what the app's A2 / C3 / A3 thresholds encode.

Sources: The Jazz Piano Site, *How to Comp for a Vocalist*; Learn Jazz Standards, *5 Important
Shapes for Rootless Left-Hand Voicings*; PianoGroove, *Rootless Chord Voicings*.

### The applied progression — verified

I–IV–V in C on strings 1-2-3, nearest inversion each time, entirely inside frets 0–5.

| Chord | Inversion | Chart | Notes low → high |
| --- | --- | --- | --- |
| C | second | `x x x 0 1 0` | G3 C4 E4 |
| F | first | `x x x 2 1 1` | A3 C4 F4 |
| G | first | `x x x 4 3 3` | B3 D4 G4 |
| C | root | `x x x 5 5 3` | C4 E4 G4 |

Movement, per string, `3` then `2` then `1`:

| Change | String 3 | String 2 | String 1 | What happens |
| --- | --- | --- | --- | --- |
| C → F | `+2` | `0` | `+1` | `C4` stays put on string 2 |
| F → G | `+2` | `+2` | `+2` | all three move up two frets together |
| G → C | `+1` | `+2` | `0` | `G4` stays put on string 1 |

Full F and G grids on strings 1-2-3, for reference (all recomputed):

| Chord | Root | First | Second |
| --- | --- | --- | --- |
| F | `x x x 10 10 8` (F4 A4 C5) | `x x x 2 1 1` (A3 C4 F4) | `x x x 5 6 5` (C4 F4 A4) |
| G | `x x x 12 12 10` (G4 B4 D5) | `x x x 4 3 3` (B3 D4 G4) | `x x x 7 8 7` (D4 G4 B4) |

**Do not write the words "voice leading."** Chapter 5 names it. Teach it here by feel: move the
least, keep a finger where you can.

---

## What chapter 1 established — reference, never re-teach

Triad = root + third + fifth, and a **complete chord**, not a fragment; a barre chord is a triad
with notes doubled. Degrees `1` `3` `5`. Major = `4` then `3` semitones. **Inversion** = which note
is lowest, and it does not rename the chord; slash notation `C/E` defined and used sparingly. The
four string sets named high-string-first, string 1 = high e. The **six-slot chart low E first**
with `x`. The `3·5` **string·fret** shorthand. "Grip", "close voicing", "in the bass", "doubling",
"register". C major on strings 1-2-3 in all three inversions — `x x x 0 1 0`, `x x x 5 5 3`,
`x x x 9 8 8`, repeating at `x x x 12 13 12`. Open C dissected into three grips; open A's top three
strings; open D's top three strings; open G's top three strings as the counterexample.
`/chord-detector` renders a slash whenever the root is not the sounding bass, so `x x 2 0 1 x`
comes back **`C/E`**.

**Chapter 1 deliberately left the B-string explanation to this chapter.** It said only that the
grips are not identical from set to set and that chapter 2 explains why. That promise is lesson 4's.

**The `3·5` shorthand is restated once, in lesson 1**, since a learner may arrive after a gap.
Nothing else from the list above is redefined anywhere in this chapter.

## What this chapter must leave alone

- **Minor, diminished, augmented.** Chapter 3 and 4. Not a single grip, not a single "and if you
  flatten this…". The one permitted forward reference is lesson 7's closing line.
- **The term "voice leading."** Chapter 5 names it.
- **Harmonising the scale.** Chapter 5. Lesson 7 uses I, IV and V as three chords in C, not as
  degrees of a harmonised scale, and should not use Roman numerals in prose.
- **Spread / open voicings, seventh chords, CAGED, modes, alternate tunings.**

## What this chapter must hand to chapter 3

A learner who knows all twelve major grips cold **and can point at the third in any of them** —
middle note in root position, lowest in first inversion, highest in second. Lesson 5 states it and
the checkpoint tests it.

---

## Lessons

### 1. `triad-major-strings-2-3-4` — "One Set Down, One Note Moves"

- **Section id**: `triads.ch2.major-strings-2-3-4` · **Article id**:
  `art_triad-major-strings-2-3-4` · ~5 min
- **The one thing**: moving a grip to strings 2-3-4 changes exactly one note — the middle one, one
  fret lower — and the same correction works in all three inversions.
- **Misconception**: "the shape just slides across the strings."
- **Key points, in order**:
  1. Open by doing the wrong thing on purpose. Take `x x x 5 5 3` and slide it down a set, frets
     unchanged: `x x 5 5 3 x`. That sounds G3 C4 D4 — there is a `D` in it, so it is not a C chord.
     State the notes; do not just say "it sounds wrong".
  2. **Restate the shorthand once**, plainly, since a learner may have been away: `3·5` means
     string 3, fret 5; charts are six slots, low E first, `x` = not played; string 1 is the high
     `e`. One sentence, no ceremony.
  3. The correction: on strings 2-3-4 the middle note sits **one fret lower** relative to the bass
     than it does on strings 1-2-3. Nothing else moves. Say it holds for all three inversions and
     that the reason is coming in this chapter — **do not explain the B string here**, lesson 4
     owns it.
  4. The three grips, **in neck order**, with `triad-shape` for each and notes/degrees in prose:
     - first inversion `x x 2 0 1 x` — `4·2` E3, `3·0` G3, `2·1` C4, degrees `3 5 1`, bass `E`.
       This is the `C/E` grip from chapter 1's inversion lesson, and it is the middle of the open C
       chord — link `triad-open-chords-you-know`.
     - second inversion `x x 5 5 5 x` — `4·5` G3, `3·5` C4, `2·5` E4, degrees `5 1 3`, bass `G`.
     - root position `x x 10 9 8 x` — `4·10` C4, `3·9` E4, `2·8` G4, degrees `1 3 5`, bass `C`.
  5. **The friendly shape, with its superlative checked.** `x x 5 5 5 x` is the **only one of the
     twelve grips in this pathway where all three notes sit at the same fret** — that is the exact,
     verified claim, and it is the one to write. One small barre, or three fingers side by side.
     Then the proof it is already fluent: the open A chord is `x 0 2 2 2 0`, and its **middle**
     three strings — strings 4, 3 and 2 all at fret 2 — are E3 A3 C#4, an A major triad in second
     inversion on this exact set. The learner has held this shape since week one. (Chapter 1 used
     open A's *top* three strings; this is different material, and say so in half a sentence so it
     doesn't read as a repeat.)
  6. Summary table: inversion, chart, notes low→high, degrees, bass.
  7. Close by pointing down one more set and asking whether the middle note moves again.
- **Live**: `triad-shape` × 3 — `{root:"C", strings:"2-3-4", inversion:"first"}`, then `"second"`,
  then `"root"`. Neck order.
- **Leaves the next lesson**: one set conquered, one correction learned, and an open question about
  whether the *same* correction repeats.

### 2. `triad-major-strings-3-4-5` — "The Middle of the Guitar"

- **Section id**: `triads.ch2.major-strings-3-4-5` · **Article id**:
  `art_triad-major-strings-3-4-5` · ~5 min
- **The one thing**: down another set, a *different* single note moves — the top one — and this is
  the set where nothing is bent out of shape at all.
- **Misconception**: "the correction from the last lesson repeats, so the middle note moves again."
  It does not. Set the expectation in lesson 1 and break it here.
- **Key points, in order**:
  1. Predict, then check. Last time the middle note came down a fret. This time it is the **top**
     note that comes down a fret, and the middle stays where the 2-3-4 shape put it.
  2. The three grips in neck order, `triad-shape` each:
     - root position `x 3 2 0 x x` — `5·3` C3, `4·2` E3, `3·0` G3, degrees `1 3 5`, bass `C`.
     - first inversion `x 7 5 5 x x` — `5·7` E3, `4·5` G3, `3·5` C4, degrees `3 5 1`, bass `E`.
     - second inversion `x 10 10 9 x x` — `5·10` G3, `4·10` C4, `3·9` E4, degrees `5 1 3`, bass
       `G`.
  3. **The open C connection.** `x 3 2 0 1 0` read on strings 5-4-3 is exactly the root position
     grip. Chapter 1 showed this in `triad-open-chords-you-know`; here it is the anchor rather than
     the surprise — link the article and move on in one or two sentences. Do not re-table the whole
     dissection.
  4. **The set's character, honestly.** Two claims, kept separate:
     - *Measurable*: an acoustic guitar's body has an air resonance near 100 Hz and a top-plate
       resonance near 200 Hz, and open strings 5, 4 and 3 are A2 (110 Hz), D3 (147 Hz) and G3
       (196 Hz) — sitting on those peaks, so the instrument itself reinforces this region. One
       sentence, no more; a footnote is the right home for the numbers if the prose gets heavy.
     - *Idiom*: the rest of "the middle sounds full" is convention — this is the register most
       comping vocabulary grew up in. **Say that out loud.** Do not claim the ear is most sensitive
       here; it is not.
  5. **The first hint of the rule.** Two sets down, two different single notes moved. Name the
     pattern without explaining it: nothing about this set's grips is displaced — they are the
     plain shapes, and it is the higher sets that have been bent. Promise the reason next.
- **Live**: `triad-shape` × 3 — `{root:"C", strings:"3-4-5", inversion:"root"}`, then `"first"`,
  then `"second"`.
- **Leaves the next lesson**: the suspicion that 3-4-5 is the baseline and everything above it is
  adjusted.

### 3. `triad-major-strings-4-5-6` — "The Bottom Set, and When to Leave It Alone"

- **Section id**: `triads.ch2.major-strings-4-5-6` · **Article id**:
  `art_triad-major-strings-4-5-6` · ~6 min
- **The one thing**: strings 4-5-6 hold the same shapes as strings 3-4-5 with nothing changed at
  all — and are the one set where the decision to use them is a real decision.
- **Misconception**: "lower is fuller." Also: "if the app draws a grip at fret 12, that is an
  arbitrary choice."
- **Key points, in order**:
  1. Third move down, and this time **nothing moves**. The 3-4-5 shapes transfer exactly. Be
     concrete: `x 3 2 0 x x` becomes `8 7 5 x x x` — the identical shape, five frets up the neck,
     because string 5 to string 6 is a fourth and a fourth is five frets. Same for the first
     inversion: `x 7 5 5 x x` → `12 10 10 x x x`. The second inversion's five-frets-up copy would
     land at fret 15, so the playable one is that same shape an octave lower: `3 3 2 x x x`.
  2. The three grips in neck order, `triad-shape` each:
     - second inversion `3 3 2 x x x` — `6·3` G2, `5·3` C3, `4·2` E3, degrees `5 1 3`, bass `G`.
     - root position `8 7 5 x x x` — `6·8` C3, `5·7` E3, `4·5` G3, degrees `1 3 5`, bass `C`.
     - first inversion `12 10 10 x x x` — `6·12` E3, `5·10` G3, `4·10` C4, degrees `3 5 1`, bass
       `E`.
  3. **Why the first inversion is up at fret 12.** Walk it: it needs `E` in the bass, and the
     lowest `E` on string 6 is the open string, E2. The close voicing wants the next `G` above E2,
     which is G2 — but string 5 open is A2, *higher* than G2, so string 5 cannot play a G2 at all.
     The lowest `G` string 5 can reach is G3 at `5·10`, a tenth above the bass instead of a minor
     third — not close, and not a hand span. So the grip has to wait until the `E` on string 6 is
     E3, at fret 12. The app finds this by itself; the lesson explains it. **This is the lesson's
     best paragraph — give it room.**
  4. **Mud, told accurately.** This is where the brief was optimistic and the code is the
     authority. The app's voicing engine rejects two adjacent notes that sit too close together too
     low: below A2 it wants at least a major third between them, below C3 at least three semitones,
     below A3 at least two. **Every one of C major's grips down here passes** — say so plainly.
     What is true is how little room is left. The second inversion's bass is G2, below the open A
     string and therefore under the strictest of the three rules; the fourth up to C3 clears it by
     a single semitone.
  5. **The floor, made concrete — and the chapter's one deliberate step outside C.** Open G is
     `3 2 0 0 0 3`. Chapter 1 read its *top* three strings and found a doubled root and no fifth.
     Read its **bottom** three — `6·3` G2, `5·2` B2, `4·0` D3 — and you have a complete G major
     triad in root position on strings 4-5-6. It is the lowest close major triad on the guitar, and
     **both of its gaps sit exactly on the app's limit**: a major third from G2 to B2 where a major
     third is the minimum, and three semitones from B2 to D3 where three is the minimum. One
     semitone tighter anywhere and the engine throws the voicing out. Name why you left C for one
     example.
  6. **When to use it and when not**, three lines, concrete: use it when nothing else is down there
     — solo guitar, a bass-less duo, the bottom of an arrangement. Leave it alone when a bass
     player is working, because that register is theirs and the two blur into each other. This is
     an arrangement argument, not a rule.
  7. Close: three sets down, three different outcomes — one note moved, then a different note
     moved, then nothing moved. Something is causing that, and it has a name.
- **Live**: `triad-shape` × 3 — `{root:"C", strings:"4-5-6", inversion:"second"}`, then `"root"`,
  then `"first"`. Neck order, so the first inversion's height is visible.
- **Leaves the next lesson**: three observations demanding one explanation.

### 4. `triad-the-b-string-shift` — "The B String Explains All of It"

- **Section id**: `triads.ch2.the-b-string-shift` · **Article id**: `art_triad-the-b-string-shift`
  · ~5 min
- **The one thing**: standard tuning is all fourths except G→B, which is a major third, and every
  note sitting above that break is one fret higher than an all-fourths guitar would put it. Three
  geometries, one cause.
- **Misconception**: "there are four sets, so there are four shapes to learn." There are three.
- **Key points, in order**:
  1. Lead with the tuning itself, checked interval by interval: E→A, A→D, D→G are all five
     semitones; **G→B is four**; B→e is five again. One string pair out of five is different, and
     that is the whole of it.
  2. The consequence, stated once and precisely: a note on a string **above** the G→B break has to
     be fretted **one fret higher** than an all-fourths guitar would need, to sound the same pitch.
  3. Count the lifted notes per set. Table it: 4-5-6 and 3-4-5 use no string above the break, so
     nothing lifts; 2-3-4 uses string 2, so its top note lifts by one; 1-2-3 uses strings 2 and 1,
     so its top **two** notes lift by one each.
  4. **Then resolve the puzzle from lessons 1–3.** Why did moving from 1-2-3 to 2-3-4 change only
     the *middle* note, when two notes are lifted on 1-2-3? Because both sets have their top note
     lifted, so the top cancels and only the middle is left over. Moving from 2-3-4 to 3-4-5, only
     the top is left over. Moving from 3-4-5 to 4-5-6, nothing is. **This is the strongest
     paragraph in the chapter — write it carefully and do not compress it.**
  5. The relative-shape table (frets measured from the bass), all four sets × three inversions,
     copied from the verified reference above. Point out that the 3-4-5 and 4-5-6 rows are
     identical, and that this holds for every inversion.
  6. **The payoff.** `x x 5 5 5 x` is not a coincidence. On an all-fourths guitar a second
     inversion is `0 0 −1` — the top note one fret back. The B string lifts that top note by one,
     which lands it flush: `0 0 0`. **The friendliest shape on the guitar exists because of the
     tuning's one irregularity.** Same story on strings 1-2-3, where two lifts turn `0 0 −1` into
     `0 +1 0` — the `x x x 0 1 0` grip that pokes up in the middle.
  7. Close: three shapes, not twelve, and the next lesson puts all twelve on one map anyway.
- **Live**: `triad-shape` × 1 — `{root:"C", strings:"2-3-4", inversion:"second", caption: …}`, with
  a caption tying the flat shape to the rule. No other live block; this lesson's work is tables and
  argument, and three more diagrams would bury it.
- **Leaves the next lesson**: the reason the map is learnable.

### 5. `triad-the-whole-neck` — "Twelve Grips, One Chord"

- **Section id**: `triads.ch2.the-whole-neck` · **Article id**: `art_triad-the-whole-neck` · ~5 min
- **The one thing**: the four ladders side by side are one chord covering the entire fretboard —
  and the map has a rule for finding the third in any of them.
- **Misconception**: "twelve grips is twelve things to memorise."
- **Key points, in order**:
  1. The master table: four rows, three columns, all twelve charts. Recompute every cell against
     the verified reference. Keep cells to the chart alone so the columns stay readable.
  2. `triad-ladder` × 4, one per set, each with one or two sentences. What each ladder shows that
     the table cannot: the cycle, and where it restarts. **Note that each set begins its cycle on a
     different inversion** — 1-2-3 starts at the nut on the second inversion, 2-3-4 on the first,
     3-4-5 on the root, 4-5-6 on the second — so "second, root, first" is not a sequence to carry
     between sets. Say once that the ladders are silent (no play button); chapter 1 already said it
     for the first one, so a short reminder is enough.
  3. Between them, the cross-set observation: pick any horizontal band of the neck and there is a C
     major triad on every set within a few frets of it. The chord is never far away.
  4. **The third-finding rule**, stated as its own beat because chapter 3 depends on it. In root
     position the third is the middle note; in first inversion it is the lowest; in second
     inversion it is the highest — on every set, always, because the inversion *is* the rotation
     that decides it. Table it and invite the learner to point at the third in each of the four
     ladders above.
  5. `/chord-shapes` as the place to see any of these alongside every other voicing of the same
     chord. Link text "Chord Shapes".
- **Live**: `triad-ladder` × 4 — `{root:"C", strings:"1-2-3"}`, `"2-3-4"`, `"3-4-5"`, `"4-5-6"`.
  Keep the prose between them tight; this lesson is mostly diagram.
- **Leaves the next lesson**: the whole map, and no way yet of choosing a point on it.

### 6. `triad-choosing-a-set` — "Which Set, and Why"

- **Section id**: `triads.ch2.choosing-a-set` · **Article id**: `art_triad-choosing-a-set` · ~4 min
- **The one thing**: the set is a decision about register and about what else is sounding; the
  inversion is then just whichever copy is nearest your hand.
- **Misconception**: "pick whichever one you can reach." Half right, and the half it gets wrong is
  the half that matters in a band.
- **Key points, in order**:
  1. Separate the two decisions, and say which comes first. **The set decides how the chord sits in
     the music. The inversion decides how far your hand travels.** Almost every choice in this
     chapter is that pair, in that order.
  2. The register table: C major's span on each set — 1-2-3 G3 to C5, 2-3-4 E3 to G4, 3-4-5 C3 to
     E4, 4-5-6 G2 to C4. Each set down is a step lower; the four together cover more than two
     octaves of the same three note names.
  3. **What else is sounding**, concretely, three or four lines:
     - A bass player owns roughly the bottom of the guitar's range, so strings 4-5-6 is the set
       most likely to collide with someone.
     - A sung lead usually lives in the middle. The advice players are actually given is to stay
       out of the singer's range — frame it from above rather than double it.
     - Strings 1-2-3 sit at the top of or above most sung melodies, which is why they cut through
       and why so much rhythm work lives there. This refines chapter 1's claim; do not contradict
       it.
     - Strings 3-4-5 is the fullest, and is also where a piano or a second guitar is most likely to
       be — the one you give up first in a crowded arrangement.
  4. A short worked decision or two, in a list: *solo, no bass* → 3-4-5 or 4-5-6, because you are
     the whole arrangement. *Behind a singer, with a band* → 1-2-3, above the melody. *Two
     guitars* → take a different set from the other player.
  5. Then the second half: once the set is chosen, take **whichever inversion is nearest**, because
     all three are the same chord. That is a claim the learner already believes from chapter 1 and
     it is what the next lesson spends.
  6. Close pointing at the applied lesson.
- **Live**: none required. If one is wanted, a single `triad-shape` contrasting two registers is
  acceptable, but a table plus prose is the honest tool here and the lesson should stay short.
  Screen links: `/chord-shapes`.
- **Leaves the next lesson**: a chosen set, and a reason to stop jumping around.

### 7. `triad-moving-the-least` — ★ "Move as Little as Possible"

- **Section id**: `triads.ch2.moving-the-least` · **Article id**: `art_triad-moving-the-least` ·
  ~6 min
- **The one thing**: play three chords on one string set by taking the nearest inversion each time,
  and the whole progression fits inside five frets with a finger staying put on two of the three
  changes.
- **Misconception**: "changing chord means moving to the chord's shape." No — it means moving to
  the nearest copy of the next chord.
- **Key points, in order**:
  1. Open with the problem, concretely. Play C, F and G as barre chords and you cross the neck: C
     at fret 8, F at fret 1, G at fret 3. Every change is a jump, and every jump is a chance to be
     late. **Do not use Roman numerals in prose** and do not call this a harmonised scale — these
     are three chords in C.
  2. The sequence, one grip at a time, with notes named:
     - C, second inversion, `x x x 0 1 0` — G3 C4 E4
     - F, first inversion, `x x x 2 1 1` — A3 C4 F4
     - G, first inversion, `x x x 4 3 3` — B3 D4 G4
     - C, root position, `x x x 5 5 3` — C4 E4 G4
  3. The movement, spelled out change by change and **checked against the verified table**:
     - C → F: string 3 up two frets, string 1 up one, and **string 2 does not move at all** — the
       `C` is in both chords, so the finger stays.
     - F → G: all three strings up two frets. The shape does not change; it slides.
     - G → C: string 3 up one, string 2 up two, and **string 1 does not move** — `G` is in both.
  4. The whole thing lives between fret 0 and fret 5. Say it, because it is the payoff.
  5. Summary table: chord, inversion, chart, notes.
  6. **How to practise it.** Loop the four grips against `/metronome` (link text "Metronome"), one
     chord per bar, slow. Then a second pass: before each change, find the note that does *not*
     move and put that finger down first. Then a third: play the same four chords but start from C
     root position `x x x 5 5 3` and go up instead of down, to prove the trick is not memorised
     positions — F's second inversion is `x x x 5 6 5` and G's is `x x x 7 8 7`, so the same
     progression can run frets 3–8 just as easily. (Both verified; recheck them.)
  7. **The rule, stated as feel, never as a term**: pick the copy of the next chord that is nearest
     to your hand, and let a finger stay where it can. That is all. **The words "voice leading" must
     not appear** — chapter 5 names it.
  8. Close on chapter 3 by number: the same twelve grips, one note moved one fret, and that note is
     the third — which you can now find in any of them without thinking.
- **Live**: `triad-shape` × 2 — `{root:"F", strings:"1-2-3", inversion:"first"}` and
  `{root:"G", strings:"1-2-3", inversion:"first"}`. These are the two new grips; chapter 1 already
  drew both C grips and the table carries them, so do not redraw them.
- **Leaves**: the chapter's payoff, and an opening for minor triads.

---

## Activities

### A. `triad-one-chord-four-sets`

- **Section id**: `triads.ch2.one-chord-four-sets` · `"optional": true` · ~6 min
- **Kind**: `note-play`, modes `easy` and `hard`, document board frets 0–12.
- **What it drills**: that one chord's grips are scattered over the whole neck, and specifically the
  four grips with the most character in the chapter.
- **Rounds** (no two targets in a round share a pitch — checked):
  1. `r_triad-one-chord-four-sets.the-flat-one` — `x x 5 5 5 x`: `4·5` G3 (55), `3·5` C4 (60),
     `2·5` E4 (64).
  2. `r_triad-one-chord-four-sets.inside-open-c` — `x 3 2 0 x x`: `5·3` C3 (48), `4·2` E3 (52),
     `3·0` G3 (55).
  3. `r_triad-one-chord-four-sets.the-low-one` — `3 3 2 x x x`: `6·3` G2 (43), `5·3` C3 (48),
     `4·2` E3 (52).
  4. `r_triad-one-chord-four-sets.the-one-that-waits` — `12 10 10 x x x`: `6·12` E3 (52),
     `5·10` G3 (55), `4·10` C4 (60). The grip that cannot be held lower.

### B. `triad-play-the-changes`

- **Section id**: `triads.ch2.play-the-changes` · `"optional": true` · ~6 min
- **Kind**: `note-play`, modes `easy` and `hard`, document board frets 0–5.
- **What it drills**: the applied lesson's four grips, in order, inside one hand position.
- **Rounds** (pitches distinct within each round — checked):
  1. `r_triad-play-the-changes.c-second` — `x x x 0 1 0`: `3·0` G3 (55), `2·1` C4 (60), `1·0` E4
     (64).
  2. `r_triad-play-the-changes.f-first` — `x x x 2 1 1`: `3·2` A3 (57), `2·1` C4 (60), `1·1` F4
     (65).
  3. `r_triad-play-the-changes.g-first` — `x x x 4 3 3`: `3·4` B3 (59), `2·3` D4 (62), `1·3` G4
     (67).
  4. `r_triad-play-the-changes.c-root` — `x x x 5 5 3`: `3·5` C4 (60), `2·5` E4 (64), `1·3` G4
     (67).

---

## Checkpoint — `triads-ch2-checkpoint`

`kind: "checkpoint"`, `passThresholdPct: 70`, title "Checkpoint: Major Triads Everywhere".
**Written after the finished articles are read, from what they actually say.** Planned coverage:

1. The naive slide — what is wrong with `x x 5 5 3 x` (L1).
2. The `x x 5 5 5 x` shape and where the learner has already played it (L1).
3. Which single note moves going from strings 2-3-4 down to strings 3-4-5 (L2).
4. Why the first inversion on strings 4-5-6 sits at fret 12 (L3).
5. The B-string rule — how many notes are lifted on which set, and why 3-4-5 and 4-5-6 are
   identical (L4).
6. Finding the third in a given grip (L5) — the chapter-3 handoff.
7. Choosing a set for a stated situation (L6).
8. The applied progression — which note stays put across a change (L7).

Trim to seven if any two collapse into one.

---

## Dispatch

- **Agent A** — lessons 1, 2, 3. The three set lessons; establishes the "one note moved" framing
  and restates the `3·5` shorthand.
- **Agent B** — lessons 4, 5, 6, 7. Given Agent A's exact claims verbatim, so it explains and
  extends rather than re-derives.

Both are told: the content gate is red mid-chapter because the corpus counts in
`packages/content/src/load.test.ts` are pinned; that is expected, and they must not touch it.
