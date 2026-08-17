# Chapter 4 — The Whole Natural Minor Scale

Chapter id `minor-caged.ch4` · slug `the-natural-minor-scale` · 7 articles, 2 activities,
1 checkpoint.

After this chapter the learner can play A natural minor anywhere on the neck and knows the role of
every note in the window — including why the `b6` is the darkest note in it.

**Structure**: an opener on the two notes this layer adds, the five form lessons in strict C-A-G-E-D
order, and a **separate closer**. The closer is not folded into the D form lesson. `caged-fretboard`
chapters 2 and 3 both folded and both reported the same casualty — the D form's character squeezed
out and the checkpoint testing the closer instead — and its chapter 4 fixed it with a seventh
lesson. Chapters 2 and 3 of this pathway also used a separate closer. So does this one.

---

## Verified facts this chapter is built on

Every number below was **recomputed** from the app's own `cagedFormWindows` / `cagedMarks`
(`mobile/src/lib/guitar-positions/caged.ts`) and standard-tuning MIDI, in a scratch vitest file that
was deleted afterwards. Nothing here is scaled from the brief's triad or pentatonic tables, and
nothing is remembered. **These are the numbers every lesson must use.**

String numbering is **1 = high e, 6 = low E** everywhere. In A natural minor:
`1`=`A`, `2`=`B`, `b3`=`C`, `4`=`D`, `5`=`E`, `b6`=`F`, `b7`=`G`.

### The layer

Natural minor is `1 2 b3 4 5 b6 b7` — chapter 3's pentatonic (`1 b3 4 5 b7`) plus the **`2`** and the
**`b6`**. In A: `A B C D E F G`, all naturals. The layers nest exactly; the pentatonic's dots are a
strict subset of the scale's in every one of the five windows. **This is the fourth and last layer,
and the learner has not been asked to learn a new shape since chapter 2.**

### A minor's five windows, unchanged since chapter 2

```
A minor:  A 0–3   G 1–5   E 4–8   D 6–10   C 9–13
```

A minor's A form is **four frets, `0–3`**, because the nut cuts it short. No lesson may call it five
frets wide.

### The count, per window — recomputed, both qualities

| Form | Window | A **minor** scale dots | A **major** scale dots | Pentatonic (ch3) | Added here | Dots per string, 6→1 | Short string | Frets the dots use |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| C | `9–13` | **17** | 18 | 12 | 5 | `3 2 3 3 3 3` | **5** | 9, 10, **12, 13** |
| A | `0–3` | **17** | **13** | 12 | 5 | `3 3 3 2 3 3` | **3** | 0, 1, 2, 3 |
| G | `1–5` | **18** | 17 | 13 | 5 | `3 3 3 3 3 3` | none | 1, 2, 3, 4, 5 |
| E | `4–8` | **17** | 17 | 12 | 5 | `3 3 2 3 3 3` | **4** | 4, 5, 6, 7, 8 |
| D | `6–10` | **18** | 17 | 12 | **6** | `3 3 3 3 3 3` | none | 6, 7, 8, 9, 10 |

**The structural facts, and they are this chapter's spine:**

- **Two of the five windows hold eighteen dots** — the G form and the D form — **and those are exactly
  the two with three dots on every string.** The other three hold seventeen, each with one string
  carrying only two.
- The window-edge effect is **not quiet at this layer**. Four of the five differ by quality; only the
  E form comes out equal (17 and 17). The A form's gap is enormous — **13 dots in A major against 17
  in A minor**, a difference of four, where the next biggest is one.
- Chapter 3 found twelve dots and two per string in four of the five windows, with the G form the odd
  one out at thirteen. That pattern is gone. **Do not carry it forward.**

### Every window, dot by dot — `show: "scale"`, `quality: "minor"`

Written *string·fret* — degree (note). `*` marks a dot **new at this layer**. Use these tables
unchanged.

**C form** — window `9–13`. **17 dots** on frets 9, 10, 12, 13. **Fret 11 is empty.**

| String | | | |
| --- | --- | --- | --- |
| 6 | `6·10` `4` (`D`) | `6·12` `5` (`E`) | `6·13` `b6` (`F`) \* |
| 5 | `5·10` `b7` (`G`) | `5·12` `1` (`A`) | — |
| 4 | `4·9` `2` (`B`) \* | `4·10` `b3` (`C`) | `4·12` `4` (`D`) |
| 3 | `3·9` `5` (`E`) | `3·10` `b6` (`F`) \* | `3·12` `b7` (`G`) |
| 2 | `2·10` `1` (`A`) | `2·12` `2` (`B`) \* | `2·13` `b3` (`C`) |
| 1 | `1·10` `4` (`D`) | `1·12` `5` (`E`) | `1·13` `b6` (`F`) \* |

Added: `6·13` `b6`, `4·9` `2`, `3·10` `b6`, `2·12` `2`, `1·13` `b6`. Degrees: `1`×2, `2`×2, `b3`×2,
`4`×3, `5`×3, `b6`×3, `b7`×2. Roots `5·12`, `2·10`. All seventeen pitches distinct.

**A form** — window `0–3`. **17 dots** on frets 0, 1, 2, 3 — every fret used.

| String | | | |
| --- | --- | --- | --- |
| 6 | `6·0` `5` (`E`) | `6·1` `b6` (`F`) \* | `6·3` `b7` (`G`) |
| 5 | `5·0` `1` (`A`) | `5·2` `2` (`B`) \* | `5·3` `b3` (`C`) |
| 4 | `4·0` `4` (`D`) | `4·2` `5` (`E`) | `4·3` `b6` (`F`) \* |
| 3 | `3·0` `b7` (`G`) | `3·2` `1` (`A`) | — |
| 2 | `2·0` `2` (`B`) \* | `2·1` `b3` (`C`) | `2·3` `4` (`D`) |
| 1 | `1·0` `5` (`E`) | `1·1` `b6` (`F`) \* | `1·3` `b7` (`G`) |

Added: `6·1` `b6`, `5·2` `2`, `4·3` `b6`, `2·0` `2`, `1·1` `b6`. Degrees: `1`×2, `2`×2, `b3`×2,
`4`×2, `5`×3, `b6`×3, `b7`×3. Roots `5·0`, `3·2`. All seventeen pitches distinct.

**All six open strings are notes of A natural minor**: `E A D G B E` = `5 1 4 b7 2 5`. Chapter 3's A
form lesson had to say string 2's open `B` sits out because it is not one of the pentatonic's five
notes. It is in the scale — it is the `2`, at `2·0`.

**G form** — window `1–5`. **18 dots** on frets 1, 2, 3, 4, 5 — every fret used, three on every
string.

| String | | | |
| --- | --- | --- | --- |
| 6 | `6·1` `b6` (`F`) \* | `6·3` `b7` (`G`) | `6·5` `1` (`A`) |
| 5 | `5·2` `2` (`B`) \* | `5·3` `b3` (`C`) | `5·5` `4` (`D`) |
| 4 | `4·2` `5` (`E`) | `4·3` `b6` (`F`) \* | `4·5` `b7` (`G`) |
| 3 | `3·2` `1` (`A`) | `3·4` `2` (`B`) \* | `3·5` `b3` (`C`) |
| 2 | `2·1` `b3` (`C`) | `2·3` `4` (`D`) | `2·5` `5` (`E`) |
| 1 | `1·1` `b6` (`F`) \* | `1·3` `b7` (`G`) | `1·5` `1` (`A`) |

Added: `6·1` `b6`, `5·2` `2`, `4·3` `b6`, `3·4` `2`, `1·1` `b6`. Degrees: `1`×3, `2`×2, `b3`×3,
`4`×2, `5`×2, `b6`×3, `b7`×3. Roots `6·5`, `3·2`, `1·5`.

**String 2 gains nothing** — it already carried `2·1`, `2·3`, `2·5` at the pentatonic layer, which is
why the G form held thirteen dots there and holds only five more here.

**Pitch duplicate**: `2·1` and `3·5` are both `C4` (MIDI 60), as chapter 3 found. Constrains the
activity.

**E form** — window `4–8`. **17 dots** on frets 4, 5, 6, 7, 8 — every fret used.

| String | | | |
| --- | --- | --- | --- |
| 6 | `6·5` `1` (`A`) | `6·7` `2` (`B`) \* | `6·8` `b3` (`C`) |
| 5 | `5·5` `4` (`D`) | `5·7` `5` (`E`) | `5·8` `b6` (`F`) \* |
| 4 | `4·5` `b7` (`G`) | `4·7` `1` (`A`) | — |
| 3 | `3·4` `2` (`B`) \* | `3·5` `b3` (`C`) | `3·7` `4` (`D`) |
| 2 | `2·5` `5` (`E`) | `2·6` `b6` (`F`) \* | `2·8` `b7` (`G`) |
| 1 | `1·5` `1` (`A`) | `1·7` `2` (`B`) \* | `1·8` `b3` (`C`) |

Added: `6·7` `2`, `5·8` `b6`, `3·4` `2`, `2·6` `b6`, `1·7` `2`. Degrees: `1`×3, `2`×3, `b3`×3,
`4`×2, `5`×2, `b6`×2, `b7`×2. Roots `6·5`, `4·7`, `1·5`. All seventeen pitches distinct.

**These are exactly the seventeen positions chapter 1 printed** in
`minor-caged-one-window-two-names`, where it read the `4–8` window twice — once as C major's G form
and once as A minor's E form. That lesson already labelled `5·8` a `b6` and `3·4` a `2`. **Do not
reprint that table; link it.**

**D form** — window `6–10`. **18 dots** on frets 6, 7, 8, 9, 10 — every fret used, three on every
string.

| String | | | |
| --- | --- | --- | --- |
| 6 | `6·7` `2` (`B`) \* | `6·8` `b3` (`C`) | `6·10` `4` (`D`) |
| 5 | `5·7` `5` (`E`) | `5·8` `b6` (`F`) \* | `5·10` `b7` (`G`) |
| 4 | `4·7` `1` (`A`) | `4·9` `2` (`B`) \* | `4·10` `b3` (`C`) |
| 3 | `3·7` `4` (`D`) | `3·9` `5` (`E`) | `3·10` `b6` (`F`) \* |
| 2 | `2·6` `b6` (`F`) \* | `2·8` `b7` (`G`) | `2·10` `1` (`A`) |
| 1 | `1·7` `2` (`B`) \* | `1·8` `b3` (`C`) | `1·10` `4` (`D`) |

Added: `6·7` `2`, `5·8` `b6`, `4·9` `2`, `3·10` `b6`, `2·6` `b6`, `1·7` `2` — **six, the most of any
window, and the only window where every one of the six strings gains a note.** Degrees: `1`×2, `2`×3,
`b3`×3, `4`×3, `5`×2, `b6`×3, `b7`×2. Roots `4·7`, `2·10`, both on inside strings.

**Pitch duplicate**: `2·6` and `3·10` are both `F4` (MIDI 65) — and both are `b6`s. Constrains the
activity.

### The half-step map — the chapter's single best geometric fact

Two exact statements, true everywhere on the neck:

- **The `b6` sits one fret above every `5`, on the same string.** (`E` → `F`.)
- **The `2` sits one fret below every `b3`, on the same string.** (`B` → `C`.)

That is how the learner finds both without memorising anything new: the chord tones were learned in
chapter 2 and the `b3` and `5` are two of the three.

**The honest exception, verified window by window.** The window's edges are fixed frets, so a pair
can straddle one. Counted:

| Form | Dots whose one-fret partner is outside the window |
| --- | --- |
| C | none |
| A | none |
| E | none |
| G | **four** — `6·1` `b6` and `1·1` `b6` (their `5`s are the open strings, a fret below the window); `2·5` `5` (its `b6` is a fret above the top); `2·1` `b3` (its `2` is a fret below the bottom) |
| D | **one** — `2·6` `b6` (its `5` at `2·5` is a fret below the window) |

### Why the pentatonic left out exactly these two — the opener's best paragraph

Measure each of natural minor's seven degrees against the three chord tones `1 b3 5`:

| Degree | Nearest chord tone | Distance |
| --- | --- | --- |
| `4` | `b3` / `5` | two frets either side |
| `b7` | `1` | two frets |
| **`2`** | **`b3`** | **one fret** |
| **`b6`** | **`5`** | **one fret** |

**The minor pentatonic is exactly the notes of natural minor that are not a semitone from a chord
tone.** Checked: no pentatonic note sits a fret from any of `1`, `b3`, `5`; both omitted notes do.
That is why the pentatonic is safe over an `Am` and the whole scale is not, and it is a derivation
rather than an assertion.

### What each window's three-fret reaches were for

Chapter 3 named a "three-fret string" set for every window. **Every one of those reaches gets exactly
one new note in the middle of it** — the note it was missing — and the rest of each window's new dots
arrive at its edges, which is why the counts stop at 17 and 18 instead of coming out equal.

| Form | Ch3's three-fret strings | New dot filling the gap | New dots at the window's edges |
| --- | --- | --- | --- |
| C | 3, 2 | `3·10` `b6`, `2·12` `2` | `6·13` `b6`, `4·9` `2`, `1·13` `b6` |
| A | 6, 5, 1 | `6·1` `b6`, `5·2` `2`, `1·1` `b6` | `2·0` `2`, `4·3` `b6` |
| G | 4, 3 | `4·3` `b6`, `3·4` `2` | `6·1` `b6`, `5·2` `2`, `1·1` `b6` |
| E | 6, 2, 1 | `6·7` `2`, `2·6` `b6`, `1·7` `2` | `3·4` `2`, `5·8` `b6` |
| D | 5, 4 | `5·8` `b6`, `4·9` `2` | `6·7` `2`, `3·10` `b6`, `2·6` `b6`, `1·7` `2` |

Which degree fills which gap is fixed: a `1`→`b3` gap takes the `2`; a `5`→`b7` gap takes the `b6`.
**The opener states this. No form lesson re-argues it** — a form lesson may name its own two or three
in a clause.

### The neck outside the windows

- **Fret 11 carries no note of A natural minor on any string.** The only fret in frets 0–15 like
  that, and **the C form is the only one of the five windows that contains it**. That is why the C
  form's seventeen dots sit on 9, 10, 12 and 13 with a hole through the middle.
- **Frets 4 and 6 each carry exactly one note of the scale** — `3·4` `2` and `2·6` `b6`. They are the
  neck's two sparsest non-empty frets, **both of those notes are new at this layer**, and **the E
  form is the only window that contains both** (the G form has fret 4, the D form has fret 6).
- Fret density, frets 0–15: `6 3 3 5 1 6 1 5 4 2 6 0 6 3 3 5`.
- **Frets where all six strings sound a note of the scale: 0, 5, 10 and 12** (12 repeats 0).
  Chapter 3 found fret 5 was the **only** such fret for the pentatonic, which was true there. The
  reason is now visible: **frets 0 and 12 include a `2` (`2·0`, `2·12`) and fret 10 includes a `b6`
  (`3·10`). Fret 5 is the one whose six notes dodge both of the new ones.** The closer owns this, in
  two sentences and no table.
- Every `b6` in frets 0–13: `6·1`, `1·1`, `4·3`, `2·6`, `5·8`, `3·10`, `6·13`, `1·13` — eight of
  them. Four distinct pitches (`F2` 41, `F3` 53, `F4` 65, `F5` 77).
- Every `2` in frets 0–13: `2·0`, `5·2`, `3·4`, `6·7`, `1·7`, `4·9`, `2·12` — seven. Three distinct
  pitches (`B2` 47, `B3` 59, `B4` 71).

### The seams

| Seam | Frets | Dots | Degrees present |
| --- | --- | --- | --- |
| A ∩ G | `1–3` | 11 | all seven |
| G ∩ E | `4–5` | 7 | **six — no `b6`** |
| E ∩ D | `6–8` | 10 | all seven |
| D ∩ C | `9–10` | 8 | all seven |

**Three of the four seams hold all seven degrees. The one that does not is the seam over fret 5, and
the note it is missing is the `b6`** — no `b6` sits at fret 4 or fret 5 on any string. That is the
sharpest available explanation of why the fret-5 box feels so safe, and it ties directly to chapter
3's fret-5 fact. The closer owns it, **in one short paragraph and no table**. Chapters 2 and 3 both
spent a closer on the seams; a third full table adds nothing.

### Chapter 3's superlatives that this chapter must not repeat

Each was true **at the pentatonic layer** and is false or unowned now.

| Claim | Owner | Status here |
| --- | --- | --- |
| "twelve dots, two on every string" | ch3 opener | **Gone.** 17 or 18 dots, three per string in two windows. |
| "the E form's dots use only three frets" | ch3 E form | **Gone.** Its dots now use all five. |
| "two of the five windows spread, three settle" | ch3 C and G forms | **Gone.** Four of the five now use every fret in their span. |
| "the G form is the only window with thirteen dots" | ch3 G form | Layer-scoped. Do not carry forward. |
| "fret 5 is the only fret where all six strings sound a note of this scale" | ch3 E form | Layer-scoped and **must be reconciled** by the closer: there are four at this layer. |
| "the A form is the only window that gains two dots when the quality changes" | ch3 A form | Layer-scoped. Here it gains **four**, and it is still the biggest gap — but the number is different, so restate it, do not reuse it. |
| "the D form's dots sit on four consecutive frets with none skipped; only the open-position window manages that too" | ch3 D form | **Gone.** Four of five windows now use every fret in their span. |

### Superlatives this chapter is allowed — recomputed; nothing else may be claimed

- **C form**: the **only** one of the five windows that contains fret 11 at all; fret 11 is the
  **only** fret in frets 0–15 carrying no note of A natural minor on any string; the **highest**
  window; the **only** window with an empty fret inside its own dot span.
- **A form**: the **only** window narrower than five frets (four, `0–3`, the nut cuts it short), and
  it holds seventeen dots inside them — **more dots per fret than any other window**; the **biggest**
  gap between the two qualities of the five (13 major against 17 minor; the next biggest is one); all
  six open strings are notes of the scale.
- **G form**: the **only** window that holds three `b3`s, three `b6`s **and** three `b7`s; **nine of
  its eighteen dots are one of the three flattened degrees**, the most of any window both in count
  and in proportion; the **only** window with a `b6` on its bottom fret whose `5` is an open string
  outside the frame (`6·1`→`6·0` and `1·1`→`1·0`).
- **E form**: the **only** window whose dot count is the **same** in both qualities (17 and 17); the
  **only** window containing both of the neck's two sparsest frets; the window whose dots grew from
  three frets to five, **the biggest change in span of the five**.
- **D form**: the **only** window that gains **six** dots at this layer; the **only** window where
  every one of the six strings gains a note.
- **Chapter-level**: exactly **two** of the five windows hold eighteen dots, and they are exactly the
  two with three dots on every string; exactly **three** of the four seams hold all seven degrees.

**Not allowed**, because they are false:

- "three dots on every string, in every window" — the C, A and E forms each have a string with two.
- "the G form is the only window with eighteen dots" — the D form has eighteen too.
- "the D form is the widest" / "the C form is the only one that spreads" — four windows are five
  frets wide and four of them use every fret.
- "the E form is the most compact" — it was, at the pentatonic layer. Not now.
- "the C form has the most `b6`s" — the C, A, G and D forms all hold three.
- "the D form has the fewest roots" — the C, A and D forms all hold two.
- "every `5` has a `b6` a fret above it inside the window" — true on the neck, false inside the G and
  D windows; see the table above.
- "the `b6` is what makes it minor" — chapter 1 gave that to the `b3`, in print, and this chapter
  must not take it back. The `b3` decides the chord; the `b6` colours the key.
- Calling A minor's A form a five-fret window.

### The diagram convention

`caged-shape` draws **everything in the window, not one playable grip.** Chapter 2 said so because
its windows held 7–8 dots where a hand holds 4–6; chapter 3 said the arithmetic had flipped, because
two dots per string is roughly a hand's worth. At this layer it is 17 or 18 dots — the whole scale
inside the whole window. **The opener restates the convention once for the chapter; no form lesson
re-argues it.**

---

## Scope guards

- **The word "mode" does not appear. Neither does "Aeolian", "Dorian", "melodic minor", "harmonic
  minor" or "modal".** The `b6` may be called the note the pentatonic left out and the darkest note
  in the scale. It may **not** be compared to any other scale, named as what distinguishes one scale
  from another, or used to gesture at "other minor scales".
- **No jargon labels for the new notes.** Not "avoid note", "tension note", "passing tone", "leading
  tone", "colour tone", "ninth", "eleventh", "thirteenth". Say what they do.
- **Chapter 5's territory, untouched**: the seven chords of the key, Roman numerals, harmonising the
  scale, the raised seventh, the major `V`, switching between C major and A minor as keys, running a
  progression up the neck, transposing. No chord is named in this chapter except `Am` — and `A` in
  the one dot-count comparison the A form lesson makes. **No `F`, `C`, `Dm`, `Em` or `G` as chords.**
  One clause in the closer may say the next chapter turns the scale into chords. Nothing more.
- **No three-notes-per-string.** Chapter 3's closer said the second toggle for a seven-note scale
  "becomes something else entirely". The closer may name it — `3/str` — in **one clause**, say it
  carves the same notes a different way, and say this pathway does not teach it. Nowhere else.
- **No `b5`.** Chapter 3's closer spent it. Not one word.
- **Do not re-teach chapter 3.** Which dots are chord tones, the Boxes numbering, the `4` and the
  `b7`. A form lesson may name its window's new dots and its roots; it must not re-list its chord
  tones as a set.
- **Do not reprint chapter 1's seventeen-position table** in the E form lesson. Link
  `minor-caged-one-window-two-names` and say what the connection is in two sentences.
- **Never "m3", never "the Em form", never "Amin".** Degrees are `1 2 b3 4 5 b6 b7`, always with the
  `code` mark.
- **A major appears exactly once**, in the A form lesson's dot-count comparison. C major appears only
  in the closer's relative paragraph and in the E form lesson's one-sentence link back to chapter 1.
  Never demonstrate in another key.
- **No `triad-shape` / `triad-ladder`** — different pathway. **No `progression-player`** — nothing in
  this chapter is a claim about how a sequence of chords sounds, and the chords it would need are
  chapter 5's.
- **No `url` links. No `image` blocks. No footnotes.**
- **Link text is the screen's name**, never its route: `Scale Visualizer`, not `/scale-visualizer`.

---

## The lessons

Seven articles, in order. The five form slugs are fixed by the pathway brief; the opener and closer
are chosen here. Section ids are progress keys and are **never** renamed.

Every article: `schemaVersion: 1`, `publishedAt: "2026-08-14"`, `tags: ["caged", "minor"]`,
`readingTimeMin` = ceil(words ÷ 200) with a floor of 2. `meta.slug` equals the filename stem. The
title is `meta.title` and **no article opens with a heading block**.

Every form lesson uses `live` · `caged-shape` ·
`{ "root": "A", "form": "<letter>", "quality": "minor", "show": "scale", "caption": "…" }` — the same
`root` + `form` chapters 2 and 3 drew at `show: "triad"` and `"pentatonic"`. **Every form lesson must
say that this is the last layer**: the window is now complete, and the learner has not been handed a
new shape since chapter 2.

Positions use the compact `5·3` shorthand (string, then fret, `code` mark). **The C form lesson — the
first heavy user — restates what it means in one clause**, as chapter 3's C form lesson did.

---

### 1. `minor-caged-the-last-two-notes` — "The Last Two Notes"

- **Section id**: `minor-caged.ch4.the-last-two-notes` ·
  **Article id**: `art_minor-caged-the-last-two-notes`
- **Length**: 750–900 words. The longest of the first six; it carries the frame.
- **Left by chapter 3**: the pentatonic `1 b3 4 5 b7` in all five windows; which of its five notes
  are chord tones; the Boxes reconciliation and that "box 1 at fret 5" is the E form; the `b5` named
  once; twelve dots and two per string in four windows, thirteen in the G form; fret 5 the only
  all-six pentatonic fret; and its closing sentence: "Chapter 4 takes the same five windows and adds
  two more notes — still no new shapes." Chapter 3's opener also named the `2` and the `b6` in one
  clause as the two the pentatonic leaves out, **teaching neither**.
- **The one thing it teaches**: the two notes left are the `2` and the `b6`, they are the only two
  notes of the scale that sit a semitone from a chord tone, and that single fact explains both why
  the pentatonic omitted them and how to find them.
- **The misconception it corrects**: "the last two are just two more dots, and once you know the shape
  every note in it is as safe as any other."

**Key points, in order**

1. Cash chapter 3's promise in the first paragraph. Same five windows, last two notes, no new shape —
   and **after this there is no further layer**. The learner has not been asked to learn a new shape
   since chapter 2, and will not be asked for one again. Say that out loud; it is the payoff for four
   chapters of patience. Use different words from chapter 2's and chapter 3's closers, which both
   said a version of "the windows don't change".
2. Natural minor is `1 2 b3 4 5 b6 b7`. In A: `A B C D E F G`. The pentatonic had `1 b3 4 5 b7`; this
   adds the **`2`** and the **`b6`** — `B` and `F`.
3. **The `b6` closes chapter 1's account.** Chapter 1 taught that three notes drop when A major
   becomes A minor: `3→b3`, `6→b6`, `7→b7`. The `b3` arrived in chapter 2, the `b7` in chapter 3, and
   the `b6` arrives here. **All three are finally on the neck at once**, and this is the first layer
   in the pathway where "the three notes that drop" is a true description of what is drawn. Chapter 3
   had to warn against that phrase; this is where the warning expires. Link
   [`minor-caged-the-three-that-drop`](article link).
4. **The `2` never dropped**, and this is its introduction. `1`, `2`, `4` and `5` are identical in A
   major and A minor — chapter 1's parallel table said so. So the `2` is the one note this chapter
   adds that has nothing to do with the scale being minor. It is a whole step above home, it is
   consonant over an `Am`, and it is what turns a pentatonic run into something that moves by steps
   rather than by leaps. Give it a real paragraph: without it, `1` to `b3` is a jump of three frets;
   with it, the first three notes of the scale walk.
5. **The `b6` is the chapter's real subject.** It is the semitone above the `5` — `F` above `E`. It is
   the darkest note in the scale: it is what natural minor has that the five notes the learner has
   been playing do not, and it is the reason the whole scale sounds heavier than the box. Be precise
   and do not overclaim: chapter 1 already established that the **`b3`** decides whether a chord is
   minor. The `b6` does not do that job. It colours the key.
6. **The derivation, and it is the best paragraph available.** Measure every degree against the chord
   tones `1 b3 5`. The `4` is two frets from both the `b3` and the `5`; the `b7` is two frets from the
   `1`. The `2` is **one fret** below the `b3`. The `b6` is **one fret** above the `5`. **The minor
   pentatonic is exactly the notes of natural minor that are not a semitone from a chord tone** —
   which is why it is safe, and why these two are the two it left out. Give this the small `table`
   from the verified section.
7. **What that means with a guitar in hand.** Play the `Am` barre at fret 5 and let it ring, then play
   `5·8` — the `b6` — over the top of it. It sits one fret above the `E` the chord is built on and it
   grates. Now let it fall to `5·7`, the `5`, and it settles. That is the whole character of the note:
   place it, lean on it, move. Do the same with the `2` at `6·7` and it does not fight at all. Send
   them to [Drone](screen link) for a sustained `A` to keep doing it against. **A `tip` callout.**
8. **The half-step map, as the finding rule.** A `b6` is one fret above every `5`; a `2` is one fret
   below every `b3`. Both notes are already located, everywhere, by chord tones the learner learned in
   chapter 2. Note honestly in a clause that a window's edges are fixed frets, so a pair can straddle
   one — two windows have dots whose partner is just outside the frame, and their own lessons say so.
9. **Where the new dots land**, using the verified gap table. Every three-fret reach chapter 3 named —
   the two- or three-string stretches in each window — gets exactly one new note in the middle of it,
   and it is always the same one: a `1`→`b3` gap takes the `2`, a `5`→`b7` gap takes the `b6`. The
   rest arrive at the window's edges, and that is why the counts come out at 17 and 18 rather than
   equal. One paragraph plus one short `table` (form · gap-fillers · edge arrivals) — or keep it to
   prose if the table crowds the lesson.
10. **The count, and the death of chapter 3's tidiest fact.** Chapter 3 found twelve dots and two per
    string in four windows and thirteen in the G form. That is gone: **17 dots in the C, A and E
    forms, 18 in the G and D forms — and the two eighteens are exactly the two windows with three dots
    on every string.** Give the count `table` (form · window · dots · dots per string · short string).
    Say the conclusion: the tidy layer was the incomplete one.
11. **The `live` blocks.** `scale-compare`
    `{ "root": "A", "scales": ["minor-pentatonic", "minor"] }` — the pentatonic is the reference card,
    so **the two notes the scale adds are tinted amber on the second card**. Tint the words `2` and
    `b6` amber in the surrounding prose to match. Then the C form window twice, adjacent:
    `caged-shape` at `"show": "pentatonic"` then at `"show": "scale"`. Twelve dots then seventeen. Say
    which five are new — `6·13` `b6`, `4·9` `2`, `3·10` `b6`, `2·12` `2`, `1·13` `b6` — and **stop
    there**; the next lesson owns the C form's character.
12. **The diagram convention, restated once for the chapter.** The window diagram lights every note of
    the layer inside the window, not one grip. At this layer that is the whole scale inside the whole
    window.
13. Close on the C form and on strict C-A-G-E-D order, the same as chapters 2 and 3.

**Blocks / components**

- `live` · `scale-compare` · `{ "root": "A", "scales": ["minor-pentatonic", "minor"] }`
- `live` · `caged-shape` · `{ "root": "A", "form": "C", "quality": "minor", "show": "pentatonic", "caption": "…" }`
- `live` · `caged-shape` · `{ "root": "A", "form": "C", "quality": "minor", "show": "scale", "caption": "…" }`
- `table` — the seven degrees, their notes in A, and how far each sits from its nearest chord tone.
- `table` — the count per window (form · window · dots · dots per string · short string).
- One `callout` (`tip`): the `b6` a fret above the `5`, the `2` a fret below the `b3` — both already
  located by notes you learned in chapter 2.
- Article links to `minor-caged-the-three-that-drop`, `minor-caged-boxes-and-forms` and
  `minor-caged-scale-c-form`; screen links to `/drone` and `/scale-visualizer`.

**Do not**: teach any form's dot positions beyond the five new C-form dots listed above; use
`caged-ladder`; name a chord other than `Am`; mention Boxes, the `b5` or three-notes-per-string; use
the word "mode".

---

### 2. `minor-caged-scale-c-form` — "The C Form: The Fret With Nothing On It"

- **Section id**: `minor-caged.ch4.scale-c-form` · **Article id**: `art_minor-caged-scale-c-form`
- **Length**: 550–700 words
- **Left by the opener**: the scale is `1 2 b3 4 5 b6 b7`; the `b6` a fret above every `5` and the `2`
  a fret below every `b3`; the two new notes are the only two a semitone from a chord tone; the
  counts are 17 and 18; the diagram draws the whole window; and the C form's seventeen dots already
  drawn once, undiscussed.
- **The one thing it teaches**: fret 11 carries no note of A natural minor on any string, the C form
  is the only one of the five windows that contains it, and that is why this window's seventeen dots
  sit in two clusters with a dead fret through the middle.
- **The misconception it corrects**: "if I can't get a whole window under one hand, I'm doing it
  wrong."

**Key points, in order**

1. Restate the shorthand in one clause: `5·3` means string 5, fret 3, string 1 being the high `e`.
   Then the window: frets `9–13`, the highest of the five, and the same window chapters 2 and 3
   worked in. Seventeen dots.
2. Give the seventeen as a `table`, string by string, three columns. Use the verified table unchanged.
3. **The hole, and it is bigger than it looks.** Chapter 3 already noticed fret 11 was empty here and
   left it as a property of a five-note scale. It is not. **No string carries a note of A natural
   minor at fret 11 at all** — with every one of the seven notes in play, the emptiness is a genuine
   hole in the neck rather than a gap in a five-note shape. Say it was checked string by string.
   Note that this is the only fret in the first fifteen like that, and that the C form is the only one
   of the five windows that contains it. **A `warning` callout**: the shape does not settle under one
   hand, and that is the neck's doing, not the learner's reach.
4. **The two clusters, now fuller.** Frets 9–10 hold seven dots, frets 12–13 hold ten. Chapter 3 found
   a root in each cluster — `2·10` and `5·12` — and that has not changed. What has changed is that
   each cluster now carries a `b6`: `3·10` in the lower one, `6·13` and `1·13` in the upper.
5. **What is new since chapter 3**: `6·13` `b6`, `4·9` `2`, `3·10` `b6`, `2·12` `2`, `1·13` `b6`.
   **Three of the five are `b6`s** — this window holds three of them, the most any window holds, tied
   with three others. (Do not say "the most"; say "three, as many as any window holds".) Where they
   sit relative to the `5`s: `3·10` is one fret above `3·9`, `6·13` one above `6·12`, `1·13` one above
   `1·12` — three identical one-fret pairs, all `5`→`b6`, on strings 3, 6 and 1.
6. **The short string is string 5**, carrying only `5·10` `b7` and `5·12` `1` — the one string here
   that gains nothing at this layer.
7. **`3·10` is worth a sentence of its own.** It is the only note of A natural minor at fret 10 on
   string 3, it is a `b6`, and the closer will show it is the reason fret 10 behaves differently from
   fret 5. Hand it on; do not explain it here.
8. The `live` block and the continuity line: chapter 2 lit seven dots in this window, chapter 3 lit
   twelve, this lights seventeen. **Same window every time. This is the last layer.**
9. Close on the A form, which is the opposite in every respect.

**Blocks / components**

- `live` · `caged-shape` · `{ "root": "A", "form": "C", "quality": "minor", "show": "scale", "caption": "…" }`
- `table` — the seventeen dots, string by string.
- One `callout` (`warning`): fret 11 holds no note of this scale on any string, so this window is two
  clusters rather than one hand position.
- Article links to `minor-caged-pentatonic-c-form` and `minor-caged-scale-a-form`; screen link to
  `/scale-visualizer`.

**Do not**: call this the only window that spreads (four windows are five frets wide); claim it holds
the most `b6`s (three windows tie it); explain fret 10's all-six property; re-list its chord tones.

---

### 3. `minor-caged-scale-a-form` — "The A Form: All Six Open Strings"

- **Section id**: `minor-caged.ch4.scale-a-form` · **Article id**: `art_minor-caged-scale-a-form`
- **Length**: 550–700 words
- **Left by the C form**: seventeen dots in a five-fret window with a dead fret; three `5`→`b6` pairs
  named in real positions; the short string.
- **The one thing it teaches**: every open string on the guitar is a note of A natural minor, so this
  four-fret window holds seventeen dots — more per fret than any other — and the string chapter 3 had
  to leave out is back.
- **The misconception it corrects**: "open position is a beginner's special case, not a real scale
  position."

**Key points, in order**

1. The window: frets `0–3`, **four frets, not five, because the nut cuts it short** — chapters 1, 2
   and 3 all said so and this lesson agrees. Seventeen dots inside four frets. Every fret in the
   window carries something. Give the seventeen as a `table`.
2. **The loose end from chapter 3, tied off.** Chapter 3's A form lesson had to say that string 2's
   open `B` sits out, because it is not one of the pentatonic's five notes. It is one of the scale's
   seven — **it is the `2`, at `2·0`**. So **all six open strings are notes of A natural minor**:
   `E A D G B E`, degrees `5 1 4 b7 2 5`. Be precise — six strings, five different degrees, and the
   two the open strings do not give you are the `b3` and the `b6`.
3. **Seventeen dots in four frets.** The C and E forms hold seventeen in five, the G and D forms
   eighteen in five. **This window packs more dots into each fret than any other**, and it does it
   with the nut doing the work: five of the six strings still have their lowest dot at fret 0.
4. **The quality gap, and it is the biggest in the chapter.** A **major**'s window here holds thirteen
   dots; A minor's holds seventeen. **Four more** — where every other window differs by one or none.
   This is the chapter-2 edge effect at its loudest, and the reason is simply which pitch classes fall
   inside frets `0–3`: A natural minor is all naturals, and open position is where the naturals live.
   Do not invent a causal story about the nut; chapter 3's draft did and it was cut.
5. **What is new since chapter 3**: `6·1` `b6`, `5·2` `2`, `4·3` `b6`, `2·0` `2`, `1·1` `b6`. Three
   `b6`s and two `2`s. Two of them sit under the first finger at fret 1 — `6·1` and `1·1`, the same
   note two octaves apart, both a fret above the open `E` below them. **Play `6·1` and let it fall to
   the open low `E`**: that is the `b6` leaning down onto the `5`, and here the `5` costs no finger at
   all. Give it a `tip` callout.
6. **The short string is string 3**, carrying only `3·0` `b7` and `3·2` `1` — the one string here that
   gains nothing.
7. **The open `Am` is still inside it**, exactly where chapter 2 left it, with the scale filled in
   around it. One clause, no re-teaching.
8. Practical: [Drone](screen link) on a sustained `A`. Play the window and stop on `1·1` — the `b6`,
   and the whole colour of the chapter in one note. Then stop on `1·0` and hear it settle.
9. The `live` block and the continuity line. Close on the G form.

**Blocks / components**

- `live` · `caged-shape` · `{ "root": "A", "form": "A", "quality": "minor", "show": "scale", "caption": "…" }`
- `table` — the seventeen dots, string by string.
- One `callout` (`tip`): `6·1` is a `b6` and the open string beneath it is the `5` — the chapter's
  central pair, with the nut doing half the work.
- Article links to `minor-caged-pentatonic-a-form` and `minor-caged-scale-g-form`; screen links to
  `/drone` and `/scale-visualizer`.

**Do not**: call this window five frets wide; claim the open strings give you an `Am` chord (no `b3`
among them); repeat chapter 3's "gains two dots" number — it gains four here; name any chord but `Am`
and the single `A` in point 4.

---

### 4. `minor-caged-scale-g-form` — "The G Form: The Darkest Window"

- **Section id**: `minor-caged.ch4.scale-g-form` · **Article id**: `art_minor-caged-scale-g-form`
- **Length**: 550–700 words
- **Left by the A form**: all six open strings; the `b6` falling onto an open `5`; the biggest quality
  gap; the shorthand and the convention long since settled.
- **The one thing it teaches**: the G form is the one window that holds three `b3`s, three `b6`s and
  three `b7`s at once — half its eighteen dots are one of chapter 1's three flattened degrees — which
  is why it sounds the way it does even though it was never a shape you could hold.
- **The misconception it corrects**: "a window is just a container; what's in it is the same
  everywhere."

**Key points, in order**

1. The window: frets `1–5`. **Eighteen dots, three on every string, every fret in the window used.**
   Give the eighteen as a `table`. Say plainly that eighteen is not unique — the D form holds eighteen
   too — and that these are the two windows with three dots on every string.
2. **The count that gives it its character.** Chapter 1 named three notes that drop from A major to A
   minor: `b3`, `b6`, `b7`. **This is the only window that holds three of each.** Nine of its eighteen
   dots — exactly half — are one of those three, which is more than any other window carries, both in
   count and in proportion. Say it was counted. Chapter 3 found this window tripled the `1`, the `b3`
   and the `b7` and called it settled and minor; the `b6` arriving three times is what makes it dark
   as well.
3. **Where the three `b6`s are**: `6·1`, `4·3` and `1·1`. Two of them sit on the window's bottom fret.
4. **The edge, and it is this window's own fact.** `6·1` and `1·1` are `b6`s whose `5`s are the **open
   E strings, a fret below the window's bottom edge**. So in this one window the chapter's central
   pair straddles the frame: the note that leans is inside and the note it leans onto is outside.
   **This is the only window where that happens with an open string.** Two more dots here have their
   partner outside the frame — `2·5` `5` (its `b6` is one fret above the top) and `2·1` `b3` (its `2`
   is one fret below the bottom) — so four dots in this window are missing their neighbour, more than
   anywhere else; the D form has one and the other three windows have none. Give the number, and say
   what it means practically: play this window and the resolutions fall off both ends of it.
5. **What is new since chapter 3**: `6·1` `b6`, `5·2` `2`, `4·3` `b6`, `3·4` `2`, `1·1` `b6` — five
   dots, and **string 2 gains nothing at all.** It already carried three (`2·1` `b3`, `2·3` `4`,
   `2·5` `5`), which is exactly why chapter 3 found thirteen dots here where every other window had
   twelve. The window that was ahead at the last layer gains the least room at this one.
6. **`3·4` is worth naming**: fret 4 carries exactly one note of A natural minor on the whole neck,
   and it is this dot — a `2`. Say it in a clause; the E form lesson owns the pair of sparse frets.
7. Three roots — `6·5`, `3·2`, `1·5` — unchanged since chapter 2. One clause.
8. Practical: [Drone](screen link) on `A`. Play `6·1` and let it fall to the open low `E`, then play
   `1·1` and let it fall to the open high `e` — the same move two octaves apart, and the darkest sound
   this chapter has.
9. The `live` block and the continuity line. Close on the E form.

**Blocks / components**

- `live` · `caged-shape` · `{ "root": "A", "form": "G", "quality": "minor", "show": "scale", "caption": "…" }`
- `table` — the eighteen dots, string by string.
- One `callout` (`info`): nine of eighteen dots are a `b3`, a `b6` or a `b7` — chapter 1's three
  flattened degrees, three times each.
- Article links to `minor-caged-pentatonic-g-form`, `minor-caged-the-three-that-drop` and
  `minor-caged-scale-e-form`; screen links to `/drone` and `/scale-visualizer`.

**Do not**: say this is the only window with eighteen dots or the only one with three on every string
(the D form ties both); say it has more roots than any other (the E form also has three); explain the
two sparsest frets (the E form owns that); repeat chapter 3's "thirteen dots" as a live claim.

---

### 5. `minor-caged-scale-e-form` — "The E Form: The Two Frets the Box Skipped"

- **Section id**: `minor-caged.ch4.scale-e-form` · **Article id**: `art_minor-caged-scale-e-form`
- **Length**: 650–800 words. The chapter's biggest form lesson — this is the window every self-taught
  player already owns, and it is where the chapter's arc lands.
- **Left by the G form**: eighteen dots and what they are made of; pairs straddling a window edge;
  `3·4` named once as the only note at fret 4.
- **The one thing it teaches**: the fret-5 box left frets 4 and 6 empty; the whole scale puts exactly
  one note on each, and those two dots — `3·4` `2` and `2·6` `b6` — are the only notes of A natural
  minor at those frets anywhere on the neck.
- **The misconception it corrects**: "I already play this box, so there is nothing here" — and its
  sharper form, "the scale is just the box with more notes crammed into the same frets."

**Key points, in order**

1. The window: frets `4–8`, the `Am` barre at fret 5's own window. **Seventeen dots, and for the first
   time they use all five frets.** Give the seventeen as a `table`.
2. **The change, which is the lesson.** Chapter 3 found this window's twelve dots living on only three
   frets — 5, 7 and 8 — with nothing at fret 4 or fret 6. The scale puts **exactly one dot on each of
   those two frets**: `3·4` `2` and `2·6` `b6`. Two notes, and the most compact window in chapter 3
   becomes a full five-fret shape. **Of the five, this window's dots grew the most in span** — three
   frets to five.
3. **Why those two frets were empty, and it is a fact about the neck.** Fret 4 carries exactly one
   note of A natural minor on the whole neck, and fret 6 carries exactly one. They are the two
   sparsest non-empty frets on the neck, **the single note on each is one this chapter adds**, and
   **the E form is the only one of the five windows that contains both**. Say it was checked fret by
   fret, not assumed.
4. **The pair on string 2 is the chapter's central move, sitting in the most-played window on the
   instrument.** `2·5` is the `5` and `2·6` is the `b6` — one fret apart, second string, right under
   the barre finger. Play the `Am` barre at fret 5, hold it, and add `2·6`. That is the note the
   pentatonic spent five chapters not giving you. Then take it back to `2·5`. **A `tip` callout.**
5. **Chapter 1 already drew this window's seventeen positions**, when it read frets `4–8` twice — once
   as C major's G form and once as A minor's E form — and labelled `5·8` a `b6` and `3·4` a `2` before
   the learner had any layer at all. **Two sentences and a link** to
   [`minor-caged-one-window-two-names`](article link): what was a table of names then is a shape under
   your hand now. **Do not reprint the table.**
6. **The count is the same in both qualities here**, and it is the only window where that is true: A
   major's window holds seventeen dots and A minor's holds seventeen. One sentence; do not re-derive
   the edge effect.
7. **What is new since chapter 3**: `6·7` `2`, `5·8` `b6`, `3·4` `2`, `2·6` `b6`, `1·7` `2`. Three
   `2`s — the most any window holds, tied with the D form — and **only two `b6`s, the fewest of the
   five.** That is worth one sentence tied to point 4: the box everyone plays is also the window that
   holds the least of the darkest note.
8. **The short string is string 4**, carrying only `4·5` `b7` and `4·7` `1` — the one string here that
   gains nothing, and one of its two dots is a root.
9. Three roots — `6·5`, `4·7`, `1·5`, chapter 2's `6 → 4 → 1` map — unchanged three chapters later.
   One clause.
10. Practical close: [Drone](screen link) on `A`, play frets 4 to 8 without moving the hand, and land
    on `6·5`, `4·7` or `1·5`. Then try stopping on `5·8` and hear what it does instead.
11. The `live` block and the continuity line. Close on the D form.

**Blocks / components**

- `live` · `caged-shape` · `{ "root": "A", "form": "E", "quality": "minor", "show": "scale", "caption": "…" }`
- `table` — the seventeen dots, string by string.
- One `callout` (`tip`): hold the barre at fret 5 and add `2·6` — the `b6`, one fret above the `5`,
  under the finger you are already using.
- Article links to `minor-caged-pentatonic-e-form`, `minor-caged-one-window-two-names` and
  `minor-caged-scale-d-form`; screen links to `/drone` and `/scale-visualizer`.

**Do not**: call this the most compact window (it was, at the last layer, and is not now); reprint
chapter 1's seventeen-row table; mention Boxes or "box 1"; claim it holds the most roots (the G form
ties it); teach the all-six-string frets.

---

### 6. `minor-caged-scale-d-form` — "The D Form: A New Note on Every String"

- **Section id**: `minor-caged.ch4.scale-d-form` · **Article id**: `art_minor-caged-scale-d-form`
- **Length**: 550–700 words. **This is a form lesson only.** The chapter's join-up is a separate
  article and this lesson must not begin it.
- **Left by the E form**: the two sparsest frets and what fills them; the `5`→`b6` pair under the
  fret-5 barre; the box now using all five of its frets.
- **The one thing it teaches**: the D form is the only window that gains six dots and the only one
  where every single string gains a note — so it is the window this layer changes most evenly, and
  it ends up with three `b6`s and only two roots.
- **The misconception it corrects**: "the windows above the box are just more of the same shape."

**Key points, in order**

1. The window: frets `6–10`, the `Dm` shape at fret 7's own window. **Eighteen dots, three on every
   string, every fret used.** Give the eighteen as a `table`.
2. **Six new dots, and every string gets one.** `6·7` `2`, `5·8` `b6`, `4·9` `2`, `3·10` `b6`,
   `2·6` `b6`, `1·7` `2`. Every other window gains five and leaves one string untouched; this is the
   only one where nothing is left alone. Say it was counted against all five.
3. **Three `b6`s against two roots.** `5·8`, `3·10` and `2·6` are `b6`s; the roots are `4·7` and
   `2·10`, both on inside strings, exactly as chapter 3 found. Three of the darkest note and two
   places to land is a real practical consequence: run this window without planning and it sounds
   restless. Do **not** claim this is the fewest roots (the C and A forms also have two) or the most
   `b6`s (three windows tie it) — claim the **combination**, which is what the hand actually meets.
4. **`2·6` is the odd one out**, and it is this window's own edge story. It is a `b6` sitting on the
   window's bottom fret, and its `5` — `2·5` — is one fret below, outside the frame, in the E form's
   window instead. It is the only dot in this window whose one-fret partner is not here. It is also
   the only note of A natural minor at fret 6 anywhere on the neck, which the E form lesson already
   said; one clause, no re-derivation.
5. **The two `b6`s that sound the same note.** `2·6` and `3·10` are both `F4` — the identical pitch,
   four frets apart, in one window. Worth a sentence: it is the same dark note offered twice, once at
   each end of the shape.
6. **The `2` leaning into the `b3`, three times over.** `6·7`→`6·8`, `4·9`→`4·10` and `1·7`→`1·8` are
   all `B`→`C`, all one fret, on the low `E`, the `D` and the high `e` strings. Three octaves of the
   same step, and the clearest place in the chapter to hear what the `2` does. (The E form also has
   three; do not call this the most.)
7. **What has not changed**: the roots, the seam with the fret-5 box below and the C form above.
   Chapter 3 owns both; one clause each, no table.
8. The `live` block and the continuity line: chapter 2 lit seven dots here, chapter 3 twelve, this
   eighteen. **That is the fifth and last window completed.**
9. Close by handing over to the closer, which puts the five back together.

**Blocks / components**

- `live` · `caged-shape` · `{ "root": "A", "form": "D", "quality": "minor", "show": "scale", "caption": "…" }`
- `table` — the eighteen dots, string by string.
- One `callout` (`info`): six new dots, one on every string — the only window this layer changes
  everywhere at once.
- Article links to `minor-caged-pentatonic-d-form` and `minor-caged-nothing-left-to-add`; screen link
  to `/scale-visualizer`.

**Do not**: start the join-up; give the five-window summary table; explain the all-six-string frets;
use `caged-ladder`; repeat chapter 3's "four consecutive frets with none skipped" as a distinguishing
fact (four of the five windows now manage it).

---

### 7. `minor-caged-nothing-left-to-add` — "Nothing Left to Add"

- **Section id**: `minor-caged.ch4.nothing-left-to-add` ·
  **Article id**: `art_minor-caged-nothing-left-to-add`
- **Length**: 750–900 words
- **Left by the D form**: all five windows complete; six new dots on six strings; three `b6`s against
  two roots.
- **The one thing it teaches**: the five windows now hold the whole scale between them, there is
  nothing left to add, and none of it has to be memorised dot by dot — the roots plus two one-fret
  rules regenerate all of it.
- **The misconception it corrects**: "I now have five seventeen-dot pictures to learn."

**Key points, in order**

1. Open on the arrival. Five windows, seven degrees in each, nothing left to add. **The learner has
   not been handed a new shape since chapter 2 and will not be handed one now** — five shapes, learned
   once, filled in four times. Chapter 2's and chapter 3's closers both promised the next layer would
   need no new shape; this one **closes** the promise rather than renewing it, and must use different
   words.
2. **The summary `table`**, the chapter's one-page artefact: *Form* · *Window* · *Dots* · *Frets the
   dots use* · *String carrying only two*. Use the verified numbers unchanged. Two eighteens, three
   seventeens, and the two eighteens are the two windows with three on every string.
3. **You do not memorise seventeen dots.** The roots came from the `caged-fretboard` pathway, the
   `1 b3 5` from chapter 2, the `4` and the `b7` from chapter 3. This chapter added **two rules, not
   thirty-four dots**: a `b6` is one fret above every `5`, a `2` is one fret below every `b3`. Give
   this its own short section — it is the answer to the misconception — and note the honest exception
   in a clause: a window's edges can cut a pair, which happens four times in the G form, once in the
   D form and nowhere else.
4. **The `live` block: `caged-ladder` `{ "root": "A", "quality": "minor" }`**, framed exactly as point
   3 does. **Say out loud that it marks roots only, whatever the layer** — and that this is now
   enough, because from a root everything else is derivable. The minimal map.
5. **What each degree is for**, as a short `list` or `table` — the chapter's take-away.
   - `1`, `b3`, `5` — the chord. Where a phrase arrives.
   - `4`, `b7` — two frets from a chord tone in every direction. They move a line without arguing with
     anything.
   - `2` — a whole step above home and a fret below the `b3`. Consonant. It leans up, and it is what
     lets a line walk instead of jump.
   - `b6` — a fret above the `5`. The darkest note in the scale, and the one that will fight an `Am`
     if you sit on it. Place it and move.
6. **Why fret 5 was alone, answered.** Chapter 3 found fret 5 was the only fret where all six strings
   sound a note of the scale. With all seven notes there are four — **0, 5, 10 and 12**, and 12 is 0
   again. Then the sharp bit: **frets 0 and 12 include a `2` (the open `B` at `2·0`) and fret 10
   includes a `b6` (`3·10`). Fret 5 is the one whose six notes dodge both of the new ones**, which is
   exactly why it was alone before and exactly why it feels safe. Two or three sentences and **no
   table**.
7. **The seam that is missing a note.** Three of the four overlaps between neighbouring windows hold
   all seven degrees. The fourth — frets `4–5`, where the G form and the E form meet — holds six, and
   the one it is missing is the `b6`: no `b6` sits at fret 4 or fret 5 on any string. The safest
   corner of the neck is the one the darkest note cannot reach. **One short paragraph, no table** —
   chapters 2 and 3 both spent a closer on the seams and a third full pass adds nothing.
8. **The relative payoff, and it is what this pathway has been building to.** A natural minor and C
   major are the same seven notes, so **every dot in this chapter is a dot in the C major neck the
   `caged-fretboard` pathway drew** — the same frets, the same fingers, seven different names. Chapter
   1 proved it for one window; it is now true for the whole neck. And the two semitones are the same
   two frets either way: `B`→`C` and `E`→`F`. In C major the `B` is the `7` leaning up into the `1`
   and the `F` is the `4` leaning on the `3`. In A minor the same `B` is the `2` leaning up into the
   `b3` and the same `F` is the `b6` leaning on the `5`. **The leaning notes never moved; what changed
   is which chord tone is underneath them.** Link
   [`minor-caged-one-window-two-names`](article link). One paragraph, and it is the best one in the
   lesson.
9. Close by sending them to the [Scale Visualizer](screen link) with root `A`, the scale set to
   natural minor and the position system on **CAGED** — the same five windows, now complete — and to
   [Drone](screen link) for a sustained `A` to play any of them against. **One clause** may say the
   other toggle chapter 3 left unnamed is `3/str`, which carves the same notes a different way and is
   not what this pathway teaches. **One clause** may say the next chapter turns the scale into chords.
   Nothing more of either.

**Blocks / components**

- `table` — the five windows summarised.
- `live` · `caged-ladder` · `{ "root": "A", "quality": "minor" }` — at point 4, framed as the minimal
  map, not as a tiling diagram.
- `table` or `list` — what each degree is for.
- One `callout` (`info`) at point 3 for the two rules as the memory aid.
- Article link to `minor-caged-one-window-two-names`; screen links to `/scale-visualizer` and
  `/drone`.

**Do not**: use `caged-shape` (five more diagrams would drown the tables); give a seam table or an
overlap table; re-teach any single window's dots; name a chord other than `Am`; teach
three-notes-per-string; name any chapter 5 content beyond one clause; use the word "mode".

---

## The activities

Two, both `note-play`, both with `"optional": true` on their sections. Every round below was checked
against MIDI (string 1 open = 64, 2 = 59, 3 = 55, 4 = 50, 5 = 45, 6 = 40) and is **pitch-distinct**.

**The two that would have bitten.** The G form's eighteen dots are not pitch-distinct — `2·1` and
`3·5` are both `C4`. Neither are the D form's — `2·6` and `3·10` are both `F4`, **and both are
`b6`s**. Each of those rounds therefore takes seventeen of the eighteen and says so in its prompt.

### A. `minor-caged-find-the-sixth` — "Drill: The Two New Notes"

- **Section id**: `minor-caged.ch4.find-the-sixth` ·
  **Activity id**: `act_minor-caged-find-the-sixth`
- `kind: "note-play"`, `modes: ["easy", "hard"]`, document `board: { fretFrom: 0, fretTo: 13 }`.
  `estimatedMin: 8`.

| Round id suffix | Prompt gist | Targets (string · fret) | Board | MIDI | Ordered |
| --- | --- | --- | --- | --- | --- |
| `a-form-new` | The five the open-position window adds — three `b6`s and two `2`s | 6·1, 5·2, 4·3, 2·0, 1·1 | 0–3 | 41 47 53 59 65 | no |
| `e-form-new` | The five the fret-5 box adds, including the two frets it used to skip | 6·7, 5·8, 3·4, 2·6, 1·7 | 4–8 | 47 53 59 65 71 | no |
| `c-form-new` | The five the highest window adds | 6·13, 4·9, 3·10, 2·12, 1·13 | 9–13 | 53 59 65 71 77 | no |
| `every-flat-six` | Every `b6` you can reach, one per octave, low to high | 6·1, 4·3, 3·10, 1·13 | 0–13 | 41 53 65 77 | **yes** |
| `every-second` | Every `2` you can reach, one per octave, low to high | 6·7, 4·9, 1·7 | 0–13 | 47 59 71 | **yes** |

The last two rounds take one position per octave on purpose: inside frets 0–13 there are only four
distinct `b6` pitches and three distinct `2` pitches, so a longer round would repeat one and the
loader would reject it.

### B. `minor-caged-the-whole-window` — "Drill: The Whole Scale in One Window"

- **Section id**: `minor-caged.ch4.the-whole-window` ·
  **Activity id**: `act_minor-caged-the-whole-window`
- `kind: "note-play"`, `modes: ["easy", "hard"]`, document `board: { fretFrom: 0, fretTo: 13 }`.
  `estimatedMin: 12`.

The chapter's arc line as a physical exercise: A natural minor, everywhere on the neck, one window at
a time, in neck order.

| Round id suffix | Prompt gist | Targets (string · fret) | Board |
| --- | --- | --- | --- |
| `a-form` | All seventeen in open position | 6·0, 6·1, 6·3, 5·0, 5·2, 5·3, 4·0, 4·2, 4·3, 3·0, 3·2, 2·0, 2·1, 2·3, 1·0, 1·1, 1·3 | 0–3 |
| `g-form` | Seventeen of the G form's eighteen — `2·1` is left out because it sounds the same pitch as `3·5` | 6·1, 6·3, 6·5, 5·2, 5·3, 5·5, 4·2, 4·3, 4·5, 3·2, 3·4, 3·5, 2·3, 2·5, 1·1, 1·3, 1·5 | 1–5 |
| `e-form` | All seventeen in the fret-5 window, frets 4 and 6 included | 6·5, 6·7, 6·8, 5·5, 5·7, 5·8, 4·5, 4·7, 3·4, 3·5, 3·7, 2·5, 2·6, 2·8, 1·5, 1·7, 1·8 | 4–8 |
| `d-form` | Seventeen of the D form's eighteen — `2·6` is left out because it sounds the same pitch as `3·10`, and both are `b6`s | 6·7, 6·8, 6·10, 5·7, 5·8, 5·10, 4·7, 4·9, 4·10, 3·7, 3·9, 3·10, 2·8, 2·10, 1·7, 1·8, 1·10 | 6–10 |
| `c-form` | All seventeen in the highest window — mind the empty fret in the middle | 6·10, 6·12, 6·13, 5·10, 5·12, 4·9, 4·10, 4·12, 3·9, 3·10, 3·12, 2·10, 2·12, 2·13, 1·10, 1·12, 1·13 | 9–13 |

All five rounds unordered. They run in **neck order** — A, G, E, D, C — so the learner climbs the neck
rather than jumping. Verified MIDI, all distinct within every round:

- `a-form` 40 41 43 45 47 48 50 52 53 55 57 59 60 62 64 65 67
- `g-form` 41 43 45 47 48 50 52 53 55 57 59 60 62 64 65 67 69
- `e-form` 45 47 48 50 52 53 55 57 59 60 62 64 65 67 69 71 72
- `d-form` 47 48 50 52 53 55 57 59 60 62 64 65 67 69 71 72 74
- `c-form` 50 52 53 55 57 59 60 62 64 65 67 69 71 72 74 76 77

---

## The checkpoint

`minor-caged-ch4-checkpoint` · section id `minor-caged.ch4.checkpoint` ·
`meta.kind: "checkpoint"` · `passThresholdPct: 70` on both the quiz `meta` and the chapter
`checkpoint`.

Written **after** the articles are read, from what they actually say. Sketch — 8 questions, one per
lesson, with the opener carrying two, so no form's own material is displaced by the closer's:

| # | Question id suffix | Kind | Draws on | Tests |
| - | ------------------ | ---- | -------- | ----- |
| 1 | `the-two-notes` | `choice` | Opener | The layer adds the `2` and the `b6`; the `b6` is the last of chapter 1's three that drop |
| 2 | `why-the-pentatonic-left-them` | `choice` | Opener | Each of the two sits one fret from a chord tone — that is why the pentatonic omits exactly these two |
| 3 | `c-form-fret-eleven` | `choice` | C form | Fret 11 carries no note of A natural minor on any string |
| 4 | `a-form-open-strings` | `choice` | A form | All six open strings are in the scale; string 2's open `B` is the `2` |
| 5 | `g-form-three-flats` | `choice` | G form | Three `b3`s, three `b6`s and three `b7`s — half the window |
| 6 | `e-form-two-frets` | `fretboard` | E form | Mark the two dots the scale puts on the frets the box skipped — `3·4` and `2·6`, `frets: 8` |
| 7 | `d-form-every-string` | `choice` | D form | Six new dots, one on every string — the only window like that |
| 8 | `sitting-on-the-sixth` | `choice` | Closer + opener | The `b6` is a fret above the `5`, so it fights an `Am` if you hold it |

Every question gets an `explanation`. `fretboard` is graded all-or-nothing, so Q6 asks only for a fact
the E form lesson states explicitly and completely. **No option is referred to by letter or
position** — options shuffle on every attempt and render with no labels.

---

## Notes for the lesson agents

- **The corpus test is red mid-chapter.** `packages/content/src/load.test.ts` pins article, quiz and
  activity counts by number and by name, so the moment the first article of this chapter lands those
  assertions fail and keep failing until the chapter agent updates the pins. Read *which file* each
  failure names. **Ignore every count and slug-list assertion; fix only failures that name your own
  article.**
- **Verify every superlative by recomputation**, not by re-reading. The allowed list is above; if a
  draft wants one that is not on it, drop it. Three specific traps this chapter sets: eighteen dots is
  **two** windows not one; three-on-every-string is **two** windows not one; three `b6`s is **four**
  windows not one.
- Every `string·fret` token in prose must be a real dot from the tables above, with the right degree
  and the right note name. Check them one by one before reporting.
- **Chapter 3's superlatives are layer-scoped.** The table above lists the ones that are now false.
  Do not carry any of them forward.

---

## As built — final word counts

Words counted as all span text (paragraphs, callouts, lists, table cells, `live` captions), which is
the convention the shipped chapters 2 and 3 of this pathway actually use — `readingTimeMin` on
`minor-caged-pentatonic-g-form`, `-d-form`, `minor-caged-triad-g-form` and
`minor-caged-five-shapes-one-neck` only reconciles under that counting. (`caged-fretboard`'s chapter
4 used prose-only. The two conventions disagree on about one file in three; this chapter matched its
own pathway.)

| Lesson | Words | `readingTimeMin` | `estimatedMin` in the curriculum |
| --- | --- | --- | --- |
| `minor-caged-the-last-two-notes` | 916 | 5 | 6 |
| `minor-caged-scale-c-form` | 589 | 3 | 4 |
| `minor-caged-scale-a-form` | 704 | 4 | 5 |
| `minor-caged-scale-g-form` | 635 | 4 | 5 |
| `minor-caged-scale-e-form` | 731 | 4 | 5 |
| `minor-caged-scale-d-form` | 661 | 4 | 5 |
| `minor-caged-nothing-left-to-add` | 834 | 5 | 6 |
| `minor-caged-find-the-sixth` (activity) | — | — | 8 (optional) |
| `minor-caged-the-whole-window` (activity) | — | — | 12 (optional) |

Chapter total, counted sections only: **36 minutes** of articles plus **5** for the checkpoint =
**41**; 61 including the two optional drills. The pathway's `estimatedMin` is still its placeholder
of 200 — the top-level agent recomputes it once every chapter exists.

**One title changed during review.** The C form lesson was planned and drafted as **"The C Form: The
Fret With Nothing On It"**. That is, word for word, the title of `caged-scale-d-form` in the sibling
`caged-fretboard` pathway, which is about the same empty fret 11 — and the two pathways are meant to
read as a pair. Retitled **"The C Form: The Hole in the Neck"**.

## The checkpoint as built — 8 questions

The sketch survived intact: one question per lesson, the opener carrying two and the closer none of
its own (its material is folded into Q8, which the opener also feeds).

| # | Question id suffix | Kind | Draws on | Tests |
| - | ------------------ | ---- | -------- | ----- |
| 1 | `the-two-notes` | `choice` | Opener | The layer adds the `2` and the `b6`; the `b6` is the last of chapter 1's three that drop |
| 2 | `why-the-pentatonic-left-them` | `choice` | Opener | Each of the two is a semitone from a chord tone; everything the pentatonic keeps is two frets or more |
| 3 | `c-form-fret-eleven` | `choice` | C form | Fret 11 carries no note of the scale on any string |
| 4 | `a-form-open-strings` | `choice` | A form | The open `B` is the `2`, so all six open strings are in the scale |
| 5 | `g-form-three-flats` | `choice` | G form | Three `b3`s, three `b6`s and three `b7`s — nine of eighteen dots |
| 6 | `e-form-two-frets` | `fretboard` | E form | Mark `3·4` and `2·6`, the one note each on the neck's two sparsest frets, `frets: 8` |
| 7 | `d-form-every-string` | `choice` | D form | Six new dots, one on every string — the only window like that |
| 8 | `sitting-on-the-sixth` | `choice` | Closer + opener | The `b6` is a fret above the `5`, so it fights an `Am` if you hold it |

Distractors that encode a real belief rather than filler: Q1's "the `2` and the `6`" (a learner who
remembers "four notes are shared" but mis-numbers them); Q2's "they are the two hardest to reach",
which is the intuitive but wrong answer and is disproved by every window's diagram; Q5's "the only
window with eighteen dots", which is the chapter's most tempting false superlative; Q8's "it settles,
because the `b6` is what makes the chord minor", which is the exact claim chapter 1 gave to the `b3`.

---

## Errors found and corrected in the drafts

Both lesson agents reported their work verified and clean. Reading every article as written, and
machine-checking every position token, degree pairing and count against the tables above, found
**nine** real problems — **three of which originated in this plan** and were transcribed faithfully.

1. **`minor-caged-scale-c-form` — "Frets 9–10 now hold seven dots, frets 12–13 hold ten."** Both
   numbers wrong. Recounted: frets 9–10 hold **eight** (`6·10`, `5·10`, `4·9`, `4·10`, `3·9`, `3·10`,
   `2·10`, `1·10`) and frets 12–13 hold **nine**. 8 + 9 = 17, which is the window's total; 7 + 10 also
   sums to 17, which is exactly why it survived a re-read.
2. **`minor-caged-scale-a-form` — "five of the six strings still have their lowest dot at fret 0."**
   False at this layer, and the article contradicted itself two paragraphs earlier: `2·0` is the `2`,
   so **all six** strings now have their lowest dot at fret 0. That is the whole point of the lesson.
   Rewritten, and the contrast with the pentatonic layer (where string 2 had to be fretted) added.
3. **`minor-caged-scale-c-form` — "`3·10` is the only note of A natural minor at fret 10 on string
   3."** Trivially true of any position — a string carries at most one note per fret — so the sentence
   said nothing. Rewritten around what is actually true and load-bearing: `3·10` is a `b6`, and it is
   why fret 10 behaves differently from fret 5.
4. **`minor-caged-scale-d-form` — "the smallest of the five … never played whole."** False of the
   window: the D form's window is `6–10`, five frets, tied with the G, E and C forms; the A form's
   four-fret window is the narrowest. (It is also a claim chapter 2 already declined to make — its D
   form lesson says "Four strings is the whole shape, not a fragment of a bigger one.") Cut.
5. **`minor-caged-scale-d-form` — "three dots on every string with none of the gaps the other windows
   carry."** False: the G form also holds three on every string with every fret used, and the A and E
   forms also use every fret in their span. Only the C form has a gap. Cut.
6. **`minor-caged-scale-e-form` — "for the first time in this chapter they use all five frets."**
   False: the G form's dots already use all five of its frets, and the G form lesson comes first.
   Scoped to "for the first time in this window", which is the true and intended claim.
7. **`minor-caged-scale-g-form` — "the one that gains the least room at this one."** False: the G form
   gains five dots, the same as the C, A and E forms; only the D form differs, and it gains more.
   Rewritten to the true version — the string that put it ahead is the one with nothing left to add.
8. **`minor-caged-scale-e-form` — "the most compact window in the chapter"** used in the present
   tense of a chapter where its dots span all five frets. Scoped to "chapter 3's most compact window".
9. **`minor-caged-scale-d-form` — "the clearest one to feel, since all three sit a whole string apart
   from each other."** The three `2`→`b3` pairs are on strings 6, 4 and 1, which are two and three
   strings apart. Unfounded and wrong; cut.

**Three of the above came from this plan, not from the lesson agents.** Recorded so the next chapter
agent checks its own prose as hard as its tables:

- The closer's key point 3 said "two rules, not **thirty-four** dots". Summing each window's own
  Added list gives **26** (5 + 5 + 5 + 5 + 6). The lesson agent recomputed it and used 26, which is
  the behaviour the dispatch asked for and it worked.
- The C form entry told the lesson to write that `3·10` "is the only note of A natural minor at fret
  10 on string 3" — the empty claim in item 3 above. The agent transcribed it faithfully.
- The scope guards said "no chord is named except `Am`" while the D form entry's own key point 1 told
  the lesson to open on "the `Dm` shape at fret 7". The agent flagged the contradiction and followed
  the stricter rule. The guard was over-broad: chapter 2's D form lesson already writes "the `Dm`
  shape at fret 7" for the *shape*, which is fine; the guard should have banned chords **of the key**
  (`F`, `C`, `Dm` as `iv`, `Em`, `G`), not the shape names.

**Also corrected**: `readingTimeMin` on five of the seven articles, twice — once after each agent's
final revision pass. This is the fourth chapter running in which reading times were the most common
defect; it is worth a lesson-agent instruction to set it last, after the final edit.

**One fact discovered during review and added.** The C form's two clusters each hold **all seven
degrees** on their own — frets 9–10 carry eight dots covering every degree, frets 12–13 carry nine
doing the same. The draft had a vague, unverifiable sentence in that slot ("everything chapter 2 gave
you is still within a fret"); the verified fact is stronger and is the reason the hole at fret 11
costs nothing.

**Verification method.** A script re-derived all five windows from `cagedMarks`' own logic and then
checked each article at the span level: every `string·fret` token in the seven articles is a real
A-natural-minor dot inside the window the article is about, and every position/degree/note-name
triple in prose and tables is correct. Every sentence containing a number or a superlative was listed
and checked by hand against the recomputed tables — that pass is what caught items 1, 2, 4, 5, 6, 7
and 9, none of which a token check can see. Every activity round was checked for real scale notes,
board bounds and the duplicate-pitch rule against MIDI.

---

## Judgement calls recorded here

- **The `b6` got the chapter and the `2` got a real argument.** The brief warned the `2` could become
  filler. It is introduced as the note that *never dropped* — `1`, `2`, `4` and `5` are identical in A
  major and A minor — and as the one that fills the three-fret jump from `1` to `b3` so a line walks
  instead of leaping. The A form lesson gained a paragraph during review giving it its own physical
  demonstration (`2·0` open `B` into `2·1`, the `C`), so the lesson is not entirely about the `b6`.
- **The derivation replaced the assertion.** Rather than asserting that the pentatonic is "safe", the
  opener measures every degree against `1 b3 5` and shows that the minor pentatonic is *exactly* the
  notes that are not a semitone from a chord tone. That is verified arithmetic, it explains the whole
  chapter in one paragraph, and it is the best thing in the chapter.
- **`progression-player` was offered and not used.** The brief suggested it for making the `b6` clash
  audible. It cannot: it strums chord symbols and has no way to sound a single scale note against
  one, and the chords it would need (`F`, `Dm`) are chapter 5's. The honest instrument is the
  learner's own hands — hold the `Am` barre at fret 5, add `5·8`, let it fall to `5·7` — with `/drone`
  for a sustained root. Three lessons use that instruction.
- **The seams got one paragraph, not a table.** Chapters 2 and 3 both spent a closer on the overlaps.
  The only thing new here is that **one** seam is short a degree — frets `4–5`, missing the `b6` —
  which is a genuinely surprising fact that explains why the fret-5 box feels safe. That is worth a
  paragraph and nothing more.
- **The closer's centre is the relative payoff, not the low-E ladder.** `caged-fretboard`'s chapter 4
  closer used the completed low-E string and the all-six-string frets. Both facts are identical here
  by construction (A natural minor and C major are the same pitch collection), so re-running them
  would have been a transcription. The all-six frets survive in two sentences because chapter 3 made a
  claim about fret 5 that this layer falsifies and the chapter owed an answer; the low-E ladder was
  dropped entirely. In its place: every dot in this chapter is a dot on the C major neck the sibling
  pathway drew, and the two semitones — `B`→`C` and `E`→`F` — are the same two frets in both keys,
  with only the chord tone underneath them changing. That is the pathway's own argument, not the
  sibling's.
- **`caged-ladder` is used once, in the closer**, and framed as the *minimal map* rather than as a
  tiling diagram — the argument being that roots plus two one-fret rules regenerate all 87 dots.
  Chapter 3 used it for the tiling; this is a different claim from the same picture.
- **Two activities, five rounds each.** The first is the two new notes, window by window and then one
  per octave across the neck; the second is the chapter's arc line — the whole scale, one window at a
  time, in neck order. Two rounds had to drop a target for the duplicate-pitch rule: the G form's
  `2·1` (same pitch as `3·5`, `C4`) and the D form's `2·6` (same pitch as `3·10`, `F4` — and both are
  `b6`s). Both prompts say why rather than silently omitting a note.
- **No footnotes anywhere in the chapter**, as in chapters 1–3.

## Where the brief and the computation disagreed

**Nothing in the pathway brief was found to be wrong.** Two things it left open were settled by
computation, and one of its instructions earned its keep:

- The brief insisted on recomputing the dot counts rather than scaling the pentatonic table, and that
  was necessary. The window-edge effect is **loud again** at this layer after being quiet at the
  pentatonic one: four of the five windows differ by quality (only the E form is equal), and the A
  form's gap is **four dots** (13 in A major, 17 in A minor) where nothing at any earlier layer
  differed by more than two.
- The brief's structural expectation — that the counts would be uneven — held, but not in the shape
  the major pathway found. There, only one window came out even. Here **two** windows hold eighteen
  dots with three on every string (the G and D forms) and three hold seventeen. Every draft
  superlative built on "the only window with eighteen" or "the only one with three on every string"
  was false, and both were flagged in the dispatch for exactly that reason.
