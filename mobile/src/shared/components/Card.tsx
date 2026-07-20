import React, { useRef } from 'react';
import { View, StyleSheet, ViewStyle, StyleProp, TouchableOpacity, Animated } from 'react-native';
import { ThemeColors } from '../theme/colors';
import { BorderRadius, Spacing, Shadows } from '../theme/spacing';
import { useStyles } from '../theme/useStyles';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: 'default' | 'elevated' | 'outlined';
  onPress?: () => void;
}

export function Card({ children, style, variant = 'elevated', onPress }: CardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const styles = useStyles(createStyles);

  const containerStyle = [
    styles.card,
    variant === 'elevated' && Shadows.md,
    variant === 'outlined' && styles.outlined,
    style,
  ];

  if (onPress) {
    const onPressIn = () => {
      Animated.spring(scaleAnim, { toValue: 0.985, useNativeDriver: true, speed: 60, bounciness: 6 }).start();
    };
    const onPressOut = () => {
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 60, bounciness: 6 }).start();
    };

    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          style={containerStyle}
          onPress={onPress}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          activeOpacity={0.9}>
          {children}
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return <View style={containerStyle}>{children}</View>;
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  outlined: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
});