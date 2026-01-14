import { useGame } from '../../context/GameContext';
import { GameRow } from './GameRow';
import styles from './GameBoard.module.css';

export function GameBoard() {
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
            isActive={status === 'playing' && row.index === currentStep}
            isPassed={row.index < currentStep}
            onCellClick={(cellIndex) => selectCell(row.index, cellIndex)}
          />
        ))}
      </div>

      {status === 'idle' && (
        <div className={styles.overlay}>
          <p>Сделайте ставку и начните игру</p>
        </div>
      )}

      {status === 'won' && (
        <div className={`${styles.overlay} ${styles.won}`}>
          <p>Вы выиграли!</p>
          <span className={styles.winAmount}>
            +{state.potentialWin.toFixed(2)} $
          </span>
        </div>
      )}

      {status === 'lost' && (
        <div className={`${styles.overlay} ${styles.lost}`}>
          <p>Вы проиграли!</p>
          <span className={styles.loseAmount}>
            -{state.session?.bet.toFixed(2)} $
          </span>
        </div>
      )}
    </div>
  );
}
