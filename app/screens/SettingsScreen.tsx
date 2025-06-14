import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { FirebaseService } from '../services/firebase';
import { simulateIncomingAttack } from '../services/attackService.enhanced';
import { COLORS, TYPOGRAPHY, SPACING } from '../utils/constants';

interface SettingsScreenProps {
  navigation: any;
}

interface NotificationSettings {
  zoneAttacks: boolean;
  battleResults: boolean;
  zoneCaptured: boolean;
  levelUp: boolean;
  allNotifications: boolean;
}

export default function SettingsScreen({ navigation }: SettingsScreenProps) {
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    zoneAttacks: true,
    battleResults: true,
    zoneCaptured: true,
    levelUp: true,
    allNotifications: true,
  });
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkNotificationPermissions();
  }, []);

  const checkNotificationPermissions = async () => {
    const enabled = await FirebaseService.areNotificationsEnabled();
    setNotificationsEnabled(enabled);
  };

  const requestNotificationPermissions = async () => {
    try {
      setLoading(true);
      const token = await FirebaseService.requestPermissions();
      if (token) {
        setNotificationsEnabled(true);
        Alert.alert('Success', 'Notifications have been enabled successfully!');
      } else {
        Alert.alert(
          'Permission Denied',
          'Please enable notifications in your device settings to receive game updates.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() }
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to enable notifications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleNotificationSetting = (setting: keyof NotificationSettings) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: !prev[setting],
      // If turning off all notifications, turn off individual settings
      ...(setting === 'allNotifications' && !prev.allNotifications
        ? { zoneAttacks: false, battleResults: false, zoneCaptured: false, levelUp: false }
        : {}),
      // If turning on any individual setting, turn on all notifications
      ...(setting !== 'allNotifications' && !prev[setting]
        ? { allNotifications: true }
        : {}),
      // If turning off the last individual setting, turn off all notifications
      ...(setting !== 'allNotifications' && prev[setting] &&
        Object.entries(prev).filter(([key, value]) =>
          key !== 'allNotifications' && key !== setting && value
        ).length === 0
        ? { allNotifications: false }
        : {}),
    }));
  };

  const testNotifications = async () => {
    if (!notificationsEnabled) {
      Alert.alert('Notifications Disabled', 'Please enable notifications first.');
      return;
    }

    Alert.alert(
      'Test Notifications',
      'Choose a notification type to test:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Zone Attack',
          onPress: () => simulateIncomingAttack('Central Park Zone', 'TestAttacker', 'zone_test_001')
        },
        {
          text: 'Battle Result',
          onPress: () => FirebaseService.showBattleResultNotification(
            'victory',
            'Test Zone',
            25,
            'TestOpponent'
          )
        },
        {
          text: 'Zone Captured',
          onPress: () => FirebaseService.showZoneCapturedNotification(
            'Test Zone',
            30,
            3
          )
        },
        {
          text: 'Level Up',
          onPress: () => FirebaseService.showLevelUpNotification(
            4,
            5,
            25,
            100
          )
        },
      ]
    );
  };

  const clearAllNotifications = async () => {
    Alert.alert(
      'Clear Notifications',
      'This will clear all pending notifications. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          onPress: async () => {
            await FirebaseService.cancelAllNotifications();
            Alert.alert('Success', 'All notifications have been cleared.');
          },
          style: 'destructive'
        },
      ]
    );
  };

  const renderSettingItem = (
    title: string,
    description: string,
    value: boolean,
    onToggle: () => void,
    icon: string
  ) => (
    <TouchableOpacity onPress={onToggle} style={styles.settingItem}>
      <View style={styles.settingContent}>
        <MaterialIcons name={icon as any} size={24} color={COLORS.primary} style={styles.settingIcon} />
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          <Text style={styles.settingDescription}>{description}</Text>
        </View>
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: COLORS.border, true: COLORS.primary }}
          thumbColor={value ? COLORS.surface : COLORS.textSecondary}
        />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Notification Status Card */}
        <Card style={styles.statusCard}>
          <View style={styles.statusContent}>
            <MaterialIcons
              name={notificationsEnabled ? 'notifications' : 'notifications-off'}
              size={32}
              color={notificationsEnabled ? COLORS.success : COLORS.error}
            />
            <View style={styles.statusText}>
              <Text style={styles.statusTitle}>
                Notifications {notificationsEnabled ? 'Enabled' : 'Disabled'}
              </Text>
              <Text style={styles.statusDescription}>
                {notificationsEnabled
                  ? 'You\'ll receive game updates and alerts'
                  : 'Enable notifications to get real-time game updates'
                }
              </Text>
            </View>
          </View>
          {!notificationsEnabled && (
            <Button
              title="Enable Notifications"
              onPress={requestNotificationPermissions}
              loading={loading}
              style={styles.enableButton}
            />
          )}
        </Card>

        {/* Notification Settings */}
        <Card style={styles.settingsCard}>
          <Text style={styles.sectionTitle}>Notification Preferences</Text>

          {renderSettingItem(
            'All Notifications',
            'Enable or disable all game notifications',
            notificationSettings.allNotifications,
            () => toggleNotificationSetting('allNotifications'),
            'notifications'
          )}

          <View style={styles.divider} />

          {renderSettingItem(
            'Zone Attacks',
            'Get alerted when your zones are under attack',
            notificationSettings.zoneAttacks && notificationSettings.allNotifications,
            () => toggleNotificationSetting('zoneAttacks'),
            'gps-fixed'
          )}

          {renderSettingItem(
            'Battle Results',
            'Receive updates on attack outcomes',
            notificationSettings.battleResults && notificationSettings.allNotifications,
            () => toggleNotificationSetting('battleResults'),
            'local-fire-department'
          )}

          {renderSettingItem(
            'Zone Captured',
            'Celebrate when you successfully claim zones',
            notificationSettings.zoneCaptured && notificationSettings.allNotifications,
            () => toggleNotificationSetting('zoneCaptured'),
            'flag'
          )}

          {renderSettingItem(
            'Level Up',
            'Get notified when you reach a new level',
            notificationSettings.levelUp && notificationSettings.allNotifications,
            () => toggleNotificationSetting('levelUp'),
            'trending-up'
          )}
        </Card>

        {/* Testing & Management */}
        <Card style={styles.managementCard}>
          <Text style={styles.sectionTitle}>Notification Management</Text>

          <Button
            title="Test Notifications"
            onPress={testNotifications}
            variant="outline"
            style={styles.managementButton}
            disabled={!notificationsEnabled}
          />

          <Button
            title="Clear All Pending"
            onPress={clearAllNotifications}
            variant="outline"
            style={styles.managementButton}
          />

          <TouchableOpacity
            onPress={() => Linking.openSettings()}
            style={styles.systemSettingsButton}
          >
            <MaterialIcons name="settings" size={20} color={COLORS.primary} />
            <Text style={styles.systemSettingsText}>Open System Settings</Text>
          </TouchableOpacity>
        </Card>

        {/* Game Info */}
        <Card style={styles.infoCard}>
          <Text style={styles.sectionTitle}>About Notifications</Text>
          <Text style={styles.infoText}>
            • Zone attacks notify you when opponents target your territories{'\n'}
            • Battle results show the outcome of attacks and defenses{'\n'}
            • Zone captured celebrates successful claims and conquests{'\n'}
            • Level up announces your progression milestones{'\n\n'}
            Notifications help you stay engaged with the game even when you're not actively playing.
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  statusCard: {
    marginBottom: SPACING.lg,
    padding: SPACING.lg,
  },
  statusContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  statusText: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  statusTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  statusDescription: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  enableButton: {
    marginTop: SPACING.sm,
  },
  settingsCard: {
    marginBottom: SPACING.lg,
    padding: SPACING.lg,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  settingItem: {
    marginBottom: SPACING.md,
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    marginRight: SPACING.md,
  },
  settingText: {
    flex: 1,
    marginRight: SPACING.md,
  },
  settingTitle: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  settingDescription: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.md,
  },
  managementCard: {
    marginBottom: SPACING.lg,
    padding: SPACING.lg,
  },
  managementButton: {
    marginBottom: SPACING.md,
  },
  systemSettingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    marginTop: SPACING.sm,
  },
  systemSettingsText: {
    ...TYPOGRAPHY.body,
    color: COLORS.primary,
    marginLeft: SPACING.sm,
  },
  infoCard: {
    padding: SPACING.lg,
  },
  infoText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
});
