import { GameProvider } from './context/GameContext';
import { GameBoard } from './components/Game/GameBoard';
import { BetPanel } from './components/Controls/BetPanel';
import { GameHistory } from './components/Controls/GameHistory';
import styles from './App.module.css';

function App() {
  return (
    <GameProvider>
      <div className={styles.app}>
        <header className={styles.header}>
          <h1 className={styles.logo}>
            <span className={styles.logoIcon}>🐔</span>
            Chicken Road
          </h1>
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
  );
}

export default App;
