import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  AUTH_TOKEN: '@mawidoc_auth_token',
  USER_DATA: '@mawidoc_user_data',
  LANGUAGE: '@mawidoc_language',
} as const;

export const storage = {
  async getToken(): Promise<string | null> {
    return AsyncStorage.getItem(KEYS.AUTH_TOKEN);
  },

  async setToken(token: string): Promise<void> {
    await AsyncStorage.setItem(KEYS.AUTH_TOKEN, token);
  },

  async removeToken(): Promise<void> {
    await AsyncStorage.removeItem(KEYS.AUTH_TOKEN);
  },

  async getUserData(): Promise<string | null> {
    return AsyncStorage.getItem(KEYS.USER_DATA);
  },

  async setUserData(data: string): Promise<void> {
    await AsyncStorage.setItem(KEYS.USER_DATA, data);
  },

  async removeUserData(): Promise<void> {
    await AsyncStorage.removeItem(KEYS.USER_DATA);
  },

  async getLanguage(): Promise<string | null> {
    return AsyncStorage.getItem(KEYS.LANGUAGE);
  },

  async setLanguage(lang: string): Promise<void> {
    await AsyncStorage.setItem(KEYS.LANGUAGE, lang);
  },

  async clearAll(): Promise<void> {
    await AsyncStorage.removeItem(KEYS.AUTH_TOKEN);
    await AsyncStorage.removeItem(KEYS.USER_DATA);
  },
};
