import { View } from 'react-native';

import type { RenderBlock } from '@/lib/articles';

import { CalloutBlock } from './CalloutBlock';
import { DividerBlock } from './DividerBlock';
import { HeadingBlock } from './HeadingBlock';
import { ImageBlock } from './ImageBlock';
import { ListBlock } from './ListBlock';
import { LiveBlockView } from './LiveBlockView';
import { ParagraphBlock } from './ParagraphBlock';
import { QuoteBlock } from './QuoteBlock';
import { TableBlock } from './TableBlock';
import { UnknownContentCard } from './UnknownContentCard';

// One block of an article. Each block owns its top margin (the space to the
// block above), so the vertical rhythm lives with the block styles.

function body(block: RenderBlock) {
  switch (block.type) {
    case 'heading':
      return <HeadingBlock block={block} />;
    case 'paragraph':
      return <ParagraphBlock block={block} />;
    case 'list':
      return <ListBlock block={block} />;
    case 'callout':
      return <CalloutBlock block={block} />;
    case 'quote':
      return <QuoteBlock block={block} />;
    case 'divider':
      return <DividerBlock />;
    case 'image':
      return <ImageBlock block={block} />;
    case 'table':
      return <TableBlock block={block} />;
    case 'live':
      return <LiveBlockView block={block} />;
    case 'unknown':
      return <UnknownContentCard />;
  }
}

export function BlockView({ block }: { block: RenderBlock }) {
  return <View className="px-[18px]">{body(block)}</View>;
}
