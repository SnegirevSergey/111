import React, { useState, useEffect } from 'react';
import './style.css';
import RulesPage from './rule.tsx';
import BoardComponent from './board.tsx';
import ShipPlacement from './ShipPlacement.tsx';
import Leaderboard from './leaderBoard.tsx';
import PlayerVsPlayer from './PlayerVSPlayer.tsx';
import DifficultySelector from './DifficultySelector.tsx';
import { 
  Board, Ship, PlayerScore, GameDifficulty, 
  BOARD_SIZE
} from './type.tsx';
import { 
  createEmptyBoard, placeShipsRandomly, 
  checkGameOver 
} from './boardUtils.tsx';

const App: React.FC = () => {
  const [showRules, setShowRules] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showDifficultySelector, setShowDifficultySelector] = useState(false);
  const [gameMode, setGameMode] = useState<'computer' | 'player' | null>(null);
  const [playerBoard, setPlayerBoard] = useState<Board>(createEmptyBoard());
  const [computerBoard, setComputerBoard] = useState<Board>(createEmptyBoard());
  const [playerShips, setPlayerShips] = useState<Ship[]>([]);
  const [computerShips, setComputerShips] = useState<Ship[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [playerTurn, setPlayerTurn] = useState(true);
  const [isPlacingShips, setIsPlacingShips] = useState(true);
  const [playerName, setPlayerName] = useState('');
  const [player2Name, setPlayer2Name] = useState('');
  const [leaderboard, setLeaderboard] = useState<PlayerScore[]>([]);
  const [placementMode, setPlacementMode] = useState<'manual' | 'random'>('manual');
  const [difficulty, setDifficulty] = useState<GameDifficulty>('medium');
  const [lastHit, setLastHit] = useState<[number, number] | null>(null);
  const [huntDirection, setHuntDirection] = useState<'horizontal' | 'vertical' | null>(null);

  useEffect(() => {
    const savedLeaderboard = localStorage.getItem('battleship-leaderboard');
    if (savedLeaderboard) {
      setLeaderboard(JSON.parse(savedLeaderboard));
    }
  }, []);

  const saveLeaderboard = (newLeaderboard: PlayerScore[]) => {
    const sorted = [...newLeaderboard]
      .sort((a, b) => b.wins - a.wins || a.losses - b.losses)
      .slice(0, 10);
    setLeaderboard(sorted);
    localStorage.setItem('battleship-leaderboard', JSON.stringify(sorted));
  };

  const saveResult = (winnerName: string, loserName: string) => {
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    
    const newScores: PlayerScore[] = [];
    
    // Обновляем результат победителя
    const winnerIndex = leaderboard.findIndex(p => p.name === winnerName);
    if (winnerIndex >= 0) {
      const winner = {...leaderboard[winnerIndex], wins: leaderboard[winnerIndex].wins + 1};
      newScores.push(winner);
    } else {
      newScores.push({
        id: now.getTime(),
        name: winnerName,
        wins: 1,
        losses: 0,
        date
      });
    }
    
    // Обновляем результат проигравшего
    const loserIndex = leaderboard.findIndex(p => p.name === loserName);
    if (loserIndex >= 0) {
      const loser = {...leaderboard[loserIndex], losses: leaderboard[loserIndex].losses + 1};
      newScores.push(loser);
    } else {
      newScores.push({
        id: now.getTime() + 1,
        name: loserName,
        wins: 0,
        losses: 1,
        date
      });
    }
    
    // Сохраняем остальные записи
    leaderboard.forEach(score => {
      if (score.name !== winnerName && score.name !== loserName) {
        newScores.push(score);
      }
    });
    
    saveLeaderboard(newScores);
  };

  const placeRandomly = () => {
    const { board, ships } = placeShipsRandomly();
    setPlayerBoard(board);
    setPlayerShips(ships);
  };

  const startGame = (mode: 'computer' | 'player') => {
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
    setComputerBoard(cBoard);
    setComputerShips(cShips);
    setGameStarted(true);
    setGameOver(false);
    setWinner(null);
    setPlayerTurn(true);
    setShowRules(false);
    setShowLeaderboard(false);
    setShowDifficultySelector(false);
    setIsPlacingShips(true);
    setPlayerBoard(createEmptyBoard());
    setPlayerShips([]);
    setLastHit(null);
    setHuntDirection(null);
  };

  const handlePlayerAttack = (row: number, col: number) => {
    if (!playerTurn || gameOver || 
        (computerBoard[row][col] !== 'empty' && computerBoard[row][col] !== 'ship')) {
      return;
    }

    const newComputerBoard = [...computerBoard];
    let hit = false;

    if (newComputerBoard[row][col] === 'ship') {
      hit = true;
      newComputerBoard[row][col] = 'hit';
      
      const newComputerShips = computerShips.map(ship => {
        const isHit = ship.positions.some(([r, c]) => r === row && c === col);
        return isHit ? { ...ship, hits: ship.hits + 1 } : ship;
      });
      
      setComputerShips(newComputerShips);
      setComputerBoard(newComputerBoard);

      if (checkGameOver(newComputerShips)) {
        saveResult(playerName, 'Компьютер');
        setGameOver(true);
        setWinner('player');
      } else {
        setPlayerTurn(true);
      }
    } else {
      newComputerBoard[row][col] = 'miss';
      setComputerBoard(newComputerBoard);
      setPlayerTurn(false);
    }
  };

  const computerTurn = () => {
    let [row, col] = [0, 0];
    let foundTarget = false;
  
    // Легкий уровень - полностью случайные выстрелы
    if (difficulty === 'easy') {
      const availableCells: [number, number][] = [];
      for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
          if (playerBoard[r][c] === 'empty' || playerBoard[r][c] === 'ship') {
            availableCells.push([r, c]);
          }
        }
      }
      
      if (availableCells.length > 0) {
        [row, col] = availableCells[Math.floor(Math.random() * availableCells.length)];
        foundTarget = true;
      }
    }
    // Средний уровень - после попадания стреляет вокруг
    else if (difficulty === 'medium') {
      if (lastHit) {
        const [lastRow, lastCol] = lastHit;
        const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
        
        // Проверяем все 4 направления от последнего попадания
        for (const [dr, dc] of directions) {
          const newRow = lastRow + dr;
          const newCol = lastCol + dc;
          if (newRow >= 0 && newRow < BOARD_SIZE && 
              newCol >= 0 && newCol < BOARD_SIZE &&
              (playerBoard[newRow][newCol] === 'empty' || 
               playerBoard[newRow][newCol] === 'ship')) {
            row = newRow;
            col = newCol;
            foundTarget = true;
            break;
          }
        }
      }
      
      // Если не нашли цель вокруг попадания, стреляем случайно
      if (!foundTarget) {
        const availableCells: [number, number][] = [];
        for (let r = 0; r < BOARD_SIZE; r++) {
          for (let c = 0; c < BOARD_SIZE; c++) {
            if (playerBoard[r][c] === 'empty' || playerBoard[r][c] === 'ship') {
              availableCells.push([r, c]);
            }
          }
        }
        
        if (availableCells.length > 0) {
          [row, col] = availableCells[Math.floor(Math.random() * availableCells.length)];
          foundTarget = true;
        }
      }
    }
    // Сложный уровень - определяет направление корабля и добивает
    else if (difficulty === 'hard') {
      if (lastHit) {
        const [lastRow, lastCol] = lastHit;
        // Если уже определили направление, стреляем только в этом направлении
        if (huntDirection) {
          const directions = huntDirection === 'horizontal' 
            ? [[0, 1], [0, -1]] 
            : [[1, 0], [-1, 0]];
          
          for (const [dr, dc] of directions) {
            const newRow = lastRow + dr;
            const newCol = lastCol + dc;
            if (newRow >= 0 && newRow < BOARD_SIZE && 
                newCol >= 0 && newCol < BOARD_SIZE &&
                (playerBoard[newRow][newCol] === 'empty' || 
                 playerBoard[newRow][newCol] === 'ship')) {
              row = newRow;
              col = newCol;
              foundTarget = true;
              break;
            }
          }
        }
        // Если еще не определили направление, проверяем все 4 стороны
        else {
          // Сначала проверяем, есть ли соседние попадания для определения направления
          const horizontalHits = (playerBoard[lastRow][lastCol + 1] === 'hit' || 
                                playerBoard[lastRow][lastCol - 1] === 'hit');
          const verticalHits = (playerBoard[lastRow + 1]?.[lastCol] === 'hit' || 
                               playerBoard[lastRow - 1]?.[lastCol] === 'hit');
  
          if (horizontalHits) {
            setHuntDirection('horizontal');
          } else if (verticalHits) {
            setHuntDirection('vertical');
          }
  
          // Пробуем стрелять во всех направлениях
          const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
          for (const [dr, dc] of directions) {
            const newRow = lastRow + dr;
            const newCol = lastCol + dc;
            if (newRow >= 0 && newRow < BOARD_SIZE && 
                newCol >= 0 && newCol < BOARD_SIZE &&
                (playerBoard[newRow][newCol] === 'empty' || 
                 playerBoard[newRow][newCol] === 'ship')) {
              row = newRow;
              col = newCol;
              foundTarget = true;
              break;
            }
          }
        }
      }
      
      // Если не нашли цель вокруг попадания, стреляем случайно
      if (!foundTarget) {
        const availableCells: [number, number][] = [];
        for (let r = 0; r < BOARD_SIZE; r++) {
          for (let c = 0; c < BOARD_SIZE; c++) {
            if (playerBoard[r][c] === 'empty' || playerBoard[r][c] === 'ship') {
              availableCells.push([r, c]);
            }
          }
        }
        
        if (availableCells.length > 0) {
          [row, col] = availableCells[Math.floor(Math.random() * availableCells.length)];
          foundTarget = true;
        }
      }
    }
  
    // Если не нашли доступных клеток
    if (!foundTarget) {
      setGameOver(true);
      setWinner('computer');
      return;
    }
  
    // Выполняем выстрел
    const newPlayerBoard = [...playerBoard];
    let hit = false;
  
    if (newPlayerBoard[row][col] === 'ship') {
      hit = true;
      newPlayerBoard[row][col] = 'hit';
      setLastHit([row, col]);
      
      const newPlayerShips = playerShips.map(ship => {
        const isHit = ship.positions.some(([r, c]) => r === row && c === col);
        return isHit ? { ...ship, hits: ship.hits + 1 } : ship;
      });
      
      setPlayerShips(newPlayerShips);
      setPlayerBoard(newPlayerBoard);
  
      if (checkGameOver(newPlayerShips)) {
        saveResult('Компьютер', playerName);
        setGameOver(true);
        setWinner('computer');
      } else {
        // Если попал, ходит снова
        setTimeout(computerTurn, difficulty === 'easy' ? 1000 : 500);
        return;
      }
    } else {
      newPlayerBoard[row][col] = 'miss';
      setPlayerBoard(newPlayerBoard);
      if (difficulty === 'hard') {
        setHuntDirection(null);
      }
    }
  
    setPlayerTurn(true);
  };

  useEffect(() => {
    if (!playerTurn && !gameOver && gameStarted && !isPlacingShips && gameMode === 'computer') {
      const timer = setTimeout(computerTurn, 1000);
      return () => clearTimeout(timer);
    }
  }, [playerTurn, gameOver, gameStarted, isPlacingShips, gameMode]);

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
      ) : gameMode && gameStarted ? (
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
                      setPlayerBoard(board);
                      setPlayerShips(ships);
                      setIsPlacingShips(false);
                    }}
                    board={playerBoard}
                    setBoard={setPlayerBoard}
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
                      onClick={() => setIsPlacingShips(false)}
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
                          setGameStarted(false);
                          setGameMode(null);
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
              setGameStarted(false);
              setGameMode(null);
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
            <button className="menu-button" onClick={() => {
              setShowLeaderboard(true);
            }}>
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
                style={{ display: gameMode === 'player' ? 'block' : 'none' }}
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
                  setGameMode('player');
                  startGame('player');
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