import type { ComponentType } from 'react';
import type { ZodType } from 'zod';

import { ScaleCompare, scaleComparePropsSchema } from './live/ScaleCompare';

// The live component registry — the ONE file to touch when adding a new kind
// of interactive article content (besides the component itself). A `live`
// block names a component here; anything unregistered, or with props its
// schema rejects, renders the "update the app" fallback instead of crashing.
// See docs/articles.md for the full checklist.

export interface LiveComponentEntry {
  /** Validate raw block props. Null means "can't render — show the fallback". */
  parse(props: unknown): object | null;
  Component: ComponentType<object>;
}

function define<P extends object>(
  schema: ZodType<P>,
  Component: ComponentType<P>,
): LiveComponentEntry {
  return {
    parse: (props) => {
      const result = schema.safeParse(props);
      return result.success ? result.data : null;
    },
    Component: Component as ComponentType<object>,
  };
}

export const LIVE_COMPONENTS: Record<string, LiveComponentEntry> = {
  'scale-compare': define(scaleComparePropsSchema, ScaleCompare),
};
