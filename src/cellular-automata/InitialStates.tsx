import React, { useState, useEffect, useRef } from 'react';
import { extractVideoFrames } from '/src/utils/extractVideoFrames';

export const InitialStates = ({ state, dispatch, updateGrid }) => {
  const [videoFile, setVideoFile] = useState(null);
  const workerRef = useRef(null);

  useEffect(() => {
    workerRef.current = new Worker(new URL('./worker-2.ts', import.meta.url), { type: 'module' });
    workerRef.current.onmessage = (e) => {
      console.log(`INITSTATE`, e);
      if (e.data.action === 'colorMap') {
        dispatch({ type: 'colorMap', payload: e.data.payload });
      } else if (e.data.action === 'newGrid') {
        updateGrid(e.data.payload);
      }
    };
  }, []);

  const frameSelection = async (file) => {
    for await (const frame of extractVideoFrames(file, { fps: 5, maxFrames: 20 })) {
      //console.log(`Frame ${frame.index} @ ${frame.time.toFixed(2)}s`, frame.pixels);
      // frame.pixels[y][x] => [r, g, b]
      if (frame.index === 0) {
        workerRef.current.postMessage({ action: 'start', pixels: frame.pixels, state });
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
  };

  return (<form>
    <label>Choose a Video
      <input type="file" accept="video/*" onChange={handleFileChange} />
    </label>
    <label>Choose an Image
      <input type="file" accept="image/*" onChange={handleFileChange} />
    </label>
    { state.colorMap.map(color => (<span key={color} style={{ padding: '10px', backgroundColor: color }}></span>)) }
  </form>);
};
