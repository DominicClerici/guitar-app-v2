# Chapter 4 — Diminished and Augmented

- **Chapter id**: `triads.ch4`
- **Slug**: `diminished-and-augmented`
- **5 article lessons + 2 optional activities + 1 checkpoint**
- **`publishedAt`**: `2026-08-14`

**Arc line.** After this chapter the learner can play diminished and augmented triads, knows where
each actually turns up in music, understands why one of them has no root of its own, and can convert
between all four qualities from a single grip.

**Five lessons, not six or seven, and the string sets are covered together rather than one lesson
each.** There is not four lessons of honest material here. This is a decision in the brief; nothing
in this plan expands it.

---

## Verified reference (recomputed from open-string pitches, not copied)

Everything below was computed from open-string MIDI (string 1 = E4/64, 2 = B3/59, 3 = G3/55,
4 = D3/50, 5 = A2/45, 6 = E2/40) with the same rule `mobile/src/lib/guitar-positions/triads.ts`
uses — bass tone on the set's lowest string, then each remaining tone at its first occurrence
strictly above the note before it, span ≤ 4 frets, neck of **15 frets** (`FRET_COUNT` in
`mobile/src/lib/theory/fretboard.ts`). It agrees with `triads.test.ts`. **A lesson whose chart
disagrees with this table is wrong.**

### The twelve C diminished grips (`C` `Eb` `Gb`), six-slot charts, low E first

| Set | Root position | First inversion | Second inversion |
| --- | --- | --- | --- |
| 1-2-3 | `x x x 5 4 2` | `x x x 8 7 8` | `x x x 11 13 11` |
| 2-3-4 | `x x 10 8 7 x` | `x x 13 11 13 x` | `x x 4 5 4 x` |
| 3-4-5 | `x 15 13 11 x x` | `x 6 4 5 x x` | `x 9 10 8 x x` |
| 4-5-6 | `8 6 4 x x x` | `11 9 10 x x x` | `2 3 1 x x x` |

### The twelve C augmented grips (`C` `E` `G#`)

| Set | Root position | First inversion | Second inversion |
| --- | --- | --- | --- |
| 1-2-3 | `x x x 5 5 4` | `x x x 9 9 8` | `x x x 1 1 0` |
| 2-3-4 | `x x 10 9 9 x` | `x x 2 1 1 x` | `x x 6 5 5 x` |
| 3-4-5 | `x 3 2 1 x x` | `x 7 6 5 x x` | `x 11 10 9 x x` |
| 4-5-6 | `8 7 6 x x x` | `12 11 10 x x x` | `4 3 2 x x x` |

### Note by note

| Set | Inv | Cdim chart | Positions | Notes | Degrees |
| --- | --- | --- | --- | --- | --- |
| 1-2-3 | root | `x x x 5 4 2` | `3·5` `2·4` `1·2` | C4 `Eb`4 `Gb`4 | `1 b3 b5` |
| 1-2-3 | first | `x x x 8 7 8` | `3·8` `2·7` `1·8` | `Eb`4 `Gb`4 C5 | `b3 b5 1` |
| 1-2-3 | second | `x x x 11 13 11` | `3·11` `2·13` `1·11` | `Gb`4 C5 `Eb`5 | `b5 1 b3` |
| 2-3-4 | root | `x x 10 8 7 x` | `4·10` `3·8` `2·7` | C4 `Eb`4 `Gb`4 | `1 b3 b5` |
| 2-3-4 | first | `x x 13 11 13 x` | `4·13` `3·11` `2·13` | `Eb`4 `Gb`4 C5 | `b3 b5 1` |
| 2-3-4 | second | `x x 4 5 4 x` | `4·4` `3·5` `2·4` | `Gb`3 C4 `Eb`4 | `b5 1 b3` |
| 3-4-5 | root | `x 15 13 11 x x` | `5·15` `4·13` `3·11` | C4 `Eb`4 `Gb`4 | `1 b3 b5` |
| 3-4-5 | first | `x 6 4 5 x x` | `5·6` `4·4` `3·5` | `Eb`3 `Gb`3 C4 | `b3 b5 1` |
| 3-4-5 | second | `x 9 10 8 x x` | `5·9` `4·10` `3·8` | `Gb`3 C4 `Eb`4 | `b5 1 b3` |
| 4-5-6 | root | `8 6 4 x x x` | `6·8` `5·6` `4·4` | C3 `Eb`3 `Gb`3 | `1 b3 b5` |
| 4-5-6 | first | `11 9 10 x x x` | `6·11` `5·9` `4·10` | `Eb`3 `Gb`3 C4 | `b3 b5 1` |
| 4-5-6 | second | `2 3 1 x x x` | `6·2` `5·3` `4·1` | `Gb`2 C3 `Eb`3 | `b5 1 b3` |

| Set | Inv | Caug chart | Positions | Notes | Degrees |
| --- | --- | --- | --- | --- | --- |
| 1-2-3 | root | `x x x 5 5 4` | `3·5` `2·5` `1·4` | C4 E4 `G#`4 | `1 3 #5` |
| 1-2-3 | first | `x x x 9 9 8` | `3·9` `2·9` `1·8` | E4 `G#`4 C5 | `3 #5 1` |
| 1-2-3 | second | `x x x 1 1 0` | `3·1` `2·1` `1·0` | `G#`3 C4 E4 | `#5 1 3` |
| 2-3-4 | root | `x x 10 9 9 x` | `4·10` `3·9` `2·9` | C4 E4 `G#`4 | `1 3 #5` |
| 2-3-4 | first | `x x 2 1 1 x` | `4·2` `3·1` `2·1` | E3 `G#`3 C4 | `3 #5 1` |
| 2-3-4 | second | `x x 6 5 5 x` | `4·6` `3·5` `2·5` | `G#`3 C4 E4 | `#5 1 3` |
| 3-4-5 | root | `x 3 2 1 x x` | `5·3` `4·2` `3·1` | C3 E3 `G#`3 | `1 3 #5` |
| 3-4-5 | first | `x 7 6 5 x x` | `5·7` `4·6` `3·5` | E3 `G#`3 C4 | `3 #5 1` |
| 3-4-5 | second | `x 11 10 9 x x` | `5·11` `4·10` `3·9` | `G#`3 C4 E4 | `#5 1 3` |
| 4-5-6 | root | `8 7 6 x x x` | `6·8` `5·7` `4·6` | C3 E3 `G#`3 | `1 3 #5` |
| 4-5-6 | first | `12 11 10 x x x` | `6·12` `5·11` `4·10` | E3 `G#`3 C4 | `3 #5 1` |
| 4-5-6 | second | `4 3 2 x x x` | `6·4` `5·3` `4·2` | `G#`2 C3 E3 | `#5 1 3` |

### Where the fifth sits — the chapter's working rule, verified on all four sets

Chapter 3 owned the third. This chapter owns the fifth, and the fifth's position inside a grip
depends **only on the inversion**, never on the set — exactly as the third's did, and it is the
mirror image of chapter 3's table:

| Inversion | Degrees | The third is… | The fifth is… |
| --- | --- | --- | --- |
| root position | `1 3 5` | the **middle** note | the **top** note |
| first inversion | `3 5 1` | the **bass** note | the **middle** note |
| second inversion | `5 1 3` | the **top** note | the **bass** note |

### The two moves, verified on all twelve grips each

**Augmented = major with the fifth raised one fret.** Verified on every set in every inversion,
**with no exceptions and no relocations**:

| Set | Root: major → aug | First: major → aug | Second: major → aug |
| --- | --- | --- | --- |
| 1-2-3 | `x x x 5 5 3` → `x x x 5 5 4` | `x x x 9 8 8` → `x x x 9 9 8` | `x x x 0 1 0` → `x x x 1 1 0` |
| 2-3-4 | `x x 10 9 8 x` → `x x 10 9 9 x` | `x x 2 0 1 x` → `x x 2 1 1 x` | `x x 5 5 5 x` → `x x 6 5 5 x` |
| 3-4-5 | `x 3 2 0 x x` → `x 3 2 1 x x` | `x 7 5 5 x x` → `x 7 6 5 x x` | `x 10 10 9 x x` → `x 11 10 9 x x` |
| 4-5-6 | `8 7 5 x x x` → `8 7 6 x x x` | `12 10 10 x x x` → `12 11 10 x x x` | `3 3 2 x x x` → `4 3 2 x x x` |

**Diminished = minor with the fifth lowered one fret.** Verified on **ten of the twelve**; the other
two relocate, and both for the same reason:

| Set | Root: minor → dim | First: minor → dim | Second: minor → dim |
| --- | --- | --- | --- |
| 1-2-3 | `x x x 5 4 3` → `x x x 5 4 2` | `x x x 8 8 8` → `x x x 8 7 8` | `x x x 12 13 11` → `x x x 11 13 11` |
| 2-3-4 | `x x 10 8 8 x` → `x x 10 8 7 x` | `x x 1 0 1 x` → **`x x 13 11 13 x`** | `x x 5 5 4 x` → `x x 4 5 4 x` |
| 3-4-5 | `x 3 1 0 x x` → **`x 15 13 11 x x`** | `x 6 5 5 x x` → `x 6 4 5 x x` | `x 10 10 8 x x` → `x 9 10 8 x x` |
| 4-5-6 | `8 6 5 x x x` → `8 6 4 x x x` | `11 10 10 x x x` → `11 9 10 x x x` | `3 3 1 x x x` → `2 3 1 x x x` |

**The two that relocate are the two that need `Gb`3 on string 3, and string 3's lowest note is the
open `G`3 — one semitone too high.** Both are grips whose `Gb` would have to sit on string 3 just
above an `Eb`3 on string 4:

- **strings 3-4-5, root position.** `Cm` is `x 3 1 0 x x` — `5·3` C3, `4·1` `Eb`3, `3·0` G3. The
  `Gb` wanted is `Gb`3, a semitone **below** the open `G` string, which string 3 cannot sound at any
  fret. The next `Gb` string 3 has is `Gb`4 at `3·11`, an octave up, and the grip cannot span from
  fret 1 to fret 11. So the close voicing waits for the next `C` on string 5, at `5·15`:
  `x 15 13 11 x x` — C4 `Eb`4 `Gb`4, right at the top of the neck.
- **strings 2-3-4, first inversion.** `Cm` is `x x 1 0 1 x` — `4·1` `Eb`3, `3·0` G3, `2·1` C4. Same
  obstruction, same string. It waits for `Eb`4 at `4·13`: `x x 13 11 13 x` — `Eb`4 `Gb`4 C5.

This is the **third** appearance of the same species of obstruction, and lesson 2 should name the
family rather than re-derive it: chapter 2's `12 10 10 x x x` (`triad-major-strings-4-5-6`) and
chapter 3's `x x x 12 13 11` (`triad-one-note-lower`). A string cannot reach low enough, so the
close voicing waits for the next octave.

### Relative shapes — frets measured from the bass note

**Diminished — three different shapes per set. It does NOT repeat.**

| Set | Root | First | Second |
| --- | --- | --- | --- |
| 1-2-3 | `0 −1 −3` | `0 −1 0` | `0 +2 0` |
| 2-3-4 | `0 −2 −3` | `0 −2 0` | `0 +1 0` |
| 3-4-5 | `0 −2 −4` | `0 −2 −1` | `0 +1 −1` |
| 4-5-6 | `0 −2 −4` | `0 −2 −1` | `0 +1 −1` |

`triads.test.ts` pins the 1-2-3 row: *"does not repeat the diminished shape, because only two of its
gaps are equal"* asserts three distinct shapes.

**Augmented — one shape per set, all three inversions identical.**

| Set | Root | First | Second |
| --- | --- | --- | --- |
| 1-2-3 | `0 0 −1` | `0 0 −1` | `0 0 −1` |
| 2-3-4 | `0 −1 −1` | `0 −1 −1` | `0 −1 −1` |
| 3-4-5 | `0 −1 −2` | `0 −1 −2` | `0 −1 −2` |
| 4-5-6 | `0 −1 −2` | `0 −1 −2` | `0 −1 −2` |

`triads.test.ts` pins the 1-2-3 row: *"repeats the augmented shape every four frets"* asserts one
distinct shape and bass frets `[1, 5, 9]`.

**Note the two all-fourths sets:** the augmented shape there is `0 −1 −2` — a clean diagonal, one
fret per string. On 2-3-4 it is `0 −1 −1` and on 1-2-3 `0 0 −1`, so **the diagonal is a 3-4-5 and
4-5-6 fact only.** Do not write "the augmented shape is a diagonal" without naming the sets.

### The four-fret repeat, verified

The three augmented inversions sit **exactly four frets apart on every set**, measured by the bass
note's fret:

| Set | Bass frets (sorted) |
| --- | --- |
| 1-2-3 | 1, 5, 9 (and 13) |
| 2-3-4 | 2, 6, 10 (and 14) |
| 3-4-5 | 1, 5, 9 (and 13) |
| 4-5-6 | 4, 8, 12 |

Diminished's bass notes climb by a **minor third** instead, so the chord tones on the bass string of
a set sit `3`, `3`, `6` semitones apart round the octave — uneven — and the shape changes each time.

### Neck order on strings 1-2-3 — what `triad-ladder` draws on a 15-fret neck

| Quality | Bands, lowest first |
| --- | --- |
| augmented | second `0–1`, root `4–5`, first `8–9`, second again `12–13` — **four bands, evenly spaced** |
| diminished | root `2–5`, first `7–8`, second `11–13` — **three bands, unevenly spaced, three different shapes** |
| major (ch. 1–2) | second `0–1`, root `3–5`, first `8–9`, second `12–13` |
| minor (ch. 3) | root `3–5`, first `8`, second `11–13` |

The full ladder set, recomputed, for reference:

| Quality | Set | Bands |
| --- | --- | --- |
| augmented | 2-3-4 | first `1–2`, second `5–6`, root `9–10`, first `13–14` |
| augmented | 3-4-5 | root `1–3`, first `5–7`, second `9–11`, root `13–15` |
| augmented | 4-5-6 | second `2–4`, root `6–8`, first `10–12` — **three bands; the fourth would need fret 14–16** |
| diminished | 2-3-4 | second `4–5`, root `7–10`, first `11–13` |
| diminished | 3-4-5 | first `4–6`, second `8–10`, root `11–15` |
| diminished | 4-5-6 | second `1–3`, root `4–8`, first `9–11`, second `13–15` |

### The symmetry, and the trap next door

**Augmented is genuinely symmetrical.** `4 + 4`, and the gap from the `#5` back up to the root is
`4` as well. Three equal gaps, so rotating the chord gives back the same interval structure. The
worked example, verified:

`x x x 1 1 0` on strings 1-2-3 is `G#`3 C4 E4 — the same three frets read three ways:

| Read as | Inversion | Degrees on the dots (`3·1`, `2·1`, `1·0`) |
| --- | --- | --- |
| `Caug` | second inversion | `#5 1 3` |
| `Eaug` | first inversion | `3 #5 1` |
| `G#aug` | root position | `1 3 #5` |

Move it four frets up to `x x x 5 5 4` — C4 E4 `G#`4 — and it is the same three note names again,
now reading as `Caug` in root position (and `Eaug` second inversion, `G#aug` first inversion).

**Only four different augmented triads exist**, verified by enumeration over all twelve roots:
`C`/`E`/`G#`, `C#`/`F`/`A`, `D`/`F#`/`A#`, `D#`/`G`/`B`. Twelve names, four sounds. **There are
twelve different diminished triads** — also verified by enumeration; no two roots give the same
three notes.

**The honest statement**: the augmented shape has no root of its own; context supplies one.

**The trap, and it is live in the wild.** Sources routinely say "the diminished chord is symmetrical
and moves in minor thirds." That is true of the **four-note diminished seventh** (`3+3+3+3`) and
false of the three-note diminished triad (`3+3+6`). Four-note chords are out of scope for this
pathway. **If a draft implies diminished triads repeat every three frets, it is wrong.**

### Where these chords actually turn up — researched

**Diminished.**

- In the key of C, **`B diminished` is the one diminished triad whose three notes are all in the C
  major scale** — `B` `D` `F`. Verified by enumeration over all twelve roots; it is the only one,
  and **no augmented triad fits inside a major scale at all.**
- `G7` is `G B D F`, so **`B D F` is `G7` with its root taken away.** This framing is standard, not
  a teaching shortcut — Piston notates the chord as an incomplete dominant seventh, and Aldwell &
  Schachter call it "nearly rootless."
- **But do not overclaim the pull.** Standard texts are careful: the chord holds the same tension
  notes as `G7` (the tritone `B`–`F`, and `B` a semitone under `C`) but has none of the root leap
  that makes a dominant land so finally. The consequence, which is what to actually teach: it is
  common as a **connecting** chord inside a phrase and rare as a full stop.
- **First inversion is the normal one**, and the reason is teachable: in root position the
  diminished fifth sits between the bass and an upper voice, which is the harshest place for it; in
  first inversion the bass is the chord's `b3`, so the harsh interval sits between two upper voices
  instead. On strings 1-2-3 that is `x x x 7 6 7` — `Bdim/D`.
- **Passing diminished chords** (`C` → `C#dim` → `Dm`) are a real and common device. C# diminished
  on strings 1-2-3: root `x x x 6 5 3`, first `x x x 9 8 9`, second `x x x 0 2 0`. All recomputed.
- **Do not name pop songs for the diminished lesson.** The research pass checked the usual examples
  and most of them fail: the commonly cited ones are four-note diminished **sevenths**, or turn out
  to be something else entirely (Oasis's "Don't Look Back in Anger" bridge is printed as `Abdim` in
  songbooks and is actually `E7/G#`). The device framing is solid; the song list is not.
- **The guitar-specific caveat that must be written**, because a learner will hit it immediately:
  the `dim` shape most players grab, and the one most chord apps draw, is the four-note diminished
  **seventh**, because it is symmetrical and movable. This pathway teaches the three-note triad.
  Say so, or the learner will think one of the two is wrong.

**Augmented.**

- **A dominant with a raised fifth.** `G+` → `C` in C major. On strings 1-2-3, `G+` first inversion
  is `x x x 4 4 3` (B3 `D#`4 G4) and `C` root position is `x x x 5 5 3` (C4 E4 G4). Movement, per
  string `3`/`2`/`1`: `+1`, `+1`, `0`. **Two voices step up a fret; the third stays put.** Verified.
  The raised fifth `D#` leans up onto `E`, the third of `C`, the same way `B` leans onto `C`.
- **One verified song**, and only one: **the Beatles' "Oh! Darling" opens on `E+`** — the V chord of
  A major with its fifth raised — and the raised fifth slides up a semitone into `C#`, the third of
  `A`. Confirmed by two independent analyses. On strings 1-2-3 that is `E+` root position
  `x x x 9 9 8` (E4 `G#`4 C5) into `A` second inversion `x x x 9 10 9` (E4 A4 `C#`5): movement
  `0`, `+1`, `+1` — the same shape of move as `G+` → `C`. Verified. **One sentence, no diagram.**
- **The chromatic inner line.** `C` `x x x 5 5 3` → `C+` `x x x 5 5 4` → `F/C` `x x x 5 6 5`.
  Movement per string `3`/`2`/`1`: `C` → `C+` is `0`, `0`, `+1`; `C+` → `F/C` is `0`, `+1`, `+1`.
  So the high `e` walks `G` → `G#` → `A` while the `C` on string 3 never moves — and on the second
  change string 2 moves too, `E` to `F`. **Say that accurately**; do not write "only one voice
  moves" across the whole line. Verified. `F/C` is F major second inversion, the fifth in the bass.
- **Do NOT use the James Bond chord as an augmented example.** It is `Em(maj9)`, built from a
  descending chromatic line inside a minor triad. Related device, wrong chord.
- **Do not claim the doo-wop / "Blue Moon" changes contain an augmented triad.** They do not.

### Mud, recomputed for both new qualities

`MUD_RULES` / `isMuddy` in `mobile/src/lib/guitar-voicings/generate.ts` — threshold set by the
**lower** note of an adjacent pair, compared strictly: below A2, 4 semitones; below C3, 3; below A3,
2.

- **Not one augmented triad, on any root, any set, any inversion, is muddy.** Enumerated over all
  144. The reason is structural: every gap in an augmented triad is exactly 4 semitones, which
  meets even the strictest threshold. Safe to draw anywhere.
- **Four diminished grips fail**, all on strings 4-5-6: **`D#dim`, `Edim` and `Fdim` first
  inversion, and `G#dim` root position.** `triad-shape` does not filter mud, so **no lesson may put
  a `triad-shape` on those four.** Nothing in this plan does.
- Every `Cdim` and every `Bdim` grip passes. `Bdim` root position on 4-5-6 (`7 5 3 x x x`) sits with
  zero margin on its bottom gap — not used in this chapter, but do not draw it and call it roomy.

---

## What chapters 1–3 established — reference, never re-teach

Triad = root + third + fifth and a **complete chord**; the barre chord is a triad with notes
doubled. Degrees `1` `3` `5` `b3`. Major = `4` then `3`; minor = `3` then `4`. **Inversion** = which
note is lowest, and it does not rename the chord; slash notation `C/E`, `Cm/Eb`. The four string
sets named high-string-first, string 1 = high `e`. The **six-slot chart low E first** with `x`. The
`3·5` **string·fret** shorthand. "Grip", "close voicing", "in the bass", "doubling", "register".
**All twelve C major grips and all twelve C minor grips.** The `G`→`B` break, the lift vector, and
three geometries rather than four. The mud thresholds. Choosing a set by register and by what else
is sounding. **The third-finding rule** — middle in root position, bass in first, top in second —
and that lowering it one fret is the whole of minor. Ladders are silent (no play button).

Chapter 3 closed by saying the fifth is the note that has not moved, and that chapter 4 takes it.
**Open on that.**

**The `3·5` shorthand is restated once, in lesson 1.** Nothing else above is redefined anywhere in
this chapter.

## What this chapter must leave alone

- **The term "voice leading."** Chapter 5 names it. Teach by feel, as chapters 2 and 3 did.
- **Roman numerals and the harmonised scale.** Chapter 5 owns both. Never write `vii°`, `V+`, `I`,
  `IV`. Say "the chord built on `B`", "`B diminished`", "`G` with its fifth raised".
- **Four-note chords**: diminished sevenths, half-diminished, `G7#5`, `C6`. Named once each where
  the plan says so, as what this pathway does *not* cover — never taught.
- **Spread / open voicings, CAGED, modes, alternate tunings.**

## What this chapter must hand to chapter 5

A learner who can find **`B diminished`** and knows why it belongs to C major — chapter 5's
harmonised-scale lesson needs the diminished triad on the seventh degree. Do not harmonise the scale
here.

---

## Lessons

### 1. `triad-the-flat-fifth` — "The Note That Hasn't Moved"

- **Section id**: `triads.ch4.the-flat-fifth` · **Article id**: `art_triad-the-flat-fifth` · ~6 min
- **The one thing**: drop the fifth a fret as well as the third and you get a diminished triad — and
  in the key of C there is exactly one of them, `B diminished`, which is a dominant seventh chord
  with its root taken away.
- **Misconception**: "diminished is an exotic chord you memorise a shape for." It is a minor triad
  with one more finger moved, and it has a specific, ordinary job.
- **Key points, in order**:
  1. Open on chapter 3's closing line: the third did all the work, and the fifth never moved. Now it
     does. Diminished is `1 b3 b5` — over `C`, `C` `Eb` `Gb`. Two stacked minor thirds, `3+3`.
  2. **Restate the notation once**, one sentence: `3·5` means string 3, fret 5; charts are six slots
     low E first with `x`; string 1 is the high `e`.
  3. **Where the fifth sits.** Table it beside the third, as the mirror of chapter 3's rule: root
     position → the fifth is the **top** note; first inversion → the **middle**; second inversion →
     the **bass**. It depends only on the inversion, never on the set. This is the working tool for
     the whole chapter.
  4. **The move, from minor.** `Cm` root position on strings 1-2-3 is `x x x 5 4 3`. Drop the top
     note — the fifth — one fret: `x x x 5 4 2`, `C4` `Eb`4 `Gb`4. `triad-shape`. Then say it the
     other way for a learner who thinks in major: from `x x x 5 5 3`, two fingers move, the middle
     and the top, one fret each.
  5. **Spelling, as a short beat.** The flat fifth of `C` is `Gb`, not `F#`. Same fret, different
     name — the chord is built by stacking thirds off `C`, so it needs a letter that is a third
     above `Eb`, and that letter is `G`. One or two sentences; the pathway's accidental convention
     already said "spell by the chord".
  6. **Where it comes from.** In the key of C, build a triad on each note of the scale and eleven of
     the twelve possible triad qualities never appear — what does is three major, three minor, and
     exactly one diminished: **`B diminished`, `B` `D` `F`.** State it as a fact about which notes
     are available, not as a harmonised scale, and **no Roman numerals**. Verified: it is the only
     diminished triad whose three notes are all in C major, and no augmented triad fits at all.
  7. **The reason it leans.** `G7` is `G` `B` `D` `F`. Take the `G` away and what is left is
     `B` `D` `F` — a `B diminished` triad. That is why this chord behaves the way it does: it holds
     the two notes doing the leaning, `B` a semitone below `C` and `F` a semitone above `E`.
     **Be careful with the strength of the claim** — it is not a drop-in replacement for `G7`,
     because it has none of the bass leap that makes a dominant land. It is the chord you pass
     *through* on the way somewhere, not the one you stop on. (Seventh chords are out of scope;
     `G7` is named here as a chord the learner already plays, not taught.)
  8. **The grip.** `B diminished` root position on strings 1-2-3 is `x x x 4 3 1` — `3·4` B3,
     `2·3` D4, `1·1` F4, degrees `1 b3 b5`. `triad-shape`. Then `C` major root position
     `x x x 5 5 3` is one fret up on string 3 and two on the other two — the hand does not go
     anywhere.
  9. **First inversion is the normal one, and there is a reason.** `x x x 7 6 7` — `3·7` D4,
     `2·6` F4, `1·7` B4, degrees `b3 b5 1`, bass `D`: `Bdim/D`. In root position the flat fifth sits
     between the bass and an upper voice, which is the roughest place for it; in first inversion the
     bass is the `b3`, so the rough interval sits between two upper voices instead. `triad-shape`.
  10. **The `dim` you see on a chart is usually a different chord** — a `warning` callout. Most
      chord apps and most players' movable "dim" shape is the four-note **diminished seventh**,
      because it is symmetrical and slides. This pathway teaches the three-note triad; the four-note
      chord is outside it. Name the difference and move on — **do not teach the seventh**.
  11. **The passing chord**, briefly and concretely: `C` → `C#dim` → `Dm` walks the bass up a
      semitone at a time. On strings 1-2-3, `C#dim` root position is `x x x 6 5 3`. One paragraph;
      lesson 2 has the map.
  12. Close by asking whether the shape repeats — the question lesson 2 and lesson 4 both answer.
- **Live**: `triad-shape` × 3 — `{root:"C", quality:"diminished", strings:"1-2-3", inversion:"root",
  caption:…}`, `{root:"B", quality:"diminished", strings:"1-2-3", inversion:"root", caption:…}`,
  `{root:"B", quality:"diminished", strings:"1-2-3", inversion:"first", caption:…}`.
  **Always pass an explicit `caption`** — the component's default caption says "the third in the
  bass", which is imprecise for a `b3`.
- **Leaves the next lesson**: one grip, one rule about where the fifth sits, and the question of
  what happens on the other sets.

### 2. `triad-diminished-across-the-sets` — "Twelve Grips, and Two That Can't Come Home"

- **Section id**: `triads.ch4.diminished-across-the-sets` · **Article id**:
  `art_triad-diminished-across-the-sets` · ~6 min
- **The one thing**: the whole diminished map in one page, derived from the minor grips by one fret
  — plus the two that cannot sit where the rule says, and why the shape does **not** repeat.
- **Misconception**: **"diminished is symmetrical, so it's one shape moving in minor thirds."** That
  is the diminished *seventh*. The triad is `3 + 3 + 6` and its three inversions are three different
  shapes.
- **Key points, in order**:
  1. Open with the recipe: every diminished grip is the minor grip in the same place with the fifth
     dropped a fret, and the inversion says which finger. Ten of the twelve work exactly that way.
  2. The master table: four rows, three columns, all twelve `Cdim` charts. Recompute every cell.
  3. **The two that relocate.** Give them real room; this is the lesson's best paragraph and it is
     the third time the pathway has met this obstruction, so **name the family** rather than
     re-deriving from scratch.
     - Strings 3-4-5, root position. `Cm` is `x 3 1 0 x x`. The `Gb` wanted above `Eb`3 is `Gb`3 —
       one semitone below the open `G` string, which string 3 cannot sound at any fret. The next
       `Gb` it has is `Gb`4 at `3·11`, and no hand spans fret 1 to fret 11. So the grip waits for
       the next `C` on string 5, at `5·15`: `x 15 13 11 x x`, right at the top of the neck.
     - Strings 2-3-4, first inversion. Same obstruction, same string: `x x 1 0 1 x` cannot become
       `x x 1 0 0 x`-ish because the `Gb` is not there; it waits for `Eb`4 at `4·13`, giving
       `x x 13 11 13 x`.
     - Then the family: chapter 2's `12 10 10 x x x` (link `triad-major-strings-4-5-6`) and chapter
       3's `x x x 12 13 11` (link `triad-one-note-lower`). Every time, a string cannot reach low
       enough and the close voicing waits for the next octave. **The neck is 15 frets** — say the
       3-4-5 root position is on the last one.
  4. **Why it does not repeat.** The gaps are `3` up to the `b3`, `3` up to the `b5`, and then `6`
     back to the root — so the three rotations are `3+3`, `3+6`, `6+3`, three different things.
     Relative to the bass on strings 1-2-3: root `0 −1 −3`, first `0 −1 0`, second `0 +2 0` — three
     different shapes. Table them.
  5. `triad-ladder`, diminished, strings 1-2-3. What it shows that the table cannot: three bands,
     unevenly spaced (root `2–5`, first `7–8`, second `11–13`), each a different shape. Say once
     that it is silent. **Do not claim it shows an octave repeat** — on a 15-fret neck it does not.
  6. **The trap, as a `warning` callout.** "You may have read that a diminished chord is symmetrical
     and moves in minor thirds. That is true of the four-note diminished seventh and false of the
     three-note triad." Lesson 4 makes the positive version of this claim about augmented.
  7. **Which sets are comfortable, honestly.** Strings 1-2-3 and 4-5-6 hold all three inversions in
     easy reach; 3-4-5 and 2-3-4 each strand one high up. Say plainly that this is the least
     comfortable of the four qualities on the neck, and that the reason is one pitch that falls a
     semitone below an open string.
  8. Close by pointing at the fifth going the other way.
- **Live**: `triad-shape` × 3 + `triad-ladder` × 1 —
  `{root:"C", quality:"diminished", strings:"4-5-6", inversion:"root", caption:…}`,
  `{root:"C", quality:"diminished", strings:"2-3-4", inversion:"first", caption:…}`,
  `{root:"C", quality:"diminished", strings:"3-4-5", inversion:"root", caption:…}`, then
  `{root:"C", quality:"diminished", strings:"1-2-3", caption:…}`.
- **Leaves the next lesson**: the fifth dropped, on every set, and no reason yet to raise it.

### 3. `triad-the-sharp-fifth` — "The Fifth Goes the Other Way"

- **Section id**: `triads.ch4.the-sharp-fifth` · **Article id**: `art_triad-the-sharp-fifth` · ~6 min
- **The one thing**: raise the fifth instead and you get an augmented triad — a chord that almost
  never sits still, and whose two everyday jobs are both about a note walking up a semitone.
- **Misconception**: "augmented is a colour you sprinkle on." It is a chord in motion: something in
  it is a semitone below where it is going.
- **Key points, in order**:
  1. Augmented is `1 3 #5` — over `C`, `C` `E` `G#`. Two stacked major thirds, `4+4`. The third
     stays major; the fifth goes **up** a fret instead of down.
  2. **The move, verified on all twelve grips with no exceptions.** From major, raise the fifth a
     fret. `x x x 5 5 3` → `x x x 5 5 4`. Root position → top note; first inversion → middle note;
     second inversion → bass note — the same table from lesson 1, read upward. Say plainly that
     unlike diminished, this one never relocates: every major grip has its augmented twin one fret
     away in the same place.
  3. `triad-shape` for `Caug` root position on strings 1-2-3.
  4. **Job one: a dominant with its fifth raised.** `G` major going to `C` is a change every learner
     has played. Raise `G`'s fifth — `D` becomes `D#` — and it leans harder, because `D#` is a
     semitone below `E`, the third of `C`. On strings 1-2-3: `G+` first inversion `x x x 4 4 3`
     (B3 `D#`4 G4) into `C` root position `x x x 5 5 3` (C4 E4 G4). **String 3 up one, string 2 up
     one, string 1 does not move.** Two voices step up a fret; the third stays put. `triad-shape`
     for the `G+`. Then one sentence, no diagram: the Beatles' "Oh! Darling" opens on exactly this
     chord — `E+`, the `E` chord of A major with its fifth raised, the raised fifth sliding up a
     semitone into the third of `A`.
  5. **Job two: the chromatic line inside a held chord.** `C` `x x x 5 5 3` → `C+` `x x x 5 5 4` →
     `F/C` `x x x 5 6 5`. The high `e` walks `G` → `G#` → `A`, and the `C` on string 3 never moves
     at all. **Be exact**: on the first change only the high `e` moves; on the second, string 2 also
     moves, `E` to `F`. `triad-shape` for `F/C` (F major, second inversion, strings 1-2-3) — chapter
     2 named this grip in prose but never drew it. Note the augmented chord is a chord you pass
     through, not one you land on.
  6. **What the raised fifth is not**, one short beat: `G7#5` is a four-note chord and out of scope
     here — this pathway's `G+` is three notes, `G` `B` `D#`.
  7. Close by pointing at what happens if you keep rotating the shape.
- **Live**: `triad-shape` × 3 —
  `{root:"C", quality:"augmented", strings:"1-2-3", inversion:"root", caption:…}`,
  `{root:"G", quality:"augmented", strings:"1-2-3", inversion:"first", caption:…}`,
  `{root:"F", strings:"1-2-3", inversion:"second", caption:…}`.
- **Leaves the next lesson**: one shape, met three times over, without anyone yet noticing that it
  is the *same* shape.

### 4. `triad-augmented-has-no-root` — "One Shape, Three Names"

- **Section id**: `triads.ch4.augmented-has-no-root` · **Article id**:
  `art_triad-augmented-has-no-root` · ~5 min
- **The one thing**: `4 + 4 + 4` is three equal gaps, so rotating an augmented triad gives back the
  same shape — one grip is three chords at once, and the shape has no root of its own.
- **Misconception**: "every chord shape has a root you can read off it." Not this one. And the
  second, from the other side: "so diminished works the same way." It does not.
- **Key points, in order**:
  1. Lead with the arithmetic. Root to third is `4`. Third to fifth is `4`. Fifth back up to the
     root is `4` as well. Three equal gaps means rotating the notes changes nothing about the
     structure — which is exactly what an inversion is.
  2. **The worked example, and this is the lesson.** `x x x 1 1 0` on strings 1-2-3 sounds
     `G#`3 `C`4 `E`4. Draw it three times, as `Caug` second inversion, `Eaug` first inversion, and
     `G#aug` root position. Same frets, same fingers, same three dots — three chord names and three
     different sets of degree labels. Then move it four frets up: `x x x 5 5 4` is the same three
     note names again, now reading as `Caug` in root position.
  3. **The repeat.** On strings 1-2-3 the three inversions sit at frets 1, 5, 9 and then 13 — four
     frets apart, every time, on every set. `triad-ladder`, augmented, strings 1-2-3: four evenly
     spaced bands of one shape.
  4. **Straight into the contrast**, and link `triad-diminished-across-the-sets`: the diminished
     ladder on the same set had three bands, unevenly spaced, and three different shapes. Give the
     numbers: augmented `4 + 4 + 4`; diminished `3 + 3 + 6`. **`warning` callout**: the claim that a
     diminished chord is symmetrical and slides in minor thirds is true of the four-note diminished
     seventh and false of the three-note triad, which is why the two ladders look nothing alike.
  5. **The count.** There are only **four** different augmented triads in all — `C`/`E`/`G#`,
     `C#`/`F`/`A`, `D`/`F#`/`A#`, `D#`/`G`/`B`. Twelve names, four sounds. There are twelve different
     diminished triads. Both verified by enumeration; write them as counted facts.
  6. **The honest conclusion.** The shape has no root of its own — context supplies one. Whichever
     note the bass is playing, or whichever chord the music just came from, is the one the ear hears
     as the root. That is also why the chord sounds suspended: with nothing around it, there is no
     note for the ear to settle on. Tie it back to lesson 3 — in `G+` → `C` the `G` underneath is
     what makes the shape a `G` chord.
  7. **Footnote** (one, and only one in this article): strictly, `E` augmented spells its top note
     `B#` and `G#` augmented spells its top two `B#` and `D##`. Same frets, different names on
     paper. The diagrams print degrees rather than note names, so nothing on screen disagrees.
  8. Close by pointing at the closer: four qualities, one hand.
- **Live**: `triad-shape` × 3 + `triad-ladder` × 1 — all three shapes draw the identical grip
  `x x x 1 1 0`: `{root:"C", quality:"augmented", strings:"1-2-3", inversion:"second", caption:…}`,
  `{root:"E", quality:"augmented", strings:"1-2-3", inversion:"first", caption:…}`,
  `{root:"G#", quality:"augmented", strings:"1-2-3", inversion:"root", caption:…}`, then
  `{root:"C", quality:"augmented", strings:"1-2-3", caption:…}`.
- **Leaves the next lesson**: both new qualities built, and no single place to see all four.

### 5. `triad-all-four-in-one-place` — ★ "Four Chords, One Hand"

- **Section id**: `triads.ch4.all-four-in-one-place` · **Article id**:
  `art_triad-all-four-in-one-place` · ~5 min
- **The one thing**: all four triad qualities sit under one hand with the root in the same place,
  and the whole system is two fingers' worth of difference.
- **Misconception**: **"major, minor, diminished and augmented are four different chords to learn."**
  The pathway's fifth misconception, and this lesson is it made visible.
- **Key points, in order**:
  1. Open with the table, on strings 1-2-3 in root position, root fixed at `3·5`:

     | Quality | Chart | Notes | Move from major |
     | --- | --- | --- | --- |
     | major | `x x x 5 5 3` | `C E G` | — |
     | minor | `x x x 5 4 3` | `C Eb G` | middle note down one |
     | diminished | `x x x 5 4 2` | `C Eb Gb` | middle **and** top down one |
     | augmented | `x x x 5 5 4` | `C E G#` | top note up one |

     Four `triad-shape` blocks in that order. This is the chapter's signature image and it is worth
     the space.
  2. **The two independent choices.** The third is one voice and the fifth is another, and each
     moves by one fret on its own: the third is `3` or `b3`; the fifth is `b5`, `5` or `#5`. Which
     note is which depends only on the inversion — both tables from earlier in the chapter, in one
     place.
  3. **Why four and not five.** Close the loop chapter 1 opened. A triad is two stacked thirds, and
     a third is either `4` semitones or `3`. Two slots, two choices, four combinations: `4+3` major,
     `3+4` minor, `3+3` diminished, `4+4` augmented. That is the complete list, and it is complete
     for a reason rather than by convention. The two leftover combinations of `3`/`b3` with
     `b5`/`#5` do not make new chords: `1 b3 #5` over `C` is `C` `Eb` `G#`, which is just `Ab`
     major with `C` in the bass — `Ab/C` — and `1 3 b5` (`C` `E` `Gb`) does not stack in thirds at
     all and has no triad name. **Both verified**; keep this to one short paragraph.
  4. **Where the one-hand trick works and where it doesn't.** Verified: the four qualities share a
     bass fret in root position on strings 1-2-3 (fret 5), 2-3-4 (fret 10) and 4-5-6 (fret 8) — but
     **not** on strings 3-4-5, where `Cdim` cannot sit at fret 3 because of the `Gb` that falls
     below the open `G` string, and is stranded at `x 15 13 11 x x` instead. Link
     `triad-diminished-across-the-sets`. Give the 4-5-6 row as a second worked example:
     `8 7 5 x x x`, `8 6 5 x x x`, `8 6 4 x x x`, `8 7 6 x x x`.
  5. **How to practise it.** Hold the root at `3·5` and cycle the other two fingers through the four
     qualities without letting the root move; say the quality out loud. Then check yourself with
     `/chord-detector` — link text "Chord Detector". Then `/chord-shapes` — link text "Chord Shapes"
     — to see any of them beside every other voicing.
  6. **Close the pathway's arc so far, and open chapter 5 by number.** Three chapters of shapes and
     one rule per chapter; chapter 5 stops building chords and starts playing them — moving between
     them with the fewest fingers, crossing between sets mid-progression, and comping a whole
     progression. One clause naming that `B diminished` will be back, without harmonising anything.
- **Live**: `triad-shape` × 4 — `{root:"C", strings:"1-2-3", inversion:"root", caption:…}`, then
  `quality:"minor"`, `quality:"diminished"`, `quality:"augmented"`, same set and inversion.
- **Screens**: `/chord-detector`, `/chord-shapes`.

---

## Activities

### A. `triad-where-they-pull`

- **Section id**: `triads.ch4.where-they-pull` · `"optional": true` · ~6 min
- Placed after lesson 3, whose two resolutions it drills.
- **Kind**: `note-play`, modes `easy` and `hard`, document board frets 0–5.
- **What it drills**: the two chords this chapter says are worth knowing — `B diminished` and `G`
  with a raised fifth — and the semitone steps that carry each of them into `C`.
- **Rounds** (pitches distinct within each round — checked):
  1. `r_triad-where-they-pull.b-diminished` — `x x x 4 3 1`: `3·4` B3 (59), `2·3` D4 (62), `1·1`
     F4 (65).
  2. `r_triad-where-they-pull.g-augmented` — `x x x 4 4 3`: `3·4` B3 (59), `2·4` `D#`4 (63), `1·3`
     G4 (67).
  3. `r_triad-where-they-pull.home` — `x x x 5 5 3`: `3·5` C4 (60), `2·5` E4 (64), `1·3` G4 (67).
  4. `r_triad-where-they-pull.the-two-that-lean` — `ordered: true`: `3·4` B3 (59), `3·5` C4 (60),
     `2·4` `D#`4 (63), `2·5` E4 (64). The two voices that step up a fret from `G+` into `C`, each
     followed by where it lands.

### B. `triad-four-qualities`

- **Section id**: `triads.ch4.four-qualities` · `"optional": true` · ~6 min
- Placed last, after lesson 5, whose table it drills.
- **Kind**: `note-play`, modes `easy` and `hard`, document board frets 0–5.
- **What it drills**: the four qualities under one hand with the root never moving, and the fifth
  walking through all three of its positions.
- **Rounds** (pitches distinct within each round — checked):
  1. `r_triad-four-qualities.major` — `x x x 5 5 3`: `3·5` C4 (60), `2·5` E4 (64), `1·3` G4 (67).
  2. `r_triad-four-qualities.minor` — `x x x 5 4 3`: `3·5` C4 (60), `2·4` `Eb`4 (63), `1·3` G4 (67).
  3. `r_triad-four-qualities.diminished` — `x x x 5 4 2`: `3·5` C4 (60), `2·4` `Eb`4 (63), `1·2`
     `Gb`4 (66).
  4. `r_triad-four-qualities.augmented` — `x x x 5 5 4`: `3·5` C4 (60), `2·5` E4 (64), `1·4` `G#`4
     (68).
  5. `r_triad-four-qualities.the-fifth-walking` — `ordered: true`, all on string 1: `1·2` `Gb`4
     (66), `1·3` G4 (67), `1·4` `G#`4 (68). `b5`, `5`, `#5` — the chapter in three notes.

---

## Checkpoint — `triads-ch4-checkpoint`

`kind: "checkpoint"`, `passThresholdPct: 70`, title "Checkpoint: Diminished and Augmented".
Written **after** the finished articles were read, from what they actually say. None duplicates a
chapter 1, 2 or 3 question — all three checkpoints were read first. **As shipped, eight questions:**

| # | id | Kind | Draws on | Tests |
| --- | --- | --- | --- | --- |
| 1 | `.where-the-fifth-sits` | choice | L1, L3 | `x x 5 5 5 x` is a second inversion, so the fifth is the **bass**; augmented raises it to `x x 6 5 5 x`. Uses a set other than 1-2-3 deliberately, to test the rule rather than a memorised grip. |
| 2 | `.drop-the-fifth` | fretboard | L1, L5 | `x x x 5 4 3` → `Cdim`: tap `1·2`. Distinct from chapter 2's "tap the third in `x x x 9 8 8`" and chapter 3's "tap the move from `x 3 2 0 x x`". |
| 3 | `.rootless-dominant` | choice | L1 | `B D F` is `G7` minus its root — and *why that still isn't a substitute for `G7`*. The honest limit, which is the part most sources get wrong. |
| 4 | `.the-grip-that-waits` | choice | L2 | Why `Cdim` on strings 3-4-5 is stranded at `x 15 13 11 x x`. One distractor is the symmetry trap. |
| 5 | `.which-one-repeats` | choice | L2, L4 | Augmented `4+4+4` repeats; diminished `3+3+6` does not. The wrong answer that describes the diminished **seventh** is the headline distractor. |
| 6 | `.one-shape-three-names` | choice | L4 | `x x x 1 1 0` is three chords at once. Distractor `Ab/C` is the near miss from L5. |
| 7 | `.hear-the-quality` | listen | L3, L5 | `C4 E4 G#4`, `mode: "chord"` — which of the four root-position charts at `3·5`. Chapter 3's listen question played `C4 Eb4 G4`. |
| 8 | `.the-whole-system` | multi-select | L5, L3, L2, L4 | Three true of five: two stacked thirds gives exactly four qualities; `D#` leans onto `E`; augmented never relocates. False: "all twelve diminished grips stay put" and "twelve different augmented triads". |

## Dispatch

- **Agent A** — lessons 1, 2. Establishes the fifth-position rule, restates the `3·5` shorthand,
  owns the relocation argument and the diminished-seventh caveat.
- **Agent B** — lessons 3, 4, 5. Given Agent A's exact claims so it extends rather than re-derives.

Both are told: the content gate is red mid-chapter because the corpus counts in
`packages/content/src/load.test.ts` are pinned; that is expected, and they must not touch it.

---

## Errors found reading the finished articles

Both lesson agents reported their drafts clean. Twelve real problems were found on the chapter
agent's own recompute pass and fixed. Recorded here because the pattern repeats every chapter.

**Factual — would have shipped wrong:**

1. `triad-the-flat-fifth`: "`C#dim` root position is `x x x 6 5 3` — the same shape as B diminished,
   **one fret up**." `B` to `C#` is a whole tone; the charts themselves show `4 3 1` → `6 5 3`.
   Fixed to **two frets up**.
2. `triad-the-flat-fifth`: going from `x x x 4 3 1` to `x x x 5 5 3`, "the hand doesn't go anywhere;
   it just **spreads**." It contracts — a three-fret span becomes a two-fret one. Fixed.
3. `triad-the-flat-fifth`'s closing paragraph claimed "one grip, met three times now, always the
   minor shape with the fifth dropped a fret — except once", then asked whether the shape "repeats
   the way it just climbed the neck". Three *different* grips were drawn, only one of them was built
   by that recipe, and nothing climbed the neck. Rewritten.
4. `triad-augmented-has-no-root`: "the three inversions sit exactly four frets apart, every time:
   frets 1, 5, 9". Those are the **bass note** frets; the `triad-ladder` immediately below draws its
   bands from frets 0, 4, 8 and 12, so as written the prose contradicted the diagram under it.
   Fixed to name the bass note explicitly.
5. `triad-all-four-in-one-place`: "**Three** chapters of diagrams, one rule per chapter" — this is
   chapter 4. Fixed.

**Unverified superlative:**

6. `triad-diminished-across-the-sets`: "This is the **least comfortable of the four triad qualities**
   anywhere on the neck." Not checked and not checkable as phrased. Replaced with the counted fact:
   minor stranded one grip of twelve, diminished strands two, augmented none.

**Convention breaks:**

7. `triad-the-flat-fifth`: `E` left bare in "`B` a semitone under `C` and `F` a semitone above E".
8. `triad-the-sharp-fifth`: `4+4` uncoded where lesson 1 codes `3+3` and lesson 5 codes `4+4`;
   `E` and `A` uncoded in the "Oh! Darling" sentence.
9. `triad-augmented-has-no-root`: the three bare `4`s in the arithmetic paragraph.
10. `triad-all-four-in-one-place`: bare `4` and `3` beside a code-marked `4+3`; bare `Gb` and `G`.
    Also a bare `F/C` in `triad-the-sharp-fifth`.
11. `triad-diminished-across-the-sets` opened with "the one **the last lesson** used once" — the
    exact phrasing §7.4 forbids, because lessons are not numbered on screen. Replaced with an
    article link.

**Structural / metadata:**

12. `triad-the-sharp-fifth` drew the `F/C` diagram **before** the paragraph that names `F/C`.
    Reordered. And `readingTimeMin` was 5 on two articles whose word counts round to 4 — recomputed
    against the whole corpus's convention (`ceil(words / 200)`, floor 2), which every other triad
    article already follows.

Two smaller edits with no error behind them: `triad-the-flat-fifth`'s "build a triad on every note of
the C major scale and most of what turns up is familiar — three major triads, three minor" was
trimmed, because naming the qualities of the harmonised scale is chapter 5's job; and the same
article's warning callout called the triad and the diminished seventh "a quieter chord with the same
name", which they do not have.

## Note for the top-level agent

The pathway's `estimatedMin` is still the placeholder **200** set when the curriculum file was
created; the true sum of all sections after four chapters is **151** (ch1 31, ch2 43, ch3 42,
ch4 35). Chapters 1–3 left it alone too. It is §8 step 1's job to recompute it once chapter 5
lands — it was deliberately not changed here.
