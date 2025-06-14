import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import { COLORS } from '../../utils/constants.enhanced';

export const DevelopmentTools: React.FC = () => {
  const triggerTestNotification = async () => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "🎮 Test Notification",
          body: "This is a test local notification for development!",
          data: { type: 'test', action: 'view_zone' },
        },
        trigger: null, // Show immediately
      });

      Alert.alert('Success', 'Test notification triggered!');
    } catch (error) {
      Alert.alert('Error', 'Failed to trigger notification: ' + error.message);
    }
  };

  const triggerGameNotifications = async () => {
    const notifications = [
      {
        title: "🚨 Zone Under Attack!",
        body: "Enemy player is attacking your zone 'Central Park'",
        data: { type: 'zone_attack', zone_id: 'zone_1' }
      },
      {
        title: "🎉 Victory!",
        body: "You successfully defended your zone and gained 50 XP!",
        data: { type: 'battle_result', result: 'victory' }
      },
      {
        title: "🏴 Zone Captured!",
        body: "You captured 'Downtown Plaza' and gained 100 XP!",
        data: { type: 'zone_captured', xp_gained: 100 }
      },
      {
        title: "⭐ Level Up!",
        body: "Congratulations! You've reached Level 5!",
        data: { type: 'level_up', new_level: 5 }
      }
    ];

    for (let i = 0; i < notifications.length; i++) {
      setTimeout(async () => {
        await Notifications.scheduleNotificationAsync({
          content: notifications[i],
          trigger: null,
        });
      }, i * 2000); // 2 seconds apart
    }

    Alert.alert('Success', `${notifications.length} test notifications will appear over 8 seconds!`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Development Tools</Text>
      <Text style={styles.subtitle}>Test notifications in Expo Go</Text>

      <TouchableOpacity style={styles.button} onPress={triggerTestNotification}>
        <Text style={styles.buttonText}>Test Single Notification</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={triggerGameNotifications}>
        <Text style={styles.buttonText}>Test Game Notifications</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: COLORS.secondary,
  },
  buttonText: {
    color: COLORS.textOnPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
});
