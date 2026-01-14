import { useTranslation } from 'react-i18next';
import { useGame } from '../../context/GameContext';
import { GameStatus } from '../../types/game';
import { GameRow } from './GameRow';
import styles from './GameBoard.module.css';

export function GameBoard() {
  const { t } = useTranslation();
  const { state, selectCell } = useGame();
  const { rows, currentStep, status, cellCount } = state;

  // Показываем ряды снизу вверх (первый ряд внизу)
  const reversedRows = [...rows].reverse();

  return (
    <div className={styles.board}>
      <div className={styles.road}>
        {reversedRows.map((row) => (
          <GameRow
            key={row.index}
            row={row}
            cellCount={cellCount}
            isActive={status === GameStatus.Playing && row.index === currentStep}
            isPassed={row.index < currentStep}
            onCellClick={(cellIndex) => selectCell(row.index, cellIndex)}
          />
        ))}
      </div>

      {status === GameStatus.Idle && (
        <div className={styles.overlay}>
          <p>{t('overlay.placeBet')}</p>
        </div>
      )}

      {status === GameStatus.Won && (
        <div className={`${styles.overlay} ${styles.won}`}>
          <p>{t('overlay.youWon')}</p>
          <span className={styles.winAmount}>+{state.potentialWin.toFixed(2)} $</span>
        </div>
      )}

      {status === GameStatus.Lost && (
        <div className={`${styles.overlay} ${styles.lost}`}>
          <p>{t('overlay.youLost')}</p>
          <span className={styles.loseAmount}>-{state.session?.bet.toFixed(2)} $</span>
        </div>
      )}
    </div>
  );
}
