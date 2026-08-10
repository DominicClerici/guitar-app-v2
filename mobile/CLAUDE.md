# mobile

Expo 57 app using React 19 with the React Compiler enabled. Routing via `expo-router`.

## Styling

Style **exclusively** with uniwind using Tailwind CSS v4 syntax — apply utility classes via
`className`. Do not:

- use `StyleSheet.create`, inline `style={{...}}` objects, or any other stylesheet mechanism
- author CSS classes (in `src/global.css` or elsewhere) unless a style is genuinely impossible to
  express with utilities — and only after confirming there is no utility-based way to do it

Prefer composing utility classes directly on the element. The only expected additions to
`src/global.css` are design tokens (see Design below), not component classes.

## Design

Follow `DESIGN.md` when implementing or updating any UI — it defines the "Aurora" visual
language (vibe, colour, typography, spacing, elevation). Use the design tokens in
`src/global.css` (`var(--token)`); never hardcode colours. When a new screen introduces a
reusable pattern, document it in `DESIGN.md`.

## Articles

Learn-tab articles are JSON documents rendered by a reusable block renderer.
Before authoring an article, changing the article schema, or adding a live
(interactive) article component, read `docs/articles.md` — it documents the
data model, the forward-compatibility rules, and the checklists for both.

## Verifying a solution

Run `pnpm lint` — it runs `tsc --noEmit` followed by `expo lint`, covering both typecheck and lint. Always run this after making changes to confirm the solution is correct.

## Argent

Do not use argent MCP tools or workflows unless the user explicitly asks for them.
