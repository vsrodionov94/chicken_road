import type { Row } from '../../types/game';
import { GameCell } from './GameCell';
import { calculateMultiplier } from '../../utils/coefficients';
import styles from './GameRow.module.css';

interface GameRowProps {
  row: Row;
  cellCount: number;
  isActive: boolean;
  isPassed: boolean;
  onCellClick: (cellIndex: number) => void;
}

export function GameRow({ row, cellCount, isActive, isPassed, onCellClick }: GameRowProps) {
  const multiplier = calculateMultiplier(cellCount, row.index + 1);

  return (
    <div
      className={`${styles.row} ${isActive ? styles.active : ''} ${isPassed ? styles.passed : ''}`}
    >
      <div className={styles.multiplier}>
        <span className={styles.multiplierValue}>{multiplier.toFixed(2)}x</span>
      </div>
      <div className={styles.cells}>
        {row.cells.map((cell) => (
          <GameCell
            key={cell.index}
            index={cell.index}
            status={cell.status}
            isActive={isActive}
            onClick={() => onCellClick(cell.index)}
          />
        ))}
      </div>
      <div className={styles.stepNumber}>
        <span>{row.index + 1}</span>
      </div>
    </div>
  );
}
