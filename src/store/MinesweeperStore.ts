import { observable, action, makeObservable, computed } from "mobx";

interface Setting {
  rows: number;
  columns: number;
  numMines: number;
}

export interface Settings {
  beginner: Setting;
  intermediate: Setting;
  advanced: Setting;
  custom: Setting;
}

export class MinesweeperStore {
  board: Cell[][] = [];
  gameOver: boolean = false;
  win: boolean = false;
  hasMoved: boolean = false;
  initialLoad: boolean = true;
  currentSetting: keyof Settings = "custom";
  settings: Settings = {
    beginner: { rows: 9, columns: 9, numMines: 10 },
    intermediate: { rows: 16, columns: 16, numMines: 40 },
    advanced: { rows: 16, columns: 30, numMines: 99 },
    custom: { rows: 12, columns: 16, numMines: 40 },
  };
  timeElapsed: number = 0;
  timer: number | null = null;

  constructor() {
    makeObservable(this, {
      board: observable,
      gameOver: observable,
      win: observable,
      currentSetting: observable,
      initialLoad: observable,
      settings: observable,
      hasMoved: observable,
      timeElapsed: observable,
      minesRemaining: computed,
      generateBoard: action,
      startNewGame: action,
      setGameOver: action,
      setWin: action,
      placeRandomMine: action,
      startTimer: action,
      stopTimer: action,
      resetTimer: action,
      incrementTimer: action,
      changeSetting: action,
    });
    this.createInitialBoard(this.settings.custom);
  }

  private createInitialBoard(setting: Settings[keyof Settings]) {
    const { rows, columns } = setting;
    this.createBoard(rows, columns);
    const fourInitialColumn = 1;
    const fourInitialRow = 2;
    const mineCoordinates = [
      [fourInitialRow, fourInitialColumn],
      [fourInitialRow + 1, fourInitialColumn],
      [fourInitialRow + 2, fourInitialColumn],
      [fourInitialRow + 3, fourInitialColumn],
      [fourInitialRow + 4, fourInitialColumn],
      [fourInitialRow + 4, fourInitialColumn + 1],
      [fourInitialRow + 4, fourInitialColumn + 2],
      [fourInitialRow + 4, fourInitialColumn + 3],
      [fourInitialRow, fourInitialColumn + 3],
      [fourInitialRow + 1, fourInitialColumn + 3],
      [fourInitialRow + 2, fourInitialColumn + 3],
      [fourInitialRow + 3, fourInitialColumn + 3],
      [fourInitialRow + 5, fourInitialColumn + 3],
      [fourInitialRow + 6, fourInitialColumn + 3],
      [fourInitialRow + 7, fourInitialColumn + 3],
      [fourInitialRow, fourInitialColumn + 5],
      [fourInitialRow + 1, fourInitialColumn + 5],
      [fourInitialRow + 2, fourInitialColumn + 5],
      [fourInitialRow + 3, fourInitialColumn + 5],
      [fourInitialRow + 4, fourInitialColumn + 5],
      [fourInitialRow + 5, fourInitialColumn + 5],
      [fourInitialRow + 6, fourInitialColumn + 5],
      [fourInitialRow + 7, fourInitialColumn + 5],
      [fourInitialRow, fourInitialColumn + 6],
      [fourInitialRow, fourInitialColumn + 7],
      [fourInitialRow, fourInitialColumn + 8],
      [fourInitialRow + 1, fourInitialColumn + 8],
      [fourInitialRow + 2, fourInitialColumn + 8],
      [fourInitialRow + 3, fourInitialColumn + 8],
      [fourInitialRow + 4, fourInitialColumn + 8],
      [fourInitialRow + 5, fourInitialColumn + 8],
      [fourInitialRow + 6, fourInitialColumn + 8],
      [fourInitialRow + 7, fourInitialColumn + 8],
      [fourInitialRow + 7, fourInitialColumn + 7],
      [fourInitialRow + 7, fourInitialColumn + 6],
      [fourInitialRow, 14],
      [fourInitialRow, fourInitialColumn + 10],
      [fourInitialRow + 1, fourInitialColumn + 10],
      [fourInitialRow + 2, fourInitialColumn + 10],
      [fourInitialRow + 3, fourInitialColumn + 10],
      [fourInitialRow + 4, fourInitialColumn + 10],
      [fourInitialRow + 4, fourInitialColumn + 11],
      [fourInitialRow + 4, fourInitialColumn + 12],
      [fourInitialRow + 5, fourInitialColumn + 13],
      [fourInitialRow + 1, fourInitialColumn + 13],
      [fourInitialRow + 2, fourInitialColumn + 13],
      [fourInitialRow + 3, fourInitialColumn + 13],
      [fourInitialRow + 4, fourInitialColumn + 13],
      [fourInitialRow + 6, fourInitialColumn + 13],
      [fourInitialRow + 7, fourInitialColumn + 13],
    ];
    mineCoordinates.map(
      (coordinate) => (this.board[coordinate[0]][coordinate[1]].isMine = true)
    );
    this.hasMoved = true;
    this.timeElapsed = 404;
  }

  get minesRemaining() {
    return (
      this.settings[this.currentSetting].numMines -
      this.board.flat().filter((cell) => cell.isFlagged).length
    );
  }

  setInitialLoadFalse = () => {
    this.initialLoad = false;
  };

  startTimer() {
    if (this.timer) {
      clearInterval(this.timer);
    }

    this.timer = setInterval(() => {
      this.incrementTimer();
    }, 1000);
  }

  incrementTimer = () => (this.timeElapsed += 1);

  stopTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  resetTimer() {
    this.stopTimer();
    this.timeElapsed = 0;
  }

  createBoard(rows: number, columns: number) {
    this.board = new Array(rows)
      .fill(null)
      .map((_, row) =>
        new Array(columns).fill(null).map((_, column) => new Cell(row, column))
      );
  }

  populateMines(rows: number, columns: number, numMines: number) {
    for (let i = 0; i < numMines; i++) {
      let row, column;
      do {
        row = Math.floor(Math.random() * rows);
        column = Math.floor(Math.random() * columns);
      } while (this.board[row][column].isMine);

      this.board[row][column].isMine = true;
    }
  }

  generateBoard(setting: Settings[keyof Settings]) {
    const { rows, columns, numMines } = setting;

    this.createBoard(rows, columns);
    this.populateMines(rows, columns, numMines);

    for (let row = 0; row < rows; row++) {
      for (let column = 0; column < columns; column++) {
        this.getAdjacentCells(this.board[row][column]);
      }
    }
  }

  getAdjacentCells(cell: Cell) {
    const { row, column } = cell;

    let count: number = 0;
    for (let rOffset = -1; rOffset <= 1; rOffset++) {
      for (let cOffset = -1; cOffset <= 1; cOffset++) {
        if (rOffset === 0 && cOffset === 0) {
          continue;
        }
        const newRow = row + rOffset;
        const newCol = column + cOffset;
        if (
          newRow >= 0 &&
          newRow < this.board.length &&
          newCol >= 0 &&
          newCol < this.board[0].length
        ) {
          const adjacentCell = this.board[newRow][newCol];
          if (adjacentCell.isMine) {
            count += 1;
          }
          cell.adjacentCells.push(adjacentCell);
        }
      }
    }
    cell.numAdjacentMines = count;
  }

  setGameOver() {
    this.gameOver = true;
    this.stopTimer();
  }

  setWin() {
    this.win = true;
    this.stopTimer();
  }

  handleCellClick = (cell: Cell) => {
    if (!this.gameOver && !cell.isFlagged) {
      if (!this.hasMoved) {
        if (cell.isMine) {
          cell.isMine = false;
          this.placeRandomMine();
        }
        this.startTimer();
        this.hasMoved = true;
      }

      cell.reveal();
      if (cell.isMine) {
        this.setGameOver();
        cell.setGameOverBG();
        this.revealAllMines();
      } else if (cell.numAdjacentMines === 0) {
        cell.revealAdjacentCells();
      }
      if (!this.gameOver) {
        this.checkForWin();
      }
    }
  };

  editCustomSettings(rows: number, cols: number, numMines: number) {
    this.settings.custom.rows = rows;
    this.settings.custom.columns = cols;
    this.settings.custom.numMines = numMines;
  }

  revealAllMines() {
    this.board.forEach((row) => {
      row.forEach((cell) => {
        if (cell.isMine) {
          cell.reveal();
        }
      });
    });
  }

  checkForWin() {
    // Implement the logic to check for a win
    for (const row of this.board) {
      for (const cell of row) {
        // If the cell is a mine but has been revealed (user clicked on it), game is lost
        if (cell.isMine && cell.isRevealed) {
          return;
        }
        // If the cell is not a mine but hasn't been revealed, game hasn't been won yet
        if (!cell.isMine && !cell.isRevealed) {
          return;
        }
      }
    }

    // If we reached here, then the game is won
    this.win = true;
    this.setGameOver();
  }

  placeRandomMine() {
    let placedMine = false;
    const rows = this.board.length;
    const columns = this.board[0].length;

    while (!placedMine) {
      const randomRow = Math.floor(Math.random() * rows);
      const randomCol = Math.floor(Math.random() * columns);
      const cell = this.board[randomRow][randomCol];

      if (!cell.isMine) {
        cell.isMine = true;
        placedMine = true;
      }
    }
  }

  startNewGame = () => {
    this.gameOver = false;
    this.hasMoved = false;
    this.win = false;
    this.resetTimer();
    this.generateBoard(this.settings[this.currentSetting]);
  };

  changeSetting = (setting: keyof Settings) => {
    this.currentSetting = setting;
    this.startNewGame();
  };
}

function GameNotOver(
  target: object,
  propertyKey: string,
  descriptor: TypedPropertyDescriptor<(...args: unknown[]) => unknown>
): TypedPropertyDescriptor<(...args: unknown[]) => unknown> | void {
  const originalMethod = descriptor.value;

  if (originalMethod) {
    descriptor.value = function (...args: unknown[]) {
      if (minesweeperStore.gameOver) {
        return;
      }
      return originalMethod.apply(this, args);
    };
  }

  return descriptor;
}

export class Cell {
  row: number;
  column: number;
  isMine: boolean = false;
  gameOverBG: boolean = false;
  isGameOver: boolean = false;
  isRevealed: boolean = false;
  isFlagged: boolean = false;
  adjacentCells: Cell[] = [];
  numAdjacentMines: number = 0;

  constructor(row: number, column: number) {
    makeObservable(this, {
      isMine: observable,
      isRevealed: observable,
      isFlagged: observable,
      numAdjacentMines: observable,
      gameOverBG: observable,
      setGameOverBG: action,
      flag: action,
      reveal: action,
    });
    this.row = row;
    this.column = column;
  }

  setGameOverBG() {
    this.gameOverBG = true;
  }

  @GameNotOver
  flag() {
    this.isFlagged = !this.isFlagged;
  }

  reveal() {
    if (!this.isFlagged && !this.isRevealed) {
      this.isRevealed = true;
    }
  }

  revealAdjacentCells() {
    this.adjacentCells.forEach((cell) => {
      if (!cell.isRevealed && !cell.isFlagged) {
        cell.reveal();
        if (cell.numAdjacentMines === 0) {
          cell.revealAdjacentCells();
        }
      }
    });
  }
}

const minesweeperStore = new MinesweeperStore();
export default minesweeperStore;
