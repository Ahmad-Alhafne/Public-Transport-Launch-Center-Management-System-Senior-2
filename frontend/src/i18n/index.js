import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import enTranslation from './en.json';
import arTranslation from './ar.json';

const resources = {
  en: {
    translation: enTranslation,
  },
  ar: {
    translation: arTranslation,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'ar',
    lng: 'ar',
    supportedLngs: ['ar', 'en'],
    load: 'languageOnly',
    ns: ['translation'],
    defaultNS: 'translation',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      // Only use stored preference (localStorage). Fall back to `lng` / `fallbackLng`.
      order: ['localStorage'],
      caches: ['localStorage'],
      lookupLocalStorage: 'preferredLanguage',
    },
    react: {
      useSuspense: false,
    },
  });

const defaultLanguage = 'ar';
let storedLanguage;
try {
  storedLanguage = localStorage.getItem('preferredLanguage') || localStorage.getItem('i18nextLng');
  if (!storedLanguage) {
    localStorage.setItem('preferredLanguage', defaultLanguage);
    localStorage.setItem('i18nextLng', defaultLanguage);
  }
} catch {
  storedLanguage = undefined;
}

const currentLanguage = storedLanguage || i18n.language || defaultLanguage;
i18n.changeLanguage(currentLanguage);

document.documentElement.lang = currentLanguage;
document.documentElement.dir = i18n.dir(currentLanguage);

// Keep HTML lang/dir in sync when language changes at runtime
i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng;
  document.documentElement.dir = i18n.dir(lng);
});

export default i18n;
