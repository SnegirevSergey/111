import React, { useState } from 'react';
import BoardComponent from './board.tsx';
import ShipPlacement from './ShipPlacement.tsx';
import { Board, Ship } from './type.tsx';
import { placeShipsRandomly, checkGameOver, createEmptyBoard } from './boardUtils.tsx';

interface PlayerVsPlayerProps {
  player1Name: string;
  player2Name: string;
  onBack: () => void;
  onGameEnd: (winnerName: string, loserName: string) => void;
}

const PlayerVsPlayer: React.FC<PlayerVsPlayerProps> = ({ 
  player1Name, 
  player2Name,
  onBack,
  onGameEnd
}) => {
  const [currentPlayer, setCurrentPlayer] = useState<'player1' | 'player2'>('player1');
  const [player1Board, setPlayer1Board] = useState<Board>(createEmptyBoard());
  const [player2Board, setPlayer2Board] = useState<Board>(createEmptyBoard());
  const [player1Ships, setPlayer1Ships] = useState<Ship[]>([]);
  const [player2Ships, setPlayer2Ships] = useState<Ship[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [placementStage, setPlacementStage] = useState<'player1' | 'player2' | 'game'>('player1');
  const [placementMode, setPlacementMode] = useState<'manual' | 'random'>('manual');

  const placeRandomly = (player: 'player1' | 'player2') => {
    const { board, ships } = placeShipsRandomly();
    if (player === 'player1') {
      setPlayer1Board(board);
      setPlayer1Ships(ships);
    } else {
      setPlayer2Board(board);
      setPlayer2Ships(ships);
    }
  };

  const confirmPlacement = () => {
    if (
      (placementStage === 'player1' && player1Ships.length === 0) ||
      (placementStage === 'player2' && player2Ships.length === 0)
    ) {
      alert('Необходимо расставить корабли перед подтверждением');
      return;
    }
    nextPlacementStage();
  };

  const nextPlacementStage = () => {
    if (placementStage === 'player1') {
      setPlacementStage('player2');
      setPlacementMode('manual'); // Сбрасываем режим для второго игрока
    } else if (placementStage === 'player2') {
      setPlacementStage('game');
    }
  };

  const handleAttack = (row: number, col: number) => {
    if (gameOver) return;

    const isPlayer1Turn = currentPlayer === 'player1';
    const targetBoard = isPlayer1Turn ? [...player2Board] : [...player1Board];
    const targetShips = isPlayer1Turn ? [...player2Ships] : [...player1Ships];

    // Проверяем, можно ли стрелять в эту клетку
    if (targetBoard[row][col] !== 'empty' && targetBoard[row][col] !== 'ship') {
      return;
    }

    let hit = false;
    if (targetBoard[row][col] === 'ship') {
      hit = true;
      targetBoard[row][col] = 'hit';
      
      // Обновляем состояние кораблей
      const updatedShips = targetShips.map(ship => {
        const isHit = ship.positions.some(([r, c]) => r === row && c === col);
        return isHit ? { ...ship, hits: ship.hits + 1 } : ship;
      });

      if (isPlayer1Turn) {
        setPlayer2Ships(updatedShips);
        setPlayer2Board(targetBoard);
      } else {
        setPlayer1Ships(updatedShips);
        setPlayer1Board(targetBoard);
      }

      // Проверяем, все ли корабли потоплены
      if (checkGameOver(updatedShips)) {
        setGameOver(true);
        const winnerName = isPlayer1Turn ? player1Name : player2Name;
        const loserName = isPlayer1Turn ? player2Name : player1Name;
        setWinner(winnerName);
        onGameEnd(winnerName, loserName);
        return;
      }
    } else {
      targetBoard[row][col] = 'miss';
      if (isPlayer1Turn) {
        setPlayer2Board(targetBoard);
      } else {
        setPlayer1Board(targetBoard);
      }
    }

    // Передаем ход другому игроку, если не было попадания
    if (!hit) {
      setCurrentPlayer(isPlayer1Turn ? 'player2' : 'player1');
    }
  };

  return (
    <div className="player-vs-player">
      {placementStage !== 'game' ? (
        <div className="placement-screen">
          <h2>
            {placementStage === 'player1' 
              ? `${player1Name}, расставьте корабли`
              : `${player2Name}, расставьте корабли`}
          </h2>
          <div className="placement-options">
            <button 
              className={`placement-option ${placementMode === 'manual' ? 'active' : ''}`}
              onClick={() => setPlacementMode('manual')}
            >
              Вручную
            </button>
            <button 
              className={`placement-option ${placementMode === 'random' ? 'active' : ''}`}
              onClick={() => placeRandomly(placementStage)}
            >
              Случайно
            </button>
          </div>

          {placementMode === 'manual' ? (
            <ShipPlacement 
              onShipsPlaced={(board, ships) => {
                if (placementStage === 'player1') {
                  setPlayer1Board(board);
                  setPlayer1Ships(ships);
                } else {
                  setPlayer2Board(board);
                  setPlayer2Ships(ships);
                }
              }}
              board={placementStage === 'player1' ? player1Board : player2Board}
              setBoard={placementStage === 'player1' ? setPlayer1Board : setPlayer2Board}
            />
          ) : (
            <div className="random-placement">
              <BoardComponent 
                board={placementStage === 'player1' ? player1Board : player2Board} 
                showShips={true} 
                sunkShips={[]}
              />
            </div>
          )}

          <div className="placement-controls">
            <button 
              className="confirm-button" 
              onClick={confirmPlacement}
            >
              Подтвердить расстановку
            </button>
          </div>
        </div>
      ) : gameOver ? (
        <div className="game-over-screen">
          <h2>{winner} победил!</h2>
          <button className="back-button" onClick={onBack}>
            В главное меню
          </button>
        </div>
      ) : (
        <div className="game-screen">
          <div className="game-info">
            <h2 className="current-turn">Сейчас ходит: {currentPlayer === 'player1' ? player1Name : player2Name}</h2>
            <h3 className="next-turn">Следующий ход: {currentPlayer === 'player1' ? player2Name : player1Name}</h3>
          </div>

          <div className="boards-container">
            <div className="player-board">
              <h3>{currentPlayer === 'player1' ? player1Name : player2Name}</h3>
              <p>Ваше поле</p>
              <BoardComponent
                board={currentPlayer === 'player1' ? player1Board : player2Board}
                showShips={true}
                sunkShips={(currentPlayer === 'player1' ? player1Ships : player2Ships)
                  .filter(ship => ship.hits === ship.size)
                  .flatMap(ship => ship.positions)}
              />
            </div>

            <div className="enemy-board">
              <h3>{currentPlayer === 'player1' ? player2Name : player1Name}</h3>
              <p>Поле противника</p>
              <BoardComponent
                board={currentPlayer === 'player1' ? player2Board : player1Board}
                onClick={handleAttack}
                showShips={false}
                sunkShips={(currentPlayer === 'player1' ? player2Ships : player1Ships)
                  .filter(ship => ship.hits === ship.size)
                  .flatMap(ship => ship.positions)}
              />
            </div>
          </div>

          <button className="back-button" onClick={onBack}>
            В главное меню
          </button>
        </div>
      )}
    </div>
  );
};

export default PlayerVsPlayer;