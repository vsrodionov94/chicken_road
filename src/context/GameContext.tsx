import { createContext, useContext, useReducer, useCallback, type ReactNode } from 'react';
import {
  GameStatus,
  CellStatus,
  type GameState,
  type GameAction,
  type Row,
  type Cell,
  type GameHistoryEntry,
} from '../types/game';
import { startGame, makeStep, cashout } from '../services/mockApi';
import { calculateMultiplier } from '../utils/coefficients';

const INITIAL_BALANCE = 1000;
const ROW_COUNT = 10;

function createInitialRows(cellCount: number): Row[] {
  return Array.from({ length: ROW_COUNT }, (_, rowIndex) => ({
    index: rowIndex,
    cells: Array.from({ length: cellCount }, (_, cellIndex) => ({
      index: cellIndex,
      status: CellStatus.Hidden,
      isTrap: false,
    })),
    isRevealed: false,
    selectedCellIndex: null,
  }));
}

const initialState: GameState = {
  status: GameStatus.Idle,
  session: null,
  rows: createInitialRows(3),
  balance: INITIAL_BALANCE,
  betAmount: 10,
  cellCount: 3,
  currentStep: 0,
  currentMultiplier: 1,
  potentialWin: 0,
  lastResult: null,
  history: [],
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_BET_AMOUNT':
      return { ...state, betAmount: action.payload };

    case 'SET_CELL_COUNT':
      return {
        ...state,
        cellCount: action.payload,
        rows: createInitialRows(action.payload),
      };

    case 'START_GAME':
      return {
        ...state,
        status: GameStatus.Playing,
        session: action.payload,
        rows: createInitialRows(action.payload.cellCount),
        currentStep: 0,
        currentMultiplier: 1,
        potentialWin: action.payload.bet,
        lastResult: null,
        balance: state.balance - action.payload.bet,
      };

    case 'MAKE_STEP': {
      const { rowIndex, cellIndex, result } = action.payload;
      const newRows = state.rows.map((row, idx) => {
        if (idx !== rowIndex) return row;

        const newCells: Cell[] = row.cells.map((cell, cIdx) => {
          if (cIdx === cellIndex) {
            return {
              ...cell,
              status: result.success ? CellStatus.Safe : CellStatus.Trap,
              isTrap: !result.success,
            };
          }
          if (!result.success && cIdx === result.trapIndex) {
            return { ...cell, status: CellStatus.Trap, isTrap: true };
          }
          if (!result.success) {
            return { ...cell, status: CellStatus.Safe };
          }
          return cell;
        });

        return {
          ...row,
          cells: newCells,
          isRevealed: !result.success,
          selectedCellIndex: cellIndex,
        };
      });

      if (!result.success) {
        // Показать все ловушки при проигрыше
        return {
          ...state,
          status: GameStatus.Lost,
          rows: newRows,
          lastResult: result,
        };
      }

      return {
        ...state,
        rows: newRows,
        currentStep: state.currentStep + 1,
        currentMultiplier: result.newMultiplier,
        potentialWin: result.potentialWin,
        lastResult: result,
      };
    }

    case 'CASHOUT':
      return {
        ...state,
        status: GameStatus.Won,
        balance: state.balance + action.payload.amount,
      };

    case 'GAME_OVER':
      return {
        ...state,
        status: GameStatus.Lost,
      };

    case 'RESET_GAME':
      return {
        ...state,
        status: GameStatus.Idle,
        session: null,
        rows: createInitialRows(state.cellCount),
        currentStep: 0,
        currentMultiplier: 1,
        potentialWin: 0,
        lastResult: null,
      };

    case 'UPDATE_BALANCE':
      return { ...state, balance: action.payload };

    case 'ADD_HISTORY_ENTRY':
      return {
        ...state,
        history: [action.payload, ...state.history].slice(0, 20),
      };

    default:
      return state;
  }
}

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
  const [state, dispatch] = useReducer(gameReducer, initialState);

  const startNewGame = useCallback(async () => {
    if (state.betAmount > state.balance) {
      alert('Недостаточно средств');
      return;
    }

    try {
      const session = await startGame(state.betAmount, state.cellCount);
      dispatch({ type: 'START_GAME', payload: session });
    } catch (error) {
      console.error('Failed to start game:', error);
    }
  }, [state.betAmount, state.cellCount, state.balance]);

  const selectCell = useCallback(
    async (rowIndex: number, cellIndex: number) => {
      if (!state.session || state.status !== GameStatus.Playing) return;
      if (rowIndex !== state.currentStep) return;

      try {
        const result = await makeStep(state.session.id, cellIndex);
        dispatch({ type: 'MAKE_STEP', payload: { rowIndex, cellIndex, result } });

        if (!result.success) {
          const entry: GameHistoryEntry = {
            id: state.session.id,
            bet: state.session.bet,
            result: 'lost',
            multiplier: state.currentMultiplier,
            payout: 0,
            steps: state.currentStep,
            timestamp: Date.now(),
          };
          dispatch({ type: 'ADD_HISTORY_ENTRY', payload: entry });
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
      dispatch({ type: 'CASHOUT', payload: result });

      const entry: GameHistoryEntry = {
        id: state.session.id,
        bet: state.session.bet,
        result: 'won',
        multiplier: result.finalMultiplier,
        payout: result.amount,
        steps: state.currentStep,
        timestamp: Date.now(),
      };
      dispatch({ type: 'ADD_HISTORY_ENTRY', payload: entry });
    } catch (error) {
      console.error('Failed to cashout:', error);
    }
  }, [state.session, state.status, state.currentStep]);

  const resetGame = useCallback(() => {
    dispatch({ type: 'RESET_GAME' });
  }, []);

  const setBetAmount = useCallback(
    (amount: number) => {
      if (state.status === GameStatus.Playing) return;
      dispatch({ type: 'SET_BET_AMOUNT', payload: Math.max(1, amount) });
    },
    [state.status]
  );

  const setCellCount = useCallback(
    (count: number) => {
      if (state.status === GameStatus.Playing) return;
      dispatch({ type: 'SET_CELL_COUNT', payload: Math.min(5, Math.max(2, count)) });
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
    resetGame,
    setBetAmount,
    setCellCount,
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
