import { create } from 'zustand';
import { Zone, Attack } from '../types/game';
import { ZONE_STATUS, ZONE_COLORS } from '../utils/constants.enhanced';
import { calculateDistance } from '../utils/gameUtils';

interface GameState {
  zones: Zone[];
  attacks: Attack[];
  userLocation: {
    latitude: number;
    longitude: number;
  } | null;
  selectedZone: any | null;
  isLocationPermissionGranted: boolean;

  // Actions
  setZones: (zones: Zone[]) => void;
  updateZone: (zone: Zone) => void;
  setAttacks: (attacks: Attack[]) => void;
  addAttack: (attack: Attack) => void;
  setUserLocation: (location: { latitude: number; longitude: number }) => void;
  setSelectedZone: (zone: any | null) => void;
  setLocationPermission: (granted: boolean) => void;

  // Computed
  getZoneStatus: (zone: any, currentUserId?: string) => keyof typeof ZONE_STATUS;
  getZoneColor: (zone: any, currentUserId?: string) => string;
  getNearbyZones: (radius?: number) => Zone[];
  isZoneInRange: (zone: any, radius?: number) => boolean;
}

export const useGameStore = create<GameState>((set, get) => ({
  zones: [],
  attacks: [],
  userLocation: null,
  selectedZone: null,
  isLocationPermissionGranted: false,

  setZones: (zones) => set({ zones }),

  updateZone: (updatedZone) =>
    set((state) => ({
      zones: state.zones.map((zone) =>
        zone.id === updatedZone.id ? updatedZone : zone
      ),
    })),

  setAttacks: (attacks) => set({ attacks }),

  addAttack: (attack) =>
    set((state) => ({
      attacks: [attack, ...state.attacks],
    })),

  setUserLocation: (location) => set({ userLocation: location }),

  setSelectedZone: (zone) => set({ selectedZone: zone }),

  setLocationPermission: (granted) => set({ isLocationPermissionGranted: granted }),
  getZoneStatus: (zone, currentUserId) => {
    if (!zone.is_claimed) return ZONE_STATUS.UNCLAIMED;
    if (zone.owner?.id === currentUserId) return ZONE_STATUS.OWNED;
    return ZONE_STATUS.ENEMY;
  },

  getZoneColor: (zone, currentUserId) => {
    const status = get().getZoneStatus(zone, currentUserId);
    return ZONE_COLORS[status.toLowerCase() as keyof typeof ZONE_COLORS];
  },
  getNearbyZones: (radius = 100) => {
    const { zones, userLocation } = get();
    if (!userLocation) return [];

    return zones.filter((zone) => {
      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        zone.center_lat,
        zone.center_lng
      );
      return distance <= radius;
    });
  },

  isZoneInRange: (zone, radius = 20) => {
    const { userLocation } = get();
    if (!userLocation) return false;

    const distance = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      zone.center_lat,
      zone.center_lng
    );
    return distance <= radius;
  },
}));
