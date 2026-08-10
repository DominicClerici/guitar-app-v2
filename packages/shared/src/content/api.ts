import { z } from 'zod';

/**
 * The content API's wire contracts (BACKEND_PLAN.md §8).
 *
 * Three read-only procedures serve the curriculum and the documents it points at. They are public:
 * nothing here is per-user, and gating a lesson behind a session would only cost a database lookup
 * to protect content the app displays to anyone who opens it.
 *
 * Every response is **version-conditional**. The device sends the version it already holds and the
 * server answers `unchanged` when it matches, which is what keeps a launch-time refresh of three
 * cached chapters from re-downloading three chapters of JSON — and, more importantly for the free
 * tier, from spending Neon compute on rows the device already has.
 *
 * `chapter` is shaped like the device's cache unit rather than like the data model: one request
 * returns every document a chapter references, so caching a chapter is one call and evicting it is
 * one delete. Fetching documents one slug at a time would make the cache manager's job N round
 * trips on a network that is often the reason the cache exists.
 */

/** An opaque content hash. The device compares it for equality and never parses it. */
export const contentVersion = z.string().min(1);

/**
 * A stored document as the server hands it over.
 *
 * `body` is deliberately unvalidated on the wire. It is validated twice already — by the publish
 * script before it is stored, and by the device's own parser at the repository boundary, which is
 * where the forward-compatibility rules live. Re-validating a whole article inside the Worker's
 * output schema would spend CPU on every request to reach the same verdict.
 */
export const contentDocumentPayload = z.object({
  slug: z.string(),
  kind: z.enum(['article', 'quiz']),
  version: contentVersion,
  body: z.unknown(),
});
export type ContentDocumentPayload = z.infer<typeof contentDocumentPayload>;

/**
 * Wraps a payload so `unchanged` can be answered without it.
 *
 * A discriminated union rather than a nullable payload, because the two cases mean different
 * things: "you are current" and "here is the new content" must not collapse into one shape where
 * an empty result is ambiguous with an up-to-date one.
 */
function conditional<T extends z.ZodType>(payload: T) {
  return z.discriminatedUnion('unchanged', [
    z.object({ unchanged: z.literal(true) }),
    z.object({ unchanged: z.literal(false), version: contentVersion, content: payload }),
  ]);
}

/** What the device already holds, if anything. Absent on a first fetch. */
const knownVersion = z.object({ knownVersion: contentVersion.optional() });

export const contentIndexInput = knownVersion;
export const contentIndexResult = conditional(z.unknown());
export type ContentIndexResult = z.infer<typeof contentIndexResult>;

export const contentPathwayInput = knownVersion.extend({ slug: z.string().min(1) });
export const contentPathwayResult = conditional(z.unknown());
export type ContentPathwayResult = z.infer<typeof contentPathwayResult>;

export const contentChapterInput = knownVersion.extend({
  pathwaySlug: z.string().min(1),
  chapterId: z.string().min(1),
});
export const contentChapterResult = conditional(z.array(contentDocumentPayload));
export type ContentChapterResult = z.infer<typeof contentChapterResult>;

/**
 * One document on its own — how the standalone article library fetches, since those articles
 * belong to no chapter and so are never covered by a chapter fetch.
 */
export const contentDocumentInput = z.object({ slug: z.string().min(1) });

/**
 * The standalone library's listing: article meta only, for articles no pathway references.
 *
 * "Standalone" is decided by the server rather than stored, because it is a fact about the
 * *relationship* between a document and the curriculum — a pathway that starts referencing an
 * article should remove it from the library without that article being republished.
 */
export const contentArticlesInput = knownVersion;
export const contentArticlesResult = conditional(z.array(z.unknown()));
export type ContentArticlesResult = z.infer<typeof contentArticlesResult>;

/**
 * Web Crypto, declared structurally rather than by widening this package's `lib`.
 *
 * `contentHash` runs in the Worker and in the Node publish script, both of which have it. The
 * device never calls it — it only ever compares versions for equality — but it does import this
 * module, and adding `DOM` to a package React Native consumes would make `window` and `document`
 * look available in every other file here. This states the one platform capability actually
 * required and pollutes nothing else.
 */
declare const crypto: {
  subtle: { digest(algorithm: string, data: Uint8Array): Promise<ArrayBuffer> };
};
declare const TextEncoder: { new (): { encode(input: string): Uint8Array } };

/**
 * The content hash used for every `version` above, and by the publish script when it stores one.
 *
 * Web Crypto rather than `node:crypto` so the identical implementation runs in the Worker and in
 * the Node script that publishes — two implementations of "the version of this document" is
 * exactly the drift that would make `unchanged` lie.
 *
 * Truncated to 16 hex characters: this identifies a revision for cache invalidation, it is not a
 * security boundary, and the full digest would be noise in every row and request.
 */
export async function contentHash(input: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));

  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 16);
}

/**
 * The index's version, derived from the pathways in it rather than stored.
 *
 * Deriving it is what stops the index claiming to be current after a pathway underneath it has
 * been republished. Sorted, so two servers listing the same pathways in different orders agree.
 */
export async function curriculumIndexVersion(
  pathways: readonly { slug: string; version: string }[],
): Promise<string> {
  const joined = [...pathways]
    .sort((a, b) => a.slug.localeCompare(b.slug))
    .map((pathway) => `${pathway.slug}@${pathway.version}`)
    .join('\n');

  return contentHash(joined);
}
