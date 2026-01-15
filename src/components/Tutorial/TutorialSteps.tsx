import { useTranslation } from 'react-i18next';
import { Dice } from '../Game/Dice';
import styles from './TutorialSteps.module.css';

interface TutorialStepsProps {
  step: number;
}

export function TutorialSteps({ step }: TutorialStepsProps) {
  const { t } = useTranslation();

  switch (step) {
    case 0:
      // Шаг 1: Правила с кубиками
      return (
        <div className={styles.stepContent}>
          <p className={styles.description}>{t('tutorial.step1.description')}</p>

          <div className={styles.examples}>
            <div className={styles.example}>
              <div className={styles.diceContainer}>
                <Dice value={2} size="large" />
                <Dice value={5} size="large" />
              </div>
              <p className={styles.safeText}>{t('tutorial.step1.safe')}</p>
            </div>

            <div className={styles.example}>
              <div className={styles.diceContainer}>
                <Dice value={4} size="large" />
                <Dice value={4} size="large" />
              </div>
              <p className={styles.dangerText}>{t('tutorial.step1.double')}</p>
            </div>
          </div>
        </div>
      );

    case 1:
      // Шаг 2: Ставки и коэффициенты
      return (
        <div className={styles.stepContent}>
          <p className={styles.description}>{t('tutorial.step2.description')}</p>

          <div className={styles.multiplierTable}>
            <div className={styles.tableRow}>
              <span>{t('tutorial.step2.step')} 1</span>
              <span className={styles.multiplier}>1.50x</span>
            </div>
            <div className={styles.tableRow}>
              <span>{t('tutorial.step2.step')} 2</span>
              <span className={styles.multiplier}>2.25x</span>
            </div>
            <div className={styles.tableRow}>
              <span>{t('tutorial.step2.step')} 3</span>
              <span className={styles.multiplier}>3.37x</span>
            </div>
            <div className={styles.tableRow}>
              <span>...</span>
              <span className={styles.multiplier}>...</span>
            </div>
            <div className={styles.tableRow}>
              <span>{t('tutorial.step2.step')} 10</span>
              <span className={styles.multiplier}>57.67x</span>
            </div>
          </div>
        </div>
      );

    case 2:
      // Шаг 3: Когда забирать выигрыш
      return (
        <div className={styles.stepContent}>
          <p className={styles.description}>{t('tutorial.step3.description')}</p>

          <div className={styles.cashoutExample}>
            <div className={styles.exampleCard}>
              <div className={styles.cardRow}>
                <span>{t('tutorial.step3.bet')}:</span>
                <span className={styles.value}>100 $</span>
              </div>
              <div className={styles.cardRow}>
                <span>{t('tutorial.step3.multiplier')}:</span>
                <span className={styles.multiplier}>3.37x</span>
              </div>
              <div className={styles.cardRow}>
                <span>{t('tutorial.step3.win')}:</span>
                <span className={styles.winValue}>337 $</span>
              </div>
              <button className={styles.demoButton}>
                {t('tutorial.step3.cashout')} 337 $
              </button>
            </div>
          </div>
        </div>
      );

    case 3:
      // Шаг 4: Система шагов
      return (
        <div className={styles.stepContent}>
          <p className={styles.description}>{t('tutorial.step4.description')}</p>

          <div className={styles.stepIndicatorExample}>
            <div className={styles.stepBadge}>
              {t('tutorial.step4.current')}: 5 / 11
            </div>
          </div>
        </div>
      );

    default:
      return null;
  }
}
