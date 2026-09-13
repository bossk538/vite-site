import { useEffect, useRef, useState, useCallback } from "react";

function CellularAutomata({ width = 800, height = 800, rows = 80, columns = 80 }) {
  const canvasRef = useRef(null);

  // Initialize the matrix: rows x columns, each cell an [r, g, b] tuple
  const [grid, setGrid] = useState(() =>
    Array.from({ length: rows }, () =>
      Array.from({ length: columns }, () => [
        Math.floor(Math.random() * 256),
        Math.floor(Math.random() * 256),
        Math.floor(Math.random() * 256),
      ])
    )
  );

  const cellWidth = width / columns;
  const cellHeight = height / rows;

  // Draw whenever grid or dimensions change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, width, height);

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        const [r, g, b] = grid[row][col];
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

export default CellularAutomata;
