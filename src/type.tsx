export type CellState = 'empty' | 'ship' | 'hit' | 'miss';
export type Board = CellState[][];

export interface Ship {
  size: number;
  positions: [number, number][];
  hits: number;
}

export interface PlayerScore {
  id: number;
  name: string;
  wins: number;
  losses: number;
  date: string;
}

export type GameDifficulty = 'easy' | 'medium' | 'hard';

export const BOARD_SIZE = 10;
export const SHIPS = [4, 3, 3, 2, 2, 2, 1, 1, 1, 1];

export interface DifficultySelectorProps {
  onSelect: (difficulty: GameDifficulty) => void;
  currentDifficulty: GameDifficulty;
}

export interface BoardProps {
  board: Board;
  onClick?: (row: number, col: number) => void;
  showShips: boolean;
  sunkShips?: [number, number][];
}

export interface ShipPlacementProps {
  onShipsPlaced: (board: Board, ships: Ship[]) => void;
  board: Board;
  setBoard: React.Dispatch<React.SetStateAction<Board>>;
}

export interface RulesPageProps {
  onBack: () => void;
}

export interface LeaderboardProps {
  scores: PlayerScore[];
  onBack: () => void;
}