/**
 * Calculate distance between two coordinates using Haversine formula
 * @param lat1 Latitude of first point
 * @param lon1 Longitude of first point
 * @param lat2 Latitude of second point
 * @param lon2 Longitude of second point
 * @returns Distance in meters
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
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
}

/**
 * Format distance for display
 * @param meters Distance in meters
 * @returns Formatted distance string
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  } else {
    return `${(meters / 1000).toFixed(1)}km`;
  }
}

/**
 * Generate grid-based zone ID from coordinates
 * @param latitude Latitude coordinate
 * @param longitude Longitude coordinate
 * @returns Grid-based zone ID
 */
export function generateZoneId(latitude: number, longitude: number): string {
  const gridLat = Math.floor(latitude / 0.001) * 0.001;
  const gridLng = Math.floor(longitude / 0.001) * 0.001;
  return `zone_${Math.round(gridLat * 100000)}_${Math.round(gridLng * 100000)}`;
}

/**
 * Check if user is within zone interaction radius
 * @param userLat User's latitude
 * @param userLng User's longitude
 * @param zoneLat Zone's latitude
 * @param zoneLng Zone's longitude
 * @param radius Interaction radius in meters (default: 20)
 * @returns True if user is within radius
 */
export function isWithinZone(
  userLat: number,
  userLng: number,
  zoneLat: number,
  zoneLng: number,
  radius: number = 20
): boolean {
  const distance = calculateDistance(userLat, userLng, zoneLat, zoneLng);
  return distance <= radius;
}

/**
 * Format time duration
 * @param seconds Duration in seconds
 * @returns Formatted duration string
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}

/**
 * Format timestamp for display
 * @param timestamp ISO timestamp string
 * @returns Formatted time string
 */
export function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours < 1) {
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    return `${diffMinutes}m ago`;
  } else if (diffHours < 24) {
    return `${Math.floor(diffHours)}h ago`;
  } else {
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  }
}

/**
 * Calculate XP required for next level
 * @param currentLevel Current user level
 * @returns XP required for next level
 */
export function getXpForNextLevel(currentLevel: number): number {
  return currentLevel * 1000;
}

/**
 * Calculate level from total XP
 * @param totalXp Total XP amount
 * @returns User level
 */
export function getLevelFromXp(totalXp: number): number {
  return Math.floor(totalXp / 1000) + 1;
}

/**
 * Calculate XP progress within current level
 * @param totalXp Total XP amount
 * @returns Progress percentage (0-1)
 */
export function getXpProgress(totalXp: number): number {
  const currentLevelXp = totalXp % 1000;
  return currentLevelXp / 1000;
}

/**
 * Validate coordinates
 * @param latitude Latitude to validate
 * @param longitude Longitude to validate
 * @returns True if coordinates are valid
 */
export function isValidCoordinate(latitude: number, longitude: number): boolean {
  return (
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

/**
 * Debounce function to limit API calls
 * @param func Function to debounce
 * @param wait Wait time in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
