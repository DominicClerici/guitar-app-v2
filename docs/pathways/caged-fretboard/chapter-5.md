# Chapter 5 — Off the Boxes

Chapter id `caged-fretboard.ch5` · slug `off-the-boxes` · 6 articles, 1 activity, 1 checkpoint.
**The last chapter of the pathway.**

After this chapter the learner can move between adjacent forms through the notes they share, play
horizontally along a string or a string pair instead of vertically inside one window, run a real
progression up the neck instead of jumping back to the nut, and transpose the whole ladder to any
key.

---

## Structure decision

**Six lessons, and this chapter is not organised by form.** Chapters 1–4 were an opener, five form
lessons and a closer. There are no form lessons here at all — the five windows are finished, and
this chapter is about what you *do* with them. The cut is:

1. **The argument against the boxes** — the criticism, answered head-on, and the vertical/horizontal
   distinction that the rest of the chapter runs on.
2. **Shared notes** — changing window mid-phrase through a note that belongs to both.
3. **Along the strings** — abandoning the window as the organising unit entirely.
4. **A progression up the neck** — the same idea in chords rather than single notes.
5. **Transposing the ladder** — the payoff that makes chapters 1–4 portable.
6. **The closer** — ends five chapters, not one.

Lessons 2 and 3 are the pair most at risk of blurring, so the boundary is stated hard: **lesson 2
keeps the window as the unit and adds a doorway; lesson 3 throws the window away and uses the string
as the unit.** Neither may do the other's job.

---

## Verified facts this chapter is built on

Recomputed from the app's own `cagedFormWindows` / `cagedMarks` / `CAGED_FORM_OFFSETS`
(`mobile/src/lib/guitar-positions/caged.ts`) and standard-tuning MIDI. **These are the numbers every
lesson must use.** String numbering is **1 = high e, 6 = low E** everywhere. Positions are written
`string·fret` — the shorthand chapter 1's closer defined.

### The C major ladder, unchanged

| Form | Barre fret | Window | Roots |
| --- | --- | --- | --- |
| C | 0 | `0–4` | `5·3`, `2·1` |
| A | 3 | `2–6` | `5·3`, `3·5` |
| G | 5 | `4–8` | `6·8`, `3·5`, `1·8` |
| E | 8 | `7–11` | `6·8`, `4·10`, `1·8` |
| D | 10 | `9–13` | `4·10`, `2·13` |

### The pivot fact — the chapter's single best new discovery

Chapter 3 proved that on **string 6**, each window's upper pentatonic dot is the next window's lower
one. **That is true on all six strings, in every adjacent pair, with no exception.** Verified
exhaustively at the pentatonic layer — 24 cases, exactly one shared dot each:

| Pair | str 6 | str 5 | str 4 | str 3 | str 2 | str 1 |
| --- | --- | --- | --- | --- | --- | --- |
| C→A | fret 3 | 3 | 2 | 2 | 3 | 3 |
| A→G | 5 | 5 | 5 | 5 | 5 | 5 |
| G→E | 8 | 7 | 7 | 7 | 8 | 8 |
| E→D | 10 | 10 | 10 | 9 | 10 | 10 |

At the **full-scale** layer each string of an overlap carries **one or two** shared dots — never
zero. Verified per string:

| Pair | Shared frets per string, 6 → 1 |
| --- | --- |
| C∩A | `3` · `2,3` · `2,3` · `2,4` · `3` · `3` |
| A∩G | `5` · `5` · `5` · `4,5` · `5,6` · `5` |
| G∩E | `7,8` · `7,8` · `7` · `7` · `8` · `7,8` |
| E∩D | `10` · `10` · `9,10` · `9,10` · `10` · `10` |

**The consequence, which is lesson 2's thesis: whichever string your phrase is on, there is a note
under your hand that belongs to both the window you are in and the next one.** You never have to get
back to a particular string to change position.

The A→G row is the strongest single case — **fret 5 on all six strings** is in both windows, which is
chapter 3's fret-5 fact re-read as a doorway.

### The pivot roots — chapter 1's table, cashed

Every adjacent pair shares at least one **root**, and these are exactly the six `C`s chapter 1
counted:

| Pair | Shared root(s) |
| --- | --- |
| C ∩ A | `5·3` |
| A ∩ G | `3·5` |
| G ∩ E | `6·8` **and** `1·8` |
| E ∩ D | `4·10` |
| D ∩ C (at fret 12) | `2·13` |

`2·1` is the only `C` in the first twelve frets belonging to one form alone — chapter 1 said so, and
it is the one root that is not a doorway.

### The full overlaps at the scale layer (for reference, not for a table in the article)

- C∩A, frets 2–4: `6·3`=`5`, `5·2`=`7`, `5·3`=`1`, `4·2`=`3`, `4·3`=`4`, `3·2`=`6`, `3·4`=`7`,
  `2·3`=`2`, `1·3`=`5`
- A∩G, frets 4–6: `6·5`=`6`, `5·5`=`2`, `4·5`=`5`, `3·4`=`7`, `3·5`=`1`, `2·5`=`3`, `2·6`=`4`,
  `1·5`=`6`
- G∩E, frets 7–8: `6·7`=`7`, `6·8`=`1`, `5·7`=`3`, `5·8`=`4`, `4·7`=`6`, `3·7`=`2`, `2·8`=`5`,
  `1·7`=`7`, `1·8`=`1`
- E∩D, frets 9–11: `6·10`=`2`, `5·10`=`5`, `4·9`=`7`, `4·10`=`1`, `3·9`=`3`, `3·10`=`4`, `2·10`=`6`,
  `1·10`=`2`

Chapter 4's closer already said in one sentence that every overlap holds all seven degrees with
something on every string. **Do not re-prove it with a table** — lesson 2 uses the per-string version
above, which is a different and sharper claim.

### How many windows each fret belongs to

| Fret | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Windows | C | C | CA | CA | **CAG** | AG | AG | GE | GE | ED | ED | ED | D | D |

**Fret 4 is the only fret in three windows at once** (C, A and G) — verified over frets 0–13, and
the same fact `caged.ts`'s own comment names as the reason the ladder needs three lanes rather than
two. Frets 0, 1, 12 and 13 are the only ones in a single window. Lesson 2 may use this; nothing else
may.

### The C major scale on every string, frets 0–15

`1`=`C`, `2`=`D`, `3`=`E`, `4`=`F`, `5`=`G`, `6`=`A`, `7`=`B`.

| String | Fret = degree (note) |
| --- | --- |
| 6 | 0=`3`(E) 1=`4`(F) 3=`5`(G) 5=`6`(A) 7=`7`(B) 8=`1`(C) 10=`2`(D) 12=`3`(E) 13=`4`(F) 15=`5`(G) |
| 5 | 0=`6`(A) 2=`7`(B) 3=`1`(C) 5=`2`(D) 7=`3`(E) 8=`4`(F) 10=`5`(G) 12=`6`(A) 14=`7`(B) 15=`1`(C) |
| 4 | 0=`2`(D) 2=`3`(E) 3=`4`(F) 5=`5`(G) 7=`6`(A) 9=`7`(B) 10=`1`(C) 12=`2`(D) 14=`3`(E) 15=`4`(F) |
| 3 | 0=`5`(G) 2=`6`(A) 4=`7`(B) 5=`1`(C) 7=`2`(D) 9=`3`(E) 10=`4`(F) 12=`5`(G) 14=`6`(A) |
| 2 | 0=`7`(B) 1=`1`(C) 3=`2`(D) 5=`3`(E) 6=`4`(F) 8=`5`(G) 10=`6`(A) 12=`7`(B) 13=`1`(C) 15=`2`(D) |
| 1 | 0=`3`(E) 1=`4`(F) 3=`5`(G) 5=`6`(A) 7=`7`(B) 8=`1`(C) 10=`2`(D) 12=`3`(E) 13=`4`(F) 15=`5`(G) |

### One string, one octave, one full pass of the cycle

The low E string's scale frets and the windows each belongs to:

| Fret | 0 | 1 | 3 | 5 | 7 | 8 | 10 | 12 | 13 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Degree | `3` | `4` | `5` | `6` | `7` | `1` | `2` | `3` | `4` |
| In window(s) | C | C | C A | A G | G E | G E | E D | D | D |

**Playing the eight notes from fret 0 to fret 12 on the low E string passes through all five windows
in C-A-G-E-D order, once.** An octave on one string is twelve frets; the five windows tile twelve
frets; so one octave along a single string is exactly one full turn of the wheel. That is lesson 3's
best sentence and it is verified.

The high e string is identical (strings 6 and 1 are two octaves apart at the same fret — chapter 1).

### String pairs — four notes per string, one octave

Verified. Every one of these is an exact octave, eight notes, `1 2 3 4 5 6 7 1`:

| Strings | Frets, lower string | Frets, upper string | Shift |
| --- | --- | --- | --- |
| 5 → 4 | `3 5 7 8` | `5 7 9 10` | **+2** |
| 2 → 1 | `1 3 5 6` | `3 5 7 8` | **+2** |
| 3 → 2 | `5 7 9 10` | `8 10 12 13` | **+3** |
| 6 → 5 | `8 10 12 13` | `10 12 14 15` | **+2** |

**The second string's pattern is the first one moved up two frets — three when the crossing is
string 3 to string 2.** That is chapter 1's octave rule (`6→4` and `5→3` are `+2`; `4→2` and `3→1`
are `+3`, because `G → B` is the one major third in standard tuning) showing up in a horizontal run
instead of an octave shape. New use of an old fact; lesson 3 owns it.

**The `5 → 4` run is the one to teach.** It starts on `5·3` — a root, and the C∩A doorway — and ends
on `4·10` — a root, and the E∩D doorway. Eight notes, one octave, and it walks the hand from fret 3
to fret 10, crossing every window between them. Its window trail, note by note: `5·3` [C,A],
`5·5` [A,G], `5·7` [G,E], `5·8` [G,E], `4·5` [A,G], `4·7` [G,E], `4·9` [E,D], `4·10` [E,D].

**Careful:** the trail is not monotonic — crossing from string 5 to string 4 steps *back* three
frets. A lesson that says "it climbs steadily through the five windows" is wrong. The honest claim
is that the run travels from fret 3 to fret 10 and never sits inside one window.

### The progression — `C` – `F` – `G`

The only three major chords the C major scale builds: `C` (`C E G`), `F` (`F A C`), `G` (`G B D`).
Verified against the scale. **Major chords only** — that is why this progression and not a more
famous one. No lesson may name a minor chord or reach for Roman numerals as a system.

Barre frets, computed from each key's root on the low E string:

| Chord | C form | A form | G form | E form | D form |
| --- | --- | --- | --- | --- | --- |
| `C` | **0** | 3 | 5 | 8 | 10 |
| `F` | 5 | 8 | 10 | **1** | 3 |
| `G` | 7 | 10 | **0** | 3 | 5 |

Windows, for the diagram's sake:

| Chord | Windows, nut upward |
| --- | --- |
| `C` | C `0–4`, A `2–6`, G `4–8`, E `7–11`, D `9–13` |
| `F` | E `0–4`, D `2–6`, C `5–9`, A `7–11`, G `9–13` |
| `G` | G `0–3`, E `2–6`, D `4–8`, C `7–11`, A `9–13` |

**Three routes, all verified:**

- **At the nut** — `C` = C form open, `F` = E form barred at `1`, `G` = G form open. What everyone
  already plays, and the reason is now nameable: those are three *different forms* that happen to
  sit near the nut in this key.
- **All three at fret 3** — `C` = A form (`x 3 5 5 5 3`), `F` = D form (`x x 3 5 6 5`), `G` = E form
  (`3 5 5 4 3 3`). **The hand does not move at all.** Three chords, three different forms, one
  position. This is the chapter's showpiece and every grip above is verified.
- **Around fret 8** — `C` = E form barred at `8` (`8 10 10 9 8 8`), `F` = A form barred at `8`
  (`x 8 10 10 10 8`), `G` = A form barred at `10` (`x 10 12 12 12 10`). **`C` and `F` are at the same
  fret**, because the E form's root is on string 6 and the A form's is on string 5, a fourth higher.
  Only the two forms chapter 2 said hold as full barres are used. Then two frets up for the `G`.

`C` and `G` also share barre frets 0, 3, 5 and 10; `C` and `F` share 3, 5, 8 and 10; all three share
**3, 5 and 10**. At fret 5: `C` = G form, `F` = C form, `G` = D form — all three fragment forms, so
it is a worse route to teach than fret 3 even though the arithmetic is prettier.

**Do not teach a "two forms back in the wheel = a fourth up" rule.** It is true for four of the five
forms and fails for the fifth (C form → E form spans four frets, not five), and a rule with a
one-in-five exception is worse than no rule. This was computed and rejected deliberately.

### Transposing — verified in every key this chapter names

Recomputed with the same code that draws the diagrams. **The brief's table is correct**; these are
the confirmed numbers.

| Key | The ladder, nut upward | The cycle |
| --- | --- | --- |
| `C` | C `0–4`, A `2–6`, G `4–8`, E `7–11`, D `9–13` | C→A→G→E→D |
| `G` | G `0–3`, E `2–6`, D `4–8`, C `7–11`, A `9–13` | G→E→D→C→A |
| `A` | A `0–3`, G `1–5`, E `4–8`, D `6–10`, C `9–13` | A→G→E→D→C |
| `D` | D `0–3`, C `2–6`, A `4–8`, G `6–10`, E `9–13` | D→C→A→G→E |
| `E` | E `0–3`, D `1–5`, C `4–8`, A `6–10`, G `8–12` | E→D→C→A→G |
| `F` | E `0–4`, D `2–6`, C `5–9`, A `7–11`, G `9–13` | E→D→C→A→G |

**Fact 1 — the wheel never turns.** Every one of those cycles is the same loop
`C → A → G → E → D → C → …` read from a different starting point. Changing key changes where you
enter it and nothing else. Verified in all six.

**Fact 2 — the form named after the key sits at the nut**, in every key that has an open chord of
that name: `C` in C, `G` in G, `A` in A, `D` in D, `E` in E. That is not a coincidence — it is why
the system is called CAGED. The five forms *are* the five open major chord shapes, and each one sits
at the nut in exactly the key it is named for.

**Fact 3 — `F` is the instructive exception.** There is no open `F` shape, so no form sits at the nut
as an open chord. The **E form** is nut-most, barred at fret `1` — and that is precisely chapter 1's
movable-nut argument: `F` is one semitone above `E`, so the open E chord moved up one fret spells
`F`. It is also why the F barre chord is every learner's first barre chord. The general rule, which
the lesson may state and use once: **in any key, the form sitting nearest the nut is the one named
after the open chord nearest below the key's root.** Spot-checked: `F#` = E form barred at `2`,
`Bb` = A form barred at `1`, `C#` = C form barred at `1`, `G#` = G form barred at `1`.

**Fact 4 — the gaps between barre frets never change.** In CAGED order the barre frets always step
**3, 2, 3, 2, 2** and total 12. Verified in all six keys above:

| Key | C form | A form | G form | E form | D form |
| --- | --- | --- | --- | --- | --- |
| `C` | 0 | 3 | 5 | 8 | 10 |
| `G` | 7 | 10 | 0 (=12) | 3 (=15) | 5 (=17) |
| `A` | 9 | 0 (=12) | 2 (=14) | 5 (=17) | 7 (=19) |
| `D` | 2 | 5 | 7 | 10 | 0 (=12) |
| `E` | 4 | 7 | 9 | 0 (=12) | 2 (=14) |
| `F` | 5 | 8 | 10 | 1 (=13) | 3 (=15) |

**Fact 5 — the five barre frets are the key's own major pentatonic on the low E string.** Chapter 3
found this in C (`0 3 5 8 10`) and called it the chapter's best sentence. It holds in **every** key,
which chapter 3 could not say. Verified:

| Key | Barre frets, 0–11 | The key's major pentatonic on string 6 |
| --- | --- | --- |
| `C` | 0, 3, 5, 8, 10 | `E G A C D` at 0, 3, 5, 8, 10 |
| `G` | 0, 3, 5, 7, 10 | `E G A B D` at 0, 3, 5, 7, 10 |
| `A` | 0, 2, 5, 7, 9 | `E F# A B C#` at 0, 2, 5, 7, 9 |
| `D` | 0, 2, 5, 7, 10 | `E F# A B D` at 0, 2, 5, 7, 10 |
| `E` | 0, 2, 4, 7, 9 | `E F# G# B C#` at 0, 2, 4, 7, 9 |
| `F` | 1, 3, 5, 8, 10 | `F G A C D` at 1, 3, 5, 8, 10 |

This is the transposition rule stated as something the learner already knows how to play, and it is
the pathway's cleanest reach-back. **Lesson 5 owns it. The closer may not repeat it.**

### The diagram trap for keys other than C

`caged-shape` and `caged-ladder` draw the **actual** window, and outside C the nut-most window is
often **clamped to four frets** rather than five:

| Key | Nut-most window | Width |
| --- | --- | --- |
| `C` | C `0–4` | 5 |
| `G` | G `0–3` | **4** |
| `A` | A `0–3` | **4** |
| `D` | D `0–3` | **4** |
| `E` | E `0–3` | **4** |
| `F` | E `0–4` | 5 |

**No lesson in this chapter may say "every form occupies a five-fret window" while drawing one of
those.** Say "five-fret window" only about windows that are five frets wide, or say "the window runs
frets `0–3` here because the nut cuts it short — the form is the same one, with one fret of it
behind the nut."

### Diagram captions in other keys

`caged-shape` heads itself `<form> form · <root> major` and `caged-ladder` heads itself
`The five forms of <root> major, and every root they hold.` So a diagram in G already says "G major"
without prose having to.

### Roots per form, `G` major and `F` major (for captions and prose)

| `G` major | Roots | | `F` major | Roots |
| --- | --- | --- | --- | --- |
| G form `0–3` | `6·3`, `3·0`, `1·3` | | E form `0–4` | `6·1`, `4·3`, `1·1` |
| E form `2–6` | `6·3`, `4·5`, `1·3` | | D form `2–6` | `4·3`, `2·6` |
| D form `4–8` | `4·5`, `2·8` | | C form `5–9` | `5·8`, `2·6` |
| C form `7–11` | `5·10`, `2·8` | | A form `7–11` | `5·8`, `3·10` |
| A form `9–13` | `5·10`, `3·12` | | G form `9–13` | `6·13`, `3·10`, `1·13` |

### The criticism, as critics actually make it

Researched rather than assumed. The four arguments that serious critics actually make, in the order
they matter to this pathway:

1. **The scale fingerings are mechanically irregular.** A CAGED window mixes two notes on one string
   with three on another, so the picking hand does something different on every string and no two of
   the five windows are fingered alike. Three-notes-per-string is genuinely more even. **Even CAGED's
   defenders concede this one**, and so should this chapter — chapter 4 already showed the learner
   exactly this (16 to 18 dots; only the C form comes out three-per-string), so the concession costs
   nothing and buys all the credibility the chapter needs.
2. **It teaches finger geometry, not notes.** The same degree sits in a different place in each of
   the five shapes, so a player can be fluent in all five patterns and still not know what note is
   under their finger. **This one this pathway can answer without flinching**: every dot in every
   diagram since chapter 1 has carried a degree, roots were taught before anything else, and chapter
   4's whole memory aid is a rule about degrees rather than a picture. The criticism is aimed at
   CAGED taught as five pictures; it does not land on CAGED taught as degrees in a window.
3. **Vertical, boxed-in playing with predictable position changes.** Players learn the boxes and then
   solo inside one, and the moment they change position it is audible. **This is fair, and it is
   fair about chapters 1–4 specifically**, which were deliberately vertical. It is the criticism this
   chapter exists to fix, and the fix is the rest of the chapter.
4. **It is a chord system asked to do a scale system's job.** CAGED was worked out to organise chord
   shapes; the scale patterns are a later graft. Worth one honest sentence and no more — this pathway
   built the scale layer *on top of* the chord layer on purpose, which is the answer.

**Vocabulary the learner will have read online**: "boxed in", "boxes", "position playing",
"overlapping shapes", "connecting the shapes". Use those words. "Seams" is this pathway's own
coinage, not the debate's — chapter 2 used it once and it may be used again, but never as though it
were standard.

**Do not** cite critics by name, quote them, or link out to any of it. The lesson states the argument
in its own words and answers it; a named-and-shamed roundup would age badly and send learners away
from the app. No `url` links anywhere in this chapter.

**Three-notes-per-string**: chapter 4 named it in one clause and did not teach it. This chapter has
the same budget — **one clause, in the opener only**, naming that
[`/scale-visualizer`](screen link) offers a `3/str` position system and that it is the alternative
critics prefer. Nothing else in the chapter mentions it, and nothing teaches it.

### Scope guards

- **Major chords only, everywhere, including the progression.** `C` – `F` – `G`. No minor chord may
  be named, no minor form, no `b3` or `b7`, no relative minor (chapter 3 spent that budget).
- **No seventh chords, extensions, `sus`, or any four-note harmony.**
- **No modes.** The word must not appear.
- **No three-notes-per-string** beyond the single clause above.
- **No Roman numerals as a system.** The lesson may say `C`, `F` and `G` are the three major chords
  the C major scale builds. It may not introduce `I IV V`, teach chord function, or name a key
  centre beyond what that sentence needs.
- **No new shapes.** The five windows are the five windows. Nothing in this chapter adds a shape, and
  the closer should say so as the pathway's closing accounting.
- **Alternate tunings, picking technique, speed** — out, as everywhere.

### Superlatives already spent

**No lesson may re-award or contradict any of these.** Chapter 4's list still stands in full; the
ones most likely to be reached for here:

| Claim | Owner |
| --- | --- |
| "the widest of the five" / hardest to hold whole | G form, as a chord (ch2) |
| "the most-used barre on the instrument" / the shape you navigate from | E form (ch1–2) |
| "the friendliest of the five" | A form (ch1) |
| "the smallest of the five" | D form (ch1–2) |
| the two full barres are A and E | ch2 |
| the widest **pentatonic** window | D form (ch3) — layer-scoped, do not carry forward |
| the only window whose scale fits in four frets | E form (ch4) |
| the only window that comes out even, three per string | C form (ch4) |
| the only fret with no C major note on it (fret 11) | ch4 |
| fret 5 is the only all-six-string **pentatonic** fret | ch3, re-verified ch4 |
| frets 0, 5, 10, 12 are the all-six-string **scale** frets | ch4 |

New superlatives this chapter is allowed, because they were computed here and are true:

- Fret 4 is the only fret belonging to three windows at once (checked 0–13, key of C).
- Every adjacent pair shares exactly one pentatonic dot on every string (checked, all 24).
- One octave along a single string is exactly one full pass of the five windows.
- The five barre frets in any key are that key's major pentatonic on the low E string (checked in
  all six keys this chapter names).

**Every superlative a lesson writes must be recomputed before it ships.** Chapters 3 and 4 both had
lesson agents report "nothing wrong" while six and nine real errors were present, and unchecked
"the only …" claims were the worst survivors both times.

---

## The lessons

Six articles, in order. Section ids are progress keys: never renamed.

Every article: `schemaVersion: 1`, `publishedAt: "2026-08-11"`, `tags: ["caged", "fretboard"]`,
`readingTimeMin` = ceil(words ÷ 200) with a floor of 2. `meta.slug` equals the filename stem. The
title is `meta.title` and **no article opens with a heading block**.

Positions use `string·fret` (`5·3` = string 5, fret 3). **The opener restates what it means in one
clause**, as every chapter's first heavy user has done.

---

### 1. `caged-the-box-argument` — "The Case Against the Boxes"

- **Section id**: `caged-fretboard.ch5.the-box-argument` ·
  **Article id**: `art_caged-the-box-argument`
- **Length**: 650–800 words
- **Left by chapter 4**: all five windows complete at the scale layer; the `4` a fret above every
  `3`, the `7` a fret below every `1`; the windows are lumpy (16–18 dots) because they are finished;
  the roots plus one rule regenerate everything; and one clause saying the next chapter leaves the
  boxes.
- **The one thing it teaches**: the criticism is real, two parts of it are simply true, and the part
  that is fixable is fixed by playing across the windows rather than inside one.
- **The misconception it corrects**: "I've learned five boxes and now I'm stuck in them" — and its
  opposite, "the criticism is nonsense and CAGED is complete."

**Key points, in order**

1. Open on the argument itself, in the learner's own words: you have spent four chapters learning
   five five-fret boxes, and there is a loud opinion online that this is exactly what ruins players.
   Do not soften it and do not build up to it — state it in the first two sentences.
2. **Concede the first true part: the fingerings really are irregular.** A window puts two notes on
   one string and three on the next, and no two of the five are fingered alike. The learner has
   already seen this — chapter 4 counted 16 to 18 dots per window and found only the C form even.
   Say in one clause that players who care most about picking evenness prefer three notes to a
   string, that [`/scale-visualizer`](screen link) offers that as a position system, and that this
   pathway does not teach it. **One clause. Move on.**
3. **Answer the second criticism, which does not land here.** The complaint that CAGED teaches
   finger pictures instead of notes is fair about how it is usually taught and unfair about how this
   pathway taught it: chapter 1 gave roots before anything else, every dot in every diagram has
   carried a degree, and chapter 4's memory aid is a rule about degrees rather than a shape. The
   learner does not have five pictures; they have a labelled map.
4. **Concede the third, and name it as the chapter's job.** The criticism that actually lands is
   about *playing*, not about the map: a player who only ever moves up and down inside one box
   sounds like a player moving up and down inside one box, and the position changes are audible.
   **Say plainly that chapters 1–4 were deliberately vertical.** One window at a time was the right
   way to learn the neck and the wrong way to play it, and this chapter is the correction.
5. **Vertical versus horizontal, defined once, because the whole chapter runs on it.** Vertical
   playing: the hand stays at one fret range and moves across the strings. Horizontal playing: the
   hand travels along the neck, using a string or a pair of strings rather than a window. Neither is
   better; a player who only has one is stuck.
6. **What the chapter does about it**, as a short `list` — four things, each naming the lesson that
   does it: change window mid-phrase through a note both windows own; play along a string instead
   of across the neck; run a progression without going back to the nut; and take the whole ladder to
   any key. Link each by slug.
7. The `live` block: `caged-ladder` `{ "root": "C" }` — the same picture chapter 1 opened on and
   chapter 4 closed on, framed a third way: five bands that **overlap**, and the overlap is the part
   nothing so far has actually used. Point at the stacked bands specifically.
8. One honest sentence on the fourth criticism — CAGED was worked out to organise chord shapes and
   the scale patterns came later — and the pathway's answer, which is that it built the scale layer
   on top of the chord layer on purpose. One sentence, not a paragraph.
9. Close on the next lesson: the notes two windows both own.

**Blocks / components**

- `live` · `caged-ladder` · `{ "root": "C" }`.
- One `list` for point 6, with an article link in each item.
- One `callout` (`info`): chapters 1–4 were vertical on purpose; that is a way of learning the neck,
  not a way of playing it.
- Screen link to `/scale-visualizer` (once, for the `3/str` clause).
- Article links to `caged-shared-notes`, `caged-along-the-strings`,
  `caged-progression-up-the-neck`, `caged-transposing-the-ladder`.

**Do not**: name any critic, quote anyone, or use a `url` link; teach three notes per string; teach
any pivot, string run, chord route or transposition (each has its own lesson); mention minor;
transpose out of C — this lesson stays in C and the transposition lesson leaves it.

---

### 2. `caged-shared-notes` — "The Note That Belongs to Both"

- **Section id**: `caged-fretboard.ch5.shared-notes` · **Article id**: `art_caged-shared-notes`
- **Length**: 550–750 words
- **Left by the opener**: the criticism, the two concessions, the vertical/horizontal distinction,
  and the promise that the overlap is what fixes it.
- **The one thing it teaches**: on every string, the top note of one window is the bottom note of
  the next — so a phrase can change window on whatever string it happens to be on, and the change
  is inaudible.
- **The misconception it corrects**: "changing position means stopping, moving the hand, and
  starting again."

**Key points, in order**

1. Restate the shorthand in one clause if the opener has not. Then the idea in one sentence: the
   windows overlap by design, so there are notes that belong to two of them at once, and a note like
   that is a door rather than a wall.
2. **The strongest form of the fact, and it is new.** Chapter 3 showed that on the low E string each
   window's upper pentatonic dot is the next window's lower one. **The same is true on all six
   strings, in every neighbouring pair.** Give the four-row `table` (pair × six strings) from the
   verified facts. Say it was checked, all twenty-four cases, one shared note each.
3. **What that buys, stated as the lesson's thesis.** You do not have to get back to a particular
   string before you can move. Whatever string a phrase is on, there is a note under the hand that
   both windows own — play it as the last note of the window you are in and the first note of the
   next, and nothing in the sound marks the change.
4. **The easiest doorways to find are the roots**, and the learner already has them. Give the pivot
   root table: `5·3` for C into A, `3·5` for A into G, `6·8` and `1·8` for G into E, `4·10` for E
   into D. These are chapter 1's six `C`s, and the reason `2·1` is not on the list is the reason
   chapter 1 gave: it is the one root belonging to one form alone.
5. **The whole-fret case.** Between the A and G windows every one of the six shared notes sits at
   **fret 5** — chapter 3's "one finger, six strings, the whole scale" fret, which is also the widest
   door on the neck. Lay a finger there and the hand is in two windows at once.
6. **A worked crossing**, concrete and playable. Run up the A form window on the top string —
   `1·3` `5`, `1·5` `6` — and instead of stopping, keep going on the same string: `1·7` `7`,
   `1·8` `1`. The first two dots are the A form's; the last two are the G form's; `1·5` belongs to
   both. Nothing shifted and nothing restarted. Then say the same move works on any of the six
   strings, with the shared fret from the table.
7. **Fret 4, the one place three windows meet** — C, A and G all contain it, and it is the only fret
   in the first thirteen that three windows share. One short paragraph; it is a curiosity that makes
   the tiling concrete, not a technique.
8. The `live` block: `caged-shape` `{ "root": "C", "form": "A", "show": "scale" }` — and say in the
   caption or the prose that the dots at fret 5 and fret 6 on this diagram are the G form's as well
   as this one's.
9. Close on the next lesson: forgetting the windows entirely and using a string as the unit.

**Blocks / components**

- `live` · `caged-shape` · `{ "root": "C", "form": "A", "show": "scale", "caption": "…" }`.
- `table` — the four pairs × six strings shared-fret grid.
- `table` or `list` — the pivot roots.
- One `callout` (`tip`): play the shared note as the last note of one window and the first note of
  the next.
- Article links to `caged-root-ladder` (for the six roots) and `caged-along-the-strings`; screen
  link to `/scale-visualizer`.

**Do not**: teach the single-string climb or the string-pair runs (lesson 3 owns both); give the
overlaps as a degree-by-degree table (chapters 2, 3 and 4 all did a version and chapter 4 explicitly
retired it); teach chords or a progression; transpose.

---

### 3. `caged-along-the-strings` — "Along a String, Not Across the Neck"

- **Section id**: `caged-fretboard.ch5.along-the-strings` ·
  **Article id**: `art_caged-along-the-strings`
- **Length**: 550–750 words
- **Left by the shared-notes lesson**: every overlap has a shared note on every string; the pivot
  roots; the window is still the unit, with a doorway in it.
- **The one thing it teaches**: drop the window as the organising unit and use a string instead —
  one octave along a single string is exactly one full pass of all five windows, and a string pair
  gives the same journey with four notes to a string.
- **The misconception it corrects**: "playing outside the box means playing outside the scale" /
  "the boxes are the only way to organise the neck."

**Key points, in order**

1. Open on the switch: the last lesson kept the window and added a door. This one throws the window
   away. The unit is now the string.
2. **The single-string climb, which is the lesson's centre.** Play C major on the low E string and
   nothing else: frets `0 1 3 5 7 8 10 12`. Give the row (fret · degree · which window it falls in).
   **Those eight notes pass through all five windows in C-A-G-E-D order, once.** An octave on one
   string is twelve frets, and the five windows tile twelve frets, so one octave along one string is
   exactly one turn of the wheel. This is the direct answer to being boxed in: you cannot be in a box
   if you are on a string.
3. Note in a clause that the high e string reads identically, because strings 6 and 1 are two
   octaves apart at the same fret — chapter 1's cheapest fact, still true.
4. Say what it costs, honestly: one string is a long stretch and a lot of position shifting, and
   nobody plays whole solos this way. It is a drill that rewires how the neck looks, and the notes
   it teaches — where the `1` is on each string, where the two half-steps fall — are the ones that
   make the string-pair version readable.
5. **String pairs — the version people actually play.** Four notes on one string, four on the next,
   one octave. Give the `table` of the verified pairs (strings · lower frets · upper frets · shift).
   Teach the `5 → 4` run in full: `5·3` `5·5` `5·7` `5·8`, then `4·5` `4·7` `4·9` `4·10`. Eight
   notes, `1` to `1`, and the hand travels from fret 3 to fret 10.
6. **The pattern repeats, shifted.** The four frets on the second string are the four on the first
   moved **up two** — the same `+2` chapter 1 gave for `6 → 4` and `5 → 3`. Crossing from string 3
   to string 2 it is `+3` instead, because `G → B` is the one major third in standard tuning.
   Chapter 1's octave rule, reappearing as a horizontal move. Give the `3 → 2` run
   (`3·5` `3·7` `3·9` `3·10`, then `2·8` `2·10` `2·12` `2·13`) so the learner feels the extra fret.
7. **Where it starts and stops matters.** The `5 → 4` run begins on `5·3`, a root and the doorway
   from the C window into the A window, and ends on `4·10`, a root and the doorway from the E window
   into the D window. Do not claim the run climbs steadily through the windows — it steps back three
   frets when it crosses strings. The true claim is that it travels from fret 3 to fret 10 and never
   sits in one window.
8. Practical close: [`/drone`](screen link) on `C`, run the low E string and then the `5 → 4` pair
   against it, and notice that a line going up the neck sounds like it is going somewhere in a way a
   line going across the strings does not.
9. Close on the next lesson: the same idea in chords.

**Blocks / components**

- `table` — the low E string: fret, degree, window(s).
- `table` — the string pairs and their shifts.
- One `callout` (`tip`): four notes a string, then the same four moved up two — three if you are
  crossing from string 3 to string 2.
- Screen links to `/drone` and `/scale-visualizer`; article link to
  `caged-progression-up-the-neck` at the close.
- **No `live` block is required here** — both live components draw windows, and this lesson's whole
  point is that the window is not the unit. Say why in the plan report if one is used anyway.

**Do not**: teach three notes per string (this is four notes per string on a pair, which is a
different thing and must not be confused with it — do not use the phrase "three notes per string" at
all); re-argue the box criticism; teach chords; transpose.

---

### 4. `caged-progression-up-the-neck` — "A Progression Without Going Back to the Nut"

- **Section id**: `caged-fretboard.ch5.progression-up-the-neck` ·
  **Article id**: `art_caged-progression-up-the-neck`
- **Length**: 600–800 words
- **Left by the horizontal lesson**: the string as the unit; the single-string climb; the string
  pairs and their `+2`/`+3` shift.
- **The one thing it teaches**: a chord is not one place on the neck, so a progression can be played
  wherever the hand already is — pick the form of each chord that is nearest, and the hand barely
  moves.
- **The misconception it corrects**: "C, F and G live at the nut" / "changing chord means jumping."

**Key points, in order**

1. Open on the problem, concretely: most players know `C`, `F` and `G` in exactly one place each,
   near the nut, and every chord change is a trip back there. Name the three chords and say why
   these three — they are the three major chords the C major scale builds, so the whole progression
   sits inside the scale this pathway has been teaching. One sentence; do not teach chord function.
2. **Fifteen places, not three.** Each chord has all five forms, so `C`, `F` and `G` are fifteen
   places on this neck. Give the barre-fret `table` (chord × five forms) from the verified facts.
   Say out loud what the table means: a chord is not a place, it is five places, and the useful
   question is which one is nearest your hand.
3. **Route one, the showpiece: all three at fret 3.** `C` is the A form (`x 3 5 5 5 3`), `F` is the
   D form (`x x 3 5 6 5`), `G` is the E form (`3 5 5 4 3 3`). Three chords, three different forms,
   and the hand does not move position at all. Two of them are the full barres chapter 2 named; the
   `F` is the four-string D-shape fragment chapter 2 said was the D form's normal state. Give it a
   `list` or `table`, strings and frets spelled out.
4. **Route two, the practical one: around fret 8.** `C` is the E form barred at `8`, `F` is the A
   form barred at `8` — **the same fret** — and `G` is the A form barred at `10`, two frets up.
   Only the two forms that hold as full barres are used. Say why `C` and `F` land on the same fret:
   the E form's root is on string 6 and the A form's is on string 5, and string 5 is a fourth above
   string 6, which is exactly the distance from `C` to `F`.
5. **Route three, for contrast: the nut.** `C` = the C form open, `F` = the E form barred at `1`,
   `G` = the G form open. This is what the learner already plays, and the point is that it was
   always three different forms — nobody told them, and it is why `F` felt like the odd one out.
6. **The principle**, stated once and plainly: you are not choosing a chord, you are choosing which
   of its five forms is closest. Everything else in this pathway was preparation for being able to
   answer that question without stopping.
7. Send them to [`/chord-detector`](screen link): play the fret-3 route and check that what comes
   out is `C`, then `F`, then `G`. And to [`/chord-shapes`](screen link) for other voicings of each.
8. Close on the last real lesson: none of this has left C major yet, and the next one does.

**Blocks / components**

- `table` — the barre frets, chord × form.
- `table` or `list` — the fret-3 route, with the grips spelled out string by string.
- One `callout` (`tip`): `C` and `F` share a barre fret because the E form's root is on string 6 and
  the A form's is a fourth up on string 5.
- Screen links to `/chord-detector` and `/chord-shapes`.
- **`live` is optional here** — `caged-shape` can only draw one chord at a time, and the lesson's
  claim is about three. If one is used, use it for the `F` A form at barre 8
  (`{ "root": "F", "form": "A", "show": "triad" }`) beside the `C` E form
  (`{ "root": "C", "form": "E", "show": "triad" }`) so the same fret range is drawn twice with two
  different roots — which is the lesson's whole point and something no earlier chapter could show.

**Do not**: name a minor chord, or any chord other than `C`, `F` and `G`; introduce Roman numerals,
chord function, or the word "key" as a taught concept; teach seventh chords or `sus`; teach the
"two forms back in the wheel" rule (verified false for one of the five); claim any route is the
"right" one.

---

### 5. `caged-transposing-the-ladder` — "The Same Ladder in Any Key"

- **Section id**: `caged-fretboard.ch5.transposing-the-ladder` ·
  **Article id**: `art_caged-transposing-the-ladder`
- **Length**: 700–850 words. The longest of the six; it carries the pathway's payoff.
- **Left by the progression lesson**: a chord is five places; the fifteen-place table; the routes.
  All of it still in C.
- **The one thing it teaches**: the cycle never changes — changing key only changes where you enter
  it — and in every key with an open chord of that name, the form named after the key sits at the
  nut, which is why the system is called CAGED.
- **The misconception it corrects**: "everything I learned was about C" / "I have to learn the
  ladder again in every key."

**Key points, in order**

1. Open by naming what has been true for four chapters and is about to stop being true: every
   diagram, every dot and every fret number so far has been C major. That was a teaching choice, not
   a limit, and this is where it lifts.
2. **The wheel, first, because it is the fact that makes the rest cheap.** Give the six-key `table`
   (key · ladder nut upward · cycle) from the verified facts. Then the reading: every one of those
   cycles is the same loop `C → A → G → E → D → C` read from a different starting point. **Changing
   key changes where you enter the wheel and nothing else.** The order never moves.
3. **The name, explained at last.** In every key that has an open chord of that name, the form named
   after the key is the one at the nut: `C` in C, `G` in G, `A` in A, `D` in D, `E` in E. That is not
   a coincidence — the five forms *are* the five open major chord shapes, and each sits at the nut in
   exactly the key it was named for. Chapter 1 said the letter names the form; this is the sentence
   that says where the letters came from.
4. **The two `live` blocks, side by side**: `caged-ladder` `{ "root": "C" }` and `caged-ladder`
   `{ "root": "G" }`. Same five bands, same order, entered one step along. The diagrams caption
   themselves with the key, so the prose only has to say what to compare.
5. **`F`, the instructive exception.** There is no open `F` chord shape, so nothing sits at the nut
   as an open chord. The nut-most form is the **E form, barred at fret `1`** — which is exactly
   chapter 1's movable nut: `F` is a semitone above `E`, so the open E chord moved up one fret spells
   `F`. It is also why the F barre chord is the first barre chord almost everyone learns. State the
   general rule once: **the form nearest the nut in any key is the one named after the open chord
   nearest below it** — `F#` is the E form at fret `2`, `Bb` the A form at fret `1`. One sentence for
   the extras; do not tabulate all twelve keys.
6. **The arithmetic, for a learner who wants to place the ladder without a table.** In CAGED order
   the barre frets always step **3, 2, 3, 2, 2**, and those five gaps add to twelve. Find one form
   and the other four follow. Give a small `table` of two or three keys' barre frets so the steps are
   visible.
7. **The reach-back, and the chapter's best sentence.** Chapter 3 found that in C the five barre
   frets — `0 3 5 8 10` — are the C major pentatonic played on the low E string. **That is true in
   every key**: the five barre frets are always the key's own major pentatonic on the low E string.
   Give the small `table` for three or four keys. So transposing the ladder is not a new skill — it
   is chapter 3's five-note scale, moved.
8. **The `live` block for the same form in a new key**: `caged-shape`
   `{ "root": "G", "form": "E", "show": "scale" }`, set against the E form of `C` the learner already
   knows from [`caged-scale-e-form`](article link). Same seventeen dots, same four-fret shape, five
   frets lower — the first time in the pathway the same form appears in a different key.
9. **The diagram caveat**, one clause, because the learner will see it: near the nut a window can be
   cut short by the nut itself. In G the G form is drawn frets `0–3` rather than five wide, because
   one fret of it sits behind the nut. Same form, less room.
10. Close by sending them to [`/scale-visualizer`](screen link) with the root set to anything other
    than `C` and the position toggle on CAGED — the same five windows, the same names, a different
    key — and on to the closer.

**Blocks / components**

- `live` · `caged-ladder` · `{ "root": "C" }` and `live` · `caged-ladder` · `{ "root": "G" }`, at
  point 4, adjacent.
- `live` · `caged-shape` · `{ "root": "G", "form": "E", "show": "scale", "caption": "…" }`, at
  point 8.
- `table` — the six keys, ladder and cycle.
- `table` — barre frets in two or three keys, showing the `3 2 3 2 2` steps.
- `table` — barre frets versus the key's major pentatonic on string 6.
- One `callout` (`tip`): the wheel never turns; only your door into it changes.
- Article link to `caged-scale-e-form` and/or `caged-pentatonic-d-form`; screen link to
  `/scale-visualizer`.

**Do not**: use any key outside `C G A D E F` for a full ladder (`F#` and `Bb` may be named in one
clause as examples of the nut rule and nothing more); say "five-fret window" about a window the
diagram draws four frets wide; teach the circle of fifths, key signatures, or how to choose a key;
name a minor key; teach the "two forms back" rule.

---

### 6. `caged-the-whole-neck` — "One Map, Any Key"

- **Section id**: `caged-fretboard.ch5.the-whole-neck` · **Article id**: `art_caged-the-whole-neck`
- **Length**: 650–800 words
- **Left by the transposition lesson**: the wheel, the nut rule, `F` as the exception, the barre-fret
  arithmetic, and the pentatonic reach-back.
- **The one thing it teaches**: what the learner can now do — and that it was five shapes, learned
  once, all the way through.
- **The misconception it corrects**: "I've finished, so what was it all for?"

**Key points, in order**

1. Open on the accounting, not on a summary. **Five shapes. That is the whole inventory.** Chapter 1
   handed them over as five windows with a root or two lit; chapter 2 put the third and the fifth in;
   chapter 3 added the `2` and the `6`; chapter 4 added the `4` and the `7`; this chapter moved
   between them, played along them, ran chords through them and took the lot to another key. **At no
   point was a sixth shape asked for.** That promise was made in chapter 1's closer and it is now
   fully paid.
2. **What the learner can do**, as a `list` — phrased as actions, not knowledge. Find any root of any
   major chord anywhere on the neck. Say which degree is under any finger. Play the whole major scale
   in any position. Cross from one position to the next without stopping. Play up a string instead of
   across the neck. Put a progression wherever the hand already is. Move all of it to another key.
3. **The honest limits**, stated as plainly as the wins, because a closer that only celebrates is not
   trustworthy. Everything here has been **major**: major chords, the major scale, five major forms.
   Minor chords, seventh chords and the rest of harmony are a different map that fits over the same
   neck. And the criticism from the opener is only half answered by knowledge — the other half is
   hours. Do **not** promise a follow-up pathway; none is committed.
4. **What to practise**, three or four concrete things drawn from this chapter and no more, so the
   list is usable rather than exhaustive. One octave up a single string. The `5 → 4` string pair. A
   progression in two places. The ladder in one key that is not C.
5. **Where to go in the app**, as the closer's real payload — four screens, each with a sentence
   saying what it is *for* rather than what it is:
   - [`/scale-visualizer`](screen link) — the five windows live, in any key, with the CAGED toggle
     and the same form names.
   - [`/drone`](screen link) — a sustained root to play a window against, which is the only way to
     hear whether a note arrives or leans.
   - [`/chord-shapes`](screen link) — every voicing of a chord, which is the question `caged-shape`
     never answered: which of a window's notes a hand can actually hold at once.
   - [`/chord-detector`](screen link) — play a form somewhere unfamiliar and check that what comes
     out is the chord you meant.
6. **The last `live` block**: `caged-ladder` at a root other than `C` — use `{ "root": "F" }`, which
   is the one key in this chapter with no open form and therefore the one that proves the map does
   not need the nut. One paragraph tying it to the ladder chapter 1 opened on: same picture, same
   five bands, different key, and the learner can now read it cold.
7. Close on one sentence about the boxes, returning to the opener without repeating it: the boxes
   were never the point; they were how the neck got small enough to learn. Do not restate the
   criticism.

**Blocks / components**

- `live` · `caged-ladder` · `{ "root": "F" }`.
- `list` — what the learner can now do (point 2).
- `list` — what to practise (point 4).
- One `callout` (`info`) for the five-shapes accounting at point 1.
- Screen links to `/scale-visualizer`, `/drone`, `/chord-shapes`, `/chord-detector`.
- Article link back to `caged-what-the-letter-means` or `caged-root-ladder` where it earns its place.

**Do not**: repeat the transposition tables, the barre-fret arithmetic, or the pentatonic reach-back
(lesson 5 owns all three); re-teach any window's dots; promise a follow-up pathway; end on a
cliffhanger; use `caged-shape`.

---

## The activity

### `caged-climb-one-string` — "Drill: One String, Every Window"

- **Section id**: `caged-fretboard.ch5.climb-one-string` ·
  **Activity id**: `act_caged-climb-one-string`
- `kind: "note-play"`, `modes: ["easy", "hard"]`, document `board: { fretFrom: 0, fretTo: 13 }`.
- Section **must** set `"optional": true`. `estimatedMin: 9`.

Every round is `ordered: true` — this drill is about a journey, not a set. No earlier chapter could
ask for a horizontal climb, and the last round is the first time the pathway asks for a note outside
C major.

**Pitch check.** A run along one string never repeats a pitch, and neither does a rising string-pair
octave, so every round below is pitch-distinct. Verified:

| Round id suffix | Prompt gist | Targets (string·fret) | MIDI |
| --- | --- | --- | --- |
| `low-e` | C major up the low E string alone — all five windows, in order | 6·0, 6·1, 6·3, 6·5, 6·7, 6·8, 6·10, 6·12 | 40 41 43 45 47 48 50 52 |
| `high-e` | The same eight frets on the high e, two octaves up | 1·0, 1·1, 1·3, 1·5, 1·7, 1·8, 1·10, 1·12 | 64 65 67 69 71 72 74 76 |
| `a-to-d` | One octave on a string pair, four notes each, root to root | 5·3, 5·5, 5·7, 5·8, 4·5, 4·7, 4·9, 4·10 | 48 50 52 53 55 57 59 60 |
| `g-to-b` | The same run where the shift is three frets, not two | 3·5, 3·7, 3·9, 3·10, 2·8, 2·10, 2·12, 2·13 | 60 62 64 65 67 69 71 72 |
| `g-major` | The same low-E climb in `G` major — one note moves | 6·0, 6·2, 6·3, 6·5, 6·7, 6·8, 6·10, 6·12 | 40 42 43 45 47 48 50 52 |

All five rounds verified pitch-distinct and inside the `0–13` board.

The last round's only difference from the first is fret 1 becoming fret 2 — `F` becoming `F#` — which
is the smallest possible demonstration that a key change moves the notes and not the method.

---

## The checkpoint

`caged-fretboard-ch5-checkpoint` · section id `caged-fretboard.ch5.checkpoint` ·
`meta.kind: "checkpoint"` · `passThresholdPct: 70` on both the quiz meta and the chapter checkpoint.

Written **after** the articles are read, from what they actually say. This is the pathway's last
checkpoint, so at least two questions reach back across chapters. Sketch — 8 questions:

| # | Question id suffix | Kind | Draws on | Tests |
| - | ------------------ | ---- | -------- | ----- |
| 1 | `what-the-criticism-hits` | `choice` | Opener | The criticism lands on vertical-only *playing*, not on the map being wrong |
| 2 | `pivot-roots` | `fretboard` | Shared notes (+ ch1) | Mark the two roots the G and E windows share (`6·8`, `1·8`), `frets: 11` |
| 3 | `shared-on-every-string` | `choice` | Shared notes | Why you can change window on whatever string you are on |
| 4 | `one-string-one-cycle` | `choice` | Along the strings | An octave on one string passes through all five windows |
| 5 | `pair-shift` | `choice` | Along the strings (+ ch1) | The shift is `+3` from string 3 to string 2 because `G → B` is a major third |
| 6 | `same-fret-two-chords` | `choice` | Progression | At fret 8, `C` is the E form and `F` is the A form |
| 7 | `the-wheel` | `choice` | Transposing | The cycle order never changes; the key decides where you enter it |
| 8 | `nut-form` | `choice` | Transposing (+ ch1) | In `F` the E form sits at the nut, barred at fret 1 — the letter names the form |

Every question gets an `explanation`. `fretboard` and `multi-select` are graded all-or-nothing, so
Q2 asks only for a fact the shared-notes lesson states explicitly and completely. Distractors must
each encode a specific wrong belief — for Q1, "the shapes are fingered wrong"; for Q7, "the order
reverses in flat keys"; for Q8, "the F form".

---

## As built — final word counts

Prose words only (paragraph, callout and list spans; table cells and captions excluded).

| Lesson | Words | `readingTimeMin` | `estimatedMin` in the curriculum |
| ------ | ----- | ---------------- | -------------------------------- |
| `caged-the-box-argument` | 791 | 4 | 5 |
| `caged-shared-notes` | 680 | 4 | 5 |
| `caged-along-the-strings` | 696 | 4 | 5 |
| `caged-progression-up-the-neck` | 760 | 4 | 5 |
| `caged-transposing-the-ladder` | 771 | 4 | 5 |
| `caged-the-whole-neck` | 737 | 4 | 5 |
| `caged-climb-one-string` (activity) | — | — | 9 (optional) |

Chapter total, counted sections only: **30 minutes**; 39 including the optional drill. The pathway's
`estimatedMin` was left at its placeholder of 210, as chapters 1–4 did — the top-level agent
recomputes it at the end.

The planned cut survived intact: six lessons, none of them a form lesson, in the order the plan set
out. No title changed.

## The checkpoint as built — 8 questions

Written after all six articles were read, from what they actually say. The sketch survived intact.

| # | Question id suffix | Kind | Draws on | Tests |
| - | ------------------ | ---- | -------- | ----- |
| 1 | `what-the-criticism-hits` | `choice` | Opener | The criticism that lands is about vertical *playing*, not about the map being wrong |
| 2 | `pivot-roots` | `fretboard` | Shared notes (+ ch1) | Mark `6·8` and `1·8`, the two roots G and E share, `frets: 11` |
| 3 | `shared-on-every-string` | `choice` | Shared notes | You can change window on whatever string you are on, because every pair shares a note on every string |
| 4 | `one-string-one-cycle` | `choice` | Along the strings | An octave on one string is one full pass of the five windows |
| 5 | `pair-shift` | `choice` | Along the strings (+ ch1) | The `+3` shift crossing string 3 to string 2 is the `G → B` major third |
| 6 | `same-fret-two-chords` | `choice` | Progression | At fret 8, `C` is the E form and `F` is the A form — same fret, no travel |
| 7 | `the-wheel` | `choice` | Transposing | G-E-D-C-A is the same wheel entered at a different point |
| 8 | `nut-form` | `choice` | Transposing (+ ch1) | In `F`, the E form is nut-most at fret 1 — the letter names the form |

Every question has an `explanation` and all eight parse as gradable. `fretboard` is graded
all-or-nothing, so Q2 asks only for a fact `caged-shared-notes` states explicitly and completely.
**No `multi-select` was used**, for the same reason chapters 3 and 4 gave: the facts that would suit
one here (which frets a pair shares, which forms sit where in a key) are read off a table rather
than understood, and all-or-nothing grading makes that unfair.

Three questions reach back across chapters, which is right for the pathway's last checkpoint: Q2 on
chapter 1's six roots, Q5 on chapter 1's `G → B` irregularity, Q8 on chapter 1's founding claim that
the letter names the form. Q1's option A ("the shapes are drawn in the wrong places"), Q7's option C
("sharp keys reverse the cycle") and Q8's option B ("the C form always sits at the nut") are the
three distractors that encode a specific wrong belief a learner would actually hold.

## Errors found and fixed during review

Every article was read as written and machine-checked against the computed tables. Both lesson
agents reported finding nothing wrong; the following were present.

1. **`caged-shared-notes` — a real factual error in the chapter's central table.** The `E → D` row
   of the shared-fret grid had the string 3 and string 4 values transposed: it read `9` under
   string 4 and `10` under string 3, where the verified data is `10` under string 4 and `9` under
   string 3. This was the one table the whole lesson rests on. Corrected.
2. **`caged-shared-notes` — the A ∩ G overlap named as "frets 5 and 6".** The A window is `2–6` and
   the G window is `4–8`, so the overlap is frets **4, 5 and 6**. Both the prose and the diagram
   caption were corrected, and the prose now says where the G window begins rather than leaving it
   implicit.
3. **`caged-the-box-argument` — "five bands, stacked in pairs".** False. `cagedLadderLanes` needs
   three lanes in C, because fret 4 sits inside the C, A and G windows at once — a fact the very
   next lesson makes a point of. Reworded to "stacked wherever they physically overlap".
4. **`caged-progression-up-the-neck` — "two barres a fret apart in root".** Meaningless as written:
   the two roots are a *string* apart, not a fret. Rewritten.
5. **`caged-transposing-the-ladder` — "the other four are three additions away".** Placing four more
   forms from one takes four additions, not three. Rewritten.
6. **`caged-transposing-the-ladder` — "in the one key that has nowhere else to put a form".** `F` has
   five forms like every other key; what it lacks is an open one. Rewritten.
7. **`caged-the-whole-neck` — "no nut required anywhere in the chain"** about the `F` ladder. The E
   form's window in `F` is `0–4` and does reach the nut; what is true is that none of the five is an
   open chord. Rewritten.
8. **`caged-the-whole-neck` — "the geometry you've learned doesn't teach itself to you twice, but it
   doesn't hand you those chords either".** Garbled, and it undersold the honest limit. Rewritten to
   state plainly that the habit transfers and the maps are not in this pathway.
9. **`caged-along-the-strings` — "never once sits inside a single window the whole way".** Every note
   of that run is inside a window — two of them, in fact. The intended claim is that it never
   settles in one. Reworded.
10. **`caged-the-whole-neck` — "the only way to actually hear whether a note arrives home".** An
    unverifiable exclusivity claim about a screen. Softened to "the quickest way".

Smaller corrections: six screen links across three articles used the raw route (`/chord-detector`,
`/drone`, …) as their visible link text, where the pathway's convention since chapter 2 is the
screen's name; `caged-transposing-the-ladder` had an un-`code`-marked key name in a list of five
that were otherwise all marked; and `caged-progression-up-the-neck` closed on "That changes next",
a positional cross-reference the pathway forbids — it now names and links
`caged-transposing-the-ladder`.

**One block added during review.** `caged-progression-up-the-neck` shipped with no `live` block; the
lesson agent's reasoning was that `caged-shape` draws one chord and the claim is about three. That
is true of the fret-3 route but not of the fret-8 one, where the whole point is that `C`'s E form
and `F`'s A form occupy the *identical* window, frets `7–11`. Two `caged-shape` blocks were added
there — `{ root: "C", form: "E" }` and `{ root: "F", form: "A" }`, both at `show: "triad"` — which
is the first and only place in the pathway where two diagrams of two different keys sit side by
side over the same frets. Verified: both windows are `7–11`.

**Verification method.** A script re-derived every window, overlap, string run, barre fret and
transposed ladder from `cagedFormWindows` / `cagedMarks`' own logic, then checked each article: all
30 `string·fret` tokens across the six articles are real C-major notes; every barre-fret, window,
cycle and pentatonic-versus-barre-fret table cell was compared against the computed values; the
whole corpus was scanned for forbidden vocabulary (`mode`, `b3`, `b7`, "minor pentatonic", "three
notes per string", `sus`, and American spellings); and every sentence containing *only*, *never*,
*always*, *every*, *no other* or *the most* was listed and reviewed by hand. That last pass is what
caught items 3, 9 and 10, none of which a token check can see.

## Judgement calls recorded here

- **No form lessons, and the plan's six-way cut was kept.** The brief's suggested split turned out
  to be the right one; the only boundary that needed policing was between `caged-shared-notes` and
  `caged-along-the-strings`, which was settled by making the *unit* explicit — lesson 2 keeps the
  window and adds a doorway, lesson 3 throws the window away and uses the string.
- **The criticism was researched rather than assumed**, and the chapter concedes two of its four
  parts outright. The strongest criticism — that CAGED's scale fingerings are mechanically irregular
  — is one even CAGED's defenders concede, and chapter 4 had already shown the learner the evidence
  (16 to 18 dots, only the C form even). Conceding it cost nothing and bought the chapter the
  standing to answer the rest. No critic is named, quoted or linked: the argument is stated in the
  pathway's own words, which will age better than a roundup of URLs.
- **The vocabulary of the debate was checked.** "Boxed in", "boxes", "position playing" and
  "overlapping" are genuinely what a learner will have read online, and the chapter uses them.
  "Seams" is this pathway's own coinage rather than standard vocabulary — it appears twice, never
  presented as a term of art.
- **A "two forms back in the wheel equals a fourth up" rule was computed and deliberately rejected.**
  It holds for four of the five forms and fails for the fifth (C form → E form spans four frets, not
  five, because the barre-fret gaps are `3 2 3 2 2` rather than uniform). A rule with a one-in-five
  exception is worse than the concrete table the progression lesson gives instead. Recorded here so
  a later agent does not rediscover it and ship it.
- **The single-string climb generalises chapter 3's best fact and says so.** Chapter 3 found the
  hand-over between windows on the low E string; this chapter verified it on all six strings, in
  every neighbouring pair, twenty-four cases with exactly one shared dot each. That generalisation
  is new here and it is the strongest thing in the chapter.
- **Chapter 3's barre-frets-are-the-pentatonic fact was generalised too.** It holds in every key, not
  only in C — verified in all six keys the chapter names. It is the transposition lesson's closing
  argument, and the closer is forbidden from repeating it.
- **The diagram-clamping trap was caught before it shipped.** Outside C, the nut-most window is
  usually drawn four frets wide rather than five, because one fret of it sits behind the nut. The
  transposing lesson states this explicitly rather than letting a learner think the shape shrank.
- **One activity, not two.** A `rhythm` drill has nothing to do with this chapter's material, and the
  `note-play` drill's five rounds already carry the argument: one string then the other outside
  string, two string pairs including the one where the shift is three frets, and finally the same
  climb in `G` — the first time the pathway asks for a note outside C major.
- **Every round in the activity is `ordered: true`**, which no earlier chapter's drill needed. This
  chapter is about journeys rather than sets, and an unordered climb would not be a climb.
- **No footnotes**, as in chapters 2, 3 and 4.
