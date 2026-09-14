import React, { useState, useReducer } from 'react';
import CanvasGrid from './CanvasGrid';

const defaultState = {
  width: 1200,
  height: 800,
  rows: 200,
  columns: 300,
  nColors: 10,
  interval: 500,
  w: 4,
  h: 3,
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'width':
      return { ...state, width: action.payload };
    case 'height':
      return { ...state, height: action.payload };
    case 'rows':
      return { ...state, rows: action.payload };
    case 'columns':
      return { ...state, columns: action.payload };
    case 'nColors':
      return { ...state, nColors: action.payload };
    case 'interval':
      return { ...state, interval: action.payload };
    case 'nhdHoriz':
      return { ...state, w: action.payload };
    case 'nhdVert':
      return { ...state, h: action.payload };
    default:
      throw new Error(`Unknown action type: ${action.type}`);
  }
};

function CellularAutomata() {
  const [state, dispatch] = useReducer(reducer, defaultState);

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
            </ul>
          </div>
        </div>
      </form>
      <div style={{ marginLeft: 'auto', marginRight: 'auto' }}>
        <CanvasGrid width={state.width} height={state.height} w={state.w} h={state.h} rows={state.rows} columns={state.columns} nColors={state.nColors} interval={state.interval} />
      </div>
    </div>
  );
}

export default CellularAutomata;
