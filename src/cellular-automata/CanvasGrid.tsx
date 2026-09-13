import { useEffect, useRef, useState, useCallback } from "react";

const randomMatrixN = (rows, columns, nColors) => {
  return Array.from({ length: rows }, () =>
    Array.from({ length: columns }, () => Math.floor(Math.random() * nColors))
  );
};

function* makeIterator(grid, w, h, row, column) {
  const gridRows = grid.length;
  const gridCols = grid[0].length;
  for (let i = -w; i <= w; i++) {
    for (let j = -h; j <= h; j++) {
      const r = (gridRows + row + i) % gridRows;
      const c = (gridCols + column + j) % gridCols;
      yield grid[r][c];
    }
  }
}

const makeRandomColorMap = (nColors) => {
  return Array.from({ length: nColors }, () => [
    Math.floor(Math.random() * 256),
    Math.floor(Math.random() * 256),
    Math.floor(Math.random() * 256),
  ]);
};

const nextMatrix = (grid, rows, cols, nColors) => {
  const newGrid = Array.from({ length: rows }, () => Array.from({ length: cols }));
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const it = makeIterator(grid, 2, 2, row, col);
      const counts = Array.from({ length: nColors }, () => 0);

      for (const i of it) {
        counts[i]++;
      }
      const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]); // sort from largest to smallest
      newGrid[row][col] = sorted[1][0]; // 2nd most common value in neighborhood
    }
  }

  return newGrid;
};

function CanvasGrid({ width = 800, height = 800, rows = 80, columns = 80, nColors = 10 }) {
  const [colorMap, setColorMap] = useState(() => makeRandomColorMap(nColors));
  const canvasRef = useRef(null);

  // Initialize the matrix: rows x columns, each cell an [r, g, b] tuple
  const [grid, setGrid] = useState(() => randomMatrixN(rows, columns, nColors));

  const cellWidth = width / columns;
  const cellHeight = height / rows;

/*
  useEffect(() => {
    const intervalId = setInterval(() => {
      setGrid((prev) => nextMatrix(prev, rows, columns, nColors));  
    }, 1000);
    return () => clearInterval(intervalId);
  }, []);
  */

  const workerRef = useRef();
  useEffect(() => {
    workerRef.current = new Worker(new URL('./worker.ts', import.meta.url));
    workerRef.current.onmessage = (e) => {
       setGrid(e.data);
    };
    workerRef.current.postMessage({ action: 'start', grid, rows, columns, nColors});
  }, []);

  useEffect(() => {
    workerRef.current.postMessage({ action: 'update' });
  }, [width, height, rows, columns, nColors]);

  // Draw whenever grid or dimensions change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, width, height);

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        const [r, g, b] = colorMap[grid[row][col]];
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(col * cellWidth, row * cellHeight, cellWidth, cellHeight);
      }
    }
  }, [grid, width, height, rows, columns, cellWidth, cellHeight]);

  // Example interaction: click a tile to randomize its color
  const handleClick = useCallback(
    (e) => {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const col = Math.floor(x / cellWidth);
      const row = Math.floor(y / cellHeight);

      if (row < 0 || row >= rows || col < 0 || col >= columns) return;

      setGrid((prev) => {
        const next = prev.map((r) => r.slice());
        next[row] = next[row].slice();
        next[row][col] = [
          Math.floor(Math.random() * 256),
          Math.floor(Math.random() * 256),
          Math.floor(Math.random() * 256),
        ];
        return next;
      });
    },
    [cellWidth, cellHeight, rows, columns]
  );

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      onClick={handleClick}
      style={{ border: "1px solid #ccc" }}
    />
  );
}

export default CanvasGrid;
