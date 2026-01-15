import { CellStatus, type DiceRoll } from '../../types/game';
import { Dice } from './Dice';
import styles from './GameCell.module.css';

interface GameCellProps {
  index: number;
  status: CellStatus;
  isActive: boolean;
  onClick: () => void;
  diceRoll?: DiceRoll;
}

export function GameCell({ status, isActive, onClick, diceRoll }: GameCellProps) {
  const getCellContent = () => {
    // Если есть бросок кубиков, показываем их
    if (diceRoll) {
      return (
        <div className={styles.diceContainer}>
          <Dice value={diceRoll.dice1} size="medium" />
          <Dice value={diceRoll.dice2} size="medium" />
        </div>
      );
    }

    // Для скрытых или стартовых ячеек без кубиков
    if (status === CellStatus.Hidden) {
      return <span className={styles.questionMark}>?</span>;
    }

    // Для стартовой ячейки (Safe без кубиков)
    if (status === CellStatus.Safe && !diceRoll) {
      return <span className={styles.startText}>START</span>;
    }

    return null;
  };

  return (
    <button
      className={`${styles.cell} ${styles[status]} ${isActive ? styles.active : ''}`}
      onClick={onClick}
      disabled={!isActive || status !== CellStatus.Hidden}
    >
      <div className={styles.content}>{getCellContent()}</div>
    </button>
  );
}
