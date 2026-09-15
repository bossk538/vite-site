import { useEffect, useRef, useState, useCallback } from "react";

function CanvasGrid({ state, grid }) {
  const { colorMap, width, height, rows, columns, nColors, interval, w, h, m } = state;
  const canvasRef = useRef(null);

  const cellWidth = width / columns;
  const cellHeight = height / rows;

  // Draw whenever grid or dimensions change
  useEffect(() => {
	  if (!grid) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, width, height);

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        const value = grid[row][col];
        ctx.fillStyle = colorMap[value];
        ctx.fillRect(col * cellWidth, row * cellHeight, cellWidth, cellHeight);
      }
    }
  }, [grid]);

  const handleClick = (e) => {};

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
