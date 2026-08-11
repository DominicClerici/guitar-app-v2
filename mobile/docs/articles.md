# Articles

How the article feature works, how to author an article, and how to add a new
live (interactive) component. Read this before touching anything under
`src/lib/content` or `src/features/articles`.

## The shape of the feature

An article is **data** — a JSON document of typed blocks — rendered by one
reusable component. Nothing about a specific article lives in app code except
live components (interactive widgets an article can summon by name).

```
packages/shared/src/content/ The content wire formats & parsers (pure TS, no React).
                             They live outside the app because the publish script and
                             the Worker validate against the same code (BACKEND_PLAN §8).
  types.ts                   Every type an article is made of — START HERE
  schema.ts                  zod validation + forward-compat normalization
  quiz.ts                    Quiz documents — same rules, unknown questions
                             degrade instead of failing (see gradableQuestions)
  activity.ts                Activity documents — note-play and rhythm rounds
  curriculum.ts              Pathway/chapter/section tree; sections are refs to
                             article, quiz and activity slugs
  *.test.ts                  Parser behavior tests

src/lib/content/index.ts     Re-exports the above under the @/lib/content path

packages/content/content/    The authored corpus (articles, quizzes, activities,
                             curriculum), validated and published by @guitar/content

src/features/articles/       Rendering & data access
  ArticleRenderer.tsx        Document in → virtualized article out (FlatList)
  RichText.tsx               Span[] → nested <Text> (marks, links)
  links.tsx                  Link-handler context (renderer provides, spans consume)
  blocks/                    One small view per block type + BlockView switch
  live/                      Live components (ScaleCompare, …)
  registry.tsx               name → live component + props schema  ← the one
                             file to edit when registering a new live component
  playbackBus.ts             "One sound source at a time" coordination
  repository.ts              ContentRepository — cache-first reads, validation at
                             the boundary (see src/lib/content-cache/)

src/screens/ArticleScreen.tsx   Loading/error/content shell around the renderer
src/app/article/[slug].tsx      Route (note: new routes need Metro to regenerate
                                typed routes before tsc passes — run expo start once)
src/screens/LearnTab.tsx        Lists articles from the repository
```

## Data model

Two payloads, designed as the future backend wire format:

- **`ArticleMeta`** — id, slug, title, summary, tags, readingTimeMin,
  publishedAt. Served in lists; what LearnTab renders.
- **`ArticleDocument`** — `{ schemaVersion, meta, blocks, footnotes? }`. The
  full article.

### Blocks

A document body is a **flat array** of blocks (no arbitrary nesting — lists and
tables bottom out at spans, never at other blocks). Current block types:
`heading` (levels 1–3), `paragraph`, `list`, `callout` (info/tip/warning),
`quote`, `divider`, `image`, `table`, `live`. See `packages/shared/src/content/types.ts`
for exact fields — it is the single source of truth and is documented.

### Rich text

Wherever text appears it is a `Span[]`:

```json
[
  { "text": "The " },
  { "text": "b3", "marks": ["code"] },
  { "text": " changes the mood", "marks": ["bold", { "type": "color", "tone": "amber" }] },
  { "text": " everywhere", "link": { "kind": "screen", "href": "/scale-visualizer" } }
]
```

Marks: `bold`, `italic`, `code`, `highlight`, `{ type: "color", tone }` where
tone ∈ `accent | amber | rose | violet` — named tones only, mapped to Aurora
tokens in `RichText.tsx`. **The wire format never carries hex colors.**

Links: `{ kind: "article", slug }`, `{ kind: "screen", href }`,
`{ kind: "url", url }`, `{ kind: "footnote", id }` (id must match an entry in
the document's `footnotes` array).

### Live blocks

```json
{
  "type": "live",
  "component": "scale-compare",
  "props": { "root": "A", "scales": ["major", "minor"] }
}
```

`props` is opaque to the document schema — each live component validates its
own props via the schema it registers in `registry.tsx`. Adding a live
component therefore never changes the document schema.

## Forward compatibility (the rules that keep old apps alive)

Validation happens once, at the repository boundary (`parseArticleDocument`).
The renderer never sees invalid data. The rules:

1. **Unknown block type** (or a known type whose payload fails validation) →
   becomes an `unknown` placeholder block; the rest of the article renders. The
   placeholder shows "Update the app to view this content".
2. **Unknown mark / unknown link kind** → silently dropped; the text renders.
3. **Unregistered live component / props failing its schema / a live component
   that throws** → same placeholder card, article keeps going.
4. **Structural damage** (bad meta, `blocks` not an array, a block without a
   string `type`, unsupported `schemaVersion`) → `ArticleParseError`; the
   screen shows an error state.

Bump `SCHEMA_VERSION` (`packages/shared/src/content/schema.ts`) **only** for breaking
shape changes. Additions (new block types, new marks, new live components) are
not breaking — that's what rules 1–3 are for.

## Authoring a new article

Articles are authored as JSON in `packages/content/content/articles/<slug>.json`
(`meta.slug` must equal the filename stem) and validated by
`pnpm --filter @guitar/content test`, which runs the real corpus through these
parsers and checks the refs no single-file parser can see. There is no manifest
to register — the loader reads the directory.

**`LEARNING_CREATION.md` at the repo root is the authoring guide**: the catalogue
of every block, mark, link, live component, question kind and activity capability
an author may use, the id and naming conventions, the style rules, and the
framework for building a whole learning pathway. Read it before writing content;
read this file before changing how content *renders*.

## Adding a new live component (checklist)

1. Create `src/features/articles/live/<Name>.tsx`, exporting the component and
   a zod schema for its props:
   ```ts
   export const myThingPropsSchema = z.object({ ... });
   export type MyThingProps = z.infer<typeof myThingPropsSchema>;
   export function MyThing(props: MyThingProps) { ... }
   ```
2. Register it in `registry.tsx`: `'my-thing': define(myThingPropsSchema, MyThing)`.
   The name is the wire-format contract — kebab-case, never renamed once
   articles in the wild use it.
3. If it makes sound: play through the shared pluck engine where possible
   (`import { pluck, prepare, release } from '@/features/scale-visualizer'`),
   and coordinate via `playbackBus` — `claimPlayback(stop)` when starting,
   `releasePlayback(stop)` when stopping/unmounting — so only one thing in an
   article sounds at a time. `ScaleCompare.tsx` is the reference
   implementation.
4. Remember blocks mount/unmount with scrolling (FlatList) — clean up timers
   and audio in an unmount effect; never assume the component stays mounted.
5. Style with uniwind classes and Aurora tokens like every other component.
   Root element should carry the block's top margin (`mt-[18px]` is standard).
6. Pure logic (note math, sequencing) that deserves tests goes in `src/lib`
   (vitest only covers `src/lib/**/*.test.ts`).
7. Add it to the live component catalogue in `LEARNING_CREATION.md` §7.3 — name,
   props, what it does and when an author should reach for it, and the file
   path. A component nobody can find in that table will never be used, because
   content agents are told to use nothing else.

## The backend seam

Screens talk only to `ContentRepository` (`repository.ts`) — articles, quizzes,
activities, and the curriculum tree. Every read goes through the device cache
first (`src/lib/content-cache/`), so a document already on the device returns
without a request and only a genuine miss reaches the network. Validation
happens here, at the boundary, which is where the forward-compatibility rules
above belong.

Content is published, not owned: the corpus is authored in `packages/content`,
validated by the same parsers, and pushed to Postgres by `pnpm content:publish`.
See BACKEND_PLAN.md §14.
