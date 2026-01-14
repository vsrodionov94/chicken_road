import {
  GameStatus,
  CellStatus,
  ActionType,
  type GameState,
  type GameAction,
  type Cell,
} from '../types/game';
import { MAX_HISTORY_ENTRIES } from '../constants/game';
import { createInitialRows } from '../utils/rows';

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case ActionType.SetBetAmount:
      return { ...state, betAmount: action.payload };

    case ActionType.SetCellCount:
      return {
        ...state,
        cellCount: action.payload,
        rows: createInitialRows(action.payload),
      };

    case ActionType.StartGame:
      return {
        ...state,
        status: GameStatus.Playing,
        session: action.payload,
        rows: createInitialRows(action.payload.cellCount),
        currentStep: -1, // Начинаем со стартовой позиции (1.0x)
        currentMultiplier: 1,
        potentialWin: action.payload.bet,
        lastResult: null,
        balance: state.balance - action.payload.bet,
      };

    case ActionType.MakeStep: {
      const { result } = action.payload;
      // rowIndex - это индекс ряда, на который кликнули (следующий шаг)
      const rowIndex = state.currentStep + 1;
      const safeIndex = result.safeIndex;

      const newRows = state.rows.map((row, idx) => {
        if (idx !== rowIndex) return row;

        const newCells: Cell[] = row.cells.map((cell, cIdx) => {
          if (cIdx === safeIndex) {
            return {
              ...cell,
              status: result.success ? CellStatus.Safe : CellStatus.Trap,
              isTrap: !result.success,
            };
          }
          // Если проиграли, показываем все остальные ячейки как безопасные
          if (!result.success) {
            return { ...cell, status: CellStatus.Safe };
          }
          return cell;
        });

        return {
          ...row,
          cells: newCells,
          isRevealed: !result.success,
          selectedCellIndex: safeIndex,
        };
      });

      if (!result.success) {
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

    case ActionType.Cashout:
      return {
        ...state,
        status: GameStatus.Won,
        balance: state.balance + action.payload.amount,
      };

    case ActionType.GameOver:
      return {
        ...state,
        status: GameStatus.Lost,
      };

    case ActionType.ResetGame:
      return {
        ...state,
        status: GameStatus.Idle,
        session: null,
        rows: createInitialRows(state.cellCount),
        currentStep: -1, // Возвращаемся к стартовой позиции
        currentMultiplier: 1,
        potentialWin: 0,
        lastResult: null,
      };

    case ActionType.UpdateBalance:
      return { ...state, balance: action.payload };

    case ActionType.AddHistoryEntry:
      return {
        ...state,
        history: [action.payload, ...state.history].slice(0, MAX_HISTORY_ENTRIES),
      };

    default:
      return state;
  }
}
