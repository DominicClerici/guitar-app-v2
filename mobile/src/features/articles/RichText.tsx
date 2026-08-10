import { Text } from 'react-native';

import type { Mark, Span } from '@/lib/content';

import { useArticleLink } from './links';

// Span[] → nested <Text>. Every text-bearing block renders through here, so
// marks and links behave identically everywhere. The parent sets the base type
// style via className; marks layer on top of it.

const TONE_CLASS = {
  accent: 'text-accent',
  amber: 'text-amber',
  rose: 'text-rose',
  violet: 'text-violet',
} as const;

function markClasses(marks: Mark[] | undefined): string {
  if (!marks) return '';

  let classes = '';
  for (const mark of marks) {
    if (mark === 'bold') classes += ' font-semibold text-ink';
    else if (mark === 'italic') classes += ' italic';
    else if (mark === 'code') classes += ' font-mono text-[13px] text-ink bg-surface-raised';
    else if (mark === 'highlight') classes += ' bg-accent-wash text-ink';
    else classes += ` ${TONE_CLASS[mark.tone]}`;
  }
  return classes;
}

export function RichText({ spans, className = '' }: { spans: Span[]; className?: string }) {
  const onLink = useArticleLink();

  return (
    <Text className={className}>
      {spans.map((span, index) => {
        const link = span.link;
        return (
          <Text
            key={index}
            className={`${markClasses(span.marks)}${link ? ' text-accent' : ''}`}
            onPress={link ? () => onLink(link) : undefined}
            suppressHighlighting={!link}
          >
            {span.text}
          </Text>
        );
      })}
    </Text>
  );
}
