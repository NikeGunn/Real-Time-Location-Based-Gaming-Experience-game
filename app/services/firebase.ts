import { initializeApp } from 'firebase/app';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

const firebaseConfig = {
  apiKey: Constants.expoConfig?.extra?.firebaseApiKey,
  authDomain: Constants.expoConfig?.extra?.firebaseAuthDomain,
  projectId: "location-game-backend",
  storageBucket: Constants.expoConfig?.extra?.firebaseStorageBucket,
  messagingSenderId: Constants.expoConfig?.extra?.firebaseMessagingSenderId,
  appId: Constants.expoConfig?.extra?.firebaseAppId
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export class FirebaseService {
  static async initialize(): Promise<void> {
    try {
      console.log('Firebase initialized successfully');
      // Request notification permissions
      await this.requestPermissions();
    } catch (error) {
      console.error('Firebase initialization failed:', error);
    }
  }

  static async requestPermissions(): Promise<string | null> {
    if (!Device.isDevice) {
      console.log('Must use physical device for Push Notifications');
      return null;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return null;
    }

    const token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log('Push token:', token);
    return token;
  }

  static setupNotificationListeners(
    onNotificationReceived: (notification: any) => void,
    onNotificationResponse: (response: any) => void
  ) {
    // Handle notifications when app is in foreground
    Notifications.addNotificationReceivedListener(onNotificationReceived);

    // Handle notification tap
    Notifications.addNotificationResponseReceivedListener(onNotificationResponse);
  }

  static async scheduleLocalNotification(
    title: string,
    body: string,
    data?: any
  ) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
      },
      trigger: null, // Show immediately
    });
  }

  static async cancelAllNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  // Enhanced notification methods for game events
  static async showZoneAttackNotification(
    zoneName: string,
    attackerName: string,
    zoneId: string
  ) {
    await this.scheduleLocalNotification(
      '🚨 Zone Under Attack!',
      `${attackerName} is attacking your zone "${zoneName}"`,
      {
        type: 'zone_attack',
        zone_id: zoneId,
        zone_name: zoneName,
        attacker_name: attackerName,
        timestamp: new Date().toISOString(),
      }
    );
  }

  static async showBattleResultNotification(
    result: 'victory' | 'defeat',
    zoneName: string,
    xpGained: number,
    opponentName: string
  ) {
    const title = result === 'victory' ? '🎉 Victory!' : '💔 Defeat';
    const body = result === 'victory'
      ? `You defended "${zoneName}" and gained ${xpGained} XP!`
      : `You lost "${zoneName}" to ${opponentName}`;

    await this.scheduleLocalNotification(title, body, {
      type: 'battle_result',
      result,
      zone_name: zoneName,
      xp_gained: xpGained,
      opponent_name: opponentName,
      timestamp: new Date().toISOString(),
    });
  }

  static async showZoneCapturedNotification(
    zoneName: string,
    xpGained: number,
    newZonesOwned: number
  ) {
    await this.scheduleLocalNotification(
      '🏴 Zone Captured!',
      `You claimed "${zoneName}" and gained ${xpGained} XP! You now own ${newZonesOwned} zones.`,
      {
        type: 'zone_captured',
        zone_name: zoneName,
        xp_gained: xpGained,
        new_zones_owned: newZonesOwned,
        timestamp: new Date().toISOString(),
      }
    );
  }

  static async showLevelUpNotification(
    oldLevel: number,
    newLevel: number,
    newAttackPower: number,
    bonusXP: number
  ) {
    await this.scheduleLocalNotification(
      '⭐ Level Up!',
      `Congratulations! You've reached Level ${newLevel}! Attack power: ${newAttackPower}, Bonus XP: ${bonusXP}`,
      {
        type: 'level_up',
        old_level: oldLevel,
        new_level: newLevel,
        new_attack_power: newAttackPower,
        bonus_xp: bonusXP,
        timestamp: new Date().toISOString(),
      }
    );
  }

  // Background notification handler
  static async handleBackgroundNotification(notification: any) {
    console.log('Background notification received:', notification);
    // Handle notification data and update local state if needed
    return notification;
  }

  // Get notification permissions status
  static async getNotificationPermissions() {
    const permissions = await Notifications.getPermissionsAsync();
    return permissions;
  }

  // Check if notifications are enabled
  static async areNotificationsEnabled(): Promise<boolean> {
    const permissions = await this.getNotificationPermissions();
    return permissions.status === 'granted';
  }
}

export default app;
