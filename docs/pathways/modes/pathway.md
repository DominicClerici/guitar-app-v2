# The Modes, and Why They Sound Like That

The brief every chapter agent inherits. Read it end to end before planning your chapter, and read
`LEARNING_CREATION.md` before writing anything.

- **Pathway id / slug**: `path_modes` / `modes`
- **Difficulty**: `advanced`
- **Anchor root**: **A**, everywhere. Every mode in this pathway is an A mode.
- **Chapters**: 6, roughly 37 lessons
- **Prerequisites**: `caged-fretboard` and `minor-caged`. Strongly recommended, not required.

**This pathway is about sound.** Roughly half its lessons are "here is a mode, here is the one note
that makes it that mode, here is why that note does what it does, go and hear it." The neck lessons
are cheap precisely because the learner already owns every shape — see below. A chapter that drifts
into fifteen diagrams and four sentences about sound has failed its brief.

---

## Topic mastery

### A mode is a claim about home, not a starting note

This is the whole topic, and the sentence everyone gets wrong.

Play the notes of C major from `D` to `D` over silence and you have not played D Dorian. You have
played C major in an odd order, and the ear — reliably, in every key-finding model and every
listener — hears C major. A mode is not "the scale started somewhere else". **A mode is a set of
notes plus a decision about which one is home**, and the decision has to be made audible by
something outside the scale: a held root, a bass, a chord that will not move.

So the definition splits in two, and both halves are needed:

- **The notes**: seven of them, the same seven as some major scale.
- **The tonic**: which one everything is heard against.

Take the tonic away and the mode evaporates. This is why "modes are just the major scale started on
a different degree" is the single most damaging sentence in guitar pedagogy — it is *true about the
notes* and says nothing at all about the sound, so a learner who believes it practises the wrong
thing for months and correctly concludes that modes are useless.

Temperley & Tan put it exactly this way about Locrian, and the reasoning generalises to all seven:
you cannot compose a melody that sounds Locrian, because a melody using the five-flat scale with a
tonic of C "will almost always imply an alternative tonic". The scale does not decide; the emphasis
does.

### Two roads to a mode, and they answer different questions

The `minor-caged` pathway already taught this distinction for minor, and this pathway must **use its
words rather than reinvent them**. **There is no `minor-caged-two-roads` article** — an earlier
revision of this brief guessed at that slug. The real pair, both verified in the corpus, is
`minor-caged-the-same-seven-notes` (the relative road: A natural minor is C major read from its
sixth degree) and `minor-caged-the-three-that-drop` (the parallel road: A major and A minor differ
by exactly three notes). `minor-caged-what-decides-home` is the article that already argues a note
set has no key of its own, and is the best single link for chapter 1's opener.

**Relative** — keep the notes, move the home. A Dorian is G major played from `A`. This tells you
*where the notes are*, and on a guitar it is worth a fortune: you already know the shapes.

**Parallel** — keep the home, move the notes. A Dorian is A natural minor with the `b6` raised to a
natural `6`. This tells you *what changed about the sound*, and it is the only one of the two that
teaches you anything about how a mode feels.

**This pathway leads with parallel and uses relative as a shortcut.** That ordering is the reason it
is anchored on one root: seven modes all rooted on `A` can be compared note against note, and the
comparison is the lesson. The relative derivation gets its own lesson in chapter 1, is named as the
fast way to find the notes, and is then explicitly demoted — because a learner who navigates by
parent scale is thinking about G major while trying to sound like A Dorian.

### The seven, on A, verified

Every row recomputed from `SCALE_TYPES` in `mobile/src/lib/scale-library/catalog.ts` and from
`buildScale('A', id)`. **These are the spellings the app prints**, so prose that disagrees will be
contradicted by the chip right beside it.

| Mode | Notes | Degrees | Parent major | Home chord | Characteristic tone |
| ---- | ----- | ------- | ------------ | ---------- | ------------------- |
| Lydian | `A B C# D# E F# G#` | `1 2 3 #4 5 6 7` | E | A | `#4` (`D#`), violet |
| Ionian (major) | `A B C# D E F# G#` | `1 2 3 4 5 6 7` | A | A | — (the reference) |
| Mixolydian | `A B C# D E F# G` | `1 2 3 4 5 6 b7` | D | A | `b7` (`G`), amber |
| Dorian | `A B C D E F# G` | `1 2 b3 4 5 6 b7` | G | Am | `6` (`F#`), amber |
| Aeolian (natural minor) | `A B C D E F G` | `1 2 b3 4 5 b6 b7` | C | Am | — (the reference) |
| Phrygian | `A Bb C D E F G` | `1 b2 b3 4 5 b6 b7` | F | Am | `b2` (`Bb`), rose |
| Locrian | `A Bb C D Eb F G` | `1 b2 b3 4 b5 b6 b7` | Bb | Adim | `b5` (`Eb`), rose |

The "characteristic tone" column is not this brief's invention — it is `SCALE_TYPES[].accent`, the
tone the app's own neck tints, defined in the catalogue as "the one tone that separates a scale from
its nearest plain relative". `caged-shape`'s `scale` prop outlines exactly that dot, in exactly that
hue. **Tint the same degree in prose with the same tone mark** and diagram and paragraph agree.

Ionian and Aeolian carry `accent: null` — they are the references everything else is measured
against, so their diagrams have no tinted dot and their lessons have no single note to point at.
That is a fact about them worth saying out loud, not a gap.

### The brightness ladder — the structure that makes seven memorable

Order the modes by how raised their degrees are and something exact falls out: **each step down
flattens exactly one more note, and they flatten in the order `4 7 3 6 2 5`.**

| | Lydian | Ionian | Mixolydian | Dorian | Aeolian | Phrygian | Locrian |
| - | - | - | - | - | - | - | - |
| `1` | 1 | 1 | 1 | 1 | 1 | 1 | 1 |
| `2` | 2 | 2 | 2 | 2 | 2 | **b2** | b2 |
| `3` | 3 | 3 | 3 | **b3** | b3 | b3 | b3 |
| `4` | **#4** | 4 | 4 | 4 | 4 | 4 | 4 |
| `5` | 5 | 5 | 5 | 5 | 5 | 5 | **b5** |
| `6` | 6 | 6 | 6 | 6 | **b6** | b6 | b6 |
| `7` | 7 | 7 | **b7** | b7 | b7 | b7 | b7 |

Read left to right: each column differs from the one on its left in **exactly one degree**, and the
sequence of degrees that flatten is `4`, then `7`, then `3`, then `6`, then `2`, then `5` — which is
descending fifths, and is why the ladder is sometimes drawn on the circle of fifths.

**Mind the bolding, which is off by one column and has already misled a draft.** In every column but
the first, the bolded cell *is* the degree that changed from the column to its left (Mixolydian's
`b7`, Dorian's `b3`, Aeolian's `b6`, Phrygian's `b2`, Locrian's `b5`). **Lydian's bolded `#4` is the
exception** — Lydian is the leftmost column, so nothing changed *into* it; its `#4` is the note that
Ionian flattens to a plain `4`. Ionian's `4` is therefore the unbolded cell that the caption's rule
would have you bold. If you reproduce this table in content, bold by a rule you state. **It is pinned** in
`mobile/src/lib/guitar-positions/caged.test.ts` ("separates each mode from its neighbour by exactly
one degree"), so a chapter may state it flatly.

Two consequences worth a lesson each:

- **Neighbours on the ladder differ by one note.** Lydian and Ionian, Ionian and Mixolydian,
  Mixolydian and Dorian, and so on. Every `scale-compare` block in this pathway should pair
  neighbours, reference first, so the amber tint lands on exactly the note the lesson is about.
- **The ladder splits into two families at Mixolydian/Dorian**, because that is where the `3`
  flattens. Everything above has a **major** home chord; everything below (until Locrian) has a
  **minor** one. So there are not seven scales to learn; there are two homes with two dials each.

### The two families and their dials — the pathway's spine

| Family | Home chord | The dials | Bright → dark |
| ------ | ---------- | --------- | ------------- |
| Major | A | the `4` and the `7` | Lydian `#4 7` · Ionian `4 7` · Mixolydian `4 b7` |
| Minor | Am | the `6` and the `2` | Dorian `2 6` · Aeolian `2 b6` · Phrygian `b2 b6` |
| — | Adim | — | Locrian, which is why it is a chapter of its own |

Chapters 3 and 4 are exactly these two rows. A learner who leaves with nothing else should leave
with this table.

### Why each one sounds the way it does — three real causes

This is the section chapters 3–5 are built from. Anything a lesson says about sound should reduce to
one of these three, or to the evidence section further down. Nothing else is licensed.

**1. Where the half steps fall relative to home.** A diatonic scale has two half steps; a mode is
distinguished by where they land against the tonic.

- A half step **above** the tonic — Phrygian's `b2` — leans on home from above and is the strongest
  darkening move available. It is also why Phrygian is instantly recognisable: no other mode has it
  except Locrian.
- A half step **below** the tonic — the major `7`, a leading tone — pulls up into home. **Only Lydian
  and Ionian have it**; the other **five** (Mixolydian, Dorian, Aeolian, Phrygian, Locrian) have a
  `b7` a whole step below, which is why they never sound like they are being tugged home the way a
  major key does. (An earlier revision said "the four flat modes". It is five — recomputed.)
- A half step **above the fifth** — a perfect `5` with a `b6` sitting on top — is the ache in natural
  minor. **Exactly two modes have it: Aeolian and Phrygian.** Dorian's whole point is that it does
  not. **Locrian does not have it either**, and it is the easy mistake here: Locrian's fifth is a
  `b5`, so its `b5`→`b6` gap is a *whole* step. "The three modes with a `b6`" is the wrong set — a
  `b6` only makes this half step when there is a perfect fifth underneath it.

**2. The tonic triad, and whether home is a place you can stand.** Major, minor, or diminished. A
diminished tonic has no perfect fifth, and a chord with no perfect fifth cannot function as home —
which is the entire Locrian problem, stated as a fact rather than an opinion.

**3. Where the tritone lands.** Every diatonic scale contains exactly one tritone. Which two degrees
it falls on, *relative to your tonic*, changes everything:

| Mode | Tritone between | What that does |
| ---- | --------------- | -------------- |
| Lydian | `#4` and `1` | The tritone is measured off the root itself — the "floating" quality is this |
| Ionian | `4` and `7` | Both non-chord tones; the tonic triad is untouched, which is why Ionian is the stable one |
| Mixolydian | `3` and `b7` | The two notes of a dominant seventh chord — this is why `A7` *is* the Mixolydian sound |
| Dorian | `b3` and `6` | Between the two notes that define it; the `6` rubs against the minor third |
| Aeolian | `2` and `b6` | Away from the tonic triad, which is why natural minor is the stable minor |
| Phrygian | `b2` and `5` | The `b2` against the fifth |
| Locrian | `1` and `b5` | Against the root **and** inside the tonic triad — home is a tritone |

Mixolydian's row is the most useful one in the pathway: it explains in one line why a dominant
seventh chord and the Mixolydian mode are the same idea, and it is why the seventh is allowed here
(see Conventions).

### Why a mode collapses, and what holds it up

A mode needs harmony that will not move. Over `Dm–G–C` there is no D Dorian — there is C major,
because a functional progression *names* its own tonic. **"The ear will find it within two chords"
was an earlier revision's overstatement; it is the arrival, not the count.** Verified on the real
engine: `Dm`–`G` reads **Ambiguous**, and it is the `C` that settles it to a **Likely** C major. A
vamp asserts its tonic by refusing to leave; a progression asserts one by arriving. Chapter 5 ships
that refinement. This
is the practical half of misconception 1 and it deserves its own lesson in chapter 1 and a chapter
of its own at the end.

What holds a mode up is a **vamp**: two chords, or one, that assert the tonic and refuse to resolve
anywhere else. And there is a single rule underneath all of them, which is one of the best things
this pathway has to teach:

> **The second chord of a modal vamp is the one that contains the characteristic note.**

Verified against the spellings above:

| Mode | Vamp | Second chord's notes | Carries |
| ---- | ---- | -------------------- | ------- |
| Lydian | `A` – `B` (`I` – `II`) | B `D#` F# | the `#4` |
| Mixolydian | `A` – `G` (`I` – `bVII`) | `G` B D | the `b7` |
| Dorian | `Am` – `D` (`i` – `IV`) | D `F#` A | the `6` |
| Aeolian | `Am` – `F` (`i` – `bVI`) | `F` A C | the `b6` |
| Phrygian | `Am` – `Bb` (`i` – `bII`) | `Bb` D F | the `b2` |
| Locrian | — | — | there isn't one; that is chapter 5 |

An earlier revision claimed each second chord is **unavailable in the neighbouring mode**, so that
the vamp "rules out the neighbour in the same gesture". **That is true of exactly one of the five**
and was corrected in chapter 6. Recomputed — which modes each second chord fits inside at all:

| Vamp | Second chord | Fits inside | Also fits a ladder neighbour? |
| ---- | ------------ | ----------- | ----------------------------- |
| `A`–`B` | `B` | Lydian only | no — the one case the old claim held |
| `A`–`G` | `G` | Mixolydian, Dorian, Aeolian | yes (Dorian) |
| `Am`–`D` | `D` | Ionian, Mixolydian, Dorian | yes (Mixolydian) |
| `Am`–`F` | `F` | Aeolian, Phrygian, Locrian | yes (Phrygian) |
| `Am`–`Bb` | `Bb` | Phrygian, Locrian | yes (Locrian) |

**The vamp still works, and the real reason is better content than the old one: the two chords do the
job together.** Count the home chord's quality and four of the five pin their mode exactly — the only
modes with a major home are Lydian, Ionian and Mixolydian, so `A`–`G` can only be Mixolydian; the
only ones with a minor home are Dorian, Aeolian and Phrygian, so `Am`–`D` can only be Dorian and
`Am`–`Bb` only Phrygian. **`Am`–`F` is the exception**: `F` sits inside Phrygian as well, and both
have a minor home, so Aeolian's vamp satisfies the rule and still cannot name its own mode. Chapter 4
closes on that and chapter 6 builds the rule around it. All of these parse in `progression-player`; so do `Am7`, `A7`,
`Amaj7`, `Bb`, `Adim` and `A5`, all checked.

### What the evidence actually supports about how modes sound

A pathway this centred on sound will otherwise fill up with folklore. Tiered as **[established]**,
**[contested]**, **[convention, no evidence]** — a lesson may state the first plainly, must hedge
the second, and must not dress the third as a finding. The same discipline the `triads` brief uses.

- **[established]** **Listeners with no musical training reliably tell modes apart, including modes
  that differ by a single scale degree.** Temperley & Tan (2013, *Music Perception* 30/3) found
  significant differences in perceived happiness for 12 of the 15 mode pairs, and for all adjacent
  pairs but one. Verified against the paper: the three non-significant pairs are **Lydian/Mixolydian,
  Lydian/Dorian and Dorian/Aeolian**, so the single non-significant *adjacent* pair is
  **Dorian/Aeolian** — and note that two of the three involve Lydian, which is the anomaly below. This is the most encouraging fact in the pathway and chapter 1 should use it: the
  learner's ear can already do this; what it lacks is a name for what it is hearing.
- **[established]** **Modes get "happier" as degrees are raised — with one exception, and the
  exception is Lydian.** The proportion of trials each mode was judged the happier of a pair:
  Ionian **.83**, Mixolydian **.64**, Lydian **.58**, Dorian **.40**, Aeolian **.34**, Phrygian
  **.21**. Lydian is *not* the happiest despite being the brightest on the ladder; it lands **third
  of the six, between Mixolydian and Dorian**, and is not significantly different from either of
  them. (An earlier revision of this brief said "between Ionian and Mixolydian", which its own
  numbers contradict — `.58` is below Mixolydian's `.64`. Corrected against the paper.) Ramos,
  Bueno & Bigand (2011), a different lab and a different population, found the same anomaly —
  Ionian significantly higher in valence than Lydian, Lydian and Mixolydian not distinguishable.
  **Two independent studies agreeing that Lydian breaks the ladder is a genuinely interesting
  lesson**, and it is the honest correction to the internet's "Lydian is the brightest and happiest
  mode".
- **[established]** **Locrian is not really a mode you play.** Temperley & Tan excluded it from
  their experiment on the grounds that it is "virtually impossible to compose a melody that sounds
  Locrian" — a tonic with no perfect fifth will not be heard as the tonic — and called it "more of a
  theoretical possibility than a musical reality". Chapter 5 may state this as the finding it is.
- **[established, but attribute it carefully — two separate claims]** **Ionian, Mixolydian, Dorian
  and Aeolian are the common modes in rock**; Phrygian shows up in heavy metal and related styles.
  This is the **settled view of the theory literature** (Everett 2004, Moore 2001; Phrygian in metal
  from Biamonte 2010, Walser 1993), reported as generally agreed by Temperley & Tan — it is *not* a
  corpus finding, and a lesson must not present it as one. The **separate, weaker** quantitative
  claim is that Ionian is the most frequent: Temperley & Tan derive a scale-degree distribution from
  de Clercq & Temperley's harmonic analyses and observe that the seven major-mode degrees occur more
  often than any others, which *suggests* Ionian predominates. Mind the song count — the *Popular
  Music* (2011) article analysed **100** songs (the 20 top-ranked per decade, 1950s–1990s, from
  *Rolling Stone*'s "500 Greatest Songs"); the **200**-song figure belongs to the larger online
  `rock_corpus` dataset and is the number Temperley & Tan quote. Cite one or the other, not a blend.
  So the modes this pathway spends most of its time on are the ones the learner's own record
  collection is made of, and a lesson may say so.
- **[contested]** *Why* the happiness ordering happens. Temperley & Tan favour a mix of
  **familiarity** (Ionian is the most common mode, and happiness declines with distance from it) and
  **"sharpness"** (position of the tonic on the line of fifths). Familiarity alone predicts
  Mixolydian above Lydian, and for almost half their participants the reverse held. **Do not present
  either explanation as settled.** The pattern is solid; the cause is not.
- **[contested, lean against]** "Minor sounds sad" as a human universal — inherited unchanged from
  the `triads` brief. The acoustic difference is real; the sadness is largely learned. Say the sound
  has a basis; do not say the feeling does.
- **[convention, no evidence]** Every named mood — "Lydian is wonder", "Phrygian is Spanish",
  "Dorian is hopeful". These are **repertoire associations**, and they are worth teaching *as
  associations*: Phrygian sounds Spanish because flamenco uses it, not because a `b2` is Spanish.
  Framed that way they are true, useful and memorable. Framed as psychoacoustics they are false.
  The app's own `character` strings ("Minor with a bright 6th — hopeful rather than sad") are
  written in this register and are a good model for the voice.
- **[convention, no evidence]** That a drone trains the ear. The two controlled studies found no
  measurable benefit, for intonation. **The drone's justification in this pathway is different and
  is not an empirical claim at all**: a mode does not exist without a tonal centre, so the drone is
  not a training aid, it is the thing that makes the mode be there. Say that; do not say it sharpens
  anyone's ear.

Caveats worth carrying: Temperley & Tan ran 17 nonmusician undergraduates at one university, using
binary forced choice on unaccompanied monophonic melodies — the *same* melody heard in two modes,
always on a tonic of C, with only the key signature altered. **Tempo was not a variable in that
study**; tempo variation belongs to Ramos, Bueno & Bigand (2011), which crossed three melodies with
three tempi and did find faster tempi more positive. (An earlier revision of this brief attached
"tempo varying" to Temperley & Tan. It is wrong; do not repeat it.) It is a careful study
and a small one. A lesson may cite the pattern; it may not imply a settled science of mode
perception.

### What is guitar-specific

This is the payoff of putting the pathway after `caged-fretboard` and `minor-caged`, and it should
be spent early rather than saved:

- **The learner already owns every shape.** They know the five CAGED windows of A major and the five
  of A minor. There is no new shape anywhere in six chapters, and chapter 1 should say so on the
  first screen. **State the "one dot moved" claim precisely, because it is not true of all seven.**
  Counting degrees that differ from the *nearer* of the two scales the learner owns — recomputed
  from `SCALE_TYPES`:

  | Mode | vs major | vs natural minor | Nearest |
  | ---- | -------- | ---------------- | ------- |
  | Ionian | 0 | 3 | **0** — it *is* the major scale |
  | Aeolian | 3 | 0 | **0** — it *is* the natural minor |
  | Lydian | **1** (`4`→`#4`) | 4 | 1 |
  | Mixolydian | **1** (`7`→`b7`) | 2 | 1 |
  | Dorian | 2 | **1** (`b6`→`6`) | 1 |
  | Phrygian | 4 | **1** (`2`→`b2`) | 1 |
  | Locrian | 5 | **2** (`2`→`b2` *and* `5`→`b5`) | **2** |

  So: **two of the seven are scales the learner already has, four need exactly one changed degree,
  and Locrian needs two.** An earlier revision of this brief asserted "one dot moved" of all seven;
  that is false for Locrian, and chapter 5 — which owns Locrian — must not inherit it. Chapter 1
  already ships the corrected wording ("six of the seven need exactly one; Locrian needs two").
- **A mode is a fingering change.** Aeolian to Dorian is one finger, one fret, on two or three
  strings. On a keyboard "raise the sixth" is an instruction about note names; here it is a physical
  move you make while the drone is still sounding, and the sound changes under your hand. That is
  the pathway's best single moment and chapter 4 should build a lesson around it.
- **The app already agrees.** `systemsFor()` gives CAGED positions to every seven-note scale, so
  `/scale-visualizer` set to A Dorian pages through "C form", "A form", "G form"… — the same names
  these three pathways have used throughout. Send the learner there constantly.
- **Open strings and the low E make drones free.** A learner can hold an open `A` and play against
  it without any app at all, and should be told so.
- **Everything still repeats at fret 12.**

### The window edge, which will bite a careless lesson — recomputed

Same trap as `minor-caged`, and worse in one direction. A window is a **fixed fret span anchored on
the root**, so raising a note moves it *up*, and a note on the top fret raises out of the picture
while a note below the bottom fret raises into it.

**"The same picture with one dot moved" is false as a caption**, and true of the note content rather
than the diagram. The true sentence: *every `b6` steps up to a `6`; roots, fourths and fifths never
move; and because the window's edges are fixed frets, a sixth on an edge steps across the frame.*
Pinned both ways in `caged.test.ts` ("moves only the changed degree inside a window, edges aside").

Worked example, recomputed — A Aeolian against A Dorian, positions written `string·fret` with
**string 1 = high e**:

| Form | Window | Aeolian dots | Dorian dots | `b6` at | `6` at |
| ---- | ------ | ------------ | ----------- | ------- | ------ |
| C | 9–13 | 17 | 16 | `1·13` `3·10` `6·13` | `3·11` `5·9` |
| A | 0–3 | 17 | 16 | `1·1` `4·3` `6·1` | `1·2` `6·2` |
| G | 1–5 | 18 | 18 | `1·1` `4·3` `6·1` | `1·2` `4·4` `6·2` |
| E | 4–8 | 17 | 17 | `2·6` `5·8` | `2·7` `4·4` |
| D | 6–10 | 18 | 17 | `2·6` `3·10` `5·8` | `2·7` `5·9` |

Read the E form row carefully, because it is the best teaching case and the easiest to get wrong:
the counts are **equal** (17 and 17) but the positions are not — `5·8` raises to nothing inside the
window while a `6` at `4·4` steps in from below. Equal counts, different picture. A lesson that says
"one fewer dot" is wrong in **two** of these five windows — the G form (18 and 18) and the E form
(17 and 17), the two equal-count rows above. (An earlier revision said three; count the table.) It
is right in the other three, so do not over-correct into "wrong for most windows" either — that is
the opposite error, and chapter 1 caught a draft making it.

**Full dot counts per window, root A, every mode** — recomputed, for chapters that need an anchor:

| Form | Window | Lydian | Ionian | Mixolydian | Dorian | Aeolian | Phrygian | Locrian |
| ---- | ------ | ------ | ------ | ---------- | ------ | ------- | -------- | ------- |
| C | 9–13 | 18 | 18 | 17 | 16 | 17 | 17 | 17 |
| A | 0–3 | 12 | 13 | 15 | 16 | 17 | 17 | 15 |
| G | 1–5 | 17 | 17 | 17 | 18 | 18 | 18 | 18 |
| E | 4–8 | 18 | 17 | 16 | 17 | 17 | 17 | 18 |
| D | 6–10 | 16 | 17 | 17 | 17 | 18 | 18 | 18 |

Note the A form at the nut: 12 dots in Lydian against 17 in Aeolian. **An earlier revision explained
this as "the sharp modes push notes off the bottom of a window clamped at fret 0". That is the wrong
direction.** Recomputed, the actual mechanism — and it is worth a lesson, so get it right:

- Raising a degree moves every occurrence of it **up** one fret. Any occurrence sitting on the
  window's **top** fret leaves the picture, and in a nut-clamped window **nothing can replace it from
  below**, because there is no fret −1. So raising can only lose dots or hold steady.
- Flattening moves them **down**. Occurrences sitting just **above** the top fret drop into the
  window, which is where the flat modes' extra dots come from — but an occurrence sitting **on fret
  0** drops to a fret that does not exist and is simply lost.

Worked, in the A form (0–3): Ionian→Lydian raises the `4`, the `D` on `2·3` leaves off the top and
nothing arrives, so 13 becomes 12. Ionian→Mixolydian flattens the `7` and three `G`s drop in from
above, so 13 becomes 15. Aeolian→Phrygian flattens the `2` and shows both halves at once — `3·3` is
gained from above while the open `B` on `2·0` is lost off the bottom, netting 17 to 17. **So
"flattening always adds dots" is also false**; state the mechanism, not a slogan. **Recompute your own chapter's numbers.** Every
previous pathway that scaled a table from this brief got it wrong.

**This 35-cell table was independently recomputed after chapter 1 and is correct in every cell** —
same window derivation the app uses (`CAGED_FORM_OFFSETS`, anchor tried at `base−12`/`base`/`base+12`,
`from` clamped at fret 0, minimum span 3), which is also what puts the A form at 0–3 and the G form
at 1–5 rather than an octave higher. Trust the numbers; still recompute anything you *derive* from
them, which is where every previous error actually came from.

### The misconceptions to build against

In order of how much damage they do. A lesson built against one of these is a good lesson.

1. **"A mode is a scale starting on a different note."** True about the notes, silent about the
   sound, and it sends the learner off to practise the wrong thing. Chapter 1's opener exists to
   kill it.
2. **"Modes are seven new scales."** They are one set of shapes and seven places to call home, and
   this learner already owns the shapes. Second only to (1) in how much it puts people off.
3. **"A mode survives a moving progression."** It does not. This is the practical form of (1) and
   the reason chapter 5 exists.
4. **"Modes are advanced, jazz-only material."** Ionian, Mixolydian, Dorian and Aeolian are the four
   common modes of rock, evidentially. Phrygian is metal. Say so.
5. **"Lydian is the brightest so it must be the happiest."** The evidence says otherwise, twice.
6. **"Locrian is a mode you can play in."** It is barely a mode at all, and saying exactly why
   teaches more about what makes a mode work than the six that do work.
7. **"You have to think in the parent scale."** The relative derivation finds the notes fast and
   then must be put down. A player thinking "G major" cannot make A Dorian sound like anything.

### Where the sources disagree

- **Whether to teach relative or parallel first.** A real and loud split. **This pathway leads with
  parallel** — one root, seven modes — and teaches relative once, in chapter 1, as a shortcut for
  finding notes. Justify it where the learner can see it: the relative approach cannot answer "why
  does this sound like this", which is what they came for.
- **"Aeolian" vs "natural minor", "Ionian" vs "major".** Both current. **This pathway uses the modal
  names throughout**, because the point of chapter 1 is that the two scales the learner already owns
  are members of a family of seven. It names each one's plain synonym once, at first use. Note that
  `minor-caged` deliberately banned the word "Aeolian" — that ban was scoped to that pathway, and
  chapter 1 here should acknowledge the rename in one clause so a learner arriving from it is not
  confused. The app's catalogue prints "Natural minor" and "Major" on the cards, with "Aeolian" in
  the character line, so both names are on screen either way.
- **Whether Locrian deserves teaching.** Many curricula skip it. **This pathway teaches it as a
  negative result** — a chapter about what a mode needs in order to work, using the mode that lacks
  it — which is more useful than either skipping it or pretending it is playable.
- **Naming the characteristic tone.** "Characteristic note", "defining note", "colour tone",
  "the mode's note" are all current. **This pathway says "characteristic note"** and ties it to the
  tinted dot the app draws.
- **The brightness ordering itself.** Universal among teachers, structurally exact, and *not* a
  perceptual measurement. Teach the ordering as the structural fact it is; hedge every claim about
  what it feels like, per the evidence section.

---

## Audience and prerequisites

Someone who has done `caged-fretboard` and `minor-caged`, or who knows the five major and five minor
CAGED forms from elsewhere. Assume:

- The five CAGED forms as windows that tile the neck, and that the letter names the form.
- Both the major scale and the natural minor scale in all five windows.
- Degrees, including altered ones: `b3`, `b6`, `b7` read fluently.
- The relative/parallel distinction, at least for minor.
- Open and barre chords are fluent.

**Chapter 1's first lesson must name both prerequisites** — one sentence, linking
`{"kind": "article", "slug": "caged-what-the-letter-means"}` and a `minor-caged` opener whose slug
you have checked exists, framed as strongly recommended. This pathway genuinely leans on both and
cannot be taken cold; without them the "you already own every shape" claim is empty.

The `triads` pathway is **not** a prerequisite. Chapter 5 and chapter 6 may link its diminished
lesson rather than re-teaching the diminished triad.

Do **not** assume: any prior exposure to the word "mode", any ability to name a note above fret 5
quickly, seventh-chord theory, or any jazz vocabulary.

## Out of scope

Named here so no chapter quietly annexes them:

- **Modal interchange and borrowed chords.** The most tempting neighbour and a follow-up pathway.
  Chapter 6 may name it in one sentence as what comes next; nothing more.
- **Modes of melodic minor and harmonic minor** — Lydian dominant, altered, Phrygian dominant,
  Lydian ♯2. The app's catalogue carries them and `/scale-visualizer` will show them; a lesson may
  say the family continues and may not teach one. `minor-caged` already spent its one lesson on
  harmonic minor's raised seventh, and this pathway does not revisit it.
- **Chord-scale theory** — "play D Dorian over the `Dm7` in a `ii–V–I`". This is the opposite of
  what the pathway teaches (a mode needs static harmony) and mixing them in six chapters would
  wreck both. Chapter 5 may explain *why* it is a different topic; it may not teach it.
- **Modes of the pentatonic**, and pentatonic box numbering. `minor-caged` closed that off.
- **Seventh-chord theory, shapes and voicings.** Sevenths appear as chord symbols in vamps only —
  see Conventions.
- **Composition, songwriting form, and arrangement.** Chapter 6 asks the learner to write a
  two-chord vamp; that is the ceiling.
- **Alternate tunings.** Standard tuning only.
- **Re-teaching CAGED or minor CAGED.** Link them; do not restate them.

---

## The arc

Six chapters. **Chapters 3 and 4 are the heart of the pathway** and each spends more lessons on
sound than on shapes; that ratio is binding, not a suggestion.

**Chapter 1 — What a mode actually is** (6 lessons, slug `what-a-mode-is`)
After it, the learner can say what makes A Dorian *A Dorian* rather than G major, knows they already
play two modes, can hold a drone and hear one set of notes change its mind, knows which of the two
derivations answers which question, and knows that a mode dies when the harmony starts moving. Kills
misconceptions 1, 2 and 3. This is the chapter that ties the pathway to its two predecessors, and it
should spend the "you already own every shape" news immediately rather than saving it.

**Chapter 2 — The brightness ladder** (6 lessons, slug `the-brightness-ladder`)
The seven in order; the one note between each neighbouring pair; the two families and their two
dials; where the half steps fall; the tritone's location; and an honest lesson on what "brighter"
does and does not mean, built on the Temperley & Tan result and the Lydian anomaly. After it, the
learner can order all seven, name the note between any two neighbours, and say which have a major
home chord and which a minor one.

**Chapter 3 — The major family** (7 lessons, slug `the-major-family`)
Ionian, Lydian and Mixolydian: the same home chord, two dials. Lydian and Mixolydian each get a
sound-and-why lesson **and** a neck lesson; Ionian gets one, since the learner owns it, plus the
avoid-note lesson (the natural `4` over the `A` chord, and why Lydian's `#4` has no such problem —
which is the real reason Lydian is worth knowing). After it, the learner can hear the difference
between the three, play each over its vamp, and say which single note they are leaning on.

**Chapter 4 — The minor family** (7 lessons, slug `the-minor-family`)
Dorian, Aeolian and Phrygian: the same home chord, two dials — the `6` and the `2`. Symmetrical with
chapter 3. This chapter owns the pathway's best physical moment: raising the `b6` to a `6` with the
drone still sounding, in a window the learner has known since `minor-caged`. After it, the learner
can play over a `i–IV` vamp and land on the `6` so it sounds Dorian and not Aeolian.

**Chapter 5 — Locrian, and when a mode collapses** (5 lessons, slug `when-a-mode-collapses`)
The negative-result chapter, and it is not filler. Locrian and why its home will not hold; what a
tonic actually needs; avoid notes as a general idea now that two have been met; what happens to a
mode when the progression starts to function; and why "which mode over this chord" is a different
question from "what mode is this piece in". After it, the learner can say why a mode works, not just
which notes it has.

**Chapter 6 — Playing modally** (6 lessons, slug `playing-modally`)
The applied chapter. The vamp rule made explicit (the second chord carries the characteristic note);
playing over each vamp through the CAGED windows; landing on and leaning on the characteristic note
rather than merely including it; hearing a mode cold and naming it; writing your own two-chord vamp;
and a closer that puts the seven back together on one neck. After it, the learner can hear a static
vamp and name the mode it is asking for, and can make a mode sound like itself rather than like its
parent scale.

### Keeping the mode lessons from being one lesson repeated

Each mode's sound lesson must carry that mode's own character. Written lazily this is one lesson
with a different note name substituted five times — the failure mode all three previous pathways had
to fight, and the risk is higher here because the *structure* of every mode lesson genuinely is the
same. What differs:

- **Lydian** — the only mode whose tritone is measured off the root, and the only bright mode with
  no avoid note over its own tonic chord. Its whole interest is that it is *more* consonant against
  a static major chord than Ionian is, and yet listeners rate it less happy. That tension is the
  lesson. Its vamp (`A`–`B`) is two major triads a whole tone apart, which sounds like nothing else
  on this list.
- **Ionian** — the reference, the most common mode in rock, and the one with an avoid note the
  learner has been playing over for years without a name for it. Do not treat it as a throwaway; the
  `4`-over-the-`I`-chord lesson is where "avoid note" gets defined for the whole pathway.
- **Mixolydian** — where the tritone becomes the dominant seventh, so the mode and the chord `A7`
  are the same idea. The most-played mode in rock rhythm guitar after Ionian. Its `b7` is one fret
  below a note the learner has been reaching for automatically since `caged-fretboard`.
- **Dorian** — minor without the ache, because the `b6` is gone. Its `6` sits a whole tone above the
  fifth where a minor scale puts a semitone, and that single gap is the whole sound. The `i–IV`
  vamp with a **major** IV over a minor tonic is the cleanest "one note changes the harmony" case in
  the pathway.
- **Aeolian** — the reference for the minor family, already owned, and the one whose lesson is
  mostly about *renaming* something the learner has. Its job is to be the thing Dorian and Phrygian
  are heard against, and its lesson should be honest that it is a hinge rather than a destination.
- **Phrygian** — the `b2`, the strongest single darkening move available, and the only characteristic
  note that is a half step from home. The `i–bII` vamp is two chords a semitone apart and sounds
  unlike anything else the learner has played. Name the flamenco and metal associations *as
  associations*.
- **Locrian** — not a sound lesson at all. A structural lesson about what home requires, with a real
  citation behind it.

---

## Conventions

Hold all of these. A chapter that breaks one costs the pathway its consistency.

| Thing | Convention |
| ----- | ---------- |
| String numbering | **1 = high e, 6 = low E.** Matches the app everywhere, and the quiz `fretboard` and activity `note-play` schemas. |
| Mode names | **The modal name is primary**: Ionian, Dorian, Phrygian, Lydian, Mixolydian, Aeolian, Locrian. Capitalised, never italicised. Name the plain synonym once at first use — "Ionian, which is the major scale you already know"; "Aeolian, which `minor-caged` called natural minor". Never "the Dorian scale"; it is "Dorian" or "the Dorian mode". |
| Root | **A**, everywhere, for every mode. Other roots appear only where a lesson is explicitly transposing, which is chapter 6 territory. Do not quietly demonstrate in D. |
| Parent scales | Named when the relative derivation is being used, and only then: "A Dorian's parent is G major". Never used as the primary way to identify a mode. |
| Degrees | `1 2 b3 #4 5 b6 b7` etc., always with the `code` mark. **These are exactly what `caged-shape` and `scale-compare` print** — prose and diagram must not disagree. Never `m3`, never `♭3` in prose (the `code` mark handles the glyph). |
| The characteristic note | Called **the characteristic note**. Tint it in prose with the same tone the component uses: Dorian's `6` and Mixolydian's `b7` **amber**, Phrygian's `b2` and Locrian's `b5` **rose**, Lydian's `#4` **violet**. Ionian and Aeolian have none — say so rather than inventing one. |
| The five shapes | **Forms**, letter bare and capital, as in both CAGED pathways: "the E form", "the E form of A Dorian". |
| Chord names | `A` for A major, `Am` for A minor, `Adim`, `A7`, `Am7`, `Bb`. Never "Amin", never "A-". |
| Roman numerals | Uppercase for major (`I`, `IV`, `bVII`, `bII`), lowercase for minor (`i`, `iv`), `i°` for diminished. `code` mark. |
| Sevenths | **Vamps only.** `A7` and `Am7` may appear as chord symbols in a `progression-player` block and be named in prose as "the seventh chord this mode gives you". Seventh-chord *theory*, shapes, voicings and inversions are out of scope. Mixolydian is the one mode whose lesson genuinely needs this; use it there and be sparing elsewhere. |
| Accidentals | **Spell by the mode**, following the table above: A Phrygian has a `Bb`, not an `A#`; A Locrian has an `Eb`. These are what `buildScale` produces, so a diagram will contradict any other spelling. |
| Grips | A **six-slot chart, low E first**, `x` for a string not played: `x 0 2 2 1 0`. Always six slots, always `code` mark. |
| Single positions | `5·3` — string, then fret, `code` mark. Spell it out ("string 5, fret 3") the first time a chapter leans on it. |
| Frets | "fret 3"; the nut is "fret 0" or "open". |
| Vamps | Written as chord symbols with the numerals beside them: "`Am`–`D`, a `i`–`IV`". Always name what the second chord carries. |
| Sound claims | Governed by the evidence tiering above. A mood may be named as an **association** with the music it comes from; it may not be asserted as an effect of the interval. |
| Note names | `code` mark, scientific pitch (`A3`) only inside a `listen` question's audio spec, never in prose. |
| Chapters | Safe to name by number in prose — the app prints "Chapter 2" on the card. **Lessons are not numbered on screen**; name the topic or link the article by slug, never "the last lesson". |
| Cross-pathway links | Link `caged-fretboard` and `minor-caged` articles by slug freely; that is the point. **Check the slug exists in the corpus before writing it** — a broken ref fails the publish. |

---

## Components and screens this pathway uses

Two components were **extended with new props before authoring began**, both specifically for this
pathway. Their catalogue rows in `LEARNING_CREATION.md` §7.3 are the authority — read that table,
not this section, when writing a `live` block.

- **`scale-compare` with `drone: true`** — the workhorse of chapters 1–4 and the reason the pathway
  can teach sound at all. It holds the root an octave under the run, and **every chip is tappable**,
  so a lesson can say "start the drone, then tap the `6`" and the learner hears the characteristic
  note against home. Without the drone the block runs a scale into silence, which is precisely the
  thing chapter 1 teaches does not work — so **any lesson making a claim about how something sounds
  must set `drone: true`**. Pair **neighbours on the ladder, reference first** (`["minor",
  "dorian"]`, not `["dorian", "minor"]`): the amber tint marks tones the later scale has that the
  first lacks, so ordered that way it lands on exactly the characteristic note. Up to 4 scales, so a
  whole family fits in one block.
- **`caged-shape` with `scale: "<id>"`** — the neck workhorse of chapters 3–5. Fills a CAGED window
  with any catalogue scale, heads the card `E form · A Dorian`, and outlines the characteristic tone
  in its own hue. `quality` and `show` are ignored when `scale` is set. **The window does not move**,
  so the same `root` + `form` at `quality: "minor"` and then at `scale: "dorian"` is one picture with
  one dot moved — which is the pathway's central neck claim, drawn rather than asserted. Read the
  window-edge section above before captioning one. Valid ids: `lydian`, `major`, `mixolydian`,
  `dorian`, `minor`, `phrygian`, `locrian`.
- **`caged-ladder`** — chapter closers only. It takes `quality`, not `scale`, so it draws the five
  windows and their roots and *cannot* show a mode's notes. That is fine for its actual job here
  ("here is where these five windows sit"), and a lesson must not imply it is drawing the mode.
- **`progression-player`** — chapters 1, 3, 4 and 6, and the only way a vamp becomes audible. Two
  chords is a legal progression and it plays each chord one per beat, twice round. Use the vamp
  table above. Consider a slow `bpm` (60–75) for a vamp meant to be heard as harmony rather than
  strummed along with.
- **`triad-shape` / `triad-ladder`** belong to the `triads` pathway. A lesson that wants one has
  drifted out of scope; link a triads article instead.

Screens:

| Href | Used for |
| ---- | -------- |
| `/drone` | **The primary destination, and the pathway's defining tool.** A sustained `A` to play every mode against. Send the learner here in chapter 1 and keep sending them. Set to a single note (`SINGLE_NOTE`) it holds a bare root, which is exactly what a mode needs. |
| `/scale-visualizer` | The neck destination. Every mode is in its catalogue and every one offers CAGED positions with the same form names this pathway uses. Chapters 3–5 constantly. |
| `/chord-shapes` | The vamp chords — `B`, `Bb`, `G`, `D`, `A7`. Chapters 3, 4 and 6. |
| `/key-detector` | Chapter 1 and chapter 5: play a modal vamp and a functional progression built from the same seven notes, and watch it call them differently. The sharpest possible demonstration that harmony decides the tonic. |
| `/chord-detector` | Chapter 5, on the diminished tonic: play `A C Eb` and see what it is called. |
| `/ear-trainer` | Chapter 6's hearing lesson only. |
| `/metronome` | Chapter 6's playing lessons. |

Anything not in `LEARNING_CREATION.md` §7.3 / §7.4 does not exist. If a lesson wants a widget that is
not there, **do not build it** — write the lesson with what exists and report the request upward,
per §6.

---

## Naming and ids

Fixed here so parallel agents cannot collide. Section ids are progress keys and are **never** renamed
once published.

| Thing | Pattern | Example |
| ----- | ------- | ------- |
| Chapter id | `modes.ch<N>` | `modes.ch4` |
| Section id | `modes.ch<N>.<name>` | `modes.ch4.dorian-sound` |
| Sound-lesson slug | `modes-<mode>-sound` | `modes-dorian-sound` |
| Neck-lesson slug | `modes-<mode>-neck` | `modes-dorian-neck` |
| Other article slug | `modes-<name>` | `modes-what-a-mode-is` |
| Checkpoint slug | `modes-ch<N>-checkpoint` | `modes-ch4-checkpoint` |
| Activity slug | `modes-<name>` | `modes-raise-the-sixth` |

Article ids are `art_<slug>`, quiz ids `quiz_<slug>`, activity ids `act_<slug>`, question ids
`q_<quiz-slug>.<name>`, round ids `r_<activity-slug>.<name>`. `publishedAt` is the date the chapter
is written. `passThresholdPct` is 70 everywhere, on both the quiz `meta` and the chapter
`checkpoint`.

Every document slug lives in one flat namespace across every pathway that will ever ship — hence the
`modes-` prefix on everything, without exception. The namespace was checked clean before authoring
began: no existing slug starts with `mode`. It does not collide with `caged-`, `minor-caged-` or
`triad-`, but check the corpus before settling a slug.

Section ids are validated against `/^[a-z0-9-]+\.[a-z0-9-]+\.[a-z0-9-]+$/` — exactly three
dot-separated lowercase-kebab segments, which `modes.ch4.dorian-sound` satisfies.

---

## Open questions resolved with the user

- **Anchor root — A, for all seven modes.** The parallel comparison is what makes a mode audible, and
  it only works on one root. A continues directly from `minor-caged`: A Aeolian is the scale the
  learner just finished, all naturals, so every other mode reads as a change to something they own.
  E was considered (the best drone on the instrument, and the classic Phrygian) and rejected for
  breaking continuity and for four and five sharps in the bright modes.
- **Components — extend rather than duplicate.** `scale-compare` gained `drone` and tappable chips;
  `caged-shape` gained `scale`. Both defaults are unchanged, so every existing article is untouched,
  and one component teaching four pathways is the better story. The drone deliberately sits **outside**
  `playbackBus`, because a drone is what another sound is heard against rather than a competing
  source.
- **Sevenths — vamps only.** Mixolydian's home chord genuinely is `A7` and teaching it as `I`–`bVII`
  triads alone would be slightly dishonest. Seventh-chord theory remains a separate topic.
- **Length — 6 chapters, roughly 37 lessons**, a little larger than its three siblings because the
  sound material is the point rather than an addendum. Chapters 3 and 4 give each mode both a sound
  lesson and a neck lesson; that split is the whole reason for the size.
- **Locrian gets a chapter, not a footnote** — but a chapter about *why a mode needs a stable home*,
  with Locrian as the worked counter-example. Five lessons, the shortest chapter.
- **Difficulty `advanced`**, unlike its three `core` siblings. It assumes both CAGED pathways, fluent
  altered degrees, and a willingness to sit with a drone. Flagging that honestly is better than
  matching the family for tidiness.
- **Modal interchange is deliberately the next pathway**, named once in chapter 6 and nowhere else.
