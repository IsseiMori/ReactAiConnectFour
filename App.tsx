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

    const newBoard = board.slice()
    //newBoard[0][col] = playerTurn
    dropCoin(newBoard, col, playerTurn)

    const gameState = gameCompleted(newBoard);
    this.setState({
      board: newBoard,
      playerTurn: playerTurn === 1? 2:1,
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
