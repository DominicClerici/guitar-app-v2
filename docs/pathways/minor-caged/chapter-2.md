# Chapter 2 — The Five Minor Forms

Chapter id `minor-caged.ch2` · slug `the-five-minor-forms` · 7 articles, 2 activities, 1 checkpoint.

After this chapter the learner can play an A minor chord in five places across the neck and can say
which finger is on the `b3` in each.

**Structure**, mirroring `caged-fretboard` chapter 2 deliberately: an opener, the five form lessons
in strict C-A-G-E-D order, and a closer that joins the five into one picture. Unlike the major
chapter — which folded its closer into the D form lesson — this chapter gets a **separate closer**,
because the join-up material here is stronger and larger: four seams, every one of them a complete
`1 b3 5` on three adjacent strings, plus the `b3`-per-form table that is the chapter's arc line.

---

## Verified facts this chapter is built on

Every number below was **recomputed** from the app's own `cagedFormWindows` / `cagedMarks`
(`mobile/src/lib/guitar-positions/caged.ts`), not remembered, not taken from the brief. Where the
brief and the computation disagreed, the computation wins and the disagreement is recorded at the
bottom of this file. **These are the numbers every lesson must use.** String numbering is
**1 = high e, 6 = low E** everywhere.

### A minor's five windows

```
A minor:  A 0–3   G 1–5   E 4–8   D 6–10   C 9–13
A major:  the same five spans, exactly. A window is anchored on the root, not the quality.
C major:  C 0–4   A 2–6   G 4–8   E 7–11   D 9–13   (chapter 1's table, for reference)
```

Nine of A's ten window-quality pairs are five frets wide. **A minor's A form is four frets, `0–3`,
because the nut cuts it short** — chapter 1 already said this and no lesson may call it five frets.

### Every form: window dots at `show: "triad"`, in both qualities

`1` = `A`, `b3` = `C`, `5` = `E`. Major `3` = `C#`. Written **low string first**.

**C form** — window `9–13`. Major **8** dots, minor **7**.

| | string · fret | degree | note |
| --- | --- | --- | --- |
| major | `6·9` `6·12` `5·12` `4·11` `3·9` `2·10` `1·9` `1·12` | `3 5 1 3 5 1 3 5` | `C# E A C# E A C# E` |
| minor | `6·12` `5·12` `4·10` `3·9` `2·10` `2·13` `1·12` | `5 1 b3 5 1 b3 5` | `E A C E A C E` |

Minor **gains** `4·10` `b3` (step down from `4·11`) and `2·13` `b3` (stepped *in* from `2·14`, above
the top fret). Minor **loses** `6·9` `3` and `1·9` `3` — both sit on the window's **bottom** fret, so
they flatten to fret 8, *outside the picture*.

**A form** — window `0–3`. Major **6** dots, minor **7**.

| | string · fret | degree |
| --- | --- | --- |
| major | `6·0` `5·0` `4·2` `3·2` `2·2` `1·0` | `5 1 5 1 3 5` |
| minor | `6·0` `5·0` `5·3` `4·2` `3·2` `2·1` `1·0` | `5 1 b3 5 1 b3 5` |

Gains `2·1` `b3` (step down from `2·2`) and `5·3` `b3` (stepped *in* from `5·4`, above the top fret).
Loses `2·2` `3`.

**G form** — window `1–5`. Major **7** dots, minor **8**.

| | string · fret | degree |
| --- | --- | --- |
| major | `6·5` `5·4` `4·2` `3·2` `2·2` `2·5` `1·5` | `1 3 5 1 3 5 1` |
| minor | `6·5` `5·3` `4·2` `3·2` `3·5` `2·1` `2·5` `1·5` | `1 b3 5 1 b3 b3 5 1` |

Gains `5·3`, `2·1` (both steps down inside the frame) and `3·5` `b3` (stepped in from `3·6`, above
the top fret). Loses `5·4` `3` and `2·2` `3`. **No third steps out of this window.**

**E form** — window `4–8`. Major **7** dots, minor **8**.

| | string · fret | degree |
| --- | --- | --- |
| major | `6·5` `5·4` `5·7` `4·7` `3·6` `2·5` `1·5` | `1 3 5 1 3 5 1` |
| minor | `6·5` `6·8` `5·7` `4·7` `3·5` `2·5` `1·5` `1·8` | `1 b3 5 1 b3 5 1 b3` |

Gains `3·5` (step down inside the frame) and `6·8`, `1·8` (both stepped *in* from fret 9, above the
top fret). Loses `5·4` `3`, whose `b3` at `5·3` falls **below** the window's bottom fret.

**D form** — window `6–10`. Major **7** dots, minor **7** — the only form where the count is equal.

| | string · fret | degree |
| --- | --- | --- |
| major | `6·9` `5·7` `4·7` `3·6` `3·9` `2·10` `1·9` | `3 5 1 3 5 1 3` |
| minor | `6·8` `5·7` `4·7` `4·10` `3·9` `2·10` `1·8` | `b3 5 1 b3 5 1 b3` |

Gains `6·8` and `1·8` (steps down inside the frame) and `4·10` `b3` (stepped in from `4·11`). Loses
`6·9`, `1·9` and `3·6` — the last of which flattens to `3·5`, **below** the bottom fret. Two step
within the frame, one steps out, one steps in: net zero, which is why the counts match.

### The grips — every one verified dot-for-dot against `cagedMarks`

Six slots, low E first, `x` for a string not played.

| Form | Barre fret | A **major** grip | A **minor** grip | Minor degrees low → high | Roots on strings | Grip span | Strings |
| --- | --- | --- | --- | --- | --- | --- | --- |
| C | 9 | `x 12 11 9 10 9` | `x 12 10 9 10 x` | `x 1 b3 5 1 x` | 5, 2 | frets 9–12 (4) | 4 |
| A | 0 (the nut) | `x 0 2 2 2 0` | `x 0 2 2 1 0` | `x 1 5 1 b3 5` | 5, 3 | frets 0–2 (3) | 5 |
| G | 2 | `5 4 2 2 2 5` | `5 3 2 2 1 5` | `1 b3 5 1 b3 1` | 6, 3, 1 | frets 1–5 (5) | 6 |
| E | 5 | `5 7 7 6 5 5` | `5 7 7 5 5 5` | `1 5 1 b3 5 1` | 6, 4, 1 | frets 5–7 (3) | 6 |
| D | 7 | `x x 7 9 10 9` | `x x 7 9 10 8` | `x x 1 5 1 b3` | 4, 2 | frets 7–10 (4) | 4 |

The A form's grip **is** the open Am chord. The E form's grip **is** the Am barre at fret 5. Those
two are the ones every player already owns, and the opener hands them over immediately.

### Where the `b3` is in each grip — the chapter's arc line

| Form | Grip | The `b3` under your finger |
| --- | --- | --- |
| C | `x 12 10 9 10 x` | string 4, fret 10 |
| A | `x 0 2 2 1 0` | string 2, fret 1 |
| G | `5 3 2 2 1 5` | string 5, fret 3 **and** string 2, fret 1 |
| E | `5 7 7 5 5 5` | string 3, fret 5 |
| D | `x x 7 9 10 8` | string 1, fret 8 |

### The four seams, and the fact that closes the chapter

Every overlap between neighbouring A-minor windows holds a complete `1 b3 5`, **and all four of them
are three adjacent strings**, so every one is directly playable.

| Seam | Frets | Dots inside it | The playable trio |
| --- | --- | --- | --- |
| A ∩ G | `1–3` | `5·3` `b3`, `4·2` `5`, `3·2` `1`, `2·1` `b3` | strings 4-3-2 at `2 2 1` = `5 1 b3` — the fretted part of the open Am |
| G ∩ E | `4–5` | `6·5` `1`, `3·5` `b3`, `2·5` `5`, `1·5` `1` | strings 3-2-1 all at fret `5` = `b3 5 1` — one finger |
| E ∩ D | `6–8` | `6·8` `b3`, `5·7` `5`, `4·7` `1`, `1·8` `b3` | strings 6-5-4 at `8 7 7` = `b3 5 1` |
| D ∩ C | `9–10` | `4·10` `b3`, `3·9` `5`, `2·10` `1` | strings 4-3-2 at `10 9 10` = `b3 5 1` |

### Superlatives this chapter is allowed — recomputed, nothing else may be claimed

- **C form**: the **only** one of the five whose minor window holds **fewer** dots than its major
  window (8 → 7). Also the **highest** of A minor's five windows.
- **A form**: the **narrowest** window — four frets, the only one of the five that is not five frets
  wide, because the nut cuts it short. Also the shortest grip span (three frets).
- **G form**: the **widest** grip — five frets, the only form whose grip is as wide as its whole
  window; the **only** grip that carries the `b3` twice; and the **only** form whose grip asks for a
  note **below** its own barre.
- **E form**: exactly **one** `b3` in the grip (string 3, fret 5) with the other five strings all
  `1` or `5`. Its window is the one chapter 1 already showed as C major's G form.
- **D form**: the **only** form whose highest note is the `b3`; the **only** form whose window holds
  the **same** number of dots in both qualities; the smallest grip alongside the C form (four
  strings).
- All **four** seams hold a complete `1 b3 5` on three adjacent strings.

**Not allowed**, because they are false: "the G form has more roots than any other" (the E form also
has three); "the G form is the only one that shows the chord on all six strings" (all five windows
touch all six strings); "the same picture with one dot moved" as a caption for any window; calling
A minor's A form a five-fret window.

### The convention every form lesson must respect

`caged-shape` at `show: "triad"` draws **everything in the window, not one playable grip**. Every
A-minor window here holds 7 or 8 dots where the grip holds 4, 5 or 6. The **opener states this once
for the whole chapter**, and every form lesson names its window's spare dots — exactly what
`caged-fretboard` chapter 2 did. The component's heading prints `C form · A minor`, which is the
pathway's naming convention by construction.

---

## Scope guards

- **Triads only.** `1 b3 5`. No `4`, no `b7` (chapter 3), no `2`, no `b6` (chapter 4), no chords of
  the key, no Roman numerals, no raised seventh (chapter 5).
- **Do not re-teach the roots.** The opener links `caged-root-ladder` in one sentence and moves on.
  There is no roots chapter in this pathway because roots have no quality.
- **Do not re-derive the `4–8` coincidence.** Chapter 1 owns it
  (`minor-caged-one-window-two-names`); the E form lesson **links back** and says one sentence.
- **Do not re-teach the major forms.** Link `caged-triad-<letter>-form` where a comparison earns it.
- **Never "the Em form".** The letter stays bare and capital; the quality lives on the chord. "Em
  shape" is named **exactly once in the whole pathway** — in the opener — as the synonym found
  elsewhere, and never again.
- **Never "m3", never "mode", never "Aeolian".** Degrees are `1 b3 5`.
- **A major appears only** where a lesson is explicitly making the parallel comparison, which in
  this chapter is the opener plus one grip row per form lesson. Never demonstrate in another key.
- **No `triad-shape` / `triad-ladder`** — different pathway.
- **No `url` links anywhere in this chapter.**
- **Link text is the screen's name**, never its route: `Chord Shapes`, not `/chord-shapes`.

---

## The lessons

Seven articles, in order. Slugs are fixed by the brief for the five form lessons; the opener and
closer are chosen here. Section ids are progress keys and are **never** renamed.

Every article: `schemaVersion: 1`, `publishedAt: "2026-08-14"`, `tags: ["caged", "minor"]`,
`readingTimeMin` = ceil(words ÷ 200) with a floor of 2. `meta.slug` equals the filename stem. The
title is `meta.title` and **no article opens with a heading block**.

---

### 1. `minor-caged-the-window-stays-put` — "The Window Stays, the Third Moves"

- **Section id**: `minor-caged.ch2.the-window-stays-put` ·
  **Article id**: `art_minor-caged-the-window-stays-put`
- **Length**: 650–800 words. It carries the frame for six lessons.
- **Left by chapter 1**: relative and parallel minor by name; A natural minor is C major from its
  sixth degree; `3→b3`, `6→b6`, `7→b7`; the `b3` carries the quality; a note set has no key until
  emphasis gives it one; the "is there even such a thing as minor CAGED" objection and its answer
  (right about the notes, wrong about the chords); that frets `4–8` are C major's G form and A
  minor's E form; that a window is a fret span anchored on its root; the naming convention. Chapter
  1 drew **no** `caged-shape` at all — every individual form is new here.
- **The one thing it teaches**: a CAGED window is anchored on the root, not on the quality, so A
  minor's five windows sit exactly where A major's do — and the only thing that moves is the third.
- **The misconception it corrects**: "minor is a second set of five shapes in five new places."

**Key points, in order**

1. Open on the rule, not a preamble. A minor's five windows are in exactly the same five places as A
   major's. The window does not move, because a window is a fret span positioned by the **root**,
   and the root did not change. What changes is what is marked inside it.
2. State the move precisely, in one sentence the whole chapter runs on: **every `3` steps down one
   fret to a `b3`; roots and fifths never move.** `A` and `E` are in an `Am` chord exactly where
   they are in an `A` chord. Only the `C#` becomes a `C`.
3. **Hand them the two they already play, immediately.** The A form of A minor is the open `Am`
   chord, `x 0 2 2 1 0`. The E form of A minor is the `Am` barre at fret 5, `5 7 7 5 5 5`. Two of
   the five are chords they have played for years. Say the chapter runs C-A-G-E-D and therefore
   opens on the least friendly of the five, and that this is the reason to say the friendly ones out
   loud now. Do **not** teach either form's degrees — those lessons own them.
4. **The roots are already yours.** One sentence plus a link to
   [`caged-root-ladder`](article link): a root has no quality, so every `A` on the neck is exactly
   where the CAGED pathway put it. This pathway has no roots chapter for that reason.
5. **The diagram convention, stated once for the whole chapter.** `caged-shape` lights every `1`,
   `b3` and `5` inside the window — 7 or 8 dots per window here, where a hand holds 4 to 6. The
   window is the territory; the grip is a route through it. Which of those dots a hand can reach at
   once is [`/chord-shapes`](screen link)'s question, not the diagram's.
6. **The window edge — the careful part, and it is load-bearing.** The two `live` blocks, adjacent:
   `caged-shape` `{ "root": "A", "form": "A", "quality": "major" }` then the same with
   `"quality": "minor"`. Same window, frets `0–3`. **Count the dots: six against seven.** Then
   explain why, exactly: the window's edges are fixed frets, so a `3` sitting on the bottom fret
   flattens to a note *outside* the picture, and a `b3` one fret above the top fret steps *into* it.
   Here it is the second: A major's `3` on `5·4` is a fret above the top of the window, and its `b3`
   at `5·3` lands inside. **So "the same picture with one dot moved" is false of the window.** It is
   true of the *grip* — `x 0 2 2 2 0` becomes `x 0 2 2 1 0`, one finger — and the difference between
   those two sentences is the whole reason this callout exists.
7. A small `table` of the five, with the major and minor dot counts, so the point is not a claim but
   a list: C `9–13` 8/7 · A `0–3` 6/7 · G `1–5` 7/8 · E `4–8` 7/8 · D `6–10` 7/7. Note in a clause
   that A minor's A form is four frets wide because the nut cuts it short — chapter 1 said so and
   this table must agree with it.
8. **The naming convention, and the one licensed synonym.** "The E form of A minor", "the E form",
   `Am`. Never "the Em form" — the letter names the shape, the quality names the chord, and the
   diagram's own heading prints `E form · A minor`. Say once, and only here, that other teachers
   write "Em shape" for the same thing; then use this pathway's name for the rest of the pathway.
9. Close pointing at the C form: C-A-G-E-D order starts with the hardest of the five, and it is the
   one that shows most clearly why "the shape just slides" is wrong.

**Blocks / components**

- `live` · `caged-shape` · `{ "root": "A", "form": "A", "quality": "major", "show": "triad", "caption": "…" }`
- `live` · `caged-shape` · `{ "root": "A", "form": "A", "quality": "minor", "show": "triad", "caption": "…" }`
- `table` — the five windows, frets, major dots, minor dots.
- One `callout` (`warning`): the same picture with one dot moved is true of the grip and false of
  the window, because the window's edges are fixed frets.
- Article links to `caged-root-ladder` and `minor-caged-one-window-two-names`; screen links to
  `/chord-shapes` and `/scale-visualizer`; article link to `minor-caged-triad-c-form` at the close.

**Do not**: teach any form's degree map or fragments; give a fret number for the C, G or D form's
grip; mention the pentatonic or any scale note beyond `1 b3 5`; use `caged-ladder` (the closer owns
it).

---

### 2. `minor-caged-triad-c-form` — "The C Form: The Shape Does Not Slide"

- **Section id**: `minor-caged.ch2.triad-c-form` · **Article id**: `art_minor-caged-triad-c-form`
- **Length**: 550–700 words
- **Left by the opener**: the window is anchored on the root; every `3` steps down a fret and
  nothing else moves; the diagram draws the whole window; the edge effect; the A and E forms are
  chords they already play.
- **The one thing it teaches**: the C form is where "flatten the third and the shape just slides"
  dies — the flattened third lands on a fret that breaks the fingering, and one of them leaves the
  window altogether.
- **The misconception it corrects**: "a minor form is the major form with one finger moved back, so
  it is the same shape."

**Key points, in order**

1. Open on the concrete comparison. A major's C form is `x 12 11 9 10 9`, degrees `x 1 3 5 1 3`, and
   it fingers beautifully: the four fretted notes climb one fret at a time — index on `3·9`, middle
   on `2·10`, ring on `4·11`, little finger on `5·12`. One finger per fret, in order.
2. **Now flatten the thirds and watch it fall apart.** `4·11` drops to `4·10` — the same fret as
   `2·10`, with `3·9` sitting *between* them a fret lower. You cannot barre across that. The two
   fingers that were in order have to swap.
3. **And the other third leaves.** `1·9` is on the window's bottom fret; flattened it would sit at
   fret 8, outside the window and below the root on `5·12`. So string 1 drops out of the grip
   entirely. The C form of `Am` is four strings: `x 12 10 9 10 x`, degrees `x 1 b3 5 1 x` — `A`,
   `C`, `E`, `A`, a complete minor triad with the root doubled.
4. The window and its spare dots: seven dots — `6·12` `5`, `5·12` `1`, `4·10` `b3`, `3·9` `5`,
   `2·10` `1`, `2·13` `b3`, `1·12` `5`. Three of them are not in the grip: `6·12`, `2·13`, `1·12`.
   And say the number that makes the edge effect real: **A major's C form window holds eight dots,
   A minor's holds seven — the only one of the five that ends up with fewer.**
5. **The fragment migrates down a string set**, and this is the lesson's practical payload. In major
   the compact triad here is strings 3-2-1 at frets `9 10 9` (`5 1 3`). In minor that fragment does
   not exist, because the note on string 1 left the window. What you take instead is **strings 4-3-2
   at frets `10 9 10`** — `b3 5 1`, the notes `C E A`. Three adjacent strings, nothing to stretch
   for, and it is the shape most players actually reach for out of this form.
6. Where it lives: frets `9–13`, the **highest** of A minor's five windows. Its two roots are
   `5·12` and `2·10`. Nobody bars this form whole in either quality; in minor it is not even a
   candidate.
7. Close: the A form, and the good news.

**Blocks / components**

- `live` · `caged-shape` · `{ "root": "A", "form": "C", "quality": "minor", "show": "triad", "caption": "…" }`
- A `list` or short `table` for the grip's degrees string by string.
- One `callout` (`tip`): strings 4-3-2 at frets `10 9 10` is the whole chord, three adjacent
  strings, no stretch.
- Screen link to `/chord-shapes`; article link to `caged-triad-c-form` where the major comparison
  earns it, at most once; article link to `minor-caged-triad-a-form` at the close.

**Do not**: claim the C form has the most dots of the five in minor (it has seven; G and E have
eight); draw the major diagram as a second `live` block (the opener spent that device — describe the
major grip in prose); teach a barre fingering for this form.

---

### 3. `minor-caged-triad-a-form` — "The A Form: The Chord You Learned First"

- **Section id**: `minor-caged.ch2.triad-a-form` · **Article id**: `art_minor-caged-triad-a-form`
- **Length**: 600–750 words. One of the two longest form lessons; this is the confidence lesson.
- **Left by the C form**: the edge effect made concrete; a fragment migrating between string sets;
  window dots versus grip.
- **The one thing it teaches**: the degree map of the open `Am` chord — `x 1 5 1 b3 5` — and that
  the single finger everyone already moves to turn `A` into `Am` is the chapter's rule in miniature.
- **The misconception it corrects**: "the open Am is a beginner chord, not part of a system."

**Key points, in order**

1. Open on the payoff: the A form of A minor is the open `Am` chord, `x 0 2 2 1 0`. Not *like* it —
   it is it. The nut is the barre, which is exactly why it is free.
2. **The one finger.** Open `A` is `x 0 2 2 2 0`; open `Am` is `x 0 2 2 1 0`. String 2 goes from
   fret 2 to fret 1. That is the chapter's whole rule under one finger: the `3` on `2·2` steps down
   to a `b3` on `2·1`, and nothing else in the chord moves at all.
3. The degrees, string by string: `5·0` `1` (`A`), `4·2` `5` (`E`), `3·2` `1` (`A`), `2·1` `b3`
   (`C`), `1·0` `5` (`E`) — `x 1 5 1 b3 5`. Roots on strings 5 and 3.
4. **The `1 5 1` core is untouched.** Strings 5-4-3 — `5·0`, `4·2`, `3·2` — are `1 5 1`, `A E A`,
   the power chord with an A-string root. It is *identical* in `A` and in `Am`, because roots and
   fifths never move. This is the most physical demonstration in the chapter of the rule the opener
   stated, and it is worth a paragraph.
5. **The top note is the `5`, not the root** — string 1 open is `E`. One short paragraph, and link
   [`caged-triad-a-form`](article link), which made the same point about the major A form; do not
   re-argue it.
6. The window: frets `0–3`, **four frets, not five — the nut cuts it short**, and the only one of
   the five like that. Seven dots, five of them in the grip. The two spares are `6·0` `5` and
   `5·3` `b3`, and `5·3` is the dot that stepped *into* the window from above its top fret when the
   quality changed — the edge effect, in the friendliest shape on the neck. (A major's window here
   holds six dots; A minor's holds seven.)
7. **Moved off the nut it is the cleanest barre of the five.** Barre at fret `n` and nothing in the
   grip reaches past `n+2`. `Bm` at fret 2 is `x 2 4 4 3 2`, the same five notes with the index
   finger doing what the nut was doing. Say plainly what the sources agree on: the A form and the E
   form carry the overwhelming majority of the minor chords anyone actually plays.
8. Send them to [`/chord-detector`](screen link) (Chord Detector): play open `A`, then move that one
   finger, and watch the screen change its mind.
9. Close: the G form, which is the opposite experience.

**Blocks / components**

- `live` · `caged-shape` · `{ "root": "A", "form": "A", "quality": "minor", "show": "triad", "caption": "…" }`
  — the opener already showed this window at both qualities; show the minor one again and do the
  work the opener did not, which is the degrees.
- A `list` or short `table` for the grip's degrees string by string.
- One `callout` (`tip`): one finger, string 2, fret 2 to fret 1 — that is the whole of major to
  minor in this shape.
- Screen link to `/chord-detector`; article link to `caged-triad-a-form`; article link to
  `minor-caged-triad-g-form` at the close.

**Do not**: call this window five frets wide; claim it holds the fewest dots of the five in minor
(seven — the C and D forms also hold seven); teach the `Bm` barre as a technique lesson.

---

### 4. `minor-caged-triad-g-form` — "The G Form: Wider in Minor Than It Was in Major"

- **Section id**: `minor-caged.ch2.triad-g-form` · **Article id**: `art_minor-caged-triad-g-form`
- **Length**: 600–750 words
- **Left by the A form**: `x 1 5 1 b3 5`; the untouched `1 5 1` core; one finger flips the quality;
  the A and E forms carry most real playing.
- **The one thing it teaches**: flattening the third makes the widest form wider still — the `b3` on
  string 2 drops *below* the barre — so the G form is a set of three small triads rather than a
  chord, and two of them are shapes the learner already has under their hand.
- **The misconception it corrects**: "a form you can't hold is a form you can't use."

**Key points, in order**

1. The G form of `Am` sits across frets `1–5`, with its barre at fret 2. Three roots — `6·5`, `3·2`,
   `1·5` — which is one of only two forms with three (the E form is the other; say it that way, not
   as a superlative).
2. **It got wider.** A major's G form is `5 4 2 2 2 5`, frets 2 to 5 — four frets. A minor's is
   `5 3 2 2 1 5`, frets **1 to 5** — five frets, the full width of its own window, and the widest
   grip of the five. The reason is exact: the `3` on `2·2` sits *at* the barre, so its `b3` at `2·1`
   lands **below** it. This is the only one of the five forms whose grip asks for a note below its
   own barre, and it is why the G form of a minor chord cannot be barred at all.
3. **So it lives in pieces**, and each piece is a complete `1 b3 5`:
   - **Bottom three** — `6·5` `1`, `5·3` `b3`, `4·2` `5` (`A C E`). A whole minor triad walking back
     down the frets as it climbs the strings. Good under a low root.
   - **Middle three** — `4·2` `5`, `3·2` `1`, `2·1` `b3` (`E A C`). Look at the frets: `2 2 1`.
     **That is the fretted part of the open `Am` chord** you played in the previous lesson. The A
     form and the G form overlap here, and this is the overlap. Give it its own paragraph.
   - **Top three** — `3·5` `b3`, `2·5` `5`, `1·5` `1` (`C E A`). All three at fret 5: one finger
     laid across three strings and a whole minor chord falls out. The most useful three notes in the
     form.
4. **The only grip of the five that carries the `b3` twice** — `5·3` and `2·1`. Every other form's
   grip has exactly one. Worth a sentence, because it means any piece of this form that takes both
   of those has the chord's quality stated twice over.
5. The window holds eight dots, one more than A major's seven; the extra is `3·5`, which stepped in
   from `3·6` above the top fret. `3·5` is in the grip's top fragment, so unlike the C form's extra
   dot it is a note you actually play.
6. Character, tied to the chord tones: three roots and a chord tone on every one of the six strings
   means this window shows the chord's whole range at a glance. It is a form worth **seeing** even
   though it is never worth **holding**.
7. Close: the E form, the one you do hold whole.

**Blocks / components**

- `live` · `caged-shape` · `{ "root": "A", "form": "G", "quality": "minor", "show": "triad", "caption": "…" }`
- `table` — the three pieces: strings · frets · degrees · what it is for. Keep cells short.
- One `callout` (`tip`): strings 3-2-1 all at fret 5 is a whole `Am`, one finger.
- Screen link to `/chord-shapes`; article link to `caged-triad-g-form` if the major comparison earns
  it; article link to `minor-caged-triad-e-form` at the close.

**Do not**: say this form has more roots than any other (the E form ties it); say it is the only
window that touches all six strings (all five do); teach the seams as a system (the closer owns
that) — naming the two overlaps in passing, as above, is exactly right.

---

### 5. `minor-caged-triad-e-form` — "The E Form: One String Makes It Minor"

- **Section id**: `minor-caged.ch2.triad-e-form` · **Article id**: `art_minor-caged-triad-e-form`
- **Length**: 600–750 words. The other long one — this is the most-played minor shape on the
  instrument.
- **Left by the G form**: pieces as complete chords; the seams starting to show; the `b3` twice.
- **The one thing it teaches**: the degree map `1 5 1 b3 5 1` — five of the six strings are `1` or
  `5`, so the entire minor-ness of the most-played minor chord on the guitar sits on string 3.
- **The misconception it corrects**: "the fret-5 `Am` barre is six different notes" / "I already
  play this, so there is nothing here."

**Key points, in order**

1. The E form of `Am` is the barre at fret 5: `5 7 7 5 5 5`. Its window is frets `4–8`. Roots on
   strings 6 (`6·5`), 4 (`4·7`) and 1 (`1·5`) — the `6 → 4 → 1` map from the CAGED pathway.
2. **This is a window chapter 1 already showed you**, and the connection is worth one sentence and a
   link, not a re-derivation: frets `4–8` are C major's G form and A minor's E form at the same
   time — see [`minor-caged-one-window-two-names`](article link). Do not re-run the seventeen-dot
   table.
3. Degrees low to high: `1 5 1 b3 5 1`. Count them: three `1`s, two `5`s, **one** `b3`. Six strings,
   three notes.
   - `6·5` `1` (`A`), `5·7` `5` (`E`), `4·7` `1` (`A`), `3·5` `b3` (`C`), `2·5` `5` (`E`),
     `1·5` `1` (`A`).
4. **Five of six strings are root or fifth, so string 3 carries the whole question.** `3·5` is the
   only `b3` in the shape. The major barre is `5 7 7 6 5 5` — the same six strings with that one
   note a fret higher. Lift the finger on `3·5` and the chord goes hollow: root and fifth, no
   quality at all until it comes back.
5. The `1 5 1` power chord on strings 6-5-4 (`6·5`, `5·7`, `4·7`) is identical in `A` and `Am` — the
   same demonstration the A form gave on strings 5-4-3, now with a low-E root. One clause; the A
   form lesson owns the explanation.
6. **The high fragment**: strings 3-2-1, all at fret 5 — `b3 5 1`, `C E A`. A complete minor chord
   without moving the hand off the barre. (The G form's window reaches the same three notes; that is
   the seam, and the closer takes it up.)
7. The window's two spare dots are `6·8` `b3` and `1·8` `b3`, both stepped *into* the window from
   fret 9, above its top edge — the edge effect showing up in the shape everyone already knows. And
   one dot left: A major's `3` on `5·4` flattens to `5·3`, **below** the window's bottom fret, so it
   is simply not in the minor picture. Eight dots against A major's seven.
8. Why it stays the form you navigate from: name a note on string 6 and every other chord tone in
   the window is placed without counting.
9. Close: the D form, the smallest, and then the chapter joins up.

**Blocks / components**

- `live` · `caged-shape` · `{ "root": "A", "form": "E", "quality": "minor", "show": "triad", "caption": "…" }`
- A `list` or short `table` for `1 5 1 b3 5 1`, string by string.
- One `callout` (`tip`): string 3, fret 5 is the only `b3` in the shape — the one note that makes
  the whole thing minor.
- Screen links to `/scale-visualizer` and `/chord-detector`; article links to
  `minor-caged-one-window-two-names` and `caged-triad-e-form`; article link to
  `minor-caged-triad-d-form` at the close.

**Do not**: re-derive the `4–8` coincidence or reprint chapter 1's table; teach the minor
pentatonic, even though this is the window a learner may know it from — chapter 3 owns it, and
chapter 1 already named the connection once.

---

### 6. `minor-caged-triad-d-form` — "The D Form: The Flat Third on Top"

- **Section id**: `minor-caged.ch2.triad-d-form` · **Article id**: `art_minor-caged-triad-d-form`
- **Length**: 500–650 words. The shortest form lesson — the closer takes the join-up.
- **Left by the E form**: `1 5 1 b3 5 1`; one string decides quality; high fragments.
- **The one thing it teaches**: the D form is a four-string fragment from the start whose highest
  note is the `b3` — the only form like that — and where the B string makes the grip a triangle
  rather than a shape that slides.
- **The misconception it corrects**: "the top note of a chord is the root."

**Key points, in order**

1. The D form of `Am` is the `Dm` shape at fret 7: `x x 7 9 10 8`, degrees `x x 1 5 1 b3`. Window
   `6–10`. Roots on strings 4 (`7`) and 2 (`10`). Four strings is the whole shape, not a fragment of
   a bigger one — the open `Dm` mutes the bottom two strings and moving it up the neck changes
   nothing about that.
2. **The `b3` is the top note** — `1·8`, a `C`. The only one of the five forms whose highest note is
   the third. That is why the shape reads thin and pointed and why it is the standard grab for a
   high minor voicing.
3. **The B string bites.** A major's D form is `x x 7 9 10 9`: strings 3 and 1 share fret 9 and
   string 2 sits one higher. Flatten the third and string 1 drops to fret 8, so the four fretted
   notes now sit at four different frets — `7`, `9`, `10`, `8`, in that string order. `G → B` is the
   one major third in standard tuning, which is why this grip was never a flat barre and is even
   less like one now.
4. **Drop the top string and the chord loses its quality entirely.** Strings 4-3-2 at `7 9 10` are
   `1 5 1` — a root-fifth-root shell with no third in it at all. In the E form you could lose almost
   anything and keep the `b3`; here the `b3` is the one note on the edge of the shape. The usable
   high fragment is strings 3-2-1 at `9 10 8` — `5 1 b3`, `E A C`.
5. **The window's dot count is unchanged**, and this is the neatest illustration of the edge rule in
   the chapter: seven dots in major, seven in minor. Three `3`s leave and three `b3`s arrive, but
   only two of those are the same note stepping down inside the frame (`6·9`→`6·8` and
   `1·9`→`1·8`). One steps out of the bottom (`3·6` would land at `3·5`) and one steps in from above
   the top (`4·11` arrives as `4·10`). Net zero — which is why "one dot moved" happens to look true
   here and is still the wrong way to think about it.
6. The three window dots the grip cannot reach: `6·8` `b3`, `5·7` `5`, `4·10` `b3`. Note in a clause
   that `5·7` belongs to the E form's grip and `4·10` to the C form's — seams on both sides, which
   the closer picks up.
7. Close: all five are now on the table, and the last lesson puts them on one neck.

**Blocks / components**

- `live` · `caged-shape` · `{ "root": "A", "form": "D", "quality": "minor", "show": "triad", "caption": "…" }`
- A `list` or short `table` for the grip's four strings.
- One `callout` (`info`): the D form's `b3` is its top note, so the fragment that drops string 1 is
  no longer a minor chord at all.
- Screen link to `/chord-shapes`; article link to `caged-triad-d-form` if the comparison earns it;
  article link to `minor-caged-five-shapes-one-neck` at the close.

**Do not**: give the five-form summary table or the seam table (the closer owns both); use
`caged-ladder`.

---

### 7. `minor-caged-five-shapes-one-neck` — "Five Shapes, One Neck"

- **Section id**: `minor-caged.ch2.five-shapes-one-neck` ·
  **Article id**: `art_minor-caged-five-shapes-one-neck`
- **Length**: 700–850 words. The chapter's longest.
- **Left by the D form**: all five grips; every form's `b3` named; seams glimpsed twice.
- **The one thing it teaches**: the five are one continuous map — every seam between neighbouring
  windows holds a complete `1 b3 5` on three adjacent strings, so there is nowhere on the neck where
  an `Am` chord is not under your hand.
- **The misconception it corrects**: "five forms means five places, with gaps between them."

**Key points, in order**

1. Open on the summary `table` — the chapter's artefact. Columns: *Form* / *Window* / *Grip* /
   *Degrees low → high* / *Roots on strings* / *How it is actually played*. Use the verified grips
   unchanged. Keep the cells short; six columns is a lot on a phone, so consider splitting into two
   tables (form / window / grip / degrees, then form / roots / how it is played).
2. **The `b3` table**, which is what the chapter promised the learner they could do: form by form,
   which string and fret carries the `b3` in the grip. C: string 4, fret 10. A: string 2, fret 1.
   G: string 5 fret 3 *and* string 2 fret 1. E: string 3, fret 5. D: string 1, fret 8. Say the
   thing this is for: you can now put a finger on the note that makes any of these chords minor,
   without counting.
3. **The two ladders**, adjacent, and this is the chapter's thesis in a picture: `caged-ladder`
   `{ "root": "A" }` then `caged-ladder` `{ "root": "A", "quality": "minor" }`. The bands are in
   exactly the same places and the roots are exactly the same roots — the only difference is the
   caption. Say plainly that this is not the component being lazy: it is the claim. A window is
   anchored on the root, and the root did not move. **Say what the ladder marks — roots only** — so
   nobody looks for a `b3` on it.
4. **The seams**, as a `table`, and this is the closer's payload. Every overlap between neighbouring
   windows holds a complete `1 b3 5`, and **all four of them are three adjacent strings**, so every
   one is a chord you can actually grab:
   - A ∩ G, frets `1–3`: strings 4-3-2 at `2 2 1` — the fretted part of the open `Am`.
   - G ∩ E, frets `4–5`: strings 3-2-1 all at fret `5` — one finger.
   - E ∩ D, frets `6–8`: strings 6-5-4 at `8 7 7`.
   - D ∩ C, frets `9–10`: strings 4-3-2 at `10 9 10`.
   Point out that three of the four are the *same* shape on different string sets, and that the odd
   one out is the one-finger fret-5 grip.
5. **What that means**: you are never between forms. Wherever your hand stops, the notes under it
   belong to two windows at once and there is a whole `Am` there. That is the claim chapter 1 could
   only assert about the notes, now proved in chord tones.
6. One paragraph on what recurs: everything repeats at fret 12, so the A form comes back as a barre
   there (`x 12 14 14 13 12`) and the ladder wraps exactly as it did in major.
7. **The forward pointer**, one short paragraph: the same five windows, two more notes in each.
   Chapter 3 adds the `4` and the `b7` and the shapes do not change. Do **not** name the pentatonic's
   notes beyond that, and do not draw it.
8. Send them to [`/scale-visualizer`](screen link) (Scale Visualizer) to page the five positions with
   root `A`, and to [`/chord-detector`](screen link) (Chord Detector) to play any fragment from this
   chapter and check that what comes out is still `Am`.

**Blocks / components**

- `table` — all five forms (split into two if the cells get long).
- `table` — where the `b3` is in each grip.
- `live` · `caged-ladder` · `{ "root": "A" }`
- `live` · `caged-ladder` · `{ "root": "A", "quality": "minor" }`
- `table` — the four seams.
- One `callout` (`info`) for the forward pointer at point 7.
- Screen links to `/scale-visualizer` and `/chord-detector`; article link to
  `minor-caged-the-window-stays-put` where the ladder identity earns it.

**Do not**: teach how to move between forms with a progression (chapter 5); name any chord other
than `A` and `Am`; teach the pentatonic; use `caged-shape` (five more diagrams would drown the
tables — the ladders and the tables carry it).

---

## The activities

Two, both `note-play`, both with `"optional": true` on their sections. Every round below was checked
for the duplicate-pitch rule against MIDI values (string 1 open = 64, 2 = 59, 3 = 55, 4 = 50,
5 = 45, 6 = 40).

### A. `minor-caged-play-the-five-shapes` — "Drill: Play All Five"

- **Section id**: `minor-caged.ch2.play-the-five-shapes` ·
  **Activity id**: `act_minor-caged-play-the-five-shapes`
- `kind: "note-play"`, `modes: ["easy", "hard"]`, document `board: { fretFrom: 0, fretTo: 13 }`.
  `estimatedMin: 8`.

The chapter's argument in physical form: the two forms the learner already owns are asked for whole,
the other three as the fragments the lessons named, and the last round picks out only the `b3`.

| Round id suffix | Prompt gist | Targets (string · fret) | Board | MIDI |
| --- | --- | --- | --- | --- |
| `a-form` | The open `Am` — the A form, whole | 5·0, 4·2, 3·2, 2·1, 1·0 | 0–3 | 45 52 57 60 64 |
| `g-form` | The G form's bottom three — a whole `Am` on the low strings | 6·5, 5·3, 4·2 | 1–5 | 45 48 52 |
| `e-form` | The `Am` barre at fret 5 — the E form, whole | 6·5, 5·7, 4·7, 3·5, 2·5, 1·5 | 4–8 | 45 52 57 60 64 69 |
| `d-form` | The `Dm` shape at fret 7 — the D form, all four strings | 4·7, 3·9, 2·10, 1·8 | 6–10 | 57 64 69 72 |
| `c-form` | The C form's compact triad, strings 4-3-2 | 4·10, 3·9, 2·10 | 9–13 | 60 64 69 |
| `every-flat-third` | Every `b3` you can reach, low to high — `ordered: true` | 5·3, 2·1, 1·8 | 0–13 | 48 60 72 |

Rounds 1–5 are unordered; round 6 is `ordered: true`. Round 6 is capped at three targets on purpose:
the `b3` is `C`, and inside frets 0–13 there are only three distinct `C` pitches (48, 60, 72), so any
fourth target would repeat one and the loader would reject the round.

### B. `minor-caged-triads-in-the-seams` — "Drill: The Chord Between Two Forms"

- **Section id**: `minor-caged.ch2.triads-in-the-seams` ·
  **Activity id**: `act_minor-caged-triads-in-the-seams`
- `kind: "note-play"`, `modes: ["easy", "hard"]`, document `board: { fretFrom: 0, fretTo: 13 }`.
  `estimatedMin: 6`.

The closer's claim as a physical exercise — four little `1 b3 5` triads, one in each seam, walking up
the neck. All four are three adjacent strings.

| Round id suffix | Prompt gist | Targets (string · fret) | Board | MIDI |
| --- | --- | --- | --- | --- |
| `a-into-g` | Where the A and G forms meet — strings 4-3-2 | 4·2, 3·2, 2·1 | 1–3 | 52 57 60 |
| `g-into-e` | Where the G and E forms meet — one finger, fret 5 | 3·5, 2·5, 1·5 | 4–5 | 60 64 69 |
| `e-into-d` | Where the E and D forms meet — strings 6-5-4 | 6·8, 5·7, 4·7 | 6–8 | 48 52 57 |
| `d-into-c` | Where the D and C forms meet — strings 4-3-2 | 4·10, 3·9, 2·10 | 9–10 | 60 64 69 |

All rounds unordered. Rounds 2 and 4 sound the same three pitches in different places, which is fine
— the rule is per round.

---

## The checkpoint

`minor-caged-ch2-checkpoint` · section id `minor-caged.ch2.checkpoint` ·
`meta.kind: "checkpoint"` · `passThresholdPct: 70` on both the quiz meta and the chapter checkpoint.

Written **after** the articles are read, from what they actually say. Sketch — 8 questions:

| # | Question id suffix | Kind | Draws on | Tests |
| - | ------------------ | ---- | -------- | ----- |
| 1 | `window-does-not-move` | `choice` | Opener | Where A minor's five windows sit relative to A major's |
| 2 | `already-know-two` | `multi-select` | Opener | Which two forms are chords the learner already plays (A, E) |
| 3 | `dot-count` | `choice` | Opener + C form | Why the major and minor diagrams of one window hold different numbers of dots |
| 4 | `a-form-one-finger` | `choice` | A form | The single note that turns open `A` into open `Am` |
| 5 | `g-form-below-the-barre` | `choice` | G form | Why the G form of a minor chord cannot be barred |
| 6 | `e-form-one-string` | `fretboard` | E form | Mark the only `b3` in `5 7 7 5 5 5` — string 3, fret 5 |
| 7 | `d-form-top-note` | `choice` | D form | The D form is the only form whose highest note is the `b3` |
| 8 | `seam-triad` | `choice` | Closer | The seams hold a complete `1 b3 5` on three adjacent strings |

Every question gets an `explanation`. `multi-select` and `fretboard` are graded all-or-nothing, so
Q2 and Q6 ask only for facts the chapter states completely and explicitly. **No option is referred to
by letter or position** — options shuffle on every attempt and render with no labels.

**As built — 8 questions, exactly the sketch above.** Q3 carries a `setup` table holding the five
windows' major and minor dot counts, so the learner reads the evidence before answering. Q6 is the
chapter's one `fretboard` question, `frets: 8`, a single position (`3·5`).

---

## As built — final word counts

| Lesson | Words | `readingTimeMin` | `estimatedMin` in the curriculum |
| --- | --- | --- | --- |
| `minor-caged-the-window-stays-put` | 792 | 4 | 5 |
| `minor-caged-triad-c-form` | 554 | 3 | 4 |
| `minor-caged-triad-a-form` | 610 | 4 | 5 |
| `minor-caged-triad-g-form` | 603 | 4 | 5 |
| `minor-caged-triad-e-form` | 618 | 4 | 5 |
| `minor-caged-triad-d-form` | 494 | 3 | 4 |
| `minor-caged-five-shapes-one-neck` | 791 | 4 | 5 |
| `minor-caged-play-the-five-shapes` (activity) | — | — | 8 (optional) |
| `minor-caged-triads-in-the-seams` (activity) | — | — | 6 (optional) |

Chapter total, counted sections only: **33 minutes** of articles plus **5** for the checkpoint =
**38**; 52 including the two optional drills. The pathway's `estimatedMin` is still its placeholder
of 200 — the top-level agent recomputes it once every chapter exists.

---

## Errors found and corrected in the drafts

Recorded so the next chapter agent knows the checking step earns its keep. All four were reported
clean by their lesson agents.

1. **`minor-caged-triad-c-form`** claimed the one-finger flip was "true of one form in this chapter —
   the next one". Recomputed across all five grip pairs: **three** of the five change by exactly one
   note (A on string 2, E on string 3, D on string 1); the C and G forms change two. Corrected to
   "three of the five grips".
2. **`minor-caged-the-window-stays-put`** printed "the counts are never all equal" directly above a
   table whose D-form row reads 7 and 7. Rewritten to "the count usually — though not always —
   changes with it".
3. **`minor-caged-five-shapes-one-neck`** claimed "three of the four [seam trios] are the identical
   shape, just relocated to a different string set". Recomputed: the four fret patterns are
   `2 2 1`, `5 5 5`, `8 7 7`, `10 9 10` — relative offsets `0 0 -1`, `0 0 0`, `0 -1 -1`, `0 -1 0`.
   **No two are the same.** Rewritten around the true reason: three of the four cross the `G → B`
   break and they do not all sit in the same inversion.
4. **`minor-caged-triad-e-form`** called the D form "the smallest of the five" in its closing link.
   The C and D form grips both take four strings across four frets, so it is a tie. Softened to
   "four strings and no more".

Three smaller fixes: the opener named the component `caged-shape` in prose (a registry name the
learner never sees) and described the diagram as lighting "every root, third and fifth" in a minor
chapter — rewritten as "every `1`, `b3` and `5`"; the closer's seam table wrapped whole sentences in
the `code` mark, and was split into four short columns; and a handful of `Am`, `Dm` and `b3`
mentions were missing the `code` mark.

---

---

## Judgement calls recorded here

- **A separate closer, unlike `caged-fretboard` chapter 2**, which folded its join-up into the D form
  lesson. The join-up here is bigger: four seams, all four playable on three adjacent strings, plus
  the `b3`-per-form table that is the chapter's arc line. Cramming that into the D form lesson would
  have buried it.
- **Two activities rather than one.** They are different exercises: the first is the five shapes
  themselves (two whole, three as fragments, then every reachable `b3`); the second is the closer's
  seam claim as a physical drill. Both are `optional` and neither is counted.
- **The opener draws the A form's window at both qualities**, and the A form lesson then draws the
  minor one again. Deliberate, and the same split `caged-fretboard` chapter 2 used: the opener uses
  it to make the dot count visible, and says nothing about the form's degrees.
- **`caged-ladder` is used only in the closer**, and only as a pair — A major beside A minor. The
  identity of the two is the chapter's thesis, and the closer states out loud that the ladder marks
  roots only so nobody hunts it for a `b3`.
- **"Em shape" appears exactly once**, in the opener, as the synonym found elsewhere. "The Em form"
  appears twice, both times as the thing this pathway does *not* say.
- **The activity's `every-flat-third` round has three targets, not five.** The `b3` of A minor is
  `C`, and frets 0–13 hold only three distinct `C` pitches (MIDI 48, 60, 72). A fourth target would
  repeat one and the loader would reject the round.
- **No lesson claims the C form's window is "the one with the most dots"** or the G form's "the one
  with the most roots". Both were tempting and both are false in minor — the G and E windows tie at
  eight dots, and the G and E forms tie at three roots.

## Where the brief and the computation disagreed

Recorded so the next chapter agent does not re-inherit the error.

- The brief says the C form's `b3` "crosses the B-string break". Recomputed, the C form of A minor's
  `b3` dots are `4·10` and `2·13`, and the grip's `b3` is `4·10` — string 4, nowhere near the G→B
  break. What actually happens in the C form is different and sharper: the third on `4·11` drops onto
  the *same fret* as the root on `2·10`, with the fifth on `3·9` a fret lower between them, so the
  fingering has to invert; and the third on `1·9` flattens clean out of the window. The C form lesson
  teaches that instead. The B-string break does bite, but in the **D form** (`x x 7 9 10 8`, four
  fretted notes on four different frets), which is where the brief also says it bites.
- The brief calls the G form's three roots "the best form for *seeing* where a minor chord lives
  across all six strings". Recomputed, the E form also has three roots, and **all five** windows
  carry a dot on every one of the six strings. The G form lesson keeps the "worth seeing, not worth
  holding" idea but drops the implied superlative and takes three verified ones instead: widest grip,
  the only grip with two `b3`s, the only grip reaching below its own barre.
