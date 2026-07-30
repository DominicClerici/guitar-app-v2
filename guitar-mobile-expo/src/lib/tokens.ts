import { useCSSVariable } from 'uniwind';

/**
 * Resolve a single Aurora token from `global.css` to a plain string, for the few
 * places a colour has to reach an API that takes no `className` (SVG fills,
 * native symbol tints, worklet interpolation).
 */
export function useToken(name: string, fallback: string): string {
  const vars = useCSSVariable([name]);
  return (vars[0] as string | undefined) ?? fallback;
}

/**
 * The same, for a component that paints from several tokens at once. Pass a
 * module-level array: uniwind re-reads the variables whenever the names change.
 */
export function useTokens(names: readonly string[]): (string | undefined)[] {
  const vars = useCSSVariable(names as string[]);
  return vars.map((value) => (value === undefined ? undefined : String(value)));
}
