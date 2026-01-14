export enum GameStatus {
  Idle = 'idle',
  Betting = 'betting',
  Playing = 'playing',
  Won = 'won',
  Lost = 'lost',
}

export enum CellStatus {
  Hidden = 'hidden',
  Safe = 'safe',
  Trap = 'trap',
  Selected = 'selected',
}

export interface Cell {
  index: number;
  status: CellStatus;
  isTrap: boolean;
}

export interface Row {
  index: number;
  cells: Cell[];
  isRevealed: boolean;
  selectedCellIndex: number | null;
}

export interface GameSession {
  id: string;
  serverSeedHash: string;
  clientSeed: string;
  nonce: number;
  cellCount: number;
  trapPositions: number[]; // Позиции ловушек для каждого ряда (скрыто до конца игры)
  bet: number;
  currentStep: number;
  currentMultiplier: number;
  status: GameStatus;
  createdAt: number;
}

export interface StepResult {
  success: boolean;
  trapIndex: number;
  newMultiplier: number;
  potentialWin: number;
}

export interface CashoutResult {
  success: boolean;
  amount: number;
  finalMultiplier: number;
}

export interface VerificationData {
  serverSeed: string;
  serverSeedHash: string;
  clientSeed: string;
  nonce: number;
  trapPositions: number[];
  isValid: boolean;
}

export interface GameState {
  status: GameStatus;
  session: GameSession | null;
  rows: Row[];
  balance: number;
  betAmount: number;
  cellCount: number;
  currentStep: number;
  currentMultiplier: number;
  potentialWin: number;
  lastResult: StepResult | null;
  history: GameHistoryEntry[];
}

export interface GameHistoryEntry {
  id: string;
  bet: number;
  result: 'won' | 'lost';
  multiplier: number;
  payout: number;
  steps: number;
  timestamp: number;
}

export type GameAction =
  | { type: 'SET_BET_AMOUNT'; payload: number }
  | { type: 'SET_CELL_COUNT'; payload: number }
  | { type: 'START_GAME'; payload: GameSession }
  | { type: 'MAKE_STEP'; payload: { rowIndex: number; cellIndex: number; result: StepResult } }
  | { type: 'CASHOUT'; payload: CashoutResult }
  | { type: 'GAME_OVER'; payload: { trapIndex: number } }
  | { type: 'RESET_GAME' }
  | { type: 'UPDATE_BALANCE'; payload: number }
  | { type: 'ADD_HISTORY_ENTRY'; payload: GameHistoryEntry };
