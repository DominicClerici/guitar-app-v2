# guitar-mobile-expo

Expo 57 app using React 19 with the React Compiler enabled. Routing via `expo-router`.

Styling via uniwind (Tailwind CSS v4) — use Tailwind utility classes, not `StyleSheet`.

## Design

Follow `DESIGN.md` when implementing or updating any UI — it defines the "Aurora" visual
language (vibe, colour, typography, spacing, elevation). Use the design tokens in
`src/global.css` (`var(--token)`); never hardcode colours. When a new screen introduces a
reusable pattern, document it in `DESIGN.md`.

## Verifying a solution

Run `pnpm lint` — it runs `tsc --noEmit` followed by `expo lint`, covering both typecheck and lint. Always run this after making changes to confirm the solution is correct.

## Argent

Do not use argent MCP tools or workflows unless the user explicitly asks for them.
