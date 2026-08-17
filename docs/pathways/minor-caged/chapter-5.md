# Chapter 5 — Playing in a Minor Key

Chapter id `minor-caged.ch5` · slug `playing-in-a-minor-key` · 6 articles, 2 activities, 1 checkpoint.
**The last chapter of the pathway.**

After this chapter the learner can name the seven chords a minor key gives them and find each one's
root without counting, comp a minor progression anywhere on the neck instead of returning to the nut,
raise the seventh when a progression asks for a leading tone and say why it asked, and move between a
minor key and its relative major without moving their hand.

---

## Structure decision

**Six lessons, and this chapter has no form lessons.** Chapters 2–4 were an opener, five form lessons
and a closer. The five windows are finished; this chapter is about what you play in them. The cut is
the one the pathway brief scoped, in the brief's own order:

1. **The chords the key gives you** — `i ii° III iv v VI VII`, and where their roots sit.
2. **The raised seventh** — `Em` becomes `E`, and that is the whole of harmonic minor's appearance here.
3. **Switching relatives** — C major and A minor from one hand position.
4. **A loop up the neck** — `Am F C G` played through the forms.
5. **Any minor key** — the ladder and the chords transpose together.
6. **The closer** — ends five chapters, not one.

**No departure from the six the brief specified**, and no reordering. Lessons 2 and 3 are the pair
most at risk of blurring (both are about a chord changing quality), so the boundary is stated hard:
**lesson 2 changes a note that is not in the key; lesson 3 changes nothing at all and moves the home
instead.** Neither may do the other's job.

**The sibling chapter this must not re-run.** `caged-fretboard`'s chapter 5 (`off-the-boxes`) is the
major pathway's applied closer. Its six lessons are the box criticism, shared notes, playing along a
string, a `C`–`F`–`G` progression through the forms, transposing, and a closer. Two of mine sit
directly opposite two of its:

| Its lesson | Mine | How they differ |
| --- | --- | --- |
| `caged-progression-up-the-neck` — `C F G`, no Roman numerals allowed, no live block for the loop | Lesson 4 — `Am F C G` as `i–VI–III–VII`, numerals throughout, and `progression-player` makes it audible | Different chords, different argument (a loop rather than three chords), and this one can be *heard* |
| `caged-transposing-the-ladder` — the wheel, the nut rule, barre frets = the key's major pentatonic on string 6 | Lesson 5 — the low-E anchor, the three open minor keys, and the **chords** transposing with the ladder | **The pentatonic reach-back is false in minor** (see below) and is banned. The wheel is stated in one compressed paragraph and linked, not re-derived |

Its other four lessons — the box criticism, shared notes, single-string playing — are **not** in scope
here and must not be imported. This chapter never argues about whether CAGED is a good system;
chapter 1 already answered the objection this pathway faces.

---

## Verified facts this chapter is built on

Everything below was **recomputed** in a scratch vitest file under `mobile/src/lib/`, deleted
afterwards, from the app's own `cagedFormWindows` / `cagedMarks`
(`mobile/src/lib/guitar-positions/caged.ts`), `buildChord` / `parseChordSymbol`
(`mobile/src/lib/chord-library`), `readProgression` (`mobile/src/lib/progressions`), `estimateKey`
(`mobile/src/lib/key-analysis`) and standard-tuning MIDI. **These are the numbers every lesson must
use.** String numbering is **1 = high e, 6 = low E**. Positions are `string·fret`.

### The seven chords of A minor

Stack thirds on each degree of `A B C D E F G`, using only those seven notes:

| Degree | `i` | `ii°` | `III` | `iv` | `v` | `VI` | `VII` |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Chord | `Am` | `Bdim` | `C` | `Dm` | `Em` | `F` | `G` |
| Notes | `A C E` | `B D F` | `C E G` | `D F A` | `E G B` | `F A C` | `G B D` |
| Third / fifth above the root, in semitones | 3 / 7 | 3 / **6** | 4 / 7 | 3 / 7 | 3 / 7 | 4 / 7 | 4 / 7 |

**Three minor, three major, one diminished.** Verified by computing every third and fifth. A minor key
is not made of minor chords, and that is the lesson's opening surprise.

C major harmonised the same way is `C Dm Em F G Am Bdim` — recomputed independently, **the identical
seven triads**, started from the sixth. This is chapter 1's relative relationship arriving at chord
level, and it is the pathway's through-line.

| C major | `I` `C` | `ii` `Dm` | `iii` `Em` | `IV` `F` | `V` `G` | `vi` `Am` | `vii°` `Bdim` |
| --- | --- | --- | --- | --- | --- | --- | --- |
| A minor | `III` | `iv` | `v` | `VI` | `VII` | `i` | `ii°` |

**`Bdim` is `B D F`.** Two minor thirds stacked — but the interval from `F` back up to `B` is a
tritone, not a third, so it is **not** the endlessly-repeating shape the four-note diminished seventh
is. `triad-the-flat-fifth` in the `triads` pathway says this in its own `warning` callout and is the
article to link rather than re-teaching it. **The slug exists**; so does `triad-three-notes` and
`triad-harmonising-the-major-scale`.

### Where the roots are — the chapter's best practical table

Every chord's root is a note of A natural minor, so the roots are the scale rows chapter 4 already
drew. Recomputed:

- **Low E string, A natural minor**: `6·0` `E`, `6·1` `F`, `6·3` `G`, `6·5` `A`, `6·7` `B`, `6·8` `C`,
  `6·10` `D`, `6·12` `E`, `6·13` `F`.
- **A string, A natural minor**: `5·0` `A`, `5·2` `B`, `5·3` `C`, `5·5` `D`, `5·7` `E`, `5·8` `F`,
  `5·10` `G`, `5·12` `A`.

An E-shape barre is the **E form** (root on string 6); an A-shape barre is the **A form** (root on
string 5). So every chord in the key is one of two shapes the learner has had since chapter 2, placed
at a fret they already know:

| Chord | Numeral | Root on string 6 | E form barre | Root on string 5 | A form barre |
| --- | --- | --- | --- | --- | --- |
| `Am` | `i` | `6·5` | fret 5 (`5 7 7 5 5 5`) | `5·0` / `5·12` | open `Am`, or fret 12 |
| `Bdim` | `ii°` | `6·7` | **none** | `5·2` | **none** |
| `C` | `III` | `6·8` | fret 8 | `5·3` | fret 3 (`x 3 5 5 5 3`) |
| `Dm` | `iv` | `6·10` | fret 10 | `5·5` | fret 5 |
| `Em` | `v` | `6·0` / `6·12` | open `Em`, or fret 12 | `5·7` | fret 7 |
| `F` | `VI` | `6·1` | fret 1 (`1 3 3 2 1 1`) | `5·8` | fret 8 (`x 8 10 10 10 8`) |
| `G` | `VII` | `6·3` | fret 3 (`3 5 5 4 3 3`) | `5·10` | fret 10 |

Every barre fret above equals the root's fret on that string — verified against `cagedFormWindows`
for all seven roots. There is **no barre form of a diminished triad**, which is the honest, practical
reason `ii°` is the least-used chord in the key.

### The raised seventh

- `Em` is `E G B`. `E` **major** is `E G# B`. Verified through `buildChord`.
- `G` → `G#` is one semitone. `G` is a **whole step** below `A`; `G#` is a **semitone** below it.
- Harmonic minor, from the app's own catalogue: `id: 'harmonic-minor'`,
  `semitones: [0,2,3,5,7,8,11]`, `degrees: ['1','2','b3','4','5','b6','7']`, character line
  *"Minor with a raised 7th — the leading tone a minor key wants"*, accent degree `7` in amber. In A:
  **`A B C D E F G#`**. So `scale-compare` `{ "root": "A", "scales": ["minor", "harmonic-minor"] }`
  puts natural minor first as the reference card and tints the `G#` **amber** on the second. Tint
  `G#` amber in the prose to match.
- **The grip move is one finger.** Open `Em` is `0 2 2 0 0 0`; open `E` is `0 2 2 1 0 0`. String 3,
  fret 0 → fret 1. Both grips are `readProgression`'s own curated shapes — verified, not remembered.
- **Every `G#` in frets 0–13**: `3·1`, `6·4`, `1·4`, `4·6`, `2·9`, `5·11`, `3·13`. Inside A minor's
  five windows: A form (`0–3`) has `3·1`; G form (`1–5`) has `6·4`, `3·1`, `1·4`; E form (`4–8`) has
  `6·4`, `4·6`, `1·4`; D form (`6–10`) has `4·6`, `2·9`; C form (`9–13`) has `2·9`, `5·11`, `3·13`.
- **`6·4` is one fret below the `Am` barre's root at `6·5`.** The leading tone is the fret under the
  shape the learner already holds.
- Chapter 4 said fret 4 carries exactly **one** note of A natural minor (`3·4`, the `2`). Raise the
  seventh and fret 4 carries **three** — `1·4`, `3·4`, `6·4`. Verified fret by fret. **Do not
  contradict chapter 4**: its claim was about *natural* minor and remains true.

**Style, researched rather than assumed.** In common-practice classical harmony the major `V` is the
norm in a minor key and the minor `v` is comparatively rare; the same is true across jazz and
flamenco. In a great deal of pop and rock the `VII` (`G` in A minor) does the pulling instead and the
`G#` never appears at all. **Both are A minor.** A lesson may state this; it may **not** say one is
correct, and it may not say the learner will *feel* the difference — chapter 1's research note binds
here too.

### The relative switch

- **Chord pairs, recomputed.** Every major chord in the key has a minor chord three semitones below it
  sharing **two of its three notes**: `C` (`C E G`) / `Am` (`A C E`) share `C` and `E`; `F` (`F A C`)
  / `Dm` (`D F A`) share `F` and `A`; `G` (`G B D`) / `Em` (`E G B`) share `G` and `B`. Two of three,
  in all three pairs. Verified.
- **The two coincident windows**, chapter 1's, unchanged: frets `4–8` are C major's **G form** and A
  minor's **E form**; frets `9–13` are C major's **D form** and A minor's **C form**. Both
  reconfirmed against `cagedFormWindows`.
- **Frets `4–8` hold 17 dots in both readings, at the same 17 positions.** Chapter 1 tabled them in
  `minor-caged-one-window-two-names`. **Do not reprint that table** — draw the window twice instead
  (see the live blocks below), which chapter 1 was forbidden from doing.
- **Where you stop is what changes.** In frets `4–8` the `1`s of C major are `6·8`, `3·5`, `1·8`; the
  `1`s of A minor are `6·5`, `4·7`, `1·5`. Verified.
- **The key detector, run against `estimateKey` before anything is promised:**

| Loop | Verdict | Status | Runners-up |
| --- | --- | --- | --- |
| `C` `G` `Am` `F` | **C major** | `confident` | A minor, F major |
| `Am` `F` `C` `G` | **A minor** | **`ambiguous`** | C major, F major |
| `Am` `Dm` `Em` `Am` | A minor | `confident` | C major, D minor |
| `Am` `Dm` `E` `Am` | A minor | `confident` | **A major**, D minor |
| `Am` `Bdim` `C` `Dm` `Em` `F` `G` `Am` | A minor | `confident` | C major, G major |
| `Em` `C` `G` `D` | E minor | `ambiguous` | G major, C major |

The first two are the **same four chords rotated** — a sharper demonstration than chapter 1's pair,
which swapped a chord. And the second row's `ambiguous` is not a defect to hide: it is exactly the
honest limit chapter 1 printed, arriving as evidence. **A lesson must say `ambiguous`, not
"confidently".**

### The loop up the neck

`Am` `F` `C` `G` is `i–VI–III–VII`. Every window recomputed:

| Chord | C form | A form | G form | E form | D form |
| --- | --- | --- | --- | --- | --- |
| `Am` | `9–13` | `0–3` | `1–5` | `4–8` | `6–10` |
| `F` | `5–9` | `7–11` | `9–13` | `0–4` | `2–6` |
| `C` | `0–4` | `2–6` | `4–8` | `7–11` | `9–13` |
| `G` | `7–11` | `9–13` | `0–3` | `2–6` | `4–8` |

**Route one — open position, and it is four different forms.** Verified against the windows and
against `readProgression`'s curated grips:

| Chord | Form | Grip |
| --- | --- | --- |
| `Am` | A form (`0–3`) | `x 0 2 2 1 0` |
| `F` | E form (`0–4`), barred at fret 1 | `1 3 3 2 1 1` |
| `C` | C form (`0–4`) | `x 3 2 0 1 0` |
| `G` | G form (`0–3`) | `3 2 0 0 0 3` |

Four chords, four different forms, and the `F` is the only barred one — which is why it always felt
like the odd shape out.

**Route two — frets 3 to 7.** Read the window table for the span `2–6`: **three of the four chords
have a window at exactly frets `2–6`** — `C`'s A form, `G`'s E form and `F`'s D form. `Am` does not;
its nearest is the E form at `4–8`. Verified across all twenty windows.

| Chord | Form | Grip | Frets used |
| --- | --- | --- | --- |
| `Am` | E form, barre at 5 | `5 7 7 5 5 5` | 5–7 |
| `F` | D form | `x x 3 5 6 5` | 3–6 |
| `C` | A form, barre at 3 | `x 3 5 5 5 3` | 3–5 |
| `G` | E form, barre at 3 | `3 5 5 4 3 3` | 3–5 |

Every grip above is already published elsewhere in this corpus and was re-derived note by note:
`5 7 7 5 5 5` = `A E A C E A` (`Am`, chapter 2); `x x 3 5 6 5` = `F A C F`;
`x 3 5 5 5 3` = `C G C E G`; `3 5 5 4 3 3` = `G D G B D G`. The whole route lives inside frets 3–7,
and the `Am` is the one chord that moves — two frets — because the G form of a minor chord cannot be
barred at all (chapter 2's own finding).

**No route puts all four at one fret**, and no lesson may claim one does.

### Transposing

**The anchor, and it is this lesson's spine.** The `Am` barre at fret 5 is the E form, and fret 5 is
where `A` sits on the low E string. That one fact places the ladder: the E form's window runs from one
fret below the root's low-E fret to three above it, and the other four follow. Verified in every key
below.

| Key | Root's fret, string 6 | The ladder, nut upward | Cycle | Relative major |
| --- | --- | --- | --- | --- |
| A minor | 5 | A `0–3`, G `1–5`, E `4–8`, D `6–10`, C `9–13` | A→G→E→D→C | `C` |
| E minor | 0 | E `0–3`, D `1–5`, C `4–8`, A `6–10`, G `8–12` | E→D→C→A→G | `G` |
| D minor | 10 | D `0–3`, C `2–6`, A `4–8`, G `6–10`, E `9–13` | D→C→A→G→E | `F` |
| G minor | 3 | G `0–3`, E `2–6`, D `4–8`, C `7–11`, A `9–13` | G→E→D→C→A | `Bb` |
| C minor | 8 | C `0–4`, A `2–6`, G `4–8`, E `7–11`, D `9–13` | C→A→G→E→D | `Eb` |
| B minor | 7 | C `0–3`, A `1–5`, G `3–7`, E `6–10`, D `8–12` | C→A→G→E→D | `D` |

Every cycle is the same loop `C→A→G→E→D→C` entered at a different point. **The `caged-fretboard`
pathway owns that claim** (`caged-transposing-the-ladder`) and it is identical here because a window
never knew about quality — chapter 2's opener. **State it in one compressed paragraph and link it.
Do not re-derive it and do not give the six-key wheel table twice over.**

**What is genuinely new in minor, and it is this lesson's own content:**

1. **The letter-form sits at the nut in five keys — A, C, D, E and G minor** (verified above) — but
   **only three of those are open chords**: `Am`, `Em`, `Dm`. There is no open `Gm` or `Cm`, and the
   G form of a minor chord cannot be barred (chapter 2). So in G minor the form at the nut is the one
   form you can never hold whole. The major pathway's version of this story has all five as open
   chords; minor's does not, and that difference is the lesson's best paragraph.
2. **The chords transpose with the ladder.** `i–VI–III–VII`, verified through `readProgression` in
   every key named:

| Key | `i` | `VI` | `III` | `VII` | Note |
| --- | --- | --- | --- | --- | --- |
| A minor | `Am` | `F` | `C` | `G` | one barre |
| E minor | `Em` | `C` | `G` | `D` | **all four open** |
| D minor | `Dm` | `Bb` | `F` | `C` | two barres |
| G minor | `Gm` | `Eb` | `Bb` | `F` | all four barred |
| C minor | `Cm` | `Ab` | `Eb` | `Bb` | all four barred |

3. **Flats.** `Bb`, `Eb` and `Ab` are spelled flat because those are flat keys. The pathway's
   convention is sharps by default and flats "only when spelling a genuinely flat key, which is
   chapter 5 territory" — this is that territory, and this is the **only** lesson that uses a flat.

### Superlatives and claims this chapter is allowed

Recomputed here. Nothing else may be claimed as an "only", a "most" or an "always".

- **Three minor, three major, one diminished** in a minor key's seven triads.
- A minor's seven triads are **the same seven** as C major's, started from the sixth.
- `ii°` is the **only** chord of the key with no barre form.
- **Two of three** notes are shared by each relative chord pair (`C`/`Am`, `F`/`Dm`, `G`/`Em`).
- Frets `4–8` are **one** of exactly **two** spans C major and A minor share (chapter 1's, all 25
  pairs checked there).
- `Am F C G` in open position is **four different forms**, and the `F` is the **only** barred one.
- **Three of the four** chords of that loop have a window at exactly frets `2–6`; `Am` does not.
- `G` is a **whole step** below `A`; `G#` is a **semitone** below it.
- The letter-form sits at the nut in **five** minor keys; **three** of those five are open chords.
- Fret 4 carries **one** note of A natural minor and **three** of A harmonic minor.

**Not allowed, because they are false or unverified:**

- "the barre frets of a minor key are that key's minor pentatonic on the low E string" — **false**.
  The five barre frets in A are `0 2 5 7 9`, which is `E F# A B C#`; A minor pentatonic on string 6 is
  `0 3 5 8 10`. The sibling pathway's reach-back is a **major**-key fact and does not transpose to
  minor. Recomputed and rejected deliberately.
- "the form nearest the nut is the one named after the letter below the key's root" — the sibling
  pathway states this and it **fails** in minor keys with no letter form: B minor's nut-most is the
  **C** form (`0–3`), and F# minor's is the **G** form (`0–2`). State the rule only for the five
  letter keys, which is verified, and say the other seven enter the wheel between two letters.
- "the minor `v` is wrong" / "the major `V` is correct". Both are used; neither is a rule.
- "a minor key is made of minor chords."
- Calling A minor's A form a five-fret window (it is `0–3`), or any clamped window five frets wide —
  F# minor's nut-most window is **three** frets (`0–2`) and B minor's and Bb minor's C forms are
  three (`0–2`/`0–3`).
- "`Am F C G` is the most common progression in popular music" — say **one of** the most common minor
  loops, and do not put a number on it.
- "the Key Detector calls `Am F C G` A minor confidently" — it returns `ambiguous`.
- Any claim that all four chords of the loop sit at one fret.
- "`Bdim` is symmetrical" / "`Bdim` repeats every three frets" — that is the diminished **seventh**.

### Scope guards

- **The words "mode", "modal", "Aeolian", "Dorian", "Phrygian", "melodic minor" and "augmented
  second" do not appear.** Harmonic minor is named, its `G#` is shown, `E` resolving to `Am` is
  played, and it stops. **No harmonic-minor shapes in any window, no `caged-shape` at a
  harmonic-minor layer (the component has none), no second scale-compare of it, no `vii°`.**
- **Triads only.** No `E7`, no `im7`, no `V7`, no `sus`, no slash chords. `triad-the-flat-fifth`
  mentions `G7` when linked; this chapter does not.
- **Chords of the key only**, plus `E` major in lesson 2. No borrowed chords, no secondary dominants,
  no modal interchange, no `bII`.
- **No re-teaching of chapters 1–4.** The two coincident windows, the seventeen-position table, the
  window-edge effect, the layers, the seams, the `b6`'s character, the Boxes reconciliation: link
  them, name them in a clause, do not restate them.
- **Do not import the sibling pathway's chapter 5.** No box criticism, no shared-note doorways, no
  single-string climbs, no string pairs, no `3/str`, no "vertical versus horizontal".
- **Never "m3", never "the Em form", never "Amin", never "A-".** Degrees are `1 2 b3 4 5 b6 b7`,
  numerals are `i ii° III iv v VI VII`, both with the `code` mark.
- **A major appears once**, as the Key Detector's runner-up in lesson 3's table, and nowhere else.
- **No `url` links. No `image` blocks. No footnotes.** (Chapters 2–4 had none; chapter 1 had one.)
- **Link text is the screen's name**, never its route: `Chord Shapes`, not `/chord-shapes`.
- Positions use `string·fret`. **The first heavy user — lesson 1 — restates what it means in one
  clause**, as every chapter has.

---

## The lessons

Six articles, in order. Section ids are progress keys and are **never** renamed.

Every article: `schemaVersion: 1`, `publishedAt: "2026-08-14"`, `tags: ["caged", "minor"]`,
`readingTimeMin` = ceil(words ÷ 200) with a floor of 2, **set last, after the final edit** — it has
been the most common defect in four chapters running. `meta.slug` equals the filename stem. The title
is `meta.title` and **no article opens with a heading block**.

---

### 1. `minor-caged-the-chords-of-the-key` — "The Chords A Minor Gives You"

- **Section id**: `minor-caged.ch5.the-chords-of-the-key` ·
  **Article id**: `art_minor-caged-the-chords-of-the-key`
- **Length**: 700–850 words
- **Left by chapter 4**: the whole scale in all five windows; the roots plus two one-fret rules; every
  dot on the A minor neck is a dot on the C major neck renamed; and the closing clause "the next
  chapter turns this scale into chords."
- **The one thing it teaches**: harmonising A natural minor gives seven chords —
  `Am Bdim C Dm Em F G` — which are the same seven triads as C major's started from the sixth, and
  every one of their roots is a scale note the learner already has on strings 6 and 5.
- **The misconception it corrects**: "a minor key is made of minor chords", and its practical form,
  "the chords of a new key are a new thing to memorise."

**Key points, in order**

1. Open on the operation, not a preamble: take each note of `A B C D E F G` in turn, stack a third
   and a fifth on it using **only those seven notes**, and seven chords fall out. No choices were
   made; the scale did all of it.
2. The `table` of the seven — degree numeral, chord, notes. Use the verified table unchanged.
3. **Three minor, three major, one diminished.** Say it plainly and say it is the surprise: a minor
   key is not made of minor chords. `Am`, `Dm` and `Em` are minor; `C`, `F` and `G` are major;
   `Bdim` is neither.
4. **The numeral convention, defined once and used for the rest of the chapter.** Lowercase for
   minor (`i`, `iv`, `v`), uppercase for major (`III`, `VI`, `VII`), `°` for diminished (`ii°`), all
   with the `code` mark. One sentence, no history.
5. **The relative relationship, at chord level — the lesson's centre.** Harmonise C major the same way
   and you get `C Dm Em F G Am Bdim`: the *identical seven chords*, started from the sixth. Chapter 1
   proved the two keys share seven notes; this is the same fact one level up, and it means the chords
   of a minor key were never a second thing to learn. Give the two-row numeral `table`. Link
   [`minor-caged-the-same-seven-notes`](article link).
6. **Where they are on the neck**, and this is the lesson's practical payload. Restate the shorthand
   in one clause (`5·3` is string 5, fret 3, string 1 being the high `e`). Every chord's root is a
   note of the scale, so the roots are rows chapter 4 already drew: the low E string's
   `6·1 6·3 6·5 6·7 6·8 6·10 6·12` and the A string's `5·0 5·2 5·3 5·5 5·7 5·8 5·10`. Put an E-shape
   barre — **the E form** — on a low-E root, or an A-shape barre — **the A form** — on an A-string
   root, and you have the chord. Give the verified barre `table`.
7. **Say what that means**: the two forms that hold as full barres, which chapter 2 named, are enough
   to play every chord in the key, twice over, without learning a shape. That is the whole of this
   lesson's work.
8. **The `ii°` is the exception, and it is the honest one.** `Bdim` is `B D F` — two minor thirds
   stacked, but the interval from `F` back up to `B` is a tritone rather than a third, so it is not
   the endlessly-repeating shape the four-note "dim" chord is. There is **no barre form of it**, which
   is the practical reason it is the least-used chord in the key. One paragraph, no grip, and link
   [`triad-the-flat-fifth`](article link) rather than teaching it.
9. **The `live` block**: `progression-player`
   `{ "chords": ["Am","Bdim","C","Dm","Em","F","G","Am"], "bpm": 80, "caption": "…" }` — the whole key,
   in order, returning home. Say what to listen for: three that sound minor, three that sound major,
   and one that sounds like neither. **Warn honestly in one clause that the `Bdim` chip's shape is an
   awkward one** — that is the voicing engine's curated pick and it is a fair reflection of the chord,
   and [Chord Shapes](screen link) has friendlier ones.
10. Send them to [Chord Detector](screen link) to check any of the barres came out right.
11. Close on the `v`. `Em` is minor, and it is the one chord in that list that an enormous amount of
    minor-key music quietly changes. Name the next lesson by topic, not by position.

**Blocks / components**

- `live` · `progression-player` · `{ "chords": ["Am","Bdim","C","Dm","Em","F","G","Am"], "bpm": 80, "caption": "…" }`
- `table` — the seven chords: numeral, chord, notes.
- `table` — the two keys' numerals side by side.
- `table` — root positions and barre frets, both strings.
- One `callout` (`info`): three minor, three major, one diminished — a minor key is not made of minor
  chords.
- Article links to `minor-caged-the-same-seven-notes` and `triad-the-flat-fifth`; screen links to
  `/chord-shapes` and `/chord-detector`.

**Do not**: use `caged-shape` or `caged-ladder` (this lesson is about roots and barres, and five more
window diagrams would drown the tables); give a grip for `Bdim`; mention harmonic minor, `G#` or a
major `V`; teach chord function, cadences or the circle of fifths; transpose out of A minor.

---

### 2. `minor-caged-the-raised-seventh` — "The Note That Pulls Home"

- **Section id**: `minor-caged.ch5.the-raised-seventh` ·
  **Article id**: `art_minor-caged-the-raised-seventh`
- **Length**: 650–800 words
- **Left by lesson 1**: the seven chords and their numerals; the roots on strings 6 and 5; that `Em`
  is the `v` and is the chord most minor-key music changes.
- **The one thing it teaches**: raising the `b7` a semitone — `G` to `G#` — turns `Em` into `E`, gives
  A minor a note a semitone below home, and that single raised note is what makes the scale *harmonic
  minor*.
- **The misconception it corrects**: "if there's a `G#` in it, it isn't A minor any more" — and its
  opposite, "harmonic minor is a whole new scale I have to learn in five windows."

**Key points, in order**

1. Open on the problem, playing it rather than describing it. `Em` to `Am` is the `v` going to the
   `i`, and it arrives without pulling. **The `live` pair, adjacent**: `progression-player`
   `{ "chords": ["Am","Dm","Em","Am"], "bpm": 84, … }` then
   `{ "chords": ["Am","Dm","E","Am"], "bpm": 84, … }`. Same four bars, one chord swapped. Tell the
   learner to play both before reading on.
2. **Why, in one accounting.** `Em` is `E G B`. The note in it nearest home is `G`, and `G` is a
   **whole step** below `A` — two frets. Nothing in the chord sits next door to the tonic, so nothing
   leans on it.
3. **Raise it.** `G` → `G#`, one semitone, and `Em` becomes `E` major (`E G# B`). Now the chord holds
   a note **one fret below** `A`. That note has a name that says what it does: the **leading tone**.
4. **The grip is one finger.** Open `Em` is `0 2 2 0 0 0`; open `E` is `0 2 2 1 0 0` — string 3, fret
   0 becomes fret 1. That is the whole change. (Chapter 2 spent five lessons on a third moving one
   fret *down* to make a chord minor; this is a third moving one fret *up*, on the chord built on the
   fifth degree, and it is worth naming the symmetry in one sentence.) A `tip` callout.
5. **Name the scale, and bound it in the same breath.** A minor with that raised seventh is
   `A B C D E F G#`, and that scale is called **harmonic minor** — named for harmony, because harmony
   is what wanted the leading tone. The `live` block: `scale-compare`
   `{ "root": "A", "scales": ["minor", "harmonic-minor"] }`. Natural minor is the reference card, so
   the one note the second card adds is tinted **amber** — tint `G#` amber in the prose. Six of the
   seven notes are identical.
6. **The scope, stated to the learner rather than hidden.** This is one note, not a new system. It
   appears when a progression wants that pull and it usually goes away again. This pathway names it,
   shows it and stops there — there is more behind it and it is somewhere else. One short paragraph.
   **A `warning` callout is wrong here; use plain prose or `info`.**
7. **Where the `G#`s are, in the window the learner already owns.** In frets `4–8` — the `Am` barre's
   own window — the `G#`s are `6·4`, `4·6` and `1·4`. **`6·4` sits one fret below the barre's root at
   `6·5`**: the leading tone is directly under the shape you are already holding. Play the barre, then
   `6·4`, then let it fall to `6·5`. One paragraph, three verified positions, no diagram.
8. **One careful sentence about fret 4**, because chapter 4 made a claim there: chapter 4 found fret 4
   carried exactly one note of A natural minor. Raise the seventh and it carries three. Chapter 4's
   claim is about natural minor and is still true — say so explicitly rather than leaving a reader to
   spot the tension.
9. **The honest style note.** In classical, jazz and flamenco the major `V` is the norm in a minor
   key. In a great deal of pop and rock the `VII` — `G` — does the pulling instead, and the `G#` never
   turns up at all. Both are A minor. Do not rank them. This sentence also sets up the loop lesson,
   whose `VII` is exactly that alternative.
10. Practical: [Chord Shapes](screen link) for other voicings of `E`; [Drone](screen link) on a
    sustained `A` to play `G` and then `G#` against.
11. Close on the relative lesson by topic.

**Blocks / components**

- `live` · `progression-player` · `{ "chords": ["Am","Dm","Em","Am"], "bpm": 84, "caption": "…" }`
- `live` · `progression-player` · `{ "chords": ["Am","Dm","E","Am"], "bpm": 84, "caption": "…" }`
- `live` · `scale-compare` · `{ "root": "A", "scales": ["minor", "harmonic-minor"] }`
- One `callout` (`tip`): `0 2 2 0 0 0` becomes `0 2 2 1 0 0` — one finger, string 3.
- Screen links to `/chord-shapes` and `/drone`.

**Do not**: use the word "mode", "Aeolian", "melodic minor", "Phrygian" or "augmented second"; teach
`vii°` or any seventh chord including `E7`; draw a `caged-shape` or `caged-ladder` (there is no
harmonic-minor layer and drawing natural minor here would confuse the point); give harmonic minor a
window, a box or a fingering; claim the learner will feel a difference; say either the major `V` or
the minor `v` is correct; transpose.

---

### 3. `minor-caged-switching-relatives` — "Same Hand, Different Key"

- **Section id**: `minor-caged.ch5.switching-relatives` ·
  **Article id**: `art_minor-caged-switching-relatives`
- **Length**: 700–850 words
- **Left by lesson 2**: the raised seventh as one note; that the `VII` does the same job without it;
  the seven chords and their numerals.
- **The one thing it teaches**: C major and A minor share every note, half their chords and two whole
  windows, so moving between them costs no hand movement — the chord underneath and the note you stop
  on are the entire difference.
- **The misconception it corrects**: "changing key means going somewhere else on the neck."

**Key points, in order**

1. Open by cashing chapter 1. Frets `4–8` are C major's **G form** and A minor's **E form** — the same
   five frets, the same dots, two names. Chapter 1 proved it; this lesson is what it is for. Link
   [`minor-caged-one-window-two-names`](article link) and **do not reprint its seventeen-row table**.
2. **The two diagrams, adjacent — the lesson's centre and something no earlier chapter could show.**
   `caged-shape` `{ "root": "A", "form": "E", "quality": "minor", "show": "scale" }` and
   `caged-shape` `{ "root": "C", "form": "G", "show": "scale" }`. **Both windows are frets `4–8` and
   both hold seventeen dots** — verified. The diagrams caption themselves `E form · A minor` and
   `G form · C major`, so the prose only has to say what to compare: the dots are in the same places
   and every label is different.
3. **What actually changes: where you stop.** In that window C major's `1`s are `6·8`, `3·5` and
   `1·8`; A minor's are `6·5`, `4·7` and `1·5`. Six positions, all verified, and choosing between them
   is the whole act of changing key. Give them as a short `table` or `list`.
4. **The chords are shared too, and this is new.** Every major chord in the key has a minor chord
   three semitones below it sharing **two of its three notes**: `C` and `Am` share `C` and `E`; `F`
   and `Dm` share `F` and `A`; `G` and `Em` share `G` and `B`. Verified. A `table`. So the two keys do
   not merely share a note set — they share three chord pairs, each pair one note apart.
5. **The numerals swap roles.** What is `I` in C major is `III` in A minor; `vi` becomes `i`; `IV`
   becomes `VI`; `V` becomes `VII`. One sentence and a link back to the chords lesson — lesson 1 owns
   the full table and this must not reprint it.
6. **The demonstration, and it is sharper than chapter 1's.** Take **the same four chords** and rotate
   them. `progression-player` `{ "chords": ["C","G","Am","F"] }` then
   `{ "chords": ["Am","F","C","G"] }`. Identical chord set, identical shapes, different starting
   point. Chapter 1's pair swapped a chord; this one swaps nothing at all. Link
   [`minor-caged-what-decides-home`](article link).
7. **The Key Detector, reported honestly.** Run against the app's own engine: the first loop comes
   back **C major, confidently**; the second comes back **A minor, but the engine calls it
   ambiguous**, with C major right behind it. **Do not upgrade that to "confidently".** Say what it
   means: rotating a loop moves the key without settling it, which is precisely the honest limit
   chapter 1 printed — a four-chord loop can be genuinely undecided, and real music settles it with
   time, repetition and where the phrase stops. This paragraph is the lesson's most valuable and the
   easiest to get wrong. Send them to [Key Detector](screen link) to enter both.
8. **The second shared window**, in one clause: frets `9–13` are C major's D form and A minor's C
   form. Chapter 1 owns the derivation; name it and move on.
9. Practical: [Drone](screen link) — hold an `A`, play the `4–8` window, land on `6·5`; then hold a
   `C` and land on `6·8`. Nothing in the hand changes.
10. Close on the loop lesson by topic.

**Blocks / components**

- `live` · `caged-shape` · `{ "root": "A", "form": "E", "quality": "minor", "show": "scale", "caption": "…" }`
- `live` · `caged-shape` · `{ "root": "C", "form": "G", "show": "scale", "caption": "…" }`
- `live` · `progression-player` · `{ "chords": ["C","G","Am","F"], "bpm": 86, "caption": "…" }`
- `live` · `progression-player` · `{ "chords": ["Am","F","C","G"], "bpm": 86, "caption": "…" }`
- `table` — the three relative chord pairs and their shared notes.
- `table` or `list` — the `1`s of each key inside frets `4–8`.
- One `callout` (`tip`): the dots do not change; the chord underneath and the note you stop on do.
- Article links to `minor-caged-one-window-two-names`, `minor-caged-what-decides-home` and
  `minor-caged-the-chords-of-the-key`; screen links to `/key-detector` and `/drone`.

**Do not**: reprint chapter 1's seventeen-position table or its two-ladder comparison; say "A minor's
boxes are C major's boxes"; claim the detector is confident about the second loop; re-derive why only
two windows coincide (chapter 1 owns it); mention the raised seventh; use `caged-ladder`; transpose
out of A minor / C major.

---

### 4. `minor-caged-a-loop-up-the-neck` — "The Loop That Follows Your Hand"

- **Section id**: `minor-caged.ch5.a-loop-up-the-neck` ·
  **Article id**: `art_minor-caged-a-loop-up-the-neck`
- **Length**: 700–850 words
- **Left by the relative lesson**: the two keys share notes, windows and chord pairs; the hand does
  not have to move to change key.
- **The one thing it teaches**: `Am F C G` is `i–VI–III–VII`, and because each of its four chords has
  five forms it can be played wherever the hand already is instead of returning to open position.
- **The misconception it corrects**: "`Am`, `F`, `C` and `G` live at the nut", and "a chord is a
  place."

**Key points, in order**

1. Open on the loop and name it: `Am` `F` `C` `G` is `i–VI–III–VII`, one of the most common loops in
   minor-key popular music. **Do not put a number or a superlative on that.** Every one of the four is
   from the seven chords lesson 1 gave — nothing borrowed.
2. **Tie it to the last lesson in one paragraph**: there is no `G#` anywhere in this loop. The `G` at
   the end is the `VII`, and it is exactly the chord that does the pulling in music that never raises
   its seventh. That is why this loop and not a `V`-based one.
3. **The `live` block**: `progression-player` `{ "chords": ["Am","F","C","G"], "bpm": 88, … }`. Say
   what the chips are showing — the four open shapes almost everyone already plays.
4. **Route one, and it is a surprise: those four open shapes are four different forms.** `Am` is the A
   form, `F` is the E form barred at fret 1, `C` is the C form, `G` is the G form. Give the `table`
   (chord · form · grip). Nobody ever told the learner this, and it is why the `F` always felt like
   the odd one out: it is the only barred shape in the set.
5. **Twenty places, not four.** Each chord has all five forms, so this loop is twenty places on the
   neck. Give the verified window `table` (chord × five forms) — **windows, not barre frets**, because
   windows are this pathway's unit and every number in it was recomputed.
6. **Route two — frets 3 to 7 — and the fact that makes it findable.** Read down the window table:
   **three of the four chords have a window at exactly frets `2–6`** — `C`'s A form, `G`'s E form and
   `F`'s D form. `Am` does not; its nearest is the E form at `4–8`. Give the grip `table`:
   `Am` `5 7 7 5 5 5`, `F` `x x 3 5 6 5`, `C` `x 3 5 5 5 3`, `G` `3 5 5 4 3 3`. The whole route lives
   inside frets 3 to 7.
7. **Say which chord moves and why.** In that route the `i` is the one that travels, two frets, and
   the reason is chapter 2's: the G form of a minor chord cannot be barred, so `Am`'s window at `1–5`
   is not an option and its E form at fret 5 is the nearest thing. Honest, specific, and it reuses a
   fact the learner earned. **Do not claim all four sit at one fret** — no route does.
8. **The two diagrams**: `caged-shape` `{ "root": "C", "form": "A", "show": "triad" }` and
   `{ "root": "G", "form": "E", "show": "triad" }`. **Both windows are frets `2–6`** — verified — so
   the same five frets are drawn twice with two different chords in them. Restate the convention in
   one clause: the diagram lights every note of the chord inside the window, not the grip the table
   gives.
9. **The principle, stated in this pathway's own words** (the sibling pathway has its own version and
   this must not copy it): you already own five shapes for each of these chords. The loop is not
   asking you to learn a place. It is asking which of the twenty you are nearest.
10. Practical: [Metronome](screen link) at a slow comping tempo and change chord on the bar;
    [Chord Shapes](screen link) for other voicings.
11. Close on the transposing lesson by topic.

**Blocks / components**

- `live` · `progression-player` · `{ "chords": ["Am","F","C","G"], "bpm": 88, "caption": "…" }`
- `live` · `caged-shape` · `{ "root": "C", "form": "A", "show": "triad", "caption": "…" }`
- `live` · `caged-shape` · `{ "root": "G", "form": "E", "show": "triad", "caption": "…" }`
- `table` — the open route: chord, form, grip.
- `table` — the twenty windows, chord × form.
- `table` — the frets 3–7 route: chord, form, grip.
- One `callout` (`info`): four open chords, four different forms — and the `F` is the only barred one.
- Article links to `minor-caged-the-chords-of-the-key` and `minor-caged-triad-g-form`; screen links to
  `/metronome` and `/chord-shapes`.

**Do not**: give barre frets for the C, G and D forms (they are fragments and this pathway talks
windows); claim any route is the right one or that all four land on one fret; teach strumming
patterns, rhythm or voice leading; name a chord outside `Am F C G`; mention the raised seventh beyond
point 2's single paragraph; transpose.

---

### 5. `minor-caged-any-minor-key` — "The Same Five Windows, Any Minor Key"

- **Section id**: `minor-caged.ch5.any-minor-key` · **Article id**: `art_minor-caged-any-minor-key`
- **Length**: 700–850 words
- **Left by the loop lesson**: a chord is five windows; the twenty-place table; two routes for
  `Am F C G`. All of it still in A minor.
- **The one thing it teaches**: the whole ladder is anchored on the root's fret on the low E string,
  so a key change moves every number and changes nothing about the structure — and the chords of the
  key move with it.
- **The misconception it corrects**: "everything I learned was about A minor" / "I have to learn the
  ladder again in every key."

**Key points, in order**

1. Open by naming what has been true for five chapters and is about to stop: every fret number so far
   has been A minor. That was a teaching choice, not a limit.
2. **The anchor, first, because it makes everything else cheap.** The `Am` barre at fret 5 is the E
   form, and fret 5 is where `A` sits on the low E string. Find the key's root on that string and the
   E form's window runs from one fret below it to three above; the rest of the ladder follows. Verify
   it out loud with two keys the learner can check: `E` is at fret 0, and E minor's E form is `0–3`;
   `D` is at fret 10, and D minor's E form is `9–13`.
3. **The wheel, compressed.** Give the five-key `table` (key · root's fret on string 6 · ladder nut
   upward · cycle). Every cycle is the same loop `C→A→G→E→D→C` entered at a different point — **one
   paragraph**, then link [`caged-transposing-the-ladder`](article link) and say that the sibling
   pathway proved it for major and it is identical here for the reason chapter 2 opened on: a window
   is anchored on the root and never knew about quality. **Do not re-derive it.**
4. **What is different in minor, and it is this lesson's own argument.** The form named after the key
   sits at the nut in five keys — A, C, D, E and G minor — but **only three of those are chords you
   can play open**: `Am`, `Em`, `Dm`. There is no open `Gm` or `Cm`, and the G form of a minor chord
   cannot be barred at all — chapter 2 established that. So in G minor the form sitting at the nut is
   the one form you can never hold whole, which is a thing the major version of this story never has
   to say. One good paragraph.
5. **A clause of honesty about the other seven keys**: a key with no letter form of its own — B minor,
   F# minor — enters the wheel between two letters, and its nut-most window is whichever one lands
   there. Name B minor's (the **C** form, frets `0–3`) as the single example and stop. **Do not state
   a general rule about which form sits nearest the nut** — it does not hold.
6. **The two `live` ladders, adjacent**: `caged-ladder` `{ "root": "A", "quality": "minor" }` and
   `{ "root": "E", "quality": "minor" }`. Same five bands, same order, entered one step along. Note in
   a clause that the ladder marks roots only — the chapter-4 reminder, one sentence.
7. **The chords transpose too, and that is the payoff.** `i–VI–III–VII` in A minor is `Am F C G`; in E
   minor it is `Em C G D`, **all four open chords**; in D minor `Dm Bb F C`; in G minor
   `Gm Eb Bb F`; in C minor `Cm Ab Eb Bb`. Give the verified `table`. The `live` block:
   `progression-player` `{ "chords": ["Em","C","G","D"], "bpm": 88, … }` — the same loop, a different
   key, and every chord an open shape.
8. **The relative major moves with it**: A minor ↔ `C`, E minor ↔ `G`, D minor ↔ `F`, G minor ↔ `Bb`,
   C minor ↔ `Eb` — always a minor third above the minor root, which is chapter 1's rule, still true.
   One or two sentences; it can share the table above as a column.
9. **The flats, in one clause.** `Bb`, `Eb` and `Ab` are written flat because those are flat keys.
   This pathway has spelled everything with sharps until now and this is the one place that changes.
10. **The diagram caveat.** Near the nut a window is cut short: A minor's A form is four frets
    (`0–3`), and in some keys the nut-most window is only three — F# minor's is `0–2`. Same form, less
    room. **Never call one of those a five-fret window.**
11. Close by sending them to [Scale Visualizer](screen link) with a root other than `A` and the
    position system on CAGED, and on to the closer by topic.

**Blocks / components**

- `live` · `caged-ladder` · `{ "root": "A", "quality": "minor" }`
- `live` · `caged-ladder` · `{ "root": "E", "quality": "minor" }`
- `live` · `progression-player` · `{ "chords": ["Em","C","G","D"], "bpm": 88, "caption": "…" }`
- `table` — five keys: root's fret on string 6, ladder, cycle.
- `table` — `i–VI–III–VII` in five keys, with the relative major as a column.
- One `callout` (`tip`): find the key's root on the low E string and the E form's barre is there; the
  other four follow.
- Article link to `caged-transposing-the-ladder`; screen link to `/scale-visualizer`.

**Do not**: claim the barre frets are the key's minor pentatonic on string 6 (**false** — recomputed);
state a general "form nearest the nut" rule; give a full ladder for any key outside `A E D G C B`
minor (F# minor may be named in one clause for the three-fret window and nothing more); teach key
signatures, the circle of fifths, or how to choose a key; use `caged-shape`; re-teach the wheel's
derivation; mention the raised seventh.

---

### 6. `minor-caged-what-the-third-was-worth` — "What the Third Was Worth"

- **Section id**: `minor-caged.ch5.what-the-third-was-worth` ·
  **Article id**: `art_minor-caged-what-the-third-was-worth`
- **Length**: 750–900 words. It closes the chapter and the pathway.
- **Left by the transposing lesson**: the anchor, the wheel, the three open minor keys, the chords
  transposing, the flats.
- **The one thing it teaches**: what the learner can now do — and the accounting that the whole
  pathway cost one note.
- **The misconception it corrects**: "I've finished, so what was it all for?"

**Key points, in order**

1. **Open on the accounting, not a summary.** Five windows. That was the inventory from chapter 2 and
   it never grew. Chapter 2 put `1 b3 5` in them, chapter 3 added the `4` and the `b7`, chapter 4
   added the `2` and the `b6`, and this chapter turned them into chords. **No sixth shape was ever
   asked for**, and chapters 2, 3 and 4 each promised that in turn.
2. **The deeper accounting, and it is the pathway's own argument arriving as its title.** The five
   windows were not new either: they are the same five the `caged-fretboard` pathway drew, moved three
   frets and re-rooted, and every dot in them was already on the neck. What the whole pathway actually
   cost was **one note** — the `b3`. Lower a third a fret and a chord changes quality; do it in five
   windows and a whole second reading of the neck opens up. Chapter 1 gave the third that job in
   print; this is the invoice. **An `info` callout.**
3. **What you can do now**, as a `list`, phrased as actions and nothing else:
   - Play an `Am` chord in five places without travelling further than the next window.
   - Play A natural minor anywhere on the neck and say what any note under your hand is doing.
   - Name the seven chords a minor key gives you and find any one's root without counting.
   - Put a minor loop wherever your hand already is instead of going back to the nut.
   - Raise the seventh when a progression asks for a leading tone, and say why it asked.
   - Move between a minor key and its relative major without moving your hand.
   - Take all of it to any minor key.
4. **The honest limits, stated as plainly as the wins.** Triads only — no seventh chords, no `im7`, no
   `V7`, and those are a real part of minor-key harmony this pathway did not touch. The raised seventh
   was **one note**, not a system: there is a great deal behind harmonic minor and none of it is here.
   And knowing where a chord sits is not the same as your hand arriving there in time; the second half
   of that is hours, not another lesson. **Do not promise a follow-up pathway.**
5. **The two questions, one last time — the pathway's spine.** Chapter 1 named two derivations and
   said they answer different questions. *Relative* — same notes, different home — is why this pathway
   was cheap: nothing in it asked you to learn a new note. *Parallel* — same home, three notes lowered
   — is why every individual shape made sense: a minor form is its major form with the third dropped a
   fret. One short paragraph. Link [`minor-caged-the-three-that-drop`](article link).
6. **The last `live` block**: `caged-ladder` `{ "root": "D", "quality": "minor" }` — a key this
   pathway has never drawn, whose nut-most form is the **D form**, the smallest and most fragmentary
   of the five. One paragraph: five bands, same order, same overlaps, a key you have not seen, and you
   can read it cold. That is what the five chapters were for.
7. **Where to go**, as the closer's real payload — a few screens with a job each, and two pathways:
   - [Scale Visualizer](screen link) — the five windows live, in any minor key, with the same form
     names.
   - [Chord Shapes](screen link) — which of a window's notes a hand can actually hold at once, the
     question `caged-shape` never answered.
   - [Drone](screen link) — a sustained root to play a window against.
   - [Chord Detector](screen link) — play a barre somewhere unfamiliar and check what comes out.
   - The `triads` pathway, linking [`triad-three-notes`](article link): three-note chords on four
     string sets, which is the natural next step from "a chord is five windows".
   - The `caged-fretboard` pathway, linking [`caged-what-the-letter-means`](article link), for anyone
     who took this one cold.
8. Close on one sentence about the third, returning to point 2 without repeating it. **No cliffhanger,
   no promise.**

**Blocks / components**

- `live` · `caged-ladder` · `{ "root": "D", "quality": "minor" }`
- `list` — what the learner can now do.
- One `callout` (`info`) at point 2: the whole pathway cost one note.
- Article links to `minor-caged-the-three-that-drop`, `triad-three-notes` and
  `caged-what-the-letter-means`; screen links to `/scale-visualizer`, `/chord-shapes`, `/drone` and
  `/chord-detector`.

**Do not**: use `caged-shape` or `progression-player` (four lessons have just used them; the closer
is prose and one ladder); re-teach any window's dots, the seven chords table, the wheel or the
transposing tables; give a "what to practise" list longer than the actions list (or at all — the
actions list does that job here); promise a follow-up; name a chord other than `Am` outside the
actions list; use the word "mode".

---

## The activities

Two, both with `"optional": true` on their sections. The first is `note-play`; the second is the
pathway's **first and only `rhythm`** activity, which is right for the chapter about comping.

Every `note-play` round below was checked against MIDI (string 1 open = 64, 2 = 59, 3 = 55, 4 = 50,
5 = 45, 6 = 40) and is **pitch-distinct**.

### A. `minor-caged-the-chord-roots` — "Drill: Every Chord's Root"

- **Section id**: `minor-caged.ch5.the-chord-roots` ·
  **Activity id**: `act_minor-caged-the-chord-roots`
- `kind: "note-play"`, `modes: ["easy", "hard"]`, document `board: { fretFrom: 0, fretTo: 13 }`.
  `estimatedMin: 9`.

Every round is `ordered: true` — each one is a journey through the key, not a set.

| Round id suffix | Prompt gist | Targets (string · fret) | MIDI |
| --- | --- | --- | --- |
| `low-e-roots` | The root of all seven chords of A minor, up the low E string | 6·1, 6·3, 6·5, 6·7, 6·8, 6·10, 6·12 | 41 43 45 47 48 50 52 |
| `a-string-roots` | The same seven on the A string, this time starting from the `i` | 5·0, 5·2, 5·3, 5·5, 5·7, 5·8, 5·10 | 45 47 48 50 52 53 55 |
| `the-loop-open` | The roots of `Am` `F` `C` `G` where you already play them | 5·0, 6·1, 5·3, 6·3 | 45 41 48 43 |
| `the-loop-up-the-neck` | The same four roots in the frets 3–7 route | 6·5, 4·3, 5·3, 6·3 | 45 53 48 43 |
| `the-leading-tone` | `G` then `G#`, three times up the neck | 6·3, 6·4, 3·0, 3·1, 1·3, 1·4 | 43 44 55 56 67 68 |

Verified: `4·3` is `F` and is the root of the D-form `F` grip `x x 3 5 6 5`; `5·3` is `C`, the root of
`x 3 5 5 5 3`; `6·3` is `G`, the root of `3 5 5 4 3 3`; `6·5` is `A`, the root of `5 7 7 5 5 5`. All
five rounds pitch-distinct.

### B. `minor-caged-comp-the-loop` — "Drill: Comp the Loop in Time"

- **Section id**: `minor-caged.ch5.comp-the-loop` ·
  **Activity id**: `act_minor-caged-comp-the-loop`
- `kind: "rhythm"`. `estimatedMin: 8`.

Every prompt must tell the learner to **mute the strings** — this drill hears attacks, not notes — and
to think the chord change anyway: `Am` `F` `C` `G`, one chord per bar. Slot counts are
`beatsPerBar × subdivision × bars` and each is stated below; **count them**.

| Round id suffix | bpm | Grid | Slots (16 each) | Prompt gist |
| --- | --- | --- | --- | --- |
| `one-per-bar` | 76 | 4 × 1 × 4 | `accent rest rest rest` ×4 | One strum a bar, four bars, one chord each — the loop at its bare minimum |
| `four-to-the-bar` | 84 | 4 × 1 × 4 | `accent hit hit hit` ×4 | Four to the bar, accent on the change |
| `the-common-pattern` | 80 | 4 × 2 × 2 | `accent rest hit hit rest hit hit hit` ×2 | The down-down-up-up-down-up nearly every version of this loop uses |
| `the-push` | 84 | 4 × 2 × 2 | `accent rest rest hit rest hit rest hit` ×2 | The change pushed an eighth early — the last hit is the "and" of four |

All four grids are `4 × 1 × 4 = 16` or `4 × 2 × 2 = 16`. Every round has at least one `hit` or
`accent`. `countInBars: 1` on the first three, `2` on `the-push`.

---

## The checkpoint

`minor-caged-ch5-checkpoint` · section id `minor-caged.ch5.checkpoint` ·
`meta.kind: "checkpoint"` · `passThresholdPct: 70` on both the quiz `meta` and the chapter
`checkpoint`.

Written **after** the articles are read, from what they actually say. This is the pathway's last
checkpoint, so at least two questions reach back across chapters. Sketch — 8 questions:

| # | Question id suffix | Kind | Draws on | Tests |
| - | ------------------ | ---- | -------- | ----- |
| 1 | `seven-chords` | `choice` | L1 | Three minor, three major, one diminished — a minor key is not made of minor chords |
| 2 | `same-seven-as-c-major` | `choice` | L1 + L3 (+ ch1) | A minor's seven triads are C major's seven, started from the sixth |
| 3 | `the-leading-tone` | `listen` | L2 | Hear the open `E` chord and name the note in it that is not in A natural minor (`G#`) |
| 4 | `why-the-seventh-rises` | `choice` | L2 | `G` is a whole step below `A`; `G#` is a semitone, and that is the whole reason |
| 5 | `same-hand-two-keys` | `choice` | L3 | At frets `4–8` the dots do not change; the chord underneath and the note you stop on do |
| 6 | `roots-on-the-low-e` | `fretboard` | L1 + L4 | Mark the roots of the `i` and the `VII` on the low E string — `6·5` and `6·3`, `frets: 12` |
| 7 | `four-forms-at-the-nut` | `choice` | L4 | `Am F C G` in open position is four different CAGED forms |
| 8 | `any-minor-key` | `choice` | L5 + closer | E minor is the same wheel entered one step along; nothing new to learn |

Every question gets an `explanation`. `fretboard` is graded all-or-nothing, so Q6 asks only for two
positions stated explicitly and completely in lesson 1's table, and both are unique inside frets 0–12
(`A` at `6·5`, `G` at `6·3`; the next `G` is fret 15). **No option may be referred to by letter or
position** — options shuffle on every attempt and render with no labels.

Distractors that should encode a real belief rather than filler: Q1's "all seven are minor"; Q3's `G`
(a learner who has not noticed the change); Q4's "because `Em` has fewer notes in common with `Am`";
Q7's "one form moved four times"; Q8's "five new shapes".

---

## Notes for the lesson agents

- **The corpus test is red mid-chapter.** `packages/content/src/load.test.ts` pins article, quiz and
  activity counts by number and by name, so the moment the first article of this chapter lands those
  assertions fail and keep failing until the chapter agent updates the pins. Read *which file* each
  failure names. **Ignore every count and slug-list assertion; fix only failures that name your own
  article.**
- **Verify every superlative by recomputation.** The allowed list is above; if a draft wants one that
  is not on it, drop it. Four traps this chapter sets: the loop is **one of** the most common minor
  loops, not the most common; **no** route puts all four chords at one fret; the Key Detector is
  **ambiguous** about `Am F C G`; and the barre frets are **not** the minor pentatonic.
- **Every chord spelling, numeral and `string·fret` token in prose must match the verified tables
  above.** This chapter names chords for the first time in the pathway, which is a class of error no
  earlier chapter could make.
- **Set `readingTimeMin` last**, after the final edit. It has been the most common defect in four
  chapters running.
- **Do not write, edit or run app code.** Do not touch the curriculum file, the quiz, the activities,
  or another agent's article.

---

## As built — final word counts

Words counted as all span text (paragraphs, callouts, lists, table cells, `live` captions), the
convention chapters 2–4 of this pathway used.

| Lesson | Words | `readingTimeMin` | `estimatedMin` in the curriculum |
| --- | --- | --- | --- |
| `minor-caged-the-chords-of-the-key` | 771 | 4 | 5 |
| `minor-caged-the-raised-seventh` | 670 | 4 | 5 |
| `minor-caged-switching-relatives` | 716 | 4 | 5 |
| `minor-caged-a-loop-up-the-neck` | 706 | 4 | 5 |
| `minor-caged-any-minor-key` | 743 | 4 | 5 |
| `minor-caged-what-the-third-was-worth` | 750 | 4 | 5 |
| `minor-caged-the-chord-roots` (activity) | — | — | 9 (optional) |
| `minor-caged-comp-the-loop` (activity) | — | — | 8 (optional) |

Chapter total, counted sections only: **30 minutes** of articles plus **5** for the checkpoint =
**35**; 52 including the two optional drills. The pathway's `estimatedMin` is still its placeholder
of 200 — the top-level agent recomputes it now that every chapter exists.

**The planned six-lesson cut survived intact**, in the brief's order, with no merge and no reorder.
No title changed.

## The checkpoint as built — 8 questions

| # | Question id suffix | Kind | Draws on | Tests |
| - | ------------------ | ---- | -------- | ----- |
| 1 | `seven-chords` | `choice` | L1 | Three minor, three major, one diminished — a minor key is not made of minor chords |
| 2 | `same-seven-as-c-major` | `choice` | L1 + L3 | A minor's seven triads are C major's seven, started from the sixth |
| 3 | `the-leading-tone` | `listen` | L2 | The open `E` chord sounded; name the note in it that is not in A natural minor |
| 4 | `why-the-seventh-rises` | `choice` | L2 | `G` is a whole step below `A`, `G#` a semitone |
| 5 | `same-hand-two-keys` | `choice` | L3 | At frets `4–8` nothing about the hand or the dots changes |
| 6 | `roots-on-the-low-e` | `fretboard` | L1 + L4 | Mark `6·5` and `6·3`, the roots of the `i` and the `VII`, `frets: 12` |
| 7 | `four-forms-at-the-nut` | `choice` | L4 | Open `Am F C G` is four different forms |
| 8 | `any-minor-key` | `choice` | L5 + closer | E minor is the same wheel entered one step along; `Em C G D` |

The `listen` question sounds the open `E` grip (`0 2 2 1 0 0`) as `E2 B2 E3 G#3 B3 E4` in `chord`
mode — the six pitches that chart actually produces, verified against MIDI. Q6's two positions are
both unique inside frets 0–12 (`A` next recurs at fret 17, `G` at fret 15), which matters because
`fretboard` is graded all-or-nothing.

Distractors encoding a real belief rather than filler: Q1's "seven minor chords — that is what makes
it a minor key"; Q2's "A minor's are C major's with every third lowered a fret", which is the
parallel move applied where the relative one belongs; Q4's "`Em` shares a note with `Am` and `E` does
not", which is checkably false about the notes; Q5's "move down three frets", true of same-lettered
windows and wrong here; Q7's "one form moved to four places".

## Errors found and corrected in the drafts

Both lesson agents reported their work verified and clean. Reading every article as written, and
machine-checking every position token, chord spelling, grip, window span and `progression-player`
symbol against the app's own libraries, found **thirteen** problems. Six were authorial scaffolding
transcribed straight out of this plan's own instruction wording, which is the failure chapter 3 first
recorded and which has now happened in three chapters running.

**Factual:**

1. **`minor-caged-a-loop-up-the-neck` — "no window puts all four chords under one fret."** False as
   written: all four chords *do* have a window containing fret 5 (`Am` E form `4–8`, `F` C form
   `5–9`, `C` G form `4–8`, `G` D form `4–8`). The true and verified claim is that no *form* gives all
   four the same window and no single barre fret carries all four. Rewritten. It also carried an
   unverifiable rider — "there's no third route waiting to be found that beats both" — which was cut.
2. **`minor-caged-a-loop-up-the-neck` — "four open shapes, and every one of them is a different CAGED
   form", immediately followed by a callout naming the `F` as barred at fret 1.** Self-contradictory.
   Rewritten as four chords everybody plays in the first few frets, with the `F` named as the one
   that is not an open shape.
3. **`minor-caged-switching-relatives` — "Land a phrase on any of C major's three and the ear reads
   C. Land it on any of A minor's three and the ear reads A minor."** Overclaim, and the article
   contradicted it four paragraphs later by reporting the Key Detector's `ambiguous` verdict. Chapter
   1's binding research note says emphasis decides home and a short loop can be genuinely undecided.
   Rewritten around what a phrase is *pointed at*.
4. **`minor-caged-any-minor-key` — "For five chapters every fret number in this pathway has been A
   minor."** False: chapter 1 and this chapter's own relative lesson both print C major fret numbers.
   Rewritten to name both keys.
5. **`minor-caged-what-the-third-was-worth` — the D form called "the smallest, most fragmentary of
   the five."** Chapter 4 already found and cut that exact claim: the D form's window is five frets,
   tied with three others, and the A form's four-fret window is the narrowest. Rewritten to the
   verified fact — it is the four-string fragment chapter 2 described, and in D minor the nut cuts it
   to frets `0–3`.
6. **`minor-caged-what-the-third-was-worth` — "Five hand positions, filled in four separate times"**
   immediately after listing three fills and a chapter of chords. Chapter 4's closer counted four by
   including the roots layer, which this closer does not mention. Rewritten to three fills and a
   reading as chords.
7. **`minor-caged-what-the-third-was-worth` — "One note, lowered a fret, five times over."** Loose:
   each window holds two or three thirds, not one. Rewritten to "in five windows".
8. **`minor-caged-the-raised-seventh` — "Chapter 2 spent five lessons on a third moving one fret
   down."** Chapter 2 has seven articles, five of them form lessons. Rewritten to "five windows of a
   third moving one fret down", which is what the claim was reaching for.

**Convention and mark defects:**

9. **`minor-caged-the-chords-of-the-key` — "Always the *code* mark, no history attached."** An
   authoring instruction addressed to the reader, naming a wire-format mark the learner cannot see.
   Replaced with a sentence that actually explains Roman numerals.
10. **Two tables printed their Roman numerals unmarked** while the rows beneath them were
    `code`-marked — the seven-degree header in the chords lesson and the `i VI III VII` header in the
    transposing lesson. Both fixed.
11. **Five table cells wrapped a whole phrase in the `code` mark** — `fret 5 — 5 7 7 5 5 5` and
    similar. Chapter 2's review caught the same thing in its seam table. Split so only the grip is
    marked, and the bare `Am`/`Em` in two adjacent cells gained theirs.
12. **`minor-caged-the-raised-seventh` — one `G#` marked `bold` + amber but not `code`**, where every
    other `G#` in the article is `code` + amber.
13. **`minor-caged-the-raised-seventh` — "the seven chords the last lesson gave you."** A positional
    cross-reference, which §7.4 forbids because section numbering counts quizzes and skips optional
    sections. Replaced with a slug link. Three other vague back-references ("an earlier chapter", "the
    earlier chapter", twice) were replaced with the chapter number, which is safe and matches what the
    learner sees on the card.

Also corrected: five instances of this plan's own instruction wording surviving into prose — "Say it
plainly, because it's the lesson's real surprise", "Here's the lesson's centre", "Close on the `v`",
"Name the scale, and bound it in the same breath", "What's different in minor is this lesson's own
argument", "One clause of honesty about the rest", "One clause on the flats". Two lessons closed
without linking the next article by slug and now do.

**Reading times were correct on all six** — the first chapter in five where that was true. The
dispatch told both agents to set `readingTimeMin` last, after the final edit; that instruction
appears to have worked and is worth keeping.

**Verification method.** A scratch vitest file under `mobile/src/lib/` (deleted afterwards) rebuilt
every window from `cagedFormWindows`, every chord from `buildChord`, every progression from
`readProgression`, and every key verdict from `estimateKey`, then read all six shipped articles and
checked: every `string·fret` token is a real position carrying the note the prose claims; every grip
in prose is one the voicing engine or an already-shipped article produces; every `progression-player`
symbol parses (24 of 24 across seven blocks); every `caged-shape` / `caged-ladder` window matches the
span the caption states; and every window-table cell matches `cagedFormWindows`. Every sentence
containing a number, an "only", a "never", an "always" or a "the most" was listed and checked by
hand — that pass caught items 1, 2, 3, 4, 5, 6 and 7, none of which a token check can see.

## Judgement calls recorded here

- **The six lessons the brief scoped were kept exactly, in order.** No merge, no reorder, no seventh
  lesson. The only structural decision was where to put the chord-level relative pairing (`C`/`Am`,
  `F`/`Dm`, `G`/`Em` each sharing two of three notes): it went to the relative lesson rather than the
  chords lesson, because it is the payoff of "same hand, different key" rather than a fact about
  harmonising a scale.
- **The transposing lesson's spine is the low-E anchor, not the sibling pathway's pentatonic
  reach-back**, because that reach-back is **false in minor** — see the next section.
- **The raised-seventh lesson holds the scope limit exactly.** Harmonic minor is named, its `G#`
  shown against natural minor in one `scale-compare`, `E` resolving to `Am` played, and it stops. No
  window, no fingering, no `vii°`, no melodic minor, no mode. The style question — how common the
  major `V` actually is — was researched rather than assumed and is stated as a genuine split:
  standard in classical, jazz and flamenco; frequently replaced by the `VII` in pop and rock; both
  are A minor and neither is correct.
- **The Key Detector's `ambiguous` verdict was reported rather than hidden.** `Am F C G` comes back A
  minor with C major right behind it, and the engine says so. That is a better lesson than a clean
  result: it lands chapter 1's honest limit as evidence, and every `i–VI–III–VII` loop in every key
  tested came back the same way.
- **The chapter's one `fretboard` question uses `frets: 12`** rather than the 8 chapters 2–4 used,
  because the roots it asks for sit at frets 3 and 5 and the answer's uniqueness depends on the board
  not reaching fret 15.
- **Two activities, and the second is the pathway's first `rhythm` drill.** Comping is what this
  chapter is about, and no `note-play` round can ask for a strumming pattern. Its prompts name the
  chord per bar and tell the learner to mute — the drill hears attacks, not notes.
- **`caged-shape` is used to draw one window twice with two different roots, in two lessons.** Frets
  `4–8` as C major's G form beside A minor's E form (17 dots each, the same 17 positions), and frets
  `2–6` as `C`'s A form beside `G`'s E form. Chapter 1 made the first claim with a table because it
  was forbidden `caged-shape`; drawing it is strictly better and is new.
- **No footnotes anywhere in the chapter**, as in chapters 2–4.

## Where the brief and the computation disagreed

Two things, both inherited from the sibling pathway rather than from this pathway's own brief.

- **The five barre frets are NOT the key's minor pentatonic on the low E string.** `caged-fretboard`
  chapter 5 calls the major version of this its best sentence and verified it in six major keys. It
  does not transpose: in A the five barre frets are `0 2 5 7 9`, which is `E F# A B C#` — A *major*
  pentatonic — while A minor pentatonic on string 6 is `0 3 5 8 10`. Recomputed, rejected, and banned
  in the plan before dispatch. The transposing lesson uses the low-E anchor instead, which is simpler
  and is minor's own fact because the `Am` barre at fret 5 is the shape this pathway navigates from.
- **The sibling pathway's nut rule does not hold.** `caged-transposing-the-ladder` states that "in
  any key, the form nearest the nut is the one named after the open chord nearest below that key's
  root". Recomputed: in B the nut-most window is the **C** form (`0–3`), not the A form (`1–5`), and
  in C# it is the **D** form (`0–2`), not the C form (`1–5`). The rule holds for the five keys whose
  letter has a form and for the spot-checks that article prints (`F`, `F#`, `Bb`), but not in
  general. This chapter states only the verified part — the letter-form sits at the nut in A, C, D, E
  and G minor — names B minor's C form as the one example of a key without a letter form, and says
  explicitly that no general rule is being claimed. **The sibling pathway's article is wrong on this
  point and the top level may want to revisit it.**

Nothing in `pathway.md` was found to be wrong.
