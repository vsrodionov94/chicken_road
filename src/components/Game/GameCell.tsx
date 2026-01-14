import { CellStatus } from '../../types/game';
import styles from './GameCell.module.css';

interface GameCellProps {
  index: number;
  status: CellStatus;
  isActive: boolean;
  onClick: () => void;
}

export function GameCell({ status, isActive, onClick }: GameCellProps) {
  const getCellContent = () => {
    switch (status) {
      case CellStatus.Safe:
        return '🐔';
      case CellStatus.Trap:
        return '🚗';
      default:
        return '?';
    }
  };

  return (
    <button
      className={`${styles.cell} ${styles[status]} ${isActive ? styles.active : ''}`}
      onClick={onClick}
      disabled={!isActive || status !== CellStatus.Hidden}
    >
      <span className={styles.content}>{getCellContent()}</span>
    </button>
  );
}
