import { kmeans } from 'ml-kmeans'
import type { HexColor } from './types';

const centroidsToRGB = (centroids: RGBArray[]): RGBColor[] => {
  return centroids.map(([ r, g, b]) => `rgb(${Math.floor(r)},${Math.floor(g)},${Math.floor(b)})`);
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

const hexToRgb = (hex: HexColor): RGBArray => {
  return hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])\$/i, (_, r, g, b) => `#${r}${r}${g}${g}${b}${b}`)
    .replace(/^#/, '')
    .match(/.{2}/g)
    .map(x => parseInt(x, 16));
};

type GridProps = {
  height: number;
  width: number;
  colorMap: HexColor[];
  pixels: any;
};
const mapPixelsToGrid = ({
  height,
  width,
  colorMap,
  pixels,
}: GridProps) => {
  const newGrid = Array.from({ length: height }, () => Array.from({ length: width }));
  const pRows = pixels.length;
  const pCols = pixels[0].length;
  const colorMapRGB = colorMap.map(hexToRgb);
  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
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

const generateGrayScale = (n) => {
  return Array.from({ length: n }, (_, idx) => {
    const value = Math.floor(255 * idx / ( n - 1));
    const hex = ('0' + value.toString(16)).slice(-2);
    return '#' + hex + hex + hex;
  });
};

let _frame = null;

const saturated = ['#000', '#00f', '#0f0', '#0ff', '#f00', '#f0f', '#ff0', '#fff'];

onmessage = (e) => {
  const { action, frame, colorMap } = e.data;

  if (frame) {
    _frame = frame;
  }

  const { pixels, width, height } = _frame;

  if (action === 'clusterColors') {
    //const ans = kmeans(pixels.flat(), colorMap.length);
    //const newColorMap = centroidsToRGB(ans.centroids);
    const newColorMap = saturated;
    postMessage({ type: 'colorMap', payload: newColorMap });
  } else if (action === 'grayscaleColors') {
    const newColorMap = generateGrayScale(colorMap.length);
    postMessage({ type: 'colorMap', payload: newColorMap });
  } else if (action === 'mapPixels') {
    const newGrid = mapPixelsToGrid({ pixels, width, height, colorMap })
    postMessage({ type: 'newGrid', payload: newGrid });
  }
};
