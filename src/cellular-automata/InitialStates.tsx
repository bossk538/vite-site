import React, { useState, useEffect, useRef } from 'react';
import { extractVideoFrames } from '/src/utils/extractVideoFrames';
import { ColorMap } from './ColorMap';
import type { Grid } from './types';

const randomMatrixN = (rows: number, columns: number, nColors: number): Grid => {
  return Array.from({ length: rows }, () =>
    Array.from({ length: columns }, () => Math.floor(Math.random() * nColors))
  );
};

export const InitialStates = ({ state, updateGrid }) => {
  const [file, setFile] = useState('');
  const [clusterColors, setClusterColors] = useState(false);
  const [frame, setFrame] = useState(null);
  const localState = useRef(state);
  const workerRef = useRef(null);

  useEffect(() => {
    workerRef.current = new Worker(new URL('./worker-2.ts', import.meta.url), { type: 'module' });
    workerRef.current.onmessage = (e) => {
      console.log(`IMAGE ONMESSAGE`, e.data);
      let colorMap = localState.current.colorMap;
      if (e.data.type === 'colorMap') {
        colorMap = e.data.payload;
        localState.current.colorMap = colorMap;
        localState.current.nColors = colorMap.length;
        workerRef.current.postMessage({ action: 'mapPixels', colorMap });
      } else if (e.data.type ===  'colorMapUpdate') {
        colorMap = e.data.payload;
        console.log(`COLORMAP_UPDAT\n`, localState.current.colorMap, colorMap);
        localState.current.colorMap = colorMap;
        localState.current.nColors = colorMap.length;
        updateGrid(null, localState.current);
      } else if (e.data.type === 'newGrid') {
        updateGrid(e.data.payload, localState.current);
      }
    };
    return () => {
      workerRef.current.onmessage = null;
      workerRef.current.terminate();
    };
  }, []);

  useEffect(() => {
    console.log(`STATE`, state, localState.current);
    localState.current.nColors = state.nColors;
    localState.current.colorMap = state.colorMap;
  }, [state]);

  const frameSelection = async (file) => {
    for await (const frame of extractVideoFrames(file, { fps: 5, maxFrames: 20 })) {
      //console.log(`Frame ${frame.index} @ ${frame.time.toFixed(2)}s`, frame.pixels);
      // frame.pixels[y][x] => [r, g, b]
      if (frame.index === 0) {
        console.log(`FRAME`, frame, localState); // frame.width frame.height
        localState.current.width = frame.width;
        localState.current.columns = frame.width;
        localState.current.height = frame.height;
        localState.current.rows = frame.height;
        setFrame(frame);
/*
        if (clusterColors) {
          workerRef.current.postMessage({ action: 'clusterColors', frame, colorMap: localState.current.colorMap });
        } else {
          workerRef.current.postMessage({ action: 'mapPixels', frame, colorMap: localState.current.colorMap });
        }
        */
      }
    }
  };

  const imageLoad = async (file) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      console.log(`LOAD IMAGE`, e);
      const img = new Image();
      img.src = e.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');

        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const { data, width, height } = imageData;

        // 'data' is a Uint8ClampedArray containing RGBA values: [R, G, B, A, R, G, B, A...]
        const pixels = [];
        for (let j = 0; j < data.length; j += 4 * width) {
          const row = [];
          for (let i = j; i < j + 4 * width; i += 4) {
            row.push([data[i], data[i+1], data[i+2]]);
          }
          pixels.push(row);
        }
        console.log(`IMAGE DATA`, imageData);
        localState.current.width = width;
        localState.current.columns = width;
        localState.current.height = height;
        localState.current.rows = height;
        const frame = {
          width,
          height,
          pixels,
        };
        setFrame(frame);
        workerRef.current.postMessage({ action: 'mapPixels', frame , colorMap: localState.current.colorMap });
        /*
        if (clusterColors) {
          workerRef.current.postMessage({ action: 'clusterColors', frame , colorMap: localState.current.colorMap });
        } else if (true) {
          workerRef.current.postMessage({ action: 'generateColors', frame , colorMap: localState.current.colorMap });
        } else {
        }
        */
      };
    };
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const [type, format] = file.type.split('/');
    switch (type) {
      case 'video':
        setFile(file);
        frameSelection(file);
        break;
      case 'image':
        setFile(file);
        imageLoad(file);
        break;
      default:
        throw new Error(`Invalid file type ${type}`);
    }
  };

  const handleGrayscale = () => {
    if (frame) {
      workerRef.current.postMessage({ action: 'grayscaleColors', frame, colorMap: localState.current.colorMap });
    }
  };

  const handleColorMapUpdate = (colorMap) => {
    localState.current.colorMap = colorMap;
    if (frame) {
      workerRef.current.postMessage({ action: 'mapPixels', frame , colorMap: localState.current.colorMap });
    }
  };

  const handleCreateRandomGrid = () => {
    const grid = randomMatrixN(localState.current.rows, localState.current.columns, localState.current.nColors);
    updateGrid(grid, localState.current);
  };

  const handleCluster = () => {
    if (frame) {
      workerRef.current.postMessage({ action: 'clusterColors', frame , colorMap: localState.current.colorMap });
    }
  };

  const handleClusterGenerate = () => {
    if (frame) {
      workerRef.current.postMessage({ action: 'generateColors', frame , colorMap: localState.current.colorMap });
    }
  };

  return (<form className="initial-states-form">
    <div>
      <label>Choose an Image
        <input type="file" accept="image/*,video/*" onChange={handleFileChange} value={file.value} />
      </label>
      <label>Cluster image colors
        <input type="checkbox" checked={clusterColors} onChange={e => setClusterColors(e.target.checked)} />
      </label>
      <ColorMap colorMap={localState.current.colorMap} handleUpdate={handleColorMapUpdate} />
    </div>
    <div>
      <button type="button" onClick={handleCreateRandomGrid}>Create Random Grid</button>
      <button type="button" onClick={handleCluster}>Cluster Colors</button>
      <button type="button" onClick={handleClusterGenerate}>Cluster Colors Gradually</button>
      <button type="button" onClick={handleGrayscale}>Create Grayscale</button>
      <button type="button" onClick={handleCluster}>Cluster Colors</button>
    </div>
  </form>);
};
