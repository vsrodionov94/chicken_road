import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

const TUTORIAL_STORAGE_KEY = 'chicken-road-tutorial-completed';

interface TutorialContextValue {
  isTutorialOpen: boolean;
  openTutorial: () => void;
  closeTutorial: () => void;
}

const TutorialContext = createContext<TutorialContextValue | null>(null);

export function TutorialProvider({ children }: { children: ReactNode }) {
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const { i18n } = useTranslation();

  useEffect(() => {
    // Проверяем, был ли туториал уже показан
    const tutorialCompleted = localStorage.getItem(TUTORIAL_STORAGE_KEY);
    if (!tutorialCompleted) {
      // Ждем инициализации i18n, затем показываем туториал с небольшой задержкой
      const timer = setTimeout(() => {
        // Проверяем, что i18n инициализирован
        if (i18n.isInitialized) {
          setIsTutorialOpen(true);
        }
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [i18n]);

  const openTutorial = useCallback(() => {
    setIsTutorialOpen(true);
  }, []);

  const closeTutorial = useCallback(() => {
    setIsTutorialOpen(false);
    localStorage.setItem(TUTORIAL_STORAGE_KEY, 'true');
  }, []);

  return (
    <TutorialContext.Provider value={{ isTutorialOpen, openTutorial, closeTutorial }}>
      {children}
    </TutorialContext.Provider>
  );
}

export function useTutorial() {
  const context = useContext(TutorialContext);
  if (!context) {
    throw new Error('useTutorial must be used within a TutorialProvider');
  }
  return context;
}
