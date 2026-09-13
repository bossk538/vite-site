import React, { useState, useReducer } from 'react';
import CanvasGrid from './CanvasGrid';

const defaultState = {
  width: 1200,
  height: 800,
  rows: 160,
  columns: 240,
  nColors: 20,
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
    case 'nColumns':
      return { ...state, nColumns: action.payload };
    default:
      throw new Error(`Unknown action type: ${action.type}`);
  }
};

function CellularAutomata() {
  const [state, dispatch] = useReducer(reducer, defaultState);

  return (
    <div style={{ width: '99vw' }}> 
      <form>
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
          <li>
            <label>Number of values per cell:
              <input value={state.nColors} onChange={e => dispatch({ type: 'nColors', payload: e.target.value})} />
            </label>
          </li>
        </ul>
      </form>
      <div style={{ marginLeft: 'auto', marginRight: 'auto' }}>
        <CanvasGrid width={state.width} height={state.height} rows={state.rows} columns={state.columns} nColors={state.nColors} />
      </div>
    </div>
  );
}

export default CellularAutomata;
