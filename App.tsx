import * as React from 'react';
import './App.css';

enum Player {
  None = 0,
  One = 1,
  Two = 2
}

type Board = Player[][];

interface State {
  board: Board,
  playerTurn: number
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

class App extends React.Component<{}, State> {

  state: State = {
    board: initializeBoard(),
    playerTurn: 1
  }

  /* onClick handler */
  public handleOnClick = (col: number) => () => {
    this.makeMove(col)
  }

  /* Place a coin and change turn */
  public makeMove(col: number) {
    const {board, playerTurn} = this.state

    const newBoard = board.slice()
    //newBoard[0][col] = playerTurn
    dropCoin(newBoard, col, playerTurn)
    this.setState({
      board: newBoard,
      playerTurn: playerTurn === 1? 2:1
    })
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
