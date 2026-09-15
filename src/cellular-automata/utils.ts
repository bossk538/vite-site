/**
 * Generates an array of `count` balanced, visually distinct colors.
 * Uses evenly spaced hues on the color wheel with randomized
 * saturation/lightness (within pleasant ranges) so colors look
 * cohesive but not identical.
 *
 * @param {number} count - number of colors to generate
 * @param {object} [options]
 * @param {number} [options.saturation=[60,80]] - [min,max] saturation %
 * @param {number} [options.lightness=[45,65]] - [min,max] lightness %
 * @param {string} [options.format='hsl'] - 'hsl' or 'hex'
 * @returns {string[]} array of color strings
 */
export function generateBalancedColors(count, options = {}) {
  const {
    saturation = [60, 80],
    lightness = [45, 65],
    format = 'hsl',
  } = options;

  const randBetween = (min, max) => Math.random() * (max - min) + min;

  // Slight random rotation so repeated calls don't always start at red
  const hueOffset = Math.random() * 360;
  const hueStep = 360 / count;

  const colors = [];

  for (let i = 0; i < count; i++) {
    // Evenly spaced hue + small jitter to avoid overly mechanical spacing
    const jitter = randBetween(-hueStep * 0.15, hueStep * 0.15);
    const hue = (hueOffset + hueStep * i + jitter + 360) % 360;

    const s = randBetween(saturation[0], saturation[1]);
    const l = randBetween(lightness[0], lightness[1]);

    if (format === 'hex') {
      colors.push(hslToHex(hue, s, l));
    } else {
      colors.push(`hsl(${hue.toFixed(1)}, ${s.toFixed(0)}%, ${l.toFixed(0)}%)`);
    }
  }

  return colors;
}

// Helper: convert HSL to hex string
function hslToHex(h, s, l) {
  s /= 100;
  l /= 100;
  const k = n => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = n =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const toHex = x => Math.round(x * 255).toString(16).padStart(2, '0');
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
}
