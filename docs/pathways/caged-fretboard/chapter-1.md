# Chapter 1 — Where the Roots Are

Chapter id `caged-fretboard.ch1` · slug `where-the-roots-are` · 7 articles, 1 activity, 1 checkpoint.

After this chapter the learner can find every `C` on the neck without counting, and knows that the
letter names the **form** rather than the chord.

---

## Verified facts this chapter is built on

Computed from the app's own `CAGED_FORM_OFFSETS` (`mobile/src/lib/guitar-positions/caged.ts`) and
from standard-tuning MIDI, not from the web. **These are the numbers every lesson must use.**

### The five windows of C major, and every root inside them

`caged-shape` draws exactly these fret ranges, and marks exactly these roots when `show: "roots"`.
A lesson that names a different range contradicts its own diagram.

| Form | Barre fret | Window (frets the diagram draws) | Roots (string · fret) | Pitches |
| ---- | ---------- | -------------------------------- | --------------------- | ------- |
| C    | 0 (open)   | 0–4                              | 5·3, 2·1              | C3, C4  |
| A    | 3          | 2–6                              | 5·3, 3·5              | C3, C4  |
| G    | 5          | 4–8                              | 6·8, 3·5, 1·8         | C3, C4, C5 |
| E    | 8          | 7–11                             | 6·8, 4·10, 1·8        | C3, C4, C5 |
| D    | 10         | 9–13                             | 4·10, 2·13            | C4, C5  |

String numbering is **1 = high e, 6 = low E** everywhere.

### Every C in the first twelve frets — six of them

| Position | Belongs to |
| -------- | ---------- |
| string 2, fret 1  | C form only |
| string 5, fret 3  | C form **and** A form |
| string 3, fret 5  | A form **and** G form |
| string 6, fret 8  | G form **and** E form |
| string 1, fret 8  | G form **and** E form |
| string 4, fret 10 | E form **and** D form |
| (string 2, fret 13) | D form only — past the octave, the same note as string 2 fret 1 an octave up |

**Every root except the two at the ends is shared by two forms.** That is the interlock, stated as a
fact rather than an image, and it is the closer's central point.

### Octave shapes, and why they differ

| Jump | Strings are tuned apart by | Fret change for an octave |
| ---- | ------------------------- | ------------------------- |
| `6 → 4` | 10 semitones | `+2` |
| `5 → 3` | 10 semitones | `+2` |
| `4 → 2` | 9 semitones  | `+3` |
| `3 → 1` | 9 semitones  | `+3` |
| `6 → 1` | 24 semitones | same fret (two octaves) |

The reason, which is taught as a reason and never as a list: standard tuning is **all fourths except
`G → B`, which is a major third**. Skip two strings without crossing `G → B` and you have covered ten
semitones, so two more frets make twelve. Cross it and you have covered nine, so it takes three.

### Misconception worked example (opener)

Open C is `x 3 2 0 1 0`, root on string 5 fret 3. The barre is a movable nut: put it at fret 5 and
every finger moves up five, giving `x 8 7 5 6 5`. The root is now string 5 fret 8 — that is `F`.
The shape is still the C form; the chord is F.

**State the root's position, not only the barre fret.** "The C form at the fifth fret" is ambiguous in
the wild — some writers mean the barre, some the root — and the ambiguity is exactly what confuses
learners. Always say where the root landed.

---

## The lessons

Seven articles, in order. Slugs are fixed by the brief. Section ids are progress keys: never renamed.

Every article: `schemaVersion: 1`, `publishedAt: "2026-08-11"`, `tags: ["caged", "fretboard"]`,
`readingTimeMin` = ceil(words ÷ 200), floor 2. `meta.slug` equals the filename stem. The title is
`meta.title` and the article does **not** open with a heading.

---

### 1. `caged-what-the-letter-means` — "What the Letter Actually Names"

- **Section id**: `caged-fretboard.ch1.what-the-letter-means` · **Article id**: `art_caged-what-the-letter-means`
- **Length**: 550–700 words
- **Left by the previous lesson**: nothing. This is the first lesson of the pathway.
- **The one thing it teaches**: the letter in CAGED names the *form* — what those fingers would spell
  at the nut — not the chord that comes out.
- **The misconception it corrects**: "playing the C shape means I am playing a C."

**Key points, in order**

1. Open with the trap sentence itself. A learner barres the C shape at the fifth fret and calls it a
   C. It is an F.
2. The barre is a movable nut. An open shape is only "C" because the nut happens to put its root on
   string 5 fret 3; replace the nut with a finger and the whole arrangement slides.
3. The worked example, in full: `x 3 2 0 1 0` → barre at fret 5 → `x 8 7 5 6 5`, root string 5
   fret 8, which is `F`. Name the root's position explicitly.
4. So the five letters name five *geometric arrangements* — five ways a major chord's root, third
   and fifth can sit across six strings. Any one of them can spell any chord.
5. Name **"shape"** once, here, as the synonym found elsewhere in the literature; then use **"form"**
   for the rest of the pathway. (This is the pathway's only place to do this.)
6. What the chapter does: take one chord, `C`, find all five of its forms, and mark **only the
   roots**. Roots first, because every other note in a form is measured from one.
7. Show the destination: `caged-ladder` with `root: "C"` and no highlight. Say what it is — five
   labelled bands, every `C` on the neck lit — and say the learner is not expected to read it yet.

**Blocks / components**

- `live` · `caged-ladder` · `{ "root": "C" }` — after point 6, as the destination.
- One `callout` (`warning`) carrying the trap: the letter never tells you the chord; the root does.
- Close with somewhere to go: the next lesson, the C form at the nut.

**Do not**: teach thirds or fifths; teach any octave shape (lessons 3–6 own those); demonstrate in
any key but C; explain the interlock (that is lesson 7's job).

---

### 2. `caged-roots-c-form` — "The C Form: Roots on 5 and 2"

- **Section id**: `caged-fretboard.ch1.roots-c-form` · **Article id**: `art_caged-roots-c-form`
- **Length**: 500–650 words
- **Left by lesson 1**: the letter names the form; the barre is a movable nut; this chapter maps
  C major's five forms and marks roots only; "form" is the word.
- **The one thing it teaches**: the C form's two roots — string 5 fret 3 and string 2 fret 1 — and
  that the higher-sounding root sits *lower on the fret axis*, because of the B string.
- **The misconception it corrects**: "the two roots of a shape line up in an obvious diagonal."

**Key points, in order**

1. For C major the C form is the open C chord: barre fret 0, window frets 0–4. The form the letter is
   named after, sitting where it was named.
2. Its two roots: **string 5 fret 3** and **string 2 fret 1**. Exactly two — this form's own count.
3. The oddity: string 2 fret 1 is the *higher* of the two by an octave, yet it sits two frets nearer
   the nut. Three strings across, two frets back. That is the B string's doing, and it is the first
   sign that the neck's geometry is not uniform. (Do not give the full octave-shape table — lessons 3
   to 6 build it one row at a time. Just flag the cause by name.)
4. Practically: string 5 fret 3 is the `C` most players already know — the note the open chord is
   built from. String 2 fret 1 is under the index finger in that same open shape.
5. **The fragment habit, introduced here at the first opportunity.** The full C-form barre — barre at
   fret *n*, then reach *n+3* — is a stretch almost nobody plays. Real players take pieces of it: the
   top four strings, or the root plus its neighbours on strings 5–4–3. Say this as the normal case,
   not a concession. This is the chapter's only fragment discussion; chapter 2 develops it.
6. Close pointing at the A form, where the barre is genuinely comfortable and the two roots line up
   the easy way.

**Blocks / components**

- `live` · `caged-shape` · `{ "root": "C", "form": "C", "show": "roots", "caption": "…" }` — a caption
  naming the two roots by string and fret.
- One `callout` (`tip`) for the fragment habit.
- A `/scale-visualizer` screen link.

---

### 3. `caged-roots-a-form` — "The A Form: The Cleanest Octave on the Neck"

- **Section id**: `caged-fretboard.ch1.roots-a-form` · **Article id**: `art_caged-roots-a-form`
- **Length**: 450–600 words
- **Left by lesson 2**: two roots on strings 5 and 2; the B string makes them lean back; fragments
  are the normal way to play a wide form.
- **The one thing it teaches**: the octave shape `5 → 3` = **two strings across, `+2` frets** — the
  single most reusable root-finding move — living inside the friendliest of the five forms.
- **The misconception it corrects**: "finding the next root up means counting frets."

**Key points, in order**

1. The A form of C: barre at fret 3, window frets 2–6. It is the open A shape with the nut moved to
   fret 3 — the barre chord most players already own.
2. Its roots: **string 5 fret 3** and **string 3 fret 5**. Two.
3. The octave shape: `5 → 3` is `+2` frets. Two strings across, two frets up, and you are an octave
   higher. Same move on `6 → 4`, which lesson 5 will use. Give the reason: `A → D` and `D → G` are
   both fourths, ten semitones together, so two more frets make twelve.
4. Character: this is the **friendliest** of the five. A clean, playable full barre — unlike the C
   form, you can and should hold this one whole.
5. Note without dwelling: string 5 fret 3 was also the C form's lower root. The same note belongs to
   two forms. Flag it in one sentence and move on — lesson 7 makes the argument.
6. Close pointing at the G form and its three roots.

**Blocks / components**

- `live` · `caged-shape` · `{ "root": "C", "form": "A", "show": "roots", "caption": "…" }`.
- One `callout` (`tip`): `5 → 3` is `+2`, and so is `6 → 4`.
- A `/scale-visualizer` screen link.

---

### 4. `caged-roots-g-form` — "The G Form: Three Roots, All Six Strings"

- **Section id**: `caged-fretboard.ch1.roots-g-form` · **Article id**: `art_caged-roots-g-form`
- **Length**: 550–700 words
- **Left by lesson 3**: the `5 → 3` = `+2` octave shape; the A form is the comfortable one; roots are
  shared between neighbouring forms.
- **The one thing it teaches**: the G form carries **three** roots, across all six strings, and it
  contains the free fact that strings 6 and 1 hold the same note two octaves apart at the same fret.
- **The misconception it corrects**: "every form has two roots" / "the widest form is the most useful
  to hold."

**Key points, in order**

1. The G form of C: barre at fret 5, window frets 4–8.
2. Its roots: **string 6 fret 8**, **string 3 fret 5**, **string 1 fret 8**. **Three** — the first
   form in this chapter that has more than two, and the reason it is the best form for *seeing* where
   a chord lives: it touches the bottom of the neck, the middle, and the top.
3. Strings 6 and 1 are tuned exactly **two octaves apart**, so any note on the low E has a twin on
   the high e at the same fret. Here both roots sit at fret 8. This is the cheapest fact on the
   fretboard and the G form is where it is impossible to miss.
4. The middle root, string 3 fret 5, is a note the learner already met: it was the A form's upper
   root. Two forms, one note.
5. Character: the **widest and hardest to hold whole**. A barre at fret 5 while reaching fret 8 on
   the outer strings is a stretch most hands decline. In practice it is played in pieces — the top
   three strings as a small triad, or the low root with the string-3 root. Reuse the fragment idea
   from lesson 2 rather than re-explaining it.
6. Close pointing at the E form, the one form everybody already plays.

**Blocks / components**

- `live` · `caged-shape` · `{ "root": "C", "form": "G", "show": "roots", "caption": "…" }`.
- One `callout` (`tip`): strings 6 and 1, same fret, two octaves apart.
- A `/scale-visualizer` screen link.

---

### 5. `caged-roots-e-form` — "The E Form: The Shape You Navigate From"

- **Section id**: `caged-fretboard.ch1.roots-e-form` · **Article id**: `art_caged-roots-e-form`
- **Length**: 600–750 words
- **Left by lesson 4**: three roots is possible; strings 6 and 1 hold the same note at the same fret;
  wide forms get played in pieces.
- **The one thing it teaches**: the `6 → 4 → 1` root map. From one root on the low E string you can
  place the other two without counting, and this is why every other form gets located from here.
- **The misconception it corrects**: "I already know this shape" — the learner owns the barre chord
  physically and has never seen the root map inside it.

**Key points, in order**

1. The E form of C: barre at fret 8, window frets 7–11. This is the shape behind every "F barre
   chord" — the most-used barre on the instrument.
2. Its roots: **string 6 fret 8**, **string 4 fret 10**, **string 1 fret 8**. Three.
3. **The map, as one move:** from the low root, `6 → 4` is `+2` frets — the same shape lesson 3 gave
   as `5 → 3` — and `6 → 1` is the same fret. One root on the low E gives the other two instantly.
   This is the backbone. Say plainly that it is worth over-learning.
4. Why this form and not another: the low E string is the string most players can name notes on, so
   the E form is the one that is already located the moment you find a note. Everything else on the
   neck gets measured from it.
5. Character: the one form where the whole barre is genuinely worth playing, and where holding it
   whole is normal rather than a stretch.
6. Show it in place: `caged-ladder` with `highlight: "E"` — the claim "this is what you navigate
   from" needs the whole neck behind it. Keep the prose about *where it sits*, not about the tiling;
   the tiling is lesson 7.
7. Close pointing at the D form, the smallest and the last.

**Blocks / components**

- `live` · `caged-shape` · `{ "root": "C", "form": "E", "show": "roots", "caption": "…" }`.
- `live` · `caged-ladder` · `{ "root": "C", "highlight": "E" }` — at point 6, not before.
- One `callout` (`tip`): `6 → 4` is `+2`, `6 → 1` is the same fret.
- A `/scale-visualizer` screen link.

---

### 6. `caged-roots-d-form` — "The D Form: Small, High, and Always a Fragment"

- **Section id**: `caged-fretboard.ch1.roots-d-form` · **Article id**: `art_caged-roots-d-form`
- **Length**: 450–600 words
- **Left by lesson 5**: the `6 → 4 → 1` map; `6 → 4` is `+2`; `6 → 1` is the same fret.
- **The one thing it teaches**: the octave `4 → 2` is `+3`, not `+2`, because the jump crosses the
  `G → B` major third — and the D form is where that irregularity is unavoidable.
- **The misconception it corrects**: "the octave shape is always two strings across and two frets
  up."

**Key points, in order**

1. The D form of C: barre at fret 10, window frets 9–13. The highest of the five, and the only one
   that runs past the twelfth fret.
2. Its roots: **string 4 fret 10** and **string 2 fret 13**. Two — back down from three.
3. **`4 → 2` is `+3`.** Complete the rule here, since this is the last form: standard tuning is all
   fourths except `G → B`, which is a major third. A two-string jump that misses `G → B` covers ten
   semitones and needs `+2`; one that crosses it covers nine and needs `+3`. So `6 → 4` and `5 → 3`
   are `+2`, while `4 → 2` and `3 → 1` are `+3`. Teach the reason; the four numbers follow from it.
4. Character: the **smallest** form and essentially never played whole. The full D-form barre is not
   a thing players do; it lives as the top-strings fragment. Say so plainly — a learner who tries to
   barre this and fails will blame themselves.
5. The upper root at string 2 fret 13 is one fret past the twelfth-fret marker, and it is the same
   note as string 2 fret 1 — the C form's upper root — an octave higher. **Fret 12 is where the nut's
   own pattern comes back**, so after the D form the ladder starts again with the C form at fret 12.
6. Close by handing the wrap-around to lesson 7.

**Blocks / components**

- `live` · `caged-shape` · `{ "root": "C", "form": "D", "show": "roots", "caption": "…" }`.
- One `callout` (`warning`): don't try to hold this one whole.
- A `/chord-shapes` or `/scale-visualizer` screen link.

---

### 7. `caged-root-ladder` — "The Root Ladder"

- **Section id**: `caged-fretboard.ch1.root-ladder` · **Article id**: `art_caged-root-ladder`
- **Length**: 650–800 words
- **Left by lesson 6**: all five forms mapped; the octave rule complete; fret 12 wraps.
- **The one thing it teaches**: the five forms are not five alternatives — they are five consecutive,
  interlocking windows in the fixed cyclic order C → A → G → E → D, and between them they account for
  exactly six `C`s in the first twelve frets.
- **The misconception it corrects**: "CAGED is five ways to play a chord" and "the five forms are
  separate boxes."

**Key points, in order**

1. Put the five side by side as a `table`: form · barre fret · window · roots. Use the verified
   numbers above, unchanged.
2. `caged-ladder` with `root: "C"`, no highlight. Now the learner can read it.
3. **The order is fixed and cyclic.** C → A → G → E → D, then C again at fret 12, forever. It is not
   an acronym to recite; it is the order the windows physically occur in going up the neck.
4. **They interlock.** The top of one window is the bottom of the next: C 0–4 and A 2–6 share frets
   2–4; A and G share 4–6; G and E share 7–8; E and D share 9–11. That overlap is what makes the neck
   continuous instead of five islands.
5. **The concrete version of the same claim** — this is the strongest paragraph in the chapter, so
   give it a list or table: there are six `C`s in the first twelve frets (2·1, 5·3, 3·5, 6·8, 1·8,
   4·10), and every one of them except string 2 fret 1 belongs to **two** forms at once. The forms are
   not sets of different notes; they are overlapping views of one set of six.
6. Summarise the octave shapes in one small table (`6 → 4` `+2`, `5 → 3` `+2`, `4 → 2` `+3`,
   `3 → 1` `+3`, `6 → 1` same fret), with the `G → B` reason restated in a sentence.
7. **The load-bearing reassurance, said once, here**: the learner will never be asked to learn a new
   shape after this chapter. Chapters 2, 3 and 4 put more notes inside these same five windows —
   first the third and fifth, then the major pentatonic, then the whole major scale. The windows do
   not change; only how much of each one is lit.
8. Close by sending them to `/scale-visualizer`: set the root to C, page through the positions, and
   the pager's labels are these same form names.

**Blocks / components**

- `table` for the five forms.
- `live` · `caged-ladder` · `{ "root": "C" }`.
- `table` or `list` for the six roots and which forms own them.
- `table` for the octave shapes.
- One `callout` (`info`) for the reassurance at point 7.
- `/scale-visualizer` screen link at the close.

**Do not**: name a single note of the third or fifth; teach connecting forms horizontally (chapter 5);
transpose out of C.

---

## The activity

### `caged-find-every-c` — "Drill: Find Every C"

- **Section id**: `caged-fretboard.ch1.find-every-c` · **Activity id**: `act_caged-find-every-c`
- `kind: "note-play"`, `modes: ["easy", "hard"]`, document `board: { fretFrom: 0, fretTo: 13 }`.
- Section **must** set `"optional": true`.

**The duplicate-pitch constraint, worked out.** The six `C`s in the first twelve frets are only three
distinct pitches: `48` (5·3, 6·8), `60` (2·1, 3·5, 4·10) and `72` (1·8, 2·13). The detector hears
pitches, not strings, so **no round may contain two positions from the same group**. Every round
below is one position per window, which happens to satisfy this automatically — one root per octave.

| Round id | Prompt | Targets | Board | MIDI |
| -------- | ------ | ------- | ----- | ---- |
| `r_caged-find-every-c.c-form` | C form, at the nut | 5·3, 2·1 | 0–4 | 48, 60 |
| `r_caged-find-every-c.a-form` | A form, barre at 3 | 5·3, 3·5 | 2–6 | 48, 60 |
| `r_caged-find-every-c.g-form` | G form, barre at 5 — three roots | 6·8, 3·5, 1·8 | 4–8 | 48, 60, 72 |
| `r_caged-find-every-c.e-form` | E form, barre at 8 — three roots | 6·8, 4·10, 1·8 | 7–11 | 48, 60, 72 |
| `r_caged-find-every-c.d-form` | D form, barre at 10 | 4·10, 2·13 | 9–13 | 60, 72 |
| `r_caged-find-every-c.climb` | Whole neck, in order, low to high | 5·3, 3·5, 1·8 | 0–12 | 48, 60, 72 — `ordered: true` |

The last round is the "just past it" one: the same three pitches with the board opened to the whole
neck and the order enforced, so it is recall rather than reading.

---

## The checkpoint

`caged-fretboard-ch1-checkpoint` · section id `caged-fretboard.ch1.checkpoint` ·
`meta.kind: "checkpoint"` · `passThresholdPct: 70` on both the quiz meta and the chapter checkpoint.

Written **after** the articles were read, from what they actually say. **As built — 8 questions:**

| # | Question id suffix | Kind | Draws on | Tests |
| - | ------------------ | ---- | -------- | ----- |
| 1 | `c-form-at-five` | `choice` | Lesson 1 | C form barred at fret 5, root on string 5 fret 8 → which chord? (`F`) |
| 2 | `c-form-fragments` | `choice` | Lesson 2 | *Why* the C form is played in fragments — a reach problem, not a pitch problem |
| 3 | `three-roots` | `multi-select` | Lessons 4 + 5 | Which forms carry three roots (`G` and `E`) |
| 4 | `e-form-map` | `choice` | Lesson 5 | From a root on string 6 fret 8, place the other two (`+2` → fret 10; same fret on string 1) |
| 5 | `b-string-shift` | `choice` | Lessons 3 + 6 | Why `4 → 2` is `+3` while `5 → 3` is `+2` (the `G → B` major third) |
| 6 | `find-the-cs` | `fretboard` | Lessons 2–4 | Mark every `C` in frets 0–5 (2·1, 5·3, 3·5), `frets: 5` |
| 7 | `six-roots` | `choice` | Lesson 7 | What "six roots, five overlapping views" implies — the interlock |
| 8 | `after-the-d-form` | `choice` | Lessons 6 + 7 | What follows the D form going up the neck (the C form, at fret 12) |

Every question has an `explanation`. **`fretboard` and `multi-select` are both graded all-or-nothing**
(`mobile/src/lib/quiz/grading.ts`), which is why Q3 and Q6 only ask for facts the chapter states
explicitly and completely. `frets: N` on a `fretboard` question draws frets `0..N` inclusive.

Question 2 replaced the planned "which form's roots are on strings 4 and 2", which was pure recall.
Question 7 was added so the closer's central claim is tested as understanding rather than counting.

---

## As built — final word counts

| Lesson | Words | `readingTimeMin` | `estimatedMin` in the curriculum |
| ------ | ----- | ---------------- | -------------------------------- |
| `caged-what-the-letter-means` | 583 | 3 | 4 |
| `caged-roots-c-form` | 565 | 3 | 4 |
| `caged-roots-a-form` | 573 | 3 | 4 |
| `caged-roots-g-form` | 625 | 4 | 5 |
| `caged-roots-e-form` | 641 | 4 | 5 |
| `caged-roots-d-form` | 554 | 3 | 4 |
| `caged-root-ladder` | 781 | 4 | 5 |
| `caged-find-every-c` (activity) | — | — | 7 (optional) |

Chapter total, counted sections only: **31 minutes**; 38 including the optional drill. The pathway's
`estimatedMin` was left untouched at its placeholder — the top-level agent recomputes it at the end.

## Judgement calls recorded here

- **Window ranges are the diagram's ranges.** `caged-shape` draws `CAGED_FORM_OFFSETS`, which gives
  the A form as frets 2–6 while its barre is at fret 3, and the E form as 7–11 while its barre is at
  8. Both numbers are correct and they mean different things — the window is the five-fret span the
  form occupies, the barre fret is where the movable nut goes. Lessons state both and never conflate
  them.
- **The D form's upper root is at fret 13**, past the octave marker. Rather than hide it, lesson 6
  uses it to make the wrap-around concrete.
- **Six roots, three pitches.** This forced the activity's round design and is worth remembering for
  later chapters: any `note-play` round about one chord tone is capped at one position per octave.
