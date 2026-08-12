import { useRouter, type Href } from 'expo-router';
import { openBrowserAsync } from 'expo-web-browser';
import { useEffect, useRef, useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { ArticleDocument, Link, RenderBlock } from '@/lib/content';

import { BlockView } from './blocks/BlockView';
import { ArticleLinkProvider } from './links';
import { RichText } from './RichText';

// The reusable article body: document in, scrollable article out. Blocks render
// through a FlatList — one block per item — so a long article only mounts the
// blocks near the viewport, and heavy live components mount lazily and unmount
// when scrolled far away.

function Header({ document }: { document: ArticleDocument }) {
  const { title, tags, readingTimeMin } = document.meta;
  const strap = [...tags, `${readingTimeMin} min`].join(' · ');

  return (
    <View className="px-[18px] pt-[10px]">
      <Text className="font-mono text-[10px] uppercase tracking-[2.5px] text-ink-faint">
        {strap}
      </Text>
      <Text className="mt-[10px] text-[26px] font-semibold leading-[32px] tracking-[-0.5px] text-ink">
        {title}
      </Text>
    </View>
  );
}

function Footnotes({ document }: { document: ArticleDocument }) {
  if (!document.footnotes?.length) return null;

  return (
    <View className="mt-[30px] px-[18px]">
      <View className="h-px bg-line-soft" />
      <View className="mt-[14px] gap-[8px]">
        {document.footnotes.map((note, index) => (
          <View key={note.id} className="flex-row gap-[8px]">
            <Text className="pt-[1px] font-mono text-[10px] text-ink-faint">{index + 1}.</Text>
            <RichText
              spans={note.spans}
              className="flex-1 text-[12.5px] leading-[18px] text-ink-faint"
            />
          </View>
        ))}
      </View>
    </View>
  );
}

/**
 * How long a short article has to stay short before it counts as read. Any block that renders in
 * the meantime restarts the clock, so a long article — which mounts a screenful at a time and
 * therefore looks short for a moment — never slips through.
 */
const SHORT_ARTICLE_MS = 900;

/**
 * How much article may still be below the fold and the reader still counted as having reached the
 * end. A screenful short of it is not "read"; a closing paragraph and a footnote block is.
 */
const END_SLACK = 150;

/**
 * How much article to keep mounted either side of the viewport, in screenfuls.
 *
 * The list's own default is ten each way, which it works towards a batch at a time over the second
 * or so after mount. For an article that is mostly rendering blocks nobody will look at, and when
 * the article was opened by a page turn it is a second of background work landing squarely on the
 * animation carrying it. Two screens is further than a reader can outrun.
 */
const RENDER_AHEAD = 5;

/**
 * Blocks per fill pass, and the gap between passes.
 *
 * Deliberately small and unhurried: everything left to fill after the first render is below the
 * fold, so the only thing that matters about it is that no single pass costs a frame. A list being
 * scrolled hard overrides both and fills as fast as it can.
 */
const FILL_BLOCKS = 4;
const FILL_PERIOD_MS = 100;

export function ArticleRenderer({
  document,
  crossing = false,
  onReachedEnd,
}: {
  document: ArticleDocument;
  /**
   * Whether the article is passing across the screen rather than being read.
   *
   * A crossing article renders what fits and nothing beyond it. It is on screen for a few hundred
   * milliseconds and cannot be scrolled, so filling in the rest would only be work competing with
   * the animation carrying it — it fills once it lands.
   */
  crossing?: boolean;
  /**
   * Called when the reader has the end of the article in view.
   *
   * Two paths lead here, deliberately. The scroll handler covers an article long enough to scroll,
   * once `END_SLACK` or less of it is left below the fold; the height comparison below covers one
   * that never scrolls, which would otherwise never report itself read at all. Callers must
   * tolerate being called more than once — the scroll path fires on every frame past the mark.
   */
  onReachedEnd?: () => void;
}) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const list = useRef<FlatList<RenderBlock>>(null);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  /**
   * Whether the reader has moved at all.
   *
   * A list that has never been scrolled can still measure as being at its end: only a screenful of
   * blocks is mounted at first, so a long article whose opening blocks are short looks, for a
   * moment, like one that ends there. A read that ends where it began is the fits-on-screen case
   * below, and that one waits before believing itself.
   */
  const scrolled = useRef(false);

  useEffect(() => {
    if (!onReachedEnd) return;
    if (viewportHeight === 0 || contentHeight === 0) return;
    if (contentHeight > viewportHeight) return;

    const timer = setTimeout(onReachedEnd, SHORT_ARTICLE_MS);

    return () => clearTimeout(timer);
  }, [contentHeight, viewportHeight, onReachedEnd]);

  const handleLink = (link: Link) => {
    switch (link.kind) {
      case 'article':
        router.push({ pathname: '/article/[slug]', params: { slug: link.slug } });
        break;
      case 'screen':
        router.push(link.href as Href);
        break;
      case 'url':
        void openBrowserAsync(link.url);
        break;
      case 'footnote':
        // Footnotes render as one footer list; the id names which note, but
        // v1 just brings the reader to them.
        list.current?.scrollToEnd({ animated: true });
        break;
    }
  };

  return (
    <ArticleLinkProvider value={handleLink}>
      <FlatList
        ref={list}
        data={document.blocks}
        keyExtractor={(_, index) => `block-${index}`}
        renderItem={({ item }) => <BlockView block={item} />}
        ListHeaderComponent={<Header document={document} />}
        ListFooterComponent={<Footnotes document={document} />}
        showsVerticalScrollIndicator={false}
        windowSize={crossing ? 1 : RENDER_AHEAD}
        maxToRenderPerBatch={FILL_BLOCKS}
        updateCellsBatchingPeriod={FILL_PERIOD_MS}
        onLayout={(event) => setViewportHeight(event.nativeEvent.layout.height)}
        onContentSizeChange={(_, height) => setContentHeight(height)}
        onScroll={(event) => {
          const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
          if (contentOffset.y > 0) scrolled.current = true;
          if (!scrolled.current) return;

          const remaining = contentSize.height - (contentOffset.y + layoutMeasurement.height);
          if (remaining <= END_SLACK) onReachedEnd?.();
        }}
        scrollEventThrottle={100}
        contentContainerStyle={{ paddingBottom: insets.bottom + 48 }}
      />
    </ArticleLinkProvider>
  );
}
