import { useState, useEffect } from 'react'
import Tile from './components/Tile'
import { isValidMove, getAvailableMoves, getAIMove } from './Othello.js'

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

    const [mode, setMode] = useState('pve');// 'pvp' or 'pve'
    const [difficulty, setDifficulty] = useState('easy');

    const [isDarkTheme, setIsDarkTheme] = useState(() => {
        // Check for saved theme preference on component mount
        const savedTheme = localStorage.getItem('theme');
        return savedTheme === 'dark';
    });

    // useEffect to apply/remove 'dark' class to body and update localStorage
    useEffect(() => {
        if (isDarkTheme) {
            document.body.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkTheme]); // Re-run when isDarkTheme changes

    // Function to toggle the theme
    const toggleTheme = () => {
        setIsDarkTheme(!isDarkTheme);
    };

    // AI move logic
    useEffect(() => {
        if (mode === 'pve' && turn === 'white' && !gameOver) {
            // AI's turn
            const timer = setTimeout(() => {
                const aiMove = getAIMove(board, 'white', difficulty);
                if (aiMove) {
                    makeMove(aiMove[0], aiMove[1]);
                }
            }, 1000); // 1-second delay for AI move
            return () => clearTimeout(timer); // Cleanup timer on re-render
        }
    }, [turn, mode, gameOver, board, difficulty]);

    useEffect(() => {
        if (gameOver) return;
        const retMoves = getAvailableMoves(board, turn);
        if (retMoves.length === 0) {
            // No available moves, check if the other player has moves
            const opponent = turn === 'black' ? 'white' : 'black';
            const oppMoves = getAvailableMoves(board, opponent);
            if (oppMoves.length === 0) {
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
        setAvailableMoves(retMoves);
    }, [board, turn, gameOver]);

    // Check for game over based on turns left
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

    // Check for game over if a player has no pieces left
    useEffect(() => {
        if (blackCount === 0) {
            setGameOver(true);
            setWinner('White');
        } else if (whiteCount === 0) {
            setGameOver(true);
            setWinner('Black');
        }
    }, [blackCount, whiteCount]);

    // General move execution logic
    const makeMove = (rowIndex, colIndex) => {
        const { isValid, tilesToFlip } = isValidMove(rowIndex, colIndex, turn, board);
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
    };

    // Click handler for human players
    const handleTileClick = (rowIndex, colIndex) => {
        if (gameOver) return;
        // Prevent player from moving during AI's turn
        if (mode === 'pve' && turn === 'white') return;

        makeMove(rowIndex, colIndex);
    }


    const resetGame = () => {
        setBoard(() => {
            const initialBoard = Array(8).fill(null).map(() => Array(8).fill(null));
            initialBoard[3][3] = 'white';
            initialBoard[3][4] = 'black';
            initialBoard[4][3] = 'black';
            initialBoard[4][4] = 'white';
            return initialBoard;
        });
        setTurn('black');
        setAvailableMoves([]);
        setGameOver(false);
        setWinner(null);
        setTurnsLeft(60);
        setBlackCount(2);
        setWhiteCount(2);
    };

    return (
        <div className="flex flex-col justify-center items-center bg-white dark:bg-gray-800 text-black dark:text-white">
            <h1>Othello</h1>
            <div className="flex space-x-4 mb-4">
                <button onClick={toggleTheme} className="p-2 border rounded">
                    Switch to {isDarkTheme ? 'Light' : 'Dark'} Theme
                </button>
                <select value={mode} onChange={(e) => setMode(e.target.value)} className="p-2 border rounded bg-white dark:bg-gray-700">
                    <option value="pvp">Player vs Player</option>
                    <option value="pve">Player vs AI</option>
                </select>
                {mode === 'pve' && (
                    <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="p-2 border rounded bg-white dark:bg-gray-700">
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                    </select>
                )}
            </div>
            <div className="flex justify-between items-center mb-4 w-64">
                <span className={`p-2 rounded-full ${turn === 'black' ? 'border-4 border-yellow-400' : ''}`}>Black: {blackCount}</span>
                <span className={`p-2 rounded-full ${turn === 'white' ? 'border-4 border-yellow-400' : ''}`}>White: {whiteCount}</span>
            </div>
            <div className="flex items-center space-x-4 mb-4">
                <span> Turns Left: {turnsLeft} </span>
                <button onClick={() => resetGame()}
                    className='p-2 border rounded'>
                    Reset</button>
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
        </div>
    )
}

export default App

