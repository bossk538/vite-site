import type { HexColor } from './types';

export const NeighborhoodSetup = ({ state, dispatch }) => {
  return (<form>
    <ul style={{ listStyleType: 'none', textAlign: 'left' }}>
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
