import { describe, expect, it } from 'vitest';

import { initials } from './initials';

describe('initials', () => {
  it('takes the first letter of the first two words', () => {
    expect(initials({ name: 'Dominic Clerici', email: 'dom@example.com' })).toBe('DC');
  });

  it('ignores anything past the second word', () => {
    expect(initials({ name: 'Ada King Lovelace', email: 'ada@example.com' })).toBe('AK');
  });

  it('survives the runs of whitespace a pasted name arrives with', () => {
    expect(initials({ name: '  jimi   hendrix ', email: 'jimi@example.com' })).toBe('JH');
  });

  it('falls back to the address when there is no name to read', () => {
    expect(initials({ name: '', email: 'nobody@example.com' })).toBe('N');
    expect(initials({ name: '   ', email: 'nobody@example.com' })).toBe('N');
  });
});
