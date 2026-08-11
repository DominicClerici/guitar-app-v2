import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  contentHash,
  midiForTarget,
  parseActivityDocument,
  parseArticleDocument,
  parseCurriculumPathway,
  parseQuizDocument,
  runnableRounds,
} from '@guitar/shared';
import type {
  CurriculumPathway,
  CurriculumSection,
  FretPosition,
  FretWindow,
  RenderActivity,
  RenderSection,
} from '@guitar/shared';

// Reads the authored corpus under `content/`, validates every file through the *shared* parsers
// (the same code the device runs — BACKEND_PLAN.md §8), and then checks the things no single-file
// parser can see: whether the refs in the curriculum tree actually point at documents that exist.
//
// Every failure is collected rather than thrown at the first one. Someone fixing content wants the
// whole list in a single run, not one error per publish attempt.

const CONTENT_ROOT = fileURLToPath(new URL('../content', import.meta.url));

/** `kind` as stored in `content_documents` — the three kinds `contentDocumentPayload` allows. */
export type DocumentKind = 'article' | 'quiz' | 'activity';

/**
 * The metronome's own range — `MIN_BPM`/`MAX_BPM` in the app's metronome patterns module, restated
 * rather than imported because this package cannot depend on the app. A round asking for a tempo
 * outside it is silently pulled back into range at playback, which means the learner drills a
 * different exercise than the one that was authored.
 */
const MIN_BPM = 20;
const MAX_BPM = 300;

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
  /**
   * Only for activities — the parsed body, carried for the same reason `LoadedPathway` carries its
   * tree. `activity.kind` is the analogue of `quizKind` (a body this build could not run degrades to
   * `unknown`), and the rules below also need the modes and rounds hanging off it, which would
   * otherwise mean parsing every activity a second time.
   */
  activity?: RenderActivity;
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

  for (const raw of readJsonDir('activities', issues)) {
    try {
      const parsed = parseActivityDocument(raw.data);
      if (parsed.meta.slug !== raw.stem) {
        issues.push({
          file: raw.file,
          message: `meta.slug is "${parsed.meta.slug}" but the filename says "${raw.stem}".`,
        });
      }
      documents.push({
        slug: parsed.meta.slug,
        kind: 'activity',
        version: await versionOf(raw.data),
        body: raw.data,
        file: raw.file,
        activity: parsed.activity,
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
    issues.push(...activityIssues(document));
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

        // `countedSections` leaves an activity out of a chapter's progress denominator only because
        // it is optional — there is no rule about its kind. An activity is never graded, so a
        // forgotten flag would quietly make a drill something the learner has to finish before the
        // chapter reads as complete.
        if (section.kind === 'activity' && !section.optional) {
          issues.push({
            file,
            message: `section "${section.id}" in chapter "${chapter.id}" is an activity and must set "optional": true — activities are never graded, and without the flag this one counts toward the chapter's progress and gates it.`,
          });
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

const KIND_NAMES: Record<DocumentKind, string> = {
  article: 'an article',
  quiz: 'a quiz',
  activity: 'an activity',
};

function checkSectionRef(
  section: CurriculumSection,
  chapterId: string,
  file: string,
  bySlug: Map<string, LoadedDocument>,
  issues: ContentIssue[],
): void {
  // An activity is a document like any other: an authored JSON in `content/activities`, published
  // into `content_documents` beside articles and quizzes, and fetched with the chapter that
  // references it. It differs only in what the app does with it — a board or a grid to play along
  // with rather than something to read — which is a rendering decision, not a reason for its ref to
  // resolve by a different rule than every other section's.
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
      message: `section "${section.id}" is kind "${section.kind}" but "${section.ref}" is ${KIND_NAMES[target.kind]}.`,
    });
  }
}

/** The rules an activity document must satisfy on top of parsing at all. */
function activityIssues(document: LoadedDocument): ContentIssue[] {
  const { activity, file } = document;
  if (!activity) return [];

  const issues: ContentIssue[] = [];

  // Forward compatibility is for *old apps reading new content*. A body the publisher's own parser
  // can't run is simply broken, and shipping it would put an "update the app" placeholder in front
  // of learners whose app is already current.
  if (activity.kind === 'unknown') {
    issues.push({
      file,
      message: `activity did not parse as a runnable activity (declared kind "${activity.originalKind}") — an unknown kind, a payload this build cannot read, or a note-play activity whose "modes" list is empty.`,
    });
    return issues;
  }

  // Restated for the reason `meta.passThresholdPct` is restated above: "an activity must offer a
  // difficulty to play it at" is a content rule, and it has to keep being enforced if the parser
  // ever relaxes an empty list into something less than degrading the whole activity.
  if (activity.kind === 'note-play' && activity.modes.length === 0) {
    issues.push({
      file,
      message: 'activity.modes is empty — a note-play activity must offer "easy", "hard", or both.',
    });
  }

  // Likewise the parser's own bpm bound: see MIN_BPM/MAX_BPM above for why the clamp is a content
  // rule rather than an engine detail.
  if (activity.kind === 'rhythm') {
    for (const round of runnableRounds(activity.rounds)) {
      if (round.bpm < MIN_BPM || round.bpm > MAX_BPM) {
        issues.push({
          file,
          message: `round "${round.id}" asks for ${round.bpm} bpm, outside the metronome's ${MIN_BPM}–${MAX_BPM}.`,
        });
      }
    }
  }

  const board = activity.kind === 'note-play' ? activity.board : undefined;
  const authored = authoredRounds(document.body);

  activity.rounds.forEach((round, index) => {
    if (round.kind !== 'unknown') return;
    // Same verdict as the unknown-question rule for quizzes, for the same reason: a round this
    // parser can't run is a round the learner can never finish, and `runnableRounds` would drop it
    // silently.
    const reason =
      diagnoseRound(authored[index], activity.kind, board) ??
      'an unrecognised round kind, or a field missing or out of range';
    issues.push({
      file,
      message: `round "${round.id}" did not parse as a runnable round (${reason}).`,
    });
  });

  return issues;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

/**
 * The rounds as authored, which the parser has by then replaced with placeholders.
 *
 * It knows exactly why it could not run each one — it throws a precise `ActivityParseError` inside
 * and swallows it to build the placeholder, because on a device the reason is noise nobody can act
 * on. Here it is the only thing an author wants, and there is no way to ask the parser for it.
 */
function authoredRounds(body: unknown): unknown[] {
  if (!isRecord(body)) return [];
  const activity = body.activity;

  return isRecord(activity) && Array.isArray(activity.rounds) ? activity.rounds : [];
}

function diagnoseRound(
  raw: unknown,
  kind: 'note-play' | 'rhythm',
  board: FretWindow | undefined,
): string | undefined {
  if (!isRecord(raw)) return undefined;

  return kind === 'note-play' ? diagnoseTargets(raw, board) : diagnosePattern(raw);
}

const where = (target: FretPosition) => `string ${target.string} fret ${target.fret}`;

function readWindow(value: unknown): FretWindow | undefined {
  if (!isRecord(value)) return undefined;
  const { fretFrom, fretTo } = value;

  return typeof fretFrom === 'number' && typeof fretTo === 'number'
    ? { fretFrom, fretTo }
    : undefined;
}

function diagnoseTargets(
  raw: Record<string, unknown>,
  documentBoard: FretWindow | undefined,
): string | undefined {
  const targets = raw.targets;
  if (!Array.isArray(targets)) return undefined;

  const board = readWindow(raw.board) ?? documentBoard;
  const heard = new Map<number, FretPosition>();

  for (const entry of targets) {
    if (!isRecord(entry) || typeof entry.string !== 'number' || typeof entry.fret !== 'number') {
      return undefined;
    }
    const target: FretPosition = { string: entry.string, fret: entry.fret };

    if (target.string < 1 || target.string > 6) {
      return `string ${target.string} is not on a six-string neck`;
    }
    if (board && (target.fret < board.fretFrom || target.fret > board.fretTo)) {
      return `${where(target)} is outside the board's frets ${board.fretFrom}–${board.fretTo}`;
    }

    const midi = midiForTarget(target);
    const clash = heard.get(midi);
    if (clash) {
      return `${where(clash)} and ${where(target)} both sound MIDI ${midi}, and the detector hears pitches, not strings`;
    }
    heard.set(midi, target);
  }

  return undefined;
}

function diagnosePattern(raw: Record<string, unknown>): string | undefined {
  const { bpm, beatsPerBar, subdivision, bars, slots } = raw;

  if (typeof bpm === 'number' && (bpm < MIN_BPM || bpm > MAX_BPM)) {
    return `${bpm} bpm is outside the metronome's ${MIN_BPM}–${MAX_BPM}`;
  }
  if (
    typeof beatsPerBar !== 'number' ||
    typeof subdivision !== 'number' ||
    typeof bars !== 'number' ||
    !Array.isArray(slots)
  ) {
    return undefined;
  }

  const expected = beatsPerBar * subdivision * bars;
  if (slots.length !== expected) {
    return `${slots.length} slots for a ${beatsPerBar}×${subdivision}×${bars} grid, which needs exactly ${expected}`;
  }
  if (!slots.some((slot) => slot === 'hit' || slot === 'accent')) {
    return 'every slot is a rest, so there is nothing to detect';
  }

  return undefined;
}
