import { createTheme, styleVariants } from '@vanilla-extract/css';
import { vars, type ColorScale } from './contract.css';
import { blue, emerald, orange, slate, stone, violet } from './palettes';

/**
 * THEMES
 * ------
 * A theme = brand (palettes, fonts, dimensions) × mode (how the palette is
 * mapped onto semantic tokens). Each combination fulfils the contract via
 * `createTheme(vars, …)`, which emits a class that sets every CSS variable.
 */

export type Brand = 'brandA' | 'brandB';
export type Mode = 'light' | 'dark';

interface BrandDefinition {
  palette: { primary: ColorScale; secondary: ColorScale; neutral: ColorScale };
  font: { family: string; buttonWeight: string };
  controlRadius: string;
}

const brands: Record<Brand, BrandDefinition> = {
  brandA: {
    palette: { primary: blue, secondary: violet, neutral: slate },
    font: { family: '"Inter", system-ui, sans-serif', buttonWeight: '600' },
    controlRadius: '0.5rem',
  },
  brandB: {
    palette: { primary: emerald, secondary: orange, neutral: stone },
    font: { family: '"IBM Plex Sans", system-ui, sans-serif', buttonWeight: '500' },
    controlRadius: '9999px', // pill-shaped buttons
  },
};

/**
 * Mode mapping: which scale step plays which role.
 * Light: dark fills (700) with near-white text.
 * Dark:  light fills (300) with near-black text from the same hue.
 * All fg/bg pairs here meet WCAG AA (≥ 4.5:1) — see scripts/contrast.ts (npm run contrast).
 */
function semanticColors({ primary, secondary, neutral }: BrandDefinition['palette'], mode: Mode) {
  if (mode === 'light') {
    return {
      surface: neutral[50],
      text: neutral[900],
      focusRing: primary[700],
      action: {
        primary: { bg: primary[700], bgHover: primary[800], bgActive: primary[900], fg: neutral[50] },
        secondary: { bg: secondary[700], bgHover: secondary[800], bgActive: secondary[900], fg: neutral[50] },
        disabled: { bg: neutral[200], fg: neutral[500] },
      },
    };
  }
  return {
    surface: neutral[950],
    text: neutral[50],
    focusRing: primary[300],
    action: {
      primary: { bg: primary[300], bgHover: primary[200], bgActive: primary[100], fg: primary[950] },
      secondary: { bg: secondary[300], bgHover: secondary[200], bgActive: secondary[100], fg: secondary[950] },
      disabled: { bg: neutral[800], fg: neutral[400] },
    },
  };
}

function buildTheme(brand: Brand, mode: Mode) {
  const b = brands[brand];
  // createTheme is type-checked against the contract: omit a token → TS error.
  return createTheme(
    vars,
    {
      color: { ...b.palette, ...semanticColors(b.palette, mode) },
      font: {
        family: { body: b.font.family },
        weight: { regular: '400', button: b.font.buttonWeight },
        size: { small: '0.875rem', medium: '1rem', large: '1.125rem' },
        lineHeight: { tight: '1.25', normal: '1.5' },
      },
      dimension: {
        space: { xs: '0.25rem', sm: '0.5rem', md: '1rem', lg: '1.5rem', xl: '2rem' },
        radius: { control: b.controlRadius },
        borderWidth: '1px',
        focusRingWidth: '2px',
        focusRingOffset: '2px',
        // 32px minimum comfortably exceeds the WCAG 2.2 24×24px target size.
        controlHeight: { small: '2rem', medium: '2.5rem', large: '3rem' },
        paddingInline: { small: '0.75rem', medium: '1rem', large: '1.25rem' },
        gap: { small: '0.375rem', medium: '0.5rem', large: '0.5rem' },
        iconSize: { small: '1rem', medium: '1.125rem', large: '1.25rem' },
      },
    },
    `${brand}-${mode}`, // readable debug id in dev builds
  );
}

export const themes: Record<Brand, Record<Mode, string>> = {
  brandA: { light: buildTheme('brandA', 'light'), dark: buildTheme('brandA', 'dark') },
  brandB: { light: buildTheme('brandB', 'light'), dark: buildTheme('brandB', 'dark') },
};

// Tells the browser to render native UI (scrollbars, form controls) to match.
export const colorScheme = styleVariants({
  light: { colorScheme: 'light' },
  dark: { colorScheme: 'dark' },
});
