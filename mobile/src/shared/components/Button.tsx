import React, { useRef } from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, ViewStyle, Animated } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { ThemeColors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { BorderRadius, Spacing, Shadows } from '../theme/spacing';
import { useStyles } from '../theme/useStyles';
import { useAppTheme } from '../theme/useAppTheme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  icon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export function Button({ title, onPress, variant = 'primary', loading = false, disabled = false, style, icon, size = 'md' }: ButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const styles = useStyles(createStyles);
  const { colors } = useAppTheme();

  const onPressIn = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true, speed: 60, bounciness: 6 }),
      Animated.timing(opacityAnim, { toValue: 0.9, duration: 100, useNativeDriver: true }),
    ]).start();
  };
  const onPressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 60, bounciness: 6 }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();
  };

  const textColor =
    variant === 'outline' ? colors.primary :
      variant === 'ghost' ? colors.primary :
        colors.textOnPrimary;

  const borderColor =
    variant === 'outline' ? colors.primary :
      variant === 'danger' ? colors.error :
        'transparent';

  const height = size === 'sm' ? 40 : size === 'lg' ? 56 : 50;

  const isGradient = variant === 'primary' || variant === 'secondary' || variant === 'danger';
  const gradientColors =
    variant === 'primary' ? colors.gradientPrimary :
      variant === 'secondary' ? colors.gradientAccent :
        colors.gradientDanger;

  const content = loading ? (
    <ActivityIndicator color={textColor} size="small" />
  ) : (
    <>
      {icon ? (
        typeof icon === 'string' ? (
          <Text style={[styles.icon, { color: textColor }]}>{icon}</Text>
        ) : (
          icon
        )
      ) : null}
      <Text style={[styles.text, { color: textColor }]}>{title}</Text>
    </>
  );

  const flatBg = 'transparent';

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }], opacity: opacityAnim }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        disabled={disabled || loading}
        activeOpacity={0.92}
        style={[disabled && styles.disabledWrap, style]}>
        {isGradient ? (
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.button,
              { height, borderColor: 'transparent' },
              variant === 'primary' ? Shadows.md : variant === 'danger' ? Shadows.sm : Shadows.accentGlow,
            ]}>
            {content}
          </LinearGradient>
        ) : (
          <Animated.View
            style={[
              styles.button,
              { backgroundColor: flatBg, borderColor, height },
            ]}>
            {content}
          </Animated.View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  button: {
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderWidth: 1.5,
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
  },
  disabledWrap: {
    opacity: 0.5,
  },
  text: {
    ...Typography.button,
  },
  icon: {
    fontSize: 18,
  },
});
