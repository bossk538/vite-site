import { memo, useEffect, useRef, useCallback } from "react";
import type { Grid, HexColor } from './types';

type CanvasGridProps = {
  colorMap: HexColor[];
  width: number;
  height: number;
  rows: number;
  columns: number;
  grid: Grid;
  onClickCell: (row: number, col: number) => void;
}

function CanvasGrid({ colorMap, width, height, rows, columns, grid, onClickCell, canvasRef }: CanvasGridProps) {
  console.log(`CanvasGrid`, { colorMap, width, height, rows, columns, grid, onClickCell });

  const cellWidth = width / columns;
  const cellHeight = height / rows;

  // Draw whenever grid or dimensions change
  useEffect(() => {
	  if (!grid) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, width, height);

    for (let row = 0; row < grid.length; row++) {
      for (let col = 0; col < grid[row].length; col++) {
        const value = grid[row][col];
        ctx.fillStyle = colorMap[value];
        ctx.fillRect(col * cellWidth, row * cellHeight, cellWidth, cellHeight);
      }
    }
  }, [grid, colorMap, cellWidth, cellHeight, width, height]);

  const handleClick = useCallback(
    (e) => {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const col = Math.floor(x / cellWidth);
      const row = Math.floor(y / cellHeight);
      if (row < 0 || row >= rows || col < 0 || col >= columns) return;
      onClickCell(row, col);
    },
    [cellWidth, cellHeight, rows, columns]
  );

  return (
    <canvas
      className="CanvasGrid"
      ref={canvasRef}
      width={width}
      height={height}
      onClick={handleClick}
    />
  );
}

export default CanvasGrid;


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
