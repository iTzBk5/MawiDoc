import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform, StatusBar } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { ThemeColors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Spacing } from '../theme/spacing';
import { useStyles } from '../theme/useStyles';
import { useAppTheme } from '../theme/useAppTheme';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightElement?: React.ReactNode;
}

export function Header({ title, subtitle, onBack, rightElement }: HeaderProps) {
  const styles = useStyles(createStyles);
  const { colors } = useAppTheme();

  return (
    <LinearGradient colors={colors.gradientPrimary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
      <SafeAreaView>
        <View style={styles.container}>
          <View style={styles.left}>
            {onBack ? (
              <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.75}>
                <Text style={styles.backIcon}>{"\u2190"}</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.placeholder} />
            )}
          </View>

          <View style={styles.center}>
            <Text style={styles.title} numberOfLines={1}>{title}</Text>
            {subtitle && <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>}
          </View>

          <View style={styles.right}>
            {rightElement || <View style={styles.placeholder} />}
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    height: 64 + (Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 0),
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
  },
  left: {
    flex: 1,
    alignItems: 'flex-start',
  },
  center: {
    flex: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  right: {
    flex: 1,
    alignItems: 'flex-end',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.overlayWhite,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    color: colors.textOnPrimary,
    fontSize: 20,
    fontWeight: '600',
  },
  title: {
    ...Typography.h3,
    color: colors.textOnPrimary,
  },
  subtitle: {
    ...Typography.caption,
    color: colors.accentLight,
    marginTop: 2,
  },
  placeholder: {
    width: 38,
  },
});
