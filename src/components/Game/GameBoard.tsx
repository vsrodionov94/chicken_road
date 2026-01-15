import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useGame } from '../../context/GameContext';
import { GameStatus, CellStatus, type Row } from '../../types/game';
import { GameRow } from './GameRow';
import { Dice } from './Dice';
import styles from './GameBoard.module.css';

export function GameBoard() {
  const { t } = useTranslation();
  const { state, continueGame } = useGame();
  const { rows, currentStep, status, cellCount } = state;
  const roadRef = useRef<HTMLDivElement>(null);
  const activeRowRef = useRef<HTMLDivElement>(null);

  // Автоскролл к активному ряду
  useEffect(() => {
    if (status === GameStatus.Playing && activeRowRef.current && roadRef.current) {
      const road = roadRef.current;
      const activeRow = activeRowRef.current;
      const rowLeft = activeRow.offsetLeft;
      const rowWidth = activeRow.offsetWidth;
      const roadWidth = road.offsetWidth;

      // Центрируем активный ряд
      const scrollTo = rowLeft - roadWidth / 2 + rowWidth / 2;
      road.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  }, [currentStep, status]);

  // Создаем стартовый ряд с коэффициентом 1.0x
  const startRow: Row = {
    index: -1,
    cells: Array.from({ length: cellCount }, (_, i) => ({
      index: i,
      status: i === 0 ? CellStatus.Safe : CellStatus.Hidden, // Первая ячейка Safe (выбрана)
      isTrap: false,
    })),
    isRevealed: false,
    selectedCellIndex: 0,
  };

  return (
    <div className={styles.board}>
      <div className={styles.road} ref={roadRef}>
        {/* Стартовый шаг с коэффициентом 1.0x */}
        {(() => {
          const isActive = status === GameStatus.Playing && currentStep === -1;
          const isPassed = status === GameStatus.Playing && currentStep >= -1; // Стартовая позиция всегда пройдена во время игры
          return (
            <div key={-1} ref={isActive ? activeRowRef : undefined}>
              <GameRow
                row={startRow}
                cellCount={cellCount}
                isActive={false}
                isPassed={isPassed}
                isNext={false}
                onRowClick={undefined}
                onCellClick={() => {}}
              />
            </div>
          );
        })()}

        {/* Остальные шаги */}
        {rows.map((row) => {
          // Следующий шаг - это активный шаг (желтый, кликабельный)
          const isActive = status === GameStatus.Playing && row.index === currentStep + 1;
          const isPassed = status === GameStatus.Playing && row.index <= currentStep;
          return (
            <div key={row.index} ref={isActive ? activeRowRef : undefined}>
              <GameRow
                row={row}
                cellCount={cellCount}
                isActive={isActive}
                isPassed={isPassed}
                isNext={false}
                onRowClick={isActive ? continueGame : undefined}
                onCellClick={() => {}}
              />
            </div>
          );
        })}
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
          {state.lastResult?.diceRoll && (
            <div className={styles.lostDiceContainer}>
              <Dice value={state.lastResult.diceRoll.dice1} size="large" />
              <Dice value={state.lastResult.diceRoll.dice2} size="large" />
            </div>
          )}
          <span className={styles.loseAmount}>-{state.session?.bet.toFixed(2)} $</span>
        </div>
      )}
    </div>
  );
}
