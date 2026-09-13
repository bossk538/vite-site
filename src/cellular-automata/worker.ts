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

let intervalId;

onmessage = (e) => {
  console.log(`WORKER RECEIVE: `, e.data);
  const { action, grid, rows, columns, nColors } = e.data;
  if (action === 'update') {
          console.log(`INTERVAL ID`, intervalId);
  } else {
    let newGrid = grid;
    intervalId = setInterval(() => {
      newGrid = nextMatrix(newGrid, rows, columns, nColors);
      postMessage(newGrid);
    }, 1000);
  }
};
