import { describe, expect, it } from 'vitest';

import { COVER_MS, firstName, HIDE_MS, HOLD_MS, momentText, PLAY_MS, timing } from './moment';

describe('firstName', () => {
  it('takes the first word', () => {
    expect(firstName('Dominic Clerici')).toBe('Dominic');
  });

  it('survives the whitespace a text field lets through', () => {
    expect(firstName('  Ada   Lovelace ')).toBe('Ada');
  });

  it('has nothing to say about an empty name', () => {
    expect(firstName('')).toBe('');
    expect(firstName('   ')).toBe('');
  });
});

describe('momentText', () => {
  it('welcomes a returning account back', () => {
    expect(momentText({ kind: 'returning', name: 'Dominic Clerici' })).toBe(
      'Welcome back, Dominic',
    );
  });

  it('welcomes a finished account in', () => {
    expect(momentText({ kind: 'new', name: 'Dominic' })).toBe('Welcome to Guitar-app, Dominic');
  });

  it('drops the address rather than greeting nobody by name', () => {
    expect(momentText({ kind: 'returning', name: '' })).toBe('Welcome back');
    expect(momentText({ kind: 'new', name: '   ' })).toBe('Welcome to Guitar-app');
  });

  it('says what is happening on the way out, and uses no name to say it', () => {
    expect(momentText({ kind: 'leaving' })).toBe('Signing you out');
  });
});

describe('timing', () => {
  it('opens an arrival on black, so there is nothing to fade up and no wait to work behind', () => {
    const arrival = timing('returning');

    expect(arrival.coverMs).toBe(0);
    expect(arrival.playAt).toBe(0);
    expect(arrival.reverse).toBe(false);
    expect(arrival.totalMs).toBe(PLAY_MS + HOLD_MS + HIDE_MS);
  });

  it('agrees on both ways in', () => {
    expect(timing('new')).toEqual(timing('returning'));
  });

  it('covers a live screen first on the way out, and plays the mark backwards after', () => {
    const leaving = timing('leaving');

    expect(leaving.coverMs).toBe(COVER_MS);
    expect(leaving.playAt).toBe(COVER_MS);
    expect(leaving.reverse).toBe(true);
    expect(leaving.totalMs).toBe(COVER_MS + PLAY_MS + HOLD_MS + HIDE_MS);
  });

  it('never fades out before the mark and its beat are done', () => {
    for (const kind of ['returning', 'new', 'leaving'] as const) {
      const plan = timing(kind);
      expect(plan.totalMs - HIDE_MS).toBe(plan.playAt + PLAY_MS + HOLD_MS);
    }
  });
});
