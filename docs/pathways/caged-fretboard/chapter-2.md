# Chapter 2 — Filling In the Chord

Chapter id `caged-fretboard.ch2` · slug `filling-in-the-chord` · 6 articles, 1 activity, 1 checkpoint.

After this chapter the learner can play a C major triad in all five positions — whole where that is
sensible, as a fragment where it is not — and can say which degree is under any finger.

**Structure decision.** Six lessons: an opener plus the five form lessons in strict C-A-G-E-D order.
There is no separate closer. The **opener carries the frame** (what a triad is, what the diagram
actually draws, and the barre-versus-fragment principle stated as a principle), and the **D form
lesson closes the chapter** — it teaches the D form's own character and then joins the five forms up.
That split was chosen because the chapter's biggest idea (which forms are worth barring whole) has to
arrive *before* the form lessons, or each lesson has to re-argue it; while the join-up material —
the interlock in chord tones — only makes sense *after* all five have been seen. The D form is the
smallest form and the lightest lesson otherwise, so it has room to carry the ending.

---

## Verified facts this chapter is built on

Computed from the app's own `cagedMarks` / `CAGED_FORM_OFFSETS`
(`mobile/src/lib/guitar-positions/caged.ts`) and standard-tuning MIDI, not from the web. **These are
the numbers every lesson must use.** String numbering is **1 = high e, 6 = low E** everywhere.

### The critical thing about the diagram

`caged-shape` with `show: "triad"` marks **every** `1`, `3` and `5` inside the five-fret window —
not one playable voicing. The component's own comment says so: *"deliberately 'everything in the
window', not one playable voicing."* So the diagram always has **more dots than the grip**, and a
lesson that says "here is the shape, six notes" while the diagram shows seven or eight has
contradicted itself on screen.

This is not a problem to work around. It is the chapter's best asset: the window holding more chord
tones than one hand can hold is *why* fragments are the normal case. **The opener explains the
convention once, and every form lesson names its window's dots and then names which of them the grip
actually takes.**

### Every form: window dots, and which of them the grip plays

`1` = `C`, `3` = `E`, `5` = `G` throughout. "Grip" is the voicing from the pathway brief.

**C form** — barre 0 (open), window `0–4`. Eight dots, the most of the five.

| string · fret | degree | note | in the grip? |
| --- | --- | --- | --- |
| 6·0 | `3` | `E` | no |
| 6·3 | `5` | `G` | no |
| 5·3 | `1` | `C` | yes |
| 4·2 | `3` | `E` | yes |
| 3·0 | `5` | `G` | yes |
| 2·1 | `1` | `C` | yes |
| 1·0 | `3` | `E` | yes |
| 1·3 | `5` | `G` | no |

Grip = open C, `x 3 2 0 1 0`, degrees `x 1 3 5 1 3`. Roots on strings 5 and 2.

**A form** — barre 3, window `2–6`. Seven dots.

| string · fret | degree | note | in the grip? |
| --- | --- | --- | --- |
| 6·3 | `5` | `G` | no |
| 5·3 | `1` | `C` | yes |
| 4·2 | `3` | `E` | no |
| 4·5 | `5` | `G` | yes |
| 3·5 | `1` | `C` | yes |
| 2·5 | `3` | `E` | yes |
| 1·3 | `5` | `G` | yes |

Grip = `x 3 5 5 5 3`, degrees `x 1 5 1 3 5`. Roots on strings 5 and 3.

**G form** — barre 5, window `4–8`. Seven dots.

| string · fret | degree | note | in the grip? |
| --- | --- | --- | --- |
| 6·8 | `1` | `C` | yes |
| 5·7 | `3` | `E` | yes |
| 4·5 | `5` | `G` | yes |
| 3·5 | `1` | `C` | yes |
| 2·5 | `3` | `E` | yes |
| 2·8 | `5` | `G` | no |
| 1·8 | `1` | `C` | yes |

Grip = `8 7 5 5 5 8`, degrees `1 3 5 1 3 1`. Roots on strings 6, 3 and 1. The barre at fret 5 covers
strings 4, 3 and 2 only; string 5 is at fret 7 and strings 6 and 1 at fret 8 — a four-fret span with
the pinky on both outer strings.

**E form** — barre 8, window `7–11`. Seven dots.

| string · fret | degree | note | in the grip? |
| --- | --- | --- | --- |
| 6·8 | `1` | `C` | yes |
| 5·7 | `3` | `E` | no |
| 5·10 | `5` | `G` | yes |
| 4·10 | `1` | `C` | yes |
| 3·9 | `3` | `E` | yes |
| 2·8 | `5` | `G` | yes |
| 1·8 | `1` | `C` | yes |

Grip = `8 10 10 9 8 8`, degrees `1 5 1 3 5 1`. Roots on strings 6, 4 and 1.

**D form** — barre 10, window `9–13`. Seven dots.

| string · fret | degree | note | in the grip? |
| --- | --- | --- | --- |
| 6·12 | `3` | `E` | no |
| 5·10 | `5` | `G` | no |
| 4·10 | `1` | `C` | yes |
| 3·9 | `3` | `E` | no |
| 3·12 | `5` | `G` | yes |
| 2·13 | `1` | `C` | yes |
| 1·12 | `3` | `E` | yes |

Grip = `x x 10 12 13 12`, degrees `x x 1 5 1 3`. Roots on strings 4 and 2. Four strings at most.

### Which forms are worth barring whole — the chapter's spine

Verified against the hands, and against the literature (D'Addario, Premier Guitar, HubGuitar,
guitar-chord.org all agree, and the brief's convention wins where they don't):

| Form | Full barre? | Why | How it is actually played |
| --- | --- | --- | --- |
| C | no | Barre at `n`, and the root — the highest fretted note — is at `n+3`. Three frets past the barre, on string 5. | Top four strings, or strings 3-2-1 |
| A | **yes** | Barre at `n`, nothing further than `n+2`. | Whole. The barre chord almost everyone already owns. |
| G | no | Barre covers three strings at `n`; string 5 at `n+2`; strings 6 and 1 at `n+3`. Widest of the five. | Bottom three, or the middle three at the barre |
| E | **yes** | Barre at `n`, nothing further than `n+2`. | Whole. The most-used barre on the instrument. |
| D | no | Only four strings carry it at all, and string 2 sits a fret past strings 3 and 1. | Top three or four strings, from the start |

**Two of the five are full barres. Three are fragment shapes.** That is the principle, and it is the
thing that stops learners quitting CAGED. State it plainly; never as an apology.

### The overlaps, in chord tones — the closer's strongest fact

Chapter 1 asserted the interlock more than it argued it. Here it can be argued, because **every
overlap between neighbouring windows contains a complete `1 3 5`**:

| Overlap | Frets | Dots inside it | Complete triad? |
| --- | --- | --- | --- |
| C ∩ A | 2–4 | 6·3 `5`, 5·3 `1`, 4·2 `3`, 1·3 `5` | yes |
| A ∩ G | 4–6 | 4·5 `5`, 3·5 `1`, 2·5 `3` | yes — three adjacent strings, all at fret 5 |
| G ∩ E | 7–8 | 6·8 `1`, 5·7 `3`, 2·8 `5`, 1·8 `1` | yes |
| E ∩ D | 9–11 | 5·10 `5`, 4·10 `1`, 3·9 `3` | yes — three adjacent strings |
| D ∩ C (fret 12) | 12–13 | 6·12 `3`, 3·12 `5`, 2·13 `1`, 1·12 `3` | yes |

Two of the five overlaps are three adjacent strings and are therefore directly playable little
triads: **strings 4-3-2 all at fret 5** (`5 1 3`), which is the middle of the A-form barre *and* the
middle of the G-form barre — the same three notes in two forms' grips; and **strings 5-4-3 at frets
10, 10, 9** (`5 1 3`), inside the E form. Note that the two look different because the second
crosses nothing and the first does not either — the fret offsets differ because strings 3 and 2 are
a major third apart. That is the B-string irregularity showing up in chord tones rather than in
octaves, which is new.

### The power-chord core

`1 5 1` on strings 6-5-4 (E form: 6·8, 5·10, 4·10) and on strings 5-4-3 (A form: 5·3, 4·5, 3·5) is
the power chord every player already owns — the two full-barre forms each contain one. This is worth
saying because it explains *why* those two forms feel natural, and it is guitar-specific.

### The third

- The `3` is the note that decides major or minor. Lower it a fret and the chord is minor.
- In the **A form grip**, exactly one note is the `3` — string 2, fret 5. Move that one finger back a
  fret and `x 3 5 5 5 3` becomes `x 3 5 5 4 3`, the A-shape minor barre. One note.
- In the **E form grip**, exactly one note is the `3` — string 3, fret 9. Five of its six strings are
  `1` or `5`. The entire major-ness of the most-used chord on the guitar rests on one string.
- In the **D form grip**, the `3` is the **top** note (string 1) — the reason the D shape reads bright
  and is the go-to for a high voicing.
- In the **G form grip**, the top three strings are `1 3 1` — no fifth at all, and still
  unambiguously major, because the `3` is there. This is the cleanest illustration in the chapter of
  "the third is the note a fragment keeps".
- **Minor CAGED is out of scope.** Naming the one finger that flips one grip is allowed exactly once
  (the A form lesson) and must not become a lesson about minor forms.

---

## The lessons

Six articles, in order. Slugs are fixed by the brief. Section ids are progress keys: never renamed.

Every article: `schemaVersion: 1`, `publishedAt: "2026-08-11"`, `tags: ["caged", "fretboard"]`,
`readingTimeMin` = ceil(words ÷ 200), floor 2. `meta.slug` equals the filename stem. The title is
`meta.title` and the article does **not** open with a heading.

---

### 1. `caged-thirds-and-fifths` — "Two More Notes, the Same Five Windows"

- **Section id**: `caged-fretboard.ch2.thirds-and-fifths` · **Article id**: `art_caged-thirds-and-fifths`
- **Length**: 550–700 words
- **Left by chapter 1**: five windows for `C` (C 0–4, A 2–6, G 4–8, E 7–11, D 9–13); every root in
  each; the octave shapes; the ladder and the interlock; the barre as a movable nut; and an explicit
  promise that no new shape will ever be asked for.
- **The one thing it teaches**: the frame — a major triad is `1 3 5` and nothing else, the diagram
  lights every one of them in the window, and only two of the five forms are worth barring whole.
- **The misconception it corrects**: "I have to learn five new barre chords."

**Key points, in order**

1. Cash the promise chapter 1 made, in the first paragraph. No new shapes. The same five windows,
   two more notes in each. The learner is seeing more of what they already have.
2. A major triad is three notes: `1`, `3`, `5`. In C that is `C`, `E`, `G`. **Every** C major chord
   anywhere on this neck is those three notes and nothing else — six strings, three notes, so notes
   get doubled. That is why a form's degrees read like `1 5 1 3 5 1` rather than `1 3 5`.
3. The `3` is the note that decides major or minor: lower it a fret and the chord turns minor.
   One sentence. Say that it is the note worth being able to point at, because it is the note a
   fragment keeps. Do **not** go further — minor forms are a different pathway.
4. **The diagram convention, explained once for the whole chapter.** `caged-shape` at
   `show: "triad"` lights every `1`, `3` and `5` in the window — more notes than a hand can hold at
   once. The window is the territory; the chord you play is a route through it. Say it plainly here
   so no later lesson has to.
5. The `live` block: `caged-shape` `{ "root": "C", "form": "A", "show": "triad" }`. Tie it back
   explicitly to the A form's two-dot roots diagram in
   [`caged-roots-a-form`](article link) — the same window, the same two lit roots, five more dots
   around them.
6. **The principle**, given a `table` and a `warning` callout: the A and E forms are the two full
   barres real players use; the C, G and D forms live as two- and three-string fragments most of the
   time. That is not a shortcut. Trying to barre all five is the thing that makes people quit CAGED.
   Table columns: *Form* / *How it is actually played* — keep the cells to a few words.
7. Close: the C form is next, and it is the one that shows why fragments exist.

**Blocks / components**

- `live` · `caged-shape` · `{ "root": "C", "form": "A", "show": "triad" }` — at point 5.
- `table` — form vs how it is actually played (point 6).
- One `callout` (`warning`): don't try to barre all five.
- Article link to `caged-roots-a-form`; screen link to `/scale-visualizer`; article link to
  `caged-triad-c-form` at the close.

**Do not**: name `2`, `4`, `6` or `7`, or call anything "the notes in between"; teach any form's dot
positions (that is each form lesson's job); transpose out of C; teach minor.

---

### 2. `caged-triad-c-form` — "The C Form: Where Fragments Come From"

- **Section id**: `caged-fretboard.ch2.triad-c-form` · **Article id**: `art_caged-triad-c-form`
- **Length**: 500–650 words
- **Left by the opener**: a triad is `1 3 5`; the diagram lights the whole window; two forms bar
  whole and three do not.
- **The one thing it teaches**: the C form's eight window dots, the grip `x 1 3 5 1 3` inside them,
  and the exact geometric reason the full barre is impractical — the root is three frets past the
  barre.
- **The misconception it corrects**: "the open C chord is easy, so the C form is easy."

**Key points, in order**

1. Open on the honest complication: for C major the C form *is* the open C chord, and it is easy —
   because the nut is doing the barring for free. Move it anywhere else and the problem appears.
2. The grip, string by string: `5·3` `1`, `4·2` `3`, `3·0` `5`, `2·1` `1`, `1·0` `3` — degrees
   `x 1 3 5 1 3`, low E muted. Name the notes too: `C`, `E`, `G`, `C`, `E`.
3. The window has three more dots the grip doesn't take: `6·0` `3`, `6·3` `5`, `1·3` `5`. This is the
   opener's convention landing in a real window for the first time — eight dots, five played.
4. **Why the barre fails, precisely.** Barre at fret `n` and the notes land at `n+3` (string 5, the
   root), `n+2` (string 4), `n` (string 3), `n+1` (string 2), `n` (string 1). The highest fretted
   note is three frets past the barre, and it is the root, so it cannot be dropped. Give the worked
   example: the C form barred at fret 5 is `x 8 7 5 6 5`, an `F`. That is chapter 1's own example,
   now with degrees on it.
5. **The fragments, named and useful.** Strings 4-3-2 (`3 5 1`) and strings 3-2-1 (`5 1 3`) — two
   compact three-string triads out of the same window. And the standard practical dodge on the
   barred version: skip string 1. Present these as the normal way to play the form.
6. The `3`s are `4·2` and `1·0` — both `E`. Point them out by name; the learner should be able to put
   a finger on the note that makes this chord major.
7. Close: the A form, the first of the two you hold whole.

**Blocks / components**

- `live` · `caged-shape` · `{ "root": "C", "form": "C", "show": "triad", "caption": "…" }` — caption
  naming the grip, e.g. "Eight chord tones in the window; the open C chord plays five of them."
- A `list` or short `table` for the grip's degrees string by string.
- One `callout` (`tip`) for the fragments.
- Screen link to `/chord-shapes`; article link to `caged-triad-a-form` at the close.

---

### 3. `caged-triad-a-form` — "The A Form: The Barre You Already Own"

- **Section id**: `caged-fretboard.ch2.triad-a-form` · **Article id**: `art_caged-triad-a-form`
- **Length**: 600–750 words. **This lesson is deliberately one of the longest** — chapter 1's A form
  lesson was the thinnest of its five and this chapter is correcting that.
- **Left by the C form**: window dots versus grip; fragments as the normal case; the `3` is the note
  that makes it major.
- **The one thing it teaches**: the degree map of a chord the learner already plays every day —
  `x 1 5 1 3 5` — and that its quality hangs on exactly one string.
- **The misconception it corrects**: "I already know the A-shape barre, so there is nothing here."

**Key points, in order**

1. This is the barre chord almost everyone already owns. The point is not the grip; it is what is
   inside it, which nobody was ever told.
2. Why it holds whole: barre at fret 3, nothing further than fret 5. Two frets past the barre at
   most. Contrast in one clause with the C form's three, and move on.
3. The grip: `5·3` `1`, `4·5` `5`, `3·5` `1`, `2·5` `3`, `1·3` `5` — degrees `x 1 5 1 3 5`.
4. **The surprise: the top string is the `5`, not the root.** Most players assume a barre chord's
   highest note is a root because the E form's is. Here it is `G`. Worth a sentence of its own.
5. **The power-chord core.** `5·3`, `4·5`, `3·5` is `1 5 1` — `C`, `G`, `C`. That is the power chord
   with an A-string root, sitting inside the barre you already play. Say that this is why the form
   feels natural: you have been playing three of its five notes for years.
6. **Exactly one note is the `3`: string 2, fret 5.** Move that finger back one fret and
   `x 3 5 5 5 3` becomes `x 3 5 5 4 3` — the A-shape minor barre. One note decides the whole chord's
   quality. This is the chapter's clearest demonstration of the third's job. Keep it to a short
   paragraph; do not teach minor forms.
7. The window's two extra dots: `6·3` `5` and `4·2` `3`, the second sitting *below* the barre — in
   the window, out of reach of the grip. A one-sentence reminder that the window is bigger than the
   chord.
8. Send them to `/chord-detector`: play the barre, then move that one finger, and watch the screen
   change its mind.
9. Close: the G form, the one that gets played in pieces.

**Blocks / components**

- `live` · `caged-shape` · `{ "root": "C", "form": "A", "show": "triad", "caption": "…" }`.
- A `list` or short `table` for the grip's degrees string by string.
- One `callout` (`tip`): the `3` is on string 2; it is the only one; it is what makes this major.
- Screen link to `/chord-detector`; article link to `caged-triad-g-form` at the close.

**Note for the agent**: the opener already showed this same diagram once. Do not treat that as a
reason to be brief — the opener used it to demonstrate a *window filling in*, and said nothing about
this form's degrees. Show it again and do the work.

---

### 4. `caged-triad-g-form` — "The G Form: Played in Pieces"

- **Section id**: `caged-fretboard.ch2.triad-g-form` · **Article id**: `art_caged-triad-g-form`
- **Length**: 550–700 words
- **Left by the A form**: `x 1 5 1 3 5`; the `1 5 1` power-chord core; one note decides major or
  minor.
- **The one thing it teaches**: the widest form is the one you never hold whole, and its pieces are
  each good for something specific — including a top fragment with no fifth in it at all.
- **The misconception it corrects**: "a fragment is an incomplete chord" / "if I can't hold it, I
  can't use it."

**Key points, in order**

1. The G form of `C`: barre 5, window `4–8`, degrees `1 3 5 1 3 1` on all six strings. Three roots —
   strings 6, 3 and 1 — which chapter 1 already established; the new information is what sits
   between them.
2. **Why it will not be held whole, exactly.** The barre at fret 5 covers strings 4, 3 and 2 only.
   String 5 is at fret 7 and strings 6 and 1 are at fret 8: a four-fret span with the little finger
   asked to hold two non-adjacent strings. This is the hardest of the five and the literature agrees.
3. **The pieces, each with a job.**
   - Bottom three (`6·8` `1`, `5·7` `3`, `4·5` `5`): a full triad walking *back* down the frets as it
     climbs the strings. Good for the bottom of a progression.
   - Middle three, all at fret 5 (`4·5` `5`, `3·5` `1`, `2·5` `3`): one finger, three strings, a
     complete triad. The most useful three notes in the form.
   - Top three (`3·5` `1`, `2·5` `3`, `1·8` `1`): `1 3 1` — **no fifth at all**, and still
     unmistakably major, because the `3` is there. This is the chapter's sharpest illustration that
     the third is the note a fragment keeps. Give it its own paragraph.
4. The window's spare dot, `2·8` `5`, is not in the grip. Mention it in a clause.
5. Character, tied to the chord tones rather than restated from chapter 1: three roots plus a chord
   tone on every single string means this window shows you the chord's whole range at a glance —
   which is exactly why it is worth *seeing* even though it is not worth *holding*.
6. Close: the E form, the one you do hold whole.

**Blocks / components**

- `live` · `caged-shape` · `{ "root": "C", "form": "G", "show": "triad", "caption": "…" }`.
- A `table` for the three fragments: strings · frets · degrees · what it is for. Keep cells short.
- One `callout` (`info` or `tip`): a `1` and a `3` are enough to say major — the `5` is the note you
  can afford to lose.
- Screen link to `/chord-shapes`; article link to `caged-triad-e-form` at the close.

---

### 5. `caged-triad-e-form` — "The E Form: One String Makes It Major"

- **Section id**: `caged-fretboard.ch2.triad-e-form` · **Article id**: `art_caged-triad-e-form`
- **Length**: 550–700 words
- **Left by the G form**: fragments as complete musical objects; a `1 3` dyad already says major.
- **The one thing it teaches**: the degree map `1 5 1 3 5 1` — five of the six strings are `1` or
  `5`, so the whole quality of the most-used chord on the guitar rests on string 3.
- **The misconception it corrects**: "a barre chord is six different notes."

**Key points, in order**

1. The E form of `C`: barre 8, window `7–11`, roots on strings 6, 4 and 1 (chapter 1's `6 → 4 → 1`
   map). Degrees low to high: `1 5 1 3 5 1`.
2. **Count them.** Three `1`s, two `5`s, one `3`. Six strings, three notes — the doubling the opener
   promised, made concrete. Five of six strings are root or fifth.
3. **So the chord's whole identity is on string 3, fret 9.** That single note is the difference
   between C major and C minor here, and it is the note a listener's ear is actually tracking. This
   is the workhorse chord of the instrument and it hangs on one string.
4. The bottom three strings — `6·8` `1`, `5·10` `5`, `4·10` `1` — are `1 5 1`: the power chord with a
   low-E root. One clause tying it to the A form's own `1 5 1` on strings 5-4-3; the two full-barre
   forms each contain one, which is a large part of why they feel like home. Do not re-explain the
   power chord; the A form lesson owns it.
5. The top three strings (`3·9` `3`, `2·8` `5`, `1·8` `1`) are a complete triad — `3 5 1` — unlike
   the G form's top three. A high fragment you can grab without moving the hand.
6. The window's spare dot, `5·7` `3`, sits below the barre. One clause.
7. Why it stays the form you navigate from: the low-E root places every other chord tone in the
   window, so one note you can name gives you six you can play.
8. Close: the D form, the smallest, and where the chapter joins up.

**Blocks / components**

- `live` · `caged-shape` · `{ "root": "C", "form": "E", "show": "triad", "caption": "…" }`.
- A `list` or short `table` for `1 5 1 3 5 1`, string by string.
- One `callout` (`tip`): string 3, fret 9 is the only `3` in the shape — the one note that makes it
  major.
- Screen link to `/scale-visualizer`; article link to `caged-triad-d-form` at the close.

---

### 6. `caged-triad-d-form` — "The D Form, and the Chord Everywhere at Once"

- **Section id**: `caged-fretboard.ch2.triad-d-form` · **Article id**: `art_caged-triad-d-form`
- **Length**: 700–850 words. **This is the chapter's closer as well as a form lesson** — it is
  allowed to be the longest.
- **Left by the E form**: `1 5 1 3 5 1`; one string decides quality; complete top-three fragments.
- **The one thing it teaches**: the D form is a fragment shape from the start with the `3` on top —
  and then, as the chapter's closer, that every overlap between neighbouring windows holds a
  complete `1 3 5`.
- **The misconception it corrects**: "the five forms are five separate chords" — answered this time
  in chord tones, not in roots.

**Key points, in order**

*The form (roughly the first 45% of the lesson):*

1. The D form of `C`: barre 10, window `9–13`, grip `x x 10 12 13 12`, degrees `x x 1 5 1 3`. Four
   strings is all it has — chapter 1 already said it is never played whole, and now the reason is
   visible: there is nothing on strings 6 and 5 to play.
2. **The `3` is the top note** — `1·12`, an `E`. The only one of the five forms whose highest note is
   the third, which is why the D shape reads bright and thin and is the standard grab for a high
   voicing.
3. The B string bites again, now in chord tones rather than octaves: strings 3 and 1 sit at fret 12,
   string 2 at fret 13. Chapter 1 explained why (`G → B` is a major third); here it is the reason the
   grip is not a flat barre.
4. The three window dots the grip cannot reach — `6·12` `3`, `5·10` `5`, `3·9` `3` — and in
   particular that `5·10` and `3·9` belong to the E form's grip, not this one. That is the seam, and
   it is the bridge into the second half.

*The join-up (the rest):*

5. A `table` of all five forms: *Form* / *Degrees low → high* / *Roots on strings* / *How it is
   played*. Use the verified numbers above unchanged. This is the chapter's summary artefact.
6. **The interlock, in chord tones.** Neighbouring windows overlap, and every overlap holds a
   complete `1 3 5`. Give the table from the verified facts above. Then the two that matter most
   because they are directly playable: **strings 4-3-2, all at fret 5** (`5 1 3`) is in the A form's
   grip *and* the G form's grip — the same three notes, two forms; and **strings 5-4-3 at frets 10,
   10, 9** (`5 1 3`) sits where the E and D windows meet.
7. State what that means, plainly: you are never between forms. Wherever you stop on the neck, the
   notes under your hand belong to two windows at once, and there is always a whole chord there. That
   is the argument chapter 1 could only assert.
8. **Do not** teach how to move between forms, or run a progression up the neck. Name that chapter 5
   does it, in one clause, and stop.
9. Close with the layering promise renewed: the same five windows, and chapter 3 lights two more
   notes in each. Send them to `/scale-visualizer` to page the five positions with the chord tones
   showing, and to `/chord-detector` to play a fragment and check what comes out.

**Blocks / components**

- `live` · `caged-shape` · `{ "root": "C", "form": "D", "show": "triad", "caption": "…" }`.
- `table` — all five forms, degrees low → high.
- `table` — the five overlaps and the dots inside them.
- One `callout` (`info`) for the renewed promise at point 9.
- Screen links to `/scale-visualizer` and `/chord-detector`.

**Do not**: use `caged-ladder` here. It marks roots only, which would undercut a closer whose whole
argument is about chord tones. The two tables carry it.

---

## The activity

### `caged-play-the-chord-tones` — "Drill: Play the Chord Tones"

- **Section id**: `caged-fretboard.ch2.play-the-chord-tones` · **Activity id**:
  `act_caged-play-the-chord-tones`
- `kind: "note-play"`, `modes: ["easy", "hard"]`, document `board: { fretFrom: 0, fretTo: 13 }`.
- Section **must** set `"optional": true`.

**The duplicate-pitch constraint, worked out.** Chapter 1's drill was capped at one position per
octave because six `C`s are only three pitches (`48`, `60`, `72`). Adding `E` and `G` widens the
field a lot: the chord tones in frets 0–13 sound `40 43 48 52 55 60 64 67 72 76`. Every one of the
five grips below turns out to be pitch-distinct on its own — a guitar chord voicing ascends, so it
does not repeat a pitch — so each form's whole grip can be one round, which chapter 1 could not do.

| Round id | Prompt gist | Targets (string · fret) | Board | MIDI |
| --- | --- | --- | --- | --- |
| `r_caged-play-the-chord-tones.c-form` | The C form's grip, at the nut | 5·3, 4·2, 3·0, 2·1, 1·0 | 0–4 | 48, 52, 55, 60, 64 |
| `r_caged-play-the-chord-tones.a-form` | The A form whole, barre at 3 | 5·3, 4·5, 3·5, 2·5, 1·3 | 2–6 | 48, 55, 60, 64, 67 |
| `r_caged-play-the-chord-tones.g-fragment` | The G form's middle three, one finger at fret 5 | 4·5, 3·5, 2·5 | 4–8 | 55, 60, 64 |
| `r_caged-play-the-chord-tones.e-form` | The E form whole, barre at 8 | 6·8, 5·10, 4·10, 3·9, 2·8, 1·8 | 7–11 | 48, 55, 60, 64, 67, 72 |
| `r_caged-play-the-chord-tones.d-fragment` | The D form's top three | 3·12, 2·13, 1·12 | 9–13 | 67, 72, 76 |
| `r_caged-play-the-chord-tones.every-third` | Every `3` in the chapter, low to high, `ordered: true` | 6·0, 4·2, 3·9, 1·12 | 0–13 | 40, 52, 64, 76 |

The round set is the chapter's argument in physical form: the A and E forms are asked for whole, the
G and D forms as fragments, and the last round is the "just past it" one — pick out only the note
that makes the chord major, across the whole neck, in order.

---

## The checkpoint

`caged-fretboard-ch2-checkpoint` · section id `caged-fretboard.ch2.checkpoint` ·
`meta.kind: "checkpoint"` · `passThresholdPct: 70` on both the quiz meta and the chapter checkpoint.

To be written **after** the articles are read, from what they actually say. Sketch — 7 questions:

| # | Question id suffix | Kind | Draws on | Tests |
| - | ------------------ | ---- | -------- | ----- |
| 1 | `six-strings-three-notes` | `choice` | Opener + E form | Why a form's degrees read `1 5 1 3 5 1` |
| 2 | `c-form-barre-reach` | `choice` | C form | *Why* the C form barre fails — the root is `n+3` |
| 3 | `full-barres` | `multi-select` | Opener + A + E | Which two forms are worth barring whole |
| 4 | `a-form-third` | `choice` | A form | Which string carries the `3` in `x 1 5 1 3 5` |
| 5 | `no-fifth` | `choice` | G form | A `1 3` fragment with no fifth is still major |
| 6 | `d-form-top-note` | `choice` | D form | The D form's highest note is the `3` |
| 7 | `overlap-triad` | `choice` | D form (closer) | What is in the overlap between two windows |

Every question gets an `explanation`. `multi-select` is graded all-or-nothing, so Q3 asks only for a
fact the chapter states completely and explicitly.

---

## As built — final word counts

| Lesson | Words | `readingTimeMin` | `estimatedMin` in the curriculum |
| ------ | ----- | ---------------- | -------------------------------- |
| `caged-thirds-and-fifths` | 640 | 4 | 5 |
| `caged-triad-c-form` | 567 | 3 | 4 |
| `caged-triad-a-form` | 677 | 4 | 5 |
| `caged-triad-g-form` | 673 | 4 | 5 |
| `caged-triad-e-form` | 606 | 4 | 5 |
| `caged-triad-d-form` | 726 | 4 | 5 |
| `caged-play-the-chord-tones` (activity) | — | — | 8 (optional) |

Chapter total, counted sections only: **29 minutes**; 37 including the optional drill. The pathway's
`estimatedMin` was left at its placeholder, as chapter 1 did — the top-level agent recomputes it at
the end.

## The checkpoint as built — 8 questions

| # | Question id suffix | Kind | Draws on | Tests |
| - | ------------------ | ---- | -------- | ----- |
| 1 | `full-barres` | `multi-select` | Opener, A form, E form | Which two forms hold as a full barre (`A`, `E`) |
| 2 | `c-form-barre-reach` | `choice` | C form | *Why* the C form barre fails — the root sits at `n+3` |
| 3 | `c-form-fragment` | `fretboard` | C form | Mark the strings 3-2-1 fragment (`3·0`, `2·1`, `1·0`), `frets: 5` |
| 4 | `a-form-minor-flip` | `choice` | A form | Which note flips `x 3 5 5 5 3` to minor — string 2, fret 5 |
| 5 | `g-form-no-fifth` | `choice` | G form | A `1 3 1` fragment with no fifth is still unambiguously major |
| 6 | `e-form-arithmetic` | `choice` | Opener + E form | Three roots, two fifths, one third — the doubling, and the one string that decides quality |
| 7 | `d-form-top-note` | `choice` | D form | The D form is the only form whose top note is the `3` |
| 8 | `overlap-triad` | `choice` | D form (closer) | Strings 4-3-2 at fret 5 is a whole chord in two forms' grips at once |

Question 6 absorbed a planned separate "six strings, three notes" question from the opener, because
the E form lesson states the doubling more concretely than the opener does and one question can
carry both. Question 3 was added over the seven-question sketch so the chapter has a "show me where"
question and so the fragment idea gets tested physically rather than only described.

Every question has an `explanation`. `multi-select` and `fretboard` are both graded
all-or-nothing, so Q1 and Q3 only ask for facts the chapter states explicitly and completely.

## Judgement calls recorded here

- **The opener carries the frame; the D form lesson closes.** Reasons in the header above.
- **`show: "triad"` draws the whole window, not the grip.** This is the single most important
  discovery of the chapter and it was not in the brief. `cagedMarks` is explicitly "everything in the
  window, not one playable voicing", so every diagram has 7–8 dots where the voicing has 4–6. Rather
  than work around it, the opener states the convention once and every form lesson names its window's
  spare dots. It turned the fragment principle from an assertion into something visible.
- **The A form lesson was given the minor flip**, not the E form, even though the E-shape minor barre
  is the more famous one. The A form was chapter 1's thinnest lesson and needed the weight, and its
  `3` sits in the less obvious place (string 2). The E form lesson instead got the arithmetic — three
  roots, two fifths, one third — which turned out to be the exact mirror of the G form's
  `1 3 5 1 3 1` (three roots, two thirds, one fifth). That mirror is not in the brief; it was
  computed here and is the sharpest thing either lesson says.
- **The opener shows the A form**, which the A form lesson then shows again. The duplication is
  deliberate: the opener uses it to demonstrate a window *filling in* against chapter 1's roots
  diagram, and says nothing about the form's degrees.
- **`caged-ladder` is used nowhere in this chapter.** It marks roots only, so it would have
  undercut a closer whose whole argument is in chord tones. Two tables carry it instead.
- **Minor is named exactly twice** — once in the opener as a one-sentence definition of what the `3`
  does, once in the A form lesson as the single finger that moves. Minor CAGED stays out of scope.
- **The activity's rounds encode the chapter's argument**: the A and E forms are asked for whole, the
  G and D forms as fragments, and the last round picks out only the `3` across the whole neck.
