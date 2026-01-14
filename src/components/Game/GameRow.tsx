import type { Row } from '../../types/game';
import { GameCell } from './GameCell';
import { calculateMultiplier } from '../../utils/coefficients';
import styles from './GameRow.module.css';

interface GameRowProps {
  row: Row;
  cellCount: number;
  isActive: boolean;
  isPassed: boolean;
  isNext: boolean;
  onRowClick?: () => void;
  onCellClick: (cellIndex: number) => void;
}

export function GameRow({ row, cellCount, isActive, isPassed, isNext, onRowClick }: GameRowProps) {
  const multiplier = calculateMultiplier(cellCount, row.index + 1);

  // Показываем только выбранную ячейку или первую, если ничего не выбрано
  const cellToShow = row.selectedCellIndex !== null
    ? row.cells[row.selectedCellIndex]
    : row.cells[0];

  return (
    <div
      className={`${styles.row} ${isActive ? styles.active : ''} ${isPassed ? styles.passed : ''} ${isNext ? styles.next : ''}`}
      onClick={onRowClick}
      style={{ cursor: onRowClick ? 'pointer' : 'default' }}
    >
      <div className={styles.multiplier}>
        <span className={styles.multiplierValue}>{multiplier.toFixed(2)}x</span>
      </div>
      <div className={styles.cells}>
        <GameCell
          key={cellToShow.index}
          index={cellToShow.index}
          status={cellToShow.status}
          isActive={isActive}
          onClick={() => {}}
        />
      </div>
      <div className={styles.stepNumber}>
        <span>{row.index + 1}</span>
      </div>
    </div>
  );
}
