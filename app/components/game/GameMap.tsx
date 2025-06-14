import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator, Text } from 'react-native';
import MapView, { Region, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import { useZones } from '../../services/zoneService';
import { useGameStore } from '../../store/gameStore';
import { useAuthStore } from '../../store/authStore';
import { GAME_CONFIG, COLORS } from '../../utils/constants';
import { calculateDistance } from '../../utils/helpers';
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

  // Fetch zones with React Query
  const { data: fetchedZones, isLoading, error } = useZones();
  useEffect(() => {
    initializeLocation();
    let locationWatcher: Location.LocationSubscription | null = null;

    const startLocationWatcher = async () => {
      locationWatcher = await watchUserLocation();
    };

    startLocationWatcher();

    return () => {
      if (locationWatcher) {
        locationWatcher.remove();
      }
    };
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
      Alert.alert('Error', 'Failed to get your location');
    }
  };

  const watchUserLocation = () => {
    return Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 5000, // Update every 5 seconds
        distanceInterval: 10, // Update if moved 10 meters
      },
      (location) => {
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      }
    );
  };

  const handleZonePress = (zone: Zone) => {
    if (!userLocation) {
      Alert.alert('Error', 'Unable to determine your location');
      return;
    }

    // Check if user is within interaction radius
    const distance = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      zone.center_lat,
      zone.center_lng
    );

    if (distance > GAME_CONFIG.ZONE_INTERACTION_RADIUS) {
      Alert.alert(
        'Too Far Away',
        `You need to be within ${GAME_CONFIG.ZONE_INTERACTION_RADIUS}m of the zone to interact with it.`
      );
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onZonePress(zone);
  };

  const renderZoneTiles = () => {
    if (!zones || !user) return null;

    return zones.map((zone) => {
      const status = getZoneStatus(zone, user.id.toString());
      const color = getZoneColor(zone, user.id.toString());
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
          status={status}
          color={color}
          isNearby={isNearby}
          onPress={() => handleZonePress(zone)}
        />
      );
    });
  };

  if (isLoading || !region) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load zones</Text>
        <Text style={styles.errorSubtext}>Please check your connection and try again</Text>
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
        showsUserLocation={true}
        showsMyLocationButton={true}
        mapType="standard"
        onMapReady={() => setMapReady(true)}
        maxZoomLevel={18}
        minZoomLevel={10}
        followsUserLocation={false}
        showsCompass={true}
        showsScale={true}
      >
        {mapReady && renderZoneTiles()}
      </MapView>
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
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.GRAY,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.LIGHT_GRAY,
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.DARK,
    textAlign: 'center',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: COLORS.GRAY,
    textAlign: 'center',
  },
});
