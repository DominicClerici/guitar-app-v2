import { describe, expect, it } from 'vitest';

import { ROOTS } from '@/lib/chord-library';
import { noteToPitchClass, scaleTypeById } from '@/lib/scale-library';
import { FRET_COUNT, pitchClassAt } from '@/lib/theory';

import {
  CAGED_FORMS,
  CAGED_QUALITIES,
  cagedFillMarks,
  cagedFormWindow,
  cagedFormWindows,
  cagedLadderLanes,
  cagedMarks,
} from './caged';
import type { CagedLayer, CagedQuality } from './caged';

const LAYERS: CagedLayer[] = ['roots', 'triad', 'pentatonic', 'scale'];
const QUALITIES: readonly CagedQuality[] = CAGED_QUALITIES;

const pc = (note: string) => noteToPitchClass(note);

describe('cagedFormWindows', () => {
  it('lays C out as the ladder the pathway teaches', () => {
    expect(cagedFormWindows(pc('C')).map((w) => `${w.form} ${w.from}-${w.to}`)).toEqual([
      'C 0-4',
      'A 2-6',
      'G 4-8',
      'E 7-11',
      'D 9-13',
    ]);
  });

  it('agrees with the scale visualizer, which draws the same windows', () => {
    // `positionsFor(C major, 'caged')` yields C 0-4, A 2-6, G 4-8, E 7-11, D 9-13
    // before it stretches its end boxes onto the ends of the neck. Same table.
    const windows = cagedFormWindows(pc('C'));
    expect(windows.find((w) => w.form === 'E')).toEqual({ form: 'E', from: 7, to: 11 });
    expect(windows.find((w) => w.form === 'G')).toEqual({ form: 'G', from: 4, to: 8 });
  });

  it("takes A major's A form at the nut rather than the barre an octave up", () => {
    // The window reaches a fret below the barre, and at the nut there is no such
    // fret — clamping instead of disqualifying is what keeps this the open chord.
    expect(cagedFormWindow(pc('A'), 'A')).toEqual({ form: 'A', from: 0, to: 3 });
    expect(cagedFormWindows(pc('A')).map((w) => w.form)).toEqual(['A', 'G', 'E', 'D', 'C']);
  });

  it('places all five forms on the neck for every root', () => {
    for (const root of ROOTS) {
      const windows = cagedFormWindows(pc(root));
      expect(windows.map((w) => w.form).sort(), root).toEqual([...CAGED_FORMS].sort());

      for (const window of windows) {
        expect(window.from, `${root} ${window.form}`).toBeGreaterThanOrEqual(0);
        expect(window.to, `${root} ${window.form}`).toBeLessThanOrEqual(FRET_COUNT);
        expect(window.to, `${root} ${window.form}`).toBeGreaterThan(window.from);
      }
    }
  });

  it('returns them in neck order', () => {
    for (const root of ROOTS) {
      const windows = cagedFormWindows(pc(root));
      for (let i = 1; i < windows.length; i += 1) {
        expect(windows[i].from, root).toBeGreaterThanOrEqual(windows[i - 1].from);
      }
    }
  });
});

describe('cagedLadderLanes', () => {
  it('never puts two overlapping windows in one lane', () => {
    for (const root of ROOTS) {
      for (const lane of cagedLadderLanes(pc(root))) {
        for (let i = 1; i < lane.length; i += 1) {
          expect(lane[i].from, `${root} ${lane[i - 1].form}/${lane[i].form}`).toBeGreaterThan(
            lane[i - 1].to,
          );
        }
      }
    }
  });

  it('draws every form exactly once', () => {
    for (const root of ROOTS) {
      const drawn = cagedLadderLanes(pc(root))
        .flat()
        .map((window) => window.form);
      expect(drawn.sort(), root).toEqual([...CAGED_FORMS].sort());
    }
  });

  it('needs three lanes for C, where three windows share fret 4', () => {
    // The C form (0-4), A form (2-6) and G form (4-8) all cover fret 4, so two
    // alternating lanes would drop a band — and C is the key the CAGED pathway
    // teaches in, so this is the case that matters most.
    const lanes = cagedLadderLanes(pc('C'));
    expect(lanes.map((lane) => lane.map((w) => w.form))).toEqual([
      ['C', 'E'],
      ['A', 'D'],
      ['G'],
    ]);
  });
});

describe('cagedMarks', () => {
  it('finds the roots of the C form of C where the open chord holds them', () => {
    const window = cagedFormWindow(pc('C'), 'C')!;
    const roots = cagedMarks(pc('C'), window, 'roots');

    // Open C is x 3 2 0 1 0: its roots are string 5 fret 3 and string 2 fret 1,
    // written here in @/lib/theory's indices — string 4 and string 1.
    expect(roots).toContainEqual({
      string: 4,
      fret: 3,
      degree: '1',
      isRoot: true,
      isAccent: false,
    });
    expect(roots).toContainEqual({
      string: 1,
      fret: 1,
      degree: '1',
      isRoot: true,
      isAccent: false,
    });
    expect(roots.every((mark) => mark.degree === '1')).toBe(true);
  });

  it('nests the four layers, each adding notes to the one before', () => {
    for (const quality of QUALITIES) {
      for (const root of ROOTS) {
        for (const form of CAGED_FORMS) {
          const window = cagedFormWindow(pc(root), form)!;
          const at = (layer: CagedLayer) =>
            new Set(cagedMarks(pc(root), window, layer, quality).map((m) => `${m.string}-${m.fret}`));

          const [roots, triad, pentatonic, scale] = LAYERS.map(at);
          const where = `${root} ${form} ${quality}`;

          for (const key of roots) expect(triad.has(key), where).toBe(true);
          for (const key of triad) expect(pentatonic.has(key), where).toBe(true);
          for (const key of pentatonic) expect(scale.has(key), where).toBe(true);
        }
      }
    }
  });

  it('only ever marks a note of the layer, inside the window', () => {
    const degreeSemitones: Record<CagedQuality, Record<string, number>> = {
      major: { '1': 0, '2': 2, '3': 4, '4': 5, '5': 7, '6': 9, '7': 11 },
      minor: { '1': 0, '2': 2, b3: 3, '4': 5, '5': 7, b6: 8, b7: 10 },
    };

    for (const quality of QUALITIES) {
      for (const root of ROOTS) {
        for (const form of CAGED_FORMS) {
          const window = cagedFormWindow(pc(root), form)!;

          for (const layer of LAYERS) {
            for (const mark of cagedMarks(pc(root), window, layer, quality)) {
              const where = `${root} ${form} ${quality} ${layer} ${mark.string}-${mark.fret}`;

              expect(mark.fret, where).toBeGreaterThanOrEqual(window.from);
              expect(mark.fret, where).toBeLessThanOrEqual(window.to);
              expect(mark.isRoot, where).toBe(mark.degree === '1');

              const semitones = (((pitchClassAt(mark.string, mark.fret) - pc(root)) % 12) + 12) % 12;
              expect(semitones, where).toBe(degreeSemitones[quality][mark.degree]);
            }
          }
        }
      }
    }
  });

  it('defaults to major, so content written before minor existed is untouched', () => {
    const window = cagedFormWindow(pc('C'), 'E')!;
    expect(cagedMarks(pc('C'), window, 'scale')).toEqual(
      cagedMarks(pc('C'), window, 'scale', 'major'),
    );
  });

  it('turns a major form minor by moving the third down one fret, and nothing else', () => {
    // The claim the minor CAGED pathway is built on. It holds of the *notes*: the
    // roots and fifths never move, and the only difference between the two
    // diagrams is a third stepping down a fret.
    //
    // It does not hold of the *dot count*, and a lesson must not say it does. The
    // window is a fixed fret span, so a `3` on its bottom fret flattens to a `b3`
    // outside the picture, and a `b3` can step in from above the top fret. Every
    // one of the 85 windows differs at an edge that way — see the `sits outside`
    // branches below, which are hit constantly.
    for (const root of ROOTS) {
      for (const form of CAGED_FORMS) {
        const window = cagedFormWindow(pc(root), form)!;
        const marks = (quality: CagedQuality) =>
          cagedMarks(pc(root), window, 'triad', quality);

        const major = marks('major');
        const minor = marks('minor');
        const majorKeys = new Set(major.map((m) => `${m.string}-${m.fret}`));
        const minorKeys = new Set(minor.map((m) => `${m.string}-${m.fret}`));
        const where = `${root} ${form} (${window.from}-${window.to})`;

        // Nothing a diagram gains or loses is ever a root or a fifth.
        for (const mark of minor) {
          if (majorKeys.has(`${mark.string}-${mark.fret}`)) continue;
          expect(mark.degree, `${where} gained ${mark.string}-${mark.fret}`).toBe('b3');
          const partner = mark.fret + 1;
          const inside = partner <= window.to;
          expect(!inside || majorKeys.has(`${mark.string}-${partner}`), where).toBe(true);
        }
        for (const mark of major) {
          if (minorKeys.has(`${mark.string}-${mark.fret}`)) continue;
          expect(mark.degree, `${where} lost ${mark.string}-${mark.fret}`).toBe('3');
          const partner = mark.fret - 1;
          const inside = partner >= window.from;
          expect(!inside || minorKeys.has(`${mark.string}-${partner}`), where).toBe(true);
        }
      }
    }
  });

  it('holds the notes of the open Am chord in the A form of A minor', () => {
    // Open Am is x 0 2 2 1 0. In @/lib/theory's indices (0 = high e) that is
    // string 4 fret 0, string 3 fret 2, string 2 fret 2, string 1 fret 1, string 0
    // fret 0 — and the A form of A is the window at the nut.
    const window = cagedFormWindow(pc('A'), 'A')!;
    expect(window).toEqual({ form: 'A', from: 0, to: 3 });

    const marks = cagedMarks(pc('A'), window, 'triad', 'minor');
    const at = (string: number, fret: number) =>
      marks.find((m) => m.string === string && m.fret === fret)?.degree;

    expect(at(4, 0)).toBe('1');
    expect(at(3, 2)).toBe('5');
    expect(at(2, 2)).toBe('1');
    expect(at(1, 1)).toBe('b3');
    expect(at(0, 0)).toBe('5');
  });

  it('gives every form at least one root to hang the shape on', () => {
    for (const root of ROOTS) {
      for (const form of CAGED_FORMS) {
        const window = cagedFormWindow(pc(root), form)!;
        expect(cagedMarks(pc(root), window, 'roots').length, `${root} ${form}`).toBeGreaterThan(0);
      }
    }
  });
});

describe('cagedFillMarks', () => {
  const fillFor = (id: string) => {
    const type = scaleTypeById(id)!;
    return {
      semitones: type.semitones,
      degrees: type.degrees,
      accentDegree: type.accent?.degree,
    };
  };

  const MODES = ['lydian', 'major', 'mixolydian', 'dorian', 'minor', 'phrygian', 'locrian'];

  it('draws the natural minor scale exactly as the minor scale layer does', () => {
    // The modes pathway hands the learner a window it already owns and moves one
    // dot. That only holds if the general fill and the built-in layer agree on
    // the window they started from.
    for (const root of ROOTS) {
      for (const form of CAGED_FORMS) {
        const window = cagedFormWindow(pc(root), form)!;
        const layer = cagedMarks(pc(root), window, 'scale', 'minor');
        const fill = cagedFillMarks(pc(root), window, fillFor('minor'));

        expect(fill, `${root} ${form}`).toEqual(layer);
      }
    }
  });

  it('tints the tone each mode is named for, and never the root', () => {
    for (const id of MODES) {
      const type = scaleTypeById(id)!;
      const window = cagedFormWindow(pc('A'), 'E')!;
      const marks = cagedFillMarks(pc('A'), window, fillFor(id));

      const accented = marks.filter((mark) => mark.isAccent);
      const where = `A ${type.name}`;

      if (type.accent === null) {
        // Major and natural minor are the references nothing deviates from.
        expect(accented, where).toHaveLength(0);
        continue;
      }

      expect(accented.length, where).toBeGreaterThan(0);
      expect(
        accented.every((mark) => mark.degree === type.accent!.degree),
        where,
      ).toBe(true);
      expect(
        accented.every((mark) => !mark.isRoot),
        where,
      ).toBe(true);
    }
  });

  it('separates each mode from its neighbour by exactly one degree', () => {
    // Ordered bright to dark, each mode flattens one more note than the one
    // before it — 4, then 7, then 3, then 6, then 2, then 5. This is the ladder
    // the pathway is built on, so it is pinned rather than remembered.
    const flattened = ['4', '7', '3', '6', '2', '5'];

    for (let index = 0; index + 1 < MODES.length; index += 1) {
      const brighter = scaleTypeById(MODES[index])!;
      const darker = scaleTypeById(MODES[index + 1])!;
      const where = `${brighter.name} → ${darker.name}`;

      const gone = brighter.semitones.filter((s) => !darker.semitones.includes(s));
      const gained = darker.semitones.filter((s) => !brighter.semitones.includes(s));

      expect(gone, where).toHaveLength(1);
      expect(gained, where).toHaveLength(1);
      expect(gained[0], where).toBe(gone[0] - 1);

      // And the degree that moved is the one the ladder says moved.
      const label = darker.degrees[darker.semitones.indexOf(gained[0])];
      expect(label.replace(/[b#]/, ''), where).toBe(flattened[index]);
    }
  });

  it('moves only the changed degree inside a window, edges aside', () => {
    // A mode is its parent window with one dot moved — but a window is a fixed
    // fret span, so a dot on an edge steps out of the picture rather than across
    // it. Every position the two fills disagree on must carry the moved degree.
    for (const root of ROOTS) {
      for (const form of CAGED_FORMS) {
        const window = cagedFormWindow(pc(root), form)!;
        const minor = cagedFillMarks(pc(root), window, fillFor('minor'));
        const dorian = cagedFillMarks(pc(root), window, fillFor('dorian'));

        const key = (mark: { string: number; fret: number }) => `${mark.string}-${mark.fret}`;
        const inMinor = new Map(minor.map((m) => [key(m), m.degree]));
        const inDorian = new Map(dorian.map((m) => [key(m), m.degree]));
        const where = `${root} ${form}`;

        for (const [at, degree] of inMinor) {
          if (inDorian.get(at) === degree) continue;
          // Only the b6 can be missing or relabelled; every other dot is shared.
          expect(degree, `${where} at ${at}`).toBe('b6');
        }
        for (const [at, degree] of inDorian) {
          if (inMinor.get(at) === degree) continue;
          expect(degree, `${where} at ${at}`).toBe('6');
        }
      }
    }
  });
});
