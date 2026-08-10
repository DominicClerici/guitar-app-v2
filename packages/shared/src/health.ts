import { z } from 'zod';

export const healthResult = z.object({
  ok: z.literal(true),
  service: z.string(),
  time: z.iso.datetime(),
});

export type HealthResult = z.infer<typeof healthResult>;
