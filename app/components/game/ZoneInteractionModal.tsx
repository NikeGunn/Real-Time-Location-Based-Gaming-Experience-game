import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { Zone } from '../../types/game';
import { useAuthStore } from '../../store/authStore';
import { useGameStore } from '../../store/gameStore';
import { useClaimZone, useCheckInZone } from '../../services/zoneService';
import { useAttackZone } from '../../services/attackService';
import { ActionModal } from '../ui/ActionModal';
import { COLORS, TYPOGRAPHY, SPACING, ZONE_STATUS } from '../../utils/constants';
import { formatDistance, formatTimestamp } from '../../utils/helpers';

interface ZoneInteractionModalProps {
  visible: boolean;
  onClose: () => void;
  zone: Zone | null;
  userDistance?: number;
}

export const ZoneInteractionModal: React.FC<ZoneInteractionModalProps> = ({
  visible,
  onClose,
  zone,
  userDistance,
}) => {
  const { user } = useAuthStore();
  const { userLocation, getZoneStatus, isZoneInRange } = useGameStore();

  const claimZoneMutation = useClaimZone();
  const checkInMutation = useCheckInZone();
  const attackMutation = useAttackZone();

  if (!zone || !user || !userLocation) {
    return null;
  }

  const zoneStatus = getZoneStatus(zone, user.id);
  const inRange = isZoneInRange(zone);

  const handleClaimZone = async () => {
    if (!inRange) {
      return;
    }

    try {
      await claimZoneMutation.mutateAsync({
        zoneId: zone.id,
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
      });
      onClose();
    } catch (error) {
      console.error('Claim zone error:', error);
    }
  };

  const handleCheckIn = async () => {
    if (!inRange) {
      return;
    }

    try {
      await checkInMutation.mutateAsync({
        zoneId: zone.id,
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
      });
      onClose();
    } catch (error) {
      console.error('Check-in error:', error);
    }
  };

  const handleAttack = async () => {
    if (!inRange) {
      return;
    }

    try {
      await attackMutation.mutateAsync({
        zoneId: zone.id,
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
      });
      onClose();
    } catch (error) {
      console.error('Attack error:', error);
    }
  };

  const getActions = () => {
    const actions = [];

    if (!inRange) {
      return [
        {
          title: 'Too Far Away',
          onPress: onClose,
          variant: 'secondary' as const,
        },
      ];
    }

    switch (zoneStatus) {
      case ZONE_STATUS.UNCLAIMED:
        actions.push({
          title: 'Claim Zone',
          onPress: handleClaimZone,
          variant: 'success' as const,
          loading: claimZoneMutation.isPending,
        });
        break;

      case ZONE_STATUS.OWNED:
        actions.push({
          title: 'Check In',
          onPress: handleCheckIn,
          variant: 'primary' as const,
          loading: checkInMutation.isPending,
        });
        break;

      case ZONE_STATUS.ENEMY:
        actions.push({
          title: 'Attack Zone',
          onPress: handleAttack,
          variant: 'danger' as const,
          loading: attackMutation.isPending,
        });
        break;
    }

    return actions;
  };

  const getStatusText = () => {
    switch (zoneStatus) {
      case ZONE_STATUS.UNCLAIMED:
        return 'This zone is unclaimed';
      case ZONE_STATUS.OWNED:
        return 'You own this zone';
      case ZONE_STATUS.ENEMY:
        return `Owned by ${zone.owner_username}`;
      default:
        return '';
    }
  };

  return (
    <ActionModal
      visible={visible}
      onClose={onClose}
      title={`Zone ${zone.id.split('_').slice(-2).join(', ')}`}
      actions={getActions()}
    >
      <View style={styles.content}>
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>{getStatusText()}</Text>
          {userDistance && (
            <Text style={styles.distanceText}>
              Distance: {formatDistance(userDistance)}
            </Text>
          )}
        </View>

        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>XP Value:</Text>
            <Text style={styles.infoValue}>{zone.xp_value}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Defense Power:</Text>
            <Text style={styles.infoValue}>{zone.defense_power}</Text>
          </View>

          {zone.claimed_at && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Claimed:</Text>
              <Text style={styles.infoValue}>
                {formatTimestamp(zone.claimed_at)}
              </Text>
            </View>
          )}

          {zone.expires_at && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Expires:</Text>
              <Text style={styles.infoValue}>
                {formatTimestamp(zone.expires_at)}
              </Text>
            </View>
          )}
        </View>
      </View>
    </ActionModal>
  );
};

const styles = StyleSheet.create({
  content: {
    marginBottom: SPACING.MD,
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: SPACING.MD,
  },
  statusText: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.DARK,
    textAlign: 'center',
    marginBottom: SPACING.XS,
  },
  distanceText: {
    ...TYPOGRAPHY.FOOTNOTE,
    color: COLORS.GRAY,
  },
  infoContainer: {
    backgroundColor: COLORS.LIGHT_GRAY,
    borderRadius: 8,
    padding: SPACING.MD,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.SM,
  },
  infoLabel: {
    ...TYPOGRAPHY.CALLOUT,
    color: COLORS.GRAY,
  },
  infoValue: {
    ...TYPOGRAPHY.CALLOUT,
    color: COLORS.DARK,
    fontWeight: '600',
  },
});
