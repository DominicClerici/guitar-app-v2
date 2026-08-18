import { useLayoutEffect } from 'react';
import { Uniwind } from 'uniwind';

import { usePreference } from '@/lib/preferences';

import { paletteVariables } from './variables';

/**
 * Holds the stored colour vision mode against the Aurora tokens.
 *
 * Renders nothing, for the reason `MotionConfig` renders nothing: it exists to own the
 * subscription. `usePreference` wakes its caller only when the value it names changes, so this
 * re-renders on a colour vision change and on nothing else — retuning the guitar does not touch
 * it. What re-renders the app is the notify inside `updateCSSVariables`, which is the point.
 *
 * Written to every registered theme rather than the current one. Uniwind keeps a variable bag per
 * theme and follows the system appearance between them; writing only the current bag would work
 * until the user's phone crossed into dark mode at sunset and quietly handed back the palette they
 * had turned off.
 *
 * In a layout effect because the notify is a synchronous re-render of every subscriber, which is
 * not something to start during a render pass. It also lands before paint, so a cold start on a
 * mode other than `normal` never shows a frame of the palette the user does not use.
 */
export function ColorVisionConfig() {
  const mode = usePreference('colorVision');

  useLayoutEffect(() => {
    const variables = paletteVariables(mode);

    for (const theme of Uniwind.themes) {
      Uniwind.updateCSSVariables(theme, variables);
    }
  }, [mode]);

  return null;
}
