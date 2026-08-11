# Learn the Fretboard with CAGED

The brief every chapter agent inherits. Read it end to end before planning your chapter, and read
`LEARNING_CREATION.md` before writing anything.

- **Pathway id / slug**: `path_caged-fretboard` / `caged-fretboard`
- **Difficulty**: `core`
- **Anchor key**: C major, everywhere, until chapter 5 teaches transposing
- **Chapters**: 5

---

## Topic mastery

### The system, from first principles

An open chord shape is not "the C chord". It is a fixed geometric arrangement of root, third and
fifth across the strings, which happens to spell C because open strings put its root at fret 3 of
the fifth string. Replace the nut with a barre — a movable nut — and the arrangement becomes
portable. Slide it up two frets and the same geometry sounds a whole step higher.

That much most learners already have. The system is the second claim, and it is a different one:

**The five shapes are not five alternatives for one chord. They are five consecutive windows that
tile the neck, in the fixed cyclic order C → A → G → E → D, wrapping forever.** For any one chord
all five exist somewhere, at fixed distances set by where that chord's root falls, and they
interlock — the notes at the top of one window are the bottom of the next. That overlap is what
makes the neck continuous instead of five boxes, and it is the single most under-taught part of
the system.

For C major, the ladder is:

| Form | Barre fret | Roots on strings | Degrees, low E → high e |
| ---- | ---------- | ---------------- | ----------------------- |
| C    | 0 (open)   | 5, 2             | `x 1 3 5 1 3`           |
| A    | 3          | 5, 3             | `x 1 5 1 3 5`           |
| G    | 5          | 6, 3, 1          | `1 3 5 1 3 1`           |
| E    | 8          | 6, 4, 1          | `1 5 1 3 5 1`           |
| D    | 10         | 4, 2             | `x x 1 5 1 3`           |
| C    | 12         | —                | the octave; the ladder restarts |

This is the app's own model. `mobile/src/lib/guitar-positions/windows.ts` defines `CAGED_WINDOWS`
as fret offsets from the root's position on the low E string, and its header comment names exactly
this ladder: "C form at the nut, A form at 3, G form at 5, E form at 8, D form at 10." Content and
app agree by construction — keep it that way.

Note that the **G and E forms carry three roots each**; C, A and D carry two. That is not trivia:
it is why the E form is the backbone every player navigates from, and why the G form is the widest
and most awkward to hold whole.

### The layering that structures this pathway

Every chapter fills **the same five windows** with more notes. The layers nest exactly, and that
nesting is the spine of the whole pathway:

| Chapter | Layer            | Degrees             | Adds        |
| ------- | ---------------- | ------------------- | ----------- |
| 1       | Roots            | `1`                 | —           |
| 2       | Chord tones      | `1 3 5`             | `3`, `5`    |
| 3       | Major pentatonic | `1 2 3 5 6`         | `2`, `6`    |
| 4       | Major scale      | `1 2 3 4 5 6 7`     | `4`, `7`    |

The learner is never asked to learn a new shape after chapter 1 — only to see more of the shape
they already have. Say this out loud in the content; it is the reason the pathway is structured
this way and it is reassuring at exactly the moment a learner starts to feel buried.

**Chapter 3 is the *major* pentatonic**, and it has to be — minor pentatonic's `b3` and `b7` are
not in a major shape at all, so it would break the nesting. The obvious objection ("but the
pentatonic I know is minor") dissolves on the relative minor: C major pentatonic and A minor
pentatonic are the same five pitch classes. Handle that once, in a footnote, and move on.

### The misconceptions to build against

In order of how much damage they do. A lesson built against one of these is a good lesson; a
lesson built around a definition is not.

1. **"The letter names the chord."** Playing the C form at fret 5 gives an **F**, not a C. The
   letter names the *form* — what it would be at the nut. This is the sentence learners say out
   loud, and chapter 1's opener exists to kill it.
2. **"CAGED is five ways to play a chord."** Learners who believe this memorise five barre chords,
   never learn the neck, and correctly conclude the system was a waste of time.
3. **"The five forms are separate boxes."** They overlap by design. This is what the anti-CAGED
   literature actually attacks — the box-locked soloist with audible seams between positions — and
   the criticism is fair against bad CAGED teaching, not against the system. Chapter 5 answers it
   directly. Do not pretend it does not exist.
4. **"I have to barre all five."** The full C-form and D-form barres are wretched and the G-form
   barre is a stretch. Real players use fragments — two or three strings of a form. Teach fragments
   as the normal case, not as a concession.
5. **"CAGED, memorised as a word."** Learners know the acronym without knowing it is cyclic, that
   it runs backwards, or that it wraps at fret 12.

### What is guitar-specific

All of it. CAGED cannot exist on a keyboard. It is a consequence of standard tuning being all
fourths **except** the G→B major third, and that irregularity has to be taught explicitly rather
than worked around:

- **Octave spacings differ across the B string.** String 6 → 4 is `+2` frets; 5 → 3 is `+2`;
  4 → 2 is `+3`; 3 → 1 is `+3`. Strings 6 and 1 are two octaves apart at the *same* fret.
- **Any form crossing the B string shifts a fret.** This is where the C and D forms bite, and it is
  the reason a learner's "the shape just moves" intuition breaks.
- **The barre is a movable nut** — the whole reason open shapes become portable.
- **Everything repeats at fret 12.** Five forms tile twelve frets; past that it is the same ladder.

### What each form is actually for

Twenty of this pathway's lessons are "[layer] in the [form] form". Written lazily that is one
lesson with five diagrams, repeated four times. It is not — each form has its own character, and
**a shape lesson that does not carry its form's character is padding**:

- **C form** — roots on 5 and 2. The B-string shift shows up immediately. The full barre is
  impractical; introduce the fragment habit here, at the first opportunity.
- **A form** — roots on 5 and 3. A clean, very playable barre and the cleanest `5 → 3` octave jump
  on the neck. The friendliest of the five.
- **G form** — roots on 6, 3 and 1, three of them. The widest form and the hardest to hold whole;
  in practice it is played in pieces. Its three roots make it the best form for *seeing* where a
  chord lives across all six strings.
- **E form** — roots on 6, 4 and 1. The most-used barre on the instrument, and its `6 → 4 → 1` root
  map is the backbone every other form is located from.
- **D form** — roots on 4 and 2. The smallest, essentially never played whole, a fragment shape
  from the start. The B-string shift bites again.

### Where the sources disagree

- **Teaching order.** There is no consensus on which form to teach first; many teachers open on the
  E or A form because learners half-know them as barre chords. **This pathway uses strict C-A-G-E-D
  order** — the sequence is never violated, and the acronym is never a mnemonic detached from the
  neck. Hold that convention.
- **"Shape" vs "form".** Both are current in the literature. **This pathway says "form"**, because
  that is what the app's position pager says (`SYSTEM_LABELS`, `Position.label` → "E form"). Name
  "shape" once as the common synonym so the learner recognises it elsewhere, then use "form".
- **Whether CAGED is good pedagogy at all.** A real and loud debate. The honest answer, which
  chapter 5 should give: the criticism lands on players who only ever move *vertically* inside one
  window, and the fix is horizontal playing through the overlaps — not abandoning the map.

---

## Audience and prerequisites

A player who **can already barre and cannot navigate the neck**. Assume:

- E-shape and A-shape barre chords work physically. Barring is not taught here.
- Open chords are fluent.
- They can find notes on the low E and A strings, slowly, by counting.
- They know what a root, third and fifth are, and what "major scale" means.

Do **not** assume: any ability to name a note above fret 5 quickly, any theory beyond triads, any
prior CAGED exposure, or any pentatonic box knowledge.

The pathway teaches the *map*, never the technique.

---

## Out of scope

Named here so no chapter quietly annexes them:

- **Minor CAGED** and minor forms. A follow-up pathway.
- **Seventh chords, extensions, and any four-note harmony.** Triads only.
- **Modes.** The word should not appear.
- **Three-notes-per-string scales** — the app's `nps` system. Chapter 4 may mention that the
  visualizer offers it, and must not teach it.
- **The conventional pentatonic Box 1–5 numbering.** A *different* five-window tiling
  (`PENTATONIC_WINDOWS` in `windows.ts`), and conflating it with CAGED is a real trap. Chapter 3
  names the distinction once, in a callout, and otherwise stays in CAGED windows.
- **Alternate tunings.** Standard tuning only; the whole system depends on it.
- **Picking technique, speed, sweeping, and any right-hand mechanics.**

---

## The arc

Chapters 1–4 run **strict C-A-G-E-D order**: an opener, five form lessons, and a closer that joins
that layer's five forms into one picture. Chapter 5 leaves the boxes.

**Chapter 1 — Where the roots are** (7 lessons)
After it, the learner can find every C on the neck without counting, and knows that the letter
names the form rather than the chord. Opens on misconception 1. Then roots of the C, A, G, E and D
forms in order, then the root ladder as a single memorised picture.

**Chapter 2 — Filling in the chord** (6 lessons)
After it, the learner can play a C major triad in all five positions, whole where that is sensible
and as a fragment where it is not, and can say which degree is under any finger. Introduces
fragments as the normal case.

**Chapter 3 — The major pentatonic in each form** (6 lessons)
After it, the learner can play the C major pentatonic in any of the five windows and knows which
of its notes are chord tones — the difference between running a scale and playing over a chord.

**Chapter 4 — The whole major scale** (7 lessons: opener, five forms, **a separate closer**)
After it, the learner can play C major anywhere on the neck and knows the role of every note in the
window, including the two the pentatonic left out and why they behave differently.

The extra lesson is a correction, not a change of scope. Chapters 2 and 3 each folded the
join-up into the D form lesson and both reported the same casualty: the D form's own character got
squeezed, and in chapter 3 the checkpoint ended up testing the closer's material rather than the D
form's. Chapter 1 used a separate closer and had no such problem. Seven is inside the 4–8 rule, so
chapters 4 and 5 get one.

**Chapter 5 — Off the boxes** (6 lessons)
After it, the learner can move between adjacent forms through the notes they share, play
horizontally along a string set instead of vertically inside one window, run a real progression up
the neck, and transpose the entire ladder to any key. This is where the box-trap criticism is
answered head-on.

---

## Conventions

Hold all of these. A chapter that breaks one costs the pathway its consistency.

| Thing | Convention |
| ----- | ---------- |
| String numbering | **1 = high e, 6 = low E.** Matches the app everywhere, and the quiz `fretboard` and activity `note-play` schemas. |
| The five shapes | Called **forms** — "the E form". Name "shape" once, in chapter 1, as the synonym found elsewhere. |
| Form letters | Capital, bare: the `C` form, the `A` form. Never "C-shape chord". |
| Accidentals | **Sharps by default** (`C#`, `G#`). Flats only when spelling a genuinely flat key, which is chapter 5 territory. |
| Degrees | `1 2 3 4 5 6 7`, altered as `b3` / `b7`, always with the `code` mark. |
| Frets | "fret 3"; the nut is "fret 0" or "open". The fret a barre sits at is the **barre fret**. |
| Positions | **Spelled out** — "string 5, fret 3" — whenever a lesson is introducing something. The compact `5·3` (string, then fret, `code` mark) is defined in chapter 1's closer and used from chapter 2 on, where positions arrive thick enough that spelling every one out is unreadable. Ratified as a deliberate progression: a chapter may use `5·3` freely, but re-state what it means the first time a chapter leans on it, since a learner may arrive at any chapter after a gap. |
| Chord names | `C` for C major. Never "Cmaj" for a triad. |
| Key | Everything is in **C major** until chapter 5. Do not quietly demonstrate in G. |
| Note names | `code` mark, scientific pitch only inside `listen` audio specs (`C4`), never in prose. |

---

## Components and screens this pathway uses

Two live components are being built for this pathway **before authoring begins**. Their catalogue
rows in `LEARNING_CREATION.md` §7.3 are the authority on their props — read that table, not this
section, when writing a `live` block.

- **`caged-shape`** — one window, one chord, dots labelled by degree, with a prop selecting which
  layer to show (`roots` / `triad` / `pentatonic` / `scale`). **One component serves all four
  layer chapters**, which is the point: the learner watches the same window fill in as they climb
  the pathway. This is the workhorse of chapters 1–4 and every form lesson should use it.
  **It draws every note of the layer inside the window, not one playable grip** — so at
  `show: "triad"` a window carries seven or eight dots where a hand holds four to six. That is
  deliberate (which notes a hand can reach at once is `/chord-shapes`'s question), but a lesson
  that describes the diagram as a chord shape will contradict its own picture. Chapter 2 handles
  this by stating the convention once in its opener and naming each window's spare dots; do the
  same, or say why not.
- **`caged-ladder`** — the whole neck with all five windows for one chord, showing the tiling and
  the overlaps. For chapter closers and chapter 5.

`scale-compare` also exists and is a poor fit here; do not reach for it without a reason.

Screens:

| Href | Used for |
| ---- | -------- |
| `/scale-visualizer` | **The primary destination.** Its default position system is `caged` and its pager labels are the same "E form" names this pathway uses. Send the learner here constantly. |
| `/chord-shapes` | Every voicing of a chord — good for "and here is the fragment version". |
| `/drone` | A sustained C to play the window against. Chapters 3–4. |
| `/metronome` | Rhythm activities. |
| `/chord-detector` | "Play it and check you got the right chord" — chapters 2 and 5. |

Anything not in `LEARNING_CREATION.md` §7.3 / §7.4 does not exist. If a lesson wants a widget that
is not there, **do not build it** — write the lesson with what exists and report the request
upward, per §6.

---

## Naming and ids

Fixed here so parallel agents cannot collide. Section ids are progress keys and are **never**
renamed once published.

| Thing | Pattern | Example |
| ----- | ------- | ------- |
| Chapter id | `caged-fretboard.ch<N>` | `caged-fretboard.ch2` |
| Section id | `caged-fretboard.ch<N>.<name>` | `caged-fretboard.ch2.triad-g-form` |
| Ch1 article slug | `caged-roots-<letter>-form` | `caged-roots-g-form` |
| Ch2 article slug | `caged-triad-<letter>-form` | `caged-triad-g-form` |
| Ch3 article slug | `caged-pentatonic-<letter>-form` | `caged-pentatonic-g-form` |
| Ch4 article slug | `caged-scale-<letter>-form` | `caged-scale-g-form` |
| Opener / closer / ch5 slug | `caged-<name>` | `caged-root-ladder` |
| Checkpoint slug | `caged-fretboard-ch<N>-checkpoint` | `caged-fretboard-ch3-checkpoint` |
| Activity slug | `caged-<name>` | `caged-find-every-c` |

Article ids are `art_<slug>`, quiz ids `quiz_<slug>`, activity ids `act_<slug>`. `publishedAt` is
the date the chapter is written. `passThresholdPct` is 70 everywhere, on both the quiz `meta` and
the chapter `checkpoint`.

Every document slug lives in one flat namespace across every pathway that will ever ship — hence
the `caged-` prefix on everything, without exception.

---

## Open questions resolved with the user

- **Audience** — assumes barre chords already work; the pathway is the map, not the technique.
- **Order** — strict C-A-G-E-D, not the more common "E and A first" practical order.
- **Layering** — roots → chord tones → major pentatonic → major scale, cycling all five forms at
  each layer, rather than teaching one form completely before moving to the next.
- **Scope** — major forms plus scale windows. Minor forms are a follow-up pathway.
- **Anchor key** — C major throughout, transposition deferred to chapter 5.
- **Connecting the forms** — its own chapter (5) rather than folded into each chapter.
- **Live components** — two are being built (`caged-shape`, `caged-ladder`) rather than authoring
  around the gap. Article rendering previously had no way to draw a neck at all.
- **Pentatonic positions in the app** — `systemsFor()` is being changed so 5-note scales also offer
  the `caged` system. Without it, chapter 3 would say "C form" while `/scale-visualizer` said
  "Box 1" for the same notes.
- **Size** — accepted at roughly 30 lessons. The known risk is that the twenty form lessons read as
  one lesson repeated; see "What each form is actually for" above, which is the mitigation and is
  binding on every chapter agent.
