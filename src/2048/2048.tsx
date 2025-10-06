import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { animframe_polyfill } from './js/animframe_polyfill';
import { classlist_polyfill } from './js/classlist_polyfill';
import { GameManager, LocalStorageManager } from './utils';
import HTMLActuator from './HTMLActuator';
import './style/main.css';

// bind_polyfill.js
Function.prototype.bind = Function.prototype.bind || function (target) {
  var self = this;
  return function (args) {
    if (!(args instanceof Array)) {
      args = [args];
    }
    self.apply(target, args);
  };
};
classlist_polyfill();
animframe_polyfill();
const SIZE = 4;

export const TFE = (props) => {
  const [nrows, setNrows] = useState(SIZE);
  const [ncols, setNcols] = useState(SIZE);
  const [gameManager, setGameManager] = useState();

  const handleKeyPress = useCallback((event) => {
    // do stuff with stateVariable and event
    if (gameManager) {
      const map = {
        38: 0, // Up
        39: 1, // Right
        40: 2, // Down
        37: 3, // Left
        75: 0, // Vim up
        76: 1, // Vim right
        74: 2, // Vim down
        72: 3, // Vim left
        87: 0, // W
        68: 1, // D
        83: 2, // S
        65: 3  // A
      };
      var modifiers = event.altKey || event.ctrlKey || event.metaKey ||
                        event.shiftKey;
      var mapped    = map[event.which];

      if (!modifiers) {
        if (mapped !== undefined) {
          event.preventDefault();
          gameManager.move(mapped);
        }
      }

      // R key restarts the game
      if (!modifiers && event.which === 82) {
        //self.restart.call(self, event);
        gameManager.restart();
      }
    }
  }, [gameManager]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [handleKeyPress]);

  useEffect(() => {
    window.requestAnimationFrame(() => {
    console.log(`XXX_window.requestAnimationFrame`);
      const actuator = new HTMLActuator();
      const storageManager = new LocalStorageManager();
      setGameManager(new GameManager(SIZE, null, actuator, storageManager));
    });
  }, []);

  return (
    <div className="container">
      <div className="heading">
        <h1 className="title">2048</h1>
        <div className="scores-container">
          <div className="score-container">0</div>
          <div className="best-container">0</div>
        </div>
      </div>

      <div className="above-game">
        <p className="game-intro">Join the numbers and get to the <strong>2048 tile!</strong></p>
        <a className="restart-button" onClick={() => gameManager?.restart()}>New Game</a>
      </div>
  
      <div className="game-container">
        <div className="game-message">
          <p></p>
          <div className="lower">
	          <a className="keep-playing-button" onClick={() => gameManager?.keepPlaying()}>Keep going</a>
            <a className="retry-button" onClick={() => gameManager?.restart()}>Try again</a>
          </div>
        </div>

        <div className="grid-container">
          {
            Array.from({ length: nrows }).map((_, row) => { return (
              <div key={row} className="grid-row">{
                Array.from({ length: ncols }).map((_, col) => (<div key={`${row}-${col}`} className="grid-cell"></div>))
              }</div>
            ); })
          }
        </div>

        <div className="tile-container">

        </div>
      </div>

      <p className="game-explanation">
        <strong className="important">How to play:</strong> Use your <strong>arrow keys</strong> to move the tiles. When two tiles with the same number touch, they <strong>merge into one!</strong>
      </p>
      <hr />
      <p>
      <strong className="important">Note:</strong> This site is the official version of 2048. You can play it on your phone via <a href="http://git.io/2048">http://git.io/2048.</a> All other apps or sites are derivatives or fakes, and should be used with caution.
      </p>
      <hr />
      <p>
      Created by <a href="http://gabrielecirulli.com" target="_blank">Gabriele Cirulli.</a> Based on <a href="https://itunes.apple.com/us/app/1024!/id823499224" target="_blank">1024 by Veewo Studio</a> and conceptually similar to <a href="http://asherv.com/threes/" target="_blank">Threes by Asher Vollmer.</a>
      </p>
    </div>
  );
};
