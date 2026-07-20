import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as RNLocalize from 'react-native-localize';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nManager } from 'react-native';
import en from './locales/en.json';
import ar from './locales/ar.json';
import fr from './locales/fr.json';

const resources = { en: { translation: en }, ar: { translation: ar }, fr: { translation: fr } };

const LANGUAGE_KEY = '@app_language';

const initI18n = async () => {
  let languageCode = 'en'; // Default is English
  try {
    const savedLang = await AsyncStorage.getItem(LANGUAGE_KEY);
    if (savedLang) {
      languageCode = savedLang;
    }
  } catch (error) {
    console.warn('Failed to load language from storage', error);
  }

  const isRTL = languageCode === 'ar';
  
  // We don't force a reload here, that happens in the SettingsScreen
  if (I18nManager.isRTL !== isRTL) {
    I18nManager.allowRTL(isRTL);
    I18nManager.forceRTL(isRTL);
  }

  await i18n.use(initReactI18next).init({
    resources,
    lng: languageCode,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });
};

// Initialize asynchronously, but React Native starts rendering right away.
// In a real app, you'd wait for this promise before unmounting the splash screen.
initI18n();

export default i18n;
