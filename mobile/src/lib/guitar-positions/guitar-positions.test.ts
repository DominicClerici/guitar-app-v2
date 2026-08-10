import { describe, expect, it } from 'vitest';

import { ROOTS } from '@/lib/chord-library';
import { buildScale, SCALE_TYPES } from '@/lib/scale-library';
import { FRET_COUNT, pitchClassAt } from '@/lib/theory';

import { positionsFor, scaleKeys, systemsFor } from './index';

function parse(key: string): { string: number; fret: number } {
  const [string, fret] = key.split('-').map(Number);
  return { string, fret };
}

describe('systemsFor', () => {
  it('offers CAGED and three-per-string to seven-note scales only', () => {
    expect(systemsFor(buildScale('C', 'major'))).toEqual(['caged', 'nps']);
    expect(systemsFor(buildScale('C', 'altered'))).toEqual(['caged', 'nps']);
    expect(systemsFor(buildScale('C', 'minor-pentatonic'))).toEqual(['boxes']);
    expect(systemsFor(buildScale('C', 'blues'))).toEqual(['boxes']);
  });
});

describe('positionsFor', () => {
  it('lays C major CAGED out as the ladder a player moves up', () => {
    const positions = positionsFor(buildScale('C', 'major'), 'caged');
    expect(positions.map((p) => `${p.label} ${p.from}-${p.to}`)).toEqual([
      'C form 0-4',
      'A form 2-6',
      'G form 4-8',
      'E form 7-11',
      'D form 9-13',
      'C form 12-15',
    ]);
  });

  it('starts A minor pentatonic box 1 at the fifth fret', () => {
    const positions = positionsFor(buildScale('A', 'minor-pentatonic'), 'boxes');
    const box = positions.find((p) => p.label === 'Box 1' && p.from === 5);
    expect(box).toBeDefined();
    expect(box?.to).toBe(8);
  });

  it('puts three notes on every string in an nps shape', () => {
    const positions = positionsFor(buildScale('C', 'major'), 'nps');
    expect(positions.length).toBeGreaterThan(0);

    for (const position of positions) {
      const perString = new Map<number, number>();
      for (const key of position.keys) {
        const { string } = parse(key);
        perString.set(string, (perString.get(string) ?? 0) + 1);
      }
      expect([...perString.keys()].sort(), position.label).toEqual([0, 1, 2, 3, 4, 5]);
      for (const [string, count] of perString) {
        expect(count, `${position.label} string ${string}`).toBe(3);
      }
    }
  });

  it('only ever puts notes of the scale inside a box, on the neck', () => {
    for (const root of ROOTS) {
      for (const type of SCALE_TYPES) {
        const scale = buildScale(root, type.id);
        const wanted = new Set(scale.pitchClasses);

        for (const system of systemsFor(scale)) {
          for (const position of positionsFor(scale, system)) {
            for (const key of position.keys) {
              const { string, fret } = parse(key);
              const where = `${root} ${type.id} ${system} ${position.label} ${key}`;

              expect(fret, where).toBeGreaterThanOrEqual(0);
              expect(fret, where).toBeLessThanOrEqual(FRET_COUNT);
              expect(wanted.has(pitchClassAt(string, fret)), where).toBe(true);
              expect(fret >= position.from && fret <= position.to, where).toBe(true);
            }
          }
        }
      }
    }
  });

  it('gives every scale at least four boxes in every system it offers', () => {
    for (const root of ROOTS) {
      for (const type of SCALE_TYPES) {
        const scale = buildScale(root, type.id);
        for (const system of systemsFor(scale)) {
          expect(positionsFor(scale, system).length, `${root} ${type.id} ${system}`).toBeGreaterThan(
            3,
          );
        }
      }
    }
  });

  it('covers every note on the neck between the boxes, for CAGED and boxes', () => {
    for (const root of ROOTS) {
      for (const type of SCALE_TYPES) {
        const scale = buildScale(root, type.id);
        const system = systemsFor(scale)[0];
        const covered = new Set<string>();
        for (const position of positionsFor(scale, system)) {
          for (const key of position.keys) covered.add(key);
        }

        for (const key of scaleKeys(scale.pitchClasses)) {
          expect(covered.has(key), `${root} ${type.id} ${system} misses ${key}`).toBe(true);
        }
      }
    }
  });

  it('gives every position a unique id', () => {
    for (const root of ROOTS) {
      for (const type of SCALE_TYPES) {
        const scale = buildScale(root, type.id);
        for (const system of systemsFor(scale)) {
          const positions = positionsFor(scale, system);
          expect(new Set(positions.map((p) => p.id)).size, `${root} ${type.id} ${system}`).toBe(
            positions.length,
          );
        }
      }
    }
  });
});
