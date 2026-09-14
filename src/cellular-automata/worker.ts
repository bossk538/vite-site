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

const nextMatrix = (grid, rows, cols, nColors, w, h, m) => {
  const newGrid = Array.from({ length: rows }, () => Array.from({ length: cols }));
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const it = makeIterator(grid, 2, 2, row, col);
      const counts = Array.from({ length: nColors }, () => 0);

      for (const i of it) {
        counts[i]++;
      }
      const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]); // sort from largest to smallest
      newGrid[row][col] = sorted[m][0]; // 2nd most common value in neighborhood
    }
  }

  return newGrid;
};

const randomMatrixN = (rows, columns, nColors) => {
  return Array.from({ length: rows }, () =>
    Array.from({ length: columns }, () => Math.floor(Math.random() * nColors))
  );
};

let _grid;
let _state;

onmessage = (e) => {
  console.log(`FROM APP`, e.data);
  const { action, grid, rows, columns, nColors, interval, w, h, m, state } = e.data;
  if (action === 'begin') {
    _grid = randomMatrixN(state.rows, state.columns, state.nColors);
    _state = state;
    postMessage(_grid);
  } else if (action === 'continue') {
    _grid = nextMatrix(_grid, _state.rows, _state.columns, _state.nColors, _state.w, _state.h, _state.m);
    postMessage(_grid);
  } else {
    throw new Error(`Undefined action: ${action}`);
  }
};
