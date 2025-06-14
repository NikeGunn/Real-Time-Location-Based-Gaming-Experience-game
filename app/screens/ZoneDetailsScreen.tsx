import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import { useZone } from '../services/zoneService';
import { useAuthStore } from '../store/authStore';
import { useGameStore } from '../store/gameStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { LoadingScreen } from '../components/ui/LoadingScreen';
import { COLORS, TYPOGRAPHY, SPACING } from '../utils/constants';
import { formatTimestamp, formatDistance, calculateDistance } from '../utils/helpers';

interface ZoneDetailsScreenProps {
  navigation: any;
}

export default function ZoneDetailsScreen({ navigation }: ZoneDetailsScreenProps) {
  const route = useRoute();
  const { zoneId } = route.params as { zoneId: string };

  const { user } = useAuthStore();
  const { userLocation, getZoneStatus, getZoneColor } = useGameStore();

  const { data: zone, isLoading, error } = useZone(zoneId);

  const navigateToMap = () => {
    navigation.navigate('MapMain');
  };

  if (isLoading) {
    return <LoadingScreen message="Loading zone details..." />;
  }

  if (error || !zone) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Zone not found</Text>
          <Button title="Back to Map" onPress={navigateToMap} />
        </View>
      </SafeAreaView>
    );
  }

  const zoneStatus = user ? getZoneStatus(zone, user.id) : 'unclaimed';
  const distance = userLocation
    ? Math.round(calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      zone.latitude,
      zone.longitude
    ))
    : null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Zone Header */}
        <Card>
          <View style={styles.header}>
            <Text style={styles.zoneTitle}>
              Zone {zone.id.split('_').slice(-2).join(', ')}
            </Text>
            <Text style={styles.coordinates}>
              {zone.latitude.toFixed(6)}, {zone.longitude.toFixed(6)}
            </Text>
            {distance && (
              <Text style={styles.distance}>
                {formatDistance(distance)} away
              </Text>
            )}
          </View>
        </Card>

        {/* Zone Status */}
        <Card title="Zone Status">
          <View style={styles.statusContainer}>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Owner:</Text>
              <Text style={styles.statusValue}>
                {zone.owner_username || 'Unclaimed'}
              </Text>
            </View>

            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Status:</Text>
              <Text style={[
                styles.statusValue,
                { color: getZoneColor(zone, user?.id) }
              ]}>
                {zoneStatus.charAt(0).toUpperCase() + zoneStatus.slice(1)}
              </Text>
            </View>

            {zone.claimed_at && (
              <View style={styles.statusItem}>
                <Text style={styles.statusLabel}>Claimed:</Text>
                <Text style={styles.statusValue}>
                  {formatTimestamp(zone.claimed_at)}
                </Text>
              </View>
            )}

            {zone.expires_at && (
              <View style={styles.statusItem}>
                <Text style={styles.statusLabel}>Expires:</Text>
                <Text style={styles.statusValue}>
                  {formatTimestamp(zone.expires_at)}
                </Text>
              </View>
            )}
          </View>
        </Card>

        {/* Zone Properties */}
        <Card title="Zone Properties">
          <View style={styles.propertiesGrid}>
            <View style={styles.propertyItem}>
              <Text style={styles.propertyValue}>{zone.xp_value}</Text>
              <Text style={styles.propertyLabel}>XP Value</Text>
            </View>

            <View style={styles.propertyItem}>
              <Text style={styles.propertyValue}>{zone.defense_power}</Text>
              <Text style={styles.propertyLabel}>Defense Power</Text>
            </View>
          </View>
        </Card>

        {/* Check-in History */}
        {zone.checkin_history && zone.checkin_history.length > 0 && (
          <Card title="Recent Check-ins">
            <View style={styles.historyList}>
              {zone.checkin_history.slice(0, 5).map((checkin) => (
                <View key={checkin.id} style={styles.historyItem}>
                  <View style={styles.historyInfo}>
                    <Text style={styles.historyTime}>
                      {formatTimestamp(checkin.timestamp)}
                    </Text>
                    <Text style={[
                      styles.historyStatus,
                      { color: checkin.success ? COLORS.SUCCESS : COLORS.DANGER }
                    ]}>
                      {checkin.success ? 'Success' : 'Failed'}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </Card>
        )}

        {/* Attack History */}
        {zone.attack_history && zone.attack_history.length > 0 && (
          <Card title="Recent Attacks">
            <View style={styles.historyList}>
              {zone.attack_history.slice(0, 5).map((attack) => (
                <View key={attack.id} style={styles.historyItem}>
                  <View style={styles.attackInfo}>
                    <Text style={styles.attackPlayers}>
                      {attack.attacker_username} vs {attack.defender_username}
                    </Text>
                    <Text style={styles.historyTime}>
                      {formatTimestamp(attack.timestamp)}
                    </Text>
                  </View>
                  <Text style={[
                    styles.historyStatus,
                    { color: attack.success ? COLORS.SUCCESS : COLORS.DANGER }
                  ]}>
                    {attack.success ? 'Victory' : 'Defended'}
                  </Text>
                </View>
              ))}
            </View>
          </Card>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title="View on Map"
            onPress={navigateToMap}
            variant="primary"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.LIGHT_GRAY,
  },
  content: {
    padding: SPACING.MD,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.LG,
  },
  errorText: {
    ...TYPOGRAPHY.HEADLINE,
    color: COLORS.DANGER,
    marginBottom: SPACING.LG,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.MD,
  },
  zoneTitle: {
    ...TYPOGRAPHY.TITLE,
    color: COLORS.DARK,
    marginBottom: SPACING.XS,
  },
  coordinates: {
    ...TYPOGRAPHY.FOOTNOTE,
    color: COLORS.GRAY,
    marginBottom: SPACING.XS,
  },
  distance: {
    ...TYPOGRAPHY.FOOTNOTE,
    color: COLORS.PRIMARY,
    fontWeight: '600',
  },
  statusContainer: {
    width: '100%',
  },
  statusItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.SM,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.LIGHT_GRAY,
  },
  statusLabel: {
    ...TYPOGRAPHY.CALLOUT,
    color: COLORS.GRAY,
  },
  statusValue: {
    ...TYPOGRAPHY.CALLOUT,
    color: COLORS.DARK,
    fontWeight: '600',
  },
  propertiesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  propertyItem: {
    alignItems: 'center',
  },
  propertyValue: {
    ...TYPOGRAPHY.TITLE,
    color: COLORS.PRIMARY,
    fontWeight: 'bold',
  },
  propertyLabel: {
    ...TYPOGRAPHY.CAPTION,
    color: COLORS.GRAY,
    marginTop: SPACING.XS,
  },
  historyList: {
    width: '100%',
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.SM,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.LIGHT_GRAY,
  },
  historyInfo: {
    flex: 1,
  },
  historyTime: {
    ...TYPOGRAPHY.FOOTNOTE,
    color: COLORS.GRAY,
  },
  historyStatus: {
    ...TYPOGRAPHY.FOOTNOTE,
    fontWeight: '600',
  },
  attackInfo: {
    flex: 1,
  },
  attackPlayers: {
    ...TYPOGRAPHY.CALLOUT,
    color: COLORS.DARK,
    fontWeight: '600',
  },
  actions: {
    marginTop: SPACING.LG,
  },
});
