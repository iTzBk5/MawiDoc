import { useTranslation } from 'react-i18next';
import { I18nManager } from 'react-native';
import { storage } from '../utils/storage';
import i18n from '../i18n';

const RTL_LANGUAGES = ['ar'];

export function useLanguage() {
  const { t, i18n: i18nInstance } = useTranslation();

  const changeLanguage = async (lang: string) => {
    await i18nInstance.changeLanguage(lang);
    await storage.setLanguage(lang);
    const isRTL = RTL_LANGUAGES.includes(lang);
    if (I18nManager.isRTL !== isRTL) {
      I18nManager.forceRTL(isRTL);
      I18nManager.allowRTL(isRTL);
    }
  };

  return {
    t,
    currentLanguage: i18nInstance.language,
    changeLanguage,
    isRTL: RTL_LANGUAGES.includes(i18nInstance.language),
  };
}
