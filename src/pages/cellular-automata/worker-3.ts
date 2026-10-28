const gridToImage = () => {
};

const imageToGrid = () => {
};




const rgbDistSquared = (rgb1: RGBArray, rgb2: RGBArray): number => {
  return (rgb1[0] - rgb2[0]) ** 2 + (rgb1[1] - rgb2[1]) ** 2 + (rgb1[2] - rgb2[2]) ** 2;
};

const distSqArr = (colorMap, rgb) => {
  return colorMap.map(hsl => {
    const rgb2 = hsl ? hslToRgb(hsl) : [0, 0, 0];
    return rgbDistSquared(rgb, rgb2);
  });
};

type GridProps = {
  height: number;
  width: number;
  colorMap: HexColor[];
  pixels: RGBArray[][];
};

const hexToRgb = (hex: HexColor): RGBArray => {
  return hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])\$/i, (_, r, g, b) => `#${r}${r}${g}${g}${b}${b}`)
    .replace(/^#/, '')
    .match(/.{2}/g)
    .map(x => parseInt(x, 16));
};

const pixelToColorMap = (r, g, b, a, colorMap) => {
  let minDistance = Infinity;
  let closest = null;
  for (const [index, hex] of Object.entries(colorMap)) {
    const [r0, g0, b0] = hexToRgb(hex);
    const distance = (r - r0) * (r - r0) + (g - g0) * (g - g0) + (b - b0) * (b - b0);
    if (distance < minDistance) {
      minDistance = distance;
      closest = Number(index);
    }
  }
  return closest;
};

const colorMapToPixel = (index, colorMap) => {
  return hexToRgb(colorMap[index]);
};

let canvas = null;
let ctx = null;
let _width = null;
let _height = null;

self.onmessage = (e) => {
  const { action, state, grid, payload, t0, bitmap, colorMap } = e.data;
  console.log(`WORKER3 RECEIVE ${action}`, e.data, state);
  if (action === 'CREATE_BITMAP') {
    try {
      const { width, height } = bitmap;
      _width = width;
      _height = height;

      // Draw the incoming bitmap into an OffscreenCanvas to get at the pixels.
      canvas = new OffscreenCanvas(width, height);
      ctx = canvas.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(bitmap, 0, 0);
      bitmap.close(); // free the original's memory now that we've drawn it

      const imageData = ctx.getImageData(0, 0, width, height);
      ctx.putImageData(imageData, 0, 0);

      // Snapshot the canvas as an ImageBitmap and transfer it back (no copy).
      const result = canvas.transferToImageBitmap();
      self.postMessage({ bitmap: result, t0 }, [result]);
    } catch (err) {
      self.postMessage({ error: err.message, t0 });
    }
  } else if (action === 'CONVERT_BITMAP') {
   if (ctx) {
      const imageData = ctx.getImageData(0, 0, _width, _height);
      const px = imageData.data; // Uint8ClampedArray: R,G,B,A,R,G,B,A,...
      const t0 = performance.now();

      // Luminance-weighted grayscale (Rec. 709).
      for (let i = 0; i < px.length; i += 4) {
        const r = px[i];
        const g = px[i+1];
        const b = px[i+2];
        const a = px[i+3];
        const y = pixelToColorMap(r, g, b, a, colorMap);
        const [r1, g1, b1] = colorMapToPixel(y, colorMap);
        px[i] = r1;
        px[i+1] = g1;
        px[i+2] = b1;
        // ignore i+3

        /*
        const col = (i / 4) % width;
        const row = Math.floor(i/4/width);
        if (col === 10) {
          px[i] = 255;
          px[i+1] = 0;
          px[i+2] = 0;
        } else if (row === 20) {
          px[i] = 0;
          px[i+1] = 255;
          px[i+2] = 0;
        } else {
          //const y = 0.2126 * px[i] + 0.7152 * px[i + 1] + 0.0722 * px[i + 2];
          //px[i] = px[i + 1] = px[i + 2] = y;
          // px[i + 3] (alpha) unchanged
        }
        */
      }

      ctx.putImageData(imageData, 0, 0);
      console.log(`CONVERT_BITMAP finished in `, performance.now() - t0);

      const result = canvas.transferToImageBitmap();
      self.postMessage({ bitmap: result, t0 }, [result]);
    }
  } else {
    throw new Error(`Undefined action: ${action}`);
  }
};
