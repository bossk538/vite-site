import React, { useState, useEffect, useRef } from 'react';
import { extractVideoFrames } from '/src/utils/extractVideoFrames';
import { ColorMap } from './ColorMap';

export const InitialStates = ({ state, dispatch, updateGrid }) => {
  const [videoFile, setVideoFile] = useState(null);
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
  </form>);
};
