import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Spacing } from '../theme/spacing';
import { Button } from './Button';

interface EmptyStateProps {
  title?: string;
  message: string;
  icon?: string;
  actionTitle?: string;
  onAction?: () => void;
}

export function EmptyState({ title, message, icon, actionTitle, onAction }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconBackdrop}>
        <Text style={styles.icon}>{icon || "\uD83D\uDCC1"}</Text>
      </View>
      {title && <Text style={styles.title}>{title}</Text>}
      <Text style={styles.message}>{message}</Text>
      {actionTitle && onAction && (
        <Button
          title={actionTitle}
          onPress={onAction}
          variant="outline"
          style={styles.actionButton}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xxxl,
    minHeight: 200,
  },
  iconBackdrop: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.tintPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  icon: {
    fontSize: 40,
  },
  title: {
    ...Typography.h3,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  message: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.md,
  },
  actionButton: {
    minWidth: 160,
  },
});