import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/authStore';
import { Card } from '../components/ui/Card';
import { COLORS, TYPOGRAPHY, SPACING } from '../utils/constants';
import { getLevelFromXp } from '../utils/helpers';

interface LeaderboardEntry {
  id: number;
  username: string;
  xp: number;
  level: number;
  zones_owned: number;
  rank: number;
}

const DEMO_LEADERBOARD: LeaderboardEntry[] = [
  { id: 1, username: 'DragonSlayer99', xp: 2450, level: 25, zones_owned: 15, rank: 1 },
  { id: 2, username: 'ZoneMaster', xp: 2200, level: 22, zones_owned: 12, rank: 2 },
  { id: 3, username: 'CaptureKing', xp: 1950, level: 20, zones_owned: 10, rank: 3 },
  { id: 4, username: 'MapWarrior', xp: 1800, level: 18, zones_owned: 9, rank: 4 },
  { id: 5, username: 'TerritoryHunter', xp: 1650, level: 17, zones_owned: 8, rank: 5 },
  { id: 6, username: 'ShadowHunter', xp: 1500, level: 15, zones_owned: 7, rank: 6 },
  { id: 7, username: 'StormBreaker', xp: 1350, level: 14, zones_owned: 6, rank: 7 },
  { id: 8, username: 'IronFist', xp: 1200, level: 12, zones_owned: 5, rank: 8 },
  { id: 9, username: 'FireWolf', xp: 1050, level: 11, zones_owned: 4, rank: 9 },
  { id: 10, username: 'IcePhoenix', xp: 900, level: 9, zones_owned: 3, rank: 10 },
];

const CATEGORIES = [
  { key: 'xp', label: 'XP' },
  { key: 'zones', label: 'Zones' },
  { key: 'level', label: 'Level' },
] as const;

export default function LeaderboardScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const [selectedCategory, setSelectedCategory] = useState<'xp' | 'zones' | 'level'>('xp');
  const [refreshing, setRefreshing] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    // Fade in animation when component mounts
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const getLeaderboardWithUser = () => {
    if (!user) return DEMO_LEADERBOARD;

    // Create user entry from actual user data
    const userEntry: LeaderboardEntry = {
      id: user.id,
      username: user.username,
      xp: user.xp,
      level: getLevelFromXp(user.xp),
      zones_owned: user.zones_owned || 0,
      rank: 0, // Will be calculated below
    };

    // Remove any existing test user and add real user
    const leaderboardWithoutTestUser = DEMO_LEADERBOARD.filter(p => p.username !== 'testuser');
    const fullLeaderboard = [...leaderboardWithoutTestUser, userEntry];

    return fullLeaderboard;
  };

  const getSortedLeaderboard = () => {
    const leaderboard = getLeaderboardWithUser();
    const sorted = [...leaderboard].sort((a, b) => {
      switch (selectedCategory) {
        case 'xp':
          return b.xp - a.xp;
        case 'zones':
          return b.zones_owned - a.zones_owned;
        case 'level':
          return b.level - a.level;
        default:
          return b.xp - a.xp;
      }
    });

    return sorted.map((entry, index) => ({ ...entry, rank: index + 1 }));
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call delay
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };
  const renderLeaderboardItem = ({ item, index }: { item: LeaderboardEntry; index: number }) => {
    const isCurrentUser = user && item.username === user.username;

    return (
      <Animated.View
        style={[
          styles.leaderboardItem,
          isCurrentUser && styles.currentUserItem,
          {
            opacity: fadeAnim,
            transform: [
              {
                translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
          }
        ]}
      >
        <View style={styles.rankContainer}>
          <Text style={[styles.rankText, item.rank <= 3 && styles.topRankText]}>
            {getRankIcon(item.rank)}
          </Text>
        </View>

        <View style={styles.playerInfo}>
          <Text style={[styles.username, isCurrentUser && styles.currentUserText]}>
            {item.username}
            {isCurrentUser && ' (You)'}
          </Text>
          <Text style={styles.playerStats}>
            Level {item.level} • {item.zones_owned} zones
          </Text>
        </View>

        <View style={styles.scoreContainer}>
          <Text style={[styles.scoreText, isCurrentUser && styles.currentUserText]}>
            {selectedCategory === 'xp' && `${item.xp.toLocaleString()} XP`}
            {selectedCategory === 'zones' && `${item.zones_owned} zones`}
            {selectedCategory === 'level' && `Level ${item.level}`}
          </Text>
          {selectedCategory === 'xp' && item.rank <= 10 && (
            <Text style={styles.trendText}>
              🔥 Top 10
            </Text>
          )}
        </View>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Leaderboard</Text>
        <Text style={styles.subtitle}>Compete with players worldwide</Text>
      </View>

      {/* Category Selector */}
      <View style={styles.categoryContainer}>
        {CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category.key}
            style={[
              styles.categoryButton,
              selectedCategory === category.key && styles.selectedCategory
            ]}
            onPress={() => setSelectedCategory(category.key)}
          >
            <Text style={[
              styles.categoryText,
              selectedCategory === category.key && styles.selectedCategoryText
            ]}>
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>      {/* Leaderboard List */}
      <Card title={`Top Players by ${CATEGORIES.find(c => c.key === selectedCategory)?.label}`}>
        <FlatList
          data={getSortedLeaderboard()}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderLeaderboardItem}
          showsVerticalScrollIndicator={false}
          style={styles.leaderboardList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.PRIMARY]}
              tintColor={COLORS.PRIMARY}
            />
          }
        />
      </Card>

      {/* User's Rank */}
      <Card title="Your Ranking">
        <View style={styles.userRankContainer}>
          {user && (
            <>
              <Text style={styles.userRankText}>
                You are ranked #{getSortedLeaderboard().find(p => p.username === user.username)?.rank || 'N/A'}
              </Text>
              <Text style={styles.userRankDetail}>
                {selectedCategory === 'xp' && `${user.xp.toLocaleString()} XP`}
                {selectedCategory === 'zones' && `${user.zones_owned || 0} zones owned`}
                {selectedCategory === 'level' && `Level ${getLevelFromXp(user.xp)}`}
              </Text>
              <Text style={styles.userRankSubtext}>
                Keep playing to climb the leaderboard!
              </Text>
            </>
          )}
        </View>
      </Card>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.LIGHT_GRAY,
  },
  header: {
    alignItems: 'center',
    padding: SPACING.LG,
    paddingBottom: SPACING.MD,
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
  categoryContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.MD,
    marginBottom: SPACING.MD,
  },
  categoryButton: {
    flex: 1,
    paddingVertical: SPACING.SM,
    paddingHorizontal: SPACING.MD,
    backgroundColor: COLORS.WHITE,
    borderRadius: 8,
    marginHorizontal: SPACING.XS,
    alignItems: 'center',
  },
  selectedCategory: {
    backgroundColor: COLORS.PRIMARY,
  },
  categoryText: {
    ...TYPOGRAPHY.CALLOUT,
    color: COLORS.GRAY,
    fontWeight: '600',
  },
  selectedCategoryText: {
    color: COLORS.WHITE,
  },
  leaderboardList: {
    maxHeight: 400,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.MD,
    paddingHorizontal: SPACING.SM,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.LIGHT_GRAY,
  },
  currentUserItem: {
    backgroundColor: COLORS.PRIMARY + '10',
    borderRadius: 8,
    borderBottomWidth: 0,
    marginVertical: SPACING.XS,
  },
  rankContainer: {
    width: 50,
    alignItems: 'center',
  },
  rankText: {
    ...TYPOGRAPHY.CALLOUT,
    color: COLORS.GRAY,
    fontWeight: 'bold',
  },
  topRankText: {
    fontSize: 18,
  },
  playerInfo: {
    flex: 1,
    marginLeft: SPACING.MD,
  },
  username: {
    ...TYPOGRAPHY.CALLOUT,
    color: COLORS.DARK,
    fontWeight: '600',
  },
  currentUserText: {
    color: COLORS.PRIMARY,
  },
  playerStats: {
    ...TYPOGRAPHY.CAPTION,
    color: COLORS.GRAY,
    marginTop: SPACING.XS,
  },
  scoreContainer: {
    alignItems: 'flex-end',
  }, scoreText: {
    ...TYPOGRAPHY.CALLOUT,
    color: COLORS.DARK,
    fontWeight: 'bold',
  }, trendText: {
    ...TYPOGRAPHY.CAPTION,
    color: COLORS.WARNING,
    fontSize: 10,
    marginTop: 2,
  },
  userRankContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.MD,
  }, userRankText: {
    ...TYPOGRAPHY.HEADLINE,
    color: COLORS.PRIMARY,
    fontWeight: 'bold',
  },
  userRankDetail: {
    ...TYPOGRAPHY.CALLOUT,
    color: COLORS.DARK,
    marginTop: SPACING.XS,
    fontWeight: '600',
  },
  userRankSubtext: {
    ...TYPOGRAPHY.CAPTION,
    color: COLORS.GRAY,
    marginTop: SPACING.XS,
  },
});
