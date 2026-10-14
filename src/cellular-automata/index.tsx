import React, { useState, useReducer, useEffect, useMemo } from 'react';
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
  const [currState, setCurrState] = useState(state);
  const [running, setRunning] = useState(false);
  const [grid, setGrid] = useState<Grid>(null);
  const worker = useMemo(() => new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' }), []);

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
    setRunning(true);
    worker.postMessage({ action: 'continue' });
  };

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

  return (
    <div className="cellular-automata-screen"> 
      <Controls state={state} dispatch={dispatch} updateGrid={updateGrid} running={running} handleStart={handleStart} handleStop={handleStop} handleReset={handleReset} handleContinue={handleContinue} />
      <div className="canvas-wrapper">
        <CanvasGrid grid={grid} onClickCell={onClickCell} colorMap={state.colorMap} width={state.width} height={state.height} rows={state.rows} columns={state.columns} />
      </div>
    </div>
  );
}

export default CellularAutomata;
