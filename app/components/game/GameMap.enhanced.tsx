import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import MapView, { Region, PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useZones } from '../../services/zoneService';
import { useGameStore } from '../../store/gameStore';
import { useAuthStore } from '../../store/authStore';
import { GAME_CONFIG, COLORS, TYPOGRAPHY, SPACING } from '../../utils/constants';
import { calculateDistance, getLevelFromXp } from '../../utils/helpers';
import { ZoneTile } from './ZoneTile';
import { Zone } from '../../types/game';

interface GameMapProps {
  onZonePress: (zone: Zone) => void;
}

export const GameMap: React.FC<GameMapProps> = ({ onZonePress }) => {
  const mapRef = useRef<MapView>(null);
  const { user } = useAuthStore();
  const {
    zones,
    userLocation,
    setUserLocation,
    getZoneStatus,
    getZoneColor,
    setLocationPermission,
  } = useGameStore();

  const [region, setRegion] = useState<Region | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [showStats, setShowStats] = useState(true);

  // Fetch zones with React Query
  const { data: fetchedZones, isLoading, error } = useZones();

  useEffect(() => {
    initializeLocation();
  }, []);

  const initializeLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationPermission(false);
        Alert.alert('Permission Required', 'Location access is required for the game');
        return;
      }

      setLocationPermission(true);

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const newLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setUserLocation(newLocation);

      const initialRegion: Region = {
        ...newLocation,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      setRegion(initialRegion);
    } catch (error) {
      console.error('Error getting location:', error);

      // Set default location for demo (New York City)
      const defaultLocation = {
        latitude: 40.7589,
        longitude: -73.9851,
      };

      setUserLocation(defaultLocation);
      setRegion({
        ...defaultLocation,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };

  const handleZonePress = (zone: Zone) => {
    if (!userLocation) {
      Alert.alert('Error', 'Unable to determine your location'); return;
    }

    const distance = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      zone.center_lat,
      zone.center_lng
    );

    onZonePress(zone);
  };
  const getZoneDisplayColor = (zone: Zone) => {
    if (!user) return COLORS.GRAY;

    if (zone.is_claimed) {
      if (zone.owner?.id === user.id.toString()) {
        return COLORS.SUCCESS; // User's zone
      } else {
        return COLORS.DANGER; // Enemy zone
      }
    } else {
      return COLORS.PRIMARY; // Unclaimed zone
    }
  };

  const getZoneDisplayStatus = (zone: Zone) => {
    if (!user) return 'NEUTRAL';

    if (zone.is_claimed) {
      if (zone.owner?.id === user.id.toString()) {
        return 'OWNED';
      } else {
        return 'ENEMY';
      }
    } else {
      return 'NEUTRAL';
    }
  };

  const getNearbyZonesCount = () => {
    if (!fetchedZones || !userLocation) return 0; return fetchedZones.filter(zone => {
      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        zone.center_lat,
        zone.center_lng
      );
      return distance <= 100; // Within 100 meters
    }).length;
  };
  const getOwnedZonesCount = () => {
    if (!fetchedZones || !user) return 0;

    return fetchedZones.filter(zone => zone.owner?.id === user.id.toString()).length;
  };

  const getClaimableZonesCount = () => {
    if (!fetchedZones || !userLocation) return 0;

    return fetchedZones.filter(zone => {
      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        zone.center_lat,
        zone.center_lng
      );
      return !zone.is_claimed && distance <= GAME_CONFIG.ZONE_CAPTURE_RADIUS_METERS;
    }).length;
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  if (!region) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        <Text style={styles.loadingText}>Getting your location...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={region}
        onMapReady={() => setMapReady(true)}
        showsUserLocation={true}
        showsMyLocationButton={true}
        followsUserLocation={false}
      >
        {/* User Location Marker */}
        {userLocation && (
          <Marker
            coordinate={userLocation}
            title="Your Location"
            description="You are here"
            anchor={{ x: 0.5, y: 0.5 }}
          />
        )}        {/* Zone Tiles */}
        {fetchedZones && fetchedZones.map((zone) => {
          const isNearby = userLocation ? calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            zone.center_lat,
            zone.center_lng
          ) <= GAME_CONFIG.ZONE_INTERACTION_RADIUS : false;

          return (
            <ZoneTile
              key={zone.id}
              zone={zone}
              status={getZoneDisplayStatus(zone) as any}
              color={getZoneDisplayColor(zone)}
              isNearby={isNearby}
              onPress={() => handleZonePress(zone)}
            />
          );
        })}
      </MapView>

      {/* Map Info Overlay */}
      <View style={styles.infoOverlay}>
        <Text style={styles.infoText}>
          🗺️ {fetchedZones?.length || 0} zones loaded
        </Text>
        {userLocation && (
          <Text style={styles.infoText}>
            📍 {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
          </Text>
        )}
      </View>

      {/* Stats Overlay */}
      {showStats && user && (
        <View style={styles.statsOverlay}>
          <TouchableOpacity
            style={styles.statsHeader}
            onPress={() => setShowStats(false)}
          >
            <Text style={styles.statsTitle}>🎮 Game Stats</Text>
            <Text style={styles.closeButton}>✕</Text>
          </TouchableOpacity>

          <View style={styles.statsContent}>
            <Text style={styles.statsText}>
              👤 Level: {getLevelFromXp(user.xp)}
            </Text>
            <Text style={styles.statsText}>
              ⭐ XP: {user.xp.toLocaleString()}
            </Text>
            <Text style={styles.statsText}>
              🏰 Owned: {getOwnedZonesCount()}
            </Text>
            <Text style={styles.statsText}>
              📍 Nearby: {getNearbyZonesCount()}
            </Text>
            <Text style={styles.statsText}>
              🎯 Claimable: {getClaimableZonesCount()}
            </Text>
          </View>
        </View>
      )}

      {/* Stats Toggle Button */}
      {!showStats && (
        <TouchableOpacity
          style={styles.statsButton}
          onPress={() => setShowStats(true)}
        >
          <Text style={styles.statsButtonText}>📊</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.LIGHT_GRAY,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.GRAY,
  },
  infoOverlay: {
    position: 'absolute',
    top: 50,
    left: 16,
    backgroundColor: COLORS.WHITE + 'CC',
    padding: 8,
    borderRadius: 8,
    minWidth: 200,
  },
  infoText: {
    fontSize: 12,
    color: COLORS.DARK,
    marginBottom: 2,
  },
  statsOverlay: {
    position: 'absolute',
    top: 50,
    right: 16,
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: SPACING.MD,
    minWidth: 180,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.SM,
  },
  statsTitle: {
    ...TYPOGRAPHY.CALLOUT,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
  },
  closeButton: {
    fontSize: 16,
    color: COLORS.GRAY,
    padding: 4,
  },
  statsContent: {
    gap: 4,
  },
  statsText: {
    ...TYPOGRAPHY.CAPTION,
    color: COLORS.DARK,
  },
  statsButton: {
    position: 'absolute',
    top: 50,
    right: 16,
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statsButtonText: {
    fontSize: 20,
  },
});
