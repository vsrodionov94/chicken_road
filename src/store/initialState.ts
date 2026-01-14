import { GameStatus, type GameState } from '../types/game';
import { INITIAL_BALANCE, DEFAULT_CELL_COUNT, DEFAULT_BET_AMOUNT } from '../constants/game';
import { createInitialRows } from '../utils/rows';

export const initialState: GameState = {
  status: GameStatus.Idle,
  session: null,
  rows: createInitialRows(DEFAULT_CELL_COUNT),
  balance: INITIAL_BALANCE,
  betAmount: DEFAULT_BET_AMOUNT,
  cellCount: DEFAULT_CELL_COUNT,
  currentStep: 0,
  currentMultiplier: 1,
  potentialWin: 0,
  lastResult: null,
  history: [],
};
