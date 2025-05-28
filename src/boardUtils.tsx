import { BOARD_SIZE, SHIPS, Board, Ship } from './type.tsx';

export const createEmptyBoard = (): Board => {
  return Array(BOARD_SIZE).fill(null).map(() => 
    Array(BOARD_SIZE).fill('empty')
  );
};

export const placeShipsRandomly = (): { board: Board, ships: Ship[] } => {
  const board = createEmptyBoard();
  const ships: Ship[] = [];
  
  for (const size of SHIPS) {
    let placed = false;
    while (!placed) {
      const horizontal = Math.random() < 0.5;
      const row = Math.floor(Math.random() * (BOARD_SIZE - (horizontal ? 0 : size)));
      const col = Math.floor(Math.random() * (BOARD_SIZE - (horizontal ? size : 0)));
      
      const positions: [number, number][] = [];
      let canPlace = true;
      
      for (let i = 0; i < size; i++) {
        const r = horizontal ? row : row + i;
        const c = horizontal ? col + i : col;
        
        if (r >= BOARD_SIZE || c >= BOARD_SIZE || board[r][c] !== 'empty') {
          canPlace = false;
          break;
        }
        
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && board[nr][nc] === 'ship') {
              canPlace = false;
              break;
            }
          }
          if (!canPlace) break;
        }
        
        if (!canPlace) break;
        positions.push([r, c]);
      }
      
      if (canPlace) {
        positions.forEach(([r, c]) => {
          board[r][c] = 'ship';
        });
        ships.push({
          size,
          positions,
          hits: 0
        });
        placed = true;
      }
    }
  }
  
  return { board, ships };
};

export const checkGameOver = (ships: Ship[]): boolean => {
  return ships.every(ship => ship.hits === ship.size);
};