import React from 'react';

export const Playback = ({ running, handleStart, handleStop, handleContinue, handleReset }) => {
  return (
    <div>
      <button type="button" onClick={handleStart}>{ running ? 'Start Over' : 'Start' }</button>
      { running ?
        (<button type="button" onClick={handleStop}>Pause</button>) :
        (<button type="button" onClick={handleContinue}>Continue</button>)
      }
    </div>
  );
};
