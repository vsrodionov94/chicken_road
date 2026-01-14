import { createContext, useContext, useReducer, useCallback, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from './ToastContext';
import { GameStatus, GameResult, type GameState, type GameHistoryEntry } from '../types/game';
import { gameReducer } from '../store/gameReducer';
import { initialState } from '../store/initialState';
import * as actions from '../store/gameActions';
import { startGame as apiStartGame, makeStep, cashout } from '../services/mockApi';
import { calculateMultiplier } from '../utils/coefficients';

interface GameContextValue {
  state: GameState;
  startNewGame: () => Promise<void>;
  continueGame: () => Promise<void>;
  cashoutGame: () => Promise<void>;
  resetGame: () => void;
  setBetAmount: (amount: number) => void;
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

  const continueGame = useCallback(
    async () => {
      if (!state.session || state.status !== GameStatus.Playing) return;

      try {
        const result = await makeStep(state.session.id);
        dispatch(actions.makeStep(result));

        if (!result.success) {
          const entry: GameHistoryEntry = {
            id: state.session.id,
            bet: state.session.bet,
            result: GameResult.Lost,
            multiplier: state.currentMultiplier,
            payout: 0,
            steps: Math.max(0, state.currentStep + 1), // +1 потому что мы сделали шаг перед проигрышем
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
    if (state.currentStep === -1) return; // Нельзя забрать деньги до первого хода

    try {
      const result = await cashout(state.session.id);
      dispatch(actions.cashoutAction(result));

      const entry: GameHistoryEntry = {
        id: state.session.id,
        bet: state.session.bet,
        result: GameResult.Won,
        multiplier: result.finalMultiplier,
        payout: result.amount,
        steps: state.currentStep + 1, // +1 потому что currentStep теперь начинается с -1
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

  const getNextMultiplier = useCallback(() => {
    // Когда currentStep = -1, следующий шаг = 0, множитель для шага 0 = calculateMultiplier(cellCount, 1)
    // Когда currentStep = 0, следующий шаг = 1, множитель для шага 1 = calculateMultiplier(cellCount, 2)
    return calculateMultiplier(state.cellCount, state.currentStep + 2);
  }, [state.cellCount, state.currentStep]);

  const value: GameContextValue = {
    state,
    startNewGame,
    continueGame,
    cashoutGame,
    resetGame: handleResetGame,
    setBetAmount: handleSetBetAmount,
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
