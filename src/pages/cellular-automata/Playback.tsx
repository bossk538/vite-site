import React from 'react';
import type { HexColor } from './types';
import { Button } from '/src/components/Button';

export const Playback = ({ running, handleStart, handleStop, handleContinue, handleReset, handleAdvance }) => {
  return (
    <div className="Playback">
      { running && <Button onClick={handleStart}>Start Over</Button> }
      { !running && <Button onClick={handleStart}>Start</Button> }
      { running && <Button onClick={handleStop}>Pause</Button> }
      { !running && <Button onClick={handleContinue}>Continue</Button> }
      { true && <Button onClick={handleAdvance}>Advance</Button> }
    </div>
  );
};
