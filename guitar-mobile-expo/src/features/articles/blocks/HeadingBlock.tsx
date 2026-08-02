import type { HeadingBlock as HeadingBlockData } from '@/lib/articles';

import { RichText } from '../RichText';

// Three levels: a section, a subsection, and the small mono label the rest of
// the app uses to open a set of things (see SectionLabel in ToolsTab).
const LEVEL_CLASS = {
  1: 'mt-[30px] text-[21px] font-semibold tracking-[-0.3px] text-ink',
  2: 'mt-[24px] text-[17px] font-semibold tracking-[-0.2px] text-ink',
  3: 'mt-[22px] font-mono text-[10.5px] font-semibold uppercase tracking-[2.2px] text-ink-faint',
} as const;

export function HeadingBlock({ block }: { block: HeadingBlockData }) {
  return <RichText spans={block.spans} className={LEVEL_CLASS[block.level]} />;
}
