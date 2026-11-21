/** Checks every button fg/bg pair across all brand × mode × state combos. */
import { blue, emerald, orange, slate, stone, violet, citadel } from '../src/tokens/palettes';
import type { ColorScale } from '../src/tokens/contract.css';

const lum = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a: string, b: string) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

const brands: Record<string, [ColorScale, ColorScale, ColorScale]> = {
  // brandA: [blue, violet, slate],
  brandA: [citadel.ultramarinesBlue.scale, citadel.lichePurple.scale, citadel.graveyardEarth.scale ],
  brandB: [emerald, orange, stone],
};

let failed = false;
for (const [brand, [p, s, n]] of Object.entries(brands)) {
  for (const [name, hue] of [['primary', p], ['secondary', s]] as const) {
    const checks: [string, string, string, number][] = [
      ['light rest', hue[700], n[50], 4.5], ['light hover', hue[800], n[50], 4.5], ['light active', hue[900], n[50], 4.5],
      ['dark rest', hue[300], hue[950], 4.5], ['dark hover', hue[200], hue[950], 4.5], ['dark active', hue[100], hue[950], 4.5],
    ];
    for (const [label, bg, fg, min] of checks) {
      const r = ratio(bg, fg);
      if (r < min) failed = true;
      console.log(`${r >= min ? 'PASS' : 'FAIL'} ${brand} ${name} ${label}: ${r.toFixed(2)}:1`);
    }
  }
  // Focus ring vs page surface (WCAG 1.4.11 needs 3:1)
  for (const [label, ring, surf] of [['light', p[700], n[50]], ['dark', p[300], n[950]]] as const) {
    const r = ratio(ring, surf);
    if (r < 3) failed = true;
    console.log(`${r >= 3 ? 'PASS' : 'FAIL'} ${brand} focus ring ${label}: ${r.toFixed(2)}:1`);
  }
}
process.exit(failed ? 1 : 0);
