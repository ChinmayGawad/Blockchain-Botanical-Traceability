import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { en } from './locales/en';
import { hi } from './locales/hi';
import { mr } from './locales/mr';

export type AppLanguage = 'en' | 'hi' | 'mr';

export interface LanguageOption {
  code: AppLanguage;
  label: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'hi', label: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'mr', label: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
];

const STORAGE_KEY = 'florachain_language';

const getInitialLanguage = (): AppLanguage => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as AppLanguage;
    if (saved && (saved === 'en' || saved === 'hi' || saved === 'mr')) {
      return saved;
    }
  } catch (e) {
    // LocalStorage might be inaccessible in some environments
  }
  return 'en';
};

const initialLang = getInitialLanguage();

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      hi: { translation: hi },
      mr: { translation: mr },
    },
    lng: initialLang,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already safeguards against XSS
    },
    react: {
      useSuspense: false,
    },
  });

// Synchronize document lang attribute and storage
if (typeof document !== 'undefined') {
  document.documentElement.lang = initialLang;
}

i18n.on('languageChanged', (lng) => {
  try {
    localStorage.setItem(STORAGE_KEY, lng);
  } catch (e) {}

  if (typeof document !== 'undefined') {
    document.documentElement.lang = lng;
  }
});

export const changeLanguage = (lang: AppLanguage) => {
  i18n.changeLanguage(lang);
};

export default i18n;
