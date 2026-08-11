import { describe, expect, it } from 'vitest';

import { ROOTS } from '@/lib/chord-library';
import { noteToPitchClass } from '@/lib/scale-library';
import { FRET_COUNT, pitchClassAt } from '@/lib/theory';

import {
  CAGED_FORMS,
  cagedFormWindow,
  cagedFormWindows,
  cagedLadderLanes,
  cagedMarks,
} from './caged';
import type { CagedLayer } from './caged';

const LAYERS: CagedLayer[] = ['roots', 'triad', 'pentatonic', 'scale'];

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
    expect(roots).toContainEqual({ string: 4, fret: 3, degree: '1', isRoot: true });
    expect(roots).toContainEqual({ string: 1, fret: 1, degree: '1', isRoot: true });
    expect(roots.every((mark) => mark.degree === '1')).toBe(true);
  });

  it('nests the four layers, each adding notes to the one before', () => {
    for (const root of ROOTS) {
      for (const form of CAGED_FORMS) {
        const window = cagedFormWindow(pc(root), form)!;
        const at = (layer: CagedLayer) =>
          new Set(cagedMarks(pc(root), window, layer).map((m) => `${m.string}-${m.fret}`));

        const [roots, triad, pentatonic, scale] = LAYERS.map(at);
        const where = `${root} ${form}`;

        for (const key of roots) expect(triad.has(key), where).toBe(true);
        for (const key of triad) expect(pentatonic.has(key), where).toBe(true);
        for (const key of pentatonic) expect(scale.has(key), where).toBe(true);
      }
    }
  });

  it('only ever marks a note of the layer, inside the window', () => {
    const degreeSemitones: Record<string, number> = {
      '1': 0,
      '2': 2,
      '3': 4,
      '4': 5,
      '5': 7,
      '6': 9,
      '7': 11,
    };

    for (const root of ROOTS) {
      for (const form of CAGED_FORMS) {
        const window = cagedFormWindow(pc(root), form)!;

        for (const layer of LAYERS) {
          for (const mark of cagedMarks(pc(root), window, layer)) {
            const where = `${root} ${form} ${layer} ${mark.string}-${mark.fret}`;

            expect(mark.fret, where).toBeGreaterThanOrEqual(window.from);
            expect(mark.fret, where).toBeLessThanOrEqual(window.to);
            expect(mark.isRoot, where).toBe(mark.degree === '1');

            const semitones = (((pitchClassAt(mark.string, mark.fret) - pc(root)) % 12) + 12) % 12;
            expect(semitones, where).toBe(degreeSemitones[mark.degree]);
          }
        }
      }
    }
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
