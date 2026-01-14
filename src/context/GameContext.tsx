import { createContext, useContext, useReducer, useCallback, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from './ToastContext';
import { GameStatus, GameResult, type GameState, type GameHistoryEntry } from '../types/game';
import { MIN_CELL_COUNT, MAX_CELL_COUNT } from '../constants/game';
import { gameReducer } from '../store/gameReducer';
import { initialState } from '../store/initialState';
import * as actions from '../store/gameActions';
import { startGame as apiStartGame, makeStep, cashout } from '../services/mockApi';
import { calculateMultiplier } from '../utils/coefficients';

interface GameContextValue {
  state: GameState;
  startNewGame: () => Promise<void>;
  selectCell: (rowIndex: number, cellIndex: number) => Promise<void>;
  cashoutGame: () => Promise<void>;
  resetGame: () => void;
  setBetAmount: (amount: number) => void;
  setCellCount: (count: number) => void;
  getNextMultiplier: () => number;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [state, dispatch] = useReducer(gameReducer, initialState);

  const startNewGame = useCallback(async () => {
    if (state.betAmount > state.balance) {
      showToast(t('game.insufficientFunds'), 'error');
      return;
    }

    try {
      const session = await apiStartGame(state.betAmount, state.cellCount);
      dispatch(actions.startGame(session));
    } catch (error) {
      console.error('Failed to start game:', error);
    }
  }, [state.betAmount, state.cellCount, state.balance, t, showToast]);

  const selectCell = useCallback(
    async (rowIndex: number, cellIndex: number) => {
      if (!state.session || state.status !== GameStatus.Playing) return;
      if (rowIndex !== state.currentStep) return;

      try {
        const result = await makeStep(state.session.id, cellIndex);
        dispatch(actions.makeStep(rowIndex, cellIndex, result));

        if (!result.success) {
          const entry: GameHistoryEntry = {
            id: state.session.id,
            bet: state.session.bet,
            result: GameResult.Lost,
            multiplier: state.currentMultiplier,
            payout: 0,
            steps: state.currentStep,
            timestamp: Date.now(),
          };
          dispatch(actions.addHistoryEntry(entry));
        }
      } catch (error) {
        console.error('Failed to make step:', error);
      }
    },
    [state.session, state.status, state.currentStep, state.currentMultiplier]
  );

  const cashoutGame = useCallback(async () => {
    if (!state.session || state.status !== GameStatus.Playing) return;
    if (state.currentStep === 0) return;

    try {
      const result = await cashout(state.session.id);
      dispatch(actions.cashoutAction(result));

      const entry: GameHistoryEntry = {
        id: state.session.id,
        bet: state.session.bet,
        result: GameResult.Won,
        multiplier: result.finalMultiplier,
        payout: result.amount,
        steps: state.currentStep,
        timestamp: Date.now(),
      };
      dispatch(actions.addHistoryEntry(entry));
    } catch (error) {
      console.error('Failed to cashout:', error);
    }
  }, [state.session, state.status, state.currentStep]);

  const handleResetGame = useCallback(() => {
    dispatch(actions.resetGame());
  }, []);

  const handleSetBetAmount = useCallback(
    (amount: number) => {
      if (state.status === GameStatus.Playing) return;
      dispatch(actions.setBetAmount(Math.max(1, amount)));
    },
    [state.status]
  );

  const handleSetCellCount = useCallback(
    (count: number) => {
      if (state.status === GameStatus.Playing) return;
      dispatch(actions.setCellCount(Math.min(MAX_CELL_COUNT, Math.max(MIN_CELL_COUNT, count))));
    },
    [state.status]
  );

  const getNextMultiplier = useCallback(() => {
    return calculateMultiplier(state.cellCount, state.currentStep + 1);
  }, [state.cellCount, state.currentStep]);

  const value: GameContextValue = {
    state,
    startNewGame,
    selectCell,
    cashoutGame,
    resetGame: handleResetGame,
    setBetAmount: handleSetBetAmount,
    setCellCount: handleSetCellCount,
    getNextMultiplier,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
