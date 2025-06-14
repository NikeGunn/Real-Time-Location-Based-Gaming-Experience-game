import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAttackHistory, useAttackStats } from '../../services/attackService';
import { Card } from '../../components/ui/Card';
import { COLORS, TYPOGRAPHY, SPACING } from '../../utils/constants';
import { formatTimestamp } from '../../utils/helpers';

interface AttackHistoryScreenProps {
  navigation: any;
}

export default function AttackHistoryScreen({ navigation }: AttackHistoryScreenProps) {
  const [selectedType, setSelectedType] = useState<'made' | 'received'>('made');

  const {
    data: attackData,
    isLoading: attacksLoading,
    error: attacksError,
    refetch: refetchAttacks
  } = useAttackHistory(selectedType);

  const {
    data: statsData,
    isLoading: statsLoading,
    error: statsError
  } = useAttackStats();

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetchAttacks();
    setRefreshing(false);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color={COLORS.PRIMARY} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Attack History</Text>
      <View style={styles.placeholder} />
    </View>
  );

  const renderStats = () => {
    if (statsLoading) {
      return (
        <Card title="Statistics">
          <ActivityIndicator size="small" color={COLORS.PRIMARY} />
        </Card>
      );
    }

    if (statsError || !statsData) {
      return (
        <Card title="Statistics">
          <Text style={styles.errorText}>Failed to load statistics</Text>
        </Card>
      );
    }

    return (
      <Card title="Attack Statistics">
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{statsData.attacks_made}</Text>
            <Text style={styles.statLabel}>Attacks Made</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{statsData.attacks_won}</Text>
            <Text style={styles.statLabel}>Attacks Won</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{statsData.defenses_successful}</Text>
            <Text style={styles.statLabel}>Defenses Won</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{Math.round(statsData.attack_success_rate)}%</Text>
            <Text style={styles.statLabel}>Success Rate</Text>
          </View>
        </View>

        <View style={styles.totalXpContainer}>
          <Text style={styles.totalXpLabel}>Total XP Gained from Attacks</Text>
          <Text style={styles.totalXpValue}>{statsData.total_xp_gained} XP</Text>
        </View>
      </Card>
    );
  };

  const renderTypeSelector = () => (
    <View style={styles.typeSelectorContainer}>
      <TouchableOpacity
        style={[
          styles.typeButton,
          selectedType === 'made' && styles.typeButtonActive
        ]}
        onPress={() => setSelectedType('made')}
      >
        <Text style={[
          styles.typeButtonText,
          selectedType === 'made' && styles.typeButtonTextActive
        ]}>
          Attacks Made
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.typeButton,
          selectedType === 'received' && styles.typeButtonActive
        ]}
        onPress={() => setSelectedType('received')}
      >
        <Text style={[
          styles.typeButtonText,
          selectedType === 'received' && styles.typeButtonTextActive
        ]}>
          Defenses
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderAttackItem = (attack: any) => {
    const isSuccess = attack.success;
    const isAttackMade = selectedType === 'made';

    return (
      <View key={attack.id} style={styles.attackItem}>
        <View style={styles.attackHeader}>
          <View style={styles.attackInfo}>
            <Text style={styles.opponentName}>
              {isAttackMade ? `vs ${attack.opponent_username}` : `by ${attack.opponent_username}`}
            </Text>
            <Text style={styles.zoneId}>Zone: {attack.zone_id}</Text>
          </View>

          <View style={[
            styles.resultBadge,
            { backgroundColor: isSuccess ? COLORS.SUCCESS : COLORS.error }
          ]}>
            <Text style={styles.resultText}>
              {isSuccess ? (isAttackMade ? 'WON' : 'DEFENDED') : (isAttackMade ? 'LOST' : 'FAILED')}
            </Text>
          </View>
        </View>

        <View style={styles.attackDetails}>
          <View style={styles.powerComparison}>
            <Text style={styles.powerText}>
              Attack: {attack.attacker_power} | Defense: {attack.defender_power}
            </Text>
          </View>

          <View style={styles.xpAndTime}>
            <Text style={styles.xpGained}>+{attack.xp_gained} XP</Text>
            <Text style={styles.timestamp}>{formatTimestamp(attack.timestamp)}</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderAttackHistory = () => {
    if (attacksLoading) {
      return (
        <Card title="Attack History">
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        </Card>
      );
    }

    if (attacksError) {
      return (
        <Card title="Attack History">
          <Text style={styles.errorText}>Failed to load attack history</Text>
        </Card>
      );
    }

    if (!attackData || attackData.attacks.length === 0) {
      return (
        <Card title="Attack History">
          <View style={styles.emptyState}>
            <Ionicons
              name="shield-outline"
              size={48}
              color={COLORS.GRAY}
            />
            <Text style={styles.emptyStateText}>
              {selectedType === 'made' ? 'No attacks made yet' : 'No defenses recorded yet'}
            </Text>
            <Text style={styles.emptyStateSubtext}>
              {selectedType === 'made'
                ? 'Start attacking zones to build your history!'
                : 'Defend your zones to see defense records here!'
              }
            </Text>
          </View>
        </Card>
      );
    }

    return (
      <Card title={`${selectedType === 'made' ? 'Attacks Made' : 'Defenses'} (${attackData.count})`}>
        <View style={styles.attackList}>
          {attackData.attacks.map(renderAttackItem)}
        </View>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {renderStats()}
        {renderTypeSelector()}
        {renderAttackHistory()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.LIGHT_GRAY,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    backgroundColor: COLORS.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: SPACING.SM,
  },
  headerTitle: {
    ...TYPOGRAPHY.TITLE,
    color: COLORS.DARK,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: SPACING.MD,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.MD,
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: SPACING.SM,
    padding: SPACING.SM,
    backgroundColor: COLORS.LIGHT_GRAY,
    borderRadius: 8,
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
  totalXpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.SM,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  totalXpLabel: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.DARK,
  },
  totalXpValue: {
    ...TYPOGRAPHY.HEADLINE,
    color: COLORS.SUCCESS,
    fontWeight: 'bold',
  },
  typeSelectorContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.MD,
    backgroundColor: COLORS.WHITE,
    borderRadius: 8,
    padding: SPACING.XS,
  },
  typeButton: {
    flex: 1,
    paddingVertical: SPACING.SM,
    alignItems: 'center',
    borderRadius: 6,
  },
  typeButtonActive: {
    backgroundColor: COLORS.PRIMARY,
  },
  typeButtonText: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.GRAY,
    fontWeight: '500',
  },
  typeButtonTextActive: {
    color: COLORS.WHITE,
    fontWeight: 'bold',
  },
  attackList: {
    gap: SPACING.SM,
  },
  attackItem: {
    padding: SPACING.MD,
    backgroundColor: COLORS.WHITE,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.PRIMARY,
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
    fontWeight: 'bold',
  },
  zoneId: {
    ...TYPOGRAPHY.CAPTION,
    color: COLORS.GRAY,
  },
  resultBadge: {
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.XS,
    borderRadius: 12,
  },
  resultText: {
    ...TYPOGRAPHY.CAPTION,
    color: COLORS.WHITE,
    fontWeight: 'bold',
  },
  attackDetails: {
    gap: SPACING.XS,
  },
  powerComparison: {
    marginBottom: SPACING.XS,
  },
  powerText: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.GRAY,
  },
  xpAndTime: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  xpGained: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.SUCCESS,
    fontWeight: 'bold',
  },
  timestamp: {
    ...TYPOGRAPHY.CAPTION,
    color: COLORS.GRAY,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.LG,
  },
  emptyStateText: {
    ...TYPOGRAPHY.HEADLINE,
    color: COLORS.GRAY,
    marginTop: SPACING.SM,
  },
  emptyStateSubtext: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.GRAY,
    textAlign: 'center',
    marginTop: SPACING.XS,
  },
  errorText: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.error,
    textAlign: 'center',
    padding: SPACING.MD,
  },
});