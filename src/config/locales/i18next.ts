// src/translations/i18n.ts
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en/en.json';
import vi from './vi/vi.json';

export const languageResources = {
  en: { translation: en },
  vi: { translation: vi },
};

i18next.use(initReactI18next).init({
  resources: languageResources,
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18next;
