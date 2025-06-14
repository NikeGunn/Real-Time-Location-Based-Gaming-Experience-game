import { useQuery } from '@tanstack/react-query';
import { apiClient } from './api';
import {
  LeaderboardResponse,
  UserRankResponse,
  LeaderboardStatsResponse,
  DetailedUserStatsResponse
} from '../types/game';

export const LEADERBOARD_QUERY_KEYS = {
  leaderboard: (category: string) => ['leaderboard', category] as const,
  userRank: ['leaderboard', 'user-rank'] as const,
  stats: ['leaderboard', 'stats'] as const,
  userStats: (username: string) => ['leaderboard', 'user-stats', username] as const,
};

// Get leaderboard
export const useLeaderboard = (category: 'xp' | 'zones' | 'level' | 'attacks' = 'xp') => {
  return useQuery({
    queryKey: LEADERBOARD_QUERY_KEYS.leaderboard(category),
    queryFn: async (): Promise<LeaderboardResponse> => {
      const response = await apiClient.get<LeaderboardResponse>(`/leaderboard/?category=${category}`);
      return response.data;
    },
    refetchInterval: 2 * 60 * 1000, // Refresh every 2 minutes
    staleTime: 60 * 1000, // 1 minute
  });
};

// Get user rankings
export const useUserRank = () => {
  return useQuery({
    queryKey: LEADERBOARD_QUERY_KEYS.userRank,
    queryFn: async (): Promise<UserRankResponse> => {
      const response = await apiClient.get<UserRankResponse>('/leaderboard/my-rank/');
      return response.data;
    },
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });
};

// Get leaderboard statistics
export const useLeaderboardStats = () => {
  return useQuery({
    queryKey: LEADERBOARD_QUERY_KEYS.stats,
    queryFn: async (): Promise<LeaderboardStatsResponse> => {
      const response = await apiClient.get<LeaderboardStatsResponse>('/leaderboard/stats/');
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Get detailed user stats
export const useUserDetailedStats = (username: string) => {
  return useQuery({
    queryKey: LEADERBOARD_QUERY_KEYS.userStats(username),
    queryFn: async (): Promise<DetailedUserStatsResponse> => {
      const response = await apiClient.get<DetailedUserStatsResponse>(`/leaderboard/stats/${username}/`);
      return response.data;
    },
    enabled: !!username,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
