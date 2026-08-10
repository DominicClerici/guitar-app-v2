import { Component, type ReactNode } from 'react';

import type { LiveBlock } from '@/lib/articles';

import { LIVE_COMPONENTS } from '../registry';
import { UnknownContentCard } from './UnknownContentCard';

// A live component runs arbitrary logic against author-supplied props, so a
// crash in one must degrade to the fallback card, not take the article down.
class LiveBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? <UnknownContentCard /> : this.props.children;
  }
}

export function LiveBlockView({ block }: { block: LiveBlock }) {
  const entry = LIVE_COMPONENTS[block.component];
  if (!entry) return <UnknownContentCard />;

  const props = entry.parse(block.props);
  if (!props) return <UnknownContentCard />;

  return (
    <LiveBoundary>
      <entry.Component {...props} />
    </LiveBoundary>
  );
}
