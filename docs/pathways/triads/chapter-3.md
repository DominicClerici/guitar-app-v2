# Chapter 3 — Minor Triads

- **Chapter id**: `triads.ch3`
- **Slug**: `minor-triads`
- **6 article lessons + 2 optional activities + 1 checkpoint**
- **`publishedAt`**: `2026-08-14`

**Arc line.** After this chapter the learner can play a minor triad anywhere the major one lives,
knows which single note separates them and where that note sits in each inversion, and can hear the
difference in a progression.

---

## Verified reference (recomputed from open-string pitches, not copied)

Everything below was recomputed from open-string MIDI (string 1 = E4/64, 2 = B3/59, 3 = G3/55,
4 = D3/50, 5 = A2/45, 6 = E2/40) with the same rule `mobile/src/lib/guitar-positions/triads.ts`
uses — bass tone on the set's lowest string, then each remaining tone at its first occurrence
strictly above the note before it, span ≤ 4 frets. It agrees with
`mobile/src/lib/guitar-positions/triads.test.ts`. **A lesson whose chart disagrees with this table
is wrong.**

### The twelve C minor grips, six-slot charts, low E first

| Set | Root position | First inversion | Second inversion |
| --- | --- | --- | --- |
| 1-2-3 | `x x x 5 4 3` | `x x x 8 8 8` | `x x x 12 13 11` |
| 2-3-4 | `x x 10 8 8 x` | `x x 1 0 1 x` | `x x 5 5 4 x` |
| 3-4-5 | `x 3 1 0 x x` | `x 6 5 5 x x` | `x 10 10 8 x x` |
| 4-5-6 | `8 6 5 x x x` | `11 10 10 x x x` | `3 3 1 x x x` |

### Every C minor grip, note by note, beside its major

| Set | Inversion | Major | Minor | Positions (minor), low → high | Notes (minor) | Degrees | Voice that dropped |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1-2-3 | root | `x x x 5 5 3` | `x x x 5 4 3` | `3·5` `2·4` `1·3` | C4 `Eb`4 G4 | `1 b3 5` | middle |
| 1-2-3 | first | `x x x 9 8 8` | `x x x 8 8 8` | `3·8` `2·8` `1·8` | `Eb`4 G4 C5 | `b3 5 1` | bass |
| 1-2-3 | second | `x x x 0 1 0` | `x x x 12 13 11` | `3·12` `2·13` `1·11` | G4 C5 `Eb`5 | `5 1 b3` | top — **and the grip relocates an octave** |
| 2-3-4 | root | `x x 10 9 8 x` | `x x 10 8 8 x` | `4·10` `3·8` `2·8` | C4 `Eb`4 G4 | `1 b3 5` | middle |
| 2-3-4 | first | `x x 2 0 1 x` | `x x 1 0 1 x` | `4·1` `3·0` `2·1` | `Eb`3 G3 C4 | `b3 5 1` | bass |
| 2-3-4 | second | `x x 5 5 5 x` | `x x 5 5 4 x` | `4·5` `3·5` `2·4` | G3 C4 `Eb`4 | `5 1 b3` | top |
| 3-4-5 | root | `x 3 2 0 x x` | `x 3 1 0 x x` | `5·3` `4·1` `3·0` | C3 `Eb`3 G3 | `1 b3 5` | middle |
| 3-4-5 | first | `x 7 5 5 x x` | `x 6 5 5 x x` | `5·6` `4·5` `3·5` | `Eb`3 G3 C4 | `b3 5 1` | bass |
| 3-4-5 | second | `x 10 10 9 x x` | `x 10 10 8 x x` | `5·10` `4·10` `3·8` | G3 C4 `Eb`4 | `5 1 b3` | top |
| 4-5-6 | root | `8 7 5 x x x` | `8 6 5 x x x` | `6·8` `5·6` `4·5` | C3 `Eb`3 G3 | `1 b3 5` | middle |
| 4-5-6 | first | `12 10 10 x x x` | `11 10 10 x x x` | `6·11` `5·10` `4·10` | `Eb`3 G3 C4 | `b3 5 1` | bass |
| 4-5-6 | second | `3 3 2 x x x` | `3 3 1 x x x` | `6·3` `5·3` `4·1` | G2 C3 `Eb`3 | `5 1 b3` | top |

**The rule, verified on all four sets in all three inversions.** The third's position inside the
grip depends only on the inversion, never on the set — and lowering it a semitone is the whole of
minor:

| Inversion | Degrees | The third is… | The minor move |
| --- | --- | --- | --- |
| root position | `1 b3 5` | the **middle** note | middle note drops one fret |
| first inversion | `b3 5 1` | the **bass** note | bass note drops one fret |
| second inversion | `5 1 b3` | the **top** note | top note drops one fret |

### Relative shapes — frets measured from the bass note

| Set | Root (maj → min) | First (maj → min) | Second (maj → min) |
| --- | --- | --- | --- |
| 4-5-6 | `0 −1 −3` → `0 −2 −3` | `0 −2 −2` → `0 −1 −1` | `0 0 −1` → `0 0 −2` |
| 3-4-5 | `0 −1 −3` → `0 −2 −3` | `0 −2 −2` → `0 −1 −1` | `0 0 −1` → `0 0 −2` |
| 2-3-4 | `0 −1 −2` → `0 −2 −2` | `0 −2 −1` → `0 −1 0` | `0 0 0` → `0 0 −1` |
| 1-2-3 | `0 0 −2` → `0 −1 −2` | `0 −1 −1` → `0 0 0` | `0 +1 0` → `0 +1 −1` |

Three geometries again, not four: the 3-4-5 and 4-5-6 rows are identical in minor exactly as they
are in major, for the same reason (neither set uses a string above the `G`→`B` break).

### Neck order on each set for C minor — what `triad-ladder` draws, lowest first

The app's neck is **15 frets** (`FRET_COUNT` in `mobile/src/lib/theory/fretboard.ts`), so a ladder
draws only what fits inside that. Recomputed against it:

| Set | Bands, lowest first |
| --- | --- |
| 1-2-3 | root `3–5`, first `8`, second `11–13` — **three bands, no octave repeat** |
| 2-3-4 | first `0–1`, second `4–5`, root `8–10`, first again `12–13` |
| 3-4-5 | root `0–3`, first `5–6`, second `8–10`, root again `12–15` |
| 4-5-6 | second `1–3`, root `5–8`, first `10–11`, second again `13–15` |

**Strings 1-2-3 is the one that changed.** C major's ladder there runs second `0–1`, root `3–5`,
first `8–9`, second `12–13` — four bands, the last one the octave repeat of the first. C minor's has
no second inversion at the nut at all: it starts on root position at fret 3, the second inversion
does not arrive until frets 11 to 13, and there is no room left on a 15-fret neck for the cycle to
begin again. **Three bands where major had four.** That is the relocation, made visible — and a
lesson must not claim the minor ladder on this set shows an octave repeat, because it does not.

### The grip that relocates — the exact argument

C major's second inversion on strings 1-2-3 is `x x x 0 1 0` — `3·0` G3, `2·1` C4, `1·0` E4. The
rule says drop the top note a fret. The top note is the open high `e`, E4. One fret below an open
string is not a place. The note wanted is `Eb`4, a semitone **below** E4, and string 1 cannot sound
any pitch below E4 at all.

The next `Eb` string 1 *can* reach above C4 is `Eb`5 at `1·11` — an octave and a minor third above
the C rather than a minor third, so no longer a close voicing and no longer a hand span (the grip
would run frets 0 to 11). So the close voicing has to wait for the next `G` on string 3, at `3·12`:
`x x x 12 13 11` — G4 C5 `Eb`5.

This is the same shape of argument chapter 2 made for the major first inversion on strings 4-5-6
sitting at fret 12, and lesson 1 should say so. **The honest lesson: the rule is about pitch. The
neck sometimes has nowhere to put the result.** `mobile/src/lib/guitar-positions/triads.test.ts`
pins this case in "moves exactly one note by one fret from major to minor" — it has to divide the
octave out before comparing, which is the test admitting the same thing.

### Flush grips — three notes at one fret

Verified across all twelve roots: **every minor first inversion on strings 1-2-3 is flush** — all
three notes at the same fret. `Em` at fret 0, `Fm` at 1, `F#m` at 2, `Gm` at 3, `G#m` at 4, `Am` at
5, `A#m` at 6, `Bm` at 7, `Cm` at 8, `C#m` at 9, `Dm` at 10, `D#m` at 11.

- `Em` first inversion is `x x x 0 0 0` — **the top three open strings**, G3 B3 E4.
- `Am` first inversion is `x x x 5 5 5` — the same three-fingers-one-fret feel chapter 2 met as
  `x x 5 5 5 x`, but a different set, a different chord and a different quality.

**Careful with chapter 2.** `triad-major-strings-2-3-4` wrote of `x x 5 5 5 x`: "Of the twelve grips
this pathway teaches, it's the only one where that's true." That sentence is true of the twelve
**C major** grips it had just tabled and is the intended reading, but chapter 3 teaches twelve more.
**Scope every mention explicitly** — "the one C major grip where all three notes sit at one fret" —
so the two chapters do not read as contradicting each other. Never write a sentence implying minor
has no flush grip.

### Register and mud — recomputed, and the one place minor differs from major

`MUD_RULES` / `isMuddy` in `mobile/src/lib/guitar-voicings/generate.ts`. The threshold is set by the
**lower** note of an adjacent pair, compared strictly (`gap < minGap` is muddy, so a gap exactly
equal to the minimum passes):

| Lower note below | Minimum gap |
| --- | --- |
| A2 | 4 semitones |
| C3 | 3 semitones |
| A3 | 2 semitones |

**Not one of the twelve C minor grips is muddy**, exactly as not one of the twelve C major grips is.
**Do not write "minor triads down here are mud."** The margins:

| Grip | Notes | Gaps | Margins |
| --- | --- | --- | --- |
| `Cm` 4-5-6 root `8 6 5` | C3 `Eb`3 G3 | 3, 4 | **1**, 2 |
| `C` 4-5-6 root `8 7 5` | C3 E3 G3 | 4, 3 | 2, **1** |
| `Cm` 4-5-6 second `3 3 1` | G2 C3 `Eb`3 | 5, 3 | **1**, **1** |
| `C` 4-5-6 second `3 3 2` | G2 C3 E3 | 5, 4 | **1**, 2 |
| `Cm` 3-4-5 root `x 3 1 0` | C3 `Eb`3 G3 | 3, 4 | **1**, 2 |

**The real difference, and it is lesson 4's content.** Minor swaps the two gaps: the bass-to-third
gap is 3 semitones where major's is 4, and the third-to-fifth gap is 4 where major's is 3. In root
position that narrow gap sits at the **bottom**, which is where the rule is strictest — so minor
runs out of room lower down before major does.

Recomputed exhaustively over all twelve roots and all four sets: exactly **two close minor triads
violate the rule**, and both are the same shape — **`Gm` and `G#m` root position on strings 4-5-6**:

| Grip | Notes | Bass gap | Rule | Verdict |
| --- | --- | --- | --- | --- |
| `Gm` 4-5-6 root `3 1 0 x x x` | G2 `Bb`2 D3 | 3 | G2 is below A2 → needs 4 | **rejected** |
| `G#m` 4-5-6 root `4 2 1 x x x` | G#2 B2 `D#`3 | 3 | G#2 is below A2 → needs 4 | **rejected** |
| `Am` 4-5-6 root `5 3 2 x x x` | A2 C3 E3 | 3 | A2 is below C3 → needs 3 | passes, **exactly on the line** |

So **`Am` root position on strings 4-5-6 is the lowest of the twelve root-position minor triads on
that set that the app's rule accepts**, and its bottom gap sits exactly on the limit. That is the
minor counterpart of chapter 2's floor (`G` major root position, `3 2 0 x x x`, both gaps exactly on
the limit) — two semitones higher up, because minor's bottom gap is one semitone narrower.

**Scope that claim exactly as written.** It is *not* the lowest close minor triad on the guitar in
any inversion: `Dm` first inversion on 4-5-6 is `1 0 0 x x x` (F2 A2 D3) and passes.

**`triad-shape` does not filter mud.** It will happily draw `Gm` on strings 4-5-6. **No lesson may
put a `triad-shape` on `Gm` or `G#m` with `strings: "4-5-6"`.** Every other minor `triad-shape`
in this chapter's plan has been checked.

### The minor first inversion on strings 4-5-6 sits *lower* than the major one

Major is `12 10 10 x x x`; minor is `11 10 10 x x x`. Chapter 2 spent a paragraph on why the major
one cannot come below fret 12, and the minor answer is nearby but not identical — say it precisely:

- **Major**: `E`2 (the open string 6) is available, but the `G` that must sit just above it is G2,
  and string 5's lowest note is A2. The grip waits for E3 at `6·12`.
- **Minor**: `Eb`2 is not available at all — it is a semitone below the open low `E`. The lowest
  `Eb` string 6 can sound is `Eb`3 at `6·11`, and the `G` above it, G3 at `5·10`, is comfortably in
  reach. So the minor grip is forced up by the *string's* floor, not by the note above it, and it
  lands one fret lower than the major.

### The hearing progression — verified

Four chords in C — `Am`, `F`, `C`, `G` — comped entirely on strings 1-2-3, every grip the lowest
one `triad-shape` finds, the whole thing inside frets 0 to 4.

| Chord | Inversion | Chart | Notes low → high |
| --- | --- | --- | --- |
| `Am` | root position | `x x x 2 1 0` | A3 C4 E4 |
| `F` | first inversion | `x x x 2 1 1` | A3 C4 F4 |
| `C` | second inversion | `x x x 0 1 0` | G3 C4 E4 |
| `G` | first inversion | `x x x 4 3 3` | B3 D4 G4 |

Two verified gifts, both worth spending:

1. **`Am` → `F` moves exactly one note by one fret** — string 1, fret 0 to fret 1, E4 to F4. `A` and
   `C` are in both chords and neither finger moves. The moving note is the **fifth** of `Am`
   becoming the **root** of `F`. This is the same size of move the whole chapter is about, applied
   between two different chords rather than between two qualities of one chord.
2. **`x x x 2 1 0` is literally the top three strings of the open `Am` chord** (`x 0 2 2 1 0`) —
   `3·2` A3, `2·1` C4, `1·0` E4. The same trick chapter 1 pulled with open C, A and D, now in minor.

Movement per string (`3`, `2`, `1`), recomputed:

| Change | String 3 | String 2 | String 1 |
| --- | --- | --- | --- |
| `Am` → `F` | `0` | `0` | `+1` |
| `F` → `C` | `−2` | `0` | `−1` |
| `C` → `G` | `+4` | `+2` | `+3` |
| `G` → `Am` (loop) | `−2` | `−2` | `−3` |

The full `Am` grid on strings 1-2-3, for reference: root `x x x 2 1 0`, first `x x x 5 5 5`, second
`x x x 9 10 8`.

**`C` major and `A` minor do not share shapes.** Each chord has its own twelve grips. What they
share is two of three notes — `C` is `C E G`, `Am` is `A C E`, so `C` and `E` are in both. That is a
smaller and different claim, and it is the only one to make.

---

## What chapters 1 and 2 established — reference, never re-teach

Triad = root + third + fifth and a **complete chord**, not a fragment; the barre chord is a triad
with notes doubled. Degrees `1` `3` `5`. Major = `4` then `3` semitones. **Inversion** = which note
is lowest, and it does not rename the chord; slash notation `C/E`. The four string sets named
high-string-first, string 1 = high `e`. The **six-slot chart low E first** with `x`. The `3·5`
**string·fret** shorthand. "Grip", "close voicing", "in the bass", "doubling", "register". **All
twelve C major grips**, on all four sets. The `G`→`B` break, the lift vector, and the fact that
there are three geometries rather than four. Choosing a set by register and by what else is
sounding. Comping `C`–`F`–`G`–`C` on strings 1-2-3 inside frets 0 to 5 by taking the nearest
inversion, taught by feel.

**Chapter 2 already stated the third-finding rule** (in `triad-the-whole-neck`, with a table) and
its checkpoint tested it with a `fretboard` question: tap the third in `x x x 9 8 8`. So chapter 3
does **not** get to present "where the third sits" as a revelation. It restates it once, in lesson
1, as the working tool — and the *new* half is that this is the note that drops.

**The `3·5` shorthand is restated once, in lesson 1**, since a learner may arrive after a gap.
Nothing else from the list above is redefined anywhere in this chapter.

## What this chapter must leave alone

- **Diminished and augmented.** Chapter 4. They may be *named* once, in the closing line of lesson
  5 or 6, as what is coming — nothing more. No grip, no formula beyond what chapter 1 already said.
- **The term "voice leading."** Chapter 5 names it. Teach by feel: move the least, keep a finger
  where you can.
- **Harmonising the scale**, and Roman numerals in prose. Lesson 6's four chords are `Am`, `F`, `C`
  and `G` — four chords in C, not degrees of a scale.
- **Relative major / minor as a system.** `Am` appears in lesson 6 because it is a chord in the
  progression, not because it is C major's relative minor. One clause naming the two chords' shared
  notes is the limit; do not build on it.
- **Spread / open voicings, seventh chords, minor sevenths, CAGED, modes, alternate tunings.**

## What this chapter must hand to chapter 4

A learner fluent in both the major and the minor grips on all four sets, who is comfortable that
**the third is the note doing the work**. Chapter 4 moves the *fifth* next and needs that contrast
to land, so every lesson here should keep the fifth conspicuously still.

---

## Lessons

### 1. `triad-one-note-lower` — "One Note, One Fret"

- **Section id**: `triads.ch3.one-note-lower` · **Article id**: `art_triad-one-note-lower` · ~6 min
- **The one thing**: a minor triad is a major triad with the third dropped one semitone — one fret —
  and everything else about it is unchanged.
- **Misconception**: "minor is a different set of shapes to learn." It is twelve shapes the learner
  already owns with one finger moved.
- **Key points, in order**:
  1. Open with the claim, concretely and immediately. Minor is `1 b3 5`; major is `1 3 5`. One note
     changes, it drops a semitone, and a semitone is one fret. Same root, same fifth, same string
     set, same inversion, same place on the neck.
  2. **Restate the notation once**, plainly, one sentence: `3·5` means string 3, fret 5; charts are
     six slots low E first with `x` for a string not played; string 1 is the high `e`.
  3. **The rule, restated as the working tool.** Chapter 2 established where the third sits — say so
     rather than presenting it as new. Table it: root position → the middle note; first inversion →
     the bass note; second inversion → the top note. Then add the new half: **that is the note that
     drops.** Degrees `1 b3 5`, `b3 5 1`, `5 1 b3` — always `b3`, **never** `m3`.
  4. **Root position on strings 1-2-3, major beside minor.** `x x x 5 5 3` (C4 E4 G4) becomes
     `x x x 5 4 3` (C4 `Eb`4 G4). `2·5` moves to `2·4`. One finger. Two `triad-shape` blocks side
     by side — this is the chapter's signature move and this is where to spend it.
  5. **First inversion on strings 1-2-3.** `x x x 9 8 8` becomes `x x x 8 8 8` — the bass note drops,
     because in a first inversion the third *is* the bass. And it lands flush: three notes at one
     fret. Chapter 2 met **the one C major grip** that does that, `x x 5 5 5 x` on strings 2-3-4;
     C minor has one too, on this set. **Scope that sentence exactly as written** — see the warning
     in the verified reference above.
  6. **Second inversion, and the one that relocates.** Give this real room; it is the lesson's best
     paragraph. Major is `x x x 0 1 0`. The rule says drop the top note — but the top note is the
     open high `e`, and there is no fret below an open string. The pitch wanted is `Eb`4, a semitone
     below E4, and string 1 cannot sound anything below E4. The next `Eb` it can reach above the C
     is `Eb`5 at `1·11`, an octave and a minor third up instead of a minor third — not close, and
     not a hand span. So the grip waits for the next `G` on string 3 at `3·12`: `x x x 12 13 11`,
     G4 C5 `Eb`5.
  7. **Then be honest about what that means.** Absolute frets say the shape relocated. The rule says
     one note dropped a fret. Both are true, and the reconciliation is that **the rule is about
     pitch** — divide the octave out and the single fret is right there. The neck sometimes has
     nowhere to put the result. One sentence tying it to chapter 2's argument for
     `12 10 10 x x x` — link `triad-major-strings-4-5-6` — because it is the same kind of
     obstruction: a string that cannot reach low enough.
  8. Summary table: inversion, major chart, minor chart, which voice dropped, minor notes.
  9. Close by asking whether the rule survives a change of set.
- **Live**: `triad-shape` × 4 — `{root:"C", strings:"1-2-3", inversion:"root"}` and
  `{root:"C", quality:"minor", strings:"1-2-3", inversion:"root"}` as an adjacent pair, then
  `{root:"C", quality:"minor", strings:"1-2-3", inversion:"first"}`, then
  `{root:"C", quality:"minor", strings:"1-2-3", inversion:"second"}` (the component finds fret 11
  on its own — do **not** pass `minFret`).
- **Leaves the next lesson**: the rule, one set proved, and an open question about the other three.

### 2. `triad-minor-strings-2-3-4` — "The Flush Shape Loses Its Flush"

- **Section id**: `triads.ch3.minor-strings-2-3-4` · **Article id**:
  `art_triad-minor-strings-2-3-4` · ~5 min
- **The one thing**: the rule survives the move to a new set untouched — the third still sits where
  the inversion says, and it still drops one fret.
- **Misconception**: "the B string will bite again, so the minor correction must be different on
  this set." It is not. The `G`→`B` shift is already baked into the major grips the learner knows;
  dropping the third is a separate, smaller move that does not interact with it.
- **Key points, in order**:
  1. Predict first. Name the inversion, name the voice, drop it a fret — then check all three.
  2. The three grips in **neck order** (first, second, root), each with `triad-shape`, notes and
     degrees in prose:
     - first inversion `x x 1 0 1 x` — `4·1` `Eb`3, `3·0` G3, `2·1` C4, degrees `b3 5 1`, bass
       `Eb`. Major was `x x 2 0 1 x`, the `C/E` grip from chapter 1 and the middle of the open C
       chord; the bass finger comes back one fret and it is `Cm/Eb`.
     - second inversion `x x 5 5 4 x` — `4·5` G3, `3·5` C4, `2·4` `Eb`4, degrees `5 1 b3`, bass
       `G`. **This is the lesson's centrepiece.** Chapter 2's friendliest grip on the guitar,
       `x x 5 5 5 x`, three notes flat across one fret — and a minor chord is one fret from it, on
       the top string only. Draw the two side by side.
     - root position `x x 10 8 8 x` — `4·10` C4, `3·8` `Eb`4, `2·8` G4, degrees `1 b3 5`, bass `C`.
       The middle note drops and lands level with the top: two notes at fret 8, one at fret 10.
  3. **Why the B string does not complicate this.** One short paragraph, because a learner who
     absorbed chapter 2 will expect it to. The lift the break causes is already inside the major
     grip; the minor move is measured against that grip, not against an all-fourths guitar. Every
     set gets the same one-fret drop.
  4. Summary table: inversion, major chart, minor chart, notes, degrees, bass.
  5. Close by pointing down one more set, and at the open C chord.
- **Live**: `triad-shape` × 4 —
  `{root:"C", quality:"minor", strings:"2-3-4", inversion:"first"}`, then the pair
  `{root:"C", strings:"2-3-4", inversion:"second"}` and
  `{root:"C", quality:"minor", strings:"2-3-4", inversion:"second"}`, then
  `{root:"C", quality:"minor", strings:"2-3-4", inversion:"root"}`.
- **Leaves the next lesson**: the rule tested once and unbroken.

### 3. `triad-minor-strings-3-4-5` — "One Finger Inside the Open C Chord"

- **Section id**: `triads.ch3.minor-strings-3-4-5` · **Article id**:
  `art_triad-minor-strings-3-4-5` · ~5 min
- **The one thing**: on the middle set the minor move is a single finger inside a chord the learner
  has played since their first month — with one trap that has to be named.
- **Misconception**: "so I can play a C minor chord by moving one finger in my open C." **No** — and
  this is the lesson's warning. It is only true of strings 5-4-3; leave the other two ringing and
  the chord has both an `Eb` and an `E` in it.
- **Key points, in order**:
  1. The three grips in **neck order** (root, first, second), `triad-shape` each:
     - root position `x 3 1 0 x x` — `5·3` C3, `4·1` `Eb`3, `3·0` G3, degrees `1 b3 5`, bass `C`.
     - first inversion `x 6 5 5 x x` — `5·6` `Eb`3, `4·5` G3, `3·5` C4, degrees `b3 5 1`, bass
       `Eb`. Worth a line: the major grip is `x 7 5 5 x x`, spanning three frets; dropping the bass
       pulls it into two, so the minor version is the easier stretch of the pair.
     - second inversion `x 10 10 8 x x` — `5·10` G3, `4·10` C4, `3·8` `Eb`4, degrees `5 1 b3`,
       bass `G`.
  2. **The open C connection, and its limit.** Chapters 1 and 2 both read the open C chord
     (`x 3 2 0 1 0`) on strings 5-4-3 as C major root position on this set — link
     `triad-open-chords-you-know`. Move `4·2` back to `4·1` and those three strings are C minor
     root position.
  3. **The trap, as a `warning` callout.** `x 3 1 0 1 0` is not a C minor chord. Strings 2 and 1
     still sound `C4` and `E4`, so the chord holds an `Eb` **and** an `E` at once. The one-finger
     move only works if the other two strings are muted. Name it plainly; a learner will try it.
  4. **The set's character in minor**, short and honest — this is the fullest register on the
     instrument, and chapter 2 already argued why (body resonance, plus convention). Do not
     re-argue it. What is new: `Cm` root position here puts a minor third at the very bottom of the
     grip, C3 to `Eb`3, and this is the lowest set where that still rings clearly. Set up lesson 4
     with that sentence rather than settling it.
  5. Close by pointing at the bottom set.
- **Live**: `triad-shape` × 3 —
  `{root:"C", quality:"minor", strings:"3-4-5", inversion:"root"}`, then `"first"`, then `"second"`.
- **Leaves the next lesson**: the observation that minor puts its narrow gap at the bottom.

### 4. `triad-minor-strings-4-5-6` — "The Bottom Set, Where Minor Runs Out First"

- **Section id**: `triads.ch3.minor-strings-4-5-6` · **Article id**:
  `art_triad-minor-strings-4-5-6` · ~6 min
- **The one thing**: the same one-fret move, on the set where it costs something — minor's narrow
  gap sits at the bottom of the grip, and down here that is where the neck's room runs out.
- **Misconception**: "minor triads down here are mud." They are not. C minor's are all legal. What
  is true is that minor's floor is higher than major's, and there are exactly two grips that fail.
- **Key points, in order**:
  1. The three grips in **neck order** (second, root, first), `triad-shape` each:
     - second inversion `3 3 1 x x x` — `6·3` G2, `5·3` C3, `4·1` `Eb`3, degrees `5 1 b3`, bass
       `G`. Major was `3 3 2 x x x`.
     - root position `8 6 5 x x x` — `6·8` C3, `5·6` `Eb`3, `4·5` G3, degrees `1 b3 5`, bass `C`.
       Major was `8 7 5 x x x`.
     - first inversion `11 10 10 x x x` — `6·11` `Eb`3, `5·10` G3, `4·10` C4, degrees `b3 5 1`,
       bass `Eb`.
  2. **The first inversion sits one fret *lower* than the major one, for a related but different
     reason.** Chapter 2 explained why `12 10 10 x x x` cannot come down — link
     `triad-major-strings-4-5-6`. Here: `Eb`2 is a semitone below the open low `E`, so string 6
     cannot sound it at all; the lowest `Eb` it has is `Eb`3 at `6·11`, and the `G` just above it
     (G3 at `5·10`) is well within reach. Major is held up by the note *above* the bass; minor is
     held up by the bass note itself. Get this distinction right — it is the lesson's sharpest
     paragraph.
  3. **Mud, told accurately.** Restate the thresholds from chapter 2 in one sentence (below `A2`,
     at least a major third; below `C3`, at least three semitones; below `A3`, at least two).
     **Every one of C minor's twelve grips passes, exactly as every one of C major's does.** Say so
     plainly before saying anything about tightness.
  4. **What actually differs, and it is the whole lesson.** Minor swaps the two gaps. Major root
     position stacks 4 then 3; minor stacks 3 then 4. The narrow one moves to the bottom, and the
     bottom is where the rule is strictest. Concretely: `Cm` root position on this set is C3 `Eb`3
     G3 — the bottom gap clears its floor by one semitone where major's clears by two.
  5. **The floor, made concrete — one deliberate step outside C.** Chapter 2's floor was `G` major
     root position on this set, `3 2 0 x x x`, both gaps exactly on the limit. Minor's floor is two
     semitones higher: **`Am` root position, `5 3 2 x x x` — A2 C3 E3 — whose bottom gap sits
     exactly on the limit.** Go one root lower and the app's own rule rejects the voicing: `Gm`
     root position on this set would be G2 `Bb`2 D3, a minor third where the rule wants a major
     third. `G#m` fails the same way. Say why you left C for one example.
     - **Scope it exactly**: "of the twelve root-position minor triads on strings 4-5-6". Do not
       write "the lowest close minor triad on the guitar" — that is a different and false claim.
  6. **When to use it.** Short — chapter 2 made the arrangement argument and this lesson should not
     repeat it. One or two lines on what is minor-specific: the `b3` sits closer to the bass than a
     major third does, so a low minor triad asks more of the room it is in than the major one at
     the same pitch.
  7. Close: four sets, one rule, and a map that is now twice the size for no extra memorising.
- **Live**: `triad-shape` × 4 —
  `{root:"C", quality:"minor", strings:"4-5-6", inversion:"second"}`, then `"root"`, then `"first"`,
  then `{root:"A", quality:"minor", strings:"4-5-6", inversion:"root"}` for the floor.
  **Never draw `Gm` or `G#m` on strings 4-5-6** — the component does not filter mud and would draw
  a voicing the app's own generator rejects.
- **Leaves the next lesson**: all twelve grips met, and no map of them yet.

### 5. `triad-where-the-third-hides` — "Twelve More Grips You Already Knew"

- **Section id**: `triads.ch3.where-the-third-hides` · **Article id**:
  `art_triad-where-the-third-hides` · ~5 min
- **The one thing**: the whole minor map on one page, derived rather than memorised — and the rule
  run backwards, so a grip can be read as well as built.
- **Misconception**: "I now know twenty-four grips." Twelve, plus one rule about where the third
  hides.
- **Key points, in order**:
  1. The master table: four rows, three columns, all twelve C minor charts. Recompute every cell.
  2. The rule in **both directions**, as a procedure the learner can run in two seconds: name the
     inversion → that tells you the voice → drop it a fret for minor, raise it a fret for major.
     Nothing else in the grip moves. State plainly that this is why the chapter needed no new
     shapes.
  3. `triad-ladder` on strings 1-2-3, minor — and use it to make the claim a table cannot. C major's
     ladder on this set starts at the nut with the second inversion; C minor's does not have one
     there at all. It starts on root position at fret 3, and the second inversion appears at frets
     11 to 13. **The cycle's order round the set is the same; where it starts on the neck is not.**
  4. `triad-ladder` on strings 2-3-4, minor — where nothing relocated, so the order and the starting
     inversion match the major ladder exactly. Two ladders, one contrast. Say once that they are
     silent, as chapters 1 and 2 did.
  5. **Reading a grip instead of building one.** Every minor first inversion on strings 1-2-3 is
     flush — all three notes at one fret — so a small three-string barre up there is always *some*
     minor chord with its third in the bass. `x x x 0 0 0` (the top three open strings, G3 B3 E4) is
     `Em`; `x x x 5 5 5` is `Am`; `x x x 8 8 8` is `Cm`. Verified for all twelve roots — this is a
     superlative-shaped claim and it has been checked, but do not extend it to any other set.
  6. Close by naming what is left: the third has done all the work in this chapter, and chapter 4
     moves the fifth. Name diminished and augmented once, as what is coming, and stop.
- **Live**: `triad-ladder` × 2 —
  `{root:"C", quality:"minor", strings:"1-2-3"}` and `{root:"C", quality:"minor", strings:"2-3-4"}`.
- **Leaves the next lesson**: everything built, nothing yet heard.

### 6. `triad-hearing-major-and-minor` — ★ "Hearing the One Note"

- **Section id**: `triads.ch3.hearing-major-and-minor` · **Article id**:
  `art_triad-hearing-major-and-minor` · ~6 min
- **The one thing**: train the ear on the note that moves rather than on the chord's "mood", then
  put it in a progression.
- **Misconception**: "major sounds happy, minor sounds sad, and that is what you listen for."
  It is a poor listening target — it is contested as a universal, it collapses the moment a chord
  appears inside a progression, and it gives the ear nothing specific to attend to.
- **Key points, in order**:
  1. Open on the listening target, not the mood. The difference between the two chords is one note
     out of three, and it is the *inner* note in root position — the hardest voice to pick out.
     Attending to that specific voice is the skill; "happy/sad" is a label applied afterwards.
  2. **What is actually true about why they sound different** — see the research section below.
     Keep it to two or three sentences, separate what is measurable from what is learned, and do
     not overclaim.
  3. **The contrastive drill, same root, one finger.** `x x x 5 5 3` and `x x x 5 4 3` on strings
     1-2-3 — alternate them, slowly, and listen only to string 2. Then close your eyes and have the
     finger land at random. Use `/drone` on `C` underneath so the root never moves and the only
     variable is the third. Link text "Drone".
  4. **Then break the crutch.** Once same-root pairs are easy, change the root between attempts —
     otherwise the ear learns the absolute pitch of one note rather than the interval. Send them to
     `/ear-trainer` for that. Link text "Ear Trainer".
  5. **The progression.** Four chords in C on strings 1-2-3, everything inside frets 0 to 4:
     `Am` `x x x 2 1 0`, `F` `x x x 2 1 1`, `C` `x x x 0 1 0`, `G` `x x x 4 3 3`. Table it with the
     notes. **No Roman numerals, no talk of a harmonised scale.**
  6. **The two gifts, both spent.**
     - `Am` → `F` moves exactly one note by one fret — string 1, E4 to F4. `A` and `C` stay put
       under two fingers. Same size of move as the whole chapter, but between two different chords
       rather than two qualities of one. Note what the moving note *is*: the fifth of `Am` becoming
       the root of `F`.
     - `x x x 2 1 0` is the top three strings of the open `Am` chord, `x 0 2 2 1 0` — chapter 1's
       trick, in minor. Link `triad-open-chords-you-know`.
  7. **How to practise it.** `/metronome`, one chord per bar, slow. Then sing or hum the top string
     through the change, because it is the only voice that moves. Then the ear test: loop the four
     chords and name the minor one without looking.
  8. **The precise claim about `C` and `Am`.** They share two of three notes — `C E G` against
     `A C E`. **Do not say they share shapes**; they do not, and each has its own twelve grips.
  9. Close on chapter 4 by number: the third has been the whole story, and the fifth is next.
- **Live**: `triad-shape` × 1 — `{root:"A", quality:"minor", strings:"1-2-3", inversion:"root"}`.
  Chapter 2 already drew `F` first inversion and `G` first inversion on this set, and chapter 1 drew
  the `C` second inversion, so the table carries those three; only `Am` is new.
- **Screens**: `/drone`, `/ear-trainer`, `/metronome`.

---

## What the ear lesson may and may not claim

The dedicated research pass on minor-third perception did **not** return before the chapter was
finished, so `triad-hearing-major-and-minor` was written deliberately conservatively: it makes no
claim that depends on a study it cannot cite, and it does not name any source. What it asserts:

- **Safe, and the lesson's thesis.** The entire acoustic difference between C major and C minor is
  the third — three semitones above the root instead of four. Root and fifth are identical. This is
  definitional and needs no citation.
- **Safe.** In root position the third is the inner voice, and outer voices are easier to attend to.
  Stated as a reason the "happy/sad" shortcut is tempting, not as a cited finding.
- **Hedged, and correctly.** "The happy/sad association is strong and early in listeners raised on
  Western music, and much weaker as a universal than it is usually presented." Deliberately no
  study, no percentage, and no claim that it is *purely* learned — the cross-cultural literature is
  genuinely mixed and a stronger sentence in either direction would be indefensible.
- **Safe, and practical.** Mood collapses in context: a minor chord can sound lifting and a major
  one wistful depending on what surrounds it.
- **Pedagogy.** Contrastive same-root pairs first, then vary the root, on the ground that a fixed
  root lets the ear learn one absolute pitch instead of the interval. Stated as practice advice
  rather than as a research finding.

**If a later session runs the research**, the two places to strengthen are the cross-cultural
sentence and the "inner voice is harder to hear" claim, both of which are currently hedged further
than they may need to be. Nothing in the lesson would have to be retracted.

---

## Activities

### A. `triad-move-the-third`

- **Section id**: `triads.ch3.move-the-third` · `"optional": true` · ~6 min
- Placed after lesson 1, whose three grips it drills.
- **Kind**: `note-play`, modes `easy` and `hard`, document board frets 0–13.
- **What it drills**: locating the flattened third in each of the three inversions on strings 1-2-3,
  including the one that relocates, and hearing the third drop.
- **Rounds** (pitches distinct within each round — checked):
  1. `r_triad-move-the-third.root` — `x x x 5 4 3`: `3·5` C4 (60), `2·4` `Eb`4 (63), `1·3` G4 (67).
  2. `r_triad-move-the-third.first` — `x x x 8 8 8`: `3·8` `Eb`4 (63), `2·8` G4 (67), `1·8` C5 (72).
  3. `r_triad-move-the-third.second` — `x x x 12 13 11`: `3·12` G4 (67), `2·13` C5 (72), `1·11`
     `Eb`5 (75).
  4. `r_triad-move-the-third.the-drop` — `ordered: true`: `3·5` C4 (60), `2·5` E4 (64), `2·4` `Eb`4
     (63). Root, major third, minor third — the chapter's whole move as three notes.

### B. `triad-play-the-minor-changes`

- **Section id**: `triads.ch3.play-the-minor-changes` · `"optional": true` · ~6 min
- Placed last, after lesson 6, whose progression it drills.
- **Kind**: `note-play`, modes `easy` and `hard`, document board frets 0–5.
- **What it drills**: the four grips of the hearing progression, in order, inside one hand position.
- **Rounds** (pitches distinct within each round — checked):
  1. `r_triad-play-the-minor-changes.a-minor` — `x x x 2 1 0`: `3·2` A3 (57), `2·1` C4 (60), `1·0`
     E4 (64).
  2. `r_triad-play-the-minor-changes.f-major` — `x x x 2 1 1`: `3·2` A3 (57), `2·1` C4 (60), `1·1`
     F4 (65).
  3. `r_triad-play-the-minor-changes.c-major` — `x x x 0 1 0`: `3·0` G3 (55), `2·1` C4 (60), `1·0`
     E4 (64).
  4. `r_triad-play-the-minor-changes.g-major` — `x x x 4 3 3`: `3·4` B3 (59), `2·3` D4 (62), `1·3`
     G4 (67).

---

## Checkpoint — `triads-ch3-checkpoint`

`kind: "checkpoint"`, `passThresholdPct: 70`, title "Checkpoint: Minor Triads".
**Written after the finished articles are read, from what they actually say.** Planned coverage —
and none of these may duplicate a chapter 1 or chapter 2 question (both checkpoints were read):

1. Which note changes and by how much, and what stays the same (L1).
2. Given a grip and its inversion, which voice moves — as a `fretboard` question: here is `C` major
   root position on strings 3-4-5, `x 3 2 0 x x`; tap where the finger goes to make it `Cm`.
   Answer `4·1`. Distinct from chapter 2's "tap the third in `x x x 9 8 8`" (L1, L3, L5).
3. Why `Cm`'s second inversion on strings 1-2-3 is not at the nut (L1).
4. A `listen` question — a C minor triad in root position, `C4 Eb4 G4`, `mode: "chord"`; which of
   four charts is it (L1, L5).
5. The flush shape: what `x x x 5 5 5` is, or what happens to `x x 5 5 5 x` in minor (L2, L5).
6. The bottom set: why minor runs out of room before major does (L4).
7. The open C trap — why `x 3 1 0 1 0` is not a C minor chord (L3).
8. The progression: which note moves from `Am` to `F` (L6).

Trim to seven if any two collapse.

## Dispatch

- **Agent A** — lessons 1, 2, 3. Establishes the chapter's framing, restates the shorthand, and
  owns the relocation argument.
- **Agent B** — lessons 4, 5. Given Agent A's exact claims, so it extends rather than re-derives.
- **Agent C** — lesson 6. Dispatched after the research pass lands, carrying its findings verbatim.

All are told: the content gate is red mid-chapter because the corpus counts in
`packages/content/src/load.test.ts` are pinned; that is expected, and they must not touch it.
