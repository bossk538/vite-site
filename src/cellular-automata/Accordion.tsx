import React from 'react';
import { Accordion } from '../components/Accordion';
import { TabsControl } from './Tabs';
import { Playback } from './Playback';

export const Controls = ({ state, dispatch, running, handleStart, handleStop, handleContinue }) => {
  const accordion = [
    { label: 'Setup', content: <TabsControl state={state} dispatch={dispatch} /> },
    { label: 'Playback', content: <Playback running={running} handleStart={handleStart} handleStop={handleStop} handleContinue={handleContinue} /> },
  ];

  return <Accordion accordion={accordion} />;
};
