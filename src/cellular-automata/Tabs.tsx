import React from 'react';
import { Tabs } from '../components/Tabs';
import { GridSetup } from './Panel1';
import { NeighborhoodSetup } from './Panel2';
import { AutomataSetup } from './Panel3';
import { InitialStates } from './InitialStates';
import type { HexColor } from './types';

export const TabsControl = ({ state, dispatch, updateGrid }) => {
  const tabs = [
    { label: 'Grid', content: <GridSetup state={state} dispatch={dispatch} /> },
    { label: 'Neighborhood', content: <NeighborhoodSetup state={state} dispatch={dispatch} /> },
    { label: 'Automata', content: <AutomataSetup state={state} dispatch={dispatch} /> },
    { label: 'Initial', content: <InitialStates state={state} dispatch={dispatch} updateGrid={updateGrid} /> },
  ];
  return <Tabs tabs={tabs} />
};
