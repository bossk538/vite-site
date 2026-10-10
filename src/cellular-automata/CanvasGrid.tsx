import { memo, useEffect, useRef, useCallback } from "react";
import type { Grid, HexColor } from './types';

type CanvasGridProps = {
  colorMap: HexColor[];
  width: number;
  height: number;
  rows: number;
  columns: number;
  grid: Grid;
  onClickCell: any;
}

function CanvasGrid({ colorMap, width, height, rows, columns, grid, onClickCell }: CanvasGridProps) {
  const canvasRef = useRef(null);
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

export default memo(CanvasGrid);
