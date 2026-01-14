import { CellStatus, type Row } from '../types/game';
import { ROW_COUNT } from '../constants/game';

export function createInitialRows(cellCount: number): Row[] {
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
