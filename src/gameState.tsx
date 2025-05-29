import { Board, Ship } from './type.tsx';
import { createEmptyBoard } from './boardUtils.tsx';

export type GameState = {
  playerBoard: Board;
  computerBoard: Board;
  playerShips: Ship[];
  computerShips: Ship[];
  gameOver: boolean;
  winner: string | null;
  playerTurn: boolean;
  isPlacingShips: boolean;
  lastHit: [number, number] | null;
  huntDirection: 'horizontal' | 'vertical' | null;
};

export type GameAction =
  | { type: 'UPDATE_PLAYER_BOARD'; board: Board }
  | { type: 'UPDATE_COMPUTER_BOARD'; board: Board }
  | { type: 'SET_PLAYER_SHIPS'; ships: Ship[] }
  | { type: 'SET_COMPUTER_SHIPS'; ships: Ship[] }
  | { type: 'SET_GAME_OVER'; winner: string }
  | { type: 'SET_PLAYER_TURN'; isPlayerTurn: boolean }
  | { type: 'SET_PLACEMENT_MODE'; isPlacing: boolean }
  | { type: 'SET_LAST_HIT'; coords: [number, number] | null }
  | { type: 'SET_HUNT_DIRECTION'; direction: 'horizontal' | 'vertical' | null }
  | { type: 'RESET_GAME' };

export const initialState: GameState = {
  playerBoard: createEmptyBoard(),
  computerBoard: createEmptyBoard(),
  playerShips: [],
  computerShips: [],
  gameOver: false,
  winner: null,
  playerTurn: true,
  isPlacingShips: true,
  lastHit: null,
  huntDirection: null
};

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'UPDATE_PLAYER_BOARD':
      return { ...state, playerBoard: action.board };
    case 'UPDATE_COMPUTER_BOARD':
      return { ...state, computerBoard: action.board };
    case 'SET_PLAYER_SHIPS':
      return { ...state, playerShips: action.ships };
    case 'SET_COMPUTER_SHIPS':
      return { ...state, computerShips: action.ships };
    case 'SET_GAME_OVER':
      return { ...state, gameOver: true, winner: action.winner };
    case 'SET_PLAYER_TURN':
      return { ...state, playerTurn: action.isPlayerTurn };
    case 'SET_PLACEMENT_MODE':
      return { ...state, isPlacingShips: action.isPlacing };
    case 'SET_LAST_HIT':
      return { ...state, lastHit: action.coords };
    case 'SET_HUNT_DIRECTION':
      return { ...state, huntDirection: action.direction };
    case 'RESET_GAME':
      return { ...initialState };
    default:
      return state;
  }
}