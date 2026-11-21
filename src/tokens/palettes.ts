import type { ColorScale } from './contract.css';

/**
 * PRIMITIVE TOKENS
 * ----------------
 * Raw 50–950 scales. These are plain data (not .css.ts) so they can be shared
 * with docs, tests, or a Figma sync script.
 */

export const blue: ColorScale = {
  50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd', 400: '#60a5fa',
  500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8', 800: '#1e40af', 900: '#1e3a8a', 950: '#172554',
};

export const violet: ColorScale = {
  50: '#f5f3ff', 100: '#ede9fe', 200: '#ddd6fe', 300: '#c4b5fd', 400: '#a78bfa',
  500: '#8b5cf6', 600: '#7c3aed', 700: '#6d28d9', 800: '#5b21b6', 900: '#4c1d95', 950: '#2e1065',
};

export const slate: ColorScale = {
  50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1', 400: '#94a3b8',
  500: '#64748b', 600: '#475569', 700: '#334155', 800: '#1e293b', 900: '#0f172a', 950: '#020617',
};

export const emerald: ColorScale = {
  50: '#ecfdf5', 100: '#d1fae5', 200: '#a7f3d0', 300: '#6ee7b7', 400: '#34d399',
  500: '#10b981', 600: '#059669', 700: '#047857', 800: '#065f46', 900: '#064e3b', 950: '#022c22',
};

export const orange: ColorScale = {
  50: '#fff7ed', 100: '#ffedd5', 200: '#fed7aa', 300: '#fdba74', 400: '#fb923c',
  500: '#f97316', 600: '#ea580c', 700: '#c2410c', 800: '#9a3412', 900: '#7c2d12', 950: '#431407',
};

export const stone: ColorScale = {
  50: '#fafaf9', 100: '#f5f5f4', 200: '#e7e5e4', 300: '#d6d3d1', 400: '#a8a29e',
  500: '#78716c', 600: '#57534e', 700: '#44403c', 800: '#292524', 900: '#1c1917', 950: '#0c0a09',
};
/**
 * Simple hex parser to RGB channels
 */
function hexToRgb(hex) {
  const cleanHex = hex.replace('#', '');
  const num = parseInt(cleanHex, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

/**
 * Standard RGB to HSL conversion for broad environment support
 */
function rgbToHsl({ r, g, b }) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

/**
 * Main function: Generates a full 50-950 scale from any hex code,
 * dynamically re-anchoring extreme near-white or near-black inputs.
 */
function generateAdaptiveScale(inputHex) {
  const rgb = hexToRgb(inputHex);
  const { h, s, l } = rgbToHsl(rgb);

  // 1. Target lightness anchors for a standard 50-950 scale
  const targetLightness = {
    50: 97, 100: 92, 200: 84, 300: 74, 400: 63,
    500: 50, 600: 40, 700: 29, 800: 18, 900: 10, 950: 5
  };

  // 2. Identify the closest natural numeric step for our input color
  let assignedStep = 500;
  let minDiff = Infinity;
  for (const [step, lightness] of Object.entries(targetLightness)) {
    const diff = Math.abs(l - lightness);
    if (diff < minDiff) {
      minDiff = diff;
      assignedStep = parseInt(step);
    }
  }

  const scale = {};

  // 3. Interpolate the scale steps dynamically
  Object.keys(targetLightness).forEach((stepStr) => {
    const currentStep = parseInt(stepStr);

    if (currentStep === assignedStep) {
      // Keep exact match original input unchanged
      scale[currentStep] = inputHex.toUpperCase();
    } else {
      // Calculate how far away this step is from our anchor step
      const stepDiff = currentStep - assignedStep;

      // Linearly interpolate lightness toward its respective target
      let targetL = targetLightness[currentStep];

      // Control saturation rules for extreme scales
      let finalS = s;
      if (l > 93) {
        // If input is near-white, inject subtle saturation context descending into darks
        finalS = currentStep > 300 ? Math.max(s, 12) : s;
      } else if (l < 10) {
        // If input is near-black, lift saturation for mid-tones so they don't look completely gray
        finalS = currentStep > 100 && currentStep < 800 ? Math.max(s, 15) : s;
      } else {
        // Standard extreme tint protection: Desaturate extremes slightly
        if (currentStep <= 100) finalS = Math.min(s, 35);
        if (currentStep >= 900) finalS = Math.min(s, 45);
      }

      scale[currentStep] = `hsl(${h}deg ${finalS}% ${targetL}%)`;
    }
  });

  return {
    meta: { inputHex, inferredAnchor: assignedStep, rawHsl: { h, s, l } },
    scale
  };
}

// --- Example Verification ---
console.log(generateAdaptiveScale("#F8FAFC")); // Near-White: Infers anchor step 50
console.log(generateAdaptiveScale("#0F172A")); // Near-Black: Infers anchor step 900
console.log(generateAdaptiveScale("#2563EB")); // Standard Mid: Infers anchor step 500

