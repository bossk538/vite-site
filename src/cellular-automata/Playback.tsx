import React from 'react';
import type { HexColor } from './types';

export const Playback = ({ running, handleStart, handleStop, handleContinue, handleReset }) => {
  return (
    <div>
      { running && <button type="button" onClick={handleStart}>Start Over</button> }
      { !running && <button type="button" onClick={handleStart}>Start</button> }
      { running && <button type="button" onClick={handleStop}>Pause</button> }
      { !running && <button type="button" onClick={handleContinue}>Continue</button> }
    </div>
  );
};
