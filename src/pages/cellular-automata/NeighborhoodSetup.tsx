import type { HexColor } from './types';

export const NeighborhoodSetup = ({ state, dispatch }) => {
  return (<form>
    <ul style={{ listStyleType: 'none', textAlign: 'left' }}>
      <li>
        <label>Neighborhood topology:
          <select value={state.neighborhoodTopology} onChange={e =>dispatch({ type: 'neighborhoodTopology', payload: e.target.value})}>
            <option>Moore</option>
            <option>von Neumann</option>
            <option>circular</option>
          </select>
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
  </form>);
};
