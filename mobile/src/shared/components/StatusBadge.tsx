import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ThemeColors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { BorderRadius, Spacing } from '../theme/spacing';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../theme/useAppTheme';

type StatusType = 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'completed' | 'passed';

interface StatusBadgeProps {
  status: StatusType | string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const normalizedStatus = status.toLowerCase() as StatusType;

  let bgColor: string = colors.surfaceMuted;
  let textColor: string = colors.textSecondary;

  switch (normalizedStatus) {
    case 'pending':
      bgColor = colors.pendingBg;
      textColor = colors.pending;
      break;
    case 'accepted':
      bgColor = colors.acceptedBg;
      textColor = colors.accepted;
      break;
    case 'rejected':
      bgColor = colors.rejectedBg;
      textColor = colors.error;
      break;
    case 'cancelled':
      bgColor = colors.cancelledBg;
      textColor = colors.cancelled;
      break;
    case 'completed':
      bgColor = colors.completedBg;
      textColor = colors.completed;
      break;
    case 'passed':
      bgColor = colors.surfaceMuted;
      textColor = colors.textSecondary;
      break;
  }

  return (
    <View style={[styles.badge, { backgroundColor: bgColor }]}>
      <View style={[styles.dot, { backgroundColor: textColor }]} />
      <Text style={[styles.text, { color: textColor }]}>
        {t(`status.${normalizedStatus}`, status.toUpperCase())}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    ...Typography.overline,
    fontWeight: '700',
  },
});