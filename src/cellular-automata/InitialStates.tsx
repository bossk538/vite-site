import React, { useState } from 'react';
import { extractVideoFrames } from '/src/utils/extractVideoFrames';
import { kmeans } from 'ml-kmeans'

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
  } else if (/^#/.test(text)) {
    return text.replace(/^#?([a-f\d])([a-f\d])([a-f\d])\$/i, (_, r, g, b) => `#${r}${r}${g}${g}${b}${b}`)
      .replace(/^#/, '')
      .match(/.{2}/g)
      .map(x => parseInt(x, 16));
  }
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

const centroidsToRGB = (centroids) => {
  return centroids.map(([ r, g, b]) => `rgb(${Math.floor(r)},${Math.floor(g)},${Math.floor(b)})`);
};

export const InitialStates = ({ state, dispatch, grid, setGrid }) => {
  const [videoFile, setVideoFile] = useState(null);

  const frameSelection = async (file) => {
    for await (const frame of extractVideoFrames(file, { fps: 5, maxFrames: 20 })) {
      //console.log(`Frame ${frame.index} @ ${frame.time.toFixed(2)}s`, frame.pixels);
      // frame.pixels[y][x] => [r, g, b]
      if (frame.index === 0) {
        const ans = kmeans(frame.pixels.flat(), Number(state.nColors)); // make sure nColors is a number not string
        const colorMap = centroidsToRGB(ans.centroids);
        dispatch({ type: 'colorMap', payload: colorMap });
        console.log(`KMEANS`, ans);
        const rows = frame.pixels.length;
        const cols = frame.pixels[0].length;
        const newGrid = mapPixelsToGrid({ ...state, pixels: frame.pixels })
        setGrid(newGrid);
      }

    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const [type, format] = file.type.split('/');
    switch (type) {
      case 'video':
          setVideoFile(file);
          frameSelection(file);
        break;
      case 'image':
        break;
      default:
        throw new Error(`Invalid file type ${type}`);
    }
    console.log(`FILE ${type} ${format}`, file);
  };
  console.log(`STATE`, state);

  return (<form>
    <label>Choose a Video
      <input type="file" accept="video/*" onChange={handleFileChange} />
    </label>
    <label>Choose an Image
      <input type="file" accept="image/*" onChange={handleFileChange} />
    </label>
    <p>ColorMap: { JSON.stringify(state.colorMap.map(hslToRgb)) }</p>
  </form>);
};
