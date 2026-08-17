# Chapter 1 — What a Mode Actually Is

Chapter id `modes.ch1` · slug `what-a-mode-is` · 6 articles, 1 activity, 1 checkpoint.

After this chapter the learner can say what makes A Dorian _A Dorian_ rather than G major, knows
they already play two modes, can hold a drone and hear one set of notes change its mind, knows which
of the two derivations answers which question, and knows that a mode dies when the harmony starts
moving. Kills misconceptions 1, 2 and 3.

This is the chapter that ties the pathway to `caged-fretboard` and `minor-caged`, and it spends the
"you already own every shape" news immediately rather than saving it.

Anchor root is **A** everywhere. String numbering is **1 = high e, 6 = low E**.

---

## Verified facts this chapter is built on

Everything below was **recomputed from the app's own code**, not remembered. `buildScale('A', id)`
and `SCALE_TYPES` from `mobile/src/lib/scale-library/`; `cagedFormWindows` / `cagedFillMarks` from
`mobile/src/lib/guitar-positions/caged.ts`; `estimateKey` from `mobile/src/lib/key-analysis/`.
**These are the numbers every lesson must use.**

### The seven on A — exactly what the app prints

**The rows below are in brightness order, because that is the order the pathway brief tabulates them
in. That order is chapter 2's material.** An article in this chapter that prints a roster must use
the conventional listing order — Ionian, Dorian, Phrygian, Lydian, Mixolydian, Aeolian, Locrian, the
order of the degrees of a major scale — and must not reproduce the order below. A first draft of
lesson 2 copied this table's order and then called it "the conventional listing order", which was
false and leaked chapter 2's ladder into chapter 1.

| Mode                    | Notes             | Degrees            | App card name      | Characteristic note | Parent major |
| ----------------------- | ----------------- | ------------------ | ------------------ | ------------------- | ------------ |
| Lydian                  | `A B C# D# E F# G#` | `1 2 3 #4 5 6 7`   | `A Lydian`         | `#4` — violet       | E            |
| Ionian (major)          | `A B C# D E F# G#`  | `1 2 3 4 5 6 7`    | `A Major`          | none                | A            |
| Mixolydian              | `A B C# D E F# G`   | `1 2 3 4 5 6 b7`   | `A Mixolydian`     | `b7` — amber        | D            |
| Dorian                  | `A B C D E F# G`    | `1 2 b3 4 5 6 b7`  | `A Dorian`         | `6` — amber         | G            |
| Aeolian (natural minor) | `A B C D E F G`     | `1 2 b3 4 5 b6 b7` | `A Natural minor`  | none                | C            |
| Phrygian                | `A Bb C D E F G`    | `1 b2 b3 4 5 b6 b7`| `A Phrygian`       | `b2` — rose         | F            |
| Locrian                 | `A Bb C D Eb F G`   | `1 b2 b3 4 b5 b6 b7`| `A Locrian`       | `b5` — rose         | Bb           |

Every parent-major column verified by writing the parent scale out and reading from `A`.

**Important, and easy to get wrong**: `scale-compare` and `caged-shape` head their cards with
`SCALE_TYPES[].name`, which is **`Major`** and **`Natural minor`** — not "Ionian" and not "Aeolian".
The word "Aeolian" appears only in the natural-minor card's character line, `"The plain minor scale
— Aeolian"`, and the major card's character line is `"The reference the others are heard against"`.
Any lesson that says "the card says Aeolian" is wrong. Say instead that the app prints the plain
name and puts the modal name in the line underneath.

Ionian and Aeolian carry `accent: null` in the catalogue. Their cards have **no tinted chip** and
their windows have **no outlined dot**. That is a fact about them (they are the references), not a
gap, and a lesson should say so rather than inventing a characteristic note for them.

### `scale-compare` colour, verified against `maskOf`

Amber marks tones a **later** scale has that the **first** (reference) scale lacks.

| Block                                       | Amber chips              |
| ------------------------------------------- | ------------------------ |
| `{ root: "A", scales: ["dorian"] }`         | none — single reference card |
| `{ root: "A", scales: ["major", "minor"] }` | `C`, `F`, `G` — exactly the three that drop |
| `{ root: "A", scales: ["minor", "dorian"] }`| `F#` alone — the `6`     |
| `{ root: "G", scales: ["major"] }`          | none — single reference card |

The `["minor","dorian"]` ordering is the one that lands the tint on the characteristic note. Do not
reverse it.

### The E form window, A Aeolian against A Dorian — recomputed

A's five windows are `A 0–3`, `G 1–5`, `E 4–8`, `D 6–10`, `C 9–13`. Dot counts at the scale layer:

| Form | Window | Aeolian | Dorian |
| ---- | ------ | ------- | ------ |
| A    | 0–3    | 17      | 16     |
| G    | 1–5    | 18      | 18     |
| E    | 4–8    | 17      | 17     |
| D    | 6–10   | 18      | 17     |
| C    | 9–13   | 17      | 16     |

**Use the E form only in this chapter** and do not print a counts table in an article — chapter 4
owns that material.

The **E form, frets 4–8** is the one lesson 3 draws, and here is exactly what happens:

| | Aeolian `b6` (`F`) | Dorian `6` (`F#`) |
| - | - | - |
| positions | `2·6`, `5·8` | `2·7`, `4·4` |

Both windows hold **17 dots**. Equal counts, **different picture**: `2·6` steps up one fret to
`2·7` inside the window; `5·8` raises to `5·9`, which is **off the top of the window**; and a `6` at
`4·4` steps **in from below**. So:

- **"The same picture with one dot moved" is FALSE as a caption.** Do not write it.
- The true sentence: the two scales differ by exactly one degree — every `b6` becomes a `6` — and
  the window does not move, but because the window's edges are fixed frets, a sixth sitting on an
  edge steps across the frame.
- "One more dot" / "one fewer dot" is wrong here (17 and 17) and wrong in three of the five windows.

### The key detector, run on this chapter's progressions

`estimateKey` ranks **24 keys — major and minor only**. It has no modal vocabulary at all, and a
lesson must say so rather than implying it can name a mode. Verified output:

| Progression | Status      | Best guess | Runners-up |
| ----------- | ----------- | ---------- | ---------- |
| `Am D`      | `ambiguous` | D major 19% | A minor 18%, G major 14% |
| `Am D Am D` | `ambiguous` | D major 19% | A minor 18%, G major 14% |
| `Am D G`    | `confident` | **G major 54%** | D major 11%, A minor 9% |
| `Dm G C`    | `confident` | C major 54% | G major 11%, D minor 9% |
| `Am F`      | `ambiguous` | A minor 39% | F major 32% |
| `A G`       | `ambiguous` | D major 27% | G major 16% |
| `A G D`     | `confident` | D major 51% | B minor 12% |

**The demonstration for lesson 6 is `Am D` against `Am D G`.** Same two chords, one added, and the
verdict goes from "cannot decide" to "confidently G major". Note carefully what a lesson may claim:
the detector does **not** call the vamp A Dorian or A minor. It refuses to commit. That refusal is
the honest evidence — a vamp does not name a tonic functionally, which is exactly why the tonic has
to come from repetition, the bass and what you lean on.

**Do not write** "the Key Detector hears A Dorian". It cannot.

**The percentages above are the engine's, and the screen does not print them.** `KeyReadout.tsx`
renders `keyStrength()`, which is the leader's share *relative to the runner-up*
(`c0 / (c0 + c1)`), not the raw softmax confidence, plus a one-word verdict. What a learner actually
sees — recomputed:

| Progression | Word on screen | Detected key | Candidate cards |
| ----------- | -------------- | ------------ | --------------- |
| `Am D`      | **Ambiguous** (amber) | D major | two cards, **52%** D major / **48%** A minor, with "Two keys fit this progression about equally. Pick one…" |
| `Am D G`    | **Likely**     | G major | **none** — the cards only appear when the status is ambiguous, so no percentage is shown at all |

A first draft of lesson 6 printed 19% / 18% / 14% / 54% / 11% straight from the table above. Every
one of those numbers would have been contradicted by the screen. **Chapter 5, which also uses this
screen, must quote the second table, not the first.**

### Temperley & Tan (2013), verified against the paper itself

David Temperley & Daphne Tan, "Emotional Connotations of Diatonic Modes", _Music Perception_ 30(3),
237–257 (2013). Independently checked against the full text.

- **[established]** Significant differences in perceived happiness for **12 of the 15** mode pairs,
  and for **all adjacent pairs but one**. Untrained listeners reliably separate modes that differ by
  a single scale degree.
- **The one adjacent pair that was NOT significant is Aeolian/Dorian.** (The three non-significant
  pairs overall: Lydian/Mixolydian, Lydian/Dorian, Dorian/Aeolian.) This chapter's headline
  comparison _is_ Aeolian against Dorian, so lesson 4 must say so — it is the honest note and it is
  also reassuring.
- Caveats to carry: **17 nonmusician undergraduates at the University of Rochester**, binary
  forced-choice ("which of these two is happier"), **unaccompanied monophonic melodies**.
- **Do not say tempo varied.** It did not in this study — the melodies were played at a moderate
  tempo with no metronome. Tempo variation is Ramos, Bueno & Bigand (2011), a different paper. The
  pathway brief is wrong on this point.
- **Do not use the happiness ordering or the Lydian anomaly in this chapter.** Chapter 2 owns it.
  (For chapter 2's benefit: the brief says Lydian "sits between Ionian and Mixolydian". **It does
  not.** Lydian's .58 sits between **Mixolydian** .64 and **Dorian** .40 — third in the ordering,
  not second.)

### The drone, and what may be claimed for it

**[convention, no evidence]** that a drone trains the ear — two controlled studies found no
measurable benefit, for intonation. The drone's justification here is **not empirical**: a mode does
not exist without a tonal centre, so the drone is not a training aid, it is the thing that makes the
mode be there. Say that. Do not say it sharpens anyone's ear.

The `scale-compare` drone bar reads **"Hold A underneath"** with a play button the learner presses;
under it, "The tones need a home to lean on" before it starts, "Tap any tone to hear it against
home" after. It sits an octave below the run and keeps sounding while a scale plays. Every chip is
tappable and sounds its tone alone.

---

## The six lessons

Each is one article. Every `scale-compare` in this chapter sets `drone: true`, because every one of
them sits under prose making a claim about sound.

### 1 · `modes-what-a-mode-is` — "What a Mode Actually Is"

Section id `modes.ch1.what-a-mode-is` · ~600 words · kills misconception 1.

**The one thing it teaches**: a mode is a set of notes **plus a decision about which one is home**,
and the decision has to be made audible by something outside the scale.

Key points in order:

1. Open on the damaging sentence — "a mode is the major scale started on a different degree" — and
   say what is wrong with it: it is true about the notes and silent about the sound.
2. The worked case, on A. A Dorian's seven notes are `A B C D E F# G`. Those are G major's seven
   notes. Run them from `A` into silence and the ear hears G major. Nothing in the note list can
   tell the two apart, because there is nothing in the note list to tell apart.
3. So the definition splits in two, and both halves are needed: **the notes** (seven, the same seven
   as some major scale) and **the tonic** (which one everything is heard against). Define **mode**,
   **tonic**, **home** here — these are the chapter's load-bearing words.
4. What can supply a tonic: a held root, a bass, a chord that will not move. Never the scale itself.
5. Take the tonic away and the mode evaporates. That is not a subtlety; it is the whole topic.
6. The prerequisite sentence, one line, framed as strongly recommended: links
   `caged-what-the-letter-means` and `minor-caged-what-decides-home`.

Live: `scale-compare` `{ root: "A", scales: ["dorian"], drone: true }`. Prose instruction: play the
run with the drone stopped, then press the drone bar and play it again. Nothing about the notes
changed; everything about what they mean did.

Callout (`warning`): the "started on a different degree" line, named as the sentence that costs
people months.

Leaves the next lesson: the word "mode" defined, and the question "so how many are there, and do I
know any of them already?"

### 2 · `modes-two-you-already-play` — "Two of Them Are Already Yours"

Section id `modes.ch1.two-you-already-play` · ~600 words · kills half of misconception 2.

**The one thing it teaches**: there are seven, they are a family, and the learner already plays two
of them under different names.

Key points in order:

1. Ionian is the major scale. Aeolian is the natural minor scale `minor-caged` spent five chapters
   on. Name each plain synonym at first use, exactly once.
2. The rename clause, one sentence: `minor-caged` deliberately said "natural minor" throughout and
   never used the word "Aeolian"; both names point at the same seven notes, and this pathway uses
   the modal name because the point is that the two scales you own are members of a family of seven.
3. What the app actually prints — `A Major` and `A Natural minor` on the cards, with "Aeolian" in
   the line underneath. Both names are on screen either way. **Get this right; see the verified
   facts above.**
4. The roster table: all seven on A, with notes and characteristic note. **State explicitly that
   the order in the table is the conventional listing order and says nothing about how they sound —
   chapter 2 puts them in an order that does.** Do not teach the brightness ladder.
5. Name **characteristic note** — the one tone that separates a mode from its nearest plain relative
   — and the tint convention (`6` and `b7` amber, `b2` and `b5` rose, `#4` violet). Say plainly that
   Ionian and Aeolian have none, because they are the two everything else is measured against.
6. One clause on misconception 4: these are not jazz-only material; Ionian, Aeolian, Dorian and
   Mixolydian turn up constantly in rock. Keep it to a clause, no numbers, no citation — chapter 3
   has the evidence.

Live: `scale-compare` `{ root: "A", scales: ["major", "minor"], drone: true }`. The three amber
chips are `C`, `F`, `G` — exactly the three notes `minor-caged-the-three-that-drop` taught. Link it.

Leaves the next lesson: seven names, two of them already familiar, and the obvious worry — "five
more scales to learn on the neck".

### 3 · `modes-no-new-shapes` — "Nothing New to Learn on the Neck"

Section id `modes.ch1.no-new-shapes` · ~600 words · kills the rest of misconception 2.

**The one thing it teaches**: every mode in this pathway is a CAGED window the learner already owns
with a degree or two changed. There is no new shape anywhere in six chapters.

**Correction to the brief, verified.** The brief and the chapter dispatch both say "every mode is one
of those ten windows with **one dot moved**". Recomputed from `SCALE_TYPES` semitones, that is true
for six of the seven and **false for Locrian**, which differs from natural minor in **two** degrees
(`2`→`b2` and `5`→`b5`); Phrygian is the one-note neighbour it sits next to. Counting notes that
differ from the nearer of major and natural minor: Ionian 0, Aeolian 0, Lydian 1, Mixolydian 1,
Dorian 1, Phrygian 1, **Locrian 2**. Chapters 2–6 must not repeat the unqualified claim.

Key points in order:

1. State it flatly and early: you know the five CAGED windows of A major and the five of A minor.
   That is all ten. Every mode here is one of them with one degree moved.
2. The window is anchored on the root, not the quality — link `minor-caged-the-window-stays-put`.
   A Dorian's E form covers the same frets, 4 to 8, that A minor's does.
3. Draw it. `caged-shape` `{ root: "A", form: "E", quality: "minor", show: "scale", caption: "..." }`
   then `caged-shape` `{ root: "A", form: "E", scale: "dorian", caption: "..." }`. Second card heads
   itself `E form · A Dorian` and outlines the `6` in amber.
4. **The honest caveat, and it must be in this lesson.** The scales differ by exactly one degree —
   every `b6` becomes a `6` — but the two diagrams are not the same picture with one dot moved.
   Both hold 17 dots. Inside the window `2·6` steps up to `2·7`; `5·8` raises off the top of the
   frame; and a `6` at `4·4` steps in from below. Spell out `string 5, fret 8` in words the first
   time the chapter uses `5·8` notation. Equal counts, different picture.
5. What that costs, in practice: nothing. The window is the same span, the roots are in the same
   places, and the change is one finger.
6. Send them to the **Scale Visualizer** — set the root to `A` and the scale to Dorian and it pages
   through "C form", "A form", "G form"… the same names all three pathways have used.

Do **not** use `caged-ladder` here; it takes `quality`, not `scale`, so it cannot draw a mode's
notes, and the brief reserves it for chapter closers.

Leaves the next lesson: the shapes are free, so the whole cost of this pathway is in the ear.

### 4 · `modes-hold-the-drone` — "Hold One Note and Listen"

Section id `modes.ch1.hold-the-drone` · ~650 words.

**The one thing it teaches**: with a root held underneath, one set of notes changes its mind — and
the learner's ear can already hear it.

Key points in order:

1. The drone is not a practice aid; it is the missing half of the definition. Without something
   holding home there is no mode to hear. Say this in the register the evidence allows: no claim
   that a drone trains anyone's ear.
2. The exercise, step by step. Start the drone. Play A natural minor. Play A Dorian. Then stop the
   runs and **tap the `F#` chip alone** against the held `A`. That one tone against home is the
   whole lesson. Tint `6` and `F#` **amber** in prose to match the chip.
3. Name what changed: one note out of seven, `F` to `F#`, `b6` to `6`. Dorian's characteristic note.
4. The encouraging evidence, `[established]`: untrained listeners reliably tell modes apart,
   including modes differing by a single scale degree — 12 of 15 pairs, and all adjacent pairs but
   one. **Your ear can already do this; what it lacks is a name for what it is hearing.**
5. **The honest note, which is this lesson's best moment**: the one adjacent pair the listeners did
   _not_ reliably separate was Aeolian and Dorian — the exact pair above. So if it takes several
   passes, that is the hardest comparison in the set and not a failure of ears.
6. Caveats, in a footnote: 17 nonmusician undergraduates at one university, binary forced choice,
   unaccompanied monophonic melodies. **No claim about tempo.**
7. Close by sending them to **Drone**, and telling them they need no app at all: hold an open `A`
   (string 5, fret 0) ringing and play against it.

Live: `scale-compare` `{ root: "A", scales: ["minor", "dorian"], drone: true }` — one amber chip,
`F#`.

Leaves the next lesson: "A Dorian is A natural minor with a raised sixth" was one way of getting
there; there is another, and it answers a different question.

### 5 · `modes-two-roads` — "Two Roads to the Same Mode"

Section id `modes.ch1.two-roads` · ~650 words · kills misconception 7 in advance.

**The one thing it teaches**: relative answers _where the notes are_; parallel answers _what changed
about the sound_ — and this pathway leads with parallel.

Key points in order:

1. **Relative** — keep the notes, move the home. A Dorian is G major played from `A`. Fast, and on a
   guitar it is worth a fortune, because you already know the shapes. Link
   `minor-caged-the-same-seven-notes`, where the learner met this for minor.
2. **Parallel** — keep the home, move the notes. A Dorian is A natural minor with the `b6` raised to
   a natural `6`. Link `minor-caged-the-three-that-drop`, where the learner met this for minor.
3. The parent table for all seven on A: Lydian → E, Ionian → A, Mixolydian → D, Dorian → G,
   Aeolian → C, Phrygian → F, Locrian → Bb. **Use the verified column above.** Say the parent is
   named only when the relative derivation is being used, and never as the way to identify a mode.
4. Demonstrate that relative alone cannot make a sound: two `scale-compare` blocks, same seven
   pitches, different drone. `{ root: "G", scales: ["major"], drone: true }` and
   `{ root: "A", scales: ["dorian"], drone: true }`. Hold `G` and it is G major; hold `A` and it is
   A Dorian; the note list never moved.
5. **The demotion, explicitly.** Use relative to find the notes, then put it down. A player thinking
   "G major" while trying to sound like A Dorian is aiming at the wrong note, and the shapes will
   pull the ear back to `G` — which is exactly what `minor-caged-what-decides-home` warned about for
   C major and A minor. This pathway is anchored on one root for this reason: seven modes on `A` can
   be compared note against note, and that comparison is the lesson.
6. `minor-caged-switching-relatives` is a fair extra link for the "same hand, different key" move.

Leaves the next lesson: you can find any mode's notes and you know which derivation to reach for.
So what actually keeps the ear at home once you start playing chords?

### 6 · `modes-when-the-harmony-moves` — "When the Harmony Moves"

Section id `modes.ch1.when-the-harmony-moves` · ~650 words · kills misconception 3. Chapter closer.

**The one thing it teaches**: a functional progression names its own tonic, so it overrides whatever
mode you meant; what holds a mode up is a **vamp**.

Key points in order:

1. State it: over a progression that functions, there is no mode — there is a key, and the ear finds
   it fast.
2. The demonstration, on A. `Am`–`D` is a `i`–`IV`, two chords that go nowhere and keep insisting on
   `Am`. Add `G` and you have `Am`–`D`–`G`, a `ii`–`V`–`I` in G major, and the ear lands on `G`
   before the loop comes round. The chords barely changed. The home moved.
3. Live: `progression-player` `{ chords: ["Am", "D"], bpm: 66 }` and
   `{ chords: ["Am", "D", "G"], bpm: 66 }`. Slow, so they are heard as harmony.
4. Take it to the **Key Detector** and report what it actually does — see the verified table. `Am`–
   `D` comes back **ambiguous**: it will not commit, and its top guess is not even A. `Am`–`D`–`G`
   comes back **confident G major**. Say plainly that the detector only knows major and minor keys
   and has no name for A Dorian, so what it is telling you is not "this is not Dorian" but "this
   vamp does not name a tonic the way a progression does" — which is precisely the point.
5. Define **vamp**: one or two chords that assert the tonic and refuse to resolve anywhere else.
   That is the harmony a mode needs.
6. One sentence, about this vamp only: the `D` chord is where the `F#` lives, so `Am`–`D` says
   Dorian rather than Aeolian. **Do not state a general rule** — chapter 6 owns "the second chord of
   a modal vamp carries the characteristic note", and chapter 5 owns "what a tonic actually needs".
7. Close the chapter: the definition, the two you already play, the shapes you already own, the
   drone, the two roads, the vamp. Then point at **chapter 2**, which puts the seven in an order
   that means something. Chapters may be named by number; lessons may not.

---

## The activity — `modes-same-notes-new-home`

Section id `modes.ch1.same-notes-new-home` · `"optional": true` · `note-play`, modes `easy` and
`hard`, board frets 0–5.

Chapter 1's claim made physical: the same seven pitches walked from two different homes. It does
**not** touch the `b6` → `6` move — chapter 4 owns raising the sixth, and this activity deliberately
stays out of its way by keeping one note set throughout.

Every target recomputed for pitch collisions (`midiForTarget`); no round repeats a pitch.

| Round | Prompt | Targets (`string·fret`), ordered |
| ----- | ------ | -------------------------------- |
| `r_modes-same-notes-new-home.from-g` | G major, one octave from `G` | `6·3 5·0 5·2 5·3 4·0 4·2 4·4 3·0` |
| `r_modes-same-notes-new-home.from-a` | The same seven notes from `A` — this is A Dorian's note list, and over silence it is still G major | `5·0 5·2 5·3 4·0 4·2 4·4 3·0 3·2` |
| `r_modes-same-notes-new-home.two-octaves` | Two octaves from `A`, with the Drone holding `A` | `5·0 5·2 5·3 4·0 4·2 4·4 3·0 3·2 2·0 2·1 2·3 1·0 1·2 1·3 1·5` |

MIDI, verified distinct within each round: round 1 `43 45 47 48 50 52 54 55`; round 2
`45 47 48 50 52 54 55 57`; round 3 `45 47 48 50 52 54 55 57 59 60 62 64 66 67 69`.

---

## The checkpoint — `modes-ch1-checkpoint`

`kind: "checkpoint"` · `passThresholdPct` 70 · **8 questions**, written **after** the articles were
read, from what they actually say. It is referenced only from the chapter's `checkpoint` field, not
as a section — matching every sibling pathway, none of which lists its checkpoint as a section.

| # | id suffix | Draws on | Tests |
| - | --------- | -------- | ----- |
| 1 | `definition` | `modes-what-a-mode-is` | What a mode is — notes plus a tonic made audible from outside the scale |
| 2 | `into-silence` | `modes-what-a-mode-is` | What `A B C D E F# G` played from `A` into silence actually sounds like |
| 3 | `two-you-know` | `modes-two-you-already-play` | Which two modes the learner already plays, and under what plain names |
| 4 | `window` | `modes-no-new-shapes` | The window is anchored on the root and does not move |
| 5 | `dot-counts` | `modes-no-new-shapes` | Why the two E-form diagrams hold equal dot counts — the window-edge fact |
| 6 | `drone` | `modes-hold-the-drone` | `multi-select`: what the drone is for, and what is *not* claimed for it |
| 7 | `two-roads` | `modes-two-roads` | Which derivation answers a question about sound, and why |
| 8 | `vamp` | `modes-when-the-harmony-moves` | Why `Am`–`D`–`G` isn't A Dorian, and what a vamp is |

Distractors encode the four misconceptions this chapter is built against, never filler. No question
refers to an option by letter or position. Every question carries an `explanation`.
