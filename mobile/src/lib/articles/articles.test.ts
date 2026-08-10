import { describe, expect, it } from 'vitest';

import { ArticleParseError, parseArticleDocument, parseArticleMeta } from './schema';

const meta = {
  id: 'art_test',
  slug: 'test-article',
  title: 'Test Article',
  summary: 'A fixture.',
  tags: ['theory'],
  readingTimeMin: 3,
  publishedAt: '2026-08-02',
};

const doc = (blocks: unknown[], extra: Record<string, unknown> = {}) => ({
  schemaVersion: 1,
  meta,
  blocks,
  ...extra,
});

describe('parseArticleDocument', () => {
  it('parses a document using every block type', () => {
    const parsed = parseArticleDocument(
      doc(
        [
          { type: 'heading', level: 1, spans: [{ text: 'Hello' }] },
          { type: 'paragraph', spans: [{ text: 'Body', marks: ['bold'] }] },
          { type: 'list', ordered: true, items: [[{ text: 'One' }], [{ text: 'Two' }]] },
          { type: 'callout', tone: 'tip', spans: [{ text: 'Try it' }] },
          { type: 'quote', spans: [{ text: 'Wise words' }], attribution: 'Someone' },
          { type: 'divider' },
          { type: 'image', url: 'https://x.test/a.png', aspectRatio: 1.5, alt: 'A' },
          { type: 'table', header: [[{ text: 'Col' }]], rows: [[[{ text: 'Cell' }]]] },
          { type: 'live', component: 'scale-compare', props: { root: 'A' } },
        ],
        { footnotes: [{ id: 'fn1', spans: [{ text: 'Aside.' }] }] },
      ),
    );

    expect(parsed.blocks.map((block) => block.type)).toEqual([
      'heading',
      'paragraph',
      'list',
      'callout',
      'quote',
      'divider',
      'image',
      'table',
      'live',
    ]);
    expect(parsed.footnotes).toHaveLength(1);
  });

  it('turns an unknown block type into a placeholder instead of failing', () => {
    const parsed = parseArticleDocument(
      doc([
        { type: 'paragraph', spans: [{ text: 'Before' }] },
        { type: 'hologram', beams: 7 },
        { type: 'paragraph', spans: [{ text: 'After' }] },
      ]),
    );

    expect(parsed.blocks[1]).toEqual({ type: 'unknown', originalType: 'hologram' });
    expect(parsed.blocks).toHaveLength(3);
  });

  it('turns a known block with an invalid payload into a placeholder', () => {
    const parsed = parseArticleDocument(doc([{ type: 'heading', level: 9, spans: [] }]));
    expect(parsed.blocks[0]).toEqual({ type: 'unknown', originalType: 'heading' });
  });

  it('drops unknown marks but keeps known ones', () => {
    const parsed = parseArticleDocument(
      doc([
        {
          type: 'paragraph',
          spans: [{ text: 'Hi', marks: ['bold', 'sparkle', { type: 'color', tone: 'amber' }] }],
        },
      ]),
    );

    const block = parsed.blocks[0];
    if (block.type !== 'paragraph') throw new Error('expected paragraph');
    expect(block.spans[0].marks).toEqual(['bold', { type: 'color', tone: 'amber' }]);
  });

  it('drops a link of an unknown kind but keeps the text', () => {
    const parsed = parseArticleDocument(
      doc([{ type: 'paragraph', spans: [{ text: 'Hi', link: { kind: 'teleport', to: 'x' } }] }]),
    );

    const block = parsed.blocks[0];
    if (block.type !== 'paragraph') throw new Error('expected paragraph');
    expect(block.spans[0].link).toBeUndefined();
    expect(block.spans[0].text).toBe('Hi');
  });

  it('rejects an unsupported schemaVersion', () => {
    expect(() => parseArticleDocument({ schemaVersion: 2, meta, blocks: [] })).toThrow(
      ArticleParseError,
    );
  });

  it('rejects a document whose blocks are not an array', () => {
    expect(() => parseArticleDocument({ schemaVersion: 1, meta, blocks: 'nope' })).toThrow(
      ArticleParseError,
    );
  });

  it('rejects a block that is not an object with a string type', () => {
    expect(() => parseArticleDocument(doc([42]))).toThrow(ArticleParseError);
  });

  it('rejects a document with invalid meta', () => {
    expect(() =>
      parseArticleDocument({ schemaVersion: 1, meta: { ...meta, title: '' }, blocks: [] }),
    ).toThrow(ArticleParseError);
  });
});

describe('parseArticleMeta', () => {
  it('parses valid meta', () => {
    expect(parseArticleMeta(meta)).toEqual(meta);
  });

  it('rejects meta with missing fields', () => {
    const { slug: _slug, ...rest } = meta;
    expect(() => parseArticleMeta(rest)).toThrow(ArticleParseError);
  });
});
