import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAttackHistory, useAttackStats } from '../services/attackService';
import { Card } from '../components/ui/Card';
import { LoadingScreen } from '../components/ui/LoadingScreen';
import { COLORS, TYPOGRAPHY, SPACING } from '../utils/constants';
import { formatTimestamp } from '../utils/helpers';
import { AttackHistory } from '../types/game';

interface AttackHistoryScreenProps {
  navigation: any;
}

export default function AttackHistoryScreen({ navigation }: AttackHistoryScreenProps) {
  const [attackType, setAttackType] = useState<'made' | 'received'>('made');
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: attacks,
    isLoading: attacksLoading,
    refetch: refetchAttacks
  } = useAttackHistory(attackType);

  const {
    data: stats,
    isLoading: statsLoading
  } = useAttackStats();

  const onRefresh = async () => {
    setRefreshing(true);
    await refetchAttacks();
    setRefreshing(false);
  };

  const renderAttackItem = ({ item }: { item: AttackHistory }) => (
    <View style={styles.attackItem}>
      <View style={styles.attackHeader}>
        <View style={styles.attackInfo}>
          <Text style={styles.opponentName}>
            {attackType === 'made' ? `vs ${item.opponent_username}` : `by ${item.opponent_username}`}
          </Text>
          <Text style={styles.attackTime}>
            {formatTimestamp(item.timestamp)}
          </Text>
        </View>

        <View style={[
          styles.resultBadge,
          item.success ? styles.successBadge : styles.failureBadge
        ]}>
          <Text style={[
            styles.resultText,
            item.success ? styles.successText : styles.failureText
          ]}>
            {item.success ? 'Victory' : 'Defeat'}
          </Text>
        </View>
      </View>

      <View style={styles.attackDetails}>
        <Text style={styles.zoneId}>
          Zone {item.zone_id.split('_').slice(-2).join(', ')}
        </Text>

        <View style={styles.powerComparison}>
          <View style={styles.powerItem}>
            <Text style={styles.powerLabel}>
              {attackType === 'made' ? 'Your Power' : 'Attacker Power'}
            </Text>
            <Text style={styles.powerValue}>{item.attacker_power}</Text>
          </View>

          <Text style={styles.vsText}>VS</Text>

          <View style={styles.powerItem}>
            <Text style={styles.powerLabel}>
              {attackType === 'made' ? 'Defender Power' : 'Your Defense'}
            </Text>
            <Text style={styles.powerValue}>{item.defender_power}</Text>
          </View>
        </View>

        {item.xp_gained > 0 && (
          <Text style={styles.xpGained}>+{item.xp_gained} XP</Text>
        )}
      </View>
    </View>
  );

  if (attacksLoading || statsLoading) {
    return <LoadingScreen message="Loading attack history..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Attack Type Selector */}
        <View style={styles.typeSelector}>
          <TouchableOpacity
            style={[
              styles.typeButton,
              attackType === 'made' && styles.typeButtonActive
            ]}
            onPress={() => setAttackType('made')}
          >
            <Text style={[
              styles.typeButtonText,
              attackType === 'made' && styles.typeButtonTextActive
            ]}>
              Attacks Made
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.typeButton,
              attackType === 'received' && styles.typeButtonActive
            ]}
            onPress={() => setAttackType('received')}
          >
            <Text style={[
              styles.typeButtonText,
              attackType === 'received' && styles.typeButtonTextActive
            ]}>
              Attacks Received
            </Text>
          </TouchableOpacity>
        </View>

        {/* Statistics Card */}
        {stats && (
          <Card title="Attack Statistics">
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.attacks_made}</Text>
                <Text style={styles.statLabel}>Total Attacks</Text>
              </View>

              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.attacks_won}</Text>
                <Text style={styles.statLabel}>Victories</Text>
              </View>

              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {Math.round(stats.attack_success_rate)}%
                </Text>
                <Text style={styles.statLabel}>Success Rate</Text>
              </View>

              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {Math.round(stats.defense_success_rate)}%
                </Text>
                <Text style={styles.statLabel}>Defense Rate</Text>
              </View>
            </View>
          </Card>
        )}

        {/* Attack History List */}
        <Card title={`${attackType === 'made' ? 'Attacks Made' : 'Attacks Received'}`}>
          {attacks && attacks.attacks.length > 0 ? (
            <FlatList
              data={attacks.attacks}
              renderItem={renderAttackItem}
              keyExtractor={(item) => item.id.toString()}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              showsVerticalScrollIndicator={false}
              style={styles.attacksList}
            />
          ) : (
            <Text style={styles.emptyText}>
              No {attackType === 'made' ? 'attacks made' : 'attacks received'} yet
            </Text>
          )}
        </Card>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.LIGHT_GRAY,
  },
  content: {
    flex: 1,
    padding: SPACING.MD,
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: SPACING.MD,
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: 4,
  },
  typeButton: {
    flex: 1,
    paddingVertical: SPACING.MD,
    alignItems: 'center',
    borderRadius: 8,
  },
  typeButtonActive: {
    backgroundColor: COLORS.PRIMARY,
  },
  typeButtonText: {
    ...TYPOGRAPHY.CALLOUT,
    color: COLORS.GRAY,
    fontWeight: '600',
  },
  typeButtonTextActive: {
    color: COLORS.WHITE,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: SPACING.MD,
  },
  statValue: {
    ...TYPOGRAPHY.TITLE,
    color: COLORS.PRIMARY,
    fontWeight: 'bold',
  },
  statLabel: {
    ...TYPOGRAPHY.CAPTION,
    color: COLORS.GRAY,
    textAlign: 'center',
  },
  attacksList: {
    maxHeight: 400,
  },
  attackItem: {
    paddingVertical: SPACING.MD,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.LIGHT_GRAY,
  },
  attackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.SM,
  },
  attackInfo: {
    flex: 1,
  },
  opponentName: {
    ...TYPOGRAPHY.HEADLINE,
    color: COLORS.DARK,
    fontWeight: '600',
  },
  attackTime: {
    ...TYPOGRAPHY.FOOTNOTE,
    color: COLORS.GRAY,
  },
  resultBadge: {
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.XS,
    borderRadius: 12,
  },
  successBadge: {
    backgroundColor: `${COLORS.SUCCESS}20`,
  },
  failureBadge: {
    backgroundColor: `${COLORS.DANGER}20`,
  },
  resultText: {
    ...TYPOGRAPHY.CAPTION,
    fontWeight: '600',
  },
  successText: {
    color: COLORS.SUCCESS,
  },
  failureText: {
    color: COLORS.DANGER,
  },
  attackDetails: {
    paddingLeft: SPACING.SM,
  },
  zoneId: {
    ...TYPOGRAPHY.CALLOUT,
    color: COLORS.DARK,
    marginBottom: SPACING.SM,
  },
  powerComparison: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.SM,
  },
  powerItem: {
    alignItems: 'center',
    flex: 1,
  },
  powerLabel: {
    ...TYPOGRAPHY.CAPTION,
    color: COLORS.GRAY,
  },
  powerValue: {
    ...TYPOGRAPHY.CALLOUT,
    color: COLORS.PRIMARY,
    fontWeight: '600',
  },
  vsText: {
    ...TYPOGRAPHY.CAPTION,
    color: COLORS.GRAY,
    fontWeight: 'bold',
    marginHorizontal: SPACING.SM,
  },
  xpGained: {
    ...TYPOGRAPHY.FOOTNOTE,
    color: COLORS.SUCCESS,
    fontWeight: '600',
    textAlign: 'right',
  },
  emptyText: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.GRAY,
    textAlign: 'center',
    paddingVertical: SPACING.LG,
  },
});
