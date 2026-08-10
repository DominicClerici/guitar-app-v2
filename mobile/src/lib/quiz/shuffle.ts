/** A source of numbers in [0, 1). Injected so a test can drive a shuffle deterministically. */
export type Rng = () => number;

/**
 * Fisher–Yates, returning a new array.
 *
 * Used on a question's options, once per attempt, so a learner who retakes a quiz cannot answer
 * from memory of where the right answer sat. Only the *order* moves — every option keeps its `id`,
 * which is what the grader matches on, so shuffling can never change what an answer means.
 *
 * Question order is deliberately not shuffled anywhere: an author sequences a quiz the way they
 * sequence a chapter, and a later question often builds on an earlier one.
 */
export function shuffled<T>(items: readonly T[], rng: Rng = Math.random): T[] {
  const out = [...items];

  for (let index = out.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(rng() * (index + 1));
    [out[index], out[swap]] = [out[swap], out[index]];
  }

  return out;
}
