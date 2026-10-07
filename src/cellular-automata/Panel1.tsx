import React from 'react';
import automata from './automata';
import { ColorMap } from './ColorMap';

export const GridSetup = ({ state, dispatch }) => {
  return (
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
                <ColorMap colorMap={state.colorMap} dispatch={dispatch} />
              </li>
            </ul>
          </div>
        </div>
      </form>
   );
};
