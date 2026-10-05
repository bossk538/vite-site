import React from 'react';
import automata from './automata';

export const AutomataSetup = ({ state, dispatch }) => {
  return (<form>
            <ul style={{ listStyleType: 'none', textAlign: 'left' }}>
              <li>
                <label>Automaton:
                  <select value={state.automaton} onChange={e => dispatch({ type: 'automaton', payload: e.target.value})}>
                    { Object.entries(automata).map(a => (<option key={a[0]} value={a[0]}>{a[1].description}</option>)) }
                  </select>
                </label>
              </li>
    </ul>
  </form>);
};
