import type { ParagraphBlock as ParagraphBlockData } from '@/lib/content';

import { RichText } from '../RichText';

export function ParagraphBlock({ block }: { block: ParagraphBlockData }) {
  return (
    <RichText spans={block.spans} className="mt-[14px] text-[15px] leading-[24px] text-ink-muted" />
  );
}
