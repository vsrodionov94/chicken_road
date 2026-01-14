import type { CellStatus } from '../../types/game';
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
      case 'safe':
        return '🐔';
      case 'trap':
        return '🚗';
      default:
        return '?';
    }
  };

  return (
    <button
      className={`${styles.cell} ${styles[status]} ${isActive ? styles.active : ''}`}
      onClick={onClick}
      disabled={!isActive || status !== 'hidden'}
    >
      <span className={styles.content}>{getCellContent()}</span>
    </button>
  );
}
