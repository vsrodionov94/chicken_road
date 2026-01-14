import { useTranslation } from 'react-i18next';
import { useGame } from '../../context/GameContext';
import { GameResult } from '../../types/game';
import styles from './GameHistory.module.css';

export function GameHistory() {
  const { t } = useTranslation();
  const { state } = useGame();
  const { history } = state;

  if (history.length === 0) {
    return null;
  }

  return (
    <div className={styles.history}>
      <h3 className={styles.title}>{t('history.title')}</h3>
      <div className={styles.list}>
        {history.map((entry) => (
          <div key={entry.id} className={`${styles.entry} ${styles[entry.result]}`}>
            <div className={styles.info}>
              <span className={styles.bet}>{entry.bet.toFixed(2)} $</span>
              <span className={styles.steps}>
                {entry.steps} {t('history.steps')}
              </span>
            </div>
            <div className={styles.result}>
              <span className={styles.multiplier}>{entry.multiplier.toFixed(2)}x</span>
              <span className={styles.payout}>
                {entry.result === GameResult.Won ? '+' : '-'}
                {entry.result === GameResult.Won ? entry.payout.toFixed(2) : entry.bet.toFixed(2)} $
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
