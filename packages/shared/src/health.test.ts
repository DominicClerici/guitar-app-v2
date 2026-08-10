import { describe, expect, it } from 'vitest';

import { healthResult } from './health';

describe('healthResult', () => {
  it('accepts a well-formed payload', () => {
    const parsed = healthResult.parse({
      ok: true,
      service: 'guitar-api',
      time: '2026-08-10T12:00:00.000Z',
    });

    expect(parsed.service).toBe('guitar-api');
  });

  it('rejects a non-ISO timestamp', () => {
    expect(() =>
      healthResult.parse({ ok: true, service: 'guitar-api', time: 'yesterday' }),
    ).toThrow();
  });
});
