import type { JewelHue } from '@/lib/scale-library';

// The jewel hues as utility classes. Tailwind classes have to be static strings,
// so a hue chosen at runtime has to come out of a lookup rather than a template.

export const HUE_TEXT: Record<JewelHue, string> = {
  amber: 'text-amber',
  rose: 'text-rose',
  violet: 'text-violet',
};

export const HUE_BORDER: Record<JewelHue, string> = {
  amber: 'border-amber',
  rose: 'border-rose',
  violet: 'border-violet',
};
