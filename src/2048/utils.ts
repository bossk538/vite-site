class Tile {
    constructor(position: any, value: number) {
        this.x = position.x;
        this.y = position.y;
        this.value = value || 2;
        this.previousPosition = null;
        this.mergedFrom       = null; // Tracks tiles that merged together
    }
    savePosition() {
        this.previousPosition = { x: this.x, y: this.y };
    }
    updatePosition(position) {
        this.x = position.x;
        this.y = position.y;
    }
    serialize() {
        return {
            position: {
                x: this.x,
                y: this.y
            },
            value: this.value
        };
    }
}

class Grid {
    constructor(size: any, previousState: any) {
        this.size = size;
        this.cells = previousState ? this.fromState(previousState) : this.empty();
    }
    empty() {
        var cells = [];

        for (var x = 0; x < this.size; x++) {
            var row = cells[x] = [];

            for (var y = 0; y < this.size; y++) {
                row.push(null);
            }
        }
        return cells;
    }
    fromState(state: any) {
        var cells = [];
        for (var x = 0; x < this.size; x++) {
            var row = cells[x] = [];
            for (var y = 0; y < this.size; y++) {
                var tile = state[x][y];
                row.push(tile ? new Tile(tile.position, tile.value) : null);
            }
        }
        return cells;
    }
    randomAvailableCell() {
      var cells = this.availableCells();

      if (cells.length) {
        return cells[Math.floor(Math.random() * cells.length)];
      }
    }

    availableCells() {
      var cells = [];

      this.eachCell(function (x, y, tile) {
        if (!tile) {
          cells.push({ x: x, y: y });
        }
      });

      return cells;
    }
    eachCell(callback: any) {
          for (var x = 0; x < this.size; x++) {
            for (var y = 0; y < this.size; y++) {
              callback(x, y, this.cells[x][y]);
            }
          }
        }
        cellsAvailable() {
          return !!this.availableCells().length;
        }
        cellAvailable(cell: any) {
          return !this.cellOccupied(cell);
        }
        cellOccupied(cell: any) {
          return !!this.cellContent(cell);
        }
        cellContent(cell: any) {
          if (this.withinBounds(cell)) {
            return this.cells[cell.x][cell.y];
          } else {
            return null;
          }
        }
        insertTile(tile: any) {
          this.cells[tile.x][tile.y] = tile;
        }
        removeTile(tile: any) {
          this.cells[tile.x][tile.y] = null;
        }
        withinBounds(position: any) {
          return position.x >= 0 && position.x < this.size &&
             position.y >= 0 && position.y < this.size;
        }
        serialize() {
          var cellState = [];

          for (var x = 0; x < this.size; x++) {
            var row = cellState[x] = [];

            for (var y = 0; y < this.size; y++) {
              row.push(this.cells[x][y] ? this.cells[x][y].serialize() : null);
            }
          }

          return {
            size: this.size,
            cells: cellState
          };
    }
}

export class GameManager {
    constructor(size, inputManager, actuator, storageManager) {
        this.size = size; // Size of the grid
        this.storageManager = storageManager;
        this.actuator = actuator;

        this.startTiles = 2;
        this.setup();
    }

    // Restart the game
    restart() {
      this.storageManager.clearGameState();
      this.actuator.continueGame(); // Clear the game won/lost message
      this.setup();
    }

    // Keep playing after winning (allows going over 2048)
    keepPlaying() {
      this.keepPlaying = true;
      this.actuator.continueGame(); // Clear the game won/lost message
    }

    // Return true if the game is lost, or has won and the user hasn't kept playing
    isGameTerminated() {
      return this.over || (this.won && !this.keepPlaying);
    }

    // Set up the game
    async setup() {
      var previousState = await this.storageManager.getGameState();

      // Reload the game from a previous game if present
      if (previousState) {
        this.grid = new Grid(previousState.grid.size,
                                    previousState.grid.cells); // Reload grid
        this.score       = previousState.score;
        this.over        = previousState.over;
        this.won         = previousState.won;
        this.keepPlaying = previousState.keepPlaying;
      } else {
        this.grid        = new Grid(this.size);
        this.score       = 0;
        this.over        = false;
        this.won         = false;
        this.keepPlaying = false;

        // Add the initial tiles
        this.addStartTiles();
      }

      // Update the actuator
      this.actuate();
    }

    // Set up the initial tiles to start the game with
    addStartTiles() {
      for (var i = 0; i < this.startTiles; i++) {
        this.addRandomTile();
      }
    }

    // Adds a tile in a random position
    addRandomTile() {
      if (this.grid.cellsAvailable()) {
        var value = Math.random() < 0.9 ? 2 : 4;
        var tile = new Tile(this.grid.randomAvailableCell(), value);

        this.grid.insertTile(tile);
      }
    }

    // Sends the updated grid to the actuator
    async actuate() {
      const bestScore = await this.storageManager.getBestScore();
      if (bestScore < this.score) {
        this.storageManager.setBestScore(this.score);
      }

      // Clear the state when the game is over (game over only, not win)
      if (this.over) {
        this.storageManager.clearGameState();
      } else {
        this.storageManager.setGameState(this.serialize());
      }

      this.actuator.actuate(this.grid, {
        score:      this.score,
        over:       this.over,
        won:        this.won,
        bestScore,
        terminated: this.isGameTerminated()
      });

    }

    // Represent the current game as an object
    serialize() {
      return {
        grid: this.grid.serialize(),
        score: this.score,
        over: this.over,
        won: this.won,
        keepPlaying: this.keepPlaying
      };
    }

    // Save all tile positions and remove merger info
    prepareTiles() {
      this.grid.eachCell(function (x, y, tile) {
        if (tile) {
          tile.mergedFrom = null;
          tile.savePosition();
        }
      });
    }

    // Move a tile and its representation
    moveTile(tile, cell) {
      this.grid.cells[tile.x][tile.y] = null;
      this.grid.cells[cell.x][cell.y] = tile;
      tile.updatePosition(cell);
    }

    // Move tiles on the grid in the specified direction
    move(direction) {
      // 0: up, 1: right, 2: down, 3: left
      var self = this;

      if (this.isGameTerminated()) return; // Don't do anything if the game's over

      var cell, tile;

      var vector     = this.getVector(direction);
      var traversals = this.buildTraversals(vector);
      var moved      = false;

      // Save the current tile positions and remove merger information
      this.prepareTiles();

      // Traverse the grid in the right direction and move tiles
      traversals.x.forEach(function (x) {
        traversals.y.forEach(function (y) {
          cell = { x: x, y: y };
          tile = self.grid.cellContent(cell);

          if (tile) {
            var positions = self.findFarthestPosition(cell, vector);
            var next      = self.grid.cellContent(positions.next);

            // Only one merger per row traversal?
            if (next && next.value === tile.value && !next.mergedFrom) {
              var merged = new Tile(positions.next, tile.value * 2);
              merged.mergedFrom = [tile, next];

              self.grid.insertTile(merged);
              self.grid.removeTile(tile);

              // Converge the two tiles' positions
              tile.updatePosition(positions.next);

              // Update the score
              self.score += merged.value;

              // The mighty 2048 tile
              if (merged.value === 2048) self.won = true;
            } else {
              self.moveTile(tile, positions.farthest);
            }

            if (!self.positionsEqual(cell, tile)) {
              moved = true; // The tile moved from its original cell!
            }
          }
        });
      });

      if (moved) {
        this.addRandomTile();

        if (!this.movesAvailable()) {
          this.over = true; // Game over!
        }

        this.actuate();
      }
    }

    // Get the vector representing the chosen direction
    getVector(direction) {
      // Vectors representing tile movement
      var map = {
        0: { x: 0,  y: -1 }, // Up
        1: { x: 1,  y: 0 },  // Right
        2: { x: 0,  y: 1 },  // Down
        3: { x: -1, y: 0 }   // Left
      };

      return map[direction];
    }

    // Build a list of positions to traverse in the right order
    buildTraversals(vector) {
      var traversals = { x: [], y: [] };

      for (var pos = 0; pos < this.size; pos++) {
        traversals.x.push(pos);
        traversals.y.push(pos);
      }

      // Always traverse from the farthest cell in the chosen direction
      if (vector.x === 1) traversals.x = traversals.x.reverse();
      if (vector.y === 1) traversals.y = traversals.y.reverse();

      return traversals;
    }

    findFarthestPosition(cell, vector) {
      var previous;

      // Progress towards the vector direction until an obstacle is found
      do {
        previous = cell;
        cell     = { x: previous.x + vector.x, y: previous.y + vector.y };
      } while (this.grid.withinBounds(cell) &&
               this.grid.cellAvailable(cell));

      return {
        farthest: previous,
        next: cell // Used to check if a merge is required
      };
    }

    movesAvailable() {
      return this.grid.cellsAvailable() || this.tileMatchesAvailable();
    }

    // Check for available matches between tiles (more expensive check)
    tileMatchesAvailable() {
      var self = this;

      var tile;

      for (var x = 0; x < this.size; x++) {
        for (var y = 0; y < this.size; y++) {
          tile = this.grid.cellContent({ x: x, y: y });

          if (tile) {
            for (var direction = 0; direction < 4; direction++) {
              var vector = self.getVector(direction);
              var cell   = { x: x + vector.x, y: y + vector.y };

              var other  = self.grid.cellContent(cell);

              if (other && other.value === tile.value) {
                return true; // These two tiles can be merged
              }
            }
          }
        }
      }

      return false;
    }

    positionsEqual(first, second) {
      return first.x === second.x && first.y === second.y;
    }
};




export class LocalStorageManager {
constructor() {
  this.bestScoreKey     = "bestScore";
  this.gameStateKey     = "gameState";

}

// Best score getters/setters
async getBestScore() {
  const response = await fetch('http://localhost:5000/getBestScore');
  if (response.ok) {
      const bestScore = await response.text();
      return bestScore || 0;
  }
  return 0;
}

async setBestScore(score) {
  const response = await fetch(`http://localhost:5000/setBestScore?bestScore=${score}`);
  if (response.ok) {
	  const { matched_count, modified_count } = await response.json();
	  console.log(`best score modified: ${modified_count}, matched: ${matched_count}`);
  }
}

// Game state getters/setters and clearing
async getGameState() {
  const response = await fetch('http://localhost:5000/getGameState');
  if (response.ok) {
     const gameState = await response.json();
     return gameState ?? null;
  }
}

async setGameState(gameState) {
  const response = await fetch(`http://localhost:5000/setGameState`, { method: 'POST', body: JSON.stringify(gameState), headers: {'Content-type': 'application/json'} });
  if (response.ok) {
	  const id = await response.text();
	      console.log(`inserted document with id ${id}`);
  }
}

async clearGameState() {
  const response = await fetch(`http://localhost:5000/clearGameState`);
	  if (response.ok) {
	  const count = await response.text();
	  console.log(`${count} documents deleted`);
  }
}
};
