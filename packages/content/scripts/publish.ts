import { fileURLToPath } from 'node:url';

import { createDb, pgSchema } from '@guitar/db';
import { config } from 'dotenv';
import { sql } from 'drizzle-orm';

import { ContentValidationError, loadContent } from '../src/load';
import type { LoadedDocument, LoadedPathway } from '../src/load';

// `dotenv/config` with a fallback, rather than a plain import: publishing targets exactly the
// database `pnpm db db:migrate` just migrated, and duplicating its connection string into a second
// .env is how the two quietly end up pointing at different branches. A real environment variable
// still wins — dotenv never overwrites one that is already set.
config({ quiet: true });
config({ quiet: true, path: fileURLToPath(new URL('../../db/.env', import.meta.url)) });

// Publishes the authored corpus into `content_documents` and `curriculum_pathways`.
//
// Two rules shape this script:
//
//   · Validation happens before the database is touched at all (not even a connection), so a typo
//     in a ref can never leave half a curriculum published.
//   · No interactive transaction. The `neon-http` driver issues one HTTP request per statement and
//     cannot open one (BACKEND_PLAN.md §3), so the writes are one bulk `INSERT … ON CONFLICT DO
//     UPDATE` per table, submitted together through `db.batch` — Neon's array-form transaction.
//
// Rows whose version already matches are left alone rather than rewritten with a fresh
// `published_at`. That is what makes a second run a no-op, which is the property the device's
// `unchanged` fast path is built on.

const { contentDocuments, curriculumPathways } = pgSchema;

interface Change {
  slug: string;
  version: string;
  previous?: string;
}

interface Plan {
  added: Change[];
  changed: Change[];
  unchanged: Change[];
  orphaned: string[];
}

function planFor(
  entries: readonly { slug: string; version: string }[],
  stored: ReadonlyMap<string, string>,
): Plan {
  const plan: Plan = { added: [], changed: [], unchanged: [], orphaned: [] };

  for (const entry of entries) {
    const previous = stored.get(entry.slug);
    if (previous === undefined) plan.added.push(entry);
    else if (previous === entry.version) plan.unchanged.push({ ...entry, previous });
    else plan.changed.push({ ...entry, previous });
  }

  const authored = new Set(entries.map((entry) => entry.slug));
  plan.orphaned = [...stored.keys()].filter((slug) => !authored.has(slug)).sort();

  return plan;
}

function report(table: string, plan: Plan): void {
  const width = Math.max(
    0,
    ...[...plan.added, ...plan.changed, ...plan.unchanged].map((entry) => entry.slug.length),
  );
  const pad = (slug: string) => slug.padEnd(width);

  console.log(`\n${table}`);
  for (const entry of plan.added) console.log(`  + ${pad(entry.slug)}  ${entry.version}`);
  for (const entry of plan.changed) {
    console.log(`  ~ ${pad(entry.slug)}  ${entry.previous} → ${entry.version}`);
  }
  for (const entry of plan.unchanged) console.log(`  = ${pad(entry.slug)}  ${entry.version}`);
  // Never deleted here: a device may still hold a cached reference, and withdrawing published
  // content is a decision with a migration attached, not a side effect of a publish.
  for (const slug of plan.orphaned) console.log(`  ! ${pad(slug)}  stored but no longer authored`);

  console.log(
    `  ${plan.added.length} new, ${plan.changed.length} changed, ${plan.unchanged.length} unchanged` +
      (plan.orphaned.length ? `, ${plan.orphaned.length} orphaned` : ''),
  );
}

const toWrite = (plan: Plan) => new Set([...plan.added, ...plan.changed].map((e) => e.slug));

// ─ run ─

let corpus;
try {
  corpus = await loadContent();
} catch (error) {
  if (error instanceof ContentValidationError) {
    console.error(`Refusing to publish — ${error.issues.length} problem(s) in the content:\n`);
    for (const issue of error.issues) console.error(`  ${issue.file}\n    ${issue.message}`);
    process.exit(1);
  }
  throw error;
}

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL is not set. Add it to packages/db/.env or export it.');
  process.exit(1);
}

const db = createDb(databaseUrl);

const [storedDocuments, storedPathways] = await db.batch([
  db
    .select({ slug: contentDocuments.slug, version: contentDocuments.version })
    .from(contentDocuments),
  db
    .select({ slug: curriculumPathways.slug, version: curriculumPathways.version })
    .from(curriculumPathways),
]);

const documentPlan = planFor(
  corpus.documents,
  new Map(storedDocuments.map((row) => [row.slug, row.version])),
);
const pathwayPlan = planFor(
  corpus.pathways,
  new Map(storedPathways.map((row) => [row.slug, row.version])),
);

const documentsToWrite = corpus.documents.filter((document) =>
  toWrite(documentPlan).has(document.slug),
);
const pathwaysToWrite = corpus.pathways.filter((pathway) => toWrite(pathwayPlan).has(pathway.slug));

const now = new Date();

const upsertDocuments = (rows: LoadedDocument[]) =>
  db
    .insert(contentDocuments)
    .values(
      rows.map((row) => ({
        slug: row.slug,
        kind: row.kind,
        version: row.version,
        body: row.body,
        publishedAt: now,
      })),
    )
    .onConflictDoUpdate({
      target: contentDocuments.slug,
      set: {
        kind: sql`excluded.kind`,
        version: sql`excluded.version`,
        body: sql`excluded.body`,
        publishedAt: sql`excluded.published_at`,
      },
    });

const upsertPathways = (rows: LoadedPathway[]) =>
  db
    .insert(curriculumPathways)
    .values(
      rows.map((row) => ({
        slug: row.slug,
        version: row.version,
        body: row.body,
        publishedAt: now,
      })),
    )
    .onConflictDoUpdate({
      target: curriculumPathways.slug,
      set: {
        version: sql`excluded.version`,
        body: sql`excluded.body`,
        publishedAt: sql`excluded.published_at`,
      },
    });

// Branching rather than assembling an array: `db.batch` takes a non-empty tuple, and spelling the
// three cases out keeps that guarantee in the type system instead of in a cast.
if (documentsToWrite.length > 0 && pathwaysToWrite.length > 0) {
  await db.batch([upsertDocuments(documentsToWrite), upsertPathways(pathwaysToWrite)]);
} else if (documentsToWrite.length > 0) {
  await upsertDocuments(documentsToWrite);
} else if (pathwaysToWrite.length > 0) {
  await upsertPathways(pathwaysToWrite);
}

report('content_documents', documentPlan);
report('curriculum_pathways', pathwayPlan);

const written = documentsToWrite.length + pathwaysToWrite.length;
console.log(
  written === 0 ? '\nNothing to publish — every row is current.' : `\nPublished ${written} row(s).`,
);
