import * as React from 'react';
import './App.css';

enum Player {
  None = 0,
  One = 1,
  Two = 2
}

enum GameState {
  Ongoing = -1,
  Draw = 0,
  PlayerOneWin = 1,
  PlayerTwoWin = 2
}

type Board = Player[][];

interface State {
  board: Board,
  playerTurn: number,
  gameState: GameState | Player
}

const initializeBoard = () => {
  const board = [];
  
  for (let row = 0; row < 6; row++) {
    const board_row = []
    for (let col = 0; col < 7; col++) {
      board_row.push(Player.None)
    }
    board.push(board_row)
  }

  return board

}

/* Drop a coin in the column */
const dropCoin = (board: Board, col: number, player: Player) => {
  if (board[0][col] !== 0) return

  for (let row = 1; row < board.length; row++) {
    if (board[row][col] !== 0) {
      board[row-1][col] = player
      return
    }
  }

  board[board.length-1][col] = player
  return
}

/* 
  1 if user 1 wins
  2 if user 2 wins
  0 if draw
  -1 if ongoing
*/
const gameCompleted = (board: Board) => {

  // Checks wins horizontally
  for (let r = 0; r < board.length; r++) {
    for (let c = 0; c <= board[0].length - 4; c++) {

      const boardSlice = [
        board[r][c],
        board[r][c+1],
        board[r][c+2],
        board[r][c+3]
      ];

      const winningResult = checkWinningSlice(boardSlice);
      if (winningResult !== false) return winningResult;
    }
  }

  // check wins vertically
  for (let r = 0; r <= board.length - 4; r++) {
    for (let c = 0; c < board[0].length; c++) {
      
      const boardSlice = [
        board[r][c],
        board[r+1][c],
        board[r+2][c],
        board[r+3][c]
      ];

      const winningResult = checkWinningSlice(boardSlice);
      if (winningResult !== false) return winningResult;
    }
  }

  // check wins vertically
  for (let r = 0; r <= 2; r++) {
    for (let c = 0; c < board[0].length; c++) {

      // Checks diagonal down-left
      if (c >= 3) {
        const boardSlice = [
          board[r][c],
          board[r+1][c-1],
          board[r+2][c-2],
          board[r+3][c-3]
        ];
  
        const winningResult = checkWinningSlice(boardSlice);
        if (winningResult !== false) return winningResult;
      } 

      // Checks diagonal down-right
      if (c <= 3) {
        const boardSlice = [
          board[r][c],
          board[r+1][c+1],
          board[r+2][c+2],
          board[r+3][c+3]
        ];
  
        const winningResult = checkWinningSlice(boardSlice);
        if (winningResult !== false) return winningResult;
      }
    }
  }

  let full = true
  for (let r = 0; r < board.length; r++) {
    for (let c = 0; c < board[0].length; c++) {
      if (board[r][c] === 0) full = false
    }
  }

  if (full) return GameState.Draw
  else return GameState.Ongoing
}

/* 
  1 if 1111 
  2 if 2222
  false if other
*/
const checkWinningSlice = (miniBoard: Player[]) => {
  if (miniBoard.some(cell => cell === Player.None)) return false;

  if (
    miniBoard[0] === miniBoard[1] &&
    miniBoard[1] === miniBoard[2] &&
    miniBoard[2] === miniBoard[3]
  ) {
    return miniBoard[1];
  }

  return false;
};


/* -------------------- AI FUNCTIONS STARTS ------------------ */

// -1 if fails
// 0 if success
const tryDropCoin = (board: Board, col: number, player: Player) => {
  if (board[0][col] !== 0) return -1

  for (let row = 1; row < board.length; row++) {
    if (board[row][col] !== 0) {
      board[row-1][col] = player
      return 0
    }
  }

  board[board.length-1][col] = player
  return 0
}

// -1 if fails
// 0 if success
const tryRemoveCoin = (board: Board, col: number) => {
  if (board[board.length-1][col] !== 0) return -1

  for (let row = 0; row < board.length; row++) {
    if (board[row][col] !== 0) {
      board[row-1][col] = 0
      return 0
    }
  }

  return -1
}

const alphaBetaRoot = (board: Board, player: Player, depth: number, a: number, b: number) => {
  let maxV = Number.NEGATIVE_INFINITY;
  let maxC = 0
  let invalid = 1

  let p = [0,0,0,0,0,0,0]

  for (let col = 0; col < board[0].length; col++) {
    if (tryDropCoin(board, col, player) !== 0) continue

    let v = alphaBetaMin(board, player, depth+1, a, b)
    p[col] = v

    if (v > maxV || invalid === 1) {
      invalid = 0
      maxV = v
      maxC = col
    }
    if (v >= b) return maxV
    if (a < v) a = v
    tryRemoveCoin(board, col)
  }

  return maxC
}

const alphaBetaMax = (board: Board, player: Player, depth: number, a: number, b: number) => {
  return 0;
}

const alphaBetaMin = (board: Board, player: Player, depth: number, a: number, b: number) => {
  return 0;
}

/* Evaluation value of the current board for player */
const evaluationFunction = (board: Board, player: Player) => {

  const opponent = 1
  const threes = countThrees(board, player)
  const threes_o = countThrees(board, opponent)
  const twos = countTwos(board, player)
  const twos_o = countTwos(board, opponent)

  return (3 * threes + twos) - (3 * threes_o + twos_o) 
}

/* Count the number of three consecutive player color */
const countThrees = (board: Board, player: Player) => {

  let count = 0

  // Checks wins horizontally
  for (let r = 0; r < board.length; r++) {
    for (let c = 0; c <= board[0].length - 3; c++) {

      const boardSlice = [
        board[r][c],
        board[r][c+1],
        board[r][c+2]
      ];


      if (board[r][c] === player) {
        if (isConsecutive(boardSlice)) count++
      }
    }
  }

  // check wins vertically
  for (let r = 0; r <= board.length - 3; r++) {
    for (let c = 0; c < board[0].length; c++) {
      
      const boardSlice = [
        board[r][c],
        board[r+1][c],
        board[r+2][c]
      ];

      if (board[r][c] === player) {
        if (isConsecutive(boardSlice)) count++
      }
    }
  }

  // check wins vertically
  for (let r = 0; r <= 3; r++) {
    for (let c = 0; c < board[0].length; c++) {

      // Checks diagonal down-left
      if (c >= 2) {
        const boardSlice = [
          board[r][c],
          board[r+1][c-1],
          board[r+2][c-2]
        ];
  
        if (board[r][c] === player) {
          if (isConsecutive(boardSlice)) count++
        }
      } 

      // Checks diagonal down-right
      if (c <= 4) {
        const boardSlice = [
          board[r][c],
          board[r+1][c+1],
          board[r+2][c+2]
        ];
  
        if (board[r][c] === player) {
          if (isConsecutive(boardSlice)) count++
        }
      }
    }
  }

  return count
}

/* Count the number of two consecutive player color */
const countTwos = (board: Board, player: Player) => {

  let count = 0

  // Checks wins horizontally
  for (let r = 0; r < board.length; r++) {
    for (let c = 0; c <= board[0].length - 2; c++) {

      const boardSlice = [
        board[r][c],
        board[r][c+1]
      ];

      if (board[r][c] === player) {
        if (isConsecutive(boardSlice)) count++
      }
    }
  }

  // check wins vertically
  for (let r = 0; r <= board.length - 2; r++) {
    for (let c = 0; c < board[0].length; c++) {
      
      const boardSlice = [
        board[r][c],
        board[r+1][c]
      ];

      if (board[r][c] === player) {
        if (isConsecutive(boardSlice)) count++
      }
    }
  }

  // check wins vertically
  for (let r = 0; r <= 4; r++) {
    for (let c = 0; c < board[0].length; c++) {

      // Checks diagonal down-left
      if (c >= 2) {
        const boardSlice = [
          board[r][c],
          board[r+1][c-1]
        ];
  
        if (board[r][c] === player) {
          if (isConsecutive(boardSlice)) count++
        }
      } 

      // Checks diagonal down-right
      if (c <= 5) {
        const boardSlice = [
          board[r][c],
          board[r+1][c+1]
        ];
  
        if (board[r][c] === player) {
          if (isConsecutive(boardSlice)) count++
        }
      }
    }
  }

  return count
}

/* Return true if the  */
const isConsecutive = (miniBoard: Player[]) => {
  if (miniBoard.some(cell => cell === Player.None)) return false;

  if (miniBoard.length === 2) {
    if (
      miniBoard[0] === miniBoard[1] &&
      miniBoard[1] === miniBoard[2]
    ) {
      return true
    }
  }

  if (miniBoard.length === 3) {
    if (
      miniBoard[0] === miniBoard[1] &&
      miniBoard[1] === miniBoard[2] &&
      miniBoard[2] === miniBoard[3]
    ) {
      return true
    }
  }

  return false;
};

/* -------------------- AI FUNCTIONS ENDS -------------------- */

class App extends React.Component<{}, State> {

  state: State = {
    board: initializeBoard(),
    playerTurn: 1,
    gameState: GameState.Ongoing
  }

  /* onClick handler */
  public handleOnClick = (col: number) => () => {
    
    // Don't make a move if not ongoing state
    const {gameState} = this.state
    console.log(gameState)
    if (gameState !== GameState.Ongoing) return 

    this.makeMove(col)
  }

  /* Place a coin and change turn */
  public makeMove(col: number) {
    const {board, playerTurn} = this.state

    const opponent = playerTurn === 1? 2:1
    const newBoard = board.slice()

    // drop a coin for user and update
    dropCoin(newBoard, col, playerTurn)
    let gameState = gameCompleted(newBoard);
    this.setState({
      board: newBoard,
      gameState
    });

    // drop a coin for ai and update
    dropCoin(newBoard, alphaBetaRoot(board, playerTurn, 3, Number.NEGATIVE_INFINITY,  Number.POSITIVE_INFINITY), opponent)
    gameState = gameCompleted(newBoard);
    this.setState({
      board: newBoard,
      gameState
    });
  }

  /* UI Starts here */
  public renderCells = () => {
    const {board} = this.state

    return board.map((row, rowInd) => this.renderRow(row, rowInd))
  }

  public renderRow = (row: Player[], rowInd: number) => {
    return row.map((player, colInd) => this.renderCell(player, rowInd, colInd))
  }

  public renderCell = (player: Player, row: number, col: number) => {
    return <div className="cell" key = {row*7+col} onClick = {this.handleOnClick(col)} data-player={player.toString()}></div>
  }
  /* UI Ends here */

  render () {
    this.renderCells()
    return(
      <div className="App">
        <div className="board">
          {this.renderCells()}
        </div>
      </div>
    );
  }
}

export default App;
