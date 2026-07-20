import { useColorScheme } from 'react-native';
import { useThemeStore } from '../../store/theme.store';
import { LightColors, DarkColors, ThemeColors } from './colors';

export function useAppTheme(): { colors: ThemeColors; isDark: boolean } {
  const systemColorScheme = useColorScheme();
  const themeMode = useThemeStore((state) => state.themeMode);

  const isDark =
    themeMode === 'dark' || (themeMode === 'system' && systemColorScheme === 'dark');

  return {
    colors: isDark ? DarkColors : LightColors,
    isDark,
  };
}
