import { useQuery } from '@tanstack/react-query';
import { apiClient } from './api.real';

// Types
export interface LeaderboardEntry {
  rank: number;
  username: string;
  level: number;
  score: number;
  user_id: string;
}

export interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[];
  total_users: number;
  current_page: number;
  total_pages: number;
}

export interface UserRankData {
  ranks: Array<{
    category: string;
    rank: number;
    score: number;
    percentile: number;
  }>;
}

export interface LeaderboardStatsData {
  total_users: number;
  total_zones: number;
  total_attacks: number;
  top_player: string;
}

// Query keys
export const LEADERBOARD_QUERY_KEYS = {
  leaderboard: (category: string) => ['leaderboard', category] as const,
  userRank: ['leaderboard', 'user-rank'] as const,
  stats: ['leaderboard', 'stats'] as const,
};

// Get leaderboard by category
export const useLeaderboard = (category: 'xp' | 'zones' | 'level' | 'attacks' = 'xp') => {
  return useQuery({
    queryKey: LEADERBOARD_QUERY_KEYS.leaderboard(category),
    queryFn: async (): Promise<LeaderboardResponse> => {
      const response = await apiClient.get<LeaderboardResponse>(`/leaderboard/${category}/`);
      return response.data;
    },
    staleTime: 30000, // Data is fresh for 30 seconds
    refetchInterval: 60000, // Refetch every minute
  });
};

// Get user's rank across all categories
export const useUserRank = () => {
  return useQuery({
    queryKey: LEADERBOARD_QUERY_KEYS.userRank,
    queryFn: async (): Promise<UserRankData> => {
      // Since the API doesn't have a specific user rank endpoint,
      // we'll fetch all leaderboards and find user's position
      const [xpResponse, zonesResponse, levelResponse, attacksResponse] = await Promise.all([
        apiClient.get<LeaderboardResponse>('/leaderboard/xp/'),
        apiClient.get<LeaderboardResponse>('/leaderboard/zones/'),
        apiClient.get<LeaderboardResponse>('/leaderboard/level/'),
        apiClient.get<LeaderboardResponse>('/leaderboard/attacks/'),
      ]);

      // Extract user ranks from each leaderboard
      const ranks = [
        {
          category: 'xp',
          rank: xpResponse.data.leaderboard.find(entry => entry.user_id)?.rank || 0,
          score: xpResponse.data.leaderboard.find(entry => entry.user_id)?.score || 0,
          percentile: 0, // Calculate based on total users
        },
        {
          category: 'zones',
          rank: zonesResponse.data.leaderboard.find(entry => entry.user_id)?.rank || 0,
          score: zonesResponse.data.leaderboard.find(entry => entry.user_id)?.score || 0,
          percentile: 0,
        },
        {
          category: 'level',
          rank: levelResponse.data.leaderboard.find(entry => entry.user_id)?.rank || 0,
          score: levelResponse.data.leaderboard.find(entry => entry.user_id)?.score || 0,
          percentile: 0,
        },
        {
          category: 'attacks',
          rank: attacksResponse.data.leaderboard.find(entry => entry.user_id)?.rank || 0,
          score: attacksResponse.data.leaderboard.find(entry => entry.user_id)?.score || 0,
          percentile: 0,
        },
      ];

      // Calculate percentiles
      ranks.forEach(rank => {
        if (rank.rank > 0) {
          rank.percentile = (rank.rank / xpResponse.data.total_users) * 100;
        }
      });

      return { ranks };
    },
    staleTime: 60000, // Data is fresh for 1 minute
  });
};

// Get leaderboard statistics
export const useLeaderboardStats = () => {
  return useQuery({
    queryKey: LEADERBOARD_QUERY_KEYS.stats,
    queryFn: async (): Promise<LeaderboardStatsData> => {
      // Get general stats from the main leaderboard endpoint
      const response = await apiClient.get<LeaderboardResponse>('/leaderboard/');

      // Mock additional stats since they're not in the API
      return {
        total_users: response.data.total_users || 0,
        total_zones: 1000, // Mock data
        total_attacks: 5000, // Mock data
        top_player: response.data.leaderboard[0]?.username || 'Unknown',
      };
    },
    staleTime: 300000, // Data is fresh for 5 minutes
  });
};
