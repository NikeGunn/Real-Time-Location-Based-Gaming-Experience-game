import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLeaderboard, useUserRank, useLeaderboardStats } from '../services/leaderboardService.real';
import { Card } from '../components/ui/Card';
import { LoadingScreen } from '../components/ui/LoadingScreen';
import { COLORS, TYPOGRAPHY, SPACING } from '../utils/constants';
import { LeaderboardEntry } from '../types/game';

interface LeaderboardScreenProps {
  navigation: any;
}

const CATEGORIES = [
  { key: 'xp', label: 'XP' },
  { key: 'zones', label: 'Zones' },
  { key: 'level', label: 'Level' },
  { key: 'attacks', label: 'Attacks' },
] as const;

export default function LeaderboardScreen({ navigation }: LeaderboardScreenProps) {
  const [selectedCategory, setSelectedCategory] = useState<'xp' | 'zones' | 'level' | 'attacks'>('xp');
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: leaderboard,
    isLoading: leaderboardLoading,
    refetch: refetchLeaderboard
  } = useLeaderboard(selectedCategory);

  const {
    data: userRank,
    isLoading: rankLoading
  } = useUserRank();

  const {
    data: stats,
    isLoading: statsLoading
  } = useLeaderboardStats();

  const onRefresh = async () => {
    setRefreshing(true);
    await refetchLeaderboard();
    setRefreshing(false);
  };

  const renderLeaderboardItem = ({ item, index }: { item: LeaderboardEntry; index: number }) => (
    <View style={styles.leaderboardItem}>
      <View style={styles.rankContainer}>
        <View style={[
          styles.rankBadge,
          index < 3 && styles[`rank${index + 1}` as keyof typeof styles]
        ]}>
          <Text style={[
            styles.rankText,
            index < 3 && styles.topRankText
          ]}>
            {item.rank}
          </Text>
        </View>
      </View>

      <View style={styles.playerInfo}>
        <Text style={styles.playerName}>{item.username}</Text>
        <Text style={styles.playerLevel}>Level {item.level}</Text>
      </View>

      <View style={styles.scoreContainer}>
        <Text style={styles.scoreValue}>{item.score.toLocaleString()}</Text>
        <Text style={styles.scoreLabel}>
          {selectedCategory === 'xp' ? 'XP' :
            selectedCategory === 'zones' ? 'Zones' :
              selectedCategory === 'level' ? 'Level' : 'Attacks'}
        </Text>
      </View>
    </View>
  );

  if (leaderboardLoading || rankLoading || statsLoading) {
    return <LoadingScreen message="Loading leaderboard..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Leaderboard</Text>
          {stats && (
            <Text style={styles.subtitle}>
              {stats.total_users.toLocaleString()} players competing
            </Text>
          )}
        </View>

        {/* Category Tabs */}
        <View style={styles.categoryTabs}>
          {CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.key}
              style={[
                styles.categoryTab,
                selectedCategory === category.key && styles.categoryTabActive
              ]}
              onPress={() => setSelectedCategory(category.key)}
            >
              <Text style={[
                styles.categoryTabText,
                selectedCategory === category.key && styles.categoryTabTextActive
              ]}>
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* User Rank Card */}
        {userRank && (
          <Card title="Your Ranking">
            <View style={styles.userRankContainer}>
              {userRank.ranks.map((rank) => (
                <View key={rank.category} style={styles.userRankItem}>
                  <Text style={styles.userRankCategory}>
                    {rank.category.toUpperCase()}
                  </Text>
                  <View style={styles.userRankStats}>
                    <Text style={styles.userRankPosition}>#{rank.rank}</Text>
                    <Text style={styles.userRankScore}>
                      {rank.score.toLocaleString()}
                    </Text>
                    <Text style={styles.userRankPercentile}>
                      Top {Math.round(rank.percentile)}%
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </Card>
        )}

        {/* Global Stats */}
        {stats && (
          <Card title="Global Statistics">
            <View style={styles.globalStats}>
              <View style={styles.globalStatItem}>
                <Text style={styles.globalStatValue}>
                  {stats.total_zones.toLocaleString()}
                </Text>
                <Text style={styles.globalStatLabel}>Total Zones</Text>
              </View>
              <View style={styles.globalStatItem}>
                <Text style={styles.globalStatValue}>
                  {stats.total_attacks.toLocaleString()}
                </Text>
                <Text style={styles.globalStatLabel}>Total Attacks</Text>
              </View>
              <View style={styles.globalStatItem}>
                <Text style={styles.globalStatValue}>{stats.top_player}</Text>
                <Text style={styles.globalStatLabel}>Top Player</Text>
              </View>
            </View>
          </Card>
        )}

        {/* Leaderboard List */}
        <Card title={`Top Players - ${CATEGORIES.find(c => c.key === selectedCategory)?.label}`}>
          {leaderboard && leaderboard.leaderboard.length > 0 ? (
            <FlatList
              data={leaderboard.leaderboard}
              renderItem={renderLeaderboardItem}
              keyExtractor={(item) => `${item.rank}-${item.username}`}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <Text style={styles.emptyText}>No leaderboard data available</Text>
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.LIGHT_GRAY,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: SPACING.LG,
    paddingHorizontal: SPACING.MD,
  },
  title: {
    ...TYPOGRAPHY.LARGE_TITLE,
    color: COLORS.DARK,
    marginBottom: SPACING.XS,
  },
  subtitle: {
    ...TYPOGRAPHY.FOOTNOTE,
    color: COLORS.GRAY,
  },
  categoryTabs: {
    flexDirection: 'row',
    marginHorizontal: SPACING.MD,
    marginBottom: SPACING.MD,
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: 4,
  },
  categoryTab: {
    flex: 1,
    paddingVertical: SPACING.SM,
    alignItems: 'center',
    borderRadius: 8,
  },
  categoryTabActive: {
    backgroundColor: COLORS.PRIMARY,
  },
  categoryTabText: {
    ...TYPOGRAPHY.CALLOUT,
    color: COLORS.GRAY,
    fontWeight: '600',
  },
  categoryTabTextActive: {
    color: COLORS.WHITE,
  },
  userRankContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  userRankItem: {
    width: '48%',
    marginBottom: SPACING.MD,
  },
  userRankCategory: {
    ...TYPOGRAPHY.CAPTION,
    color: COLORS.GRAY,
    fontWeight: '600',
    marginBottom: SPACING.XS,
  },
  userRankStats: {
    alignItems: 'center',
  },
  userRankPosition: {
    ...TYPOGRAPHY.TITLE,
    color: COLORS.PRIMARY,
    fontWeight: 'bold',
  },
  userRankScore: {
    ...TYPOGRAPHY.CALLOUT,
    color: COLORS.DARK,
    fontWeight: '600',
  },
  userRankPercentile: {
    ...TYPOGRAPHY.CAPTION,
    color: COLORS.SUCCESS,
  },
  globalStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  globalStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  globalStatValue: {
    ...TYPOGRAPHY.HEADLINE,
    color: COLORS.PRIMARY,
    fontWeight: 'bold',
  },
  globalStatLabel: {
    ...TYPOGRAPHY.CAPTION,
    color: COLORS.GRAY,
    textAlign: 'center',
    marginTop: SPACING.XS,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.MD,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.LIGHT_GRAY,
  },
  rankContainer: {
    width: 50,
    alignItems: 'center',
  },
  rankBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.LIGHT_GRAY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rank1: {
    backgroundColor: '#FFD700', // Gold
  },
  rank2: {
    backgroundColor: '#C0C0C0', // Silver
  },
  rank3: {
    backgroundColor: '#CD7F32', // Bronze
  },
  rankText: {
    ...TYPOGRAPHY.CALLOUT,
    color: COLORS.GRAY,
    fontWeight: 'bold',
  },
  topRankText: {
    color: COLORS.WHITE,
  },
  playerInfo: {
    flex: 1,
    marginLeft: SPACING.MD,
  },
  playerName: {
    ...TYPOGRAPHY.HEADLINE,
    color: COLORS.DARK,
    fontWeight: '600',
  },
  playerLevel: {
    ...TYPOGRAPHY.FOOTNOTE,
    color: COLORS.GRAY,
  },
  scoreContainer: {
    alignItems: 'flex-end',
  },
  scoreValue: {
    ...TYPOGRAPHY.HEADLINE,
    color: COLORS.PRIMARY,
    fontWeight: 'bold',
  },
  scoreLabel: {
    ...TYPOGRAPHY.CAPTION,
    color: COLORS.GRAY,
  },
  emptyText: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.GRAY,
    textAlign: 'center',
    paddingVertical: SPACING.LG,
  },
});
