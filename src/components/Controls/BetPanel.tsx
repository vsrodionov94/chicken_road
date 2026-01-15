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
  } = useGame();

  const { status, balance, betAmount, currentMultiplier, potentialWin, currentStep } = state;

  const isPlaying = status === GameStatus.Playing;
  const isGameOver = status === GameStatus.Won || status === GameStatus.Lost;

  const handleBetChange = (delta: number) => {
    const newAmount = Math.max(1, Math.min(betAmount + delta, balance));
    setBetAmount(newAmount);
  };

  const handleBetInput = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      {/* Верхняя секция: Баланс / Правила / Выигрыш */}
      <div className={styles.topSection}>
        <div className={styles.infoCard}>
          <span className={styles.infoLabel}>{t('game.balance')}</span>
          <span className={styles.infoValue}>{balance.toFixed(2)} $</span>
        </div>

        <div className={styles.infoCard}>
          <span className={styles.infoLabel}>{t('game.rules')}</span>
          <span className={styles.rulesText}>1-1 / 6-6</span>
        </div>

        <div className={styles.infoCard}>
          <span className={styles.infoLabel}>{t('game.potentialWin')}</span>
          <span className={styles.winValue}>
            {isPlaying ? potentialWin.toFixed(2) : '0.00'} $
          </span>
        </div>
      </div>

      {/* Средняя секция: Ставка / Кнопка ИГРАТЬ / Автоплей */}
      {!isPlaying && !isGameOver && (
        <div className={styles.middleSection}>
          {/* Ставка с кнопками +/- */}
          <div className={styles.betControl}>
            <button
              className={styles.adjustBtn}
              onClick={() => handleBetChange(-10)}
              disabled={betAmount <= 1}
            >
              -
            </button>

            <div className={styles.betInputWrapper}>
              <input
                type="number"
                value={betAmount}
                onChange={handleBetInput}
                min={1}
                max={balance}
                className={styles.betInput}
              />
              <span className={styles.currency}>$</span>
            </div>

            <button
              className={styles.adjustBtn}
              onClick={() => handleBetChange(10)}
              disabled={betAmount >= balance}
            >
              +
            </button>
          </div>

          {/* Кнопка ИГРАТЬ */}
          <button
            className={styles.playButton}
            onClick={startNewGame}
            disabled={betAmount <= 0 || betAmount > balance}
          >
            {t('game.startGame')}
          </button>

          {/* Автоплей (пока заглушка) */}
          <div className={styles.autoplayControl}>
            <button className={styles.adjustBtn} disabled>
              -
            </button>
            <div className={styles.autoplayDisplay}>
              <span className={styles.autoplayLabel}>{t('game.autoplay')}</span>
              <span className={styles.autoplayValue}>0</span>
            </div>
            <button className={styles.adjustBtn} disabled>
              +
            </button>
          </div>
        </div>
      )}

      {/* Быстрые ставки */}
      {!isPlaying && !isGameOver && (
        <div className={styles.quickBets}>
          <button onClick={() => handleQuickBet(0.5)}>{t('quickBet.half')}</button>
          <button onClick={() => handleQuickBet(2)}>{t('quickBet.double')}</button>
          <button onClick={() => handleQuickBet(-1)}>{t('quickBet.max')}</button>
        </div>
      )}

      {/* Во время игры: Кнопка забрать и инфо */}
      {isPlaying && (
        <div className={styles.gameSection}>
          <div className={styles.gameStats}>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>{t('game.currentMultiplier')}</span>
              <span className={styles.multiplierValue}>{currentMultiplier.toFixed(2)}x</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>{t('game.step')}</span>
              <span className={styles.stepValue}>
                {currentStep + 2} / 11
              </span>
            </div>
          </div>

          <button
            className={styles.cashoutButton}
            onClick={cashoutGame}
            disabled={currentStep === -1}
          >
            {t('game.cashout')} {potentialWin.toFixed(2)} $
          </button>
        </div>
      )}

      {/* После игры: кнопка новой игры */}
      {isGameOver && (
        <button className={styles.resetButton} onClick={resetGame}>
          {t('game.newGame')}
        </button>
      )}
    </div>
  );
}
