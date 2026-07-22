/**
 * Single on/off switch for the disposable design-lab route group.
 * Flip to `false` to instantly restore the app's normal entry point and tab bar
 * without deleting anything. To remove the feature entirely: delete this
 * `(lab)` folder, the `@import` line in `src/global.css`, and the 3 blocks
 * elsewhere gated on `DESIGN_LAB_MODE` (`src/app/index.tsx`, `src/app/_layout.tsx`).
 */
export const DESIGN_LAB_MODE = true;
