import React, { useState } from 'react';
import { Board, Ship } from './type.tsx';
import BoardComponent from './board.tsx';

const BOARD_SIZE = 10;
const SHIPS: number[] = [4, 3, 3, 2, 2, 2, 1, 1, 1, 1];

interface ShipPlacementProps {
  onShipsPlaced: (board: Board, ships: Ship[]) => void;
  board: Board;
  setBoard: React.Dispatch<React.SetStateAction<Board>>;
}

const ShipPlacement: React.FC<ShipPlacementProps> = ({ 
  onShipsPlaced, 
  board,
  setBoard 
}) => {
  const [ships, setShips] = useState<Ship[]>([]);
  const [currentShipSize, setCurrentShipSize] = useState<number | null>(null);
  const [isHorizontal, setIsHorizontal] = useState(true);

  const handleCellClick = (row: number, col: number) => {
    if (!currentShipSize) return;

    const canPlace = canPlaceShip(row, col, currentShipSize, isHorizontal, board);
    
    if (canPlace) {
      const newBoard = board.map(row => [...row]) as Board;
      const newShip: Ship = {
        size: currentShipSize,
        positions: [],
        hits: 0
      };

      for (let i = 0; i < currentShipSize; i++) {
        const r = isHorizontal ? row : row + i;
        const c = isHorizontal ? col + i : col;
        newBoard[r][c] = 'ship';
        newShip.positions.push([r, c]);
      }

      setBoard(newBoard);
      setShips([...ships, newShip]);
      setCurrentShipSize(null);
    }
  };

  const canPlaceShip = (row: number, col: number, size: number, horizontal: boolean, board: Board): boolean => {
    if (horizontal) {
      if (col + size > BOARD_SIZE) return false;
    } else {
      if (row + size > BOARD_SIZE) return false;
    }

    for (let i = 0; i < size; i++) {
      const r = horizontal ? row : row + i;
      const c = horizontal ? col + i : col;

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
  };

  const handleRotate = () => {
    setIsHorizontal(!isHorizontal);
  };

  const handleConfirm = () => {
    if (ships.length === SHIPS.length) {
      onShipsPlaced(board, ships);
    }
  };

  return (
    <div className="ship-placement">
      <div className="placement-board">
        <BoardComponent 
          board={board} 
          onClick={handleCellClick} 
          showShips={true}
          sunkShips={[]}
        />
      </div>
      
      <div className="ship-selection">
        <h3>Выберите корабль для размещения:</h3>
        <div className="ship-buttons">
          {SHIPS.map((size, index) => (
            <button 
              key={index}
              onClick={() => setCurrentShipSize(size)}
              disabled={ships.filter(s => s.size === size).length >= 
                       SHIPS.filter(s => s === size).length}
            >
              Корабль ({size} клетки)
            </button>
          ))}
        </div>
        
        <button onClick={handleRotate}>
          Повернуть: {isHorizontal ? "Горизонтально" : "Вертикально"}
        </button>
        
        <button 
          onClick={handleConfirm}
          disabled={ships.length !== SHIPS.length}
        >
          Подтвердить расстановку
        </button>
      </div>
    </div>
  );
};

export default ShipPlacement;