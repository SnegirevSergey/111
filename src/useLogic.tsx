import { useCallback } from 'react';
import { GameDifficulty, Board, BOARD_SIZE  } from './type.tsx';


export default function useAiLogic(
  difficulty: GameDifficulty,
  lastHit: [number, number] | null,
  playerBoard: Board
) {
  const getRandomCoordinates = useCallback((): [number, number] => {
    const availableCells: [number, number][] = [];
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (playerBoard[r][c] === 'empty' || playerBoard[r][c] === 'ship') {
          availableCells.push([r, c]);
        }
      }
    }
    return availableCells[Math.floor(Math.random() * availableCells.length)];
  }, [playerBoard]);

  const getNearbyCoordinates = useCallback(([row, col]: [number, number]): [number, number] => {
    const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
    for (const [dr, dc] of directions) {
      const r = row + dr;
      const c = col + dc;
      if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && 
          (playerBoard[r][c] === 'empty' || playerBoard[r][c] === 'ship')) {
        return [r, c];
      }
    }
    return getRandomCoordinates();
  }, [playerBoard, getRandomCoordinates]);

  const getSmartCoordinates = useCallback((): [number, number] => {
    if (!lastHit) return getRandomCoordinates();
    
    // Логика для сложного компьютера
    const [lastRow, lastCol] = lastHit;
    const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
    for (const [dr, dc] of directions) {
      const r = lastRow + dr;
      const c = lastCol + dc;
      if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && 
          (playerBoard[r][c] === 'empty' || playerBoard[r][c] === 'ship')) {
        return [r, c];
      }
    }
    return getRandomCoordinates();
  }, [lastHit, playerBoard, getRandomCoordinates]);

  const getAttackCoordinates = useCallback((): [number, number] => {
    switch (difficulty) {
      case 'easy': return getRandomCoordinates();
      case 'medium': return lastHit ? getNearbyCoordinates(lastHit) : getRandomCoordinates();
      case 'hard': return getSmartCoordinates();
      default: return getRandomCoordinates();
    }
  }, [difficulty, lastHit, getRandomCoordinates, getNearbyCoordinates, getSmartCoordinates]);

  return { getAttackCoordinates };
}