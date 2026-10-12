import automata from './automata';
import { NeighborhoodTopology, AutomataKey } from './types';

function* makeIterator(grid, w, h, row, column, neighborhoodTopology) {
  const gridRows = grid.length;
  const gridCols = grid[0].length;
  const rowOffset = Math.ceil(h / gridRows) * gridRows + row;
  const colOffset = Math.ceil(w / gridCols) * gridCols + column;
  if (neighborhoodTopology === 'von Neumann') {
    for (let i = -w; i <= w; i++) {
      for (let j = -w; j <= w; j++) {
        if (Math.abs(i) + Math.abs(j) <= w) { 
          const r = (rowOffset + i) % gridRows;
          const c = (colOffset + j) % gridCols;
          yield [grid[r][c], i, j];
        }
      }
    }
  } else if (neighborhoodTopology === 'circular') {
    const r2 = w * w;
    for (let i = -w; i <= w; i++) {
      for (let j = -w; j <= w; j++) {
        if (i*i + j*j <= r2) { 
          const r = (rowOffset + i) % gridRows;
          const c = (colOffset + j) % gridCols;
          yield [grid[r][c], i, j];
        }
      }
    }
  } else { // Moore
    for (let i = -w; i <= w; i++) {
      for (let j = -h; j <= h; j++) {
        const r = (rowOffset + i) % gridRows;
        const c = (colOffset + j) % gridCols;
        yield [grid[r][c], i, j];
      }
    }
  }
}

const nextMatrix = (grid: Grid, rows: number, cols: number, nColors: number, w: number, h: number, name: AutomataKey, neighborhoodTopology: NeighborhoodTopology) => {
  const newGrid = Array.from({ length: rows }, () => Array.from({ length: cols }));
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const it = makeIterator(grid, w, h, row, col, neighborhoodTopology);
      const orig = grid[row][col];
      const value = automata[name].impl(it, nColors, orig);
      newGrid[row][col] = value;
    }
  }

  return newGrid;
};

let _grid: Grid;
let _state;

onmessage = (e) => {
  const { action, state, grid, payload } = e.data;
  console.log(`WORKER RECEIVE`, e.data, _state);
  if (action === 'continue') {
    _grid = nextMatrix(_grid, _state.rows, _state.columns, _state.nColors, _state.w, _state.h, _state.automaton, _state.neighborhoodTopology);
    postMessage(_grid);
  } else if (action === 'update') {
    if (state) {
      _state = state;
    }
    if (grid) {
      _grid = grid;
    } else if (!_grid) {
      _grid = Array.from({ length: _state.rows }, () => Array.from({ length: _state.columns }, () => 0));
    }
    postMessage('success');
  } else if (action === 'update_grid') {
    _grid = payload;
  } else if (action === 'update_state') {

    // if dimensions of grid change we wipe out grid
    if (payload.rows !== _state.rows || payload.columns !== _state.columns || payload.colorMap.length !== _state.colorMap.length) {
      _grid = Array.from({ length: _state.rows }, () => Array.from({ length: _state.columns }, () => 0));
    }

    _state = payload;
    postMessage(_grid);
  } else if (action === 'draw') {
    const { row, col, value } = e.data;
    _grid[row][col] = value ? value : 1;
    postMessage(_grid);
  } else {
    throw new Error(`Undefined action: ${action}`);
  }
};
