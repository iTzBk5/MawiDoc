import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useAppTheme } from './useAppTheme';
import { ThemeColors } from './colors';

/**
 * A highly performant hook to inject dynamic theme colors into your StyleSheet.
 * Pass a function that takes `colors` and returns a StyleSheet.
 * The hook will memoize the stylesheet so it is only re-calculated when the theme changes!
 */
export function useStyles<T extends StyleSheet.NamedStyles<T> | StyleSheet.NamedStyles<any>>(
  createStyles: (colors: ThemeColors) => T
): T {
  const { colors, isDark } = useAppTheme();
  // We use `isDark` in dependency array to reliably recalculate when theme toggles
  return useMemo(() => createStyles(colors), [isDark, createStyles]);
}
