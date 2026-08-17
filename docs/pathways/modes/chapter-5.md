# Chapter 5 — Locrian, and When a Mode Collapses

Chapter id `modes.ch5` · slug `when-a-mode-collapses` · 5 articles, 1 activity, 1 checkpoint.
The shortest chapter in the pathway, and the negative-result one.

After this chapter the learner can say **why** a mode works, not just which notes it has: that
something outside the scale has to hold home, that the home it holds has to be a chord you can
stand on, that the notes which clash belong to the chord rather than to the scale, and that a
progression which functions names its own tonic and takes the mode with it.

**This chapter is not a sound lesson about Locrian.** Locrian is the worked counter-example, not a
mode to add to the collection. Everything here is structural, and the one place it makes a claim
about listeners it has a real citation behind it.

Anchor root is **A** everywhere except one deliberate, flagged transposition in
`modes-when-a-progression-functions`. String numbering is **1 = high e, 6 = low E**. Positions are
written `string·fret`.

---

## How to read this document

Two registers, and they must not be confused. Chapter 4's drafts pasted five plan directives
straight into learner-facing prose.

- **Plain text and bullet lists are instructions to the lesson agent.** They are written in the
  second person and they are never reproduced in an article.
- **Anything inside a `> quote block` is *suggested wording*** — the only text on this page that may
  be echoed toward a reader, and even that should be rewritten rather than copied.

An article never explains its own authoring. No sentence in a finished article may name a component,
a prop, a colour convention, a scope decision, another lesson's job, or this plan.

---

## Verified facts this chapter is built on

Everything below was **recomputed**, not remembered — from `SCALE_TYPES` in
`mobile/src/lib/scale-library/catalog.ts`, from a reimplementation of `cagedFormWindows` /
`cagedFillMarks` in `mobile/src/lib/guitar-positions/caged.ts` (`OPEN_PITCHES = [4,11,7,2,9,4]`,
index 0 = high e, `FRET_COUNT = 15`, `MIN_SPAN = 3`, `CAGED_FORM_OFFSETS` as shipped), and by
running `estimateKey` from `mobile/src/lib/key-analysis/` and `analyzeChord` from
`mobile/src/lib/chord-analysis/` on this chapter's actual progressions. **These are the numbers
every lesson must use.**

### A Locrian

| Notes | Degrees | Parent major | Home chord | Characteristic note | Card heading |
| ----- | ------- | ------------ | ---------- | ------------------- | ------------ |
| `A Bb C D Eb F G` | `1 b2 b3 4 b5 b6 b7` | `Bb` | `Adim` (`A C Eb`) | `b5` (`Eb`) — **rose** | `A Locrian` |

- **Spell `Bb` and `Eb`.** Never `A#`, never `D#`. That is what the app's scale builder prints and
  what the chip beside the prose will say.
- The catalogue's own `character` line for it is **"No perfect 5th — unstable, and the reason it is
  rare"**. That is the default sub-line `caged-shape` prints under a Locrian card, and it is the
  register to write in.
- **Two changed degrees from natural minor** — `2`→`b2` *and* `5`→`b5`. It is the only one of the
  seven that needs two; the other six need one or none. `modes-no-new-shapes` already shipped this
  ("six of the seven need exactly one moved, and Locrian, the odd one out, needs two"). Reference
  it; do not re-derive the whole table.
- **One changed degree from Phrygian** — `5`→`b5`, `E` leaving and `Eb` arriving. That is the last
  rung of the ladder, already shipped in `modes-one-note-apart` and `modes-the-ladder`.

### No perfect fifth — recomputed across the seven

Semitone 7 above the tonic is present in Lydian, Ionian, Mixolydian, Dorian, Aeolian and Phrygian,
and **absent in Locrian alone**. So of the seven, Locrian is the only one whose tonic triad is
diminished and the only one with no perfect fifth over home. `modes-two-families` already shipped
the `Adim` row of the families table; this chapter explains it.

**Scope that superlative to the seven.** The catalogue holds 26 scales and several others lack a
perfect fifth — Altered, Altered ♭♭7, Locrian ♮6, Locrian ♮2, Ionian ♯5 and Lydian augmented among
them. Chapter 4 shipped a draft error of exactly this shape ("just one other mode in the
catalogue"). **Never write "the only scale in the catalogue".**

### The tritone

`1` and `b5` — `A` and `Eb`. **Both notes are inside the tonic triad `A C Eb`**: home is itself a
tritone. `modes-the-tritone` shipped this exact sentence and explicitly handed the "what that does
to Locrian's ability to function as a home" question to this chapter. Reference it; do not
re-derive the table.

Note that **Lydian's tritone also touches the root** (`1` and `#4`). `modes-lydian-sound` and
`modes-the-tritone` both already say so. Do not write "the only mode whose tritone touches the
tonic" — Locrian's distinction is that it reaches **both** notes of its own triad.

### Avoid notes over each mode's own tonic triad — recomputed, all seven

Definition already shipped in `modes-the-avoid-note`: *a scale tone sitting a half step above a note
of the chord underneath.* Nothing here redefines it.

| Lydian | Ionian | Mixolydian | Dorian | Aeolian | Phrygian | **Locrian** |
| ------ | ------ | ---------- | ------ | ------- | -------- | ----------- |
| none | `4` | `4` | none | `b6` | `b2`, `b6` | **`b2` only** |

**The Locrian row is the chapter's payoff and it is genuinely surprising.** Worked, note by note,
against `Adim` (`A C Eb`) — a semitone above those three tones is `Bb`, `C#` and `E`:

- `Bb` — the `b2`. **In the scale.** The one avoid note.
- `C#` — not in A Locrian at all.
- `E` — not in A Locrian at all; Locrian is precisely the mode that gave it up.
- And the `b6` (`F`) sits a **whole** step above the `b5` (`Eb`), not a half step, so it is not an
  avoid note here even though it is one in Aeolian and in Phrygian. Recomputed: `Eb` is pitch class
  3, `F` is 5.

That last point is the same fact `modes-half-steps` already shipped from another angle — "Locrian
has a `b6` too, but Locrian's fifth is already a `b5`, so the gap between them is a whole step, not
a half". Link it.

Safe superlatives at this scope, all counted against the table above:

- **Lydian and Dorian are the only two of the seven with no avoid note over their own tonic triad.**
  Chapter 4 shipped this scoped to the six ("each family holds exactly one … the one with the raised
  dial") and said explicitly that it said nothing about the seventh. This chapter is the one allowed
  to close it.
- **Phrygian is the only one of the seven with two.** Still true once Locrian is counted, because
  Locrian has one.
- **Do not** write that Locrian has the fewest, or the most, or is unusual for having one. One is the
  commonest count in the table.

### Avoid notes move when the chord moves — recomputed

Every count so far in this pathway has been taken over each mode's **own tonic triad**, because that
is the chord a vamp holds. Change the chord and the answer changes completely. Recomputed against
the second chord of each vamp already shipped:

| Mode | Over its tonic | Over the second chord of its own vamp |
| ---- | -------------- | ------------------------------------- |
| Aeolian | `b6` (`F`) over `Am` | **none** over `F` (`F A C`) — the `F` is now a chord tone |
| Dorian | none over `Am` | **`b7` (`G`)** over `D` (`D F# A`) — a semitone above the `F#` |
| Lydian | none over `A` | **`5` (`E`)** over `B` (`B D# F#`) — a semitone above the `D#` |
| Mixolydian | `4` (`D`) over `A` | **none** over `G` (`G B D`) |
| Phrygian | `b2`, `b6` over `Am` | **none** over `Bb` (`Bb D F`) |

Three of those five are worth a lesson between them. The Aeolian row is the sharpest: **the one note
you had to move through over `Am` is a note you can land on and hold over `F`** — same seven notes,
same scale, different chord. The Dorian row is its mirror: a mode with nothing that fights over home
acquires something that fights the moment the second chord arrives.

**Do not turn this into chord-scale theory.** It is an observation about which notes clash with which
chords. Naming a different mode per chord is the thing `modes-a-different-question` refuses to teach.

### The neck — every window and every dot recomputed

Windows for root `A`: **A 0–3 · G 1–5 · E 4–8 · D 6–10 · C 9–13.** The A form is clamped at the nut
and is four frets wide where the others are five.

Dot counts at the scale layer, all seven modes, recomputed cell by cell — this reproduces the brief's
35-cell table exactly:

| Form | Window | Lydian | Ionian | Mixolydian | Dorian | Aeolian | Phrygian | **Locrian** |
| ---- | ------ | ------ | ------ | ---------- | ------ | ------- | -------- | ----------- |
| C | 9–13 | 18 | 18 | 17 | 16 | 17 | 17 | **17** |
| A | 0–3 | 12 | 13 | 15 | 16 | 17 | 17 | **15** |
| G | 1–5 | 17 | 17 | 17 | 18 | 18 | 18 | **18** |
| E | 4–8 | 18 | 17 | 16 | 17 | 17 | 17 | **18** |
| D | 6–10 | 16 | 17 | 17 | 17 | 18 | 18 | **18** |

The exact positions of the moving degree, Phrygian's `5` against Locrian's `b5` — **use these and
nothing else**:

| Form | Window | Phrygian `5` (`E`) | Locrian `b5` (`Eb`) | Count |
| ---- | ------ | ------------------ | ------------------- | ----- |
| A | 0–3 | `1·0` `4·2` `6·0` | `4·1` | 17 → **15** |
| G | 1–5 | `2·5` `4·2` | `2·4` `4·1` | 18 → 18 |
| E | 4–8 | `2·5` `5·7` | `2·4` `3·8` `5·6` | 17 → **18** |
| D | 6–10 | `3·9` `5·7` | `3·8` `5·6` | 18 → 18 |
| C | 9–13 | `1·12` `3·9` `6·12` | `1·11` `4·13` `6·11` | 17 → 17 |

**The A form is this chapter's neck fact, and it is the counter-example to a slogan.** Traced dot by
dot: `4·2` steps down to `4·1`, inside. `1·0` and `6·0` are the **two open `E` strings**, sitting on
fret 0 — flattening sends them to a fret that does not exist and both are simply lost. Nothing steps
in from above. **Seventeen becomes fifteen: a flatten that takes two dots away.**

`modes-phrygian-neck` already shipped "flattening always adds dots is false" using the
Aeolian→Phrygian case in the same window (one gained from above, one lost off the nut, netting
equal). This is the same mechanism turned all the way up, and it is the case that made chapter 4
correct a shipped sentence in `modes-mixolydian-neck`. **The corrected rule, which chapter 3's
article now carries:** nothing can cross **into** a nut-clamped window from underneath, so raising
loses dots and never gains one, while flattening pulls dots in from above but drops any dot already
sitting on fret 0 clean out of the picture.

### The open strings — recomputed, and it is the chapter's best guitar-specific fact

A Locrian contains no `E` at all. Checked pitch class by pitch class against
`OPEN_PITCHES = [4,11,7,2,9,4]`:

| Mode on `A` | Open strings **not** in it | How many |
| ----------- | -------------------------- | -------- |
| Lydian | `3` (`G`), `4` (`D`) | 2 |
| Ionian | `3` (`G`) | 1 |
| Mixolydian | — | 0 |
| Dorian | — | 0 |
| Aeolian | — | 0 |
| Phrygian | `2` (`B`) | 1 |
| **Locrian** | **`1` (`E`), `2` (`B`), `6` (`E`)** | **3** |

So: **A natural minor contains all six open strings; A Locrian is missing three of them, including
both outer `E`s.** More than any other of the seven — counted against the table, safe at that scope.
Do not claim it of the catalogue's 26.

### What the Chord Detector actually says

`analyzeChord` run on `A C Eb`, both as a bare three-note voicing (`5·0`, `4·1`, `3·5`) and as the
curated grip below, returns the same ranked list:

**`Adim`** — primary, **no warnings** — then `Cm6/A`, then `D#6(b5)/A`.

So the screen names it `Adim` without hesitation, and offers two other readings of the same three
notes, each with a different note taken as the root. **Write that as what the analyser offers, not as
what a listener hears.** It is a naming ranking, not a perceptual finding.

### What `progression-player` actually draws

`readProgression` verified for every symbol this chapter uses. Charts are six slots, low E first:

| Symbol | Chart | Notes |
| ------ | ----- | ----- |
| `Adim` | `x 0 1 2 1 x` | `A Eb A C` |
| `A5` | `x 0 2 2 x x` | `A E A` |
| `Am` | `x 0 2 2 1 0` | `A E A C E` |
| `Bb` | `x 1 3 3 3 x` | `Bb F Bb D` |
| `Eb` | `x x 1 3 4 3` | `Eb Bb Eb G` |
| `Dm` | `x x 0 2 3 1` | `D A D F` |
| `G` | `3 2 0 0 0 3` | `G B D G B G` |
| `C` | `x 3 2 0 1 0` | `C E G C E` |

### What the Key Detector actually prints — recomputed by running the engine

`estimateKey` was run on every progression this chapter names. `KeyReadout` shows the key's name,
the word **Likely** or **Ambiguous**, and a ten-segment meter driven by `keyStrength()` — the
leader's share *relative to the runner-up*. **The two candidate cards, with percentages, render only
when the status is `ambiguous`.** A confident reading shows one key and no percentage at all. The
engine's raw softmax confidences are **never displayed** and must never be quoted.

| Progression | Word on screen | Key shown | Candidate cards | Meter |
| ----------- | -------------- | --------- | --------------- | ----- |
| `Adim`–`Bb` | **Likely** | `Bb major` | none | half lit |
| `Adim`–`Eb` | **Ambiguous** | `G minor` | `G minor` **54%** / `Bb major` **46%** | one segment |
| `Am`–`Adim` | **Likely** | `A minor` | none | most of the way across |
| `Dm`–`G` | **Ambiguous** | `G major` | `G major` **52%** / `D minor` **48%** | one segment |
| `Dm`–`G`–`C` | **Likely** | `C major` | none | most of the way across |
| `C`–`F`–`G`–`C` | **Likely** | `C major` | none | nearly full |
| `Am`–`D` | **Ambiguous** | `D major` | `D major` **52%** / `A minor` **48%** | one segment |

The last row is chapter 1's, already shipped in `modes-when-the-harmony-moves` with those exact
percentages. Reference it rather than re-reporting it.

Two readings worth their own sentence, and both are new to this chapter:

- **`Adim`–`Eb` is the closest thing to a Locrian vamp that exists** — `Eb` (`Eb G Bb`) is the chord
  inside A Locrian that carries the `b5`. The detector comes back Ambiguous with two candidate keys,
  **and neither of them is rooted on `A`**.
- **`Adim`–`Bb` hands the tonic to `Bb`**, which is A Locrian's own parent major — the exact
  outcome this pathway has spent five chapters teaching a player to avoid.

**Describe the meter qualitatively** ("barely lights", "runs most of the way across"). The word and
the card percentages are the two things printed as text; the meter is a bar.

### Temperley & Tan on Locrian — verified against the paper

David Temperley & Daphne Tan, "Emotional Connotations of Diatonic Modes", *Music Perception* 30(3),
237–257 (2013). **`[established]`, and a lesson may state it as the finding it is.**

They **excluded Locrian from the experiment**. Their stated grounds: it is "virtually impossible to
compose a melody that 'sounds' Locrian", because a melody using the five-flat signature with a tonic
of C "will almost always imply an alternative tonic" — noting this is "partly because scale-degree
`5` is absent". They call Locrian "more of a theoretical possibility than a musical reality" and
"virtually unknown in any kind of Western music".

- **This is a statement about what listeners will hear as the tonic. It is not a prohibition.**
  Chapter 2 caught a draft turning it into "left out as unplayable" and reworded it to "left out of
  the study, for reasons chapter 5 takes up". **Do not write "unplayable", "you can't play it", or
  "it isn't a real mode".** The notes are perfectly playable; what fails is the claim to be home.
- `modes-what-brighter-means` shipped the promise that this chapter takes it up. Deliver it.
- Method caveats, if used: 17 nonmusician undergraduates at one university, binary forced choice,
  unaccompanied monophonic melodies, always on a tonic of C. Six modes went in, 15 pairs came out.
  **Tempo was not a variable** — that is Ramos, Bueno & Bigand (2011).

### Components — the rules that bite here

- **`scale-compare`**: `drone: true` on every block in this chapter, because every one sits under
  prose making a claim about sound. Pair neighbours **reference first** — `["phrygian","locrian"]`,
  never reversed. Verified: with `phrygian` first, the Locrian card lights exactly one amber chip,
  `Eb`.
- **The diff tint is always amber**, whatever the catalogue hue. Locrian's `b5` is **rose** in prose
  and rose outlined on the neck, and **amber** as a chip on a scale card. Chapter 4's drafts pasted
  the instruction itself into an article; write the observation, not the rule.
- **The drone under a Locrian card is itself the point**: the bar holds `A` an octave below the run,
  and the scale's `Eb` against that held `A` is the tritone. Every chip is tappable.
- **`caged-shape`'s `caption` replaces only the small line *under* the heading.** The heading is
  always `<form> form · <root> <scale name>` — `A form · A Phrygian`, `A form · A Locrian` — and is
  **not** overridable. Six captions in chapter 3 duplicated it. Write a caption that adds something,
  or omit the prop.
- **`caged-shape` draws everything in the window, not a grip a hand would hold.** Say so once in the
  lesson that uses it.
- **`caged-ladder`** takes `quality`, not `scale`, so it cannot draw a mode. Both previous chapter
  closers used it; **this chapter does not use it at all.**
- **`progression-player`** at `bpm: 66`, matching every vamp in chapters 1–4.

### Screens

- **`/chord-detector`** — play `A C Eb` and see what it is called. Named for this chapter by the
  brief, and used once.
- **`/key-detector`** — the collapse demonstration. Used in two lessons, for two different claims.
- **`/drone`** — the held `A`.
- **`/scale-visualizer`** — the neck destination. **There is no drone on this screen.** It plucks; it
  does not hold a root.
- **`/chord-shapes`** — `Adim`, `Am`, `Bb`.
- **Link text is the screen's name, never its route.** "Chord Detector", not `/chord-detector`.

---

## The five lessons

Each is one article. There are exactly **two** `caged-shape` blocks in the whole chapter, both in
lesson 1.

### 1 · `modes-locrian` — "Locrian, and the Home That Won't Hold"

Section id `modes.ch5.locrian` · ~750 words · `tags: ["modes","theory","fretboard"]` ·
`estimatedMin` 6.

**The one thing it teaches**: A Locrian's home chord has no perfect fifth, and every attempt to hold
`A` as home with it hands the tonic to some other note.

**What came before**: `modes-one-minor-three-ways` closed chapter 4 by naming a seventh mode whose
home chord is neither `A` nor `Am`, and handing the question of whether a home can hold to this
chapter.

Key points in order:

1. Open on the chord, not on the scale. `Adim` is `A C Eb` — `1 b3 b5`. Every other mode in this
   pathway has a perfect fifth over its tonic; this one has a flattened one, and that single fact
   is what the whole chapter is about.
2. The notes and degrees: `A Bb C D Eb F G`, `1 b2 b3 4 b5 b6 b7`. Parent major `Bb`, named once and
   put down. Characteristic note the `b5` (`Eb`), tinted **rose**.
3. **Two changed degrees, not one** — `2`→`b2` and `5`→`b5` from the natural minor the learner owns.
   Link `modes-no-new-shapes`, which already carries this. One rung from Phrygian, though: the last
   step down the ladder flattens the `5`, `E` leaving and `Eb` arriving.
4. **The tritone is inside the tonic triad.** `1` and `b5`, `A` against `Eb`. `modes-the-tritone`
   gave the address and said explicitly that what it does to Locrian's ability to hold home is this
   chapter's question. Reference it in a sentence; do not re-derive the table.
5. **The Chord Detector.** Send the learner to play `A C Eb` and read what comes back: `Adim`, with
   two further readings offered — `Cm6/A` and `D#6(b5)/A` — each taking a different note as the
   root. Write it as what the app offers, not as what anyone hears.
6. **Try to build the vamp, and watch it fail.** This is the lesson's spine and it is where the
   `progression-player` and Key Detector work goes. Use the verified readings above:
   - `Adim`–`Bb`, the `i°`–`bII`: the detector comes back **Likely**, `Bb major`, one answer, no
     percentages offered. And `Bb` is A Locrian's own parent major — the note this pathway has spent
     five chapters teaching a player not to hand home to.
   - `Adim`–`Eb`, the one chord inside A Locrian that carries the `b5`: **Ambiguous**, with two
     candidate cards, `G minor` at 52–54% against `Bb major` — **and neither is rooted on `A`.**
   - The conclusion, stated plainly: there is no Locrian vamp. Every other mode's loop works because
     the tonic holds while a second chord moves against it. Here the tonic does not hold, so there
     is nothing to move against. **Do not state the general vamp rule** — chapter 6 owns it.
7. **The neck, briefly.** Two `caged-shape` blocks, the A form at the nut, `A Phrygian` then
   `A Locrian`. Seventeen dots become fifteen. Traced: `4·2` steps down to `4·1` inside the frame;
   `1·0` and `6·0` are the two open `E` strings and flatten to a fret that does not exist, so both
   are lost; nothing arrives from above. Then the fact that makes it stick: **A Locrian contains no
   `E` at all**, so neither open `E` string, and not the open `B` either — three of the six open
   strings, where A natural minor uses all six. Link `modes-phrygian-neck` for the edge rule in one
   clause rather than re-teaching it.
8. **The citation, as the finding it is.** Temperley & Tan left Locrian out of their study, on the
   stated grounds that a melody written with those notes and that tonic will almost always imply a
   different tonic — partly because the fifth is missing — and called it more of a theoretical
   possibility than a musical reality. `modes-what-brighter-means` promised this chapter would take
   it up. **State it as a finding about what listeners hear as home. Do not write "unplayable".**

Live, in this order:

- `scale-compare` `{ root: "A", scales: ["phrygian", "locrian"], drone: true }` — one amber chip,
  `Eb`. Instruction, and it is specific to this block: start the drone, then tap the amber chip
  against the held `A`. That interval is the tritone, and it is also the mode's home chord's own
  fifth. Nothing else in this pathway has that shape.
- `progression-player` `{ chords: ["Adim", "Bb"], bpm: 66, caption: "…" }`
- `progression-player` `{ chords: ["Adim", "Eb"], bpm: 66, caption: "…" }`
- `caged-shape` `{ root: "A", form: "A", scale: "phrygian", caption: "…" }`
- `caged-shape` `{ root: "A", form: "A", scale: "locrian", caption: "…" }`

**No caption may restate the heading** (`A form · A Phrygian`, `A form · A Locrian`).

Suggested closing move, to hand over:

> Every other mode in this pathway had a home you could put your weight on. This one does not — and
> saying exactly what "put your weight on" means is worth doing properly, because the answer applies
> to all seven.

### 2 · `modes-what-home-needs` — "What a Tonic Actually Needs"

Section id `modes.ch5.what-home-needs` · ~650 words · `tags: ["modes","theory"]` ·
`estimatedMin` 5 · **the lesson that closes the pathway's definition of a mode.**

**The one thing it teaches**: a mode needs two things, not one — something outside the scale holding
home, and a home that is a chord you can stand on.

**What came before**: Locrian, and a home chord that would not hold.

Key points in order:

1. Chapter 1's definition, recalled in one sentence and linked: a mode is a set of notes plus a
   decision about which one is home, and the decision has to be made audible by something the scale
   itself cannot supply. Link `modes-what-a-mode-is`. **That half has been in place since the first
   lesson; what was never said is what it takes for the assertion to succeed.**
2. **The first requirement, already owned**: something outside the scale has to hold home. A drone,
   a bass, a chord that will not move. Chapter 1 proved it; one paragraph, no re-teaching.
3. **The second requirement, and it is this lesson's new material**: the home being held has to be a
   chord you can stand on, and what makes a chord stand is the perfect fifth. Argue it from the
   guitar rather than from acoustics:
   - `A5` is `A` and `E` and nothing else. **The third is the note you can take away** — drop it and
     the chord stops being major or minor and still names `A` unmistakably. Every rock guitarist has
     been doing this for decades.
   - Flatten the fifth instead and there is no longer a chord that names anything. `Adim` is a real
     chord with a real name, but the note it is named after is not the note it settles on.
   - Recomputed across the seven: **Locrian is the only one without a perfect fifth over its tonic.**
     Scope it to the seven. The catalogue holds other scales that lack one, and this is not a claim
     about them.
4. **The tritone, restated as the reason.** In Locrian the least stable interval in the scale is not
   somewhere in the scale, it is between the two outer notes of home. Reference `modes-the-tritone`;
   one sentence.
5. **What that explains, backwards over the whole pathway.** Every vamp the learner has played —
   `A`–`B`, `A`–`G`, `Am`–`D`, `Am`–`F`, `Am`–`Bb` — has a first chord you can sit on. That is why
   they work as vamps and not merely as pairs of chords. **Say what these five chords have in common;
   do not state the rule about what the second chord carries.** Chapter 6 owns that.
6. **`Adim` is not a bad chord.** This matters, and it stops the lesson reading as a hit piece. Play
   `Am` and then `Adim` and the ear stays on `A` — the detector reads that pair as **Likely**,
   `A minor`. A diminished triad works perfectly well as colour inside a key something else is
   holding; it is being asked to be the thing that holds that it cannot do. If the learner wants the
   chord built from scratch, `triad-the-flat-fifth` is where the `triads` pathway drops the fifth as
   well as the third.
7. Close on the closed definition: notes, plus a tonic asserted from outside, plus a home worth
   asserting. Three things, and only now are all three on the table.

Live:

- `progression-player` `{ chords: ["A5", "Am", "Adim"], bpm: 66, caption: "…" }` — the fifth alone,
  then the third added, then the fifth flattened. One sequence, and it is the lesson's whole
  argument.
- `progression-player` `{ chords: ["Am", "Adim"], bpm: 66, caption: "…" }` — the diminished chord
  behaving itself, inside a key `Am` is holding.

Send them to **Chord Shapes** for `Adim` and `Am`, and to **Drone** to hold `A` under either.

### 3 · `modes-avoid-notes-everywhere` — "The Clash Belongs to the Chord"

Section id `modes.ch5.avoid-notes-everywhere` · ~700 words · `tags: ["modes","theory","ear"]` ·
`estimatedMin` 6 · **the chapter's generalisation, and where the Locrian row pays off.**

**The one thing it teaches**: an avoid note is a property of the pairing of a scale with a chord, not
a property of the scale — so the clashes move when the chord moves, and they move when the home
chord changes shape.

**What came before**: home has to be a chord you can stand on. This lesson takes the chord seriously
in the other direction.

Key points in order:

1. Two avoid notes have been met, and both were found the same way. Link `modes-the-avoid-note`
   (Ionian's `4` over `A`) and `modes-the-ache` (Aeolian's `b6` over `Am`). Restate the definition in
   **one** line only: a scale tone a half step above a note of the chord underneath — a note to move
   through, not to land on. Do not redefine it and do not repeat its warning callout.
2. **Direction still matters.** A tone a half step *below* a chord tone leans up into it and is not
   an avoid note — the `2` under the `b3` in natural minor, Ionian's `7` under the root. Chapter 4
   shipped this; reference it in a sentence.
3. **The full table, all seven, over each mode's own tonic triad.** A `table` block is right here.
   Lydian none, Ionian `4`, Mixolydian `4`, Dorian none, Aeolian `b6`, Phrygian `b2` and `b6`,
   Locrian `b2`. Two safe claims to read off it, both counted: Lydian and Dorian are the only two of
   the seven with none, and Phrygian is the only one with two. **Nothing else is a safe superlative
   here.**
4. **The Locrian row, worked, and it is the payoff.** Its `b2` is an avoid note, sitting a half step
   above the root. Its `b6` is **not** — even though the same `b6` is an avoid note in Aeolian and in
   Phrygian. The arithmetic: home is `A C Eb`, so a half step above its tones means `Bb`, `C#` and
   `E`, and only `Bb` is in the scale. The `b6` (`F`) sits a **whole** step above the `b5` (`Eb`).
   Link `modes-half-steps`, which already says the same thing from the half-step side.
5. **State the general point the Locrian row proves**: the avoid notes depend on the chord home
   actually is. Change the shape of home and the clashes move, even though the scale is doing exactly
   what it always did.
6. **Then move the chord, not the home.** Every count in this pathway has been taken over the mode's
   own tonic triad, because that is the chord a vamp holds. Use the recomputed table above, two rows
   worked and one mentioned:
   - **Aeolian over `F`.** Over `Am` the `F` was the one note to move through. In `Am`–`F` the second
     chord is `F A C` — and the `F` is now the root of the chord under your hand. The note you had to
     keep moving through is a note you can land on and hold. Nothing else in A natural minor clashes
     with `F` either.
   - **Dorian over `D`.** Over `Am` there was nothing that fought at all. Over the `D` (`D F# A`)
     that makes `Am`–`D` a Dorian vamp, the `b7` (`G`) sits a half step above the `F#` — so the mode
     with no avoid note over home acquires one the moment the second chord arrives.
   - One clause for the third: **Lydian's `5` (`E`) is a half step above the `D#` in `B`**, so the
     same thing happens in the major family.
7. **The line that must not be crossed.** Naming a clash over a chord is not the same as naming a
   different mode per chord. Say only that these are notes, chords and semitones; the question of
   what to *call* the scale over each chord belongs to the closer, which explains why it is a
   different topic. One clause forward, no more.

Live:

- `scale-compare` `{ root: "A", scales: ["locrian"], drone: true }` — a single reference card, so
  **no amber chips anywhere**. Instruction: start the drone and tap `Bb`, then `F`, then `Eb` against
  the held `A`. Then the honesty caveat both previous keystone lessons made, in two sentences: the
  drone holds the root and not the whole chord, so this is not the clash itself. For that, hold a
  real `Adim` from **Chord Shapes** and let a `Bb` ring over it.

Callout (`tip` or `info`, one idea): the avoid note is not a fact about the scale — ask it of the
chord under your hand, and ask it again when the chord changes.

### 4 · `modes-when-a-progression-functions` — "When the Progression Starts to Function"

Section id `modes.ch5.when-a-progression-functions` · ~650 words · `tags: ["modes","theory","ear"]` ·
`estimatedMin` 5.

**The one thing it teaches**: what makes a progression functional is that one of its chords is an
**arrival** — and a progression with an arrival names its own tonic, whichever mode you meant.

**What came before**: chapter 1 already established that a mode dies when the harmony starts moving.
**This lesson does not repeat that; it says what "starts moving" actually means.** Link
`modes-when-the-harmony-moves` in the opening paragraph, name what it showed in one sentence, and
then go past it.

Key points in order:

1. Open on what chapter 1 left unexplained. `Am`–`D` refused to name a key; `Am`–`D`–`G` named `G`
   without hesitation. The chords barely changed. **What changed is that the third chord was an
   arrival** — somewhere the other two were leaning, and somewhere the loop came to rest.
2. **A vamp asserts its tonic by refusing to leave. A progression asserts its tonic by arriving.**
   Both name a home; only the first leaves the scale's colour exposed, because only the first keeps
   one chord underneath long enough for a single note to be heard against it.
3. **The demonstration, and it is deliberately not on `A`.** Flag the step in a clause — one
   progression, off the anchor root, because it is the one every guitarist gets asked about.
   `Dm`–`G`–`C` is built entirely from the notes of C major, starts on `Dm`, and is the progression
   people mean when they say "D Dorian". Play it into the **Key Detector** and it comes back
   **Likely**, `C major`, one answer, no percentages offered at all. **There is no D Dorian here.
   There is C major, and a piece that starts on its second degree.**
4. **The sharpening, which is this lesson's new data.** `Dm`–`G` on its own is still a vamp — two
   chords going nowhere — and the detector reads it **Ambiguous**, two cards at `G major` 52% and
   `D minor` 48%. Add the `C` and it reads Likely `C major`. **It is not the number of chords. It is
   whether one of them arrives.**
5. **What the meter does**, described qualitatively and never as raw confidence. On the ambiguous
   loops the strength meter barely lights at all — one segment. On `C`–`F`–`G`–`C`, four chords with
   nowhere left to go, it runs nearly the whole way across. That bar is a margin over the runner-up,
   not a probability.
6. **What the detector is and is not saying.** It ranks 24 keys, major and minor, and has no name for
   a mode. Chapter 1 said this; reference it rather than re-arguing it. **Ambiguous does not mean
   "this is a mode"** — it means no key explains the loop, which is precisely the condition a mode
   needs and precisely why the reading is useful here.
7. Close by pointing at the question the learner will now be asked everywhere, without answering it.

Live:

- `progression-player` `{ chords: ["Dm", "G"], bpm: 66, caption: "…" }`
- `progression-player` `{ chords: ["Dm", "G", "C"], bpm: 66, caption: "…" }`

Two blocks, and the difference between them is the lesson. Do not add a third; `C`–`F`–`G`–`C` is
described in prose as something to try on the Key Detector, not drawn.

### 5 · `modes-a-different-question` — "Two Questions That Sound Alike"

Section id `modes.ch5.a-different-question` · ~650 words · `tags: ["modes","theory"]` ·
`estimatedMin` 5 · **chapter closer.**

**The one thing it teaches**: "which mode do I play over this chord" and "what mode is this piece in"
are different questions that share a vocabulary, and keeping them apart is what stops modes being
confusing for years.

**What came before**: everything. A functional progression names its own tonic.

Key points in order:

1. Open on the question itself, in the form the learner will actually meet it: *play D Dorian over
   the `Dm`, G Mixolydian over the `G`, C Ionian over the `C`.* Seven familiar names, one chord each.
2. **Take it seriously before separating it.** It is a real practice with a real job — labelling the
   notes available over a chord that is on its way somewhere else, one chord at a time. It has a
   name, **chord-scale theory**, and it borrows the mode names because the note sets genuinely are
   the same.
3. **Then say exactly what is different, in the pathway's own terms.** This pathway's mode is a claim
   about **home**: a note set plus a tonic asserted from outside plus a home worth asserting. Over
   `Dm`–`G`–`C` there is one home and it is `C` — `modes-when-a-progression-functions` just showed
   the detector agreeing without hesitation. So "D Dorian over the `Dm`" is not a claim that the
   music is in D Dorian. It is a label for a note set over one chord, in a key something else is
   naming. The mode is doing no work as a home there at all.
4. **The blunt version, and it is honest**: this pathway's whole thesis is that a note set with no
   home is not a mode. Which is why teaching both under one word is what makes modes confusing.
   **State the distinction; do not teach the practice, do not work an example over a `ii`–`V`–`I`,
   and do not disparage it.** It is out of scope, and it is out of scope because it assumes moving
   harmony where a mode needs still harmony.
5. **The test to carry away.** Written as a short list, and it is the chapter in three lines:
   - Is something holding one home still, rather than moving through several?
   - Is that home a chord you can stand on?
   - Which single note are you leaning on against it?
   If the first two are yes, the third has an answer and you are playing a mode. If the first is no,
   you are playing in a key, and the mode names are labels rather than homes.
6. **The chapter's summary table** — a `table` block, not a live block. Mode, home chord, whether it
   holds. Six that hold and one that does not, with the reason in the last column. This is what
   "you can now say why a mode works" looks like on one screen.
7. Close the chapter and hand to chapter 6. What is left is playing: taking each vamp, finding the
   characteristic note inside the windows already owned, and leaning on it hard enough to be heard.
   **Do not state the vamp rule, do not teach technique, and do not describe naming a mode by ear.**
   Chapters may be named by number; **lessons may not**.

Live: **none.** This lesson is an argument about what two sentences mean, and there is nothing in the
app that draws it. A `table` block and links do the work.

Screens: **Drone** and **Key Detector**, one link each at most.

---

## The activity — `modes-the-fifth-that-left`

Section id `modes.ch5.the-fifth-that-left` · `"optional": true` · `note-play`, modes `easy` and
`hard`, document board frets 0–5.

The chapter's one physical thing, and it is deliberately about **the fifth**, not about playing
Locrian as a mode: find the chord that will not hold, then watch the fifth flatten in two windows and
run out of neck in one of them.

It stays clear of the four existing `modes` activities. `modes-same-notes-new-home` keeps one note
set and walks it from two homes; `modes-walk-the-ladder` takes the chain of fifths and the four dial
settings as bare notes on strings 5 and 4; `modes-find-the-dial` works the **major** family's G and C
forms; `modes-raise-the-sixth` works the `b6`→`6` move. None of them touches the `5`→`b5` step or the
`Adim` grip.

**Every target checked for pitch collisions within its round.** Open-string MIDI: string 1 = 64,
2 = 59, 3 = 55, 4 = 50, 5 = 45, 6 = 40.

| Round | Board | Prompt content | Targets (`string·fret`), ordered | MIDI |
| ----- | ----- | -------------- | -------------------------------- | ---- |
| `r_modes-the-fifth-that-left.the-chord` | 0–2 | The grip the article plays: `Adim` as `x 0 1 2 1 x`, low to high — `A`, `Eb`, `A`, `C`. The `Eb` is the flattened fifth, and it is the reason this chord will not hold. | `5·0 4·1 3·2 2·1` | 45 51 57 60 |
| `r_modes-the-fifth-that-left.g-form` | 1–5 | The G form, frets 1 to 5: A Phrygian's two `5`s, then the two `b5`s Locrian puts one fret below each of them. Both stay inside the window. | `4·2 2·5 4·1 2·4` | 52 64 51 63 |
| `r_modes-the-fifth-that-left.at-the-nut` | 0–3 | The A form at the nut: three `5`s, two of them open `E` strings — then the only `b5` left, because the other two flatten to a fret that does not exist. | `6·0 4·2 1·0 4·1` | 40 52 64 51 |

All three rounds `"ordered": true`. Every target verified inside its round's board, on a six-string
neck, and every MIDI value distinct within its round. Every position verified against the recomputed
window table above and against the `Adim` chart `readProgression` returns.

Round 3 is the one that carries content past the drill: it is the same 17 → 15 case lesson 1 draws,
made physical — you play three fifths and can only find one flattened one.

---

## The checkpoint — `modes-ch5-checkpoint`

`kind: "checkpoint"` · `passThresholdPct` 70 · **7 questions**, written **after** the five articles
were read, from what they actually say. Referenced only from the chapter's `checkpoint` field, not as
a section — matching chapters 1–4 and every sibling pathway.

| # | id suffix | Draws on | Tests |
| - | --------- | -------- | ----- |
| 1 | `no-fifth` | `modes-locrian` | `Adim` as the home chord, the missing perfect fifth, and that the tritone is inside the triad |
| 2 | `no-vamp` | `modes-locrian` | Why there is no Locrian vamp, and what the Key Detector actually returns when you try to build one |
| 3 | `what-home-needs` | `modes-what-home-needs` | `multi-select` — what a tonic needs, and what is *not* required |
| 4 | `avoid-general` | `modes-avoid-notes-everywhere` | The definition applied to a chord that is not the tonic — Aeolian's `b6` over `F`, or Dorian's `b7` over `D` |
| 5 | `locrian-b6` | `modes-avoid-notes-everywhere` | Why Locrian's `b6` is not an avoid note although Aeolian's is — the chapter's payoff |
| 6 | `arrival` | `modes-when-a-progression-functions` | That an arrival, not a chord count, is what makes a progression name its own tonic — and what `Dm`–`G`–`C` reads as |
| 7 | `two-questions` | `modes-a-different-question` | The difference between "which mode over this chord" and "what mode is this in" |

All five lessons are covered, weighted toward what the chapter claimed the learner would be able to
do: say **why** a mode works. Distractors encode this chapter's real misunderstandings — "Locrian is
unplayable", "an avoid note is a property of the scale", "Ambiguous means the detector heard a mode",
"more chords means more certainty", "chord-scale theory is what this pathway has been teaching" —
never filler. **No question refers to an option by letter or position.** Every question carries an
`explanation`. **No `listen` question**: a `listen` question plays bare notes with no drone and no
accompaniment, so it cannot test a modal claim.

---

## Errata found while reviewing the drafts

**Twenty-two corrections** were made to drafts that both lesson agents had reported clean, after reading
every article line by line and recomputing everything numeric. Recorded here because most will recur.

### False claims

1. **A false count.** `modes-locrian`: *"Every other mode you've met needed exactly one degree changed
   from a scale you already own."* **Ionian and Aeolian need zero** — they *are* the two scales the
   learner owns. Rewritten as "No other mode in this pathway sits more than one degree away from a
   scale you already own", which is exactly true. Note that `modes-no-new-shapes` shipped the same
   looseness in chapter 1 ("six of the seven need exactly one moved") and was left alone.
2. **A false explanation of the Chord Detector.** `modes-locrian` glossed the two alternate readings
   as *"what the analyser offers when three notes don't settle on one obvious centre"*. The analyser
   offers alternate readings for **every** chord — `Am` comes back as `Am` / `C6/A` / `Esusb6/A`.
   Rewritten around that checkable example.
3. **A false uniqueness claim.** `modes-locrian`: *"`Adim`–`Eb`, the one chord inside A Locrian that
   carries the `b5`."* Three of its seven triads hold the `Eb` — `Adim`, `Cm` and `Eb`. Rewritten as
   "the chord A Locrian builds on the `b5` itself".
4. **A citation transposed onto a tonic the study never used.** `modes-locrian` framed Temperley &
   Tan's exclusion as being about "a melody using those seven notes with a tonic of `A`". Their
   melodies were **always on a tonic of C**. Reframed so the verbatim quotes stay verbatim and no
   tonic is attributed.
5. **A false claim about where every other mode's tritone sits.** `modes-what-home-needs`: *"In every
   other mode, the least stable interval sits somewhere inside the scale, away from the tonic
   triad."* Only **Ionian and Aeolian** miss the tonic triad; Lydian's touches the `1`, Mixolydian's
   the `3`, Dorian's the `b3`, Phrygian's the `5`. `modes-the-tritone` already ships the correct
   membership. Rewritten to the true claim — Locrian is the only one whose tritone has **both** notes
   inside the triad.
6. **An interval written upside down.** `modes-what-home-needs`: *"a chord with a perfect fifth
   underneath its root"*. A fifth is above the root.
7. **An invented detail in a reference to shipped content.** `modes-when-a-progression-functions`
   said `Am`–`D`–`G` commits to `G` major *"within two bars"*. `modes-when-the-harmony-moves` says
   "before the loop even makes it back around". Corrected.
8. **The strength meter attributed to the ear.** `modes-when-a-progression-functions`: the meter runs
   nearly full on `C`–`F`–`G`–`C` *"because there's even less room left for the ear to argue"*. The
   meter is the leading key's margin over the runner-up, not anything about a listener. Corrected.
9. **A paragraph contradicting its own lesson.** The same article closed a section with *"Add enough
   movement and it starts leaning toward a single chord"* — the lesson's whole thesis is that the
   chord **count** is not what decides. Rewritten so the two agree.

### Meta-instruction leaking into learner-facing prose — four instances

10. `modes-what-home-needs` opened a paragraph with **"Argue it from the guitar, not from
    acoustics."** — the plan's directive, verbatim.
11. `modes-what-home-needs`: *"None of this makes `Adim` a bad chord, **and it's worth saying plainly
    so this doesn't read as a complaint about the chord itself**."* — the plan's rationale, verbatim.
12. `modes-avoid-notes-everywhere`: *"**And one clause for the major family, so the pattern isn't only
    a minor one**: Lydian's own `5`…"* — the plan's directive, verbatim.
13. `modes-avoid-notes-everywhere`: *"one line, and it's **the only definition this lesson needs**"* —
    authorial register. All four rewritten as prose addressed to a learner. **Marking the two
    registers at the top of this plan did not prevent this**; it is the single most persistent
    failure in this pathway.

### Banned constructions

14. **"the last lesson"**, in `modes-what-home-needs`. Sections are not numbered on screen and the
    reference breaks on reorder. Replaced with a link by slug.
15. **A chapter count that contradicted itself.** `modes-a-different-question` said "five chapters" in
    one paragraph, "six chapters" two paragraphs later, and "Six chapters in" in the closer. The
    learner has completed **five** at that point. Made consistent.

### Broken sentences

16. **A link title used as a noun in a list.** `modes-a-different-question`: *"a note set, plus a
    tonic asserted from outside the scale, plus What a Tonic Actually Needs."* The third item was
    supposed to be "a home worth asserting"; the link swallowed it and the sentence meant nothing.
17. **A link title used as a sentence subject.** The same article's closing paragraph: *"Locrian, and
    the Home That Won't Hold is the only row that says no."* Rewritten.
18. **A garbled clause.** `modes-locrian`: *"…more than from any other of the seven, where A natural
    minor uses all six without exception."* Split into two sentences.

### Presentation

19. **A seven-column table.** `modes-avoid-notes-everywhere` authored the avoid-note table as seven
    columns and one row. `table` sizes columns equally, so on a phone that is seven slivers, one of
    which has to hold `b2`, `b6`. Reoriented to two columns and seven rows, matching the shipped
    `modes-half-steps` and `modes-the-tritone` tables.
20. **A `caged-shape` caption that was wrong rather than duplicated.** *"The last window before the
    fifth drops"* — the A form is not the last window; Phrygian is the last mode. Replaced with a
    caption that adds a count. **Zero captions restated a heading**, which chapters 3 and 4 both
    warned about.
21. **A perceptual claim smuggled into a naming fact.** `modes-what-home-needs`: `A5` *"still names
    `A` unmistakably"*. Softened to the naming fact alone.
22. **Two wrong `readingTimeMin` values.** `modes-locrian` was 4 for 891 words (5) and
    `modes-when-a-progression-functions` was 4 for 574 (3). Both recomputed at ~200 wpm.

---

## Notes for chapter 6, and for the top level

- **The pathway's own `summary` in `curriculum/modes.json` is wrong.** It ends "…how every mode is a
  window you already know with a **single dot moved**." That is the claim `modes-no-new-shapes`
  corrected in chapter 1 and that this chapter's first lesson contradicts directly: Locrian needs
  two changed degrees. The field belongs to the top-level session, so it was **not** edited here.
- **`estimatedMin` on the pathway is still the top level's original guess of 270.** Chapters 1–5 now
  total **207** section-minutes (39 + 40 + 47 + 46 + 35). §8 says recompute it at the end; no chapter
  agent has touched it.
- **Chapter 6 owns the vamp rule.** Nothing in this chapter states it. What this chapter does supply
  is the negative case the rule explains — Locrian has no vamp because its tonic will not hold, so
  there is nothing for a second chord to move against. That is compatible with, and does not
  pre-empt, "the second chord of a modal vamp is the one that contains the characteristic note".
- **Chord-scale theory is now named once, in `modes-a-different-question`, and explained as a
  different topic.** Chapter 6 should not re-open it.
- **Which modes on `A` contain each vamp's second chord**, recomputed and unchanged from chapter 4's
  hand-off: `B` → Lydian only. `G` → Mixolydian, Dorian, Aeolian. `D` → Ionian, Mixolydian, Dorian.
  `F` → Aeolian, Phrygian, Locrian. `Bb` → Phrygian, Locrian. `Am` itself → Dorian, Aeolian,
  Phrygian.
- **New verified Key Detector readings**, for any chapter that wants them: `Adim`–`Bb` Likely
  `Bb major`; `Adim`–`Eb` Ambiguous `G minor` 54 / `Bb major` 46; `Am`–`Adim` Likely `A minor`;
  `Dm`–`G` Ambiguous `G major` 52 / `D minor` 48; `Dm`–`G`–`C` Likely `C major`; `C`–`F`–`G`–`C`
  Likely `C major`.
- **"The ear finds it within two chords" is too strong**, and chapter 5 now ships the refinement. Run
  on the engine, `Dm`–`G` — two chords of a textbook functional progression — reads **Ambiguous**.
  Adding the `C` is what settles it. What decides is whether one chord is an **arrival**, not how
  many there are. `modes-when-the-harmony-moves` says "usually within two chords", which is hedged
  enough not to be contradicted; the brief's arc line for this chapter is not.
- **The diatonic triads of A Locrian**, recomputed, for anyone who needs them: `Adim`, `Bb`, `Cm`,
  `Dm`, `Eb`, `F`, `Gm`. Three of them hold the `Eb` — `Adim`, `Cm` and `Eb`.
- **Chord symbols verified as parsing in `progression-player`** beyond the brief's list: `Eb` and
  `Cm` both parse. `Adim` renders as `x 0 1 2 1 x`, `A5` as `x 0 2 2 x x`.
- **The `caged-shape` caption warning and the "diff tint is always amber" note both worked.** Zero
  captions duplicated a heading and no chip was called a non-amber colour in this chapter. Keep both
  warnings in the dispatch contract.
