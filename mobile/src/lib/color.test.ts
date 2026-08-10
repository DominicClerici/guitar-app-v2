import { describe, expect, it } from 'vitest';

import { mixColors, parseColor, splitAlpha } from './color';

describe('splitAlpha', () => {
  it('lifts the alpha out of a legacy rgba()', () => {
    expect(splitAlpha('rgba(255, 255, 255, 0.08)')).toEqual({
      color: 'rgb(255, 255, 255)',
      opacity: 0.08,
    });
  });

  it('lifts the alpha out of the modern slash syntax', () => {
    expect(splitAlpha('rgb(0 0 0 / 0.52)')).toEqual({ color: 'rgb(0 0 0)', opacity: 0.52 });
  });

  it('reads a percentage alpha', () => {
    expect(splitAlpha('rgba(94, 200, 194, 50%)')).toEqual({
      color: 'rgb(94, 200, 194)',
      opacity: 0.5,
    });
  });

  it('lifts the alpha byte out of an eight-digit hex', () => {
    expect(splitAlpha('#0000007f')).toEqual({ color: '#000000', opacity: 127 / 255 });
  });

  it('lifts the alpha nibble out of a four-digit hex', () => {
    expect(splitAlpha('#fff8')).toEqual({ color: '#fff', opacity: 0x88 / 255 });
  });

  it('keeps hsl components and their units intact', () => {
    expect(splitAlpha('hsla(210, 12%, 14%, 0.5)')).toEqual({
      color: 'hsl(210, 12%, 14%)',
      opacity: 0.5,
    });
  });

  it('leaves an already-opaque colour alone', () => {
    expect(splitAlpha('#23262d')).toEqual({ color: '#23262d', opacity: 1 });
    expect(splitAlpha('rgb(35, 38, 45)')).toEqual({ color: 'rgb(35, 38, 45)', opacity: 1 });
    expect(splitAlpha('white')).toEqual({ color: 'white', opacity: 1 });
  });

  it('clamps an out-of-range alpha', () => {
    expect(splitAlpha('rgba(0, 0, 0, 1.4)').opacity).toBe(1);
    expect(splitAlpha('rgba(0, 0, 0, -1)').opacity).toBe(0);
  });

  it('passes anything it cannot read through untouched', () => {
    expect(splitAlpha('rgba(0, 0, 0, var(--a))')).toEqual({
      color: 'rgba(0, 0, 0, var(--a))',
      opacity: 1,
    });
  });
});

describe('parseColor', () => {
  it('reads the four hex forms', () => {
    expect(parseColor('#23262d')).toEqual({ r: 35, g: 38, b: 45, a: 1 });
    expect(parseColor('#abc')).toEqual({ r: 170, g: 187, b: 204, a: 1 });
    expect(parseColor('#000000ff')).toEqual({ r: 0, g: 0, b: 0, a: 1 });
    expect(parseColor('#000f')).toEqual({ r: 0, g: 0, b: 0, a: 1 });
  });

  it('reads rgb() and rgba() in either syntax', () => {
    expect(parseColor('rgb(35, 38, 45)')).toEqual({ r: 35, g: 38, b: 45, a: 1 });
    expect(parseColor('rgba(255, 255, 255, 0.08)')).toEqual({ r: 255, g: 255, b: 255, a: 0.08 });
    expect(parseColor('rgb(0 0 0 / 52%)')).toEqual({ r: 0, g: 0, b: 0, a: 0.52 });
  });

  it('reads percentage channels', () => {
    expect(parseColor('rgb(100%, 0%, 50%)')).toEqual({ r: 255, g: 0, b: 127.5, a: 1 });
  });

  it('returns null for anything it cannot read', () => {
    expect(parseColor('hsl(210, 12%, 14%)')).toBeNull();
    expect(parseColor('rebeccapurple')).toBeNull();
    expect(parseColor('#12345')).toBeNull();
    expect(parseColor('rgb(1, 2)')).toBeNull();
  });
});

describe('mixColors', () => {
  it('lands on each endpoint', () => {
    expect(mixColors('#000000', '#ffffff', 0)).toBe('rgba(0, 0, 0, 1)');
    expect(mixColors('#000000', '#ffffff', 1)).toBe('rgba(255, 255, 255, 1)');
  });

  it('mixes two opaque colours halfway', () => {
    expect(mixColors('#000000', '#ffffff', 0.5)).toBe('rgba(128, 128, 128, 1)');
  });

  it('weights each colour by its own alpha, so a faint white cannot wash out a dark', () => {
    // Naive component-wise mixing would put r at (255 + 35) / 2 = 145 — a light
    // grey nowhere near either end. Premultiplied, the 6% white barely counts.
    expect(mixColors('rgba(255, 255, 255, 0.06)', '#23262d', 0.5)).toBe('rgba(47, 50, 57, 0.53)');
  });

  it('stays fully transparent when both ends are', () => {
    expect(mixColors('rgba(255, 255, 255, 0)', 'rgba(0, 0, 0, 0)', 0.5)).toBe('rgba(0, 0, 0, 0)');
  });

  it('clamps the position', () => {
    expect(mixColors('#000000', '#ffffff', -1)).toBe('rgba(0, 0, 0, 1)');
    expect(mixColors('#000000', '#ffffff', 2)).toBe('rgba(255, 255, 255, 1)');
  });

  it('falls back to the nearer end when a colour cannot be read', () => {
    expect(mixColors('currentColor', '#ffffff', 0.2)).toBe('currentColor');
    expect(mixColors('currentColor', '#ffffff', 0.8)).toBe('#ffffff');
  });
});
