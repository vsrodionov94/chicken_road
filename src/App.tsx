import { useTranslation } from 'react-i18next';
import { ToastProvider } from './context/ToastContext';
import { GameProvider } from './context/GameContext';
import { GameBoard } from './components/Game/GameBoard';
import { BetPanel } from './components/Controls/BetPanel';
import { GameHistory } from './components/Controls/GameHistory';
import { LanguageSwitcher } from './components/Controls/LanguageSwitcher';
import styles from './App.module.css';

function App() {
  const { t } = useTranslation();

  return (
    <ToastProvider>
      <GameProvider>
        <div className={styles.app}>
          <header className={styles.header}>
            <h1 className={styles.logo}>
              <span className={styles.logoIcon}>🐔</span>
              {t('game.title')}
            </h1>
            <LanguageSwitcher />
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
        </div>
      </GameProvider>
    </ToastProvider>
  );
}

export default App;
