# Articles

How the article feature works, how to author an article, and how to add a new
live (interactive) component. Read this before touching anything under
`src/lib/articles` or `src/features/articles`.

## The shape of the feature

An article is **data** — a JSON document of typed blocks — rendered by one
reusable component. Nothing about a specific article lives in app code except
live components (interactive widgets an article can summon by name).

```
src/lib/articles/            The wire format & parser (pure TS, no React)
  types.ts                   Every type an article is made of — START HERE
  schema.ts                  zod validation + forward-compat normalization
  articles.test.ts           Parser behavior tests

src/features/articles/       Rendering & data access
  ArticleRenderer.tsx        Document in → virtualized article out (FlatList)
  RichText.tsx               Span[] → nested <Text> (marks, links)
  links.tsx                  Link-handler context (renderer provides, spans consume)
  blocks/                    One small view per block type + BlockView switch
  live/                      Live components (ScaleCompare, …)
  registry.tsx               name → live component + props schema  ← the one
                             file to edit when registering a new live component
  playbackBus.ts             "One sound source at a time" coordination
  repository.ts              ArticleRepository interface + bundled impl
  content/                   Bundled article JSON + manifest.ts

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
`quote`, `divider`, `image`, `table`, `live`. See `src/lib/articles/types.ts`
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

Bump `SCHEMA_VERSION` (`src/lib/articles/schema.ts`) **only** for breaking
shape changes. Additions (new block types, new marks, new live components) are
not breaking — that's what rules 1–3 are for.

## Authoring a new article (checklist)

1. Write `src/features/articles/content/<slug>.json`. Copy the shape of
   `major-vs-minor.json`. `meta.slug` must equal the filename.
2. Register it in `content/manifest.ts` (one line).
3. Run `pnpm lint`. Parser errors from bad JSON will surface through the
   article tests / at runtime with block indexes in the message.
4. Check it on-device: Learn tab → your article. Long articles are fine — the
   renderer virtualizes.

Style notes: the article title comes from `meta`, not a heading block. Use
`heading` level 1 for sections, 2 for subsections, 3 for small mono labels.
Note names and formulas (`b3`, `W–W–H…`) read best with the `code` mark. When a
live component demonstrates something, tint the key terms in prose with the
same tones the component uses (see how major-vs-minor uses amber).

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
7. Document the component and its props here:

### Live component reference

| name            | props                                                          | what it does                                                                                                                                                         |
| --------------- | -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `scale-compare` | `{ root: RootName, scales: string[] (1–4 scale-library ids) }` | One card per scale on the same root: tones as chips, play button runs the scale (chips light as notes sound). Non-reference scales tint their differing tones amber. |

## The backend seam

Screens talk only to `ArticleRepository` (`repository.ts`):

```ts
listArticles(): Promise<ArticleMeta[]>   // newest first
getArticle(slug): Promise<ArticleDocument>
```

Today it reads bundled JSON via `content/manifest.ts`. When the backend
arrives: implement the same interface with fetch + caching, validate with the
same `parseArticleDocument` / `parseArticleMeta` at the boundary, delete
`content/`. The wire format is already what these parsers accept. Expected
endpoints: a meta-list endpoint (paginated, newest first) and a
document-by-slug endpoint.
