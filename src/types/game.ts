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

export interface DiceRoll {
  dice1: number; // 1-6
  dice2: number; // 1-6
  isDouble: boolean; // true если дубль (проигрыш)
}

export interface Cell {
  index: number;
  status: CellStatus;
  isTrap: boolean;
  diceRoll?: DiceRoll; // Бросок кубиков для этой ячейки
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
  diceRolls: DiceRoll[]; // Броски кубиков для каждого шага
  maxStep: number; // Шаг на котором выпадет дубль (проигрыш)
  bet: number;
  currentStep: number;
  currentMultiplier: number;
  status: GameStatus;
  createdAt: number;
}

export interface StepResult {
  success: boolean;
  diceRoll: DiceRoll; // Бросок кубиков на этом шаге
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
  diceRolls: DiceRoll[];
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
      payload: { result: StepResult };
    }
  | { type: ActionType.Cashout; payload: CashoutResult }
  | { type: ActionType.GameOver }
  | { type: ActionType.ResetGame }
  | { type: ActionType.UpdateBalance; payload: number }
  | { type: ActionType.AddHistoryEntry; payload: GameHistoryEntry };
