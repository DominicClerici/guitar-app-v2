import { useLayoutEffect } from 'react';

import { usePreference } from '@/lib/preferences';

import { requestTheme } from './switch';

/**
 * Holds the stored appearance against uniwind. Renders nothing.
 *
 * A component of its own for the reason `MotionConfig` and `ColorVisionConfig` are: it exists to
 * own the subscription. `usePreference` wakes its caller only when the value it names changes, so
 * a tuning being altered does not reach this, and what re-renders the app is uniwind's own notify
 * rather than anything React does with this component.
 *
 * It reports the change rather than applying it, because the two are not the same moment. Pressing
 * the control starts a switch that photographs the screen first and applies the theme behind the
 * photograph a beat later (`switch.ts`); every other way the value can change — the first read at
 * launch, a pull from another device — has nothing to hide behind and is applied where this says
 * so. Which of the two happened is decided there, in one place, rather than guessed at here.
 *
 * In a layout effect because uniwind's notify is a synchronous re-render of every styled component
 * in the app, which is not something to set off during a render pass. It also lands before paint,
 * so a cold start on a stored theme reaches the first frame the user sees.
 */
export function ThemeConfig() {
  const theme = usePreference('theme');

  useLayoutEffect(() => {
    requestTheme(theme);
  }, [theme]);

  return null;
}
