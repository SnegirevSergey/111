import React from 'react';
import { Board } from './type.tsx';

interface BoardProps {
  board: Board;
  onClick?: (row: number, col: number) => void;
  showShips: boolean;
  sunkShips?: [number, number][]; 
}

const BoardComponent: React.FC<BoardProps> = ({ board, onClick, showShips, sunkShips = [] }) => {
  const handleClick = (row: number, col: number) => {
    if (board[row][col] === 'hit' || board[row][col] === 'miss') {
      return;
    }
    onClick && onClick(row, col);
  };

  // Проверяем, является ли клетка частью потопленного корабля
  const isSunk = (row: number, col: number) => {
    return sunkShips.some(([r, c]) => r === row && c === col);
  };

  return (
    <div className="board">
      {board.map((row, rowIndex) => (
        <div key={rowIndex} className="board-row">
          {row.map((cell, colIndex) => (
            <div
              key={colIndex}
              className={`cell ${
                cell === 'ship' && showShips ? 'ship' : 
                cell === 'hit' ? (isSunk(rowIndex, colIndex) ? 'sunk' : 'hit') : 
                cell === 'miss' ? 'miss' : ''
              }`}
              onClick={() => handleClick(rowIndex, colIndex)}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default BoardComponent;