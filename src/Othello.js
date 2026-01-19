import boardEval from './boardEvalHeuristic.json' with { type: 'json' };

// given row, col, turn, and board, return if move is valid and tiles to flip
export function isValidMove(rowIndex, colIndex, player, board) {
    if (board[rowIndex][colIndex] !== null) {
        return { isValid: false, tilesToFlip: [] };
    }

    const opponent = player === 'black' ? 'white' : 'black';
    const directions = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1], [0, 1],
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

// given board game state and turn, return all available moves
export function getAvailableMoves(board, turn) {
    const moves = [];
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            if (isValidMove(i, j, turn, board).isValid) {
                moves.push([i, j]);
            }
        }
    }
    return moves;
};

// returns a deep copy of the given board
function copyBoard(board) {
    return structuredClone(board);
};

// Returns a new board state after a move has been made
function applyMove(board, move, player) {
    const newBoard = copyBoard(board);
    const { tilesToFlip } = isValidMove(move[0], move[1], player, newBoard);
    newBoard[move[0]][move[1]] = player;
    for (const [r, c] of tilesToFlip) {
        newBoard[r][c] = player;
    }
    return newBoard;
}

// Evaluates the move based on the heuristic and given player
function evaluateBoard(board, player, difficulty, lastMove) {
    let score = 0; // each tile is worth 1 point
    const opponent = player === 'black' ? 'white' : 'black';
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            if (board[i][j] === player) {
                score += 1;
            } else if (board[i][j] === opponent) {
                score -= 1;
            }
        }
    }
    //add lastmove heuristic score based on difficulty
    if (difficulty === 'hard') {
        return score + boardEval.hard[lastMove[0]][lastMove[1]];
    }
    return score + boardEval.easy[lastMove[0]][lastMove[1]];
}

function minimax(board, depth, maximizingPlayer, player, difficulty, lastMove) {
    const opponent = player === 'black' ? 'white' : 'black';
    const turn = maximizingPlayer ? player : opponent;
    const availableMoves = getAvailableMoves(board, turn);

    // Base case: depth is 0 or game is over for the current branch
    if (depth === 0 || availableMoves.length === 0) {
        return evaluateBoard(board, player, difficulty, lastMove);
    }

    if (maximizingPlayer) {
        let maxEval = -Infinity;
        for (const move of availableMoves) {
            const newBoard = applyMove(board, move, turn);
            const evalScore = minimax(newBoard, depth - 1, false, player, difficulty, move);
            maxEval = Math.max(maxEval, evalScore);
        }
        return maxEval;
    } else { // Minimizing player
        let minEval = Infinity;
        for (const move of availableMoves) {
            const newBoard = applyMove(board, move, turn);
            const evalScore = minimax(newBoard, depth - 1, true, player, difficulty, move);
            minEval = Math.min(minEval, evalScore);
        }
        return minEval;
    }
}

// AI strategy for easy, medium, hard difficulties
export function getAIMove(board, turn, difficulty) {
    const availableMoves = getAvailableMoves(board, turn);
    if (availableMoves.length === 0) return null;

    if (difficulty === 'easy') {
        const randomIndex = Math.floor(Math.random() * availableMoves.length);
        return availableMoves[randomIndex];
    }

    const depth = difficulty === 'medium' ? 1 : 3; // Depth for medium and hard
    let bestMove = null;
    let bestScore = -Infinity;

    for (const move of availableMoves) {
        const newBoard = applyMove(board, move, turn);
        // Start minimax with maximizingPlayer = false, as it's the opponent's turn next
        const score = minimax(newBoard, depth - 1, false, turn, difficulty, move);
        
        if (score > bestScore) {
            bestScore = score;
            bestMove = move;
        }
    }
    // Fallback to a random move if no best move is found (should not happen in normal play)
    return bestMove || availableMoves[0];
}