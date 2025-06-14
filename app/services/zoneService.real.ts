import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, handleAPIError } from './api.real';
import {
  Zone,
  ZoneListResponse,
  NearbyZonesRequest,
  NearbyZonesResponse,
  ClaimZoneRequest,
  ClaimZoneResponse,
  CheckInRequest,
  CheckInResponse,
  UserZonesResponse,
  CheckInHistoryResponse,
  ZoneCheckIn
} from '../types/game';
import { useGameStore } from '../store/gameStore';
import { FirebaseService } from './firebase';

// Query keys
export const ZONE_QUERY_KEYS = {
  zones: ['zones'] as const,
  zone: (id: string) => ['zones', id] as const,
  nearbyZones: (lat: number, lng: number, radius?: number) => ['zones', 'nearby', lat, lng, radius] as const,
  userZones: ['zones', 'user'] as const,
  checkinHistory: ['zones', 'checkin-history'] as const,
};

// Get all zones
export const useZones = () => {
  const setZones = useGameStore((state) => state.setZones);

  return useQuery({
    queryKey: ZONE_QUERY_KEYS.zones,
    queryFn: async (): Promise<Zone[]> => {
      const response = await apiClient.get<ZoneListResponse>('/zones/');
      const zones = response.data.results;
      setZones(zones);
      return zones;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 20000, // Consider data fresh for 20 seconds
    retry: 3,
  });
};

// Get nearby zones based on user location
export const useNearbyZones = (latitude?: number, longitude?: number, radius: number = 1000) => {
  const setZones = useGameStore((state) => state.setZones);

  return useQuery({
    queryKey: ZONE_QUERY_KEYS.nearbyZones(latitude || 0, longitude || 0, radius),
    queryFn: async (): Promise<NearbyZonesResponse> => {
      if (!latitude || !longitude) {
        throw new Error('Location required');
      }

      const response = await apiClient.get<NearbyZonesResponse>('/zones/nearby/', {
        params: { latitude, longitude, radius }
      });

      setZones(response.data.zones);
      return response.data;
    },
    enabled: !!(latitude && longitude),
    refetchInterval: 30000,
    staleTime: 20000,
  });
};

// Get single zone details
export const useZone = (zoneId: string) => {
  return useQuery({
    queryKey: ZONE_QUERY_KEYS.zone(zoneId),
    queryFn: async (): Promise<Zone> => {
      const response = await apiClient.get(`/zones/${zoneId}/`);
      return response.data;
    },
    enabled: !!zoneId,
    staleTime: 10000,
  });
};

// Claim zone mutation
export const useClaimZone = () => {
  const queryClient = useQueryClient();
  const updateZone = useGameStore((state) => state.updateZone);

  return useMutation({
    mutationFn: async ({
      zoneId,
      latitude,
      longitude
    }: {
      zoneId: string;
      latitude: number;
      longitude: number;
    }): Promise<ClaimZoneResponse> => {
      const response = await apiClient.post<ClaimZoneResponse>(`/zones/${zoneId}/claim/`, {
        latitude,
        longitude,
      });
      return response.data;
    },
    onSuccess: (data) => {
      // Update local state
      updateZone(data.zone);

      // Show success notification
      FirebaseService.showZoneCapturedNotification(
        `Zone ${data.zone.id}`,
        data.xp_gained,
        1 // This would come from user stats in a real app
      );

      // Invalidate and refetch zones
      queryClient.invalidateQueries({ queryKey: ZONE_QUERY_KEYS.zones });
      queryClient.invalidateQueries({ queryKey: ZONE_QUERY_KEYS.userZones });
    },
  });
};

// Check-in to zone mutation
export const useCheckInZone = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      zoneId,
      latitude,
      longitude
    }: {
      zoneId: string;
      latitude: number;
      longitude: number;
    }): Promise<CheckInResponse> => {
      const response = await apiClient.post<CheckInResponse>(`/zones/${zoneId}/checkin/`, {
        latitude,
        longitude,
      });
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ZONE_QUERY_KEYS.zones });
      queryClient.invalidateQueries({ queryKey: ZONE_QUERY_KEYS.checkinHistory });
    },
  });
};

// Attack zone mutation
export const useAttackZone = () => {
  const queryClient = useQueryClient();
  const updateZone = useGameStore((state) => state.updateZone);

  return useMutation({
    mutationFn: async ({
      zoneId,
      latitude,
      longitude
    }: {
      zoneId: string;
      latitude: number;
      longitude: number;
    }): Promise<any> => {
      const response = await apiClient.post('/attacks/', {
        zone_id: zoneId,
        latitude,
        longitude,
      });
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['zones'] });
      queryClient.invalidateQueries({ queryKey: ['attacks'] });      // Show success notification
      FirebaseService.scheduleLocalNotification(
        'Attack Complete!',
        data.success ? 'Victory! You captured the zone!' : 'Attack failed. Try again!',
        { type: 'battle_result', zoneId: variables.zoneId }
      );
    },
    onError: (error) => {
      console.error('❌ Attack error:', error);
      FirebaseService.scheduleLocalNotification(
        'Attack Failed',
        'Unable to attack zone. Please try again.',
        { type: 'error' }
      );
    },
  });
};

// Get user's owned zones
export const useUserZones = () => {
  return useQuery({
    queryKey: ZONE_QUERY_KEYS.userZones,
    queryFn: async (): Promise<Zone[]> => {
      const response = await apiClient.get<UserZonesResponse>('/zones/my-zones/');
      return response.data.zones;
    },
    staleTime: 30000,
  });
};

// Get check-in history
export const useCheckInHistory = () => {
  return useQuery({
    queryKey: ZONE_QUERY_KEYS.checkinHistory,
    queryFn: async (): Promise<ZoneCheckIn[]> => {
      const response = await apiClient.get<CheckInHistoryResponse>('/zones/checkin-history/');
      return response.data.checkins;
    },
    staleTime: 60000, // 1 minute
  });
};

// Helper function to calculate distance between two points
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

// Check if user is within zone interaction radius
export const isWithinZoneRadius = (
  userLat: number,
  userLon: number,
  zoneLat: number,
  zoneLon: number,
  radius: number = 20
): boolean => {
  const distance = calculateDistance(userLat, userLon, zoneLat, zoneLon);
  return distance <= radius;
};

// Generate grid-based zone ID from coordinates
export const generateZoneId = (latitude: number, longitude: number): string => {
  const gridSize = 0.001; // Grid size in degrees
  const gridLat = Math.floor(latitude / gridSize) * gridSize;
  const gridLon = Math.floor(longitude / gridSize) * gridSize;

  // Format coordinates to avoid floating point precision issues
  const latStr = (gridLat * 100000).toFixed(0);
  const lonStr = (gridLon * 100000).toFixed(0);

  return `zone_${latStr}_${lonStr}`;
};

// Get zone coordinates from grid-based ID
export const parseZoneId = (zoneId: string): { latitude: number; longitude: number } | null => {
  const match = zoneId.match(/^zone_(-?\d+)_(-?\d+)$/);
  if (!match) return null;

  const latitude = parseInt(match[1]) / 100000;
  const longitude = parseInt(match[2]) / 100000;

  return { latitude, longitude };
};
