import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';

// Services
import { useZone, useCheckInZone, useAttackZone } from '../services/zoneService.real';

// Stores
import { useAuthStore } from '../store/authStore';
import { useGameStore } from '../store/gameStore';

// Utils
import { COLORS } from '../utils/constants.enhanced';
import {
  formatDistance,
  formatTimeAgo,
  calculateCheckInXP,
  canAttackZone,
  canClaimZone,
  canCheckIntoZone,
  isUserInZone
} from '../utils/gameUtils';

export default function ZoneDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const { userLocation } = useGameStore();

  const zone = route.params?.zone;
  const zoneId = zone?.id;

  const {
    data: detailedZone,
    isLoading: zoneLoading,
    refetch: refetchZone,
  } = useZone(zoneId);

  const checkInMutation = useCheckInZone();
  const attackMutation = useAttackZone();

  const currentZone = detailedZone || zone;

  const handleCheckIn = async () => {
    if (!userLocation || !currentZone) return;

    if (!isUserInZone(userLocation, currentZone)) {
      Alert.alert(
        'Too Far Away',
        'You need to be inside the zone to check in. Move closer and try again.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      await checkInMutation.mutateAsync(currentZone.id);
      const xpGained = calculateCheckInXP(currentZone.level);
      Alert.alert(
        'Check-in Successful! 🎉',
        `You gained ${xpGained} XP!`,
        [{ text: 'Awesome!' }]
      );
      refetchZone();
    } catch (error: any) {
      const message = error?.response?.data?.detail || error?.message || 'Failed to check in';
      Alert.alert('Check-in Failed', message);
    }
  };

  const handleAttack = () => {
    if (!currentZone) return;
    navigation.navigate('Attack', { zone: currentZone });
  };

  const getDistance = () => {
    if (!userLocation || !currentZone) return null;
    const distance = Math.sqrt(
      Math.pow(userLocation.latitude - currentZone.center_lat, 2) +
      Math.pow(userLocation.longitude - currentZone.center_lng, 2)
    ) * 111000; // Rough conversion to meters
    return formatDistance(distance);
  };

  const getZoneStatus = () => {
    if (!currentZone?.is_claimed) return { text: 'Unclaimed', color: COLORS.textSecondary, icon: 'help-circle' };
    if (currentZone.owner?.id === user?.id) return { text: 'Your Zone', color: COLORS.success, icon: 'checkmark-circle' };
    return { text: `Owned by ${currentZone.owner?.username}`, color: COLORS.error, icon: 'shield' };
  };

  if (zoneLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading zone details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentZone) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color={COLORS.error} />
          <Text style={styles.errorTitle}>Zone Not Found</Text>
          <Text style={styles.errorMessage}>Unable to load zone details.</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => navigation.goBack()}>
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const status = getZoneStatus();
  const distance = getDistance();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.zoneIcon}>
            <Ionicons name={status.icon as any} size={32} color={status.color} />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.zoneName}>{currentZone.name || `Zone ${currentZone.id.slice(-6)}`}</Text>
            <Text style={[styles.status, { color: status.color }]}>{status.text}</Text>
          </View>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>{currentZone.level}</Text>
          </View>
        </View>

        {/* Zone Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="flash" size={24} color={COLORS.warning} />
            <Text style={styles.statValue}>{currentZone.defense_points}</Text>
            <Text style={styles.statLabel}>Defense</Text>
          </View>

          {distance && (
            <View style={styles.statCard}>
              <Ionicons name="location" size={24} color={COLORS.success} />
              <Text style={styles.statValue}>{distance}</Text>
              <Text style={styles.statLabel}>Distance</Text>
            </View>
          )}

          <View style={styles.statCard}>
            <Ionicons name="star" size={24} color={COLORS.primary} />
            <Text style={styles.statValue}>{calculateCheckInXP(currentZone.level)}</Text>
            <Text style={styles.statLabel}>XP Reward</Text>
          </View>
        </View>

        {/* Zone Information */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Zone Information</Text>

          <View style={styles.infoItem}>
            <Ionicons name="calendar" size={20} color={COLORS.textSecondary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Created</Text>
              <Text style={styles.infoValue}>{formatTimeAgo(currentZone.created_at)}</Text>
            </View>
          </View>

          {currentZone.last_attacked && (
            <View style={styles.infoItem}>
              <Ionicons name="flash" size={20} color={COLORS.error} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Last Attacked</Text>
                <Text style={styles.infoValue}>{formatTimeAgo(currentZone.last_attacked)}</Text>
              </View>
            </View>
          )}

          <View style={styles.infoItem}>
            <Ionicons name="location" size={20} color={COLORS.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Coordinates</Text>
              <Text style={styles.infoValue}>
                {currentZone.center_lat.toFixed(6)}, {currentZone.center_lng.toFixed(6)}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          {canClaimZone(currentZone, user?.id) && (
            <TouchableOpacity
              style={[styles.actionButton, styles.claimButton]}
              onPress={handleCheckIn}
              disabled={checkInMutation.isPending}
            >
              {checkInMutation.isPending ? (
                <ActivityIndicator size="small" color={COLORS.textOnPrimary} />
              ) : (
                <Ionicons name="flag" size={20} color={COLORS.textOnPrimary} />
              )}
              <Text style={[styles.actionButtonText, styles.claimButtonText]}>
                {checkInMutation.isPending ? 'Claiming...' : 'Claim Zone'}
              </Text>
            </TouchableOpacity>
          )}

          {canCheckIntoZone(currentZone, user?.id) && (
            <TouchableOpacity
              style={[styles.actionButton, styles.checkinButton]}
              onPress={handleCheckIn}
              disabled={checkInMutation.isPending}
            >
              {checkInMutation.isPending ? (
                <ActivityIndicator size="small" color={COLORS.textOnSuccess} />
              ) : (
                <Ionicons name="checkmark-circle" size={20} color={COLORS.textOnSuccess} />
              )}
              <Text style={[styles.actionButtonText, styles.checkinButtonText]}>
                {checkInMutation.isPending ? 'Checking In...' : 'Check In'}
              </Text>
            </TouchableOpacity>
          )}

          {canAttackZone(currentZone, user?.id) && (
            <TouchableOpacity
              style={[styles.actionButton, styles.attackButton]}
              onPress={handleAttack}
            >
              <Ionicons name="flash" size={20} color={COLORS.textOnError} />
              <Text style={[styles.actionButtonText, styles.attackButtonText]}>
                Attack Zone
              </Text>
            </TouchableOpacity>
          )}
        </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: COLORS.textOnPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.surface,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
  },
  zoneIcon: {
    width: 60,
    height: 60,
    backgroundColor: COLORS.background,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerText: {
    flex: 1,
  },
  zoneName: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  status: {
    fontSize: 14,
    fontWeight: '500',
  },
  levelBadge: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelText: {
    color: COLORS.textOnPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  statsContainer: {
    flexDirection: 'row',
    margin: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  infoSection: {
    margin: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoContent: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  actionsSection: {
    padding: 16,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  claimButton: {
    backgroundColor: COLORS.primary,
  },
  claimButtonText: {
    color: COLORS.textOnPrimary,
  },
  checkinButton: {
    backgroundColor: COLORS.success,
  },
  checkinButtonText: {
    color: COLORS.textOnSuccess,
  },
  attackButton: {
    backgroundColor: COLORS.error,
  },
  attackButtonText: {
    color: COLORS.textOnError,
  },
});
