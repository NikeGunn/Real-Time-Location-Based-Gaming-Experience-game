import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/authStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { DevelopmentTools } from '../components/ui/DevelopmentTools';
import { COLORS, TYPOGRAPHY, SPACING } from '../utils/constants';
import { getLevelFromXp, getXpProgress, formatTimestamp } from '../utils/helpers';
import Constants from 'expo-constants';

interface ProfileScreenProps {
  navigation: any;
}

export default function ProfileScreen({ navigation }: ProfileScreenProps) {
  const { user, clearAuth } = useAuthStore();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => clearAuth(),
        },
      ]
    );
  };

  const navigateToAttackHistory = () => {
    navigation.navigate('AttackHistory');
  };

  if (!user) {
    return null;
  }

  const level = getLevelFromXp(user.xp);
  const xpProgress = getXpProgress(user.xp);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.username}>{user.username}</Text>
          <Text style={styles.joinDate}>
            Joined {formatTimestamp(user.created_at)}
          </Text>
        </View>

        {/* Level & XP Card */}
        <Card title="Level & Experience">
          <View style={styles.levelContainer}>
            <View style={styles.levelInfo}>
              <Text style={styles.levelText}>Level {level}</Text>
              <Text style={styles.xpText}>{user.xp} XP</Text>
            </View>

            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[styles.progressFill, { width: `${xpProgress * 100}%` }]}
                />
              </View>
              <Text style={styles.progressText}>
                {Math.round(xpProgress * 100)}% to next level
              </Text>
            </View>
          </View>
        </Card>

        {/* Stats Card */}
        <Card title="Game Statistics">
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user.zones_owned}</Text>
              <Text style={styles.statLabel}>Zones Owned</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user.attack_power || 50}</Text>
              <Text style={styles.statLabel}>Attack Power</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>Attacks Made</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={styles.statValue}>0%</Text>
              <Text style={styles.statLabel}>Success Rate</Text>
            </View>
          </View>
        </Card>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title="Attack History"
            onPress={navigateToAttackHistory}
            variant="secondary"
            style={styles.actionButton}
          />

          <Button
            title="Logout"
            onPress={handleLogout}
            variant="danger"
            style={styles.actionButton}
          />
        </View>

        {/* Development Tools (only in Expo Go) */}
        {Constants.appOwnership === 'expo' && <DevelopmentTools />}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.LIGHT_GRAY,
  },
  content: {
    padding: SPACING.MD,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.LG,
    paddingVertical: SPACING.LG,
  },
  username: {
    ...TYPOGRAPHY.LARGE_TITLE,
    color: COLORS.DARK,
    marginBottom: SPACING.XS,
  },
  joinDate: {
    ...TYPOGRAPHY.FOOTNOTE,
    color: COLORS.GRAY,
  },
  levelContainer: {
    alignItems: 'center',
  },
  levelInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: SPACING.MD,
  },
  levelText: {
    ...TYPOGRAPHY.TITLE,
    color: COLORS.PRIMARY,
    fontWeight: 'bold',
  },
  xpText: {
    ...TYPOGRAPHY.HEADLINE,
    color: COLORS.DARK,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: COLORS.LIGHT_GRAY,
    borderRadius: 4,
    marginBottom: SPACING.XS,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 4,
  },
  progressText: {
    ...TYPOGRAPHY.CAPTION,
    color: COLORS.GRAY,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: SPACING.MD,
  },
  statValue: {
    ...TYPOGRAPHY.TITLE,
    color: COLORS.PRIMARY,
    fontWeight: 'bold',
  },
  statLabel: {
    ...TYPOGRAPHY.CAPTION,
    color: COLORS.GRAY,
    textAlign: 'center',
  },
  actions: {
    marginTop: SPACING.LG,
  },
  actionButton: {
    marginBottom: SPACING.MD,
  },
});
