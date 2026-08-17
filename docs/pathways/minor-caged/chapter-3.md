# Chapter 3 — The Minor Pentatonic in Each Form

Chapter id `minor-caged.ch3` · slug `the-minor-pentatonic` · 7 articles, 2 activities, 1 checkpoint.

After this chapter the learner can play A minor pentatonic anywhere on the neck **and knows which of
its five notes are chord tones** — the difference between running a scale and playing over a chord.

**Structure**, mirroring chapter 2 and `caged-fretboard` chapter 3: an opener on the two notes this
layer adds, the five form lessons in strict C-A-G-E-D order, and a closer. The closer is a fixed
assignment from the top level: reconcile the CAGED forms with the "Boxes" numbering
`/scale-visualizer` also offers for the same five notes, and name the `b5` blue note exactly once.

---

## Verified facts this chapter is built on

Every number below was **recomputed** from the app's own `cagedFormWindows` / `cagedMarks` /
`CAGED_FORM_OFFSETS` / `PENTATONIC_WINDOWS` (`mobile/src/lib/guitar-positions/caged.ts` and
`windows.ts`), not remembered, not scaled from the brief's triad table, not taken from any website.
**These are the numbers every lesson must use.** String numbering is **1 = high e, 6 = low E**
everywhere. `1` = `A`, `b3` = `C`, `4` = `D`, `5` = `E`, `b7` = `G`.

### The layer

The minor pentatonic is `1 b3 4 5 b7` — in A, the notes `A C D E G`. That is chapter 2's minor triad
(`1 b3 5`) plus the **`4`** and the **`b7`**, and nothing else. Verified in every window: the triad's
dots are a strict subset of the pentatonic's, in all five forms. **The learner is not being handed a
new shape.**

**The trap.** The pentatonic has `b3` and `b7` but **no `b6`**. Chapter 1's phrase "the three notes
that drop" (`b3 b6 b7`) is a fact about the whole natural minor scale and is **false of this layer**.
No lesson may reuse it. A lesson connecting back to chapter 1 must say *which two* of the three are
here.

Three of the five notes — `1 b3 5` — are the `Am` chord. Two — `4` and `b7` — are not. That
distinction is the chapter's arc line and every form lesson must name its own window's non-chord
dots explicitly.

### A minor's five windows, unchanged since chapter 2

```
A minor:  A 0–3   G 1–5   E 4–8   D 6–10   C 9–13
```

A minor's A form is **four frets, `0–3`**, because the nut cuts it short. No lesson may call it five
frets wide.

### Every window, dot by dot at `show: "pentatonic"`, `quality: "minor"`

Written low string first. `*` marks a dot that is **new since chapter 2** — a `4` or a `b7`.

**C form — window `9–13`. 12 dots. Dots on frets 9, 10, 12, 13 — nothing at fret 11.**

| String | Lower dot | Upper dot |
| --- | --- | --- |
| 6 | `6·10` `4` (`D`) \* | `6·12` `5` (`E`) |
| 5 | `5·10` `b7` (`G`) \* | `5·12` `1` (`A`) |
| 4 | `4·10` `b3` (`C`) | `4·12` `4` (`D`) \* |
| 3 | `3·9` `5` (`E`) | `3·12` `b7` (`G`) \* |
| 2 | `2·10` `1` (`A`) | `2·13` `b3` (`C`) |
| 1 | `1·10` `4` (`D`) \* | `1·12` `5` (`E`) |

- Chord tones **7**: `6·12`, `5·12`, `4·10`, `3·9`, `2·10`, `2·13`, `1·12`.
- Not chord tones **5**: `6·10`, `5·10`, `4·12`, `3·12`, `1·10`.
- Roots: `5·12`, `2·10`. Tripled degrees: `4` (three) and `5` (three).
- Three-fret reaches: string 3 (`9`→`12`), string 2 (`10`→`13`).
- **Dot spread: frets 9 to 13 — five frets.** Needs a shift or a stretch.
- MIDI, all distinct: 50 52 55 57 60 62 64 67 69 72 74 76.

**A form — window `0–3`. 12 dots. Dots on frets 0, 1, 2, 3 — every fret in the window used.**

| String | Lower dot | Upper dot |
| --- | --- | --- |
| 6 | `6·0` `5` (`E`) | `6·3` `b7` (`G`) \* |
| 5 | `5·0` `1` (`A`) | `5·3` `b3` (`C`) |
| 4 | `4·0` `4` (`D`) \* | `4·2` `5` (`E`) |
| 3 | `3·0` `b7` (`G`) \* | `3·2` `1` (`A`) |
| 2 | `2·1` `b3` (`C`) | `2·3` `4` (`D`) \* |
| 1 | `1·0` `5` (`E`) | `1·3` `b7` (`G`) \* |

- Chord tones **7**: `6·0`, `5·0`, `5·3`, `4·2`, `3·2`, `2·1`, `1·0`.
- Not chord tones **5**: `6·3`, `4·0`, `3·0`, `2·3`, `1·3`.
- Roots: `5·0`, `3·2`. Tripled degrees: `5` (three) and `b7` (three).
- Three-fret reaches: strings 6, 5 and 1, all `0`→`3`.
- **Five of the six strings have their lower dot on an open string.** Only string 2 breaks it, at
  `2·1`, because the open `B` is not in A minor pentatonic. (`B` is the `2` — do not say so; see the
  scope guard.)
- A **major** pentatonic in this same window holds only **10** dots. This is the one window that
  gains two dots when the quality changes.
- MIDI, all distinct: 40 43 45 48 50 52 55 57 60 62 64 67.

**G form — window `1–5`. 13 dots — the odd one out. Dots on frets 1, 2, 3, 5 — nothing at fret 4.**

| String | Dots |
| --- | --- |
| 6 | `6·3` `b7` (`G`) \* · `6·5` `1` (`A`) |
| 5 | `5·3` `b3` (`C`) · `5·5` `4` (`D`) \* |
| 4 | `4·2` `5` (`E`) · `4·5` `b7` (`G`) \* |
| 3 | `3·2` `1` (`A`) · `3·5` `b3` (`C`) |
| 2 | `2·1` `b3` (`C`) · `2·3` `4` (`D`) \* · `2·5` `5` (`E`) — **three** |
| 1 | `1·3` `b7` (`G`) \* · `1·5` `1` (`A`) |

- Chord tones **8**: `6·5`, `5·3`, `4·2`, `3·2`, `3·5`, `2·1`, `2·5`, `1·5`.
- Not chord tones **5**: `6·3`, `5·5`, `4·5`, `2·3`, `1·3`.
- Roots: `6·5`, `3·2`, `1·5`. Tripled degrees: `1`, `b3` **and** `b7`, three each — the only window
  that triples three degrees, because it is the only one with thirteen dots.
- Three-fret reaches: strings 4 and 3, both `2`→`5`.
- **Dot spread: frets 1 to 5 — five frets.**
- Two of its thirteen dots sound the **same pitch**: `2·1` and `3·5` are both `C4`. This matters for
  the activity, not for the prose.
- A **major** pentatonic in this window holds 12. Minor gains one.

**E form — window `4–8`. 12 dots. Dots on frets 5, 7 and 8 only — nothing at fret 4 or fret 6.**

| String | Lower dot | Upper dot |
| --- | --- | --- |
| 6 | `6·5` `1` (`A`) | `6·8` `b3` (`C`) |
| 5 | `5·5` `4` (`D`) \* | `5·7` `5` (`E`) |
| 4 | `4·5` `b7` (`G`) \* | `4·7` `1` (`A`) |
| 3 | `3·5` `b3` (`C`) | `3·7` `4` (`D`) \* |
| 2 | `2·5` `5` (`E`) | `2·8` `b7` (`G`) \* |
| 1 | `1·5` `1` (`A`) | `1·8` `b3` (`C`) |

- Chord tones **8**: `6·5`, `6·8`, `5·7`, `4·7`, `3·5`, `2·5`, `1·5`, `1·8`.
- Not chord tones **4**: `5·5`, `4·5`, `3·7`, `2·8`. **The fewest of the five windows** — every other
  window has five. Verified.
- Roots: `6·5`, `4·7`, `1·5` — chapter 2's `6 → 4 → 1` map.
- Tripled degrees: `1` (three) and `b3` (three).
- Three-fret reaches: strings 6, 2 and 1, all `5`→`8`.
- **Fret 5 holds all six strings**: degrees low to high `1 4 b7 b3 5 1`, notes `A D G C E A`. Checked
  over every fret 0–15: **fret 5 is the only one** where all six strings sound a note of A minor
  pentatonic. Four of those six are chord tones (`6·5`, `3·5`, `2·5`, `1·5`); `5·5` and `4·5` are not.
- MIDI, all distinct: 45 48 50 52 55 57 60 62 64 67 69 72.

**D form — window `6–10`. 12 dots. Dots on frets 7, 8, 9, 10 — nothing at fret 6.**

| String | Lower dot | Upper dot |
| --- | --- | --- |
| 6 | `6·8` `b3` (`C`) | `6·10` `4` (`D`) \* |
| 5 | `5·7` `5` (`E`) | `5·10` `b7` (`G`) \* |
| 4 | `4·7` `1` (`A`) | `4·10` `b3` (`C`) |
| 3 | `3·7` `4` (`D`) \* | `3·9` `5` (`E`) |
| 2 | `2·8` `b7` (`G`) \* | `2·10` `1` (`A`) |
| 1 | `1·8` `b3` (`C`) | `1·10` `4` (`D`) \* |

- Chord tones **7**: `6·8`, `5·7`, `4·7`, `4·10`, `3·9`, `2·10`, `1·8`.
- Not chord tones **5**: `6·10`, `5·10`, `3·7`, `2·8`, `1·10`.
- Roots: `4·7`, `2·10` — **both on inside strings**, nothing on 6 or 1. Tripled degrees: `b3` (three)
  and `4` (three).
- Three-fret reaches: strings 5 and 4, both `7`→`10`.
- MIDI, all distinct: 48 50 52 55 57 60 62 64 67 69 72 74.

### The four seams — every one holds all five notes

| Seam | Frets | Dots | Degrees present |
| --- | --- | --- | --- |
| A ∩ G | `1–3` | `6·3` `b7`, `5·3` `b3`, `4·2` `5`, `3·2` `1`, `2·1` `b3`, `2·3` `4`, `1·3` `b7` | all five |
| G ∩ E | `4–5` | `6·5` `1`, `5·5` `4`, `4·5` `b7`, `3·5` `b3`, `2·5` `5`, `1·5` `1` — **all at fret 5** | all five |
| E ∩ D | `6–8` | `6·8` `b3`, `5·7` `5`, `4·7` `1`, `3·7` `4`, `2·8` `b7`, `1·8` `b3` | all five |
| D ∩ C | `9–10` | `6·10` `4`, `5·10` `b7`, `4·10` `b3`, `3·9` `5`, `2·10` `1`, `1·10` `4` | all five |

Chapter 2's version was "every seam holds a complete `1 b3 5` on three adjacent strings". The
pentatonic version is stronger: **every seam holds all five notes of the scale**, and three of the
four hold them one per string.

### Frets that hold nothing

Frets **4, 6 and 11** carry no A minor pentatonic note on any string. That is why the E form's twelve
dots live on only three frets and why the C form skips fret 11.

### The CAGED tiling laid over the Boxes tiling — the closer's whole content

`/scale-visualizer` offers two position systems for a five-note scale (`systemsFor`), labelled
**CAGED** and **Boxes**. They are different tilings. Set the scale to **minor pentatonic** — A
natural minor has seven notes, so its second toggle is `3/str`, not Boxes.

**Why they differ, derived, not asserted.** Both tilings are five windows placed relative to the
fret where the root sits on the low E string (fret 5 for A).

- The **CAGED** windows are placed where the five chord shapes put their barre: `0`, `2`, `4`, `7`,
  `9` frets above that root. (Chapter 2's verified barre frets for A minor — E at 5, D at 7, C at 9,
  A at 0/12, G at 2/14 — are exactly those offsets.)
- The **Boxes** are placed on the minor pentatonic itself: `0`, `3`, `5`, `7`, `10` frets above that
  root — `1 b3 4 5 b7`, walked up the low E string. On the low E in A minor that is frets
  `0, 3, 5, 8, 10, 12`, and those are exactly where the boxes start.

**Two of those five offsets agree — `0` and `7` — and exactly two of the five pairs coincide.**

What the app actually pages through, verified by running `cagedPositions` and `boxPositions` on A
minor pentatonic:

| Box | Frets | CAGED partner | Frets | Relationship |
| --- | --- | --- | --- | --- |
| Box 1 | `5–8` | **E form** | `4–8` | **The same twelve dots.** Fret 4 holds none. |
| Box 2 | `8–10` | D form | `6–10` | Box has 9; the form adds `5·7` `5`, `4·7` `1`, `3·7` `4` |
| Box 3 | `10–12` | C form | `9–13` | Box has 10; the form adds `3·9` `5` and `2·13` `b3` |
| Box 4 | `0–3` | **A form** | `0–3` | **The same twelve dots.** The nut clamps the A form to Box 4's span. |
| Box 5 | `3–5` | G form | `1–5` | Box has 10; the form adds `4·2` `5`, `3·2` `1`, `2·1` `b3` |

**Every box's dots are a subset of its CAGED partner's** — checked position by position. A box is
never wider than its form and never holds a dot the form does not. The box is the form with its
bottom trimmed (and, for Box 3, its top as well).

In neck order for A minor the two systems interleave like this — the app's own pagers, verified:

```
CAGED:  A form 0–3 | G form 1–5 | E form 4–8 | D form 6–10 | C form 9–13 | A form 11–15 | G form 13–15
Boxes:  Box 4 0–3  | Box 5 3–5  | Box 1 5–8  | Box 2 8–10  | Box 3 10–12 | Box 4 12–15
```

So the box numbers run `4, 5, 1, 2, 3` from the nut. **Box 1 is not the box nearest the nut** — it is
the one that starts on the root on the low E string, which for A minor is fret 5. That is the box
half the guitar-playing world calls "the A minor pentatonic at fret 5", and it is **the E form**.

A web search agreed on the pairing (Box 1 ↔ E shape, Box 2 ↔ D shape) but nothing found online gave
the fret spans or the dot-level relationship. **The app's tables are the authority here**, as the
top level instructed; the web is only corroboration that the numbering convention is the usual one.

### The `b5`

The note between the `4` and the `5` — the `b5` — is not in the minor pentatonic. In A it sits one
fret above every `4`: `4·1`, `2·4`, `3·8`, `5·6`, `1·11`, `6·11`, `4·13`. **The closer names it in
one sentence as a passing note and stops.** No blues, no bends, no phrasing, no positions listed, no
second sentence. The app's own blues scale spells it `Eb`; the closer does not need the letter at
all and should use the degree.

---

## Scope guards

- **The pentatonic only.** `1 b3 4 5 b7`. No `2`, no `b6` beyond the single naming clause in the
  opener (below). No chords of the key, no Roman numerals, no raised seventh, no harmonic minor.
- **The `b6` naming clause.** The opener **must** say that the `b6` is not in this layer — that is
  the trap the pathway brief flags explicitly, and a learner who carries "the three notes that drop"
  into this chapter will get it wrong. The opener may name the `2` and the `b6` as the two notes the
  pentatonic leaves out, in **one clause**, and must teach neither: no positions, no degree
  character, no "darkest note", no `show: "scale"` diagram anywhere in the chapter. Chapter 4 owns
  both notes.
- **Never "the three notes that drop"**, or any rewording of it, anywhere in this chapter.
- **Do not re-teach chapter 2.** The window is anchored on the root; the window-edge effect; the
  five grips; where the `b3` is in each. Link, do not restate.
- **Do not re-derive chapter 1's `4–8` coincidence.** `minor-caged-one-window-two-names` owns it. The
  E form lesson links back in one sentence.
- **Boxes are named in the closer and nowhere else.** No form lesson mentions Box numbers.
- **The `b5` is named in the closer and nowhere else**, once.
- **Never "m3", never "mode", never "Aeolian", never "the Em form".** Degrees are `1 b3 4 5 b7`.
- **No `triad-shape` / `triad-ladder`** — different pathway.
- **No `url` links anywhere in this chapter.** No `image` blocks.
- **Link text is the screen's name**, never its route: `Scale Visualizer`, not `/scale-visualizer`.
- **A major appears nowhere in this chapter** except the single dot-count comparison in the A form
  lesson. C major appears only in the E form lesson's one-sentence link back to chapter 1.

## Superlatives this chapter is allowed — recomputed; nothing else may be claimed

- **E form**: the **only** window whose pentatonic layer has just **four** non-chord dots; every
  other has five. Fret 5 is the **only** fret on the neck where all six strings sound a note of this
  scale.
- **G form**: the **only** window holding **thirteen** dots; the **only** one with three dots on a
  single string; the **only** one that triples three degrees.
- **A form**: the **only** window whose dots sit on open strings; the **only** one that gains two
  dots when the quality changes (10 in major, 12 in minor); the **narrowest** window at four frets.
- **C form**: the **highest** of the five windows; the **only** window with a completely empty fret
  inside its own dot spread (fret 11, between dots at 10 and 12).
- **D form**: the **only** window whose two roots are both on inside strings *and* which triples the
  `b3` and the `4` together. (Its two roots are **not** the fewest — the A and C forms also have two.)
- Every one of the four seams holds all five notes of the scale.
- Exactly **two** Box/form pairs hold identical dots (Box 1 / E form, Box 4 / A form).

**Not allowed**, because they are false:

- "twelve dots, two on every string, in every window" — the G form has thirteen and three on string 2.
- "the C form is the only window that spreads five frets" — the G form does too (`1`→`5`).
- "the D form has the fewest roots" — three windows have two.
- "the E form has the most chord tones" — the G form also has eight (of thirteen). The true claim is
  **fewest non-chord tones**, and the highest proportion.
- "the pentatonic is the natural minor with the `b6` taken out" — two notes are missing, not one.
- "A minor's boxes are the CAGED forms renumbered" — three of the five hold different dots.
- Calling A minor's A form a five-fret window.

### The diagram convention, restated once per chapter and then flipped

`caged-shape` draws **everything in the window, not one playable grip**. Chapter 2 said so because
its windows held 7–8 dots where a hand holds 4–6. Here the consequence flips: two dots per string
across three or four frets is roughly what a hand plays, so for the A, E and D forms the diagram
*is* the shape. The G form (dots across frets 1–5) and the C form (dots across frets 9–13) are the
two that ask for a shift. **The opener states the convention and the flip; the G and C form lessons
each say plainly that theirs is one of the two that spreads.**

---

## The lessons

Seven articles, in order. The five form slugs are fixed by the pathway brief; the opener and closer
are chosen here. Section ids are progress keys and are **never** renamed.

Every article: `schemaVersion: 1`, `publishedAt: "2026-08-14"`, `tags: ["caged", "minor"]`,
`readingTimeMin` = ceil(words ÷ 200) with a floor of 2. `meta.slug` equals the filename stem. The
title is `meta.title` and **no article opens with a heading block**.

Every form lesson uses `live` · `caged-shape` ·
`{ "root": "A", "form": "<letter>", "quality": "minor", "show": "pentatonic", "caption": "…" }` —
the same `root` + `form` chapter 2 drew at `show: "triad"`. **Every form lesson must point at that
continuity explicitly**: same window, same roots, the triad still inside it, four or five more dots.
That continuity is the pathway's spine.

---

### 1. `minor-caged-two-more-notes` — "Two More Notes in the Same Five Windows"

- **Section id**: `minor-caged.ch3.two-more-notes` · **Article id**: `art_minor-caged-two-more-notes`
- **Length**: 700–850 words. The longest of the first six; it carries the frame.
- **Left by chapter 2**: all five minor windows and grips; where the `b3` is in each; the window is
  anchored on the root; the window-edge effect; the diagram draws the window, not the grip; the four
  seams each holding a complete `1 b3 5`; and its closing promise, in a `tip` callout, that
  "chapter 3 adds the `4` and the `b7` to each one — no new shape is ever asked for."
- **The one thing it teaches**: the minor pentatonic is chapter 2's triad with a `4` and a `b7` added
  to the same five windows — so three of its five notes are the chord and two are not.
- **The misconception it corrects**: "the minor pentatonic is a separate scale with its own five
  shapes", and its sharper cousin, "minor means the three flattened notes, so the pentatonic has a
  `b6` in it."

**Key points, in order**

1. Cash chapter 2's promise in the first paragraph. Same five windows, same five roots, two more
   notes in each. **Define the pentatonic by what it adds**: `1 b3 5` plus a `4` and a `b7`, five
   notes to the octave — `1 b3 4 5 b7`, which in A is `A C D E G`.
2. **The trap, and it is the reason this paragraph exists.** Chapter 1 taught that three notes drop
   when A major becomes A minor: `3 → b3`, `6 → b6`, `7 → b7`. Only **two** of those three are here.
   The minor pentatonic has the `b3` and the `b7` and **no `b6` at all**. A learner who reaches for
   "the three flattened notes" in this chapter will play a note that is not in the scale. Say it
   plainly, once, and give it a `warning` callout.
3. **What it leaves out**, in one clause and no more: of natural minor's seven, the pentatonic keeps
   five; the `2` and the `b6` are the two it does not, and chapter 4 puts them back. **Do not teach
   either note.** No positions, no character, no "darkest note".
4. The `live` block: `scale-compare` `{ "root": "A", "scales": ["minor", "minor-pentatonic"] }`.
   Say what to look at — seven chips on the first card, five on the second, the same root, and the
   degree labels underneath showing exactly which two are gone. Say to play both. Note honestly that
   nothing is tinted here, because the pentatonic adds nothing the scale does not already have; it
   only takes away.
5. **The spine, stated once and hard.** Three of the five — `1`, `b3`, `5` — are the `Am` chord
   chapter 2 spent seven lessons on. Two — the `4` and the `b7` — are not in that chord at all. A
   player who can see which dots are which can end a phrase on a note the chord is actually made of;
   a player who only knows the shape runs up and down it. **That is the whole point of this chapter**
   and it should be stated in those terms.
6. **The payoff worth naming once.** In the major pathway's version of this chapter, the pentatonic
   the learner already knew was the *minor* one and the chapter had to explain why it was not the one
   being taught. Here it is the one being taught. The `b3` and the `b7` sit inside the window the
   learner already owns, and the five-note scale most guitarists learn first turns out to be the
   third layer of a system they have been building for two chapters. One short paragraph. No more.
7. **The diagram convention, restated then flipped.** A window diagram lights every note of the layer
   inside the window, not one grip. At the triad layer that meant more dots than a hand could hold.
   Here it means the opposite for most of the five: two dots per string over three or four frets is
   about what a hand plays. Two of the five spread wider and their own lessons say so.
8. **The two `live` blocks, adjacent, and this is the chord-tone point made visible**: `caged-shape`
   `{ "root": "A", "form": "C", "quality": "minor", "show": "triad" }` then the same window at
   `"show": "pentatonic"`. Seven dots then twelve. The seven are still there and still in the same
   places; five more have appeared around them. Say which five: `6·10` `4`, `5·10` `b7`, `4·12` `4`,
   `3·12` `b7`, `1·10` `4`. Do **not** teach the C form's character or fingering — the next lesson
   owns it.
9. Close on the C form, and say why the chapter opens on the highest and least friendly of the five:
   strict C-A-G-E-D order, the same as chapter 2.

**Blocks / components**

- `live` · `scale-compare` · `{ "root": "A", "scales": ["minor", "minor-pentatonic"] }`
- `live` · `caged-shape` · `{ "root": "A", "form": "C", "quality": "minor", "show": "triad", "caption": "…" }`
- `live` · `caged-shape` · `{ "root": "A", "form": "C", "quality": "minor", "show": "pentatonic", "caption": "…" }`
- One small `table`: the five degrees `1 b3 4 5 b7`, their notes in A, and "in the chord?" — three
  yes, two no. Keep cells to a word or two.
- One `callout` (`warning`): the `b6` is not in this scale; "the three notes that drop" is a fact
  about the whole scale, not about this layer.
- Article links to `minor-caged-five-shapes-one-neck` and `minor-caged-the-three-that-drop`; screen
  link to `/scale-visualizer`; article link to `minor-caged-pentatonic-c-form` at the close.

**Do not**: teach any form's dot positions beyond the five new C-form dots listed above; mention
Boxes or the `b5` (the closer owns both); use `caged-ladder`; draw anything at `show: "scale"`;
claim every window holds twelve dots.

---

### 2. `minor-caged-pentatonic-c-form` — "The C Form: The One That Spreads"

- **Section id**: `minor-caged.ch3.pentatonic-c-form` ·
  **Article id**: `art_minor-caged-pentatonic-c-form`
- **Length**: 550–700 words
- **Left by the opener**: `1 b3 4 5 b7`; no `b6`; three of five are chord tones; the diagram is now
  roughly what the hand plays; and the C form's twelve dots already drawn once, undiscussed.
- **The one thing it teaches**: the C form's twelve dots run from fret 9 to fret 13 with fret 11
  empty, so this is one of the two windows that does not sit under a settled hand — and it is the
  window where the `4` and the `5` outnumber everything else.
- **The misconception it corrects**: "every pentatonic box is one hand position."

**Key points, in order**

1. Restate the position shorthand once, since a learner may arrive after a gap: `5·3` means string 5,
   fret 3, string 1 being the high `e`. Then the window: frets `9–13`, the highest of the five, and
   the same window chapter 2's C form lesson worked in.
2. The twelve dots as a `table`, string by string, both dots and both degrees. Use the verified table
   above unchanged.
3. **The spread, which is this lesson's own fact.** The dots run from `3·9` at the bottom to `2·13` at
   the top — five frets, not four. And **fret 11 holds nothing at all**: the window's dots sit on 9,
   10, 12 and 13 with a gap in the middle. So this is a window you shift through rather than settle
   into. Say plainly that a learner who cannot reach it in one position is reading the shape right,
   not failing. Name the other one that spreads — the G form — so the claim is not a false
   superlative.
4. **What is new since chapter 2**: `6·10` `4`, `5·10` `b7`, `4·12` `4`, `3·12` `b7`, `1·10` `4`.
   Note that chapter 2's compact fragment out of this form — strings 4-3-2 at `10 9 10`, the
   `b3 5 1` — is still there, now with a `4` sitting a fret below it on `6·10` and `1·10`.
5. **Chord tones and the rest.** Seven of the twelve are `Am`: `6·12`, `5·12`, `4·10`, `3·9`,
   `2·10`, `2·13`, `1·12`. Five are not: `6·10`, `5·10`, `4·12`, `3·12`, `1·10`. Both roots — `5·12`
   and `2·10` — sit at the bottom of the window's upper half, which is where a phrase in this window
   wants to land.
6. **Character, in the count.** This window triples the `4` and the `5` — three `D`s and three `E`s.
   Combined with only two roots, it is the window that leans hardest away from home, which is part of
   why it reads as a transitional shape rather than a place to sit.
7. Character in the reach: its three-fret strings are 3 and 2, right in the middle of the hand,
   and they are the two that straddle the `G → B` break — which is why `2·13` sits a fret higher than
   everything around it.
8. Close on the A form, which is the opposite in every respect.

**Blocks / components**

- `live` · `caged-shape` · `{ "root": "A", "form": "C", "quality": "minor", "show": "pentatonic", "caption": "…" }`
- `table` — the twelve dots, string by string.
- One `callout` (`tip`): fret 11 is empty, so this window is two small clusters — 9/10 and 12/13 —
  rather than one hand position.
- Article link to `minor-caged-triad-c-form`; screen link to `/scale-visualizer`; article link to
  `minor-caged-pentatonic-a-form` at the close.

**Do not**: call this the only window that spreads five frets; mention Boxes; give a barre fingering.

---

### 3. `minor-caged-pentatonic-a-form` — "The A Form: The Pentatonic at the Nut"

- **Section id**: `minor-caged.ch3.pentatonic-a-form` ·
  **Article id**: `art_minor-caged-pentatonic-a-form`
- **Length**: 600–750 words
- **Left by the C form**: twelve dots as a table; a window that spreads; chord tones named against
  the rest.
- **The one thing it teaches**: the A form's window is the open-position minor pentatonic — five of
  its six strings have their lower dot on an open string — and it is the one window that holds more
  dots in minor than in major.
- **The misconception it corrects**: "a scale shape is something you move up the neck; open position
  is a special case that doesn't belong to the system."

**Key points, in order**

1. The window: frets `0–3`, four frets, not five, because the nut cuts it short — chapter 2 said so
   and this lesson agrees with it. Twelve dots inside four frets, two on every string, and every fret
   in the window carries at least one.
2. **The open strings.** Five of the six strings have their lower dot at fret 0 — `6·0` `5`,
   `5·0` `1`, `4·0` `4`, `3·0` `b7`, `1·0` `5`. Only string 2 breaks it, at `2·1` `b3`, because the
   open `B` is not one of these five notes. **Say that string 2's open note is not in the scale and
   leave it there** — do not name its degree. Nowhere else on the neck does a whole window of this
   scale sit half on open strings.
3. Give all twelve dots as a `table`, string by string, with both degrees. Use the verified table
   above unchanged.
4. **What is new since chapter 2**: `6·3` `b7`, `4·0` `4`, `3·0` `b7`, `2·3` `4`, `1·3` `b7`. Two of
   the five are open strings. Tie it back: the open `Am` chord is still sitting inside this window
   exactly where chapter 2 left it — `5·0`, `4·2`, `3·2`, `2·1`, `1·0` — and the five new dots have
   arranged themselves around it.
5. **The one window that gains.** A **major** pentatonic in this same span holds ten dots; A minor's
   holds twelve. It is the only one of the five where the count differs by two, and the only one
   where minor is richer by more than one. That is the chapter-2 edge effect turning up again at a
   new layer: the window's edges are fixed frets, and at this layer more of the minor scale's notes
   happen to fall inside them. (Two of the other windows hold twelve dots in **both** qualities, so
   do not generalise.)
6. **Chord tones and the rest.** Seven are `Am`: `6·0`, `5·0`, `5·3`, `4·2`, `3·2`, `2·1`, `1·0`.
   Five are not: `6·3`, `4·0`, `3·0`, `2·3`, `1·3`. Both roots are `5·0` and `3·2`.
7. **Character, in the reach.** Its three-fret strings are 6, 5 and 1 — the outside of the hand
   stretches, the middle stays compact. And because five of the six lower dots are open, the stretch
   costs nothing: the open string does the reaching.
8. Practical close before the hand-off: hold a sustained `A` with the [Drone](screen link) and play
   this window against it. Ending on `5·0` or `3·2` sounds like arriving; ending on `4·0` or `1·3`
   sounds like a question. Same twelve dots, different destination — that is the chapter's claim in
   the cheapest possible experiment.
9. Close on the G form.

**Blocks / components**

- `live` · `caged-shape` · `{ "root": "A", "form": "A", "quality": "minor", "show": "pentatonic", "caption": "…" }`
- `table` — the twelve dots, string by string.
- One `callout` (`tip`): five of the six lower dots are open strings; string 2 is the exception.
- Article link to `minor-caged-triad-a-form`; screen links to `/drone` and `/scale-visualizer`;
  article link to `minor-caged-pentatonic-g-form` at the close.

**Do not**: name string 2's open note or its degree; call this window five frets wide; claim every
window's dot count changes with the quality (three of them do not).

---

### 4. `minor-caged-pentatonic-g-form` — "The G Form: Thirteen Dots"

- **Section id**: `minor-caged.ch3.pentatonic-g-form` ·
  **Article id**: `art_minor-caged-pentatonic-g-form`
- **Length**: 600–750 words
- **Left by the A form**: the open-position window; the edge effect at this layer; landing on a chord
  tone against a drone.
- **The one thing it teaches**: the G form is the one window that does not hold twelve dots — it
  holds thirteen, because string 2 carries three of the five notes — and that extra dot is what
  makes it the second of the two windows that ask for a shift.
- **The misconception it corrects**: "every pentatonic box has two notes on every string."

**Key points, in order**

1. The window: frets `1–5`, the widest grip of chapter 2 and now the fullest window of this chapter.
   Give the thirteen dots as a `table`, string by string, unchanged from the verified table above.
   Note that fret 4 holds nothing — the dots sit on frets 1, 2, 3 and 5.
2. **Thirteen, not twelve**, and this is the lesson. Every other window in this chapter holds twelve
   dots, two on each of the six strings. This one holds thirteen, because **string 2 carries three**:
   `2·1` `b3`, `2·3` `4`, `2·5` `5`. Three of the scale's five notes on one string inside five frets.
   Say it was counted, and say which string.
3. **Why it happens, without re-teaching the B string.** `b3`, `4` and `5` are the three notes of
   this scale that sit closest together — two frets apart each — and on the B string in this span all
   three land inside the window at once. Every other string in every other window catches only two.
4. **The consequence: this is the second window that spreads.** Its dots run from fret 1 to fret 5 —
   five frets — so like the C form it is a shift rather than a settled hand. The C form lesson named
   the other one; this lesson names this one, and between them the claim is complete: **two of the
   five spread, three sit under one hand.**
5. **What is new since chapter 2**: `6·3` `b7`, `5·5` `4`, `4·5` `b7`, `2·3` `4`, `1·3` `b7`.
   Chapter 2's three little triads out of this form are all still here, untouched, with the new notes
   between them.
6. **Chord tones and the rest.** Eight of the thirteen are `Am`: `6·5`, `5·3`, `4·2`, `3·2`, `3·5`,
   `2·1`, `2·5`, `1·5`. Five are not: `6·3`, `5·5`, `4·5`, `2·3`, `1·3`. Three roots — `6·5`, `3·2`,
   `1·5` — which is as many as any window in this chapter has.
7. **Character, in the count.** With thirteen dots over five notes, this is the only window that
   triples three degrees at once: the `1`, the `b3` and the `b7`. Three roots and three flat thirds
   means it states the chord's quality more often than any other window states anything, which is
   why it sounds settled and minor even though it is awkward to hold.
8. **The top edge is fret 5**, where every string carries a note of the scale. Say it in one clause
   and hand the full fact to the E form lesson, which is where that fret's window really lives.
9. Close on the E form — the one the learner may already have been playing for years.

**Blocks / components**

- `live` · `caged-shape` · `{ "root": "A", "form": "G", "quality": "minor", "show": "pentatonic", "caption": "…" }`
- `table` — the thirteen dots, string by string.
- One `callout` (`info`): thirteen dots, and the thirteenth is on string 2.
- Article link to `minor-caged-triad-g-form`; screen link to `/scale-visualizer`; article link to
  `minor-caged-pentatonic-e-form` at the close.

**Do not**: claim this is the widest window (it is five frets, and so is the C form's dot spread);
say the G form has more roots than any other (the E form also has three); teach fret 5's full story;
mention Boxes.

---

### 5. `minor-caged-pentatonic-e-form` — "The E Form: The Box You Already Own"

- **Section id**: `minor-caged.ch3.pentatonic-e-form` ·
  **Article id**: `art_minor-caged-pentatonic-e-form`
- **Length**: 750–900 words. **The chapter's biggest lesson** — this is the shape most guitarists
  already play, and it is the one where the chord-tone argument pays off.
- **Left by the G form**: thirteen dots and why; two of the five windows spread; fret 5 teased.
- **The one thing it teaches**: the twelve dots of the E form window are the five-note shape most
  guitarists already know as "the minor pentatonic at fret 5" — and only **four** of those twelve are
  not chord tones, the fewest of any window, which makes it the easiest place on the neck to land on
  a note the chord is actually made of.
- **The misconception it corrects**: "I already play this box, so there is nothing here" — and its
  sharper form, "any note in the box is as good as any other."

**Key points, in order**

1. The window: frets `4–8`, the `Am` barre at fret 5's own window, and the same one chapter 2 used
   for the E form. Its twelve dots occupy only **three frets** — 5, 7 and 8. Nothing at fret 4 or
   fret 6 at all. Give the twelve as a `table`.
2. **The recognition.** String 6 to string 1: 5 and 8, 5 and 7, 5 and 7, 5 and 7, 5 and 8, 5 and 8.
   That is the shape sold everywhere as the first minor pentatonic box. Not similar to it — the same
   twelve positions. If the learner has been playing that box since before they knew what a `b3` was,
   this is where it joins the system.
3. **One sentence and a link, not a re-derivation**: chapter 1 already showed that frets `4–8` are
   C major's G form and A minor's E form at the same time, and named "the A minor pentatonic at fret
   5" in passing. Link [`minor-caged-one-window-two-names`](article link) and, if the comparison
   earns it, [`caged-pentatonic-g-form`](article link) — whose twelve dots are these twelve dots,
   verified. Do not re-run chapter 1's seventeen-position table.
4. **Fret 5, and it deserves its own paragraph.** Lay one finger across fret 5 and every string under
   it is a note of A minor pentatonic: `A D G C E A`, degrees `1 4 b7 b3 5 1`. Checked at every fret
   from 0 to 15 — **fret 5 is the only fret on the neck where that is true.** Follow it immediately
   with the chapter's point rather than leaving it as a curiosity: of those six, `6·5`, `3·5`, `2·5`
   and `1·5` are chord tones and `5·5` and `4·5` are not. One finger gives you the whole scale;
   four of the six strings under it give you the whole chord.
5. **The payoff, and it is the arc line.** Only **four** of this window's twelve dots are outside the
   chord — `5·5` `4`, `4·5` `b7`, `3·7` `4`, `2·8` `b7`. Every other window in this chapter has five.
   Name them, and say what they are for: they are the notes that make a line move, and the eight
   chord tones are the notes that make it arrive. A phrase built only from the first four never
   settles; a phrase built only from the other eight is an arpeggio.
6. **Three roots without moving your hand** — `6·5`, `4·7`, `1·5`, chapter 2's `6 → 4 → 1` map,
   unchanged two chapters later. Low, middle and high, so whichever register a phrase ends in, home
   is under a finger. Say explicitly that this is why the E form stays the window players navigate
   from.
7. **The practical instruction, and the most concrete thing this chapter has to offer.** Hold a
   sustained `A` with the [Drone](screen link), play the box, and end every phrase on `6·5`, `4·7` or
   `1·5`. The same twelve notes everyone else is playing; the difference is entirely in where you
   stop. Then try ending on `4·5` instead and hear it hang.
8. **What is new since chapter 2**: only those four dots — the fewest added of any window. Chapter 2's
   `Am` barre at fret 5 and its one-finger fragment on strings 3-2-1 are both still sitting inside it.
9. Character in the reach: three-fret strings are 6, 2 and 1, and its dots use three frets rather
   than four, so it is the most compact window of the five.
10. Close on the D form, and on getting out of this box, which is the next lesson's job.

**Blocks / components**

- `live` · `caged-shape` · `{ "root": "A", "form": "E", "quality": "minor", "show": "pentatonic", "caption": "…" }`
- `table` — the twelve dots, string by string.
- One `callout` (`tip`): one finger at fret 5, all six strings, and four of the six are chord tones.
- Article links to `minor-caged-triad-e-form`, `minor-caged-one-window-two-names` and (at most once)
  `caged-pentatonic-g-form`; screen links to `/drone` and `/scale-visualizer`; article link to
  `minor-caged-pentatonic-d-form` at the close.

**Do not**: say "box 1" or mention the Boxes toggle (the closer owns it); claim this window has the
most chord tones (the G form also has eight — the true claim is the **fewest non-chord tones**, and
the highest proportion); re-derive the `4–8` coincidence; mention the `b5`.

---

### 6. `minor-caged-pentatonic-d-form` — "The D Form: The Way Out of the Box"

- **Section id**: `minor-caged.ch3.pentatonic-d-form` ·
  **Article id**: `art_minor-caged-pentatonic-d-form`
- **Length**: 600–750 words
- **Left by the E form**: the famous box, its four non-chord dots, its three roots, and the
  instruction to land on one of them.
- **The one thing it teaches**: the D form is the window directly above the box everyone knows, it
  shares a whole row of dots with it at fret 7, and its two roots sit in the middle of the string
  set — so it is the window you move *through*, not the one you settle in.
- **The misconception it corrects**: "the box at fret 5 is where the minor pentatonic lives, and
  everything above it is a different scale" — the practical form of never leaving box 1.

**Key points, in order**

1. The window: frets `6–10`, the `Dm` shape at fret 7's own window from chapter 2. Twelve dots on
   frets 7, 8, 9 and 10 — nothing at fret 6. Give the twelve as a `table`.
2. **The seam with the box you just learned.** The E form window ends at fret 8 and this one starts
   at fret 6, so frets `6–8` belong to both. Six dots live there — `6·8` `b3`, `5·7` `5`, `4·7` `1`,
   `3·7` `4`, `2·8` `b7`, `1·8` `b3` — one on every string, and between them all five notes of the
   scale. Slide the hand up two frets from the fret-5 box and you have not left the scale for a
   moment. Say this concretely: `1·8` and `6·8` are the same two dots the box's top row already gave
   you; `5·7`, `4·7` and `3·7` are what is new under your fingers.
3. **Fret 7 is the row that gets you here.** `5·7` `5`, `4·7` `1`, `3·7` `4` — three strings, and one
   of them is a root. Land on `4·7` coming out of the box and you have arrived rather than escaped.
4. **The other seam, above.** Frets `9–10` belong to this window and the C form's at once, and hold
   six more dots — `6·10` `4`, `5·10` `b7`, `4·10` `b3`, `3·9` `5`, `2·10` `1`, `1·10` `4` — again
   one per string and again all five notes. This window has a doorway at each end, which is exactly
   what makes it the bridge. Do **not** build the full four-seam table here; the closer owns it.
5. **Chord tones and the rest.** Seven are `Am`: `6·8`, `5·7`, `4·7`, `4·10`, `3·9`, `2·10`, `1·8`.
   Five are not: `6·10`, `5·10`, `3·7`, `2·8`, `1·10`.
6. **Character, and it is a real one.** Its two roots — `4·7` and `2·10` — are both on inside
   strings; there is no root on string 6 or string 1 anywhere in this window. Combined with three
   `b3`s and three `4`s, that means the outside of the hand never lands home here: strings 6 and 1
   each offer a `b3` and a `4` and nothing else. That is why this window feels unfinished on its own
   and why it works best as a passage between the two either side of it.
7. Character in the reach: its three-fret strings are 5 and 4, in the middle of the hand, so the
   shape itself is compact — the dots sit inside four consecutive frets with every fret used.
8. Practical: play from `6·5` in the fret-5 box up to `2·10` in this window without stopping, and
   notice that the only thing that happened was your hand moving two frets. Send them to the
   [Scale Visualizer](screen link) to page from one position to the next and watch the overlap.
9. Close on the closer: five windows done, and one question left — what the app's other toggle is
   showing when it calls the same dots something else.

**Blocks / components**

- `live` · `caged-shape` · `{ "root": "A", "form": "D", "quality": "minor", "show": "pentatonic", "caption": "…" }`
- `table` — the twelve dots, string by string.
- One `callout` (`tip`): fret 7's row — `5·7`, `4·7`, `3·7` — is the way out of the fret-5 box, and
  `4·7` is a root.
- Article link to `minor-caged-triad-d-form`; screen link to `/scale-visualizer`; article link to
  `minor-caged-boxes-and-forms` at the close.

**Do not**: give the four-seam table (the closer owns it); claim this window has the fewest roots
(three of the five have two); mention Boxes or the `b5`.

---

### 7. `minor-caged-boxes-and-forms` — "Boxes and Forms: Two Maps of the Same Dots"

- **Section id**: `minor-caged.ch3.boxes-and-forms` ·
  **Article id**: `art_minor-caged-boxes-and-forms`
- **Length**: 800–950 words. The chapter's longest, and it carries two jobs: the join-up and the
  reconciliation.
- **Left by the D form**: all five windows; every window's chord tones named; the two seams around
  the D form; and the open question about the app's other toggle.
- **The one thing it teaches**: the CAGED forms and the numbered Boxes are two different framings of
  **the same dots** — two of the five pairs hold exactly the same twelve notes and three do not, and
  the reason is that the two systems are anchored on different things.
- **The misconception it corrects**: "Boxes are the CAGED forms with numbers instead of letters", and
  its practical form — a player who knows "box 1 at fret 5" and separately knows CAGED and has never
  been told how the two maps line up.

**Key points, in order**

1. **Open on the join-up, briefly** — one paragraph plus the seam `table`. Every overlap between
   neighbouring windows holds **all five notes of the scale**, and three of the four hold them one
   per string. Chapter 2 proved this in chord tones; this is the same claim with the whole scale in
   it. Consequence, in the chapter's own terms: wherever your hand stops, the notes under it belong
   to two windows at once, so you are never between shapes. Use the verified seam table above.
2. **Now the toggle.** Open the [Scale Visualizer](screen link), set the root to `A` and the scale to
   **minor pentatonic**, and there are two position systems on offer: CAGED and Boxes. Say that this
   matters — a learner who has spent three chapters on CAGED will hit the other toggle and see five
   windows in different places with different names, and conclude one of the two is wrong.
   **Neither is.** Note in one clause that Boxes only appears for a five-note scale; set the scale to
   natural minor and the second toggle becomes something else.
3. **The dots do not move.** Say this before anything else about the two systems. Both toggles draw
   the same notes on the same neck; what changes is where the frames are drawn and what they are
   called. This is the same idea chapter 1 used for C major and A minor — the dots do not move, the
   labels do — now applied to two ways of framing one scale.
4. **Why they differ, derived rather than asserted.** Both systems are five windows placed relative
   to the fret where the root sits on the low `E` string — fret 5 for A.
   - CAGED windows sit where the five **chord shapes** put their barre: `0`, `2`, `4`, `7` and `9`
     frets above that root.
   - Boxes sit on the **scale itself**: `0`, `3`, `5`, `7` and `10` frets above that root — which is
     `1 b3 4 5 b7`, the minor pentatonic walked up the low `E` string. On the low `E` in A minor
     that is frets `0, 3, 5, 8, 10` and then `12`, and those are exactly where the boxes start.
   Two of the five numbers are the same in both lists — `0` and `7`. **That is why exactly two of the
   five pairs line up.** One short paragraph; it is the best sentence in the lesson.
5. **The overlay, as a `table`.** Use the verified table above: Box 1 `5–8` / E form `4–8`, same
   twelve dots; Box 2 `8–10` / D form `6–10`; Box 3 `10–12` / C form `9–13`; Box 4 `0–3` / A form
   `0–3`, same twelve dots; Box 5 `3–5` / G form `1–5`. State the general relationship that holds in
   all five: **every box's dots are a subset of its CAGED partner's** — the box is the same shape
   with its bottom edge trimmed. Name what the form adds in each of the three that differ.
6. **The headline.** "Box 1 at fret 5" — the thing half the guitar-playing world learns first — **is
   the E form.** Same twelve dots, checked position by position; the box just does not bother drawing
   fret 4, which holds nothing anyway. And Box 4, the open-position box, is the A form for the same
   reason at the other end: the nut trims the form to exactly the box's span.
7. **The numbering trap, named plainly.** Going up the neck from the nut in A minor, the boxes read
   `4, 5, 1, 2, 3`. Box 1 is not the lowest box; it is the one that starts on the root on the low `E`
   string. So "box 1" and "the first form" are not the same idea, and a player who assumes they are
   will be two windows out. Give this a `warning` callout.
8. **Which to use.** Say the honest thing: neither system is more correct, and both draw the same
   notes. CAGED is the one this pathway uses because it is the same five windows that carry the
   chords — the reason the learner can see which dots are chord tones at all. If they already know
   the boxes, they have not wasted anything; they have been playing four of the five CAGED windows
   without the labels.
9. **The `b5`, once.** One sentence: between the `4` and the `5` there is one more note, the `b5`,
   which players slide through on the way from one to the other. It is not in the scale, this pathway
   does not teach it, and that is all it gets. **No second sentence, no positions, no genre, no
   bends.**
10. Close on chapter 4 — the same five windows again, two more notes, still no new shapes — and send
    them to the [Scale Visualizer](screen link) to flip between the two toggles and watch the dots
    stay put, and to the [Drone](screen link) to play any window against a sustained `A`.

**Blocks / components**

- `table` — the four seams: seam, frets, dots, "all five notes?".
- `live` · `caged-ladder` · `{ "root": "A", "quality": "minor" }` — the CAGED tiling as one picture,
  for the overlay argument. **Say out loud that the ladder marks roots only**, whatever the layer, so
  nobody hunts it for a `4` or a `b7`.
- `table` — the overlay: Box, its frets, its CAGED partner, its frets, what the form adds.
- One `callout` (`warning`): box numbering does not start at the nut; Box 1 is the one rooted on the
  low `E` string.
- One `callout` (`info`) for the forward pointer to chapter 4.
- Screen links to `/scale-visualizer` and `/drone`; article links to
  `minor-caged-five-shapes-one-neck` and `minor-caged-pentatonic-e-form`.

**Do not**: use `caged-shape` (five more diagrams would drown the tables); teach a second thing about
the `b5`; discuss the blues, bends, or box-to-box soloing; name chapter 4's two notes; claim the two
systems are the same five windows.

---

## The activities

Two, both `note-play`, both with `"optional": true` on their sections. Every round below was checked
against MIDI (string 1 open = 64, 2 = 59, 3 = 55, 4 = 50, 5 = 45, 6 = 40) and is pitch-distinct.

**The one that would have bitten**: the G form's thirteen dots are **not** pitch-distinct — `2·1` and
`3·5` are both `C4`. A round asking for all thirteen would be rejected by the loader. The G form
round therefore takes twelve of the thirteen, dropping `2·1`, and says so in its prompt.

### A. `minor-caged-play-the-five-windows` — "Drill: The Five Windows"

- **Section id**: `minor-caged.ch3.play-the-five-windows` ·
  **Activity id**: `act_minor-caged-play-the-five-windows`
- `kind: "note-play"`, `modes: ["easy", "hard"]`, document `board: { fretFrom: 0, fretTo: 13 }`.
  `estimatedMin: 10`.

| Round id suffix | Prompt gist | Targets (string · fret) | Board | MIDI |
| --- | --- | --- | --- | --- |
| `a-form` | The open-position window — five of six lower dots are open strings | 6·0, 6·3, 5·0, 5·3, 4·0, 4·2, 3·0, 3·2, 2·1, 2·3, 1·0, 1·3 | 0–3 | 40 43 45 48 50 52 55 57 60 62 64 67 |
| `g-form` | Twelve of the G form's thirteen — `2·1` is left out because it sounds the same pitch as `3·5` | 6·3, 6·5, 5·3, 5·5, 4·2, 4·5, 3·2, 3·5, 2·3, 2·5, 1·3, 1·5 | 1–5 | 43 45 48 50 52 55 57 60 62 64 67 69 |
| `e-form` | The box at fret 5, all twelve | 6·5, 6·8, 5·5, 5·7, 4·5, 4·7, 3·5, 3·7, 2·5, 2·8, 1·5, 1·8 | 4–8 | 45 48 50 52 55 57 60 62 64 67 69 72 |
| `d-form` | The window above the box | 6·8, 6·10, 5·7, 5·10, 4·7, 4·10, 3·7, 3·9, 2·8, 2·10, 1·8, 1·10 | 6–10 | 48 50 52 55 57 60 62 64 67 69 72 74 |
| `c-form` | The highest window — mind the empty fret in the middle | 6·10, 6·12, 5·10, 5·12, 4·10, 4·12, 3·9, 3·12, 2·10, 2·13, 1·10, 1·12 | 9–13 | 50 52 55 57 60 62 64 67 69 72 74 76 |
| `fret-five` | One finger, six strings, the whole scale | 6·5, 5·5, 4·5, 3·5, 2·5, 1·5 | 4–6 | 45 50 55 60 64 69 |

All rounds unordered. They run in **neck order** — A, G, E, D, C — so the learner climbs rather than
jumps, with fret 5 last as the summary.

### B. `minor-caged-which-ones-are-the-chord` — "Drill: Which Ones Are the Chord?"

- **Section id**: `minor-caged.ch3.which-ones-are-the-chord` ·
  **Activity id**: `act_minor-caged-which-ones-are-the-chord`
- `kind: "note-play"`, `modes: ["easy", "hard"]`, document `board: { fretFrom: 0, fretTo: 13 }`.
  `estimatedMin: 7`.

The chapter's arc line as a physical exercise: the same window, twice, split into the notes the chord
is made of and the notes that are not.

| Round id suffix | Prompt gist | Targets (string · fret) | Board | MIDI |
| --- | --- | --- | --- | --- |
| `e-form-chord-tones` | In the fret-5 box, only the notes of `Am` | 6·5, 6·8, 5·7, 4·7, 3·5, 2·5, 1·5, 1·8 | 4–8 | 45 48 52 57 60 64 69 72 |
| `e-form-the-other-two` | The four that are not — the `4`s and the `b7`s | 5·5, 4·5, 3·7, 2·8 | 4–8 | 50 55 62 67 |
| `a-form-chord-tones` | Open position, only the notes of `Am` | 6·0, 5·0, 5·3, 4·2, 3·2, 2·1, 1·0 | 0–3 | 40 45 48 52 57 60 64 |
| `every-flat-seven` | Every `b7` you can reach, low to high — `ordered: true` | 6·3, 4·5, 1·3 | 0–13 | 43 55 67 |

The last round is capped at three targets on purpose: the `b7` of A minor is `G`, and inside frets
0–13 there are only three distinct `G` pitches (43, 55, 67), so a fourth target would repeat one and
the loader would reject the round.

---

## The checkpoint

`minor-caged-ch3-checkpoint` · section id `minor-caged.ch3.checkpoint` ·
`meta.kind: "checkpoint"` · `passThresholdPct: 70` on both the quiz meta and the chapter checkpoint.

Written **after** the articles are read, from what they actually say. Sketch — 8 questions, one per
lesson plus two on the opener:

| # | Question id suffix | Kind | Draws on | Tests |
| - | ------------------ | ---- | -------- | ----- |
| 1 | `what-it-adds` | `choice` | Opener | The layer is chapter 2's triad plus the `4` and the `b7`; the `b6` is **not** in it |
| 2 | `which-are-chord-tones` | `choice` | Opener + every form lesson | Three of the five are the chord; the `4` and the `b7` are not |
| 3 | `c-form-spread` | `choice` | C form | Why the C form window does not sit under one hand |
| 4 | `a-form-open-strings` | `choice` | A form | String 2 is the one string whose lower dot is not open |
| 5 | `g-form-thirteen` | `choice` | G form | The G form holds thirteen dots because string 2 carries three |
| 6 | `fret-five` | `fretboard` | E form | Mark all six notes at fret 5, `frets: 8` |
| 7 | `out-of-the-box` | `choice` | D form | `4·7` is a root, and fret 7's row is shared with the E form window |
| 8 | `boxes-and-forms` | `choice` | Closer | "Box 1 at fret 5" is the E form; Boxes is a different tiling, not a renumbering |

Every question gets an `explanation`. `fretboard` is graded all-or-nothing, so Q6 asks only for a
fact the chapter states explicitly and completely. **No option is referred to by letter or position**
— options shuffle on every attempt and render with no labels.

---

## Notes for the lesson agents

- **The corpus test is red mid-chapter.** `packages/content/src/load.test.ts` pins article, quiz and
  activity counts by number and by name, so the moment the first article of this chapter lands those
  assertions fail and keep failing until the chapter agent updates the pins. Read *which file* each
  failure names. **Ignore every count and slug-list assertion; fix only failures that name your own
  article.**
- **Verify every superlative by recomputation**, not by re-reading. The allowed list is above; if a
  draft wants one that is not on it, drop it.
- Every `string·fret` token in prose must be a real dot from the tables above, with the right degree
  and the right note name. Check them one by one before reporting.

---

## As built — final word counts

| Lesson | Words | `readingTimeMin` | `estimatedMin` in the curriculum |
| --- | --- | --- | --- |
| `minor-caged-two-more-notes` | 729 | 4 | 5 |
| `minor-caged-pentatonic-c-form` | 565 | 3 | 4 |
| `minor-caged-pentatonic-a-form` | 589 | 3 | 4 |
| `minor-caged-pentatonic-g-form` | 638 | 4 | 5 |
| `minor-caged-pentatonic-e-form` | 759 | 4 | 5 |
| `minor-caged-pentatonic-d-form` | 660 | 4 | 5 |
| `minor-caged-boxes-and-forms` | 979 | 5 | 6 |
| `minor-caged-play-the-five-windows` (activity) | — | — | 10 (optional) |
| `minor-caged-which-ones-are-the-chord` (activity) | — | — | 7 (optional) |

Chapter total, counted sections only: **34 minutes**; 51 including the two optional drills. The
pathway's `estimatedMin` is still its placeholder of 200 — the top-level agent recomputes it once
every chapter exists.

## The checkpoint as built — 8 questions

The sketch survived intact, one question per lesson plus a second on the opener.

| # | Question id suffix | Kind | Draws on | Tests |
| - | ------------------ | ---- | -------- | ----- |
| 1 | `what-it-adds` | `choice` | Opener | The layer adds the `4` and the `b7`; the `b6` is not in it |
| 2 | `which-are-chord-tones` | `choice` | Opener + every form lesson | Three of the five are the chord; the `4` and the `b7` are not |
| 3 | `c-form-spread` | `choice` | C form | Dots on 9, 10, 12, 13 — two clusters, not one hand position |
| 4 | `a-form-open-strings` | `choice` | A form | String 2 is the exception; its open note is not in the scale |
| 5 | `g-form-thirteen` | `choice` | G form | Thirteen dots, because string 2 carries `b3`, `4` and `5` |
| 6 | `fret-five` | `fretboard` | E form | Mark all six notes at fret 5, `frets: 8` |
| 7 | `out-of-the-box` | `choice` | D form | `4·7` is a root in both windows — the hinge out of the box |
| 8 | `boxes-and-forms` | `choice` | Closer | Box 1 is the E form; the Boxes are a different tiling, not a renumbering |

Distractors that encode a real belief rather than filler: Q1's "`b6` and `b7` — two of the three
notes that drop" is the exact trap the pathway brief flags; Q3's "the only window that crosses the
`G → B` break" is a superlative a learner would believe and that every window disproves; Q8's "the
Boxes are the CAGED windows renumbered" is the misconception the closer exists to kill.

---

## Errors found and corrected in the drafts

Both lesson agents reported their work verified and clean. Reading the articles as written found six
real problems, four of them factual.

1. **`minor-caged-pentatonic-d-form` — the seam paragraph was wrong, and it was the lesson's central
   claim.** It said `5·7`, `4·7` and `3·7` were "what's new under your fingers" when moving up from
   the fret-5 box. They are not: the E form's window runs `4–8`, so **every one of the six dots in
   the `6–8` seam is already a fret-5-box dot**. Recomputed and rewritten: the overlap is the top of
   the box you were already in, and what is genuinely new starts at fret 9. **This error came from
   the plan** — my own seam sentence in the D form entry was wrong the same way, and the agent
   followed it faithfully. Recorded so the next chapter agent checks the plan's prose as hard as the
   plan's tables.
2. **`minor-caged-pentatonic-d-form` — "the fret-5 box, whose dots span the same four-fret width but
   leave two frets — 4 and 6 — completely empty ... this window is denser."** False twice over: the
   E form's *dot* span is `5–8` and only fret 6 is empty inside it (fret 4 is outside the dots
   entirely), and the E form is the *more* concentrated of the two — twelve dots on three frets
   against twelve on four. Rewritten around what is true: the D form uses four consecutive frets with
   none skipped, which only the open-position window also manages.
3. **`minor-caged-pentatonic-e-form` — "the most compact window of the five."** False by span: the A,
   E and D windows all put their dots inside four frets. Replaced with the verified superlative —
   its twelve dots use **only three frets**, which no other window manages; the other four each use
   four.
4. **`minor-caged-boxes-and-forms` — "you've been playing four of the five CAGED windows without the
   labels."** Unverified and wrong: every box is a subset of a *distinct* form, so a boxes player has
   been in all five, two of them exactly. Rewritten.
5. **`minor-caged-pentatonic-a-form` — "the nut is doing something no other fret does."** An unfounded
   causal claim about why this window gains two dots in minor. The gain is simply which pitch classes
   land in frets `0–3`, recomputed both ways (10 major, 12 minor). Clause cut. Also "two clusters five
   frets apart" for the C form — the clusters are two frets apart inside a five-fret window — and "the
   one string that has to be fretted", which reads as though the other five are never fretted.
6. **`minor-caged-pentatonic-g-form` — "a four-fret stretch on one string."** The three dots on
   string 2 sit at frets 1, 3 and 5: the outer two are four frets apart, but no reach is more than
   two. Reworded. Its `readingTimeMin` was also wrong (4 for what was then a 485-word draft, then
   still 4 after it grew — set correctly at the end), as was the A form's.

Smaller fixes: the C form's "both roots sit at the bottom of the window's upper half" (muddled, and
also the plan's fault) became the true and useful version — one root in each of the two clusters;
four instances of authorial scaffolding leaking into prose ("in one sentence", "one clause worth
knowing", "say the split plainly", "for the overlay argument"); "a learner who has spent this whole
chapter" rewritten into second person; the D form's summary switched from hyphens to en dashes; and
the G form gained the back-link to `minor-caged-triad-g-form` and a Scale Visualizer link that the
pathway's spine asks every form lesson for.

**Verification method.** Every `string·fret` token in all seven articles (94 distinct positions) was
machine-checked against the neck: each is a real A-minor-pentatonic dot. Every "`string·fret` degree"
pair in the prose and tables (152 of them) was checked to carry the right degree. Every chord-tone
list, non-chord list, root list and dot count was recounted from `cagedMarks`. Every superlative was
recomputed. Every activity round was checked for the duplicate-pitch rule against MIDI.

---

## Judgement calls recorded here

- **The opener names the `2` and the `b6` as the two notes the pentatonic leaves out**, in one clause,
  and teaches neither. The `b6` had to be named — it is the trap the pathway brief flags explicitly.
  Naming the `2` alongside it was a deliberate departure from "leave chapter 4's notes alone
  entirely": `scale-compare` puts both chips on screen with their degree labels, and the major
  pathway's review already showed what happens when a lesson shows a note it refuses to name.
  Nothing in the chapter gives either note a position, a character or a diagram, and no
  `show: "scale"` block appears anywhere.
- **The chapter's dot counts are not uniform, and that had to be said out loud.** The major pathway's
  equivalent chapter built its whole spine on "twelve dots, two on every string, in every window".
  In A minor that is false — the G form holds **thirteen**, because string 2 catches the `b3`, the
  `4` and the `5` all at once. Rather than hide it, the G form lesson is *built* on it, which also
  gave that lesson the distinct character the brief demands of all fifteen form lessons.
- **Two windows spread, three settle.** The major pathway had exactly one window (its D form) that
  did not fall under one hand. Here it is two — the G form (`1`→`5`) and the C form (`9`→`13`) — so
  the claim is split across those two lessons and each names the other, rather than either claiming
  a false "only".
- **The seams live in the closer, not in a sixth lesson.** Chapter 2 gave them a whole closer; here
  they are one paragraph and one table at the top of a closer whose real job is the Boxes
  reconciliation, because the claim is a strengthening of one the learner already has rather than a
  new idea.
- **The `b5` is one sentence with no note name.** The app's own blues scale spells it `Eb`, which
  fights the pathway's sharps-by-default convention; using the degree alone sidesteps a spelling
  argument the chapter has no room for.
- **`caged-ladder` appears once, in the closer**, where the argument is about where windows sit —
  which is the one thing it can show. The closer states that it marks roots only, because at this
  layer a reader could reasonably go hunting it for a `4`.
- **The G form activity round takes twelve of its thirteen dots.** `2·1` and `3·5` both sound `C4`,
  and the loader rejects a round with two targets at one pitch. The prompt says why, rather than
  silently dropping a note.
- **Two activities, six rounds and four.** The first is the five windows in neck order plus fret 5;
  the second is the chapter's arc line as a physical drill — the same window split into the notes of
  the chord and the notes that are not.
- **The E form got the chapter's longest form lesson and the fret-5 fact.** In the major pathway that
  fact belonged to the A form. Here fret 5 is the E form's bottom row of dots and the E form is the
  box every self-taught player already owns, so both facts belong in the same lesson.

## Where the brief and the computation disagreed

Nothing in the pathway brief was found to be wrong. Two things it left open were settled by
computation:

- The brief said to recompute the dot counts rather than scale the triad table, and that was
  necessary: at the pentatonic layer **three of the five windows hold the same number of dots in
  both qualities** (E, D and C all hold twelve either way), where at the triad layer four of five
  differed. The window-edge effect is real but much quieter one layer up.
- The brief asserted that CAGED and Boxes "are different tilings" and left it there. They are — but
  the relationship turned out to be exact and derivable rather than arbitrary, and that derivation is
  now the closer's best paragraph. See the overlay section above.
