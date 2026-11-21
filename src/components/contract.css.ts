import { createThemeContract } from '@vanilla-extract/css';

/**
 * DESIGN CONTRACT
 * ----------------
 * The contract is the *shape* of the design system: every token name exists
 * here, but no values. Components only ever read from `vars`, and every theme
 * (brand × mode) must supply a value for every leaf — TypeScript rejects a
 * theme that misses one. This is what lets us swap brands and modes without
 * touching component code.
 */

// A 50–950 colour scale. `null` marks a leaf that themes must fill in.
const scale = {
  50: null,
  100: null,
  200: null,
  300: null,
  400: null,
  500: null,
  600: null,
  700: null,
  800: null,
  900: null,
  950: null,
} as const;

// Everything an interactive "intent" needs in each state.
const intent = {
  bg: null,
  bgHover: null,
  bgActive: null,
  fg: null,
} as const;

const sizes = { small: null, medium: null, large: null } as const;

export const vars = createThemeContract({
  color: {
    // Primitive (brand) tokens — the raw palettes.
    primary: scale,
    secondary: scale,
    neutral: scale,

    // Semantic tokens — what the palette *means*; these change per mode.
    surface: null,
    text: null,
    focusRing: null,
    action: {
      primary: intent,
      secondary: intent,
      disabled: { bg: null, fg: null },
    },
  },

  font: {
    family: { body: null },
    weight: { regular: null, button: null },
    size: sizes,
    lineHeight: { tight: null, normal: null },
  },

  dimension: {
    space: { xs: null, sm: null, md: null, lg: null, xl: null },
    radius: { control: null },
    borderWidth: null,
    focusRingWidth: null,
    focusRingOffset: null,
    // Component-level dimension tokens, keyed by the Button `size` prop.
    controlHeight: sizes,
    paddingInline: sizes,
    gap: sizes,
    iconSize: sizes,
  },
});

export type ColorScale = Record<keyof typeof scale, string>;
