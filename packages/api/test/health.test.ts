import { SELF } from 'cloudflare:test';
import { describe, expect, it } from 'vitest';

import { healthResult } from '@guitar/shared';

describe('worker', () => {
  it('serves the plain health route', async () => {
    const res = await SELF.fetch('https://api.test/health');

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toMatchObject({ ok: true, service: 'guitar-api' });
  });

  it('serves health.ping over tRPC in the shape @guitar/shared declares', async () => {
    const res = await SELF.fetch('https://api.test/trpc/health.ping');

    expect(res.status).toBe(200);

    const body = (await res.json()) as { result: { data: unknown } };
    expect(() => healthResult.parse(body.result.data)).not.toThrow();
  });

  it('404s an unknown procedure', async () => {
    const res = await SELF.fetch('https://api.test/trpc/health.nope');

    expect(res.status).toBe(404);
  });
});
