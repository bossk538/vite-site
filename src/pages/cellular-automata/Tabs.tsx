import React from 'react';
import { Tabs } from '../../components/Tabs';
import { GridSetup } from './GridSetup';
import { NeighborhoodSetup } from './NeighborhoodSetup';
import { AutomataSetup } from './AutomataSetup';
import { InitialStates } from './InitialStates';
import type { HexColor } from './types';

export const TabsControl = ({ state, dispatch, updateGrid, canvasRef, handleFileChange }) => {
  const tabs = [
    { label: 'Grid', content: <GridSetup state={state} dispatch={dispatch} /> },
    { label: 'Neighborhood', content: <NeighborhoodSetup state={state} dispatch={dispatch} /> },
    { label: 'Automata', content: <AutomataSetup state={state} dispatch={dispatch} /> },
    { label: 'Initial', content: <InitialStates state={state} dispatch={dispatch} updateGrid={updateGrid} canvasRef={canvasRef} handleFileChange={handleFileChange} /> },
  ];
  return <Tabs tabs={tabs} />
};
