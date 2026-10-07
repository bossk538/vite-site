import React, { useState, useEffect, useRef } from 'react';
import { extractVideoFrames } from '/src/utils/extractVideoFrames';
import { imageToPixelArray } from './utils';
import { ColorMap } from './ColorMap';
import type { HexColor } from './types';

export const InitialStates = ({ state, dispatch, updateGrid }) => {
  const [videoFile, setVideoFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [clusterColors, setClusterColors] = useState(true);
  const workerRef = useRef(null);

  useEffect(() => {
    workerRef.current = new Worker(new URL('./worker-2.ts', import.meta.url), { type: 'module' });
    workerRef.current.onmessage = (e) => {
      let colorMap = state.colorMap;
      if (e.data.type === 'colorMap') {
        dispatch({ type: 'colorMap', payload: e.data.payload });
        colorMap = e.data.payload;
        workerRef.current.postMessage({ action: 'mapPixels', colorMap });
      } else if (e.data.type === 'newGrid') {
        updateGrid(e.data.payload, { colorMap });
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
        console.log(`FRAME`, frame, state); // frame.width frame.height
        dispatch({ type: 'width', payload: frame.width });
        dispatch({ type: 'height', payload: frame.height });
        dispatch({ type: 'rows', payload: frame.height });
        dispatch({ type: 'columns', payload: frame.width });
        if (clusterColors) {
          workerRef.current.postMessage({ action: 'clusterColors', frame, colorMap: state.colorMap });
        } else {
          workerRef.current.postMessage({ action: 'mapPixels', frame, colorMap: state.colorMap });
        }
      }
    }
  };

  const imageLoad = async (file) => {
    console.log(`IMAGE FILE`, file);
    //const out = await imageToPixelArray(file);
    //console.log(`IMAGE`, out);
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

        // 3. Draw image to canvas and extract pixel data
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const { data, width, height } = imageData;

        // 'pixels' is a Uint8ClampedArray containing RGBA values: [R, G, B, A, R, G, B, A...]
        const pixels = [];
        for (let j = 0; j < data.length; j += 4 * width) {
          const row = [];
          for (let i = j; i < j + 4 * width; i += 4) {
            row.push([data[i], data[i+1], data[i+2]]);
          }
          pixels.push(row);
        }
        console.log(`IMAGE DATA`, imageData);
        dispatch({ type: 'width', payload: width });
        dispatch({ type: 'height', payload: height });
        dispatch({ type: 'rows', payload: height });
        dispatch({ type: 'columns', payload: width });
        const frame = {
          width,
          height,
          pixels,
        };
        if (clusterColors) {
          workerRef.current.postMessage({ action: 'clusterColors', frame , colorMap: state.colorMap });
        } else {
          workerRef.current.postMessage({ action: 'mapPixels', frame , colorMap: state.colorMap });
        }
        /*
        const pixels = imageData.data;
        console.log("Raw pixel array length:", pixels.length);
        console.log("First pixel RGBA:", pixels[0], pixels[1], pixels[2], pixels[3]);
        */
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
    <ColorMap colorMap={state.colorMap} dispatch={dispatch} />
    <button type="button" onClick={handleGrayscale}>Create Grayscale</button>
    <button type="button" onClick={handleCluster}>Cluster Colors</button>
  </form>);
};
