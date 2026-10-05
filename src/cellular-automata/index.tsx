import React, { useRef, useState, useReducer, useEffect, useCallback } from 'react';
import CanvasGrid from './CanvasGrid';
import { generateBalancedColors } from './utils';
import automata from './automata';
import { Controls } from './Accordion';
import './style.css';

const defaultState = {
  width: 1600,
  height: 800,
  rows: 800,
  columns: 1600,
  nColors: 16,
  interval: 1000,
  w: 3,
  h: 3,
  automaton: 'mc1',
};
defaultState.colorMap = generateBalancedColors(defaultState.nColors);

const updateState = (state, type, payload) => {
  switch (type) {
    case 'width':
      return { ...state, width: payload };
    case 'height':
      return { ...state, height: payload };
    case 'rows':
      return { ...state, rows: payload };
    case 'columns':
      return { ...state, columns: payload };
    case 'nColors':
      const colorMap = generateBalancedColors(payload);
      return { ...state, nColors: payload, colorMap };
    case 'interval':
      return { ...state, interval: payload };
    case 'nhdHoriz':
      return { ...state, w: payload };
    case 'nhdVert':
      return { ...state, h: payload };
    case 'automaton':
      return { ...state, ...automata[payload].config, automaton: payload };
    case 'grid':
      return { ...state, grid: payload };
    default:
      throw new Error(`Unknown action type: ${type}`);
  }
  
};

const reducer = (state, action) => {
    const newState = updateState(state, action.type, action.payload);
    return newState;
};

const randomMatrixN = (rows, columns, nColors) => {
  return Array.from({ length: rows }, () =>
    Array.from({ length: columns }, () => Math.floor(Math.random() * nColors))
  );
};

let intervalId;
let count = 0;
const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });

function CellularAutomata() {
  const [state, dispatch] = useReducer(reducer, defaultState);
  const [currState, setCurrState] = useState(state);
  const [running, setRunning] = useState(false);
  const [grid, setGrid] = useState(null);

  const handleReset = () => {};

  const handleStart = () => {
    setRunning(true);
    worker.postMessage({ action: 'begin', state, });
    setCurrState(state);
  };

  const handleStop = () => {
    setRunning(false);
  };
  const handleContinue = () => {
    setRunning(true);
  };

  const lastTime = useRef<number | null>(null);
  useEffect(() => {
    worker.onmessage = (e) => {
       console.log(`FROM WORKER`, e);
       requestAnimationFrame((time) => {
         console.log(`elapsed tiem`, time);
         if (lastTime.current === null || time - lastTime.current >= state.interval) {
           setGrid(e.data);
           if (running) {
             worker.postMessage({ action: 'continue' });
           }
           lastTime.current = time;
         }
       });
    };
  }, [running]);

  const onClickCell = (row, col) => {
    worker.postMessage({ action: 'update', row, col });
  };

  return (
    <div className="cellular-automata-screen"> 
      <Controls state={state} dispatch={dispatch} running={running} handleStart={handleStart} handleStop={handleStop} handleReset={handleReset} handleContinue={handleContinue} />
      <div style={{ marginLeft: 'auto', marginRight: 'auto' }}>
        <CanvasGrid state={currState} grid={grid} onClickCell={onClickCell} />
      </div>
    </div>
  );
}

export default CellularAutomata;
