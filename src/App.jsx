import { useState, useEffect } from 'react'
import './App.css'
import Tile from './components/Tile'

function App() {
  const [board, setBoard] = useState(() => {
    const initialBoard = Array(8).fill(null).map(() => Array(8).fill(null));
    initialBoard[3][3] = 'white';
    initialBoard[3][4] = 'black';
    initialBoard[4][3] = 'black';
    initialBoard[4][4] = 'white';
    return initialBoard;
  });
  const [turn, setTurn] = useState('black')
  const [availableMoves, setAvailableMoves] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [turnsLeft, setTurnsLeft] = useState(60);
  const [blackCount, setBlackCount] = useState(2);
  const [whiteCount, setWhiteCount] = useState(2);

  useEffect(() => {
    const calculateAvailableMoves = () => {
      if (gameOver) return;
      const moves = [];
      for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
          if (board[i][j] === null && isValidMove(i, j).isValid) {
            moves.push([i, j]);
          }
        }
      }
      if (moves.length === 0) {
        // No available moves, check if the other player has moves
        const opponent = turn === 'black' ? 'white' : 'black';
        const opponentMoves = [];
        for (let i = 0; i < 8; i++) {
          for (let j = 0; j < 8; j++) {
            if (board[i][j] === null && isValidMove(i, j, opponent).isValid) {
              opponentMoves.push([i, j]);
            }
          }
        }
        if (opponentMoves.length === 0) {
          // Stalemate
          setGameOver(true);
          if (blackCount > whiteCount) {
            setWinner('Black');
          } else if (whiteCount > blackCount) {
            setWinner('White');
          } else {
            setWinner('Draw');
          }
        } else {
          // Pass the turn
          setTurn(opponent);
        }
      }
      setAvailableMoves(moves);
    };
    calculateAvailableMoves();
  }, [board, turn, gameOver]);

  useEffect(() => {
    if (turnsLeft === 0) {
      setGameOver(true);
      if (blackCount > whiteCount) {
        setWinner('Black');
      } else if (whiteCount > blackCount) {
        setWinner('White');
      } else {
        setWinner('Draw');
      }
    }
  }, [turnsLeft, blackCount, whiteCount]);

  useEffect(() => {
    if (blackCount === 0) {
      setGameOver(true);
      setWinner('White');
    } else if (whiteCount === 0) {
      setGameOver(true);
      setWinner('Black');
    }
  }, [blackCount, whiteCount]);

  const handleTileClick = (rowIndex, colIndex) => {
    if (gameOver) return;
    const { isValid, tilesToFlip } = isValidMove(rowIndex, colIndex);
    if (isValid) {
      const newBoard = board.map(row => [...row]);
      newBoard[rowIndex][colIndex] = turn;
      tilesToFlip.forEach(([r, c]) => {
        newBoard[r][c] = turn;
      });
      setBoard(newBoard);
      const flippedCount = tilesToFlip.length;
      if (turn === 'black') {
        setBlackCount(blackCount + flippedCount + 1);
        setWhiteCount(whiteCount - flippedCount);
      } else {
        setWhiteCount(whiteCount + flippedCount + 1);
        setBlackCount(blackCount - flippedCount);
      }
      setTurn(turn === 'black' ? 'white' : 'black');
      setTurnsLeft(turnsLeft - 1);
    }
  }

  const isValidMove = (rowIndex, colIndex, player = turn) => {
    if (board[rowIndex][colIndex] !== null) {
      return { isValid: false, tilesToFlip: [] };
    }

    const opponent = player === 'black' ? 'white' : 'black';
    const directions = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],           [0, 1],
      [1, -1], [1, 0], [1, 1]
    ];

    const tilesToFlip = [];

    for (const [dx, dy] of directions) {
      let x = rowIndex + dx;
      let y = colIndex + dy;
      const line = [];

      while (x >= 0 && x < 8 && y >= 0 && y < 8 && board[x][y] === opponent) {
        line.push([x, y]);
        x += dx;
        y += dy;
      }

      if (line.length > 0 && x >= 0 && x < 8 && y >= 0 && y < 8 && board[x][y] === player) {
        tilesToFlip.push(...line);
      }
    }

    return { isValid: tilesToFlip.length > 0, tilesToFlip };
  };


  return (
    <>
      <h1>Othello</h1>
      <div className="flex justify-between items-center mb-4">
        <span className={`p-2 rounded-full ${turn === 'black' ? 'border-4 border-yellow-400' : ''}`}>Black: {blackCount}</span>
        <span className={`p-2 rounded-full ${turn === 'white' ? 'border-4 border-yellow-400' : ''}`}>White: {whiteCount}</span>
      </div>
      {gameOver && (
        <div className="text-center">
          <h2 className="text-2xl">Game Over</h2>
          <h3 className="text-xl">{winner === 'Draw' ? 'It\'s a Draw!' : `${winner} wins!`}</h3>
        </div>
      )}
      <div className="card">
        {board.map((row, rowIndex) => (
          <div key={rowIndex} className="flex">
            {row.map((col, colIndex) => (
              <Tile 
                key={colIndex} 
                color={board[rowIndex][colIndex]} 
                onClick={() => handleTileClick(rowIndex, colIndex)}
                isAvailable={availableMoves.some(move => move[0] === rowIndex && move[1] === colIndex)}
              />
            ))}
          </div>
        ))}
      </div>
      <div>
        <p>
          Turns Left: {turnsLeft}
        </p>
      </div>
    </>
  )
}

export default App

