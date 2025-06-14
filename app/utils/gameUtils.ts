import { Zone } from '../types/game';

// Game constants
export const ZONE_SIZE = 100; // meters
export const CAPTURE_RADIUS = 50; // meters
export const ATTACK_COOLDOWN = 300000; // 5 minutes in milliseconds

// Calculate distance between two coordinates using Haversine formula
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Check if user is within zone bounds
export function isUserInZone(
  userLocation: { latitude: number; longitude: number },
  zone: { center_lat: number; center_lng: number }
): boolean {
  const distance = calculateDistance(
    userLocation.latitude,
    userLocation.longitude,
    zone.center_lat,
    zone.center_lng
  );
  return distance <= CAPTURE_RADIUS;
}

// Generate zone polygon coordinates for map display
export function generateZoneCoordinates(
  centerLat: number,
  centerLng: number,
  size: number = ZONE_SIZE
): Array<{ latitude: number; longitude: number }> {
  // Convert size from meters to degrees (approximate)
  const latOffset = size / 111000; // 1 degree latitude ≈ 111km
  const lngOffset = size / (111000 * Math.cos(centerLat * Math.PI / 180));

  return [
    { latitude: centerLat + latOffset/2, longitude: centerLng - lngOffset/2 },
    { latitude: centerLat + latOffset/2, longitude: centerLng + lngOffset/2 },
    { latitude: centerLat - latOffset/2, longitude: centerLng + lngOffset/2 },
    { latitude: centerLat - latOffset/2, longitude: centerLng - lngOffset/2 },
  ];
}

// Generate zone ID from coordinates (grid-based)
export function generateZoneId(lat: number, lng: number, gridSize: number = 0.001): string {
  const gridLat = Math.floor(lat / gridSize) * gridSize;
  const gridLng = Math.floor(lng / gridSize) * gridSize;
  return `zone_${gridLat.toFixed(6)}_${gridLng.toFixed(6)}`;
}


// Calculate zone level based on defense points
export function calculateZoneLevel(defensePoints: number): number {
  return Math.floor(defensePoints / 100) + 1;
}


// Calculate attack success probability
export function calculateAttackSuccessRate(
  attackerLevel: number,
  defenderLevel: number,
  zoneLevel: number
): number {
  const baseProbability = 0.5;
  const levelDifference = attackerLevel - defenderLevel;
  const zonePenalty = zoneLevel * 0.05;

  return Math.max(0.1, Math.min(0.9, baseProbability + (levelDifference * 0.1) - zonePenalty));
}

// Get zone color based on ownership
export function getZoneColor(zone: any, userId?: string): string {
  if (!zone.is_claimed) return '#9CA3AF'; // Gray for unclaimed
  if (zone.owner?.id === userId) return '#10B981'; // Green for owned
  return '#EF4444'; // Red for enemy
}

// Format zone name
export function formatZoneName(zone: any): string {
  if (zone.name) return zone.name;
  return `Zone ${zone.id.slice(-6)}`;
}

// Check if zone can be attacked
export function canAttackZone(zone: any, userId?: string): boolean {
  return zone.is_claimed && zone.owner?.id !== userId;
}

// Check if zone can be claimed
export function canClaimZone(zone: any, userId?: string): boolean {
  return !zone.is_claimed;
}

// Check if user can check into zone
export function canCheckIntoZone(zone: any, userId?: string): boolean {
  return zone.is_claimed && zone.owner?.id === userId;
}

// Format distance for display
export function formatDistance(distance: number): string {
  if (distance < 1000) {
    return `${Math.round(distance)}m`;
  } else {
    return `${(distance / 1000).toFixed(1)}km`;
  }
}

// Format time ago for display
export function formatTimeAgo(timestamp: string): string {
  const now = new Date();
  const past = new Date(timestamp);
  const diffMs = now.getTime() - past.getTime();

  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

// Calculate XP for check-in based on zone level
export function calculateCheckInXP(zoneLevel: number): number {
  return zoneLevel * 10;
}
