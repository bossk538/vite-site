import React, { useState, useReducer, useEffect, useMemo, useRef } from 'react';
import CanvasGrid from './CanvasGrid';
import { generateBalancedColors } from './utils';
import automata from './automata';
import { Controls } from './Accordion';
import type { Grid, StateType } from './types';
import './style.css';

const defaultState: StateType = {
  width: 1600,
  height: 800,
  rows: 800,
  columns: 1600,
  nColors: 10,
  interval: 1000,
  w: 3,
  h: 3,
  automaton: 'mc1',
  selectedColor: 1,
};
defaultState.colorMap = generateBalancedColors(defaultState.nColors);

const updateState = (state: StateType, type, payload) => {
  switch (type) {
    case 'width':
      return { ...state, width: Number(payload) };
    case 'height':
      return { ...state, height: Number(payload) };
    case 'rows':
      return { ...state, rows: Number(payload) };
    case 'columns':
      return { ...state, columns: Number(payload) };
    case 'nColors':
      return { ...state, nColors: Number(payload), colorMap: generateBalancedColors(payload), selectedColor: 0 };
    case 'interval':
      return { ...state, interval: Number(payload) };
    case 'nhdHoriz':
      return { ...state, w: Number(payload) };
    case 'nhdVert':
      return { ...state, h: Number(payload) };
    case 'automaton':
      return { ...state, ...automata[payload].config, automaton: payload };
    case 'grid':
      return { ...state, grid: payload };
    case 'colorMap':
      return { ...state, colorMap: payload, nColors: payload.length, selectedColor: 0 };
    case 'neighborhoodTopology':
      return { ...state, neighborhoodTopology: payload };
    case 'selectedColor':
      return { ...state, selectedColor: payload };
    default:
      throw new Error(`Unknown action type: ${type}`);
  }
};

const reducer = (state, action) => {
  const newState = updateState(state, action.type, action.payload);
  return newState;
};


function CellularAutomata() {
  const [state, dispatch] = useReducer(reducer, defaultState);
  const [file, setFile] = useState('');
  const [currState, setCurrState] = useState(state);
  const [running, setRunning] = useState(false);
  const [grid, setGrid] = useState<Grid>(null);
  const canvasRef = useRef(null);
  const worker = useMemo(() => new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' }), []);
  const workerRef3 = useRef(null);
  const [singleFrame, setSingleFrame] = useState(false);

  const handleReset = () => {};

  const handleStart = () => {
    setRunning(true);
    worker.postMessage({ action: 'update', grid, state, });
    setCurrState(state);
  };

  const handleStop = () => {
    setRunning(false);
  };

  const handleContinue = () => {
    setSingleFrame(false);
    setRunning(true);
    workerRef3.current.postMessage({ action: 'CONVERT_BITMAP', colorMap: state.colorMap });
  };

  const handleAdvance = () => {
    setSingleFrame(true);
    setRunning(true);
    workerRef3.current.postMessage({ action: 'CONVERT_BITMAP', colorMap: state.colorMap });
  };

  useEffect(() => {
    workerRef3.current = new Worker(new URL('./worker-3.ts', import.meta.url), { type: 'module' });
    workerRef3.current.onmessage = (e) => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('bitmaprenderer');
      console.log(`WORKER3 ONMESSAGE`, canvas, e.data, workerRef3.current, import.meta.url, import.meta);
      const { bitmap, t0, error } = e.data;
      if (error) {
        console.log(`Error: ${error}`);
        return;
      }

      canvas.width = bitmap.width;
      canvas.height = bitmap.height;

      // Hand the worker's result straight to the canvas. Zero copy;
      // the bitmap is consumed and can't be reused afterwards.
      ctx.transferFromImageBitmap(bitmap);

      console.log(`${canvas.width}×${canvas.height} done in ${(performance.now() - t0).toFixed(1)} ms`);
    };
    return () => {
      workerRef3.current.onmessage = null;
      workerRef3.current.terminate();
    };
  }, []);

  useEffect(() => {
    if (running) {
      let start = null;
      worker.onmessage = (e) => {
        console.log(`ONMESSAGE`, e);
        const step = (timestamp) => {
          if (!start || timestamp - start >= state.interval) {
            start = timestamp;
            setGrid(e.data);
            worker.postMessage({ action: 'continue' });
          } else {
            requestAnimationFrame(step);
          }
        };
        requestAnimationFrame(step);
      };
    } else {
      worker.onmessage = null;
    }
  }, [running, state.interval]);

  const onClickCell = (row: number, col: number) => {
    worker.postMessage({ action: 'draw', row, col, value: state.selectedColor });
  };

  const updateGrid = (newGrid: Grid, stateUpdates: StateType = {}): void => {
    const newState = {...currState, ...stateUpdates};
    console.log(`UPDATE GRID`, newGrid, newState);
    setCurrState(newState);
    if (newGrid) {
      setGrid(newGrid);
    }
    worker.postMessage({ action: 'update', state: newState, grid: newGrid ?? grid });
  };

  useEffect(() => {
    updateGrid(null, state);
  }, []);

  const handleClick = (e) => {
    console.log(`YOU CLICKED ME`, e);
  };

  const frameSelection = async (file) => {
    for await (const frame of extractVideoFrames(file, { fps: 5, maxFrames: 20 })) {
      //console.log(`Frame ${frame.index} @ ${frame.time.toFixed(2)}s`, frame.pixels);
      // frame.pixels[y][x] => [r, g, b]
      if (frame.index === 0) {
        console.log(`FRAME`, frame, localState); // frame.width frame.height
//        localState.current.width = frame.width;
//        localState.current.columns = frame.width;
//        localState.current.height = frame.height;
//        localState.current.rows = frame.height;
//        setFrame(frame);
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
    //status.textContent = 'Processing…';
    const t0 = performance.now();

    const bitmap = await createImageBitmap(file);
    console.log(`BITMAP`, bitmap);
    workerRef3.current.postMessage({ bitmap, t0, action: 'CREATE_BITMAP', colorMap: state.colorMap }, [bitmap]);
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

  return (
    <div className="cellular-automata-screen"> 
      <Controls state={state} dispatch={dispatch} updateGrid={updateGrid} running={running} handleStart={handleStart} handleStop={handleStop} handleReset={handleReset} handleContinue={handleContinue} canvasRef={canvasRef} handleFileChange={handleFileChange} handleAdvance={handleAdvance} />
      <div className="canvas-wrapper">
      {/*
        <CanvasGrid grid={grid} onClickCell={onClickCell} colorMap={state.colorMap} width={state.width} height={state.height} rows={state.rows} columns={state.columns} canvasRef={canvasRef} />
        */}
        <canvas
          className="CanvasGrid"
          ref={canvasRef}
          width={state.width}
          height={state.height}
          onClick={handleClick}
        />
      </div>
    </div>
  );
}

export default CellularAutomata;


/* another example - HTML:

<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Worker Grayscale</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 2rem; }
    canvas { display: block; margin-top: 1rem; max-width: 100%; border: 1px solid #ccc; }
  </style>
</head>
<body>
  <input type="file" id="file" accept="image/*">
  <p id="status"></p>
  <canvas id="output"></canvas>
  <script src="main.js"></script>
</body>
</html>

main.js

const worker = new Worker('worker.js');
const canvas = document.getElementById('output');
const status = document.getElementById('status');

// 'bitmaprenderer' lets us take ownership of an ImageBitmap with no copy.
const ctx = canvas.getContext('bitmaprenderer');

document.getElementById('file').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  status.textContent = 'Processing…';
  const t0 = performance.now();

  // Decode the image off the main thread and get a transferable bitmap.
  const bitmap = await createImageBitmap(file);

  // Transfer (not copy) the bitmap to the worker.
  worker.postMessage({ bitmap, t0 }, [bitmap]);
});

worker.onmessage = (e) => {
  const { bitmap, t0, error } = e.data;
  if (error) {
    status.textContent = `Error: ${error}`;
    return;
  }

  canvas.width = bitmap.width;
  canvas.height = bitmap.height;

  // Hand the worker's result straight to the canvas. Zero copy;
  // the bitmap is consumed and can't be reused afterwards.
  ctx.transferFromImageBitmap(bitmap);

  status.textContent =
    `${canvas.width}×${canvas.height} done in ${(performance.now() - t0).toFixed(1)} ms`;
};

worker.onerror = (e) => {
  status.textContent = `Worker error: ${e.message}`;
};


worker.js


self.onmessage = (e) => {
  const { bitmap, t0 } = e.data;

  try {
    const { width, height } = bitmap;

    // Draw the incoming bitmap into an OffscreenCanvas to get at the pixels.
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(bitmap, 0, 0);
    bitmap.close(); // free the original's memory now that we've drawn it

    const imageData = ctx.getImageData(0, 0, width, height);
    const px = imageData.data; // Uint8ClampedArray: R,G,B,A,R,G,B,A,...

    // Luminance-weighted grayscale (Rec. 709).
    for (let i = 0; i < px.length; i += 4) {
      const y = 0.2126 * px[i] + 0.7152 * px[i + 1] + 0.0722 * px[i + 2];
      px[i] = px[i + 1] = px[i + 2] = y;
      // px[i + 3] (alpha) unchanged
    }

    ctx.putImageData(imageData, 0, 0);

    // Snapshot the canvas as an ImageBitmap and transfer it back (no copy).
    const result = canvas.transferToImageBitmap();
    self.postMessage({ bitmap: result, t0 }, [result]);
  } catch (err) {
    self.postMessage({ error: err.message, t0 });
  }
};

*/

/* Stock tickers

Not completely open ones. Stock exchanges license their real-time data, so every legitimate free stock WebSocket makes you sign up for an API key. A couple of providers do give you a real-time stream on the free key, though.

Finnhub is the easiest place to start. Its free plan includes a WebSocket feed of real-time trade data for up to 50 symbols, authenticated with your API token. You connect to wss://ws.finnhub.io?token=API_KEY, and you’re allowed one connection per key. The key itself needs no credit card and is meant for personal, non-professional use.
Finnhub API +2

js
const ws = new WebSocket(`wss://ws.finnhub.io?token=${KEY}`);
ws.onopen = () => ws.send(JSON.stringify({ type: 'subscribe', symbol: 'AAPL' }));
ws.onmessage = (e) => console.log(JSON.parse(e.data)); // {type:'trade', data:[{s,p,v,t}]}

Alpaca is another option, but you need a free account (a paper-trading account is enough). The free plan includes real-time data from the IEX exchange only, with 30 WebSocket symbols. The free feed lives at wss://stream.data.alpaca.markets/v2/iex, and each account gets one concurrent WebSocket connection. The catch is that IEX handles only a small share of total volume, so prices are real but you won’t see every trade.
About Market Data API +2

Twelve Data also supports WebSockets and has a free tier, but its free streaming is much more limited, so check its current plan before building on it.
qveris

Some caveats:

Delayed feeds are common. Several other “free” stock APIs give you 15-minute delayed data or REST-only access, and stream only on paid plans.
Ticks only arrive during market hours. On a weekend you’ll see nothing, so use crypto symbols to test. Finnhub accepts symbols like BINANCE:BTCUSDT.
Yahoo Finance has an unofficial streamer. Its endpoint sends protobuf-encoded messages and is undocumented, so it can break or be blocked at any time. It’s fine for tinkering, not for anything you depend on.
Crypto exchanges need no key at all. Coinbase and Binance offer public WebSockets you can connect to without signing up, which is handy for prototyping a real-time UI.

Keep the API key out of client-side code in production. Proxy the stream through your own server instead.

Sources:

Finnhub API – dataglobehub
Finnhub WebSocket implementation – docs.rs
Finance::Quote::Finnhub – metacpan
About Market Data API – Alpaca
Alpaca real-time data docs
rustrade-data Alpaca connector – docs.rs
Real-Time Stock Price API comparison – QVeris

*/
