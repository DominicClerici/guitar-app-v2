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
