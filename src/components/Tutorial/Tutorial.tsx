import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TutorialSteps } from './TutorialSteps';
import styles from './Tutorial.module.css';

interface TutorialProps {
  isOpen: boolean;
  onClose: () => void;
}

const TOTAL_STEPS = 4;

export function Tutorial({ isOpen, onClose }: TutorialProps) {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    setCurrentStep(0);
    onClose();
  };

  const handleFinish = () => {
    setCurrentStep(0);
    onClose();
  };

  const isLastStep = currentStep === TOTAL_STEPS - 1;

  return (
    <div className={styles.overlay} onClick={handleSkip}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>{t(`tutorial.step${currentStep + 1}.title`)}</h2>
          <button className={styles.closeButton} onClick={handleSkip} aria-label="Close">
            ✕
          </button>
        </div>

        <div className={styles.content}>
          <TutorialSteps step={currentStep} />
        </div>

        <div className={styles.footer}>
          <div className={styles.indicators}>
            {Array.from({ length: TOTAL_STEPS }).map((_, index) => (
              <div
                key={index}
                className={`${styles.indicator} ${index === currentStep ? styles.active : ''}`}
              />
            ))}
          </div>

          <div className={styles.buttons}>
            {currentStep > 0 && (
              <button className={styles.button} onClick={handleBack}>
                {t('tutorial.back')}
              </button>
            )}
            {!isLastStep && (
              <button className={styles.button} onClick={handleSkip}>
                {t('tutorial.skip')}
              </button>
            )}
            {isLastStep ? (
              <button className={`${styles.button} ${styles.primary}`} onClick={handleFinish}>
                {t('tutorial.finish')}
              </button>
            ) : (
              <button className={`${styles.button} ${styles.primary}`} onClick={handleNext}>
                {t('tutorial.next')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
