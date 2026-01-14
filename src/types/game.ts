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

export enum ActionType {
  SetBetAmount = 'SET_BET_AMOUNT',
  SetCellCount = 'SET_CELL_COUNT',
  StartGame = 'START_GAME',
  MakeStep = 'MAKE_STEP',
  Cashout = 'CASHOUT',
  GameOver = 'GAME_OVER',
  ResetGame = 'RESET_GAME',
  UpdateBalance = 'UPDATE_BALANCE',
  AddHistoryEntry = 'ADD_HISTORY_ENTRY',
}

export enum GameResult {
  Won = 'won',
  Lost = 'lost',
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
  result: GameResult;
  multiplier: number;
  payout: number;
  steps: number;
  timestamp: number;
}

export type GameAction =
  | { type: ActionType.SetBetAmount; payload: number }
  | { type: ActionType.SetCellCount; payload: number }
  | { type: ActionType.StartGame; payload: GameSession }
  | {
      type: ActionType.MakeStep;
      payload: { rowIndex: number; cellIndex: number; result: StepResult };
    }
  | { type: ActionType.Cashout; payload: CashoutResult }
  | { type: ActionType.GameOver; payload: { trapIndex: number } }
  | { type: ActionType.ResetGame }
  | { type: ActionType.UpdateBalance; payload: number }
  | { type: ActionType.AddHistoryEntry; payload: GameHistoryEntry };
