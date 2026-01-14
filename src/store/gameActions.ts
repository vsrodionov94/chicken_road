import {
  ActionType,
  type GameAction,
  type GameSession,
  type StepResult,
  type CashoutResult,
  type GameHistoryEntry,
} from '../types/game';

export const setBetAmount = (amount: number): GameAction => ({
  type: ActionType.SetBetAmount,
  payload: amount,
});

export const setCellCount = (count: number): GameAction => ({
  type: ActionType.SetCellCount,
  payload: count,
});

export const startGame = (session: GameSession): GameAction => ({
  type: ActionType.StartGame,
  payload: session,
});

export const makeStep = (result: StepResult): GameAction => ({
  type: ActionType.MakeStep,
  payload: { result },
});

export const cashoutAction = (result: CashoutResult): GameAction => ({
  type: ActionType.Cashout,
  payload: result,
});

export const gameOver = (): GameAction => ({
  type: ActionType.GameOver,
});

export const resetGame = (): GameAction => ({
  type: ActionType.ResetGame,
});

export const updateBalance = (balance: number): GameAction => ({
  type: ActionType.UpdateBalance,
  payload: balance,
});

export const addHistoryEntry = (entry: GameHistoryEntry): GameAction => ({
  type: ActionType.AddHistoryEntry,
  payload: entry,
});
