import React, { useState, useCallback, useEffect, useMemo } from 'react';

export const TicTacToe2 = () => {
  const NCols = 5;
  const NRows = 4;
  const players = ['X', 'O','W', 'V']
  const seqSize = 3;
  const newGrid = useCallback(() => {
      return Array.from({ length: NRows}, () => Array(NCols).fill(null))
  }, [NRows, NCols]);
  const [grid, setGrid] = useState(newGrid);
  const [player, setPlayer] = useState(0)
  const [message, setMessage] = useState('Hello World!');
  const setPosition = (row, col) => {
    const newGrid = grid.map(row => [...row]);
    newGrid[row][col] = player;
    setGrid(newGrid);
    setPlayer((player + 1) % players.length);
    const s = findLongestSequence(newGrid)
    const winner = s.findIndex(l => l >= seqSize);
    if (winner >= 0) {
      alert(`Winner is ${players[winner]}`)
    }
  }
 const gridStyle = useMemo(() => ({
      display: 'grid',
      'grid-template-columns': `repeat(${NCols}, 100px)`,
      'grid-template-rows': `repeat(${NRows}, 100px)`,
      gap: '10px',
  }), [NRows, NCols]);

  const clearGame = () => {
    setGrid(newGrid())
    setPlayer(0)
  }

  const isBoardFull = (grid) => {
    for (const row of grid) {
      for (const col of row) {
        if (col === null) {
          return false;
        }
      }
    }
    return true;
  }

  const findLongestSequence = (grid) => {
    const s = Array(players.length).fill(0)

    // check rows
    let _player;
    let _prevPlayer;
    let _sequence;
    let row, col;

    for (row = 0; row < NRows; row++) {
      _sequence = 1;
      _prevPlayer = null
      for (col = 0; col < NCols; col++) {
        _player = grid[row][col];

        if (_player === _prevPlayer) {
          _sequence++;
        } else {
          _sequence = 1;
          console.log(`${_player} !== ${_prevPlayer}`)
        }

        if (_player !== null && _sequence > s[_player]) {
          s[_player] = _sequence;
        }

        _prevPlayer = _player;
      }
    }


    for (col = 0; col < NCols; col++) {
      _sequence = 1;
      _prevPlayer = null;
      for (row = 0; row < NRows; row++) {
        _player = grid[row][col];

        if (_player === _prevPlayer) {
          _sequence++;
        } else {
          _sequence = 1;
        }

        if (_player !== null && _sequence > s[_player]) {
          s[_player] = _sequence;
        }

        _prevPlayer = _player;
      }
    }

    let rowStart, colStart;
    for (rowStart = 0; rowStart < NRows; rowStart++) {
      col = 0;
      row = rowStart;
      _prevPlayer = null;
      while (row < NRows && col < NCols) {
        _player = grid[row][col];

        if (_player === _prevPlayer) {
          _sequence++;
        } else {
          _sequence = 1;
        }

        if (_player !== null && _sequence > s[_player]) {
          s[_player] = _sequence;
        }

        _prevPlayer = _player;
        row++;
        col++;
      }
    }

    for (colStart = 1; colStart < NCols; colStart++) {
      col = colStart;
      row = 0;
      _prevPlayer = null;
      while (row < NRows && col < NCols) {
        _player = grid[row][col];

        if (_player === _prevPlayer) {
          _sequence++;
        } else {
          _sequence = 1;
        }

        if (_player !== null && _sequence > s[_player]) {
          s[_player] = _sequence;
        }

        _prevPlayer = _player;
        row++;
        col++;
      }
    }

    for (rowStart = 0; rowStart < NRows; rowStart++) {
      row = rowStart;
      col = NCols - 1;
      _prevPlayer = null;
      while (row < NRows && col >= 0) {
        _player = grid[row][col];

        if (_player === _prevPlayer) {
          _sequence++;
        } else {
          _sequence = 1;
        }

        if (_player !== null && _sequence > s[_player]) {
          s[_player] = _sequence;
        }

        _prevPlayer = _player;
        row++;
        col--;
      }
    }

    for (colStart = 0; colStart < NCols - 1; colStart++) {
      row = 0;
      col = colStart;
      _prevPlayer = null;
      while (row < NRows && col >= 0) {
        _player = grid[row][col];

        if (_player === _prevPlayer) {
          _sequence++;
        } else {
          _sequence = 1;
        }

        if (_player !== null && _sequence > s[_player]) {
          s[_player] = _sequence;
        }

        _prevPlayer = _player;
        row++;
        col--;
      }
    }

    return s;
  }

  const boxStyle = useMemo(() => ({
      'background-color': 'steelblue',
      color: 'white',
      display: 'flex',
      'align-items': 'center',
      'justify-content': 'center',
      'font-size': '24px',
      'border-radius': '8px',
    }), []);

  return (<div>{player}
     <h3>{players[player]}'s turn</h3>
     <button onClick={() => clearGame()}>Clear</button>
     <div style={gridStyle}>

     {
       grid.map(
        (row, rowIdx) => {
          return row.map((col, colIdx) => (
            <button disabled={col !== null} onClick={() => setPosition(rowIdx, colIdx)} style={boxStyle}>
            {players[col] ?? ' '}
            </button>
            ))
        }
       )
     }
    </div>

  </div>);
};
