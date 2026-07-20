import React, { useRef, useState } from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps, Animated, TouchableOpacity } from 'react-native';
import { ThemeColors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { BorderRadius, Spacing } from '../theme/spacing';
import { useStyles } from '../theme/useStyles';
import { useAppTheme } from '../theme/useAppTheme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
}

export function Input({ label, error, leftIcon, rightIcon, onRightIconPress, style, onFocus, onBlur, ...props }: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const borderAnim = useRef(new Animated.Value(0)).current;
  const styles = useStyles(createStyles);
  const { colors } = useAppTheme();

  const animateTo = (value: number) => {
    Animated.timing(borderAnim, { toValue: value, duration: 150, useNativeDriver: false }).start();
  };

  const handleFocus = (e: any) => {
    setIsFocused(true);
    animateTo(1);
    onFocus && onFocus(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    animateTo(0);
    onBlur && onBlur(e);
  };

  const borderColor = error
    ? colors.error
    : borderAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['transparent', colors.accent],
    });

  const backgroundColor = error
    ? colors.errorLight
    : borderAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [colors.surfaceMuted, colors.surface],
    });

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <Animated.View style={[styles.inputWrapper, { borderColor, backgroundColor }]}>
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={colors.textLight}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
        {rightIcon && (
          onRightIconPress ? (
            <TouchableOpacity onPress={onRightIconPress} style={styles.rightIcon} activeOpacity={0.7}>
              {rightIcon}
            </TouchableOpacity>
          ) : (
            <View style={styles.rightIcon}>{rightIcon}</View>
          )
        )}
      </Animated.View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  label: {
    ...Typography.label,
    color: colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: BorderRadius.md,
    height: 56,
    paddingHorizontal: Spacing.lg,
  },
  input: {
    flex: 1,
    height: '100%',
    color: colors.textPrimary,
    ...Typography.body,
  },
  leftIcon: {
    marginRight: Spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightIcon: {
    marginLeft: Spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    ...Typography.caption,
    color: colors.error,
    marginTop: Spacing.xs,
  },
});