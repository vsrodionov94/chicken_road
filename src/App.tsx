import { useTranslation } from 'react-i18next';
import { ToastProvider } from './context/ToastContext';
import { GameProvider } from './context/GameContext';
import { TutorialProvider, useTutorial } from './context/TutorialContext';
import { GameBoard } from './components/Game/GameBoard';
import { BetPanel } from './components/Controls/BetPanel';
import { GameHistory } from './components/Controls/GameHistory';
import { LanguageSwitcher } from './components/Controls/LanguageSwitcher';
import { HelpButton } from './components/Controls/HelpButton';
import { Tutorial } from './components/Tutorial/Tutorial';
import styles from './App.module.css';

function AppContent() {
  const { t } = useTranslation();
  const { isTutorialOpen, closeTutorial } = useTutorial();

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.logo}>
          <span className={styles.logoIcon}>🐔</span>
          {t('game.title')}
        </h1>
        <div className={styles.headerButtons}>
          <HelpButton />
          <LanguageSwitcher />
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.gameArea}>
          <GameBoard />
        </div>

        <aside className={styles.sidebar}>
          <BetPanel />
          <GameHistory />
        </aside>
      </main>

      <footer className={styles.footer}>
        <p>Provably Fair Gaming</p>
      </footer>

      <Tutorial isOpen={isTutorialOpen} onClose={closeTutorial} />
    </div>
  );
}

function App() {
  return (
    <ToastProvider>
      <GameProvider>
        <TutorialProvider>
          <AppContent />
        </TutorialProvider>
      </GameProvider>
    </ToastProvider>
  );
}

export default App;
