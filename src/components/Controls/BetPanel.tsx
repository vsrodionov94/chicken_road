import { useGame } from '../../context/GameContext';
import { GameStatus } from '../../types/game';
import { getDifficultyLabel, getWinProbability, getMaxMultiplier } from '../../utils/coefficients';
import styles from './BetPanel.module.css';

export function BetPanel() {
  const {
    state,
    startNewGame,
    cashoutGame,
    resetGame,
    setBetAmount,
    setCellCount,
    getNextMultiplier,
  } = useGame();

  const { status, balance, betAmount, cellCount, currentMultiplier, potentialWin, currentStep } =
    state;

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
        <span className={styles.balanceLabel}>Баланс</span>
        <span className={styles.balanceValue}>{balance.toFixed(2)} $</span>
      </div>

      {!isPlaying && !isGameOver && (
        <>
          <div className={styles.section}>
            <label className={styles.label}>Ставка</label>
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
              <button onClick={() => handleQuickBet(0.5)}>½</button>
              <button onClick={() => handleQuickBet(2)}>2x</button>
              <button onClick={() => handleQuickBet(-1)}>MAX</button>
            </div>
          </div>

          <div className={styles.section}>
            <label className={styles.label}>Сложность</label>
            <div className={styles.difficultySelector}>
              {[2, 3, 4, 5].map((count) => (
                <button
                  key={count}
                  className={`${styles.difficultyBtn} ${cellCount === count ? styles.active : ''}`}
                  onClick={() => setCellCount(count)}
                >
                  <span className={styles.difficultyCount}>{count}</span>
                  <span className={styles.difficultyLabel}>
                    {Math.round(getWinProbability(count) * 100)}%
                  </span>
                </button>
              ))}
            </div>
            <div className={styles.difficultyInfo}>
              <span>{getDifficultyLabel(cellCount)}</span>
              <span>Max: {getMaxMultiplier(cellCount).toFixed(2)}x</span>
            </div>
          </div>

          <button
            className={styles.startButton}
            onClick={startNewGame}
            disabled={betAmount <= 0 || betAmount > balance}
          >
            Начать игру
          </button>
        </>
      )}

      {isPlaying && (
        <div className={styles.gameInfo}>
          <div className={styles.multiplierDisplay}>
            <span className={styles.multiplierLabel}>Текущий коэффициент</span>
            <span className={styles.multiplierValue}>{currentMultiplier.toFixed(2)}x</span>
          </div>

          <div className={styles.potentialWin}>
            <span className={styles.potentialLabel}>Можно забрать</span>
            <span className={styles.potentialValue}>{potentialWin.toFixed(2)} $</span>
          </div>

          {currentStep > 0 && (
            <div className={styles.nextMultiplier}>
              <span>Следующий: {getNextMultiplier().toFixed(2)}x</span>
            </div>
          )}

          <button
            className={styles.cashoutButton}
            onClick={cashoutGame}
            disabled={currentStep === 0}
          >
            Забрать {potentialWin.toFixed(2)} $
          </button>

          <div className={styles.stepIndicator}>Шаг {currentStep + 1} из 10</div>
        </div>
      )}

      {isGameOver && (
        <button className={styles.resetButton} onClick={resetGame}>
          Новая игра
        </button>
      )}
    </div>
  );
}
