# Chapter 2 — The Brightness Ladder

Chapter id `modes.ch2` · slug `the-brightness-ladder` · 6 articles, 1 activity, 1 checkpoint.

After this chapter the learner can put all seven modes in brightness order, name the one note that
sits between any two neighbours, and say which modes have a major home chord and which a minor one.
It is the chapter that turns "seven names" into "two homes with two dials each", which is the
pathway's spine and the thing chapters 3 and 4 are built out of.

This is a **mostly conceptual chapter**. Chapter 1 already spent the neck news; chapters 3–5 own the
per-mode diagrams. The only fretboard work here is the optional activity. Do not pad it with
`caged-shape` blocks.

Anchor root is **A** everywhere. String numbering is **1 = high e, 6 = low E**.

---

## Verified facts this chapter is built on

Everything below was **recomputed** from `SCALE_TYPES` in `mobile/src/lib/scale-library/catalog.ts`,
not remembered, and cross-checked against `mobile/src/lib/guitar-positions/caged.test.ts`. **These
are the numbers every lesson must use.**

### The ladder, and what moves at each step

Order the seven by how raised their degrees are:

**Lydian · Ionian · Mixolydian · Dorian · Aeolian · Phrygian · Locrian**

Each step down lowers **exactly one degree by a semitone**, and the degrees lower in the order
`4`, `7`, `3`, `6`, `2`, `5`.

| Mode       | `1` | `2`  | `3`  | `4`  | `5`  | `6`  | `7`  |
| ---------- | --- | ---- | ---- | ---- | ---- | ---- | ---- |
| Lydian     | 1   | 2    | 3    | #4   | 5    | 6    | 7    |
| Ionian     | 1   | 2    | 3    | **4**| 5    | 6    | 7    |
| Mixolydian | 1   | 2    | 3    | 4    | 5    | 6    | **b7** |
| Dorian     | 1   | 2    | **b3** | 4  | 5    | 6    | b7   |
| Aeolian    | 1   | 2    | b3   | 4    | 5    | **b6** | b7 |
| Phrygian   | 1   | **b2** | b3 | 4    | 5    | b6   | b7   |
| Locrian    | 1   | b2   | b3   | 4    | **b5** | b6 | b7   |

**The bold cell in each row is the degree that dropped a semitone from the row above.** Lydian, the
top row, has no bold cell — nothing is above it.

> **Note for the record.** The pathway brief tabulates this the other way round (degrees as rows,
> modes as columns) and bolds **Lydian's `#4`** while leaving **Ionian's `4`** plain, under a caption
> saying "the bolded cell is the one note that changed from the column before". Those two things
> disagree: from Lydian to Ionian, the cell that changed is Ionian's `4`. The orientation and
> bolding above is the self-consistent one and is what this chapter uses. The brief's *content* is
> correct in every cell; only its bolding is off by one column.

### The two chains of fifths — recomputed, and both exact

At each step down the ladder one note leaves the set and one arrives a semitone lower. On `A`:

| Step                  | Degree      | Note leaving | Note arriving |
| --------------------- | ----------- | ------------ | ------------- |
| Lydian → Ionian       | `#4` → `4`  | `D#`         | `D`           |
| Ionian → Mixolydian   | `7` → `b7`  | `G#`         | `G`           |
| Mixolydian → Dorian   | `3` → `b3`  | `C#`         | `C`           |
| Dorian → Aeolian      | `6` → `b6`  | `F#`         | `F`           |
| Aeolian → Phrygian    | `2` → `b2`  | `B`          | `Bb`          |
| Phrygian → Locrian    | `5` → `b5`  | `E`          | `Eb`          |

Read the "leaving" column: `D# G# C# F# B E` — **a chain of descending perfect fifths.** Read the
"arriving" column: `D G C F Bb Eb` — **another one.** And chapter 1's parent-major table, read in
ladder order, is a third: `E A D G C F Bb`, each parent a fifth below the last, each losing one
sharp or gaining one flat. That is the same fact told three ways, and it is why the ladder is
sometimes drawn on the circle of fifths.

Note the spellings: the note that leaves at the last step is `E` and the note that arrives is `Eb`
(**not** `D#` — `buildScale('A','locrian')` prints `A Bb C D Eb F G`). Lydian's raised fourth is
`D#`. Same pitch class, different spelling, and the app prints both as written here.

**Pinned in code.** `mobile/src/lib/guitar-positions/caged.test.ts`, the test
`separates each mode from its neighbour by exactly one degree`, walks
`['lydian','major','mixolydian','dorian','minor','phrygian','locrian']` and asserts for each
adjacent pair that exactly one semitone leaves, exactly one arrives, the arriving one is one
semitone below the leaving one, and the degree that moved is `4`, `7`, `3`, `6`, `2`, `5` in that
order. A lesson may state all of that flatly.

### What the ladder does NOT license

- **"Every mode is one dot from something you already own" is FALSE.** Counting against the *nearer*
  of the two scales the learner owns: Ionian 0, Aeolian 0, Lydian 1, Mixolydian 1, Dorian 1,
  Phrygian 1, **Locrian 2** (`2`→`b2` *and* `5`→`b5`). `modes-no-new-shapes` already ships the
  corrected wording. "Each step down the ladder flattens exactly one more note" is true and is the
  claim to make; do not slide from it into the false one.
- **Adjacency is doing the work.** Non-neighbours differ by more than one note — Lydian against
  Dorian is three (`#4`→`4`, `7`→`b7`, `3`→`b3`), Ionian against Aeolian is three, Lydian against
  Locrian is six.

### The split, and the two families

The `3` flattens between **Mixolydian and Dorian**. That is where the ladder splits.

| Family | Home chord | Home chord's notes | The dials | Bright → dark |
| ------ | ---------- | ------------------ | --------- | ------------- |
| Major  | `A`        | `A C# E` (`1 3 5`) | the `4` and the `7` | Lydian `#4 7` · Ionian `4 7` · Mixolydian `4 b7` |
| Minor  | `Am`       | `A C E` (`1 b3 5`) | the `6` and the `2` | Dorian `2 6` · Aeolian `2 b6` · Phrygian `b2 b6` |
| —      | `Adim`     | `A C Eb` (`1 b3 b5`) | — | Locrian |

Every cell recomputed from the degree table above. **A learner who leaves with nothing else should
leave with this table.**

### Where the half steps fall — recomputed

A diatonic scale has five whole steps and two half steps. Which two degree-pairs they land on,
measured against the tonic, is what distinguishes one mode from another.

| Mode       | Its two half steps |
| ---------- | ------------------ |
| Lydian     | `#4`→`5` · `7`→`1` |
| Ionian     | `3`→`4` · `7`→`1`  |
| Mixolydian | `3`→`4` · `6`→`b7` |
| Dorian     | `2`→`b3` · `6`→`b7`|
| Aeolian    | `2`→`b3` · `5`→`b6`|
| Phrygian   | `1`→`b2` · `5`→`b6`|
| Locrian    | `1`→`b2` · `4`→`b5`|

Three positions matter, and each one's membership was counted, not assumed:

- **A half step immediately above the tonic** (`1`→`b2`) — **Phrygian and Locrian only.** Leans on
  home from above; the strongest single darkening move available.
- **A half step immediately below the tonic** (`7`→`1`, a leading tone) — **Lydian and Ionian
  only.** Pulls up into home. **Every other mode has a `b7`, a whole step below** — that is *five*
  modes (Mixolydian, Dorian, Aeolian, Phrygian, Locrian), and they never sound tugged home the way
  a major key does.
  - **Correction to the brief.** The brief says "the four flat modes never sound like they are being
    tugged home". Five modes have a `b7`, not four. Write "every other mode" or "the other five";
    do **not** write "the four flat modes".
- **A half step immediately above the fifth** (`5`→`b6`) — **Aeolian and Phrygian only.** This is
  the trap in this lesson. **Locrian has a `b6` but its fifth is `b5`, so the gap between them is a
  whole step**, not a half. A sentence like "the three modes with a `b6`" is wrong for this claim.
  Dorian's whole point is that it has no half step above the fifth at all — its `6` is a whole tone
  up.

One more exact fact, counted from the table: **two modes have a half step directly below home, two
have one directly above home, three have neither, and no mode has both.** (Below: Lydian, Ionian.
Above: Phrygian, Locrian. Neither: Mixolydian, Dorian, Aeolian.)

### Where the tritone lands — recomputed

Every one of the seven contains **exactly one** pair of degrees six semitones apart. Computed by
checking all 21 degree pairs in each mode; every mode returned exactly one hit.

| Mode       | Tritone degrees | On `A`      | Touches the tonic triad? |
| ---------- | --------------- | ----------- | ------------------------ |
| Lydian     | `1` and `#4`    | `A` – `D#`  | the root, but not the triad's `3` or `5` |
| Ionian     | `4` and `7`     | `D` – `G#`  | no — both are outside `1 3 5` |
| Mixolydian | `3` and `b7`    | `C#` – `G`  | the `3` |
| Dorian     | `b3` and `6`    | `C` – `F#`  | the `b3` |
| Aeolian    | `2` and `b6`    | `B` – `F`   | no — both are outside `1 b3 5` |
| Phrygian   | `b2` and `5`    | `Bb` – `E`  | the `5` |
| Locrian    | `1` and `b5`    | `A` – `Eb`  | both notes are in `A C Eb` |

- **Ionian and Aeolian are the only two whose tritone misses the tonic triad entirely.** Counted
  against the table; it is why they are the two references everything else is measured against.
- **Mixolydian's is the useful row**: `3` and `b7` are the two notes of a dominant seventh chord,
  which is why `A7` *is* the Mixolydian sound.
- **Locrian's is the striking one**: home is itself a tritone. State it; do not analyse it.

### Temperley & Tan (2013), and the Lydian anomaly

David Temperley & Daphne Tan, "Emotional Connotations of Diatonic Modes", *Music Perception* 30(3),
237–257 (2013).

- Method: **17 nonmusician undergraduates at one university**, binary forced choice ("which of these
  two sounds happier"), **unaccompanied monophonic melodies** — the *same* melody heard in two
  modes, **always on a tonic of C, with only the key signature altered**. Locrian was excluded, so
  six modes and 15 pairs.
- **Tempo was not a variable.** Tempo variation belongs to Ramos, Bueno & Bigand (2011), which
  crossed three melodies with three tempi. Do not attribute it to Temperley & Tan.
- Proportion of trials each mode was judged the happier of a pair: **Ionian .83, Mixolydian .64,
  Lydian .58, Dorian .40, Aeolian .34, Phrygian .21.**
- **Lydian is third of the six, between Mixolydian and Dorian** — not second. The brief's earlier
  "between Ionian and Mixolydian" was wrong and has been corrected.
- **12 of the 15 pairs** showed significant differences. The three that did **not**:
  **Lydian/Mixolydian, Lydian/Dorian, Dorian/Aeolian.** So the single non-significant *adjacent*
  pair is Dorian/Aeolian, and **two of the three involve Lydian** — itself evidence for the anomaly.
  **Non-significance is not difficulty**: do not call any pair "the hardest comparison".
- **Replication**: Ramos, Bueno & Bigand (2011), a different lab and population, found the same
  anomaly — Ionian significantly higher in valence than Lydian, and Lydian and Mixolydian not
  distinguishable.
- **[contested]** *Why* the ordering happens. Temperley & Tan favour a mix of **familiarity**
  (happiness declines with distance from Ionian, the most common mode) and **"sharpness"** (the
  tonic's position on the line of fifths). Familiarity alone predicts Mixolydian above Lydian, and
  **for almost half their participants the reverse held**. Present neither explanation as settled.

---

## The six lessons

Every `scale-compare` in this chapter sets `drone: true` and pairs scales **in ladder order,
brighter first**, so the amber tint marks exactly the note (or notes) that flattened. That ordering
is not decorative and must not be reversed.

### 1 · `modes-the-ladder` — "The Seven, in an Order That Means Something"

Section id `modes.ch2.the-ladder` · ~650 words · `tags: ["modes","theory"]`.

**The one thing it teaches**: there is an order for the seven in which each step down flattens
exactly one more note, and the degrees flatten in a fixed sequence.

**What the previous lesson left it**: chapter 1 closed by promising "an order that actually means
something", and printed the roster in conventional listing order specifically so this lesson owns
the ladder. **Introduce the ladder as new information.** Say in one clause that the order chapter 1
listed them in was the conventional one and said nothing about sound.

Key points in order:

1. Name the order: Lydian, Ionian, Mixolydian, Dorian, Aeolian, Phrygian, Locrian. The principle is
   how raised the degrees are — nothing more mystical than that.
2. The degree table above, exactly as oriented above, with the bold cell in each row being the
   degree that dropped from the row above. Lydian's row has no bold.
3. State the rule flatly: **each step down flattens exactly one more note, and the degrees flatten
   in the order `4`, `7`, `3`, `6`, `2`, `5`.** Say it is pinned in the app's own tests, so it is a
   fact about the scales rather than a mnemonic someone invented.
4. On `A`, the note that leaves at each step: `D# G# C# F# B E` — **a chain of descending fifths**.
   And the note that arrives: `D G C F Bb Eb` — another one. That is why the ladder is sometimes
   drawn on the circle of fifths.
5. Tie it back to something the learner already has: chapter 1's parent-major column, read in this
   order, is `E A D G C F Bb` — each parent a fifth below the last, each one sharp fewer. Link
   `modes-two-roads`. One sentence; do not re-teach the relative derivation.
6. **The guardrail, and it must be here.** "Each step flattens one more note" is a statement about
   *neighbours on the ladder*. It does **not** mean every mode is one note from something you own —
   Locrian needs two changes from natural minor, as `modes-no-new-shapes` said. Link it.

Live, both with `drone: true`, overlapping at Dorian so the chain is continuous:

- `scale-compare` `{ root: "A", scales: ["lydian","major","mixolydian","dorian"], drone: true }`
- `scale-compare` `{ root: "A", scales: ["dorian","minor","phrygian","locrian"], drone: true }`

Say what the learner will see: the amber **accumulates** left to right, because amber marks tones a
later card has that the reference card lacks. In the first block that is `D`, then `D G`, then
`D G C`; in the second `F`, then `F Bb`, then `F Bb Eb`. Recount if you reword this. Invite them to
start the drone and play down the ladder — but **do not claim what it feels like**; say the chapter
closes on exactly what "brighter" is and isn't worth.

Leaves the next lesson: if each step moves one note, then any two neighbours are one note apart —
which note, for each pair?

### 2 · `modes-one-note-apart` — "One Note Between Neighbours"

Section id `modes.ch2.one-note-apart` · ~600 words · `tags: ["modes","theory"]`.

**The one thing it teaches**: name any two neighbours on the ladder and you can name the single note
that separates them — and adjacency is what makes that true.

**What the previous lesson left it**: the ladder and the flattening sequence.

Key points in order:

1. State the payoff: six adjacent pairs, six single notes, and you can now derive any of them
   instead of memorising seven scales.
2. The full table — the "two chains of fifths" table above, all six rows: pair, degree that moves,
   note leaving, note arriving. Spell `Eb` for Locrian's `b5` and `D#` for Lydian's `#4`, per the
   app.
3. **Adjacency is doing the work**, and this is the part a learner will get wrong. Skip a rung and
   it is no longer one note: Lydian against Dorian is three notes, Ionian against Aeolian is three,
   Lydian against Locrian is six. Recompute any number you print here.
4. **Do not generalise to "one dot from something you own"** — repeat the Locrian guardrail in one
   clause and link `modes-no-new-shapes`.
5. Close by pointing at the one pair that is different in kind: Mixolydian → Dorian is where the `3`
   moves, and moving the `3` changes the home chord. That is the next lesson.

Live, all `drone: true`, all brighter-first (three is enough; do not draw all six):

- `scale-compare` `{ root: "A", scales: ["lydian","major"], drone: true }` — one amber chip, `D`
- `scale-compare` `{ root: "A", scales: ["mixolydian","dorian"], drone: true }` — one amber chip, `C`
- `scale-compare` `{ root: "A", scales: ["minor","phrygian"], drone: true }` — one amber chip, `Bb`

Tell the learner what to do with them: start the drone, then tap the amber chip on its own against
the held `A`. That is the whole comparison in one tone. Point them at
[Drone](/drone) once, by name.

Leaves the next lesson: one of these six pairs changes more than a colour — it changes home.

### 3 · `modes-two-families` — "Two Homes, Two Dials Each"

Section id `modes.ch2.two-families` · ~700 words · `tags: ["modes","theory"]` · **the chapter's most
important lesson.**

**The one thing it teaches**: the ladder splits at Mixolydian/Dorian into a major-home family and a
minor-home family, each with two dials — so there are not seven scales to learn.

**What the previous lesson left it**: the six one-note steps, and the observation that the
Mixolydian → Dorian step moves the `3`.

Key points in order:

1. The `3` is the note that decides whether home is major or minor, and on the ladder it flattens
   exactly once — between Mixolydian and Dorian. Everything above that line has an `A` for a home
   chord (`1 3 5` = `A C# E`); everything below has an `Am` (`1 b3 5` = `A C E`), until Locrian.
2. Locrian's home chord is `Adim` (`1 b3 b5` = `A C Eb`), because its fifth is flattened too. **One
   sentence, stated as a fact. Do not explain why that home will not hold — chapter 5 owns that**,
   and say so in a clause so the learner knows it is coming rather than missing.
3. The spine table (the "two families" table above, all three rows). This is the lesson.
4. **Reframe the whole thing**: two homes, two dials each. In the major family the dials are the `4`
   and the `7`; in the minor family the `6` and the `2`. Turn one dial and you move one rung. Say
   plainly that this is why the pathway is anchored on one root — seven scales on `A` collapse into
   two chords and four switches.
5. Name Ionian and Aeolian as the middle setting of each family — the reference each family is
   heard against, and the reason neither has a characteristic note (chapter 1 established this;
   reference it, do not redefine it).
6. Set up what is coming, in one short paragraph: chapter 3 is the top row and chapter 4 is the
   bottom row, one mode at a time. **Do not teach any individual mode's sound here**, do not name
   an avoid note, and do not describe what Lydian or Phrygian feel like.

Live:

- `progression-player` `{ chords: ["A","Am"], bpm: 66, caption: "The two homes — everything above the split, then everything below" }`
- `scale-compare` `{ root: "A", scales: ["lydian","major","mixolydian"], drone: true }` — the major
  row; amber is `D` on the Ionian card and `D G` on the Mixolydian card
- `scale-compare` `{ root: "A", scales: ["dorian","minor","phrygian"], drone: true }` — the minor
  row; amber is `F` on the Aeolian card and `F Bb` on the Phrygian card

Link [Chord Shapes](/chord-shapes) once for `A` and `Am` if it fits naturally. Link text is the
screen's name, never its route.

Leaves the next lesson: the families explain the home chord. They do not yet explain why one mode
leans on home and another floats above it — for that you have to look at where the half steps land.

### 4 · `modes-half-steps` — "Where the Half Steps Fall"

Section id `modes.ch2.half-steps` · ~650 words · `tags: ["modes","theory","ear"]`.

**The one thing it teaches**: every one of the seven has the same five whole steps and two half
steps; a mode is distinguished by *where the two half steps land relative to home*.

**What the previous lesson left it**: two families and four dials — a structural map with no account
yet of why the notes pull the way they do.

Key points in order:

1. Open on the count: seven notes, five whole steps, two half steps, in every one of the seven. The
   ingredient list never changes. What changes is where the two tight spots sit relative to the note
   you are calling home.
2. The half-step table above, all seven rows.
3. **A half step immediately above the tonic** — `1`→`b2`. **Phrygian and Locrian only.** It leans
   on home from above and it is the strongest single darkening move available in the set. (Chapter 4
   owns what Phrygian *feels* like; keep this structural.)
4. **A half step immediately below the tonic** — the major `7`, a leading tone. **Lydian and Ionian
   only.** It pulls up into home. **Every other mode has a `b7`, a whole step below** — five of
   them — which is why they never sound tugged home the way a major key does. **Write "every other
   mode" or "the other five". Do not write "the four flat modes"; five modes have a `b7`.**
5. **A half step immediately above the fifth** — the `b6`. **Aeolian and Phrygian only, and this is
   the sentence to get right.** Locrian has a `b6` too, but its fifth is a `b5`, so that gap is a
   whole step. Dorian's whole point is that it has no half step above the fifth: its `6` sits a
   whole tone up where natural minor puts a semitone.
6. The tidy summary, counted rather than asserted: two modes have a half step directly below home,
   two have one directly above home, three have neither, and **none has both**.
7. Close by pointing forward: half steps say where the tension sits next to home. There is one more
   piece of structure that says where the tension sits *inside* the scale.

Live, both `drone: true`, brighter-first:

- `scale-compare` `{ root: "A", scales: ["major","mixolydian"], drone: true }` — amber `G`. Prose:
  start the drone, tap `G#` on the first card and `G` on the second. One is a half step under home;
  the other is a whole step under it.
- `scale-compare` `{ root: "A", scales: ["minor","phrygian"], drone: true }` — amber `Bb`. Prose:
  tap `Bb` against the held `A`. That is a half step above home.

Send them to [Drone](/drone) to do the same with their own hands.

Leaves the next lesson: the tritone.

### 5 · `modes-the-tritone` — "Where the Tritone Lands"

Section id `modes.ch2.the-tritone` · ~650 words · `tags: ["modes","theory"]`.

**The one thing it teaches**: every one of the seven contains exactly one tritone, and which two
degrees it falls on *relative to your tonic* is different in every mode.

**What the previous lesson left it**: half steps account for the notes next to home; the tritone
accounts for the tension inside the set.

Key points in order:

1. Define the tritone in one line, plainly: three whole tones, six frets, the widest and most
   unsettled interval a diatonic scale contains. The learner may have met it as the `b5` of the
   blues scale; one clause is enough.
2. **Every diatonic scale contains exactly one.** Not "at least one" — exactly one pair of its seven
   degrees is six semitones apart. The seven modes are seven different note sets on `A`, so each has
   its own.
3. The tritone table above, all seven rows: mode, the two degrees, the two notes on `A`.
4. What to read off it — the point of the lesson. It is not the tritone's presence that varies, it
   is its **address**. Whether it touches the tonic or the tonic triad is what changes:
   - **Ionian and Aeolian are the only two whose tritone misses the tonic triad completely.** That
     is the structural reason they are the two references. Verify this against the table before
     writing it.
   - **Mixolydian** — `3` and `b7` are the two notes of a dominant seventh chord. `A7` is `A C# E G`,
     and the `C#` and `G` are the tritone. This is why the mode and the chord are the same idea, and
     it is the most useful row in the chapter. Naming `A7` as "the seventh chord this mode gives
     you" is allowed; **seventh-chord theory, shapes and voicings are out of scope.**
   - **Lydian** — measured off the root itself, `1` and `#4`, though it does not touch the `3` or
     the `5`.
   - **Locrian** — `1` and `b5`: home is itself a tritone, and both notes are inside `A C Eb`.
     **State it and stop. Chapter 5 owns why that home will not hold**; say so in a clause.
5. Close the technical run of the chapter and hand over to the last lesson: you now have an exact
   ordering, an exact account of what separates each pair, two families, and the two structural
   causes underneath. One question is left, and it is the honest one — what does "brighter" actually
   mean?

Live:

- `progression-player` `{ chords: ["A","A7"], bpm: 66, caption: "The tonic triad, then the same chord with the b7 added — the C# and the G are the tritone" }`

One `scale-compare` is optional here; if you use one, make it
`{ root: "A", scales: ["major","mixolydian"], drone: true }` and have the learner tap `C#` and then
`G` against the drone.

Leaves the next lesson: the ladder is exact. Whether it describes anything anyone hears is a
different question, and it has actually been measured.

### 6 · `modes-what-brighter-means` — "What 'Brighter' Actually Means"

Section id `modes.ch2.what-brighter-means` · ~750 words · `tags: ["modes","ear","theory"]` ·
**chapter closer, and the chapter's best lesson.**

**The one thing it teaches**: the ladder is an exact structural fact and *not* a perceptual
measurement — and where the two have been compared, the ordering broadly holds with one repeated
exception, which is Lydian.

**What the previous lesson left it**: a complete structural account of the seven.

Key points in order:

1. Open by separating the two claims. "Each step down flattens one more degree" is exact and
   checkable. "Each step down sounds darker" is a different kind of sentence entirely, and it is the
   one every guitar site states as if it were the first kind.
2. It has been measured. Temperley & Tan (2013): the same melody heard in two modes, always on a
   tonic of C, only the key signature changed; listeners picked which of the two sounded happier.
   Locrian was left out, so six modes and 15 pairs.
3. The result, `[established]`: the ordering broadly holds. Print the proportions — Ionian `.83`,
   Mixolydian `.64`, Lydian `.58`, Dorian `.40`, Aeolian `.34`, Phrygian `.21`. A table is right
   here.
4. **The anomaly, which is the lesson.** Lydian is the **brightest on the ladder** and lands
   **third of the six** in judged happiness, between Mixolydian and Dorian — and it is not
   significantly different from either of them. Twelve of the fifteen pairs did come out
   significant; the three that did not are Lydian/Mixolydian, Lydian/Dorian and Dorian/Aeolian, so
   **two of the three involve Lydian**. **Do not describe a non-significant pair as "the hardest
   comparison" — non-significance is not difficulty.**
5. **It replicates.** Ramos, Bueno & Bigand (2011), a different lab with a different population,
   found the same thing: Ionian significantly higher in valence than Lydian, and Lydian and
   Mixolydian not distinguishable. Two independent studies agreeing that Lydian breaks the ladder is
   the genuinely interesting result, and it is the honest correction to "Lydian is the brightest and
   happiest mode".
6. **Why** it happens is `[contested]` and must be hedged. Temperley & Tan favour a mix of
   familiarity (happiness declines with distance from Ionian, the most common mode) and "sharpness"
   (where the tonic sits on the line of fifths). Familiarity alone predicts Mixolydian above Lydian,
   and for almost half their participants the reverse held. Present neither as settled: the pattern
   is solid, the cause is not.
7. `[convention, no evidence]`, one short paragraph: named moods — "Lydian is wonder", "Phrygian is
   Spanish" — are **repertoire associations**, true and useful and memorable as associations, false
   as psychoacoustics. Phrygian sounds Spanish because flamenco uses it. Keep it to a paragraph;
   chapters 3 and 4 use these as they go.
8. **Caveats in a footnote**, not the body: 17 nonmusician undergraduates at one university, binary
   forced choice, unaccompanied monophonic melodies, one tonic. **No claim about tempo** — tempo
   variation belongs to Ramos, Bueno & Bigand, not to Temperley & Tan.
9. Close the chapter and hand to chapter 3: you can order all seven, name the note between any two
   neighbours, and say which have a major home chord and which a minor one. Chapter 3 takes the top
   row one mode at a time. Chapters may be named by number; lessons may not.

Live:

- `scale-compare` `{ root: "A", scales: ["lydian","major"], drone: true }` — the two the studies
  disagree about, in ladder order. Prose: the ladder says the first one is brighter; listeners in
  two labs put the second one first. Play both, decide for yourself, and notice that you are now
  doing something the internet's version of this ladder does not let you do.

Callout (`info` or `tip`, one idea): the ladder is a good map of the notes and a rough map of the
feeling. Use it for the first; hold it loosely for the second.

---

## The activity — `modes-walk-the-ladder`

Section id `modes.ch2.walk-the-ladder` · `"optional": true` · `note-play`, modes `easy` and `hard`,
board frets 0–12.

This chapter's only fretboard work, and it is deliberately about the *structure* rather than about
any mode's sound: the chain of fifths the ladder is made of, then the two families' four dials. It
stays out of chapter 4's way by never asking for a `b6`→`6` move under a drone — the dial rounds ask
for both settings as separate notes, in both families, which is chapter 2's table and not chapter
4's moment.

Every target checked for pitch collisions within its round.

| Round | Prompt | Targets (`string·fret`), ordered | MIDI |
| ----- | ------ | -------------------------------- | ---- |
| `r_modes-walk-the-ladder.the-chain` | The note that leaves at each step down the ladder — `D# G# C# F# B E`, a chain of descending fifths. Each one is a fourth above the last: same fret, one string over, until the B string moves it a fret. | `5·6 4·6 3·6 2·7 1·7 1·12` | 51 56 61 66 71 76 |
| `r_modes-walk-the-ladder.major-dials` | The major family's two dials, both settings: `#4` `4` then `7` `b7` — `D# D G# G` | `5·6 5·5 4·6 4·5` | 51 50 56 55 |
| `r_modes-walk-the-ladder.minor-dials` | The minor family's two dials, both settings: `6` `b6` then `2` `b2` — `F# F B Bb` | `4·4 4·3 5·2 5·1` | 54 53 47 46 |

All three rounds `"ordered": true`. Open-string MIDI reference used: string 6 = 40, string 5 = 45,
string 4 = 50, string 3 = 55, string 2 = 59, string 1 = 64.

---

## The checkpoint — `modes-ch2-checkpoint`

`kind: "checkpoint"` · `passThresholdPct` 70 · **8 questions**, written **after** the six articles
were read, from what they actually say. Referenced only from the chapter's `checkpoint` field, not
as a section — matching chapter 1 and every sibling pathway.

| # | id suffix | Draws on | Tests |
| - | --------- | -------- | ----- |
| 1 | `the-order` | `modes-the-ladder` | Putting the seven in brightness order |
| 2 | `the-sequence` | `modes-the-ladder` | Which degree flattens next, and that the sequence is fixed |
| 3 | `neighbours` | `modes-one-note-apart` | Naming the one note between a named pair of neighbours — with a distractor that generalises "one note apart" past adjacency |
| 4 | `the-split` | `modes-two-families` | Where the ladder splits, and which home chord each side has |
| 5 | `dials` | `modes-two-families` | `multi-select` on the two families and their four dials |
| 6 | `half-steps` | `modes-half-steps` | Which modes have a half step directly above or below home |
| 7 | `tritone` | `modes-the-tritone` | Mixolydian's `3` and `b7`, and why `A7` is the Mixolydian sound |
| 8 | `the-anomaly` | `modes-what-brighter-means` | The Lydian anomaly, and what the ladder does and does not measure |

All six lessons are covered. Distractors encode the misconceptions this chapter is built against
(misconception 5 especially), never filler. No question refers to an option by letter or position.
Every question carries an `explanation`.

---

## Errata found while reviewing the drafts — chapters 3–6 inherit these

Seven corrections were made to lesson drafts that both lesson agents had reported clean. Recorded
here because most of them will recur.

1. **`/scale-visualizer` has no drone.** A draft of `modes-the-tritone` wrote "start the `A` drone
   on Scale Visualizer or Drone". Checked against `mobile/src/app/scale-visualizer.tsx` and
   `mobile/src/features/scale-visualizer/` — the only drone engine on the app is `/drone`. **The
   Scale Visualizer plays a scale; it does not hold a root.** Chapters 3–5 send the learner to that
   screen constantly and must not attribute a drone to it. `LEARNING_CREATION.md` §7.4 does not say
   either way, which is what let the draft through.
2. **The `scale-compare` cards are headed with the plain names.** `SCALE_TYPES[].name` is `Major`
   and `Natural minor`, so there is no card on screen headed "A Ionian" or "A Aeolian". Four
   lessons referred to "the Ionian card" and "the Aeolian card". Rather than reword all four,
   `modes-the-ladder` now carries one clause before the first block saying the app heads those two
   with the plain names. **Chapters 3 and 4 can rely on that clause having been read.**
3. **"The last lesson" is banned** by the brief's own conventions table, and a draft of
   `modes-one-note-apart` opened with it. Name the topic instead.
4. **Two false uniqueness claims.** A draft called the Mixolydian→Dorian step "different in kind
   from the other five" — but Phrygian→Locrian also changes the home chord (`Am` → `Adim`). And a
   draft called Lydian's tritone "the odd one" for being measured off the root — Locrian's is too.
   Both narrowed. Superlatives remain the failure mode: neither agent caught either.
5. **The parent scales' key signatures.** A draft said the parent chain `E A D G C F Bb` runs "one
   sharp lighter each time"; that is only true down to C. Reworded as "one step further round
   toward the flats".
6. **"Locrian was left out as unplayable"** overstates Temperley & Tan's stated reason and edges
   into chapter 5's material. Now "left out of the study, for reasons chapter 5 takes up."
7. **"Everything below the split, down to Locrian, has a minor home chord"** reads as inclusive of
   Locrian. Now "until you reach Locrian."

### Corrections to the brief that chapters 3–6 should carry

- **"The four flat modes never sound tugged home" is an undercount.** Five modes have a `b7`:
  Mixolydian, Dorian, Aeolian, Phrygian, Locrian. The brief's "Why each one sounds the way it does"
  section says four. `modes-half-steps` writes "every other mode … that's five modes" and names
  them.
- **A `b6` is only a half step above the fifth in Aeolian and Phrygian.** Locrian has a `b6` and a
  `b5`, so its gap there is a whole step. The brief does not say otherwise but is easy to misread
  as licensing "the three modes with a `b6`".
- **The brief's degree-ladder table bolds Lydian's `#4` and leaves Ionian's `4` plain**, under a
  caption saying the bolded cell is the one that changed from the column before. Those disagree.
  This chapter transposes the table and bolds the cell that dropped from the row above; every cell
  of the brief's version is otherwise correct.
