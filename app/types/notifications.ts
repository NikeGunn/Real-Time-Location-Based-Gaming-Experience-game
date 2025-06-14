// Notification Types
export interface ZoneAttackNotification {
  type: 'zone_attack';
  title: string;
  body: string;
  data: {
    zone_id: string;
    zone_name: string;
    attacker_id: string;
    attacker_name: string;
    attack_time: string;
  };
}

export interface BattleResultNotification {
  type: 'battle_result';
  title: string;
  body: string;
  data: {
    zone_id: string;
    result: 'victory' | 'defeat';
    xp_gained: number;
    attacker_name: string;
    defender_name: string;
  };
}

export interface ZoneCapturedNotification {
  type: 'zone_captured';
  title: string;
  body: string;
  data: {
    zone_id: string;
    zone_name: string;
    xp_gained: number;
    new_zones_owned: number;
  };
}

export interface LevelUpNotification {
  type: 'level_up';
  title: string;
  body: string;
  data: {
    old_level: number;
    new_level: number;
    new_attack_power: number;
    bonus_xp: number;
  };
}

export type GameNotification =
  | ZoneAttackNotification
  | BattleResultNotification
  | ZoneCapturedNotification
  | LevelUpNotification;

// WebSocket Types
export interface WebSocketEvent {
  type: 'zone_update' | 'attack_event' | 'leaderboard_update';
  data: any;
  timestamp: string;
}

export interface ZoneUpdateEvent {
  type: 'zone_update';
  data: {
    zone_id: string;
    owner_username?: string;
    is_claimed: boolean;
    expires_at?: string;
  };
}

export interface AttackEvent {
  type: 'attack_event';
  data: {
    zone_id: string;
    attacker_username: string;
    defender_username?: string;
    result: 'success' | 'failed';
    timestamp: string;
  };
}

// Enhanced notification interface for UI usage
export interface UINotification {
  id: string;
  type: 'zone_attack' | 'zone_captured' | 'battle_result' | 'level_up' | 'game_update';
  title: string;
  message: string;
  data?: {
    [key: string]: any;
    action?: string;
    zoneId?: string;
    attackId?: string;
  };
  timestamp: string;
  read: boolean;
}
