import { useReducer, useState, useEffect, useCallback } from 'react';
import './style.css';
import RulesPage from './rule.tsx';
import BoardComponent from './board.tsx';
import ShipPlacement from './ShipPlacement.tsx';
import Leaderboard from './leaderBoard.tsx';
import PlayerVsPlayer from './PlayerVSPlayer.tsx';
import DifficultySelector from './DifficultySelector.tsx';
import {Board,GameDifficulty, PlayerScore } from './type.tsx';
import { gameReducer, initialState } from './gameState.tsx';
import useAiLogic from './useLogic.tsx';
import useLocalStorage from './useLocalStorage.tsx';
import { createEmptyBoard, checkGameOver, placeShipsRandomly } from './boardUtils.tsx';


const App = () => {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const {
    playerBoard,
    computerBoard,
    playerShips,
    computerShips,
    gameOver,
    winner,
    playerTurn,
    isPlacingShips,
    lastHit,
  } = state;

  const [showRules, setShowRules] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showDifficultySelector, setShowDifficultySelector] = useState(false);
  const [gameMode, setGameMode] = useState<'computer' | 'player' | null>(null);
  const [playerName, setPlayerName] = useState('');
  const [player2Name, setPlayer2Name] = useState('');
  const [placementMode, setPlacementMode] = useState<'manual' | 'random'>('manual');
  const [difficulty, setDifficulty] = useState<GameDifficulty>('medium');
  const [leaderboard, setLeaderboard] = useLocalStorage<PlayerScore[]>('battleship-leaderboard', []);

  const { getAttackCoordinates } = useAiLogic(difficulty, lastHit, playerBoard);

  const startGame = useCallback((mode: 'computer' | 'player') => {
    if (!playerName.trim()) {
      alert('Введите ваше имя');
      return;
    }

    if (mode === 'player' && !player2Name.trim()) {
      alert('Введите имя второго игрока');
      return;
    }

    setGameMode(mode);
    const { board: cBoard, ships: cShips } = placeShipsRandomly();
    dispatch({ type: 'UPDATE_COMPUTER_BOARD', board: cBoard });
    dispatch({ type: 'SET_COMPUTER_SHIPS', ships: cShips });
    dispatch({ type: 'SET_PLAYER_TURN', isPlayerTurn: true });
    dispatch({ type: 'SET_PLACEMENT_MODE', isPlacing: true });
    dispatch({ type: 'UPDATE_PLAYER_BOARD', board: createEmptyBoard() });
    dispatch({ type: 'SET_PLAYER_SHIPS', ships: [] });
    dispatch({ type: 'SET_LAST_HIT', coords: null });
    dispatch({ type: 'SET_HUNT_DIRECTION', direction: null });
    setShowRules(false);
    setShowLeaderboard(false);
    setShowDifficultySelector(false);
  }, [playerName, player2Name]);

  // Ход компьютера
  const computerTurn = useCallback(() => {
    const [row, col] = getAttackCoordinates();
    const newPlayerBoard = [...playerBoard] as Board;
    let hit= false;

    if (newPlayerBoard[row][col] === 'ship') {
      hit = true;
      newPlayerBoard[row][col] = 'hit';
      dispatch({ type: 'SET_LAST_HIT', coords: [row, col] });
      
      const newPlayerShips = playerShips.map(ship => {
        const isHit = ship.positions.some(([r, c]) => r === row && c === col);
        return isHit ? { ...ship, hits: ship.hits + 1 } : ship;
      });
      
      dispatch({ type: 'SET_PLAYER_SHIPS', ships: newPlayerShips });
      dispatch({ type: 'UPDATE_PLAYER_BOARD', board: newPlayerBoard });

      if (checkGameOver(newPlayerShips)) {
        saveResult('Компьютер', playerName);
        dispatch({ type: 'SET_GAME_OVER', winner: 'computer' });
      } else {
        setTimeout(computerTurn, difficulty === 'easy' ? 1000 : 500);
        return;
      }
    } else {
      newPlayerBoard[row][col] = 'miss';
      dispatch({ type: 'UPDATE_PLAYER_BOARD', board: newPlayerBoard });
      if (difficulty === 'hard') {
        dispatch({ type: 'SET_HUNT_DIRECTION', direction: null });
      }
    }
    dispatch({ type: 'SET_PLAYER_TURN', isPlayerTurn: true });
  }, [playerBoard, playerShips, difficulty, playerName, getAttackCoordinates]);

  // Обработка атаки игрока
  const handlePlayerAttack = useCallback((row: number, col: number) => {
    if (!playerTurn || gameOver || 
        (computerBoard[row][col] !== 'empty' && computerBoard[row][col] !== 'ship')) {
      return;
    }

    const newComputerBoard = [...computerBoard] as Board;
    let hit = false;

    if (newComputerBoard[row][col] === 'ship') {
      hit = true;
      newComputerBoard[row][col] = 'hit';
      
      const newComputerShips = computerShips.map(ship => {
        const isHit = ship.positions.some(([r, c]) => r === row && c === col);
        return isHit ? { ...ship, hits: ship.hits + 1 } : ship;
      });
      
      dispatch({ type: 'SET_COMPUTER_SHIPS', ships: newComputerShips });
      dispatch({ type: 'UPDATE_COMPUTER_BOARD', board: newComputerBoard });

      if (checkGameOver(newComputerShips)) {
        saveResult(playerName, 'Компьютер');
        dispatch({ type: 'SET_GAME_OVER', winner: 'player' });
      } else {
        dispatch({ type: 'SET_PLAYER_TURN', isPlayerTurn: true });
      }
    } else {
      newComputerBoard[row][col] = 'miss';
      dispatch({ type: 'UPDATE_COMPUTER_BOARD', board: newComputerBoard });
      dispatch({ type: 'SET_PLAYER_TURN', isPlayerTurn: false });
    }
  }, [playerTurn, gameOver, computerBoard, computerShips, playerName]);

  // Сохранение результатов
  const saveResult = useCallback((winnerName: string, loserName: string) => {
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    
    const newScores: PlayerScore[] = [...leaderboard];
    
    // Обновляем победителя
    const winnerIndex = newScores.findIndex(p => p.name === winnerName);
    if (winnerIndex >= 0) {
      newScores[winnerIndex] = {...newScores[winnerIndex], wins: newScores[winnerIndex].wins + 1};
    } else {
      newScores.push({
        id: now.getTime(),
        name: winnerName,
        wins: 1,
        losses: 0,
        date
      });
    }
    
    // Обновляем проигравшего
    const loserIndex = newScores.findIndex(p => p.name === loserName);
    if (loserIndex >= 0) {
      newScores[loserIndex] = {...newScores[loserIndex], losses: newScores[loserIndex].losses + 1};
    } else {
      newScores.push({
        id: now.getTime() + 1,
        name: loserName,
        wins: 0,
        losses: 1,
        date
      });
    }
    
    setLeaderboard(newScores.sort((a, b) => b.wins - a.wins || a.losses - b.losses).slice(0, 10));
  }, [leaderboard, setLeaderboard]);

  // Автоматический ход компьютера
  useEffect(() => {
    if (!playerTurn && !gameOver && gameMode === 'computer' && !isPlacingShips) {
      const timer = setTimeout(computerTurn, 1000);
      return () => clearTimeout(timer);
    }
  }, [playerTurn, gameOver, gameMode, isPlacingShips, computerTurn]);

  // Ручная расстановка кораблей
  const placeRandomly = useCallback(() => {
    const { board, ships } = placeShipsRandomly();
    dispatch({ type: 'UPDATE_PLAYER_BOARD', board });
    dispatch({ type: 'SET_PLAYER_SHIPS', ships });
  }, []);

  // Рендер игры
  return (
    <div className="app">
      {showRules ? (
        <RulesPage onBack={() => setShowRules(false)} />
      ) : showLeaderboard ? (
        <Leaderboard 
          scores={leaderboard} 
          onBack={() => setShowLeaderboard(false)}
        />
      ) : showDifficultySelector ? (
        <div className="difficulty-screen">
          <h2>Выберите сложность игры</h2>
          <DifficultySelector 
            onSelect={(selectedDifficulty) => {
              setDifficulty(selectedDifficulty);
              startGame('computer');
            }} 
            currentDifficulty={difficulty}
          />
          <button 
            className="back-button" 
            onClick={() => setShowDifficultySelector(false)}
          >
            Назад
          </button>
        </div>
      ) : gameMode ? (
        gameMode === 'computer' ? (
          <>
            {isPlacingShips ? (
              <div className="placement-screen">
                <h2>Расстановка кораблей</h2>
                <div className="placement-options">
                  <button 
                    className={`placement-option ${placementMode === 'manual' ? 'active' : ''}`}
                    onClick={() => setPlacementMode('manual')}
                  >
                    Вручную
                  </button>
                  <button 
                    className={`placement-option ${placementMode === 'random' ? 'active' : ''}`}
                    onClick={() => setPlacementMode('random')}
                  >
                    Случайно
                  </button>
                </div>

                {placementMode === 'manual' ? (
                  <ShipPlacement 
                  onShipsPlaced={(board, ships) => {
                    dispatch({ type: 'UPDATE_PLAYER_BOARD', board });

                    dispatch({ type: 'SET_PLAYER_SHIPS', ships });

                    dispatch({ type: 'SET_PLACEMENT_MODE', isPlacing: false });
                  }}
                  board={playerBoard}
                  setBoard={(board: Board) => dispatch({ type: 'UPDATE_PLAYER_BOARD', board })}
                  />
                ) : (
                  <div className="random-placement">
                    <BoardComponent 
                      board={playerBoard} 
                      showShips={true} 
                      sunkShips={[]}
                    />
                    <button className="random-button" onClick={placeRandomly}>
                      Случайная расстановка
                    </button>
                    <button 
                      className="confirm-button" 
                      onClick={() => dispatch({ type: 'SET_PLACEMENT_MODE', isPlacing: false })}
                      disabled={playerShips.length === 0}
                    >
                      Подтвердить
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="game-screen">
                <div className="boards-container">
                  <div className="board-container">
                    <h2>{playerName || 'Вы'}</h2>
                    <BoardComponent 
                      board={playerBoard} 
                      showShips={true}
                      sunkShips={playerShips
                        .filter(ship => ship.hits === ship.size)
                        .flatMap(ship => ship.positions)}
                    />
                  </div>
                  <div className="board-container">
                    <h2>Компьютер</h2>
                    <BoardComponent
                      board={computerBoard}
                      onClick={handlePlayerAttack}
                      showShips={false}
                      sunkShips={computerShips
                        .filter(ship => ship.hits === ship.size)
                        .flatMap(ship => ship.positions)}
                    />
                  </div>
                </div>

                <div className="game-status">
                  {gameOver ? (
                    <div className="game-over">
                      <h2>{winner === 'player' ? 'Вы победили!' : 'Компьютер победил!'}</h2>
                      <button 
                        className="restart-button" 
                        onClick={() => {
                          setGameMode(null);
                          dispatch({ type: 'RESET_GAME' });
                        }}
                      >
                        В главное меню
                      </button>
                    </div>
                  ) : (
                    <h2>{playerTurn ? 'Ваш ход' : 'Ход компьютера...'}</h2>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <PlayerVsPlayer
            player1Name={playerName}
            player2Name={player2Name}
            onBack={() => {
              setGameMode(null);
              dispatch({ type: 'RESET_GAME' });
            }}
            onGameEnd={(winnerName, loserName) => {
              saveResult(winnerName, loserName);
            }}
          />
        )
      ) : (
        <>
          <h1 className="title">Морской бой</h1>
          <div className="menu-buttons">
            <button className="menu-button" onClick={() => setShowRules(true)}>
              Правила
            </button>
            <button className="menu-button" onClick={() => setShowLeaderboard(true)}>
              Таблица лидеров
            </button>
          </div>

          <div className="start-screen">
            <div className="name-input">
              <input
                type="text"
                placeholder="Ваше имя"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
              />
              <input
                type="text"
                placeholder="Имя второго игрока"
                value={player2Name}
                onChange={(e) => setPlayer2Name(e.target.value)}
              />
            </div>
            <div className="game-mode-buttons">
              <button 
                className="mode-button" 
                onClick={() => setShowDifficultySelector(true)}
              >
                Игра с компьютером
              </button>
              <button 
                className="mode-button" 
                onClick={() => {
                  if (!playerName.trim() || !player2Name.trim()) {
                    alert('Введите имена обоих игроков');
                    return;
                  }
                  setGameMode('player');
                }}
              >
                Игра с другом
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default App;