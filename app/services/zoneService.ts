import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './api';
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
  CheckInHistoryResponse
} from '../types/game';
import { useGameStore } from '../store/gameStore';
import { FirebaseService } from './firebase';

// Demo zones for testing
const DEMO_ZONES: Zone[] = [
  {
    id: 'zone_40783_-73965',
    latitude: 40.7829,
    longitude: -73.9654,
    owner: undefined,
    owner_username: undefined,
    is_claimed: false,
    xp_value: 50,
    defense_power: 30,
  },
  {
    id: 'zone_40758_-73986',
    latitude: 40.7580,
    longitude: -73.9855,
    owner: 2,
    owner_username: 'player2',
    is_claimed: true,
    claimed_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    xp_value: 75,
    defense_power: 45,
  },
  {
    id: 'zone_40706_-73997',
    latitude: 40.7061,
    longitude: -73.9969,
    owner: undefined,
    owner_username: undefined,
    is_claimed: false,
    xp_value: 60,
    defense_power: 35,
  },
  {
    id: 'zone_40689_-74045',
    latitude: 40.6892,
    longitude: -74.0445,
    owner: 3,
    owner_username: 'player3',
    is_claimed: true,
    claimed_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
    xp_value: 100,
    defense_power: 60,
  },
];

// Query keys
export const ZONE_QUERY_KEYS = {
  zones: ['zones'] as const,
  zone: (id: string) => ['zones', id] as const,
  nearbyZones: (lat: number, lng: number) => ['zones', 'nearby', lat, lng] as const,
  userZones: ['zones', 'user'] as const,
  checkinHistory: ['zones', 'checkin-history'] as const,
};

// Fetch all zones
export const useZones = () => {
  const setZones = useGameStore((state: any) => state.setZones);

  return useQuery({
    queryKey: ZONE_QUERY_KEYS.zones,
    queryFn: async (): Promise<Zone[]> => {
      // For demo purposes, return mock data
      // TODO: Replace with actual API call when backend is ready
      // const response = await apiClient.get<ZoneListResponse>('/zones/');
      // const zones = response.data.results;

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      const zones = DEMO_ZONES;
      setZones(zones);
      return zones;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 20000, // Consider data fresh for 20 seconds
  });
};

// Fetch nearby zones
export const useNearbyZones = (latitude?: number, longitude?: number, radius?: number) => {
  return useQuery({
    queryKey: ZONE_QUERY_KEYS.nearbyZones(latitude || 0, longitude || 0),
    queryFn: async (): Promise<NearbyZonesResponse> => {
      const params: NearbyZonesRequest = {
        latitude: latitude!,
        longitude: longitude!,
        radius,
      };

      const response = await apiClient.get<NearbyZonesResponse>('/zones/nearby/', { params });
      return response.data;
    },
    enabled: !!(latitude && longitude),
    refetchInterval: 15000, // Refresh every 15 seconds for nearby zones
  });
};

// Fetch single zone
export const useZone = (id: string) => {
  return useQuery({
    queryKey: ZONE_QUERY_KEYS.zone(id),
    queryFn: async (): Promise<Zone> => {
      const response = await apiClient.get(`/zones/${id}/`);
      return response.data;
    },
    enabled: !!id,
  });
};

// Claim zone mutation
export const useClaimZone = () => {
  const queryClient = useQueryClient();
  const updateZone = useGameStore((state: any) => state.updateZone);

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
      // For demo purposes, simulate zone claiming
      // TODO: Replace with actual API call when backend is ready

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Find the zone to claim
      const zoneToClaimIndex = DEMO_ZONES.findIndex(zone => zone.id === zoneId);
      if (zoneToClaimIndex === -1) {
        throw new Error('Zone not found');
      }

      const zoneToClaimOriginal = DEMO_ZONES[zoneToClaimIndex];
      if (zoneToClaimOriginal.is_claimed) {
        throw new Error('Zone is already claimed');
      }

      // Create claimed zone
      const claimedZone: Zone = {
        ...zoneToClaimOriginal,
        is_claimed: true,
        owner: 1, // Current user ID (demo)
        owner_username: 'testuser',
        claimed_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };

      // Update demo data
      DEMO_ZONES[zoneToClaimIndex] = claimedZone;

      return {
        message: 'Zone claimed successfully!',
        zone: claimedZone,
        xp_gained: claimedZone.xp_value,
      };
    },    onSuccess: (data) => {
      // Update local state
      updateZone(data.zone);

      // Show notification for successful zone claim
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
      const requestData: CheckInRequest = { latitude, longitude };
      const response = await apiClient.post(`/zones/${zoneId}/checkin/`, requestData);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate check-in history
      queryClient.invalidateQueries({ queryKey: ZONE_QUERY_KEYS.checkinHistory });
    },
  });
};

// Get user's zones
export const useUserZones = () => {
  return useQuery({
    queryKey: ZONE_QUERY_KEYS.userZones,
    queryFn: async (): Promise<UserZonesResponse> => {
      const response = await apiClient.get<UserZonesResponse>('/zones/my-zones/');
      return response.data;
    },
    refetchInterval: 60000, // Refresh every minute
  });
};

// Get check-in history
export const useCheckInHistory = () => {
  return useQuery({
    queryKey: ZONE_QUERY_KEYS.checkinHistory,
    queryFn: async (): Promise<CheckInHistoryResponse> => {
      const response = await apiClient.get<CheckInHistoryResponse>('/zones/checkin-history/');
      return response.data;
    },
  });
};
