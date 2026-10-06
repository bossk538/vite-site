import { kmeans } from 'ml-kmeans'

const centroidsToRGB = (centroids) => {
  return centroids.map(([ r, g, b]) => `rgb(${Math.floor(r)},${Math.floor(g)},${Math.floor(b)})`);
};


const rgbDistSquared = (rgb1, rgb2) => {
  return (rgb1[0] - rgb2[0]) ** 2 + (rgb1[1] - rgb2[1]) ** 2 + (rgb1[2] - rgb2[2]) ** 2;
};

const distSqArr = (colorMap, rgb) => {
  return colorMap.map(hsl => {
    const rgb2 = hsl ? hslToRgb(hsl) : [0, 0, 0];
    return rgbDistSquared(rgb, rgb2);
  });
};

const pickClosestIdx = (arr) => {
  let smallest = Number.POSITIVE_INFINITY;
  let idxOfSmallest = 0;
  for (let idx = 0; idx < arr.length; idx++) {
    if (arr[idx] < smallest) {
      idxOfSmallest = idx;
      smallest = arr[idx];
    }
  }
  return idxOfSmallest;
};

const hslToRgb = (text) => {
  if (typeof text !== 'string') {
    return text;
  } else if (/^hsl\(/.test(text)) {
    let [h, s, l] = text.match(/[\d.]+/g).map(Number);
    s /= 100;
    l /= 100;

    const k = n => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));

    return [
      Math.round(255 * f(0)),
      Math.round(255 * f(8)),
      Math.round(255 * f(4))
    ];
  } else if (/^rgb\(/.test(text)) {
    let [r, g, b] = text.match(/[\d.]+/g).map(Number);
    return [Math.floor(r), Math.floor(g), Math.floor(b)];
  } else if (/^#/.test(text)) {
    return text.replace(/^#?([a-f\d])([a-f\d])([a-f\d])\$/i, (_, r, g, b) => `#${r}${r}${g}${g}${b}${b}`)
      .replace(/^#/, '')
      .match(/.{2}/g)
      .map(x => parseInt(x, 16));
  }
};

const mapPixelsToGrid = ({
  rows,
  columns,
  colorMap,
  pixels,
}) => {
  const newGrid = Array.from({ length: rows }, () => Array.from({ length: columns }));
  const pRows = pixels.length;
  const pCols = pixels[0].length;
  const colorMapRGB = colorMap.map(hslToRgb);
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < columns; col++) {
      if (row < pRows && col < pCols) {
        const rgb = pixels[row][col];
        const d = distSqArr(colorMapRGB, rgb);
        newGrid[row][col] = pickClosestIdx(d);
      } else {
        newGrid[row][col] = 0;
      }
    }
  }
  return newGrid;
};

onmessage = (e) => {
  const { action, pixels, state } = e.data;
  console.log(`WORKER`,  action, pixels, state );

  if (action === 'start') {
    const ans = kmeans(pixels.flat(), Number(state.nColors)); // make sure nColors is a number not string
    const colorMap = centroidsToRGB(ans.centroids);
    postMessage({ type: 'colorMap', payload: colorMap });

    const rows = pixels.length;
    const cols = pixels[0].length;
    const newGrid = mapPixelsToGrid({ ...state, pixels })
    postMessage({ type: 'newGrid', payload: newGrid });
  }
};
