import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  contentHash,
  parseArticleDocument,
  parseCurriculumPathway,
  parseQuizDocument,
} from '@guitar/shared';
import type { CurriculumPathway, CurriculumSection, RenderSection } from '@guitar/shared';

// Reads the authored corpus under `content/`, validates every file through the *shared* parsers
// (the same code the device runs — BACKEND_PLAN.md §8), and then checks the things no single-file
// parser can see: whether the refs in the curriculum tree actually point at documents that exist.
//
// Every failure is collected rather than thrown at the first one. Someone fixing content wants the
// whole list in a single run, not one error per publish attempt.

const CONTENT_ROOT = fileURLToPath(new URL('../content', import.meta.url));

/** `kind` as stored in `content_documents` — the two kinds `contentDocumentPayload` allows. */
export type DocumentKind = 'article' | 'quiz';

export interface LoadedDocument {
  slug: string;
  kind: DocumentKind;
  /** Content hash of the canonical body; what the device compares to decide it is stale. */
  version: string;
  /**
   * The authored JSON, verbatim. Deliberately *not* the parser's output: normalization is lossy
   * (unknown marks dropped, unrecognised blocks flattened to placeholders), and the parser that
   * matters is the one on the device, at its own version. Publishing the parsed form would bake
   * this build's understanding of the schema into storage forever.
   */
  body: unknown;
  /** Path relative to the package root, for error messages. */
  file: string;
  /** Only for quizzes — the checkpoint/section distinction the pathway's refs are checked against. */
  quizKind?: 'quiz' | 'checkpoint';
}

export interface LoadedPathway {
  slug: string;
  version: string;
  body: unknown;
  file: string;
  /** The parsed tree, so callers don't re-parse to walk chapters. */
  pathway: CurriculumPathway;
}

export interface ContentCorpus {
  documents: LoadedDocument[];
  pathways: LoadedPathway[];
}

export interface ContentIssue {
  /** Path relative to the package root. */
  file: string;
  message: string;
}

export class ContentValidationError extends Error {
  readonly issues: ContentIssue[];

  constructor(issues: ContentIssue[]) {
    super(
      `${issues.length} content problem${issues.length === 1 ? '' : 's'}:\n` +
        issues.map((issue) => `  ${issue.file}: ${issue.message}`).join('\n'),
    );
    this.name = 'ContentValidationError';
    this.issues = issues;
  }
}

/**
 * Canonical JSON for hashing.
 *
 * Object keys are sorted; array order is preserved. That split is the whole decision: key order in
 * a JSON file is cosmetic — a formatter, an editor, or a hand edit can reorder `meta` without
 * changing a word of the article — whereas array order is content (block sequence, question order,
 * the order of a chapter's sections). Hashing raw file bytes instead would make every reformat look
 * like a new revision and re-download the corpus onto every device; hashing an order-insensitive
 * digest of arrays would make a reordered chapter look unchanged.
 *
 * Serialized by hand rather than via `JSON.stringify(sortedObject)` because JavaScript objects list
 * integer-like keys first regardless of insertion order, so a future document keyed by numbers
 * would silently escape the sort.
 */
export function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value) ?? 'null';

  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;

  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, entry]) => entry !== undefined)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));

  return `{${entries.map(([key, entry]) => `${JSON.stringify(key)}:${canonicalJson(entry)}`).join(',')}}`;
}

const versionOf = (body: unknown): Promise<string> => contentHash(canonicalJson(body));

interface RawFile {
  /** Filename without `.json` — the slug every document is required to agree with. */
  stem: string;
  file: string;
  data: unknown;
}

function readJsonDir(directory: string, issues: ContentIssue[]): RawFile[] {
  const path = join(CONTENT_ROOT, directory);
  const names = readdirSync(path)
    .filter((name) => name.endsWith('.json'))
    .sort();

  const files: RawFile[] = [];
  for (const name of names) {
    const file = `content/${directory}/${name}`;
    try {
      files.push({
        stem: name.slice(0, -'.json'.length),
        file,
        data: JSON.parse(readFileSync(join(path, name), 'utf8')),
      });
    } catch (error) {
      issues.push({ file, message: `is not valid JSON — ${(error as Error).message}` });
    }
  }
  return files;
}

const describeError = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

/** A section the tolerant curriculum parser turned into a placeholder is an authoring bug here. */
const isOpenable = (section: RenderSection): section is CurriculumSection =>
  section.kind !== 'unknown';

/**
 * Loads and validates the whole corpus.
 *
 * @throws ContentValidationError listing every problem found, if there is at least one.
 */
export async function loadContent(): Promise<ContentCorpus> {
  const issues: ContentIssue[] = [];

  const documents: LoadedDocument[] = [];

  for (const raw of readJsonDir('articles', issues)) {
    try {
      const parsed = parseArticleDocument(raw.data);
      if (parsed.meta.slug !== raw.stem) {
        issues.push({
          file: raw.file,
          message: `meta.slug is "${parsed.meta.slug}" but the filename says "${raw.stem}".`,
        });
      }
      documents.push({
        slug: parsed.meta.slug,
        kind: 'article',
        version: await versionOf(raw.data),
        body: raw.data,
        file: raw.file,
      });
    } catch (error) {
      issues.push({ file: raw.file, message: describeError(error) });
    }
  }

  for (const raw of readJsonDir('quizzes', issues)) {
    try {
      const parsed = parseQuizDocument(raw.data);
      if (parsed.meta.slug !== raw.stem) {
        issues.push({
          file: raw.file,
          message: `meta.slug is "${parsed.meta.slug}" but the filename says "${raw.stem}".`,
        });
      }
      // The parser's own bound would already have thrown. Stated again because "a threshold is a
      // percentage" is a content rule, not a parser implementation detail, and it must keep being
      // enforced if the parser ever relaxes an out-of-range threshold into a placeholder the way
      // it relaxes everything else.
      if (parsed.meta.passThresholdPct < 0 || parsed.meta.passThresholdPct > 100) {
        issues.push({
          file: raw.file,
          message: `meta.passThresholdPct ${parsed.meta.passThresholdPct} is outside 0–100.`,
        });
      }
      const unknownQuestions = parsed.questions.filter((question) => question.kind === 'unknown');
      if (unknownQuestions.length > 0) {
        // Forward compatibility is for *old apps reading new content*. Content that the publisher's
        // own parser can't grade is simply broken, and shipping it would quietly shrink the
        // denominator of a live quiz.
        issues.push({
          file: raw.file,
          message: `question${unknownQuestions.length === 1 ? '' : 's'} ${unknownQuestions
            .map((question) => `"${question.id}"`)
            .join(
              ', ',
            )} did not parse as a gradable question (unknown kind, or an answer id matching no option).`,
        });
      }
      documents.push({
        slug: parsed.meta.slug,
        kind: 'quiz',
        version: await versionOf(raw.data),
        body: raw.data,
        file: raw.file,
        quizKind: parsed.meta.kind,
      });
    } catch (error) {
      issues.push({ file: raw.file, message: describeError(error) });
    }
  }

  const pathways: LoadedPathway[] = [];

  for (const raw of readJsonDir('curriculum', issues)) {
    try {
      const parsed = parseCurriculumPathway(raw.data);
      if (parsed.slug !== raw.stem) {
        issues.push({
          file: raw.file,
          message: `slug is "${parsed.slug}" but the filename says "${raw.stem}".`,
        });
      }
      pathways.push({
        slug: parsed.slug,
        version: await versionOf(raw.data),
        body: raw.data,
        file: raw.file,
        pathway: parsed,
      });
    } catch (error) {
      issues.push({ file: raw.file, message: describeError(error) });
    }
  }

  issues.push(...collectCorpusIssues({ documents, pathways }));

  if (issues.length > 0) throw new ContentValidationError(issues);

  return { documents, pathways };
}

/**
 * The cross-file half of validation: everything a single-document parser cannot see, because it
 * concerns two files at once. Pure, so it can be tested against a synthetic corpus.
 */
export function collectCorpusIssues(corpus: ContentCorpus): ContentIssue[] {
  const issues: ContentIssue[] = [];
  const bySlug = new Map<string, LoadedDocument>();
  const documentFiles = new Map<string, string>();

  for (const document of corpus.documents) {
    const seen = documentFiles.get(document.slug);
    if (seen) {
      issues.push({ file: document.file, message: `duplicate document slug — also in ${seen}.` });
      continue;
    }
    documentFiles.set(document.slug, document.file);
    bySlug.set(document.slug, document);
  }

  const pathwayFiles = new Map<string, string>();
  for (const pathway of corpus.pathways) {
    const seen = pathwayFiles.get(pathway.slug);
    if (seen) {
      issues.push({ file: pathway.file, message: `duplicate pathway slug — also in ${seen}.` });
      continue;
    }
    pathwayFiles.set(pathway.slug, pathway.file);
  }

  // Section ids are the primary key of a user's progress, across every pathway that ever ships, so
  // uniqueness is checked over the whole corpus rather than per pathway.
  const sectionFiles = new Map<string, string>();

  for (const { pathway, file } of corpus.pathways) {
    const chapterIds = new Set<string>();

    for (const chapter of pathway.chapters) {
      if (chapterIds.has(chapter.id)) {
        issues.push({ file, message: `chapter id "${chapter.id}" appears twice.` });
      }
      chapterIds.add(chapter.id);

      for (const section of chapter.sections) {
        if (!isOpenable(section)) {
          issues.push({
            file,
            message: `section "${section.id}" in chapter "${chapter.id}" did not parse as a known section (declared kind "${section.originalKind}") — check its kind, ref, slug and title.`,
          });
          continue;
        }

        const seen = sectionFiles.get(section.id);
        if (seen) {
          issues.push({
            file,
            message: `duplicate section id "${section.id}" — also in ${seen}. Section ids are progress keys and must never be reused.`,
          });
        } else {
          sectionFiles.set(section.id, file);
        }

        checkSectionRef(section, chapter.id, file, bySlug, issues);
      }

      if (chapter.checkpoint) {
        const { ref, passThresholdPct } = chapter.checkpoint;
        const target = bySlug.get(ref);
        if (!target) {
          issues.push({
            file,
            message: `chapter "${chapter.id}" checkpoint refs "${ref}", which is not a document in the corpus.`,
          });
        } else if (target.kind !== 'quiz') {
          issues.push({
            file,
            message: `chapter "${chapter.id}" checkpoint refs "${ref}", which is an article, not a quiz.`,
          });
        } else if (target.quizKind !== 'checkpoint') {
          issues.push({
            file,
            message: `chapter "${chapter.id}" checkpoint refs "${ref}", whose meta.kind is "${target.quizKind}" and must be "checkpoint".`,
          });
        }

        if (passThresholdPct < 0 || passThresholdPct > 100) {
          issues.push({
            file,
            message: `chapter "${chapter.id}" checkpoint passThresholdPct ${passThresholdPct} is outside 0–100.`,
          });
        }
      }
    }
  }

  return issues;
}

function checkSectionRef(
  section: CurriculumSection,
  chapterId: string,
  file: string,
  bySlug: Map<string, LoadedDocument>,
  issues: ContentIssue[],
): void {
  // Activity sections are exempt from ref resolution *by design*: an activity is a screen in the
  // app (a tuner drill, an ear-training game) addressed by name, not a stored document — and
  // `content_documents.kind` only ever holds `article` or `quiz`, so there is nothing an activity
  // ref could resolve to. Requiring resolution would mean inventing a third document kind whose
  // only content is its own name. The forward-compatibility cost is covered by `optional: true`
  // and by `countedSections`: a build that doesn't know the activity skips it without blocking the
  // chapter.
  if (section.kind === 'activity') return;

  const target = bySlug.get(section.ref);
  if (!target) {
    issues.push({
      file,
      message: `section "${section.id}" in chapter "${chapterId}" refs "${section.ref}", which is not a document in the corpus.`,
    });
    return;
  }

  if (target.kind !== section.kind) {
    issues.push({
      file,
      message: `section "${section.id}" is kind "${section.kind}" but "${section.ref}" is ${
        target.kind === 'article' ? 'an article' : 'a quiz'
      }.`,
    });
  }
}
