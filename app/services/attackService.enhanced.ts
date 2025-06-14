import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './api';
import {
  Attack,
  AttackRequest,
  AttackResponse,
  AttackHistoryResponse,
  AttackStatsResponse,
  Zone
} from '../types/game';
import { useGameStore } from '../store/gameStore';
import { FirebaseService } from './firebase';

// Attack query keys
export const ATTACK_QUERY_KEYS = {
  attacks: ['attacks'] as const,
  userAttacks: ['attacks', 'user'] as const,
  attackHistory: ['attacks', 'history'] as const,
  attackStats: ['attacks', 'stats'] as const,
  cooldowns: ['attacks', 'cooldowns'] as const,
};

// Demo attack data
const DEMO_ATTACKS: Attack[] = [
  {
    id: '1',
    attacker: 1,
    attacker_username: 'testuser',
    defender: 2,
    defender_username: 'enemy1',
    zone: 'zone_40783_-73965',
    attack_time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    result: 'success',
    xp_gained: 25,
    attack_power_used: 15,
  },
  {
    id: '2',
    attacker: 2,
    attacker_username: 'enemy2',
    defender: 1,
    defender_username: 'testuser',
    zone: 'zone_40784_-73966',
    attack_time: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    result: 'failed',
    xp_gained: 5,
    attack_power_used: 12,
  },
];

// Get all attacks
export const useAttacks = () => {
  return useQuery({
    queryKey: ATTACK_QUERY_KEYS.attacks,
    queryFn: async (): Promise<Attack[]> => {
      // TODO: Replace with actual API call when backend is ready
      // const response = await apiClient.get<AttackHistoryResponse>('/attacks/');
      // return response.data.results;

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return DEMO_ATTACKS;
    },
    refetchInterval: 60000, // Refresh every minute
    staleTime: 30000, // Consider data fresh for 30 seconds
  });
};

// Get user's attack history
export const useUserAttackHistory = () => {
  return useQuery({
    queryKey: ATTACK_QUERY_KEYS.userAttacks,
    queryFn: async (): Promise<AttackHistoryResponse> => {
      // TODO: Replace with actual API call when backend is ready
      // const response = await apiClient.get<AttackHistoryResponse>('/attacks/history/');
      // return response.data;

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      const userAttacks = DEMO_ATTACKS.filter(attack =>
        attack.attacker_username === 'testuser' || attack.defender_username === 'testuser'
      );

      return {
        count: userAttacks.length,
        results: userAttacks,
        next: null,
        previous: null,
      };
    },
    refetchInterval: 2 * 60 * 1000, // Refresh every 2 minutes
  });
};

// Attack zone mutation
export const useAttackZone = () => {
  const queryClient = useQueryClient();
  const updateZone = useGameStore((state) => state.updateZone);
  const addAttack = useGameStore((state) => state.addAttack);

  return useMutation({
    mutationFn: async ({
      zoneId,
      latitude,
      longitude
    }: {
      zoneId: string;
      latitude: number;
      longitude: number;
    }): Promise<AttackResponse> => {
      // TODO: Replace with actual API call when backend is ready
      // const response = await apiClient.post<AttackResponse>('/attacks/', {
      //   zone_id: zoneId,
      //   latitude,
      //   longitude,
      // });
      // return response.data;

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Simulate attack calculation
      const attackPower = Math.floor(Math.random() * 20) + 10; // 10-29
      const defensePower = Math.floor(Math.random() * 15) + 8; // 8-22
      const success = attackPower > defensePower;
      const xpGained = success ? Math.floor(Math.random() * 30) + 20 : Math.floor(Math.random() * 10) + 5;

      // Create attack record
      const newAttack: Attack = {
        id: `attack_${Date.now()}`,
        attacker: 1, // Current user ID (demo)
        attacker_username: 'testuser',
        defender: 2, // Zone owner ID (demo)
        defender_username: 'enemy1',
        zone: zoneId,
        attack_time: new Date().toISOString(),
        result: success ? 'success' : 'failed',
        xp_gained: xpGained,
        attack_power_used: attackPower,
      };

      // Add to demo data
      DEMO_ATTACKS.unshift(newAttack);

      let capturedZone: Zone | undefined;
      if (success) {
        // Simulate zone capture
        capturedZone = {
          id: zoneId,
          latitude,
          longitude,
          owner: 1,
          owner_username: 'testuser',
          is_claimed: true,
          claimed_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          xp_value: 15,
          defense_power: 10,
        };
      }

      return {
        attack: newAttack,
        success,
        xp_gained: xpGained,
        zone_captured: success,
        zone: capturedZone,
        message: success
          ? `Attack successful! You gained ${xpGained} XP and captured the zone!`
          : `Attack failed. You gained ${xpGained} XP for trying.`,
      };
    },
    onSuccess: (data) => {
      // Add attack to local state
      addAttack(data.attack);

      // Show notification for battle result
      FirebaseService.showBattleResultNotification(
        data.success ? 'victory' : 'defeat',
        `Zone ${data.attack.zone}`,
        data.xp_gained,
        data.attack.defender_username || 'Unknown'
      );

      // Update zone if captured
      if (data.zone_captured && data.zone) {
        updateZone(data.zone);

        // Show zone captured notification
        FirebaseService.showZoneCapturedNotification(
          `Zone ${data.zone.id}`,
          data.xp_gained,
          1 // This would come from user stats in a real app
        );
      }

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ATTACK_QUERY_KEYS.attacks });
      queryClient.invalidateQueries({ queryKey: ATTACK_QUERY_KEYS.userAttacks });
      queryClient.invalidateQueries({ queryKey: ['zones'] }); // Invalidate zones to show updated ownership
    },
    onError: (error) => {
      console.error('Attack failed:', error);
    },
  });
};

// Get attack statistics
export const useAttackStats = () => {
  return useQuery({
    queryKey: ATTACK_QUERY_KEYS.attackStats,
    queryFn: async (): Promise<AttackStatsResponse> => {
      // TODO: Replace with actual API call when backend is ready
      // const response = await apiClient.get<AttackStatsResponse>('/attacks/stats/');
      // return response.data;

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      const userAttacks = DEMO_ATTACKS.filter(attack => attack.attacker_username === 'testuser');
      const successfulAttacks = userAttacks.filter(attack => attack.result === 'success');
      const failedAttacks = userAttacks.filter(attack => attack.result === 'failed');

      return {
        total_attacks: userAttacks.length,
        successful_attacks: successfulAttacks.length,
        failed_attacks: failedAttacks.length,
        success_rate: userAttacks.length > 0 ? (successfulAttacks.length / userAttacks.length) * 100 : 0,
        total_xp_from_attacks: userAttacks.reduce((sum, attack) => sum + attack.xp_gained, 0),
        zones_captured: successfulAttacks.length,
        last_attack_time: userAttacks.length > 0 ? userAttacks[0].attack_time : null,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Check attack cooldowns
export const useAttackCooldowns = () => {
  return useQuery({
    queryKey: ATTACK_QUERY_KEYS.cooldowns,
    queryFn: async () => {
      // TODO: Replace with actual API call when backend is ready
      // const response = await apiClient.get('/attacks/cooldowns/');
      // return response.data;

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));

      // Simple cooldown simulation: 30 minutes from last attack
      const lastAttack = DEMO_ATTACKS.find(attack => attack.attacker_username === 'testuser');
      if (!lastAttack) {
        return { can_attack: true, cooldown_remaining: 0 };
      }

      const lastAttackTime = new Date(lastAttack.attack_time).getTime();
      const now = Date.now();
      const cooldownDuration = 30 * 60 * 1000; // 30 minutes
      const cooldownRemaining = Math.max(0, cooldownDuration - (now - lastAttackTime));

      return {
        can_attack: cooldownRemaining === 0,
        cooldown_remaining: cooldownRemaining,
        cooldown_end_time: cooldownRemaining > 0 ? new Date(now + cooldownRemaining).toISOString() : null,
      };
    },
    refetchInterval: 60000, // Check every minute
    staleTime: 30000, // 30 seconds
  });
};

// Simulate incoming attack (for testing notifications)
export const simulateIncomingAttack = async (zoneName: string, attackerName: string, zoneId: string) => {
  // Show attack notification
  await FirebaseService.showZoneAttackNotification(zoneName, attackerName, zoneId);

  // Simulate battle result after delay
  setTimeout(async () => {
    const success = Math.random() > 0.5;
    await FirebaseService.showBattleResultNotification(
      success ? 'victory' : 'defeat',
      zoneName,
      success ? 25 : 5,
      attackerName
    );
  }, 5000); // 5 second delay for battle resolution
};
