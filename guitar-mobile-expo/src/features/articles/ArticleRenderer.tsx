import { useRouter, type Href } from 'expo-router';
import { openBrowserAsync } from 'expo-web-browser';
import { useRef } from 'react';
import { FlatList, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { ArticleDocument, Link, RenderBlock } from '@/lib/articles';

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

export function ArticleRenderer({ document }: { document: ArticleDocument }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const list = useRef<FlatList<RenderBlock>>(null);

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
        contentContainerStyle={{ paddingBottom: insets.bottom + 48 }}
      />
    </ArticleLinkProvider>
  );
}
