import { useGame } from '../../context/GameContext';
import styles from './GameHistory.module.css';

export function GameHistory() {
  const { state } = useGame();
  const { history } = state;

  if (history.length === 0) {
    return null;
  }

  return (
    <div className={styles.history}>
      <h3 className={styles.title}>История игр</h3>
      <div className={styles.list}>
        {history.map((entry) => (
          <div key={entry.id} className={`${styles.entry} ${styles[entry.result]}`}>
            <div className={styles.info}>
              <span className={styles.bet}>{entry.bet.toFixed(2)} $</span>
              <span className={styles.steps}>{entry.steps} шагов</span>
            </div>
            <div className={styles.result}>
              <span className={styles.multiplier}>{entry.multiplier.toFixed(2)}x</span>
              <span className={styles.payout}>
                {entry.result === 'won' ? '+' : '-'}
                {entry.result === 'won' ? entry.payout.toFixed(2) : entry.bet.toFixed(2)} $
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
