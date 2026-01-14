import { useTranslation } from 'react-i18next';
import styles from './LanguageSwitcher.module.css';

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ru' ? 'en' : 'ru';
    i18n.changeLanguage(newLang);
  };

  return (
    <button className={styles.switcher} onClick={toggleLanguage} title="Switch language">
      {i18n.language === 'ru' ? t('language.en') : t('language.ru')}
    </button>
  );
}
