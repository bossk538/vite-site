import automata from './automata';

function* makeIterator(grid, w, h, row, column) {
  const gridRows = grid.length;
  const gridCols = grid[0].length;
  const rowOffset = Math.ceil(h / gridRows) * gridRows + row;
  const colOffset = Math.ceil(w / gridCols) * gridCols + column;
  for (let i = -w; i <= w; i++) {
    for (let j = -h; j <= h; j++) {
      const r = (rowOffset + i) % gridRows;
      const c = (colOffset + j) % gridCols;
      yield [grid[r][c], i, j];
    }
  }
}

const nextMatrix = (grid, rows, cols, nColors, w, h, name) => {
  const newGrid = Array.from({ length: rows }, () => Array.from({ length: cols }));
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const it = makeIterator(grid, w, h, row, col);
      const orig = grid[row][col];
      let value;
      value = automata[name].impl(it, nColors, orig);
      newGrid[row][col] = value;
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
  const { action, state, row, col } = e.data;
  if (action === 'begin') {
    _grid = randomMatrixN(state.rows, state.columns, state.nColors);
    _state = state;
    postMessage(_grid);
  } else if (action === 'continue') {
    _grid = nextMatrix(_grid, _state.rows, _state.columns, _state.nColors, _state.w, _state.h, _state.automaton);
    postMessage(_grid);
  } else if (action === 'update') {
    _grid[row][col] = (_grid[row][col] + 1) % _state.nColors;
    postMessage(_grid);
  } else {
    throw new Error(`Undefined action: ${action}`);
  }
};
