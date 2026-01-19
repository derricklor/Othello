import boardEval from './boardEvalHeuristic.json' with { type: 'json' };

export function evalMove(rowIndex, colIndex, difficulty) {
    let score = 0;
    score += boardEval[difficulty][rowIndex][colIndex];
    return score;
};

// given row, col, turn, and board, return if move is valid and tiles to flip
export function isValidMove(rowIndex, colIndex, player = turn, board) {
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
            if (board[i][j] === null && isValidMove(i, j, turn, board).isValid) {
                moves.push([i, j]);
            }
        }
    }
    return moves;
};

// returns a deep copy of the given board
export function copyBoard(board) {
    const newboard = structuredClone(board);
    return newboard;
};

