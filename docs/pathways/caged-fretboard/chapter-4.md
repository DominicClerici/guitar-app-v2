# Chapter 4 — The Whole Major Scale

Chapter id `caged-fretboard.ch4` · slug `the-whole-major-scale` · 7 articles, 1 activity,
1 checkpoint.

After this chapter the learner can play C major anywhere on the neck and knows the role of every
note in the window — including the two the pentatonic left out, and **why they behave differently
from the rest**.

---

## Structure decision

**Seven lessons: an opener, five form lessons in strict C-A-G-E-D order, and a separate closer.**

Chapters 2 and 3 both folded the join-up into the D form lesson and both reported the same
casualty: the D form's own character got squeezed, and chapter 3's checkpoint ended up testing the
closer's material rather than the D form's. Chapter 1 used a separate closer and had no such
problem. The seventh lesson exists so that cannot happen again, and the load is split as:

- The **opener** carries the frame: what the two new notes are, why they are not more of the same,
  the half-step rule, the diagram convention, and the fact that the tidy twelve-dot count breaks.
- Each **form lesson** carries one verified property nothing else in the chapter can claim (table
  below). No form lesson carries chapter-level material.
- The **closer** carries the join-up: the summary table, the all-six-string frets, why fret 5 was
  the only one at the pentatonic layer, the completed low-E ladder, and the closing of chapter 1's
  promise.

---

## Verified facts this chapter is built on

Recomputed from the app's own `cagedMarks` / `CAGED_FORM_OFFSETS`
(`mobile/src/lib/guitar-positions/caged.ts`) and standard-tuning MIDI. **These are the numbers
every lesson must use.** String numbering is **1 = high e, 6 = low E** everywhere.
`1`=`C`, `2`=`D`, `3`=`E`, `4`=`F`, `5`=`G`, `6`=`A`, `7`=`B`.

### The correction to the chapter brief

The dispatch brief said each window other than the C form "has exactly one string carrying two."
**That is wrong for the A form, which has two such strings — 1 and 6.** The correct statement is:
the C form has none, the A form has two, and the G, E and D forms have one each. Every lesson uses
the correct version.

### The count, per window

| Form | Window | Scale dots | Dots per string, string 1 → string 6 | Short string(s) | Frets the dots use | Added at this layer |
| --- | --- | --- | --- | --- | --- | --- |
| C | `0–4` | **18** | `3 3 3 3 3 3` | none | 0, 1, 2, 3, 4 | **6** (three `4`s, three `7`s) |
| A | `2–6` | **16** | `2 3 3 3 3 2` | 1 and 6 | 2, 3, 4, 5, 6 | **4** (two `4`s, two `7`s) |
| G | `4–8` | 17 | `3 3 3 2 3 3` | 4 | 4, 5, 6, 7, 8 | 5 (two `4`s, three `7`s) |
| E | `7–11` | 17 | `3 2 3 3 3 3` | 2 | **7, 8, 9, 10** | 5 (two `4`s, three `7`s) |
| D | `9–13` | 17 | `3 3 3 3 2 3` | 5 | 9, 10, **12, 13** | 5 (three `4`s, two `7`s) |

**The asymmetry is this chapter's structural spine.** Chapter 3 found the pentatonic layer
perfectly regular — twelve dots, exactly two per string, in every one of the five windows. The
scale layer breaks that: 16 to 18 dots, and only the C form manages three on every string. The tidy
layer was the incomplete one.

### Every window, dot by dot

Written *string·fret* — degree (note). Use these tables unchanged.

**C form** — barre 0 (open), window `0–4`. Eighteen dots, three on every string.

| String | | | |
| --- | --- | --- | --- |
| 6 | `6·0` `3` (`E`) | `6·1` `4` (`F`) | `6·3` `5` (`G`) |
| 5 | `5·0` `6` (`A`) | `5·2` `7` (`B`) | `5·3` `1` (`C`) |
| 4 | `4·0` `2` (`D`) | `4·2` `3` (`E`) | `4·3` `4` (`F`) |
| 3 | `3·0` `5` (`G`) | `3·2` `6` (`A`) | `3·4` `7` (`B`) |
| 2 | `2·0` `7` (`B`) | `2·1` `1` (`C`) | `2·3` `2` (`D`) |
| 1 | `1·0` `3` (`E`) | `1·1` `4` (`F`) | `1·3` `5` (`G`) |

Added at this layer: `6·1` `4`, `5·2` `7`, `4·3` `4`, `3·4` `7`, `2·0` `7`, `1·1` `4`.

**A form** — barre 3, window `2–6`. Sixteen dots, the fewest.

| String | | | |
| --- | --- | --- | --- |
| 6 | `6·3` `5` (`G`) | `6·5` `6` (`A`) | — |
| 5 | `5·2` `7` (`B`) | `5·3` `1` (`C`) | `5·5` `2` (`D`) |
| 4 | `4·2` `3` (`E`) | `4·3` `4` (`F`) | `4·5` `5` (`G`) |
| 3 | `3·2` `6` (`A`) | `3·4` `7` (`B`) | `3·5` `1` (`C`) |
| 2 | `2·3` `2` (`D`) | `2·5` `3` (`E`) | `2·6` `4` (`F`) |
| 1 | `1·3` `5` (`G`) | `1·5` `6` (`A`) | — |

Added at this layer: `5·2` `7`, `4·3` `4`, `3·4` `7`, `2·6` `4`.

**G form** — barre 5, window `4–8`. Seventeen dots.

| String | | | |
| --- | --- | --- | --- |
| 6 | `6·5` `6` (`A`) | `6·7` `7` (`B`) | `6·8` `1` (`C`) |
| 5 | `5·5` `2` (`D`) | `5·7` `3` (`E`) | `5·8` `4` (`F`) |
| 4 | `4·5` `5` (`G`) | `4·7` `6` (`A`) | — |
| 3 | `3·4` `7` (`B`) | `3·5` `1` (`C`) | `3·7` `2` (`D`) |
| 2 | `2·5` `3` (`E`) | `2·6` `4` (`F`) | `2·8` `5` (`G`) |
| 1 | `1·5` `6` (`A`) | `1·7` `7` (`B`) | `1·8` `1` (`C`) |

Added at this layer: `6·7` `7`, `5·8` `4`, `3·4` `7`, `2·6` `4`, `1·7` `7`.

**E form** — barre 8, window `7–11`. Seventeen dots, all inside frets `7–10`.

| String | | | |
| --- | --- | --- | --- |
| 6 | `6·7` `7` (`B`) | `6·8` `1` (`C`) | `6·10` `2` (`D`) |
| 5 | `5·7` `3` (`E`) | `5·8` `4` (`F`) | `5·10` `5` (`G`) |
| 4 | `4·7` `6` (`A`) | `4·9` `7` (`B`) | `4·10` `1` (`C`) |
| 3 | `3·7` `2` (`D`) | `3·9` `3` (`E`) | `3·10` `4` (`F`) |
| 2 | `2·8` `5` (`G`) | `2·10` `6` (`A`) | — |
| 1 | `1·7` `7` (`B`) | `1·8` `1` (`C`) | `1·10` `2` (`D`) |

Added at this layer: `6·7` `7`, `5·8` `4`, `4·9` `7`, `3·10` `4`, `1·7` `7`.

**D form** — barre 10, window `9–13`. Seventeen dots at frets 9, 10, 12 and 13. **Nothing at
fret 11.**

| String | | | |
| --- | --- | --- | --- |
| 6 | `6·10` `2` (`D`) | `6·12` `3` (`E`) | `6·13` `4` (`F`) |
| 5 | `5·10` `5` (`G`) | `5·12` `6` (`A`) | — |
| 4 | `4·9` `7` (`B`) | `4·10` `1` (`C`) | `4·12` `2` (`D`) |
| 3 | `3·9` `3` (`E`) | `3·10` `4` (`F`) | `3·12` `5` (`G`) |
| 2 | `2·10` `6` (`A`) | `2·12` `7` (`B`) | `2·13` `1` (`C`) |
| 1 | `1·10` `2` (`D`) | `1·12` `3` (`E`) | `1·13` `4` (`F`) |

Added at this layer: `6·13` `4`, `5·12` `7`, `4·9` `7`, `3·10` `4`, `1·13` `4`.

### The half-step rule — the chapter's single best geometric fact

Verified in **all five windows, with no exception**:

- **Every `3` has a `4` one fret above it, on the same string, inside the window.**
- **Every `1` has a `7` one fret below it, on the same string, inside the window.**

That is what "these two lean" means on a fretboard. It is also how a learner finds them without
memorising anything new: the chord tones were already known, and the two new notes are their
immediate neighbours.

One honest exception in the other direction: the C form holds a `7` at `3·4` whose root, `3·5`,
sits one fret past the window's edge (it belongs to the A form). Every root still has its `7`; not
every `7` has its root. Only the C form lesson may mention this.

### What chapter 3 promised, and how much of it is true

Chapter 3's closing callout said "the two three-fret steps in every window you've just learned are
where those two notes will land." **That is true and it is the reason each window's shape changes
the way it does** — a pentatonic `3`→`5` gap of three frets gets the `4` in the middle, and a
`6`→`1` gap of three frets gets the `7`. But it is not the whole story: new dots also appear at the
window's *edges*, outside the existing pair, and that is exactly where the counts stop being equal.

| Form | Pentatonic three-fret strings (ch3) | New dots filling those gaps | New dots at the window edges | Total added |
| --- | --- | --- | --- | --- |
| C | 6, 5, 1 | `6·1`, `5·2`, `1·1` | `2·0`, `3·4`, `4·3` | 6 |
| A | 4, 3 | `4·3`, `3·4` | `5·2`, `2·6` | 4 |
| G | 6, 2, 1 | `6·7`, `2·6`, `1·7` | `3·4`, `5·8` | 5 |
| E | 5, 4 | `5·8`, `4·9` | `6·7`, `3·10`, `1·7` | 5 |
| D | 3, 2 | `3·10`, `2·12` | `6·13`, `4·9`, `1·13` | 5 |

The opener states this. No form lesson re-argues it.

### The frets where all six strings are scale notes

Exhaustively checked over frets 0–15:

| Fret | Six strings, low → high | Degrees |
| --- | --- | --- |
| 0 | `E A D G B E` | `3 6 2 5 7 3` |
| 5 | `A D G C E A` | `6 2 5 1 3 6` |
| 10 | `D G C F A D` | `2 5 1 4 6 2` |
| 12 | `E A D G B E` | `3 6 2 5 7 3` |

**Fret 5 is still the only all-six fret for the pentatonic** (chapter 3's fact, re-verified).
The reason is now visible and it is the sharpest sentence available to this chapter: **fret 0 and
fret 12 contain a `7` (the `B` on string 2), and fret 10 contains a `4` (`3·10`, the `F` on string
3). Fret 5 is the one whose six notes dodge both of the new notes.**

Why 0, 5 and 10: standard tuning is a stack of fourths with the one major third at `G → B`
(chapter 1), so moving up five frets shifts every string one step along that stack and lands the
whole set inside the scale again. Fret 15 breaks it (`G C F A# D G`). The closer owns this.

### Fret 11 — the empty fret

**No string carries a note of C major at fret 11.** It is the only such fret in frets 0–15. This is
why the E form's seventeen dots fit inside four frets (7–10) and why the D form's seventeen sit at
9, 10, 12 and 13 with a two-fret hole through the middle of the window.

Fret density across the neck, for reference: fret 0 → 6, fret 1 → 3, fret 2 → 3, fret 3 → 5,
**fret 4 → 1** (`3·4` only), fret 5 → 6, **fret 6 → 1** (`2·6` only), fret 7 → 5, fret 8 → 4,
fret 9 → 2, fret 10 → 6, **fret 11 → 0**, fret 12 → 6, fret 13 → 3.

Frets 4 and 6 are the neck's two sparsest non-empty frets, each carrying exactly one scale note,
and **both sit inside the A form's window — and the only note on each is one this chapter adds.**
The A form lesson owns that.

### Spans — how much each window is stretched

| Form | Pentatonic dots span (ch3) | Scale dots span | Change |
| --- | --- | --- | --- |
| C | `0–3` (4 frets, open position) | `0–4` (5, open position) | +1 at the top |
| A | `2–5` (4 frets) | `2–6` (5 frets) | +1 at the top *and* the shape now uses all five frets |
| G | `5–8` (4 frets) | `4–8` (5 frets) | +1 at the bottom |
| E | `7–10` (4 frets) | `7–10` (**4 frets**) | unchanged |
| D | `9–13` (5 frets) | `9–13` (5 frets, hole at 11) | unchanged |

**The E form is the only window whose scale dots sit inside four consecutive frets**, and unlike
the C form it does not need the nut to do it. That is verified and it is the E form's own property.

⚠️ Chapter 3 called the D form "the widest of the five" *as a pentatonic window*, which was true
there. **At this layer three windows span five frets, so the D form is no longer uniquely widest.**
No lesson may repeat that superlative.

### The low E string, completed

| Fret | 0 | 1 | 3 | 5 | 7 | 8 | 10 | 12 | 13 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Degree | `3` | `4` | `5` | `6` | `7` | `1` | `2` | `3` | `4` |

Chapter 3 found that `0 3 5 8 10` — the pentatonic on this string — are exactly the five forms'
barre frets. The scale adds **frets 1 and 7**, and those are the only two frets on the low E string
in the first twelve that are *not* one of the five barre frets. The closer owns this.

### Overlaps

Every overlap between neighbouring windows now holds **all seven degrees, with at least one dot on
every string**. Verified:

| Overlap | Frets | Dots |
| --- | --- | --- |
| C ∩ A | `2–4` | `6·3`=`5`, `5·3`=`1`, `5·2`=`7`, `4·2`=`3`, `4·3`=`4`, `3·2`=`6`, `3·4`=`7`, `2·3`=`2`, `1·3`=`5` |
| A ∩ G | `4–6` | `6·5`=`6`, `5·5`=`2`, `5·6`=`4`, `4·4`=`7`, `4·5`=`1`, `3·5`=`5`, `2·5`=`3`, `1·5`=`6` |
| G ∩ E | `7–8` | `6·7`=`7`, `6·8`=`1`, `5·7`=`3`, `5·8`=`4`, `4·7`=`6`, `3·7`=`2`, `2·7`=`3`… |

**Do not use this table.** Chapter 2 and chapter 3 both spent their closers on the overlaps, and a
third pass adds nothing new — the answer is "yes, all seven, everywhere", which is exactly what you
would expect once every window holds every degree. The closer states that in one sentence without a
table and spends its space on the all-six frets and the low-E ladder instead. (The row above is
recorded only so a later chapter agent does not have to recompute it; chapter 5 owns the overlaps.)

### Pitch duplication

Every window's dots are pitch-distinct **except the C form**, where `2·0` and `3·4` are both `B3`
(MIDI 59). This is the only duplicate in the chapter and it constrains the activity.

### Scope guards

- **No three-notes-per-string.** Adding two notes per octave does put three notes on most strings
  and a learner may notice. The opener may acknowledge in **one clause** that
  [`/scale-visualizer`](screen link) offers a `3/str` position system as a different way of carving
  the neck. Nothing else in the chapter mentions it, and nothing teaches it.
- **No modes.** The word must not appear anywhere.
- **No seventh chords or extensions.** The degree `7` is a scale note, not a chord. No lesson may
  say the `7` "makes it a major seventh", or name any four-note chord, or use `sus`.
- **No minor.** The G form lesson may spend at most two sentences acknowledging chapter 3's
  relative-minor point still stands with two more notes in the box. No `b3`, no `b7`, no minor
  forms.
- **No jargon labels for the new notes.** Do not call them "avoid notes", "tension notes" or
  "passing tones". Say what they do: they sit a fret from a chord tone and lean on it.
- **Chapter 5's territory, untouched**: moving between adjacent forms, playing horizontally,
  running a progression up the neck, transposing out of C. One clause naming that the next chapter
  does it is allowed in the closer and nowhere else.
- **Everything is in C major.**

### Superlatives already spent by earlier chapters

Every claim below is already made, in print, by an earlier lesson. **No lesson in this chapter may
contradict one or re-award it to a different form.** Where this chapter needs a superlative it must
be scoped to this layer ("of the five windows at this layer", "as a scale window").

| Claim | Owner |
| --- | --- |
| "the widest of the five" / hardest to hold whole | G form (as a chord, chapter 2) |
| "the most-used barre on the instrument" / the shape you navigate from | E form (chapters 1–2) |
| "the friendliest of the five" | A form (chapter 1) |
| "the smallest of the five" | D form (chapters 1–2) |
| the only form whose top note is the `3` | D form (chapter 2) |
| the only `3` in the shape (`3·9`) | E form's grip (chapter 2) |
| the one major third in standard tuning (`G → B`) | chapter 1 |
| the two full barres are A and E | chapter 2 |
| the most chord-toned pentatonic window | C form (chapter 3) |
| the tidiest / most regular pentatonic window | A form (chapter 3) |
| the box everyone already owns | G form (chapter 3) |
| three places to land without a shift | E form (chapter 3) |
| the widest **pentatonic** window | D form (chapter 3) — **layer-scoped, do not carry forward** |

### The "no new shapes" promise — phrasing

Chapter 1's closer and chapter 2's closer both said, near-verbatim, "the windows don't change; only
how much of each one is lit." A third repetition of that sentence would read as filler. This
chapter **closes** the promise rather than renewing it: the opener says it runs out here, and the
closer says it is now paid. Use different words.

---

## The lessons

Seven articles, in order. Section ids are progress keys: never renamed.

Every article: `schemaVersion: 1`, `publishedAt: "2026-08-11"`, `tags: ["caged", "fretboard"]`,
`readingTimeMin` = ceil(words ÷ 200) with a floor of 2. `meta.slug` equals the filename stem. The
title is `meta.title` and **no article opens with a heading block**.

Every form lesson uses `live` · `caged-shape` ·
`{ "root": "C", "form": "<letter>", "show": "scale", "caption": "…" }` — the same `root` + `form`
chapters 1, 2 and 3 drew at `show: "roots"`, `"triad"` and `"pentatonic"`. **Each form lesson must
say explicitly that this is the last layer: the window is now complete, and the shape count has not
changed since chapter 1.** That is the promise chapter 1 made and this chapter closes it.

Positions use the compact `5·3` shorthand (string, then fret, `code` mark), defined in chapter 1's
closer. **The C form lesson — the first heavy user in this chapter — restates what it means in one
clause**, exactly as chapter 3's C form lesson did.

---

### 1. `caged-fourths-and-sevenths` — "The Two Notes That Lean"

- **Section id**: `caged-fretboard.ch4.fourths-and-sevenths` ·
  **Article id**: `art_caged-fourths-and-sevenths`
- **Length**: 700–850 words. The longest of the seven; it carries the frame.
- **Left by chapter 3**: `1 2 3 5 6` in every window; twelve dots, two per string, everywhere;
  fret 5 the only all-six pentatonic fret; barre frets `0 3 5 8 10` are the low-E pentatonic; the
  G form window *is* minor-pentatonic box 1; landing on chord tones versus running the box; and an
  explicit promise that chapter 4 puts the last two notes into the same five windows.
- **The one thing it teaches**: the `4` and the `7` complete the scale, and they are not more of
  the same — each sits one fret from a chord tone, which is both why the pentatonic omits them and
  how you find them.
- **The misconception it corrects**: "the last two notes are just two more dots" / "every note in
  the scale is equally safe once you know the shape."

**Key points, in order**

1. Cash chapter 3's promise in the first paragraph. Same five windows, last two notes, no new
   shapes — and after this there is no further layer, so **this is the moment the promise chapter 1
   made runs out**: the learner has learned five shapes and will not be asked for a sixth.
2. The major scale is `1 2 3 4 5 6 7`. In C: `C D E F G A B`. The pentatonic had `1 2 3 5 6`; this
   adds the `4` and the `7` — `F` and `B`.
3. **The spine, stated hard and early.** Every note added so far sat a whole step or more from its
   neighbours. These two do not. The `4` is a semitone above the `3`; the `7` is a semitone below
   the `1`. On a guitar a semitone is one fret, so: **every `3` has a `4` one fret above it on the
   same string, and every `1` has a `7` one fret below it.** True in every window, no exceptions.
   Give it a `callout` (`tip`).
4. **What that means musically**, in plain words and no jargon. Over a C chord, the `4` sits a fret
   above the `3` that the chord is built on and grates against it; the `7` sits a fret under the
   root and pulls upward into it. They are the notes that turn a safe box into a scale with tension
   in it. Chapter 3 taught landing on chord tones; the complement is knowing that the notes you do
   not land on are not all alike — the `2` and the `6` are safe colour you can sit on, the `4` and
   the `7` are notes to place deliberately and move on from.
5. **The count breaks.** Chapter 3's discovery was that every window came out to exactly twelve
   dots, two per string, with no exceptions. That regularity does not survive. Give the count table
   (form · window · dots · dots per string · short strings). 16 to 18; **only the C form has three
   on every string; the A form has two strings carrying only two; the G, E and D forms have one
   each.** Say the conclusion out loud: the tidy layer was the one that was missing something.
6. **Why the counts differ**, using the three-fret-gap table. Chapter 3 said the two new notes
   would land in each window's three-fret steps and that is exactly what happens — but new dots
   also turn up at the window edges, and the number of those is what varies.
7. **The diagram convention, restated for a learner arriving cold.** `caged-shape` draws every note
   of the layer inside the window, not one playable grip. At the triad layer that meant more dots
   than a hand could hold; at the pentatonic layer it was roughly a hand's worth; at this layer it
   is 16 to 18 dots, and that is the whole window and the whole scale in it. One clause may note
   that [`/scale-visualizer`](screen link) also offers a `3/str` position system, which carves the
   neck a different way and is not what this pathway teaches. **One clause. Nothing more.**
8. The `live` block: `caged-shape` `{ "root": "C", "form": "A", "show": "scale" }`, tied explicitly
   back to [`caged-pentatonic-a-form`](article link) — the same window, the same twelve dots, four
   new ones. The A form is chosen because it gains the fewest, so "the same window plus a handful"
   is easiest to see there.
9. Close on the C form, the one window that comes out even.

**Blocks / components**

- `live` · `caged-shape` · `{ "root": "C", "form": "A", "show": "scale", "caption": "…" }`.
- `table` — the seven degrees, their notes in C, whether each is in the chord, and whether it was
  in the pentatonic. Keep cells to a word.
- `table` — the count per window (form · window · dots · short strings).
- One `callout` (`tip`) for the half-step rule.
- Article links to `caged-pentatonic-a-form` and `caged-scale-c-form`; screen link to
  `/scale-visualizer`.

**Do not**: teach any form's dot positions (each form lesson owns its own); teach three-notes-per-
string; name a chord other than `C`; use the words "mode", "avoid note", "tension note", "passing
tone", "leading tone" (that term is introduced by the G form lesson, not here); transpose.

---

### 2. `caged-scale-c-form` — "The C Form: Three on Every String"

- **Section id**: `caged-fretboard.ch4.scale-c-form` · **Article id**: `art_caged-scale-c-form`
- **Length**: 550–700 words
- **Left by the opener**: the scale is `1 2 3 4 5 6 7`; the `4` is a fret above every `3` and the
  `7` a fret below every `1`; the twelve-dot regularity is gone; the diagram draws the whole window.
- **The one thing it teaches**: the C form window is the only one that comes out even — eighteen
  dots, three on every string — and it is the window where all six open strings are in the scale,
  including the one chapter 3 had to leave out.
- **The misconception it corrects**: "open position is a beginner's special case, not a real scale
  position."

**Key points, in order**

1. Restate the shorthand in one clause: `5·3` means string 5, fret 3. Then the window: barre `0`,
   frets `0–4`, dots on all five of them.
2. **Eighteen dots — the most of any window — and three on every single string. The only one of the
   five that comes out even.** Give the eighteen-dot table.
3. **The open strings, and chapter 3's loose end.** Chapter 3's C form lesson had to tell the
   learner to leave string 2 out, because the open `B` is not in the C major pentatonic. It is in
   the scale — it is the `7`. **All six open strings are notes of C major.** Be precise: six
   strings, five different degrees — `3 6 2 5 7 3` from low to high — so the `1` and the `4` are
   the two the open strings do not give you. Fret 0 is one of only four frets in the first twelve
   where every string is a scale note; the closer says why.
4. **The half-step rule at the nut, where it is easiest to feel.** The open `B` on `2·0` is the `7`
   and `2·1` is the `1` — leading tone and root, an open string and one finger. The same pair sits
   on string 5 at `5·2` and `5·3`. Tell the learner to play them: the `7` sounds unfinished until
   the `1` arrives.
5. **What is new since chapter 3**: six dots — `6·1` `4`, `5·2` `7`, `4·3` `4`, `3·4` `7`,
   `2·0` `7`, `1·1` `4`. Three `4`s and three `7`s, more than any other window gains. Chapter 3
   called this the most chord-toned window of the five; it is also the one the two new notes change
   most.
6. **The honest oddity, in a clause or two.** One of the three `7`s, `3·4`, has no root above it
   here — `3·5` is a fret past the window's edge and belongs to the A form. Every root in this
   window has its `7`; not every `7` has its root. That single dot is the seam into the next
   window.
7. The `live` block, tied to the same window's earlier layers: chapter 1 lit two roots here,
   chapter 2 lit eight chord tones, chapter 3 lit twelve, this lights eighteen. **Same window every
   time, and this is the last layer — the window is now complete.**
8. Close on the A form, the window that gains the least and stretches the most.

**Blocks / components**

- `live` · `caged-shape` · `{ "root": "C", "form": "C", "show": "scale", "caption": "…" }`.
- `table` — the eighteen dots, string by string, three columns of dots.
- One `callout` (`tip`): play `2·0` then `2·1` — the `7` and the `1`, open string then first finger.
- Article links to `caged-pentatonic-c-form` and `caged-scale-a-form`; screen link to
  `/scale-visualizer`.

**Do not**: claim the open strings give you a C chord (they do not — no `1` and no `4` among them);
claim any six-string strum sounds like C major.

---

### 3. `caged-scale-a-form` — "The A Form: Four Dots, Two Frets Wider"

- **Section id**: `caged-fretboard.ch4.scale-a-form` · **Article id**: `art_caged-scale-a-form`
- **Length**: 550–700 words
- **Left by the C form**: eighteen dots, three per string, every open string in the scale, the
  half-step pairs at the nut.
- **The one thing it teaches**: the A form gains fewer notes than any other window — four — and
  still loses its tidiness completely, because the four it gains land on the window's outer frets.
- **The misconception it corrects**: "the fewer notes a shape adds, the less it changes."

**Key points, in order**

1. The A form of `C`: barre `3`, window frets `2–6`. **Sixteen dots, the fewest of the five, and
   only four of them new — also the fewest.** Give the sixteen-dot table.
2. **The reversal, which is this lesson's centre.** Chapter 3 called this window the tidiest and
   most regular on the neck: twelve dots inside three frets — 2, 3 and 5 — with nothing at fret 4
   or fret 6 at all. Two of the four new dots land on exactly those empty frets: the `7` at `3·4`
   and the `4` at `2·6`. The `7` at `5·2` sits at the window's bottom fret. **The tidiest window
   becomes a full five-fret stretch — every fret from 2 to 6 now carries something.** Four dots, and
   the shape is two frets wider than it was.
3. **The neck's two sparsest frets are both in here.** Fret 4 carries exactly one note of C major on
   the whole neck (`3·4`), and fret 6 carries exactly one (`2·6`). They are the only two frets like
   that, they both sit inside this window, and **the single note on each is one this chapter adds.**
   Say that it was checked across the whole neck, not assumed.
4. **Strings 1 and 6 gain nothing.** Both carry exactly two dots — the `5` at fret 3 and the `6` at
   fret 5 — identical content in identical places, and they are the only strings in any window this
   chapter leaves alone. Chapter 1's fact (strings 6 and 1 hold the same note two octaves apart at
   the same fret) showing up as two strings that read the same all the way down.
5. **Where the new notes sit relative to what was there**: `4·3` `4` is one fret above `4·2` `3`;
   `2·6` `4` is one fret above `2·5` `3`; `5·2` `7` is one fret below `5·3` `1`; `3·4` `7` is one
   fret below `3·5` `1`. The opener's rule, landing in a real window for the first time — two `3`s
   and two roots, four neighbours.
6. Chapter 3's fret-5 fact is untouched: one finger across fret 5 still catches six notes of the
   scale. What has changed is that fret 5 is no longer alone; the closer says how.
7. The `live` block, and the continuity line: same window, fourth and final layer, window complete.
8. Close on the G form.

**Blocks / components**

- `live` · `caged-shape` · `{ "root": "C", "form": "A", "show": "scale", "caption": "…" }`.
- `table` — the sixteen dots, string by string.
- One `callout` (`info`): fewest new notes, biggest stretch — four dots move the window from three
  frets to five.
- Article links to `caged-pentatonic-a-form` and `caged-scale-g-form`; screen link to
  `/scale-visualizer`.

**Do not**: repeat the opener's diagram commentary; claim this is the tidiest or widest window at
this layer (it is neither).

---

### 4. `caged-scale-g-form` — "The G Form: A Fret Below Every Root"

- **Section id**: `caged-fretboard.ch4.scale-g-form` · **Article id**: `art_caged-scale-g-form`
- **Length**: 550–700 words
- **Left by the A form**: four dots can change a window completely; the `4` sits above a `3` and the
  `7` below a `1`, in real positions.
- **The one thing it teaches**: this window's three roots each have their `7` sitting one fret
  below on the same string, and playing that pair is the clearest demonstration in the chapter of
  what "leaning" actually sounds like.
- **The misconception it corrects**: "the notes outside the chord are all just colour."

**Key points, in order**

1. The G form of `C`: barre `5`, window frets `4–8`, seventeen dots. String 4 is the only string
   here carrying two (`4·5` `5` and `4·7` `6`); every other string has three. Give the table.
2. **Three roots** — `6·8`, `3·5`, `1·8` — the same three chapter 1 gave this form, unchanged three
   chapters later. **And three `7`s: `6·7`, `3·4`, `1·7` — one directly beneath each root.**
3. **The demonstration.** Play `6·7` then `6·8`. The first note sounds unfinished; the second
   arrives. That is the whole job of the `7`: it is a semitone under home and it leans on it. This
   is the one place in the chapter to name the term **leading tone**, in plain words, and then keep
   using `7`.
4. **On the two outside strings it happens twice, identically.** `6·7` → `6·8` on the low E and
   `1·7` → `1·8` on the high e — same frets, two octaves apart, because chapter 1's twin fact still
   holds. The third pair, `3·4` → `3·5`, sits below the barre.
5. **The other new note is the one that grates.** The `4`s here are `2·6` and `5·8`, each a fret
   above a `3` (`2·5` and `5·7`). Play `5·7` then `5·8` against a `C` from [`/drone`](screen link):
   the `3` settles and the `4` a fret above it does not. Same one-fret distance as the `7` and the
   root, opposite feeling — one leans up into home, the other leans on a note that is already
   there.
6. **Chapter 3's box, briefly.** Chapter 3 showed this window is, position for position, the box
   most guitarists own as the minor pentatonic, and that the note you resolve to decides what it
   sounds like. Two more notes per octave do not change that: the roots are still `6·8`, `3·5` and
   `1·8`, and now each of them has a note a fret below it that points straight at it. **Two
   sentences maximum. No minor degrees, no minor forms.**
7. **What is new since chapter 3**: `6·7` `7`, `1·7` `7`, `3·4` `7`, `5·8` `4`, `2·6` `4`.
8. The `live` block and the continuity line — window complete, last layer.
9. Close on the E form.

**Blocks / components**

- `live` · `caged-shape` · `{ "root": "C", "form": "G", "show": "scale", "caption": "…" }`.
- `table` — the seventeen dots, string by string.
- One `callout` (`tip`): three roots, three `7`s, one fret below each — `6·7`→`6·8`, `3·4`→`3·5`,
  `1·7`→`1·8`.
- Screen links to `/drone` and `/scale-visualizer`; article links to `caged-pentatonic-g-form` and
  `caged-scale-e-form`.

**Do not**: teach minor beyond the two sentences allowed; use `b3` or `b7`; call the `4` a
"suspension" or name any chord other than `C`.

---

### 5. `caged-scale-e-form` — "The E Form: Seventeen Notes, Four Frets"

- **Section id**: `caged-fretboard.ch4.scale-e-form` · **Article id**: `art_caged-scale-e-form`
- **Length**: 550–700 words
- **Left by the G form**: what the `7` does and what the `4` does; the leading tone under every root.
- **The one thing it teaches**: the E form is the only window whose whole scale fits inside four
  consecutive frets, which makes it the one window where the complete scale is genuinely one hand
  position.
- **The misconception it corrects**: "a complete scale always needs more room than a pentatonic
  box."

**Key points, in order**

1. The E form of `C`: barre `8`, window drawn `7–11` — **but every one of its seventeen dots lives
   in frets 7 to 10. Fret 11 is empty.** Give the table.
2. **Why, and it is a bigger fact than it looks.** Fret 11 carries no note of C major on any string
   at all — the only fret in the first twelve where that is true. Chapter 3 already noticed the
   pentatonic left fret 11 empty here; now that all seven notes are in play, the emptiness is not a
   gap in a five-note scale but a genuine hole in the neck. State that it was checked string by
   string.
3. **The consequence.** Seventeen notes, four frets, one hand, nothing to shift for. **No other
   window manages that**, and the C form only gets close because the nut plays two of its frets for
   free. If a learner is going to over-learn one window as a scale, this is it — and it is the same
   window chapter 2 called the most-used barre on the instrument and chapter 1 called the shape you
   navigate from.
4. **Three roots** — `6·8`, `4·10`, `1·8`, chapter 1's `6 → 4 → 1` map — each with its `7` one fret
   below on the same string (`6·7`, `4·9`, `1·7`). Chapter 3 called this the window with three
   places to land; every one of those landing spots now has the note that leans into it directly
   beneath it. One paragraph, not a repeat of the G form's demonstration.
5. **The `4`s here are `5·8` and `3·10`**, one fret above the `3`s at `5·7` and `3·9`. Note in a
   clause that `5·8` sits at the barre fret, right under the low root at `6·8` — the two notes a
   fret apart in feel, a string apart in the hand.
6. **The short string is string 2**, carrying only `2·8` `5` and `2·10` `6` — the B string a dot
   short, for the third layer running. Chapter 1 named the cause.
7. Practical close: [`/drone`](screen link) on `C`, run frets 7 to 10 without moving the hand, and
   end on `6·8`, `4·10` or `1·8`. Notice that `6·7` and `1·7` want to move up one fret and that
   `5·8` and `3·10` want to move somewhere too.
8. Close on the D form.

**Blocks / components**

- `live` · `caged-shape` · `{ "root": "C", "form": "E", "show": "scale", "caption": "…" }`.
- `table` — the seventeen dots, string by string.
- One `callout` (`info`): seventeen notes, four frets, no shift — fret 11 has nothing on it.
- Screen links to `/drone` and `/scale-visualizer`; article links to `caged-pentatonic-e-form` and
  `caged-scale-d-form`.

**Do not**: claim the C form does not also fit a hand (it does, using open strings); claim this is
the window with the most notes (it is not — the C form has 18).

---

### 6. `caged-scale-d-form` — "The D Form: The Fret With Nothing On It"

- **Section id**: `caged-fretboard.ch4.scale-d-form` · **Article id**: `art_caged-scale-d-form`
- **Length**: 550–700 words. **This is a form lesson only.** The chapter's join-up is a separate
  article and this lesson must not start it.
- **Left by the E form**: fret 11 is empty; the E form fits four frets; every root has its `7`
  beneath it.
- **The one thing it teaches**: the D form is the window with the empty fret in its *middle* rather
  than at its edge, and with three `4`s and only two roots it is the window that asks for the most
  planning.
- **The misconception it corrects**: "if I can't hold a window in one position, I'm doing it wrong."

**Key points, in order**

1. The D form of `C`: barre `10`, window frets `9–13`, seventeen dots — at frets 9, 10, 12 and 13.
   Give the table.
2. **The hole.** The E form met fret 11 at the top edge of its window, where an empty fret costs
   nothing. Here it lands in the middle: two frets of dots, a dead fret, then two more frets of
   dots. That is why this window does not settle under one hand, and it is the shape's doing, not
   the learner's. Say that plainly — chapter 3 said the same thing about the pentatonic version and
   the reason is now visible rather than asserted.
3. **What has changed since chapter 3, honestly.** Chapter 3 called this the widest window of the
   five. At this layer three of the five span five frets, so it is no longer the widest — it is the
   only one with a gap through the middle. **Do not repeat the old superlative.**
4. **Three `4`s, two roots.** The `4`s are `6·13`, `3·10` and `1·13`; the roots are `4·10` and
   `2·13`, which chapter 3 already flagged as sitting at awkward edges. This window holds more of
   the note that leans hardest over a C chord and fewer places to put a phrase down than it is
   comfortable with. State the practical consequence: run this window carelessly and it sounds
   restless; the two roots are worth knowing cold before you play in it.
5. **The half-step pairs here**: `3·9` `3` → `3·10` `4`, `6·12` `3` → `6·13` `4`, `1·12` `3` →
   `1·13` `4`, and `4·9` `7` → `4·10` `1`, `2·12` `7` → `2·13` `1`. Five one-fret pairs, the most of
   any window — which is the same fact as "three `4`s and two `7`s" seen from the hand.
6. **Fret 10 runs under all six strings** and every one of them is a scale note: `2 5 1 4 6 2`. One
   of those six is the `4` at `3·10`. Chapter 3 gave the learner one fret like this — fret 5 — and
   said it was the only one; there are more now, and the closer says exactly why fret 5 was alone.
   **One short paragraph; hand the argument on rather than making it.**
7. **What is new since chapter 3**: `6·13` `4`, `3·10` `4`, `1·13` `4`, `4·9` `7`, `2·12` `7`.
   String 5 is this window's short string, with only `5·10` `5` and `5·12` `6`.
8. The `live` block and the continuity line: chapter 1 lit two roots here, chapter 2 seven chord
   tones, chapter 3 twelve, this seventeen. Window complete, and that is the fifth and last window
   completed.
9. Close by handing over to the closer article, which puts the five back together.

**Blocks / components**

- `live` · `caged-shape` · `{ "root": "C", "form": "D", "show": "scale", "caption": "…" }`.
- `table` — the seventeen dots, string by string.
- One `callout` (`warning`): fret 11 is empty, so this window does not fall under one hand — that
  is the shape, not your reach.
- Article links to `caged-pentatonic-d-form` and `caged-the-complete-window`; screen link to
  `/scale-visualizer`.

**Do not**: start the join-up; give the five-form summary table; explain the all-six-string frets;
teach the low-E ladder; use `caged-ladder`; repeat "the widest of the five".

---

### 7. `caged-the-complete-window` — "Every Note in the Window"

- **Section id**: `caged-fretboard.ch4.complete-window` ·
  **Article id**: `art_caged-the-complete-window`
- **Length**: 700–850 words
- **Left by the D form**: all five windows complete; fret 11 is empty; fret 10 holds all six strings
  and one of them is a `4`.
- **The one thing it teaches**: the five windows now hold the whole scale between them, the layer
  is finished, and everything in it can be regenerated from the roots plus one rule.
- **The misconception it corrects**: "I now have five seventeen-dot pictures to memorise."

**Key points, in order**

1. Open on the arrival: five windows, seven degrees in each, nothing left to add. **The promise
   chapter 1 made is now closed** — five shapes, learned once, filled in four times, and the learner
   was never handed a sixth.
2. **The summary table**, this chapter's one-page artefact: *Form* · *Window* · *Dots* · *Frets the
   dots use* · *String carrying only two*. Use the verified numbers unchanged.
3. **The asymmetry, as the chapter's conclusion.** Chapter 3's twelve-dots-two-per-string was the
   tidiest fact in the pathway and it did not survive. Say what that is worth knowing: the regular
   layer was the incomplete one, and a box that is easy to memorise is a box that is missing
   something. This chapter's windows are lumpy because they are complete.
4. **You do not memorise seventeen dots.** You already know the roots (chapter 1) and the chord
   tones (chapter 2). The rule does the rest: **a `4` is one fret above every `3`; a `7` is one
   fret below every `1`.** Add the `2` and the `6` from chapter 3 and there is nothing left to
   learn. Give this its own short section — it is the answer to the misconception.
5. **The `live` block: `caged-ladder` `{ "root": "C" }`.** Frame it exactly as point 4 does — it
   marks roots only, and that is now enough, because from a root you have a `7` one fret down, a
   `1 3 5` around it, and a whole scale after that. The minimal map, and the same picture chapter 1
   ended on.
6. **The all-six-string frets.** Chapter 3 found fret 5 was the only fret where every string sounds
   a pentatonic note. With the whole scale there are four: 0, 5, 10 and 12 — and 12 is 0 again, so
   really three, five frets apart. Give the small table (fret · notes low → high · degrees).
   **Then the sharp bit**: fret 0 and fret 12 hold a `7` (the open `B` on string 2) and fret 10
   holds a `4` (`3·10`). Fret 5 is the one whose six notes dodge both of the new notes, which is
   exactly why it was alone before.
7. **Why 0, 5 and 10 and not others.** Chapter 1 taught that standard tuning is all fourths except
   `G → B`. Moving up five frets moves every string one step along that stack of fourths, which
   lands the whole set back inside the scale. It runs out after three: fret 15 gives `G C F A# D G`
   and the `A#` is not in C major. One paragraph.
8. **The low E string, completed.** Chapter 3's version: the pentatonic on this string is frets
   `0 3 5 8 10`, which are the five forms' barre frets. The scale adds frets **1** and **7** — and
   those two are the only frets on the low E in the first twelve that are not a barre fret. Give
   the row (`3 4 5 6 7 1 2 3` at frets `0 1 3 5 7 8 10 12`). Note in one sentence that fret 1 is a
   `4` and fret 7 is a `7`, so even walking one string the two new notes are the ones that fall
   between the windows' starting points.
9. **The overlaps, in one sentence and no table.** Every overlap between neighbouring windows now
   holds all seven degrees with something on every string — which, once each window holds every
   degree, is what you would expect. Chapter 2 and chapter 3 both proved the interlock; there is no
   third proof needed.
10. **What each note is for**, as a short `list` or `table` — the chapter's take-away, and the
    complement to chapter 3's chord-tone habit. `1`, `3`, `5`: where a phrase arrives. `2` and `6`:
    colour you can sit on. `4` and `7`: a fret from a chord tone, so they lean — place them and
    move.
11. Close by sending them to [`/scale-visualizer`](screen link) on root `C` with the scale set to
    major and the position toggle on **CAGED** — the same five windows, now complete — and to
    [`/drone`](screen link) for a sustained `C` to play any of them against. One clause may say the
    next chapter leaves the boxes; nothing more.

**Blocks / components**

- `live` · `caged-ladder` · `{ "root": "C" }` — at point 5, framed as the minimal map, not as a
  tiling diagram.
- `table` — the five forms summarised.
- `table` — the four all-six-string frets.
- `table` or `list` — what each degree is for.
- One `callout` (`info`) at point 4 for the half-step rule as the memory aid.
- Screen links to `/scale-visualizer` and `/drone`; article link back to
  `caged-fourths-and-sevenths` or `caged-root-ladder` where useful.

**Do not**: teach moving between forms, horizontal playing, progressions or transposition; give a
table of overlaps; re-teach any single form's dots; name chapter 5's content beyond one clause.

---

## The activity

### `caged-find-the-two-that-lean` — "Drill: Find the Two That Lean"

- **Section id**: `caged-fretboard.ch4.find-the-two-that-lean` ·
  **Activity id**: `act_caged-find-the-two-that-lean`
- `kind: "note-play"`, `modes: ["easy", "hard"]`, document `board: { fretFrom: 0, fretTo: 13 }`.
- Section **must** set `"optional": true`. `estimatedMin: 9`.

**The duplicate-pitch constraint, worked out.** Every window's dots are pitch-distinct **except the
C form**, where `2·0` and `3·4` both sound `B3` (MIDI 59). The first round therefore asks for
`2·0` and not `3·4`, and its prompt says why. Everything else is safe.

There are only three distinct `F` pitches and three distinct `B` pitches in frets 0–12, so the two
"every one of them" rounds ask for one per octave, exactly as chapter 1's root drill had to.

| Round id suffix | Prompt gist | Targets (string·fret) | Board | MIDI |
| --- | --- | --- | --- | --- |
| `c-form-new` | The six dots the scale adds at the nut — five of them, because two sound the same note | 6·1, 5·2, 4·3, 2·0, 1·1 | 0–4 | 41, 47, 53, 59, 65 |
| `a-form-new` | All four the A form gains, including the two on the neck's sparsest frets | 5·2, 4·3, 3·4, 2·6 | 2–6 | 47, 53, 59, 65 |
| `g-form-new` | The G form's five, three of them a fret below a root | 6·7, 5·8, 3·4, 2·6, 1·7 | 4–8 | 47, 53, 59, 65, 71 |
| `e-form-whole` | The whole scale in one window without moving your hand | 6·7, 6·8, 6·10, 5·7, 5·8, 5·10, 4·7, 4·9, 4·10, 3·7, 3·9, 3·10, 2·8, 2·10, 1·7, 1·8, 1·10 | 7–11 | 47 48 50 52 53 55 57 59 60 62 64 65 67 69 71 72 74 |
| `every-four` | One `4` in each octave, low to high — `ordered: true` | 6·1, 4·3, 3·10 | 0–12 | 41, 53, 65 |
| `every-seven` | One `7` in each octave, low to high — `ordered: true` | 6·7, 4·9, 1·7 | 0–12 | 47, 59, 71 |

All six rounds verified pitch-distinct and inside their boards.

---

## The checkpoint

`caged-fretboard-ch4-checkpoint` · section id `caged-fretboard.ch4.checkpoint` ·
`meta.kind: "checkpoint"` · `passThresholdPct: 70` on both the quiz meta and the chapter checkpoint.

Written **after** the articles are read, from what they actually say. Sketch — 8 questions, with
**one per form lesson**, so no form's own material is displaced by the closer's:

| # | Question id suffix | Kind | Draws on | Tests |
| - | ------------------ | ---- | -------- | ----- |
| 1 | `why-they-lean` | `choice` | Opener | What actually sets the `4` and the `7` apart — each sits one fret from a chord tone |
| 2 | `find-the-seven` | `choice` | Opener + G form | Given a root, where the `7` is (one fret below, same string) |
| 3 | `c-form-open-strings` | `choice` | C form | All six open strings are scale notes; five degrees, and the `1` and `4` are the two missing |
| 4 | `a-form-stretch` | `choice` | A form | Fewest new notes, biggest stretch — because they land on the window's outer frets |
| 5 | `g-form-leading-tones` | `fretboard` | G form | Mark the three `7`s under the G form's three roots (`6·7`, `3·4`, `1·7`), `frets: 8` |
| 6 | `e-form-four-frets` | `choice` | E form | Why fret 11 is empty — no string carries a C major note there |
| 7 | `d-form-tension` | `choice` | D form | Three `4`s and two roots — the window that needs the most planning |
| 8 | `all-six-frets` | `choice` | Closer | Why fret 5 was the only all-six pentatonic fret: frets 0/12 hold a `7`, fret 10 holds a `4` |

Every question gets an `explanation`. `fretboard` is graded all-or-nothing, so Q5 asks only for a
fact the G form lesson states explicitly and completely. No `multi-select` is planned.

---

## As built — final word counts

Prose words only (paragraph, callout and list spans; table cells and captions excluded).

| Lesson | Words | `readingTimeMin` | `estimatedMin` in the curriculum |
| ------ | ----- | ---------------- | -------------------------------- |
| `caged-fourths-and-sevenths` | 855 | 5 | 6 |
| `caged-scale-c-form` | 656 | 4 | 5 |
| `caged-scale-a-form` | 687 | 4 | 5 |
| `caged-scale-g-form` | 605 | 4 | 5 |
| `caged-scale-e-form` | 625 | 4 | 5 |
| `caged-scale-d-form` | 628 | 4 | 5 |
| `caged-the-complete-window` | 772 | 4 | 5 |
| `caged-find-the-two-that-lean` (activity) | — | — | 9 (optional) |

Chapter total, counted sections only: **36 minutes**; 45 including the optional drill. The
pathway's `estimatedMin` was left at its placeholder, as chapters 1–3 did — the top-level agent
recomputes it at the end.

Two titles changed during review:

- The A form lesson was planned as **"Four Dots, Two Frets Wider"**. That is wrong on the reach: the
  A form's dots spanned frets 2–5 at the pentatonic layer and span 2–6 now, which is **one** fret
  wider, not two. The "two" was the count of frets that went from empty to occupied (3 occupied
  frets → 5). Retitled **"Fewest New Notes, Biggest Change"**, which is the lesson's actual thesis
  and is unambiguous.

## The checkpoint as built — 8 questions

Written after all seven articles were read. The sketch survived intact; one question per lesson,
with the opener carrying two and the closer one, so no form's own material was displaced.

| # | Question id suffix | Kind | Draws on | Tests |
| - | ------------------ | ---- | -------- | ----- |
| 1 | `why-they-lean` | `choice` | Opener | Each of the two sits a semitone from a chord tone — not "they're harder to reach" |
| 2 | `find-the-seven` | `choice` | Opener + G form | Given the root `6·8`, the nearest `7` is `6·7` — one fret down, same string |
| 3 | `c-form-open-strings` | `choice` | C form | All six open strings are scale notes; five degrees; the `1` and the `4` are the two missing |
| 4 | `a-form-stretch` | `choice` | A form | Fewest new notes, and they land on frets 4 and 6 which the window used to skip |
| 5 | `g-form-leading-tones` | `fretboard` | G form | Mark `6·7`, `3·4`, `1·7` — the `7` under each of the three roots, `frets: 8` |
| 6 | `e-form-four-frets` | `choice` | E form | Fret 11 carries no C major note on any string |
| 7 | `d-form-tension` | `choice` | D form | Three `4`s, two awkward roots — the window that needs the most planning |
| 8 | `all-six-frets` | `choice` | Closer | Frets 0/12 hold a `7` and fret 10 a `4`; fret 5 dodges both, which is why it was alone |

Every question has an `explanation` and all eight parse as gradable. `fretboard` is graded
all-or-nothing, so Q5 asks only for a fact the G form lesson states explicitly and completely. No
`multi-select` was used: the facts that would have suited one (dot counts, which string is short)
are read off a table rather than understood, and all-or-nothing grading makes that unfair.

Question 2's option `6·9` and question 4's option B are the two distractors that encode a specific
wrong belief — that the `7` is a fret *above* the root, and that the A form's new notes land on the
outer strings when in fact those are the only two strings it leaves alone.

## Errors found and fixed during review

Every article was read as written and machine-checked against the computed tables. Both lesson
agents reported finding nothing wrong; nine real problems were present.

1. **G form — "the same window chapter 1 first showed you two roots in", three times** (prose,
   diagram caption, and closing paragraph). Chapter 1 gave the G form **three** roots — its lesson
   is literally titled "The G Form: Three Roots, All Six Strings". All three corrected.
2. **E form — the same "two roots" error in its diagram caption.** The E form also carries three.
3. **A form — "They're the only strings in any window this chapter leaves alone."** False. Strings
   1 and 6 gain nothing in the A form, but so does string 4 in the G form, string 2 in the E form
   and string 5 in the D form. Rewritten to the true claim: every window except the C form has a
   string like that, and the A form is the only one with two.
4. **C form — "settle your fretting fingers over frets 1 through 3 and every fretted dot is under
   one of them."** False: `3·4` is a fretted dot at fret 4. Corrected to frets 1 through 4.
5. **A form — "Checked across the whole fretboard, they're the only two frets like that anywhere."**
   Frets 4 and 6 each carry exactly one scale note, but frets 16 and 18 repeat them an octave up.
   Scoped to the first twelve frets.
6. **E form — "the B string coming up a note light for the third layer running."** False: at the
   pentatonic layer every string in every window carried exactly two, so no string was short. This
   is the first layer at which any string is. Rewritten, and the paragraph now carries the verified
   short-string rule instead.
7. **D form — "fewer places to land than most of the other windows offer."** False: two roots ties
   with the C and A forms, and its seven chord tones tie with A, G and E. Rewritten to the true
   contrast — the C form is the only other window with three `4`s, and it has eighteen dots, six
   open strings and an even three-per-string layout to absorb them.
8. **E form — "sitting right inside the window every other form has to work around."** False: only
   the E and D windows contain fret 11 at all. Also "every other fret between 7 and 10", which
   excluded the fret under discussion; corrected to 7 and 11.
9. **Closer — "chapters 2 and 3 both declined to use it for exactly that reason."** Authoring
   meta-commentary about which components earlier chapters chose, leaking into learner-facing prose.
   Rewritten.

Smaller corrections: `readingTimeMin` was 3 on three articles that ran past 600 words (the same
defect chapter 3 caught); the opener and the A form both reused chapter 1's and chapter 2's
near-verbatim "only how much of each one is lit", which this chapter is supposed to close rather
than renew; the closer used American *memorize* alongside its own *colour* and *neighbouring*; the
closer and the D form both carried a positional cross-reference ("as of the last lesson", "the
closer" as link text) where the pathway requires naming the article; and the opener had a vague
filler paragraph about short strings, replaced with the verified rule below.

**One fact discovered during review and added.** Every short string in every window carries exactly
a `5` and a `6`, and the note it is missing is always a `7`, sitting exactly one fret past the top
of the window where the next form picks it up. Verified in all four windows that have a short
string. It replaced the opener's filler paragraph and is echoed once in the E form lesson.

**Verification method.** A script re-derived every window from `cagedMarks`' own logic and then
checked each article: all 194 `string·fret` tokens in the seven articles are real C-major scale
notes inside the window the article is about, and every "`string·fret` — degree, note" table cell
carries the right degree and the right note name. Every sentence containing a superlative was
listed and reviewed by hand — that pass is what caught items 3, 5 and 7, none of which a token
check can see.

## Judgement calls recorded here

- **The seventh lesson did its job.** The D form lesson is 628 words and spends all of them on the
  D form; the join-up is a separate 772-word article. Chapters 2 and 3 both reported the D form
  getting squeezed by carrying the closer, and the checkpoint has a D-form question about the D
  form rather than about the chapter's summary material.
- **`caged-ladder` is used, breaking with chapters 2 and 3**, which both refused it because it
  marks roots only. Here that is the argument rather than a limitation: the closer's claim is that
  you do not memorise seventeen dots per window, you keep the roots and derive everything else
  (`7` a fret below every `1`, `4` a fret above every `3`, chord tones and the `2`/`6` already
  known). The ladder is therefore the minimal map, and the prose frames it that way.
- **The chapter brief was wrong about the short strings** and the correction is recorded above:
  the A form has two, not one.
- **Chapter 3's forward promise was cashed honestly.** Its closer said the two new notes would land
  in each window's three-fret steps. They do — but new dots also appear at the window edges, and
  that is precisely why the counts run 16 to 18 instead of coming out equal. The opener says both
  halves rather than only the flattering one.
- **No overlap table.** Chapters 2 and 3 both spent their closers on the overlaps. At this layer
  the answer is "all seven degrees, every string, every overlap", which is what you would expect
  once each window holds every degree — so the closer states it in one sentence and spends the
  space on the all-six-string frets and the low-E ladder instead. Chapter 5 owns the overlaps.
- **"Leading tone" is named exactly once**, in the G form lesson, and every other mention is `7`.
  The `4` is given no jargon name at all — the lessons say what it does.
- **One activity, not two.** A `rhythm` drill has nothing to do with this chapter's material, and
  the `note-play` drill's six rounds already carry the argument: each window's new notes, the whole
  scale in the one window that fits under a hand, and then every `4` and every `7` across the neck
  in order.
- **The C form is the only window with a duplicated pitch** (`2·0` and `3·4` are both `B3`), which
  forced the first activity round to ask for five of its six new notes and say why.
- **No footnotes were used anywhere in the chapter**, as in chapters 2 and 3.
