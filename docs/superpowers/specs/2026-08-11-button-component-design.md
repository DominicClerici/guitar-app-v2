# Button — a variant-driven pressable on the native squircle

**Date:** 2026-08-11
**Status:** approved, ready for planning

## Problem

The app has roughly forty labeled and icon-only pressables, and no two of them agree. A 50px
primary CTA is `rounded-[10px]` in `PathwayActions` and `rounded-[13px]` in `ActivitySummary`.
Half the accent buttons carry the bevel border and half paint a flat `bg-accent`. Press feedback
is `opacity-80`, `70`, `60` or `55` depending on who wrote the file. Every call site that shows an
SF Symbol resolves its own tint through `useToken`.

`SquirclePressable` (`src/components/Squircle.tsx`) now paints Apple's continuous corner from a
native layer, which is correct on the first frame and through a resize. It is the right base for
every button in the app, but using it directly means each call site restates the fill, the stroke,
the radius, the height, the label typography and the symbol tint.

This spec defines `Button`: one component that owns those decisions, in the spirit of shadcn's
variant/size API, built on `SquirclePressable`.

## Scope

**In:** labeled buttons and square icon-only buttons. `Button` subsumes what `IconAction` and
`AuthButton` do, though only `PathwayActions` is migrated in this piece of work (see Migration).

**Out:** chips, toggles, segmented controls and selectable option cards. They carry selection
semantics and bespoke layout, and forcing them through a button API would bloat it. `CornerFace`
stays exactly as it is — cards, trays and the corner-style A/B still need it.

**Out:** `TransportButton`. It is a 78px circle, off the size scale, and has one call site.

## The bevel goes

Aurora's raised look comes from a border that runs `rgba(255,255,255,0.06)` on top, `--line-soft`
down the sides and `rgba(0,0,0,0.52)` underneath — a vertical gradient stroke. `SquircleShape`
strokes a single colour, so that gradient cannot survive the move to the native layer. Extending
the native module with a gradient-stroke prop was considered and rejected: it puts Swift and Kotlin
work in front of a component that is otherwise pure TypeScript.

Each variant therefore carries **one flat hairline**. Every variant declares a stroke at
`strokeWidth: 1`, using `transparent` where no edge should show, so the shape props are uniform
across the table and there is no conditional in the render path.

## Architecture

A single file, `mobile/src/components/Button.tsx`, holding two frozen lookup tables and a thin
render. Rejected alternatives:

- **Reusing `CornerFace`'s `FACES` registry.** `FACES` carries bevel triples and a `circular`
  className fallback that exist to serve the `CornerStyle` toggle. `Button` is always continuous
  and never bevelled, so it would inherit the machinery it exists to shed, and every button-only
  tweak would risk breaking cards.
- **`cva`.** The native layer takes `ColorValue`, not class names. `cva` could own the text and
  layout classes while a parallel table owned fill and stroke — two systems describing one
  variant, which is worse than one table.

Colours reach the native layer as resolved strings. Every token the tables reference lives in one
module-level array passed to `useTokens`, so the component makes a single hook call regardless of
which variant renders. Text colour stays a `className`, per the repo's uniwind-only rule; only the
symbol tint and the two squircle colours are resolved values.

## Variant table

`destructive` is not a red fill anywhere in this app. `AuthButton` and `IconAction` both paint the
raised face and turn only the ink rose, so that is what the variant is.

| variant | fill | stroke | text class | icon tint | press |
| --- | --- | --- | --- | --- | --- |
| `primary` | `--accent` | `rgba(255,255,255,0.16)` | `text-on-accent` | `--on-accent` | 80% |
| `secondary` | `--surface-raised` | `--line-soft` | `text-ink` | `--ink` | 70% |
| `quiet` | `--surface` | `--line-soft` | `text-ink-muted` | `--ink-muted` | 70% |
| `soft` | `--accent-wash` | `--accent-line` | `text-accent` | `--accent` | 70% |
| `ghost` | `transparent` | `transparent` | `text-ink-muted` | `--ink-muted` | 60% |
| `destructive` | `--surface-raised` | `--line-soft` | `text-rose` | `--rose` | 70% |
| _(disabled)_ | `--surface` | `--line-soft` | `text-ink-faint` | `--ink-faint` | none |

The press opacities are the ones already in use, moved from the call site onto the variant.

`primary`'s `rgba(255,255,255,0.16)` stroke is the flat stand-in for the old top highlight. It is
a literal rather than a token because no existing token carries it; if it earns reuse it becomes
`--accent-edge` in `global.css`.

## Size table

| size | height | radius | px | gap | plain label | icon | icon-only |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `sm` | 38 | 10 | 14 | 6 | `text-[13px] font-semibold tracking-[-0.2px]` | 12 | 38×38, icon 15 |
| `md` | 46 | 12 | 16 | 8 | `text-[15px] font-semibold tracking-[-0.2px]` | 13 | 46×46, icon 17 |
| `lg` | 50 | 13 | 18 | 9 | `text-[15px] font-semibold tracking-[-0.2px]` | 13 | 50×50, icon 17 |

Symbols render at `weight="semibold"`.

The mono label is `font-mono text-[10.5px] uppercase tracking-[1.5px]` at **every** size — it is a
micro-label, and the app already uses it at 38px and at 46px unchanged.

Icon-only drops horizontal padding and locks width to height, so the squircle is square.

Heights are fixed rather than padding-derived. Fixed heights are what make an icon-only button a
true square and stop a row's height changing with its label.

## API

```ts
type Variant = 'primary' | 'secondary' | 'quiet' | 'soft' | 'ghost' | 'destructive';
type Size = 'sm' | 'md' | 'lg';

interface Base {
  onPress: () => void;
  variant?: Variant;          // default 'primary'
  size?: Size;                // default 'md'
  text?: 'plain' | 'mono';    // default 'plain'
  icon?: SymbolName;          // leading SF Symbol
  radius?: number | Partial<SquircleCorners>;  // overrides the size default
  disabled?: boolean;
  pending?: boolean;
  className?: string;
}

// An icon-only button has no label to read out, so it must carry one.
type Props = Base &
  ( { children: ReactNode; accessibilityLabel?: string }
  | { children?: undefined; icon: SymbolName; accessibilityLabel: string } );
```

**Children are auto-wrapped.** A `string` or `number` child is wrapped in the `Text` the variant
and size describe. Any other node renders as-is and the call site owns it. `icon` renders before
children in both cases.

**Three independent axes.** `variant`, `size` and `text` do not derive from one another. The app
uses the mono micro-label on a 46px full-width row (`Skip round`) and the sentence label on a 38px
one, so tying label style to either other axis would misdescribe existing usage.

**Not included:** `trailingIcon`, `onLongPress`, `hitSlop`, `style`, and a general `PressableProps`
spread. Nothing in the app needs them, and a `style` passthrough would defeat the point of the
component. They can be added when a real call site asks.

### Usage

```tsx
<Button variant="primary" size="lg" icon="play.fill" className="flex-1" onPress={go}>
  Continue
</Button>

<Button
  icon="ellipsis"
  size="lg"
  variant="secondary"
  accessibilityLabel="More pathway options"
  onPress={onMenu}
/>

<Button variant="secondary" text="mono" onPress={onSkip}>
  Skip round
</Button>
```

## States and behaviour

- **`disabled`** replaces the variant's fill, stroke and ink with the disabled row, blocks press,
  and sets `accessibilityState.disabled`. A disabled button reads as disabled rather than as a
  dimmed copy of itself — and a 45%-opacity accent over near-black goes muddy.
- **`pending`** blocks press and sets `accessibilityState.busy`, but **keeps its variant's face**.
  An accent submit button going grey the moment it is pressed reads as failure. Only `disabled`
  swaps the face; this asymmetry is deliberate.
- **The pending spinner** is an `ActivityIndicator` positioned absolutely at the size's `px` inset
  from the right, tinted with the variant's icon token. Absolute so the label does not shift and
  the button does not change width mid-press — the behaviour `AuthButton` already has.
- **Press feedback** is the variant's `active:opacity-*` on the `Pressable`, which dims the native
  squircle along with its content.
- **Accessibility:** `accessibilityRole="button"` always; label from `accessibilityLabel`, falling
  back to a string child; `accessibilityState` carries `disabled` and `busy`.

### `className` is layout-only

`className` is merged onto the `Pressable` and is documented for layout: flex, width, margins,
`self-*`, positioning. The repo has no `tailwind-merge`, so a call site passing `h-[60px]` against
the size's own height resolves by stylesheet ordering, not by string ordering. That is undefined
behaviour and the component's doc comment says so rather than implying a merge that does not
happen. Anything needing a different height needs a different `size`.

## Migration

Only `PathwayActions` migrates in this piece of work. It exercises `primary`, `secondary`,
icon-only, per-corner radius, `className="flex-1"` and the docked layout — enough to prove the API
against real usage without a forty-file diff.

| Today | Becomes |
| --- | --- |
| `Continue` (`SquirclePressable`, `h-14`) | `<Button variant="primary" size="lg" icon="play.fill" className="flex-1">` |
| `MenuTrigger` (`Pressable` + `useFace('key')`) | `<Button icon="ellipsis" size="lg" variant="secondary">` |
| `Start pathway` (`Pressable`, `PRIMARY` const) | `<Button variant="primary" size="lg" className="flex-1">`, taking the same docked radii as Continue |
| `Pathway complete` | unchanged — a `View`, not a button |
| `capped` notice | unchanged — a `View`, not a button |

`AuthButton`, `IconAction` and the remaining ~35 pressables stay as they are and move
opportunistically. Nothing is deleted in this change.

### Visual drift this introduces

Named up front, because these are visible and intended:

- **Continue and its menu sibling become the same height.** Continue is `h-14` (56px) today while
  `MenuTrigger` beside it is `h-[50px]`. Under `size="lg"` both are 50.
- **Radius converges on 13.** The pathway row is `rounded-[10px]` today.
- **The bevel becomes a hairline** on Continue's accent face and on the menu key.
- **Docked corners recompute.** The outer corner is a semicircle, which at 50px is radius 25 — not
  the 28 currently hardcoded against a 56px button. Docked, Continue is
  `{topLeft: 13, bottomLeft: 13, topRight: 25, bottomRight: 25}` and the menu trigger is its
  mirror, `{topLeft: 25, bottomLeft: 25, topRight: 13, bottomRight: 13}`.
- **`Start pathway`'s bevel goes**, matching Continue.

The `MenuTrigger` glyph keeps its `rotate-90` wrapper as a child node, since `Button` renders
non-string children as-is.

## Verification

- `pnpm lint` in `mobile/` — `tsc --noEmit`, `expo lint`, `vitest run`.
- The discriminated union must reject `<Button icon="x" onPress={f} />` with no
  `accessibilityLabel`, and accept `<Button onPress={f}>Label</Button>`. Worth a type-level
  assertion rather than trusting review.
- No test renders the native squircle — `ExpoSquircleView` needs a device. Correctness of the
  painted shape is confirmed by looking at the pathway screen, not by a test.

## Open questions

None. Every axis was decided during brainstorming; the `--accent-edge` token is the only deferred
item and it is deferred deliberately until a second call site wants it.
