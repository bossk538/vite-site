import React from 'react';
import { Tabs } from '../components/Tabs';
import { GridSetup } from './Panel1';
import { NeighborhoodSetup } from './Panel2';
import { AutomataSetup } from './Panel3';

export const TabsControl = ({ state, dispatch }) => {
  const tabs = [
    { label: 'Grid', content: <GridSetup state={state} dispatch={dispatch} /> },
    { label: 'Neighborhood', content: <NeighborhoodSetup state={state} dispatch={dispatch} /> },
    { label: 'Automata', content: <AutomataSetup state={state} dispatch={dispatch} /> },
  ];
  return <Tabs tabs={tabs} />
};
