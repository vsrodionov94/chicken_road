import { useTranslation } from 'react-i18next';
import { useGame } from '../../context/GameContext';
import { GameStatus } from '../../types/game';
import styles from './BetPanel.module.css';

export function BetPanel() {
  const { t } = useTranslation();
  const {
    state,
    startNewGame,
    cashoutGame,
    resetGame,
    setBetAmount,
    getNextMultiplier,
  } = useGame();

  const { status, balance, betAmount, currentMultiplier, potentialWin, currentStep } = state;

  const isPlaying = status === GameStatus.Playing;
  const isGameOver = status === GameStatus.Won || status === GameStatus.Lost;

  const handleBetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setBetAmount(Math.min(value, balance));
  };

  const handleQuickBet = (multiplier: number) => {
    if (multiplier === -1) {
      setBetAmount(balance);
    } else {
      setBetAmount(Math.min(betAmount * multiplier, balance));
    }
  };

  return (
    <div className={styles.panel}>
      <div className={styles.balance}>
        <span className={styles.balanceLabel}>{t('game.balance')}</span>
        <span className={styles.balanceValue}>{balance.toFixed(2)} $</span>
      </div>

      {!isPlaying && !isGameOver && (
        <>
          <div className={styles.section}>
            <label className={styles.label}>{t('game.bet')}</label>
            <div className={styles.inputGroup}>
              <input
                type="number"
                value={betAmount}
                onChange={handleBetChange}
                min={1}
                max={balance}
                className={styles.input}
              />
              <span className={styles.currency}>$</span>
            </div>
            <div className={styles.quickBets}>
              <button onClick={() => handleQuickBet(0.5)}>{t('quickBet.half')}</button>
              <button onClick={() => handleQuickBet(2)}>{t('quickBet.double')}</button>
              <button onClick={() => handleQuickBet(-1)}>{t('quickBet.max')}</button>
            </div>
          </div>

          <button
            className={styles.startButton}
            onClick={startNewGame}
            disabled={betAmount <= 0 || betAmount > balance}
          >
            {t('game.startGame')}
          </button>
        </>
      )}

      {isPlaying && (
        <div className={styles.gameInfo}>
          <div className={styles.multiplierDisplay}>
            <span className={styles.multiplierLabel}>{t('game.currentMultiplier')}</span>
            <span className={styles.multiplierValue}>{currentMultiplier.toFixed(2)}x</span>
          </div>

          <div className={styles.potentialWin}>
            <span className={styles.potentialLabel}>{t('game.potentialWin')}</span>
            <span className={styles.potentialValue}>{potentialWin.toFixed(2)} $</span>
          </div>

          {currentStep < 9 && (
            <div className={styles.nextMultiplier}>
              <span>
                {t('game.nextMultiplier')}: {getNextMultiplier().toFixed(2)}x
              </span>
            </div>
          )}

          <button
            className={styles.cashoutButton}
            onClick={cashoutGame}
            disabled={currentStep === -1}
          >
            {t('game.cashout')} {potentialWin.toFixed(2)} $
          </button>

          <div className={styles.stepIndicator}>
            {t('game.step')} {currentStep + 1 >= 0 ? currentStep + 2 : 1} {t('game.of')} 11
          </div>
        </div>
      )}

      {isGameOver && (
        <button className={styles.resetButton} onClick={resetGame}>
          {t('game.newGame')}
        </button>
      )}
    </div>
  );
}
