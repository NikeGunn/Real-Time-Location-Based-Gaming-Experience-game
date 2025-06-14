import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { BlurView } from 'expo-blur';

// Services
import { useAttackZone } from '../services/zoneService.real';

// Stores
import { useAuthStore } from '../store/authStore';
import { useGameStore } from '../store/gameStore';

// Utils
import { COLORS } from '../utils/constants.enhanced';
import { calculateAttackSuccessRate, isUserInZone } from '../utils/gameUtils';

import { Zone } from '../types/game';

const { width, height } = Dimensions.get('window');

type AttackScreenRouteParams = {
  zone: Zone;
};

export default function AttackScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const { userLocation } = useGameStore();

  const zone = route.params?.zone as Zone;
  const [isAttacking, setIsAttacking] = useState(false);
  const [attackResult, setAttackResult] = useState<'victory' | 'defeat' | null>(null);

  const attackMutation = useAttackZone();

  // Animations
  const pulseAnim = React.useRef(new Animated.Value(1)).current;
  const shakeAnim = React.useRef(new Animated.Value(0)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start pulse animation
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    return () => pulseAnimation.stop();
  }, []);

  useEffect(() => {
    if (attackResult) {
      // Fade in result
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [attackResult]);

  const handleAttack = async () => {
    if (!userLocation || !zone || !user) return;

    // Check if user is within zone bounds
    if (!isUserInZone(userLocation, zone)) {
      Alert.alert(
        'Too Far Away',
        'You need to be inside the zone to attack. Move closer and try again.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Check if zone is owned by another player
    if (!zone.owner || zone.owner.id === user.id?.toString()) {
      Alert.alert('Invalid Target', 'You cannot attack this zone.');
      return;
    }

    setIsAttacking(true);

    // Start attack animation
    const attackAnimation = Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]);

    attackAnimation.start();

    try {
      const result = await attackMutation.mutateAsync({
        zoneId: zone.id,
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
      });

      // Simulate battle result based on success rate
      const successRate = calculateAttackSuccessRate(
        user.level || 1,
        zone.level || 1,
        zone.level
      );

      const isVictory = Math.random() < successRate;
      setAttackResult(isVictory ? 'victory' : 'defeat');

      // Show result after animation
      setTimeout(() => {
        if (isVictory) {
          Alert.alert(
            '🎉 Victory!',
            `You have successfully captured ${zone.name}!\nXP Gained: ${zone.level * 25}`,
            [
              {
                text: 'Awesome!',
                onPress: () => navigation.goBack(),
              },
            ]
          );
        } else {
          Alert.alert(
            '💥 Defeat',
            `Your attack failed. ${zone.owner?.username} defended their zone successfully.`,
            [
              {
                text: 'Try Again',
                onPress: () => setAttackResult(null),
              },
              {
                text: 'Retreat',
                onPress: () => navigation.goBack(),
              },
            ]
          );
        }
      }, 2000);

    } catch (error: any) {
      const message = error?.response?.data?.detail || error?.message || 'Attack failed';
      Alert.alert('Attack Failed', message);
    } finally {
      setIsAttacking(false);
    }
  };

  if (!zone) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color={COLORS.error} />
          <Text style={styles.errorTitle}>Invalid Zone</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const successRate = user ? calculateAttackSuccessRate(
    user.level || 1,
    zone.level || 1,
    zone.level
  ) : 0.5;

  return (
    <SafeAreaView style={styles.container}>
      <BlurView intensity={20} tint="dark" style={styles.background}>
        <View style={styles.content}>
          {/* Zone Info */}
          <View style={styles.zoneInfo}>
            <Text style={styles.zoneTitle}>Attacking</Text>
            <Text style={styles.zoneName}>{zone.name || `Zone ${zone.id.slice(-6)}`}</Text>
            <Text style={styles.ownerText}>Owned by {zone.owner?.username}</Text>
          </View>

          {/* Battle Stats */}
          <View style={styles.battleStats}>
            <View style={styles.statContainer}>
              <Text style={styles.statLabel}>Your Level</Text>
              <Text style={styles.statValue}>{user?.level || 1}</Text>
            </View>
            <View style={styles.vsContainer}>
              <Ionicons name="flash" size={32} color={COLORS.warning} />
              <Text style={styles.vsText}>VS</Text>
            </View>
            <View style={styles.statContainer}>
              <Text style={styles.statLabel}>Zone Level</Text>
              <Text style={styles.statValue}>{zone.level}</Text>
            </View>
          </View>

          {/* Success Rate */}
          <View style={styles.successRateContainer}>
            <Text style={styles.successRateLabel}>Success Rate</Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${successRate * 100}%`,
                    backgroundColor: successRate > 0.7 ? COLORS.success :
                      successRate > 0.4 ? COLORS.warning : COLORS.error
                  }
                ]}
              />
            </View>
            <Text style={styles.successRateText}>{Math.round(successRate * 100)}%</Text>
          </View>

          {/* Attack Result */}
          {attackResult && (
            <Animated.View style={[styles.resultContainer, { opacity: fadeAnim }]}>
              <Ionicons
                name={attackResult === 'victory' ? 'trophy' : 'close-circle'}
                size={64}
                color={attackResult === 'victory' ? COLORS.success : COLORS.error}
              />
              <Text style={[
                styles.resultText,
                { color: attackResult === 'victory' ? COLORS.success : COLORS.error }
              ]}>
                {attackResult === 'victory' ? 'VICTORY!' : 'DEFEAT!'}
              </Text>
            </Animated.View>
          )}

          {/* Attack Button */}
          {!attackResult && (
            <Animated.View
              style={[
                styles.attackButtonContainer,
                {
                  transform: [
                    { scale: pulseAnim },
                    { translateX: shakeAnim }
                  ]
                }
              ]}
            >
              <TouchableOpacity
                style={[styles.attackButton, isAttacking && styles.attackButtonDisabled]}
                onPress={handleAttack}
                disabled={isAttacking || attackMutation.isPending}
              >
                {isAttacking || attackMutation.isPending ? (
                  <ActivityIndicator size="large" color={COLORS.textOnError} />
                ) : (
                  <>
                    <Ionicons name="flash" size={32} color={COLORS.textOnError} />
                    <Text style={styles.attackButtonText}>ATTACK!</Text>
                  </>
                )}
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* Warning */}
          <View style={styles.warningContainer}>
            <Ionicons name="warning" size={20} color={COLORS.warning} />
            <Text style={styles.warningText}>
              Attacking consumes energy and has a cooldown period
            </Text>
          </View>
        </View>
      </BlurView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  background: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: COLORS.textOnPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  zoneInfo: {
    alignItems: 'center',
    marginBottom: 40,
  },
  zoneTitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  zoneName: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  ownerText: {
    fontSize: 16,
    color: COLORS.error,
    fontWeight: '500',
  },
  battleStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
    width: '100%',
    justifyContent: 'space-around',
  },
  statContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 20,
    borderRadius: 16,
    minWidth: 100,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  vsContainer: {
    alignItems: 'center',
  },
  vsText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.warning,
    marginTop: 4,
  },
  successRateContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 40,
  },
  successRateLabel: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  progressBar: {
    width: '80%',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  successRateText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  resultContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  resultText: {
    fontSize: 32,
    fontWeight: '900',
    marginTop: 16,
  },
  attackButtonContainer: {
    marginBottom: 40,
  },
  attackButton: {
    backgroundColor: COLORS.error,
    paddingHorizontal: 48,
    paddingVertical: 20,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: COLORS.error,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  attackButtonDisabled: {
    opacity: 0.6,
  },
  attackButtonText: {
    color: COLORS.textOnError,
    fontSize: 24,
    fontWeight: '900',
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    padding: 12,
    borderRadius: 8,
    maxWidth: '90%',
  },
  warningText: {
    color: COLORS.warning,
    fontSize: 12,
    marginLeft: 8,
    textAlign: 'center',
    flex: 1,
  },
});
