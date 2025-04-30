import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import en from './en/en.json';
import vi from './vi/vi.json';

export const languageResources = {
  en: { translation: en },
  vi: { translation: vi },
};

const getInitialLanguage = async () => {
  try {
    const savedLanguage = await AsyncStorage.getItem('language');
    return savedLanguage || 'en';
  } catch (error) {
    console.error('Error loading initial language from AsyncStorage:', error);
    return 'en';
  }
};

const initI18n = async () => {
  const language = await getInitialLanguage();
  await i18next.use(initReactI18next).init({
    resources: languageResources,
    lng: language,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });
};

export const i18nPromise = initI18n();

export default i18next;
