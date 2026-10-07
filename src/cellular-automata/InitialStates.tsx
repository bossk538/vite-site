import React, { useState, useEffect, useRef } from 'react';
import { extractVideoFrames } from '/src/utils/extractVideoFrames';
import { imageToPixelArray } from './utils';
import { ColorMap } from './ColorMap';
import type { HexColor } from './types';

export const InitialStates = ({ state, dispatch, updateGrid }) => {
  const [videoFile, setVideoFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [clusterColors, setClusterColors] = useState(false);
  const localState = useRef(state);
  const workerRef = useRef(null);

  useEffect(() => {
    workerRef.current = new Worker(new URL('./worker-2.ts', import.meta.url), { type: 'module' });
    workerRef.current.onmessage = (e) => {
      let colorMap = localState.current.colorMap;
      if (e.data.type === 'colorMap') {
        colorMap = e.data.payload;
        localState.current.colorMap = colorMap;
        localState.current.nColors = colorMap.length;
        workerRef.current.postMessage({ action: 'mapPixels', colorMap });
      } else if (e.data.type === 'newGrid') {
        updateGrid(e.data.payload, localState.current);
      }
    };
    return () => {
      workerRef.current.onmessage = null;
      workerRef.current.terminate();
    };
  }, []);

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

        if (clusterColors) {
          workerRef.current.postMessage({ action: 'clusterColors', frame, colorMap: localState.current.colorMap });
        } else {
          workerRef.current.postMessage({ action: 'mapPixels', frame, colorMap: localState.current.colorMap });
        }
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
        if (clusterColors) {
          workerRef.current.postMessage({ action: 'clusterColors', frame , colorMap: localState.current.colorMap });
        } else {
          workerRef.current.postMessage({ action: 'mapPixels', frame , colorMap: localState.current.colorMap });
        }
      };
    };
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
        setImageFile(file);
        imageLoad(file);
        break;
      default:
        throw new Error(`Invalid file type ${type}`);
    }
  };

  const handleGrayscale = () => {
    console.warn('not implemented');
  };

  const handleCluster = () => {
    console.warn('not implemented');
  };

  const handleColorMapUpdate = (colorMap) => {
    localState.current.colorMap = colorMap;
  };

  return (<form className="initial-states-form">
    <label>Choose a Video
      <input type="file" accept="video/*" onChange={handleFileChange} />
    </label>
    <label>Choose an Image
      <input type="file" accept="image/*" onChange={handleFileChange} />
    </label>
    <label>Cluster image colors
      <input type="checkbox" checked={clusterColors} onChange={e => setClusterColors(e.target.checked)} />
    </label>
    <ColorMap colorMap={localState.current.colorMap} handleUpdate={handleColorMapUpdate} />
    <button type="button" onClick={handleGrayscale}>Create Grayscale</button>
    <button type="button" onClick={handleCluster}>Cluster Colors</button>
  </form>);
};
