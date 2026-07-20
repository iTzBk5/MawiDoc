import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Header } from '../../../shared/components/Header';
import { Card } from '../../../shared/components/Card';
import { Loading } from '../../../shared/components/Loading';
import { EmptyState } from '../../../shared/components/EmptyState';
import { ThemeColors } from '../../../shared/theme/colors';
import { useAppTheme } from '../../../shared/theme/useAppTheme';
import { useStyles } from '../../../shared/theme/useStyles';
import { Typography } from '../../../shared/theme/typography';
import { Spacing, BorderRadius } from '../../../shared/theme/spacing';
import { notificationService } from '../../../services/notification.service';
import { useNotificationStore } from '../../../store/notification.store';
import { useFocusEffect } from '@react-navigation/native';

export function NotificationsScreen() {
  const { colors } = useAppTheme();
  const styles = useStyles(createStyles);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { setUnreadCount } = useNotificationStore();

  useFocusEffect(useCallback(() => { loadData(); }, []));

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await notificationService.getNotifications();
      setNotifications(res.data || []);
      setUnreadCount(res.unreadCount || 0);
    } catch {} finally { setLoading(false); setRefreshing(false); }
  };

  const handleMarkAllRead = async () => {
    try { await notificationService.markAllAsRead(); loadData(); } catch {}
  };

  const onRefresh = () => { setRefreshing(true); loadData(); };

  if (loading) return <><Header title="Notifications" /><Loading /></>;

  return (
    <View style={styles.container}>
      <Header title="Notifications" rightElement={
        <TouchableOpacity onPress={handleMarkAllRead} style={styles.markAllBtn} activeOpacity={0.75}>
          <Ionicons name="checkmark-done" size={18} color={colors.white} />
        </TouchableOpacity>
      } />
      <View style={styles.body}>
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.accent]} />}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <Card style={item.read ? styles.notifCard : [styles.notifCard, styles.unread]}>
              <View style={styles.notifRow}>
                <View style={[styles.notifDot, !item.read && styles.notifDotActive]} />
                <View style={styles.notifContent}>
                  <Text style={styles.title}>{item.title}</Text>
                  <Text style={styles.bodyText}>{item.body}</Text>
                </View>
              </View>
            </Card>
          )}
          ListEmptyComponent={<EmptyState message="No notifications" icon="🔔" />}
          contentContainerStyle={styles.listContent}
        />
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  body: { flex: 1, padding: Spacing.lg },
  markAllBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.overlayWhite,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifCard: {
    padding: Spacing.lg,
  },
  unread: {
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
  },
  notifRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  notifDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.borderLight,
    marginTop: 6,
    marginRight: Spacing.md,
  },
  notifDotActive: {
    backgroundColor: colors.accent,
  },
  notifContent: {
    flex: 1,
  },
  title: { ...Typography.bodyBold, color: colors.textPrimary },
  bodyText: { ...Typography.body, color: colors.textSecondary, marginTop: Spacing.xs },
  listContent: {
    paddingBottom: Spacing.xxl,
  },
});
