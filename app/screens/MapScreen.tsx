import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Text,
  Dimensions,
  ActivityIndicator,
  Animated,
} from 'react-native';
import MapView, { Marker, Polygon, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import { useFocusEffect } from '@react-navigation/native';

// Services
import { useNearbyZones, useCheckInZone, useClaimZone, useAttackZone } from '../services/zoneService.real';

// Stores
import { useAuthStore } from '../store/authStore';
import { useGameStore } from '../store/gameStore';

// Components
import { LoadingScreen } from '../components/ui/LoadingScreen';
import { ZoneInfoCard } from '../components/game/ZoneInfoCard';
import { GameStats } from '../components/game/GameStats';

// Utils
import { COLORS, ZONE_SIZE } from '../utils/constants.enhanced';
import { calculateDistance, isUserInZone, generateZoneCoordinates } from '../utils/gameUtils';

// Types - Import from your types folder
import type { Zone, NearbyZonesResponse } from '../types/game';

interface UserLocation {
  latitude: number;
  longitude: number;
}

interface MapScreenProps {
  navigation: any;
}

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.01;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

export default function MapScreen({ navigation }: MapScreenProps) {
  const { user } = useAuthStore();
  const { userLocation, setUserLocation, selectedZone, setSelectedZone } = useGameStore();

  // State
  const [mapReady, setMapReady] = useState(false);
  const [userLocationError, setUserLocationError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [gameStats, setGameStats] = useState({
    nearbyZones: 0,
    ownedZones: 0,
    attackableZones: 0,
    unclaimedZones: 0,
  });

  // Refs
  const mapRef = useRef<MapView>(null);
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // API Hooks
  const {
    data: nearbyZonesResponse,
    isLoading: zonesLoading,
    refetch: refetchZones,
    error: zonesError,
  } = useNearbyZones(
    userLocation?.latitude,
    userLocation?.longitude,
    1000 // 1km radius
  );
  const nearbyZones = nearbyZonesResponse?.zones || [];
  const checkInMutation = useCheckInZone();
  const claimZoneMutation = useClaimZone();
  const attackZoneMutation = useAttackZone();

  // Pulse animation for interactive elements
  useEffect(() => {
    const pulse = Animated.loop(
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
    pulse.start();
    return () => pulse.stop();
  }, []);

  // Calculate game statistics
  useEffect(() => {
    if (nearbyZones.length > 0) {
      const stats = {
        nearbyZones: nearbyZones.length,
        ownedZones: nearbyZones.filter(zone => zone.owner?.id === user?.id).length,
        attackableZones: nearbyZones.filter(zone =>
          zone.is_claimed && zone.owner?.id !== user?.id
        ).length,
        unclaimedZones: nearbyZones.filter(zone => !zone.is_claimed).length,
      };
      setGameStats(stats);
    }
  }, [nearbyZones, user?.id]);

  // Focus effect to refresh data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      if (userLocation) {
        refetchZones();
      }
    }, [userLocation, refetchZones])
  );

  // Initialize location tracking
  useEffect(() => {
    initializeLocation();
    return () => {
      if (locationSubscription.current) {
        locationSubscription.current.remove();
      }
    };
  }, []);

  // Auto-center map when user location updates
  useEffect(() => {
    if (userLocation && mapReady && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      }, 1000);
    }
  }, [userLocation, mapReady]);

  const initializeLocation = async () => {
    try {
      // Check permissions
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') {
        const { status: newStatus } = await Location.requestForegroundPermissionsAsync();
        if (newStatus !== 'granted') {
          setUserLocationError('Location permission is required for the game');
          return;
        }
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const userPos: UserLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setUserLocation(userPos);

      // Start watching location changes
      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 10000, // Update every 10 seconds
          distanceInterval: 10, // Update every 10 meters
        },
        (newLocation) => {
          const newUserPos: UserLocation = {
            latitude: newLocation.coords.latitude,
            longitude: newLocation.coords.longitude,
          };
          setUserLocation(newUserPos);
        }
      );

    } catch (error) {
      console.error('❌ Location initialization error:', error);
      setUserLocationError('Failed to get your location');
    }
  };

  const handleZonePress = (zone: Zone) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedZone(zone);
  };
  // 🏁 CLAIM ZONE (for unclaimed zones)
  const handleClaimZone = async (zone: Zone) => {
    if (!userLocation) {
      Alert.alert('❌ Error', 'Unable to determine your location');
      return;
    }

    if (zone.is_claimed) {
      Alert.alert('⚠️ Already Claimed', 'This zone is already owned by someone!');
      return;
    }

    // Check distance (20m range)
    const distance = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      zone.center_lat,
      zone.center_lng
    );

    if (distance > 20) {
      Alert.alert(
        '📍 Too Far Away',
        `You need to be within 20 meters to claim this zone. You are ${Math.round(distance)}m away.`,
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      const result = await claimZoneMutation.mutateAsync({
        zoneId: zone.id,
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
      });

      Alert.alert(
        '🎉 Zone Claimed!',
        `Congratulations! You claimed ${zone.name}!\n\n💰 XP Gained: +${result.xp_gained}\n🛡️ Defense: ${result.zone.defense_points}`,
        [
          {
            text: '📊 View Details',
            onPress: () => navigation.navigate('ZoneDetail', { zone: result.zone }),
          },
          { text: '🎮 Continue Playing' },
        ]
      );

      refetchZones();
      setSelectedZone(null);
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const message = error?.response?.data?.detail || error?.message || 'Failed to claim zone';
      Alert.alert('❌ Claim Failed', message);
    }
  };

  // ✅ CHECK-IN (for owned zones)
  const handleCheckIn = async (zone: Zone) => {
    if (!userLocation) {
      Alert.alert('❌ Error', 'Unable to determine your location');
      return;
    }

    if (zone.owner?.id !== user?.id) {
      Alert.alert('⚠️ Not Your Zone', 'You can only check in to zones you own!');
      return;
    }

    const distance = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      zone.center_lat,
      zone.center_lng
    );

    if (distance > 20) {
      Alert.alert(
        '📍 Too Far Away',
        `You need to be within 20 meters to check in. You are ${Math.round(distance)}m away.`,
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      await checkInMutation.mutateAsync({
        zoneId: zone.id,
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
      });

      const xpGained = zone.level * 10; // Check-in XP

      Alert.alert(
        '✅ Check-in Success!',
        `Welcome back to ${zone.name}!\n\n💰 XP Gained: +${xpGained}\n🔋 Zone Energy Restored!`,
        [{ text: '🎮 Continue' }]
      );

      refetchZones();
      setSelectedZone(null);
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const message = error?.response?.data?.detail || error?.message || 'Check-in failed';
      Alert.alert('❌ Check-in Failed', message);
    }
  };
  // ⚔️ ATTACK ZONE (for enemy zones)
  const handleAttack = async (zone: Zone) => {
    if (!userLocation) {
      Alert.alert('❌ Error', 'Unable to determine your location');
      return;
    }

    if (!zone.is_claimed) {
      Alert.alert(
        '💡 Tip',
        'This zone is unclaimed! You can claim it instead of attacking.',
        [
          { text: 'Claim Zone', onPress: () => handleClaimZone(zone) },
          { text: 'Cancel' }
        ]
      );
      return;
    }

    if (zone.owner?.id === user?.id?.toString()) {
      Alert.alert(
        '🏠 Your Zone',
        'This is your zone! You can check in to gain XP.',
        [
          { text: 'Check In', onPress: () => handleCheckIn(zone) },
          { text: 'Cancel' }
        ]
      );
      return;
    }

    const distance = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      zone.center_lat,
      zone.center_lng
    );

    if (distance > 20) {
      Alert.alert(
        '📍 Too Far to Attack',
        `You need to be within 20 meters to attack. You are ${Math.round(distance)}m away.`,
        [{ text: 'OK' }]
      );
      return;
    }

    // Show attack preview
    const attackPower = (user?.level || 1) * 10 + Math.floor(Math.random() * 20);
    const defensePower = zone.defense_points;
    const successChance = Math.max(20, Math.min(80, (attackPower / defensePower) * 50));

    Alert.alert(
      '⚔️ Battle Preview',
      `Target: ${zone.name}\nOwner: ${zone.owner?.username}\n\n💪 Your Attack: ${attackPower}\n🛡️ Their Defense: ${defensePower}\n📊 Success Chance: ${Math.round(successChance)}%\n\n⚠️ Warning: Attacking costs energy!`,
      [
        {
          text: '⚔️ ATTACK!',
          style: 'destructive',
          onPress: async () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

            try {
              // Start attack
              const result = await attackZoneMutation.mutateAsync({
                zoneId: zone.id,
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
              });

              // Calculate if attack succeeded based on success chance
              const isSuccess = Math.random() < (successChance / 100);

              if (isSuccess) {
                Alert.alert(
                  '🎉 VICTORY!',
                  `Congratulations! You conquered ${zone.name}!\n\n💰 XP Gained: +${zone.level * 25}\n🏆 Zone captured!`,
                  [
                    {
                      text: '📊 View Details',
                      onPress: () => navigation.navigate('ZoneDetail', { zone }),
                    },
                    { text: '🎮 Continue Conquering!' },
                  ]
                );
              } else {
                Alert.alert(
                  '💥 DEFEAT',
                  `Your attack on ${zone.name} failed!\n\n💰 XP Gained: +${Math.floor(zone.level * 5)}\n🛡️ ${zone.owner?.username} defended successfully!`,
                  [
                    { text: 'Try Again Later' },
                    { text: '🎮 Continue Playing' },
                  ]
                );
              }

              refetchZones();
              setSelectedZone(null);
            } catch (error: any) {
              const message = error?.response?.data?.detail || error?.message || 'Attack failed';
              Alert.alert('❌ Attack Failed', message);
            }
          },
        },
        { text: 'Cancel' }
      ]
    );
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await refetchZones();
      await initializeLocation();
    } catch (error) {
      console.error('❌ Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const getZoneColor = (zone: Zone): string => {
    if (!zone.is_claimed) return COLORS.unclaimed || '#9E9E9E';
    if (zone.owner?.id === user?.id) return COLORS.owned || '#4CAF50';
    return COLORS.enemy || '#F44336';
  };

  const getZoneStatus = (zone: Zone) => {
    if (!zone.is_claimed) return { icon: 'flag-outline', status: 'UNCLAIMED' };
    if (zone.owner?.id === user?.id) return { icon: 'shield-checkmark', status: 'YOURS' };
    return { icon: 'flash', status: 'ENEMY' };
  };

  const renderZoneMarker = (zone: Zone) => {
    const zoneCoordinates = generateZoneCoordinates(zone.center_lat, zone.center_lng);
    const color = getZoneColor(zone);
    const status = getZoneStatus(zone);
    const isSelected = selectedZone?.id === zone.id;

    // Calculate distance for range indicators
    const distance = userLocation ? calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      zone.center_lat,
      zone.center_lng
    ) : 999;
    const isInRange = distance <= 20;

    return (
      <React.Fragment key={zone.id}>
        {/* Zone polygon */}
        <Polygon
          coordinates={zoneCoordinates}
          fillColor={`${color}${isInRange ? '60' : '30'}`} // More opacity when in range
          strokeColor={color}
          strokeWidth={isSelected ? 4 : isInRange ? 3 : 2}
          lineDashPattern={isInRange ? undefined : [5, 5]}
          onPress={() => handleZonePress(zone)}
        />

        {/* Zone center marker */}
        <Marker
          coordinate={{
            latitude: zone.center_lat,
            longitude: zone.center_lng,
          }}
          onPress={() => handleZonePress(zone)}
        >
          <Animated.View
            style={[
              styles.zoneMarker,
              {
                backgroundColor: color,
                transform: [
                  { scale: isSelected ? 1.2 : 1 },
                  { scale: isInRange ? pulseAnim : 1 }
                ]
              }
            ]}
          >
            <Text style={styles.zoneLevel}>{zone.level}</Text>
            <Ionicons
              name={status.icon as any}
              size={isInRange ? 16 : 12}
              color="white"
              style={styles.zoneIcon}
            />
            {isInRange && (
              <View style={styles.inRangeBadge}>
                <Text style={styles.inRangeText}>•</Text>
              </View>
            )}
          </Animated.View>
        </Marker>
      </React.Fragment>
    );
  };

  // Show loading screen during initial load
  if (!userLocation && !userLocationError) {
    return <LoadingScreen message="🗺️ Loading your adventure..." />;
  }

  // Show error state
  if (userLocationError) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="location-outline" size={64} color={COLORS.textSecondary} />
        <Text style={styles.errorTitle}>🌍 Location Required</Text>
        <Text style={styles.errorMessage}>{userLocationError}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={initializeLocation}>
          <Text style={styles.retryButtonText}>🔄 Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={
          userLocation
            ? {
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
              latitudeDelta: LATITUDE_DELTA,
              longitudeDelta: LONGITUDE_DELTA,
            }
            : undefined
        }
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsCompass={true}
        onMapReady={() => setMapReady(true)}
        onPress={() => setSelectedZone(null)}
      >
        {/* Render zone markers */}
        {nearbyZones.map(renderZoneMarker)}
      </MapView>

      {/* Game Stats Overlay */}
      <View style={styles.statsContainer}>
        <GameStats
          nearbyZones={gameStats.nearbyZones}
          ownedZones={gameStats.ownedZones}
          attackableZones={gameStats.attackableZones}
          userXP={user?.xp || 0}
        />
      </View>

      {/* Quick Action Buttons for Nearby Zones */}
      {userLocation && nearbyZones.some(zone => {
        const distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          zone.center_lat,
          zone.center_lng
        );
        return distance <= 20;
      }) && (
          <View style={styles.quickActionsContainer}>
            <Text style={styles.quickActionsTitle}>🎯 Zones in Range</Text>
            <View style={styles.quickActionButtons}>
              {nearbyZones
                .filter(zone => {
                  const distance = calculateDistance(
                    userLocation.latitude,
                    userLocation.longitude,
                    zone.center_lat,
                    zone.center_lng
                  );
                  return distance <= 20;
                })
                .slice(0, 3) // Show max 3 zones
                .map(zone => {
                  const isUnclaimed = !zone.is_claimed;
                  const isOwned = zone.owner?.id === user?.id;
                  const isEnemy = zone.is_claimed && zone.owner?.id !== user?.id;

                  return (
                    <TouchableOpacity
                      key={zone.id}
                      style={[
                        styles.quickActionButton,
                        isUnclaimed ? styles.claimAction :
                          isOwned ? styles.checkinAction :
                            styles.attackAction
                      ]}
                      onPress={() => {
                        if (isUnclaimed) handleClaimZone(zone);
                        else if (isOwned) handleCheckIn(zone);
                        else handleAttack(zone);
                      }}
                    >
                      <Ionicons
                        name={
                          isUnclaimed ? "flag" :
                            isOwned ? "checkmark-circle" :
                              "flash"
                        }
                        size={16}
                        color="white"
                      />
                      <Text style={styles.quickActionText}>
                        {isUnclaimed ? "CLAIM" : isOwned ? "CHECK-IN" : "ATTACK"}
                      </Text>
                      <Text style={styles.quickActionSubtext}>
                        {zone.name || `Zone ${zone.id.slice(-6)}`}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
            </View>
          </View>
        )}

      {/* Enhanced Control Buttons */}
      <View style={styles.controlsContainer}>
        {/* My Location Button */}
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <TouchableOpacity
            style={[styles.controlButton, styles.locationButton]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              if (userLocation && mapRef.current) {
                mapRef.current.animateToRegion({
                  latitude: userLocation.latitude,
                  longitude: userLocation.longitude,
                  latitudeDelta: LATITUDE_DELTA,
                  longitudeDelta: LONGITUDE_DELTA,
                }, 1000);
              }
            }}
          >
            <Ionicons name="locate" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        </Animated.View>

        {/* Refresh Button */}
        <TouchableOpacity
          style={[styles.controlButton, styles.refreshButton]}
          onPress={handleRefresh}
          disabled={refreshing}
        >
          {refreshing ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : (
            <Ionicons name="refresh" size={24} color={COLORS.primary} />
          )}
        </TouchableOpacity>
      </View>

      {/* Enhanced Zone Info Card */}
      {selectedZone && (
        <ZoneInfoCard
          zone={selectedZone}
          userLocation={userLocation}
          currentUserId={user?.id}
          onCheckIn={() => handleCheckIn(selectedZone)}
          onClaim={() => handleClaimZone(selectedZone)}
          onAttack={() => handleAttack(selectedZone)}
          onViewDetails={() => navigation.navigate('ZoneDetail', { zone: selectedZone })}
          onClose={() => setSelectedZone(null)}
        />
      )}

      {/* Loading overlay */}
      {zonesLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>🔄 Updating battlefield...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  map: {
    flex: 1,
  },
  statsContainer: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    zIndex: 1,
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 100,
    right: 16,
    zIndex: 1,
  },
  controlButton: {
    backgroundColor: COLORS.background,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  locationButton: {
    backgroundColor: '#4CAF50',
  },
  refreshButton: {
    backgroundColor: '#2196F3',
  },
  zoneMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  zoneLevel: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  zoneIcon: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 8,
    padding: 1,
  },
  inRangeBadge: {
    position: 'absolute',
    top: -4,
    left: -4,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inRangeText: {
    color: 'white',
    fontSize: 8,
    fontWeight: 'bold',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.background,
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
    lineHeight: 24,
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
  }, loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    marginTop: 8,
  },
  quickActionsContainer: {
    position: 'absolute',
    bottom: 120,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 12,
    padding: 12,
    zIndex: 100,
  },
  quickActionsTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  quickActionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickActionButton: {
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    minWidth: 80,
  },
  claimAction: {
    backgroundColor: '#4CAF50',
  },
  checkinAction: {
    backgroundColor: '#2196F3',
  },
  attackAction: {
    backgroundColor: '#F44336',
  },
  quickActionText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 2,
  },
  quickActionSubtext: {
    color: 'white',
    fontSize: 8,
    opacity: 0.8,
    marginTop: 1,
  },
});
