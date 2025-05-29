import { useState, useCallback } from 'react';
import { Board, Ship, BOARD_SIZE  } from './type.tsx';
import { placeShipsRandomly } from './boardUtils.tsx';

export default function useGameBoard(initialBoard: Board) {
  const [board, setBoard] = useState<Board>(initialBoard);
  const [ships, setShips] = useState<Ship[]>([]);

  const placeShip = useCallback((ship: Ship) => {
    const newBoard = [...board.map(row => [...row])] as Board;
    ship.positions.forEach(([r, c]) => {
      newBoard[r][c] = 'ship';
    });
    setBoard(newBoard);
    setShips(prev => [...prev, ship]);
  }, [board]);

  const placeRandomly = useCallback(() => {
    const { board: newBoard, ships: newShips } = placeShipsRandomly();
    setBoard(newBoard);
    setShips(newShips);
  }, []);

  const resetBoard = useCallback(() => {
    setBoard(initialBoard);
    setShips([]);
  }, [initialBoard]);

  const canPlaceShip = useCallback((
    row: number, 
    col: number, 
    size: number, 
    isHorizontal: boolean
  ): boolean => {
    if (isHorizontal) {
      if (col + size > BOARD_SIZE) return false;
    } else {
      if (row + size > BOARD_SIZE) return false;
    }

    for (let i = 0; i < size; i++) {
      const r = isHorizontal ? row : row + i;
      const c = isHorizontal ? col + i : col;

      if (board[r][c] !== 'empty') return false;

      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && board[nr][nc] === 'ship') {
            return false;
          }
        }
      }
    }
    return true;
  }, [board]);

  return { 
    board, 
    ships, 
    setBoard,
    placeShip, 
    placeRandomly, 
    resetBoard, 
    canPlaceShip 
  };
}