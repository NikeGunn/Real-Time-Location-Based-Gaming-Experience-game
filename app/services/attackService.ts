import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './api.real';

// Types based on your backend API
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

// Query keys
export const ATTACK_QUERY_KEYS = {
  attacks: ['attacks'] as const,
  attacksMade: ['attacks', 'made'] as const,
  attacksReceived: ['attacks', 'received'] as const,
  attackStats: ['attacks', 'stats'] as const,
};

// Get attack history (made attacks)
export const useAttackHistory = (type: 'made' | 'received' = 'made') => {
  return useQuery({
    queryKey: type === 'made' ? ATTACK_QUERY_KEYS.attacksMade : ATTACK_QUERY_KEYS.attacksReceived,
    queryFn: async (): Promise<AttackHistoryResponse> => {
      const response = await apiClient.get(`/attacks/?type=${type}`);
      return response.data;
    },
    staleTime: 30000, // Consider data fresh for 30 seconds
  });
};

// Get attack statistics
export const useAttackStats = () => {
  return useQuery({
    queryKey: ATTACK_QUERY_KEYS.attackStats,
    queryFn: async (): Promise<AttackStats> => {
      const response = await apiClient.get('/attacks/stats/');
      return response.data;
    },
    staleTime: 60000, // Consider data fresh for 1 minute
  });
};

// Attack zone mutation
export const useAttackZone = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      zone_id,
      latitude,
      longitude
    }: {
      zone_id: string;
      latitude: number;
      longitude: number;
    }) => {
      const response = await apiClient.post('/attacks/', {
        zone_id,
        latitude,
        longitude,
      });
      return response.data;
    },
    onSuccess: () => {
      // Invalidate attack-related queries
      queryClient.invalidateQueries({ queryKey: ATTACK_QUERY_KEYS.attacks });
      queryClient.invalidateQueries({ queryKey: ATTACK_QUERY_KEYS.attackStats });
    },
  });
};
