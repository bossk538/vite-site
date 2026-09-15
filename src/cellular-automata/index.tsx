import React, { useRef, useState, useReducer, useEffect } from 'react';
import CanvasGrid from './CanvasGrid';
import { generateBalancedColors } from './utils';
import automata from './automata';

const defaultState = {
  width: 1600,
  height: 800,
  rows: 200,
  columns: 400,
  nColors: 3,
  interval: 1000,
  w: 3,
  h: 3,
  automaton: 'mc1',
  colorMap: ['rgb(255,0,0)', 'rgb(0,255,0)', 'rgb(0,0,255)'],
};

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
      return { ...state, nColors: payload };
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
    //newState.grid = randomMatrixN(newState.rows, newState.columns, newState.nColors);
    newState.colorMap = generateBalancedColors(newState.nColors);
    return newState;
};

const randomMatrixN = (rows, columns, nColors) => {
  return Array.from({ length: rows }, () =>
    Array.from({ length: columns }, () => Math.floor(Math.random() * nColors))
  );
};

let intervalId;
let count = 0;

function CellularAutomata() {
  const [state, dispatch] = useReducer(reducer, defaultState);
  const [currState, setCurrState] = useState(state);
  const workerRef = useRef();
  const [status, setStatus] = useState('stopped');// running, stopped, paused
  const [grid, setGrid] = useState(null);
  const handleReset = () => {};
  const handleStart = () => {
    setStatus('start');
  };
  const handleStop = () => {
    setStatus('stopped');
  };
  const handleContinue = () => {
    setStatus('running');
  };

  useEffect(() => {
    if (status === 'start') {
      workerRef.current.postMessage({ action: 'begin', state, });
      setStatus('running');
      setCurrState(state);
    } else if (status === 'running') {
      const intervalId = setInterval(() => {
        workerRef.current.postMessage({ action: 'continue' });
      }, state.interval);
      return () => clearInterval(intervalId);
    } else if (status === 'stopped') {
//    setGrid(null);
    }
  }, [status]);


  useEffect(() => {
    workerRef.current = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
    workerRef.current.onmessage = (e) => {
       console.log(`FROM WORKER`, e);
       setGrid(e.data);
    };
  }, []);

  const onClickCell = (row, col) => {
    setGrid((prev) => {
      const next = prev.map(r => r.slice());
      next[row] = next[row].slice();
      next[row][col] = (next[row][col] + 1) % state.nColors;
      return next;
    });
  };

  return (
    <div style={{ width: '99vw' }}> 
      <form>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
          <div>
            <ul style={{ listStyleType: 'none', textAlign: 'left' }}>
              <li>
                <label>Grid Width (pixels):
                  <input value={state.width} onChange={e => dispatch({ type: 'width', payload: e.target.value})} />
                </label>
              </li>
              <li>
                <label>Grid Height (pixels):
                  <input value={state.height} onChange={e => dispatch({type: 'height', payload: e.target.value})} />
                </label>
              </li>
              <li>
                <label>Number of rows:
                  <input value={state.rows} onChange={e => dispatch({ type: 'rows', payload: e.target.value})} />
                </label>
              </li>
              <li>
                <label>Number of columns:
                  <input value={state.columns} onChange={e => dispatch({ type: 'columns', payload: e.target.value})} />
                </label>
              </li>
            </ul>
          </div>
          <div>
            <ul style={{ listStyleType: 'none', textAlign: 'left' }}>
              <li>
                <label>Number of values per cell:
                  <input value={state.nColors} onChange={e => dispatch({ type: 'nColors', payload: e.target.value})} />
                </label>
              </li>
              <li>
                <label>Interval between redraws (ms):
                  <input value={state.interval} onChange={e => dispatch({ type: 'interval', payload: e.target.value})} />
                </label>
              </li>
              <li>
                <label>Neighborhood horizontal range:
                  <input value={state.w} onChange={e => dispatch({ type: 'nhdHoriz', payload: e.target.value})} />
                </label>
              </li>
              <li>
                <label>Neighborhood vertical range:
                  <input value={state.h} onChange={e => dispatch({ type: 'nhdVert', payload: e.target.value})} />
                </label>
              </li>
              <li>
                <label>Automaton:
                  <select value={state.automaton} onChange={e => dispatch({ type: 'automaton', payload: e.target.value})}>
                    { Object.entries(automata).map(a => (<option key={a[0]} value={a[0]}>{a[1].description}</option>)) }
                  </select>
                </label>
              </li>
            </ul>
          </div>
        </div>
        <div>
          <button type="button" onClick={handleStart}>{ status === 'running' ? 'Start Over' : 'Start' }</button>
          { status === 'running' ?
            (<button type="button" onClick={handleStop}>Pause</button>) :
            (<button type="button" onClick={handleContinue}>Continue</button>)
          }
        </div>
      </form>
      <div style={{ marginLeft: 'auto', marginRight: 'auto' }}>
        <CanvasGrid state={currState} grid={grid} onClickCell={onClickCell} />
      </div>
    </div>
  );
}

export default CellularAutomata;
