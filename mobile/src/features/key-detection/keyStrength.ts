import type { KeyEstimate } from '@/lib/key-analysis';

export interface KeyStrength {
  /** 0–1 dominance of the best key over the runner-up. 0.5 = toss-up, 1 = clear. */
  fraction: number;
  /** Qualitative label for the detected key. */
  word: 'Likely' | 'Ambiguous';
}

// The engine's `confidence` is a softmax share across all 24 keys, so it is
// structurally capped well below 1.0 — even a textbook progression tops out near
// 0.65, which reads as "uncertain" if printed raw. Express strength *relative*
// to the runner-up instead: c0 / (c0 + c1). A lone candidate is fully dominant.
export function keyStrength(estimate: KeyEstimate): KeyStrength {
  // candidates is ranked best-first (engine contract) — take the top two.
  const [a, b] = estimate.candidates;
  const denom = a && b ? a.confidence + b.confidence : 0;
  const fraction = denom > 0 ? a.confidence / denom : 1;
  const word = estimate.status === 'ambiguous' ? 'Ambiguous' : 'Likely';
  return { fraction, word };
}
