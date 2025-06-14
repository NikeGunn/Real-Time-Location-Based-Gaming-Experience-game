// Game Types
export interface Zone {
  id: string; // Grid-based ID like "zone_37774_-122419"
  name: string;
  center_lat: number;
  center_lng: number;
  owner?: {
    id: string;
    username: string;
  } | null;
  level: number;
  defense_points: number;
  is_claimed: boolean;
  last_attacked?: string;
  created_at: string;
  xp_value?: number; // Keep for backwards compatibility
}

export interface ZoneListResponse {
  count: number;
  next?: string;
  previous?: string;
  results: Zone[];
}

export interface NearbyZonesRequest {
  latitude: number;
  longitude: number;
  radius?: number;
}

export interface NearbyZonesResponse {
  zones: Zone[];
  count: number;
  user_location: {
    latitude: number;
    longitude: number;
  };
}

export interface ZoneDetailResponse extends Zone {
  checkin_history: ZoneCheckIn[];
  attack_history: Attack[];
}

export interface ClaimZoneRequest {
  latitude: number;
  longitude: number;
}

export interface ClaimZoneResponse {
  message: string;
  zone: Zone;
  xp_gained: number;
}

export interface CheckInRequest {
  latitude: number;
  longitude: number;
}

export interface CheckInResponse {
  checkin: {
    id: number;
    user: string;
    zone: string;
    timestamp: string;
    success: boolean;
  };
  message: string;
}

export interface UserZonesResponse {
  zones: Zone[];
  count: number;
}

export interface CheckInHistoryResponse {
  checkins: ZoneCheckIn[];
  count: number;
}

export interface ZoneCheckIn {
  id: number;
  zone: string;
  timestamp: string;
  success: boolean;
  latitude: number;
  longitude: number;
}

// Attack Types
export interface Attack {
  id: number;
  attacker_username: string;
  defender_username?: string;
  zone_id: string;
  attacker_power: number;
  defender_power: number;
  result: 'success' | 'failed' | 'cooldown' | 'invalid';
  success: boolean;
  xp_gained: number;
  latitude: number;
  longitude: number;
  timestamp: string;
}

export interface AttackZoneRequest {
  zone_id: string;
  latitude: number;
  longitude: number;
}

export interface AttackZoneResponse {
  attack: Attack;
  message: string;
  zone_captured?: boolean;
  zone?: Zone;
}

export interface AttackResponse extends AttackZoneResponse {}

export interface AttackHistory {
  id: number;
  opponent_username: string;
  zone_id: string;
  attacker_power: number;
  defender_power: number;
  result: string;
  success: boolean;
  xp_gained: number;
  timestamp: string;
}

export interface AttackHistoryResponse {
  attacks: AttackHistory[];
  count: number;
}

export interface AttackStats {
  attacks_made: number;
  attacks_won: number;
  attacks_lost: number;
  defenses_successful: number;
  defenses_failed: number;
  attack_success_rate: number;
  defense_success_rate: number;
  total_xp_gained: number;
}

// Leaderboard Types
export interface LeaderboardResponse {
  category: string;
  leaderboard: LeaderboardEntry[];
  count: number;
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  level: number;
  score: number;
  last_updated?: string;
}

export interface UserRankResponse {
  user: string;
  ranks: UserRankCategory[];
}

export interface UserRankCategory {
  category: string;
  rank: number;
  score: number;
  total_users: number;
  percentile: number;
}

export interface LeaderboardStatsResponse {
  total_users: number;
  total_zones: number;
  total_attacks: number;
  most_active_zone: string;
  top_player: string;
}

export interface DetailedUserStatsResponse {
  username: string;
  level: number;
  xp: number;
  zones_owned_count: number;
  attacks_made: number;
  attacks_won: number;
  defenses_made: number;
  defenses_won: number;
  attack_success_rate: number;
  defense_success_rate: number;
}

// Common Types
export interface APIErrorResponse {
  error: string;
  details?: string;
  field_errors?: Record<string, string[]>;
  status_code: number;
}
