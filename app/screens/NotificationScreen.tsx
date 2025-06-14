import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useNotificationStore } from '../store/notificationStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { COLORS, TYPOGRAPHY, SPACING } from '../utils/constants';
import { GameNotification } from '../types/notifications';

interface NotificationScreenProps {
  navigation: any;
}

export default function NotificationScreen({ navigation }: NotificationScreenProps) {
  const {
    notifications,
    unreadCount,
    markAllAsRead,
    clearAllNotifications,
    removeNotification,
  } = useNotificationStore();

  const [refreshing, setRefreshing] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    // Animate entrance
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Mark all notifications as read when viewing
    if (unreadCount > 0) {
      markAllAsRead();
    }
  }, [fadeAnim, unreadCount, markAllAsRead]);

  const onRefresh = async () => {
    setRefreshing(true);
    // In a real app, this would fetch latest notifications from server
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const handleNotificationPress = (notification: GameNotification, index: number) => {
    // Navigate based on notification type
    switch (notification.type) {
      case 'zone_attack':
      case 'zone_captured':
        navigation.navigate('Map', {
          zoneId: notification.data.zone_id
        });
        break;
      case 'battle_result':
        navigation.navigate('AttackHistory');
        break;
      case 'level_up':
        navigation.navigate('Profile');
        break;
      default:
        break;
    }
  };

  const handleRemoveNotification = (index: number) => {
    Alert.alert(
      'Remove Notification',
      'Are you sure you want to remove this notification?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          onPress: () => removeNotification(index.toString()),
          style: 'destructive'
        },
      ]
    );
  };

  const handleClearAll = () => {
    if (notifications.length === 0) return;

    Alert.alert(
      'Clear All Notifications',
      'Are you sure you want to clear all notifications?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          onPress: clearAllNotifications,
          style: 'destructive'
        },
      ]
    );
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'zone_attack':
        return 'gps-fixed';
      case 'battle_result':
        return 'local-fire-department';
      case 'zone_captured':
        return 'flag';
      case 'level_up':
        return 'trending-up';
      default:
        return 'notifications';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'zone_attack':
        return COLORS.error;
      case 'battle_result':
        return COLORS.warning;
      case 'zone_captured':
        return COLORS.success;
      case 'level_up':
        return COLORS.primary;
      default:
        return COLORS.textSecondary;
    }
  };

  const formatNotificationTime = (timestamp?: string) => {
    if (!timestamp) return 'Just now';

    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInMs = now.getTime() - notificationTime.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${diffInDays}d ago`;
  };

  const renderNotificationItem = (notification: GameNotification, index: number) => (
    <TouchableOpacity
      key={index}
      onPress={() => handleNotificationPress(notification, index)}
      style={styles.notificationItem}
    >
      <Card style={styles.notificationCard}>
        <View style={styles.notificationContent}>
          <View style={styles.notificationHeader}>
            <MaterialIcons
              name={getNotificationIcon(notification.type) as any}
              size={24}
              color={getNotificationColor(notification.type)}
              style={styles.notificationIcon}
            />
            <View style={styles.notificationText}>
              <Text style={styles.notificationTitle} numberOfLines={2}>
                {notification.title}
              </Text>
              <Text style={styles.notificationBody} numberOfLines={3}>
                {notification.body}
              </Text>
            </View>
            <View style={styles.notificationActions}>
              <Text style={styles.notificationTime}>
                {formatNotificationTime(notification.data?.timestamp)}
              </Text>
              <TouchableOpacity
                onPress={() => handleRemoveNotification(index)}
                style={styles.removeButton}
              >
                <MaterialIcons name="close" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Notifications</Text>
          {notifications.length > 0 && (
            <Button
              title="Clear All"
              onPress={handleClearAll}
              variant="text"
              style={styles.clearButton}
            />
          )}
        </View>

        {/* Notifications List */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.primary}
              colors={[COLORS.primary]}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {notifications.length > 0 ? (
            notifications.map((notification, index) =>
              renderNotificationItem(notification, index)
            )
          ) : (
            <View style={styles.emptyState}>
              <MaterialIcons
                name="notifications-off"
                size={64}
                color={COLORS.textSecondary}
                style={styles.emptyIcon}
              />
              <Text style={styles.emptyTitle}>No Notifications</Text>
              <Text style={styles.emptyText}>
                You're all caught up! Notifications about zone activities and battles will appear here.
              </Text>
            </View>
          )}
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
  },
  clearButton: {
    paddingHorizontal: SPACING.sm,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  notificationItem: {
    marginBottom: SPACING.md,
  },
  notificationCard: {
    padding: 0,
  },
  notificationContent: {
    padding: SPACING.md,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  notificationIcon: {
    marginRight: SPACING.md,
    marginTop: 2,
  },
  notificationText: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  notificationTitle: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  notificationBody: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  notificationActions: {
    alignItems: 'flex-end',
  },
  notificationTime: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  removeButton: {
    padding: SPACING.xs,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xxl * 2,
  },
  emptyIcon: {
    marginBottom: SPACING.lg,
    opacity: 0.5,
  },
  emptyTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  emptyText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
