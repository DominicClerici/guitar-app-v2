# Design System — “Aurora”

The visual language for this app. Read this before implementing or changing any UI,
and keep it current: when a new screen introduces a pattern worth reusing, add it here.

Aurora is a **dark, machined instrument lit in colour**. Surfaces are cool graphite and
stay quiet; a single aqua accent drives every action; a small set of luminous jewel hues
carries *meaning*, never decoration. It should read like a precision device — considered,
restrained, warm where it counts — not like a generic dashboard.

---

## Vibe

- **Dark and quiet.** Cool near-black surfaces. Contrast comes from type and one accent,
  not from bright panels.
- **Machined depth.** Cards feel milled from metal via nested bevels — a top highlight
  edge, a darker bottom edge, and a soft drop shadow. Hero elements use a *double bezel*
  (an outer tray wrapping an inner face).
- **Colour = information.** Aqua is the one primary and owns all actions. The jewel hues
  (aqua / amber / rose / violet) are each bound to a concept (e.g. a musical key), so a
  screen is legible at a glance before a word is read. Never add a hue as ornament.
- **Restraint on glow.** Almost nothing glows. Reserve luminescence (a soft accent
  `box-shadow`) for a single focal signal per screen — e.g. the tuner’s in-tune centre.
- **No gradients.** This is React Native. Depth is built from per-side border colours +
  `box-shadow`, never CSS gradients.

---

## Colour

Tokens live in `src/global.css` under `:root`. Reference them as `var(--token)` — never
hardcode hex in components.

### Surfaces & structure
| Token | Value | Use |
| --- | --- | --- |
| `--bg` | `#0c0d10` | App background (cool near-black) |
| `--tray` | `#131418` | Outer machined tray (double-bezel wrapper) |
| `--surface` | `#181a1f` | Default card / panel face |
| `--surface-raised` | `#20232a` | Raised chips, ghost buttons |
| `--edge-top` | `rgba(255,255,255,.08)` | Bevel highlight (top border) |
| `--edge-bottom` | `rgba(0,0,0,.52)` | Bevel shadow (bottom border) |
| `--line` | `#2a2e36` | Hairline dividers, tick marks |
| `--line-soft` | `#23262d` | Softer hairline / side borders |

### Ink
| Token | Value | Use |
| --- | --- | --- |
| `--ink` | `#eef0f4` | Primary text (cool white) |
| `--ink-muted` | `#9aa0aa` | Secondary text |
| `--ink-faint` | `#62666e` | Captions, labels, tick baselines |

### Accent (the one primary — aqua)
| Token | Value | Use |
| --- | --- | --- |
| `--accent` | `#5ec8c2` | Primary actions, active states |
| `--accent-bright` | `#86e0da` | Accent hover / emphasis |
| `--accent-wash` | `rgba(94,200,194,.12)` | Tinted accent fills |
| `--on-accent` | `#04211f` | Text/icons *on* an accent fill |

### Key-coded jewel hues
Bind each to a concept, not a mood. Today: musical key.
| Token | Value |
| --- | --- |
| `--aqua` | `#5ec8c2` |
| `--amber` | `#e0a84e` |
| `--rose` | `#e0788f` |
| `--violet` | `#9b8cf0` |

---

## Typography

Two families, each with a job:

- **Grotesk (system sans) — titles & numerics.** Weights 500–700. Apply **negative
  letter-spacing** as size grows (`-0.5px` at ~30px, up to `-1.8px` at display sizes).
  Used for brand, screen/card titles, big readouts.
- **Monospace (`ui-monospace`) — every reading & label.** Times, tempo, cents, indices,
  eyebrows, section titles, captions. Usually **uppercase with positive tracking**
  (`+1px` to `+3px`). This is what makes the UI read like an instrument.

### Type scale (reference)
| Role | Size / line | Family | Tracking | Notes |
| --- | --- | --- | --- | --- |
| Display | 52 / 54 | grotesk 700 | `-1.8px` | Rare, specimen-scale |
| Brand / hero title | 32–34 / 35–36 | grotesk 600 | `-0.8` to `-1px` | |
| Big readout (numeric) | 34 | mono 500 | `+0.5px` | Time, primary metric |
| Note / stat number | 26–30 | grotesk/mono | `-0.5px` | |
| Body | 13.5–14 / 20–22 | grotesk | — | Muted for support copy |
| Slot / list title | 16 | grotesk 500 | `-0.2px` | |
| Primary button | 15 | grotesk 700 | `+0.3px` | |
| Section title | 12 | mono 600 UPPER | `+2.5px` | |
| Metadata / cents | 10.5–13 | mono | `+0.5` to `+1px` | |
| Eyebrow / device label | 10–10.5 | mono 600 UPPER | `+2.5` to `+3px` | `--accent` or `--ink-faint` |
| Micro label / caption | 9–9.5 | mono UPPER | `+1` to `+1.5px` | `--ink-faint` |

Font-family tokens (`--font-display`, `--font-mono`, …) are defined in `global.css`.

---

## Spacing & rhythm

Base unit **4px**. The app’s `Spacing` scale (`src/constants/theme.ts`) is the source for
layout gaps: `half 2 · one 4 · two 8 · three 16 · four 24 · five 32 · six 64`.

Aurora conventions:
- **Screen padding:** ~22px horizontal, plus safe-area top.
- **Card padding:** 22–24px for heroes/panels, 15–16px for tiles/list rows.
- **Element gaps:** 12px between peer controls/tiles.
- **Section rhythm:** ~34px between major sections; ~14px between a section head and its body.

## Radius
| Role | Radius |
| --- | --- |
| Outer tray (double bezel) | 18 |
| Card / panel face | 13 |
| Control (button, input) | 10 |
| Tile / list row | 11 |
| Small chip / swatch | 6–8 |

## Elevation & the bevel recipe

Depth is always built the same way — **per-side borders + shadow**, no gradients:

- **Highlight** the top edge with `--edge-top`, **shadow** the bottom edge with
  `--edge-bottom`, and use `--line-soft` for the sides.
- Add a soft `box-shadow` for lift (heroes: `0 24px 48px rgba(0,0,0,.55)`).
- **Double bezel** for the primary hero: an outer `--tray` (padded ~6px, full bevel +
  shadow) wrapping an inner `--surface` face (top-highlight border only).
- **Glow** is a coloured `box-shadow` (e.g. `0 0 8px rgba(94,200,194,.65)`) reserved for
  the single focal signal on a screen.

## Iconography

Use `expo-symbols` `SymbolView` (SF Symbols). Tint with a token: `--on-accent` on accent
fills, `--ink-muted` on ghost controls.

---

## Extending this system

This document grows with the app. When you add a screen:

1. **Reuse tokens first.** If you reach for a raw hex or a one-off size, either map it to
   an existing token or add a new token here with a clear rationale.
2. **Keep colour meaningful.** A new hue must encode information, not taste.
3. **Match the depth recipe** rather than inventing new shadow/border treatments.
4. **Document new patterns** (a new component archetype, a new interaction) in a section
   below so the next screen stays coherent.
