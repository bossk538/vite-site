import { keyframes, style } from '@vanilla-extract/css';
import { recipe, type RecipeVariants } from '@vanilla-extract/recipes';
import { vars } from '../tokens/contract.css';

/**
 * Component styles read ONLY from the contract (`vars`), never from palettes,
 * so the same CSS works under every brand and mode.
 */

const enabled = '&:not([disabled]):not([aria-disabled="true"])';

const intentStyles = (intent: 'primary' | 'secondary') => {
  const t = vars.color.action[intent];
  return {
    backgroundColor: t.bg,
    color: t.fg,
    selectors: {
      [`${enabled}:hover`]: { backgroundColor: t.bgHover },
      [`${enabled}:active`]: { backgroundColor: t.bgActive },
    },
  };
};

const sizeStyles = (size: 'small' | 'medium' | 'large') => ({
  minHeight: vars.dimension.controlHeight[size],
  paddingInline: vars.dimension.paddingInline[size],
  gap: vars.dimension.gap[size],
  fontSize: vars.font.size[size],
});

export const button = recipe({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
    margin: 0,
    fontFamily: vars.font.family.body,
    fontWeight: vars.font.weight.button,
    lineHeight: vars.font.lineHeight.tight,
    textDecoration: 'none',
    whiteSpace: 'nowrap',
    borderRadius: vars.dimension.radius.control,
    // Transparent border becomes visible in Windows High Contrast mode.
    border: `${vars.dimension.borderWidth} solid transparent`,
    cursor: 'pointer',
    userSelect: 'none',
    transition: 'background-color 120ms ease, box-shadow 120ms ease',

    selectors: {
      // Keyboard focus only; mouse clicks don't show the ring.
      '&:focus-visible': {
        outline: `${vars.dimension.focusRingWidth} solid ${vars.color.focusRing}`,
        outlineOffset: vars.dimension.focusRingOffset,
      },
      '&[disabled], &[aria-disabled="true"]': {
        backgroundColor: vars.color.action.disabled.bg,
        color: vars.color.action.disabled.fg,
        cursor: 'not-allowed',
      },
      // Loading keeps intent colours but signals the wait.
      '&[aria-busy="true"]': { cursor: 'progress' },
    },

    '@media': {
      '(prefers-reduced-motion: reduce)': { transition: 'none' },
      '(forced-colors: active)': {
        borderColor: 'ButtonText',
        selectors: {
          '&[disabled], &[aria-disabled="true"]': { borderColor: 'GrayText', color: 'GrayText' },
        },
      },
    },
  },

  variants: {
    intent: {
      primary: intentStyles('primary'),
      secondary: intentStyles('secondary'),
    },
    size: {
      small: sizeStyles('small'),
      medium: sizeStyles('medium'),
      large: sizeStyles('large'),
    },
    fullWidth: {
      true: { width: '100%' },
    },
  },

  defaultVariants: {
    intent: 'primary',
    size: 'medium',
    fullWidth: false,
  },
});

export type ButtonVariants = NonNullable<RecipeVariants<typeof button>>;

/* ---- Slots ---- */

export const icon = recipe({
  base: { display: 'inline-flex', flexShrink: 0 },
  variants: {
    size: {
      small: { width: vars.dimension.iconSize.small, height: vars.dimension.iconSize.small },
      medium: { width: vars.dimension.iconSize.medium, height: vars.dimension.iconSize.medium },
      large: { width: vars.dimension.iconSize.large, height: vars.dimension.iconSize.large },
    },
  },
  defaultVariants: { size: 'medium' },
});

// Hidden visually, still read by screen readers.
export const visuallyHidden = style({
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
  border: 0,
});

const spin = keyframes({ to: { transform: 'rotate(360deg)' } });

export const spinner = style({
  width: '1em',
  height: '1em',
  borderRadius: '50%',
  border: '2px solid currentColor',
  borderRightColor: 'transparent',
  animation: `${spin} 700ms linear infinite`,
  '@media': {
    '(prefers-reduced-motion: reduce)': { animationDuration: '2s' },
  },
});
