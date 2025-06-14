import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useAuthStore } from '../../store/authStore';
import { COLORS } from '../../utils/constants.enhanced';

interface GameStatsProps {
  nearbyZones?: number;
  ownedZones?: number;
  attackableZones?: number;
  userXP?: number;
}

export const GameStats: React.FC<GameStatsProps> = ({
  nearbyZones = 0,
  ownedZones = 0,
  attackableZones = 0,
  userXP = 0
}) => {
  const { user } = useAuthStore();

  if (!user) return null;

  const progressToNextLevel = ((user.xp % 1000) / 1000) * 100;

  return (
    <BlurView intensity={80} tint="light" style={styles.container}>
      <View style={styles.content}>
        {/* Level and XP */}
        <View style={styles.levelContainer}>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>{user.level}</Text>
          </View>
          <View style={styles.xpContainer}>
            <Text style={styles.usernameText}>{user.username}</Text>
            <View style={styles.xpBar}>
              <View style={[styles.xpProgress, { width: `${progressToNextLevel}%` }]} />
              <Text style={styles.xpText}>
                {user.xp % 1000}/1000 XP
              </Text>
            </View>
          </View>
        </View>        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Ionicons name="location" size={16} color={COLORS.primary} />
            <Text style={styles.statValue}>{nearbyZones}</Text>
            <Text style={styles.statLabel}>Nearby</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="shield-checkmark" size={16} color={COLORS.success} />
            <Text style={styles.statValue}>{ownedZones}</Text>
            <Text style={styles.statLabel}>Owned</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="flash" size={16} color={COLORS.error} />
            <Text style={styles.statValue}>{attackableZones}</Text>
            <Text style={styles.statLabel}>Targets</Text>
          </View>
        </View>
      </View>
    </BlurView>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 8,
  },
  content: {
    padding: 16,
  },
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  levelBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  levelText: {
    color: COLORS.textOnPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  xpContainer: {
    flex: 1,
  },
  usernameText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  xpBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
  },
  xpProgress: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  xpText: {
    fontSize: 10,
    color: COLORS.textPrimary,
    textAlign: 'center',
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  }, statItem: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 2,
    minWidth: 60,
  },
  statValue: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '500',
    color: COLORS.textPrimary,
    opacity: 0.8,
  },
});
