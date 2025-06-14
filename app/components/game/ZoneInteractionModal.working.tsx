import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Zone } from '../../types/game';
import { useAuthStore } from '../../store/authStore';
import { useClaimZone } from '../../services/zoneService';
import { Button } from '../ui/Button';
import { COLORS, TYPOGRAPHY, SPACING } from '../../utils/constants';

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
  const claimZoneMutation = useClaimZone();

  if (!zone || !user) {
    return null;
  }

  const isNearby = !userDistance || userDistance <= 50; // 50 meters
  const isOwned = zone.owner === user.id;
  const isClaimed = zone.is_claimed;

  const handleClaimZone = async () => {
    if (!isNearby) {
      Alert.alert('Too Far', 'You need to be closer to claim this zone');
      return;
    }

    if (isClaimed) {
      Alert.alert('Already Claimed', 'This zone is already claimed');
      return;
    }

    try {
      await claimZoneMutation.mutateAsync({
        zoneId: zone.id,
        latitude: zone.latitude,
        longitude: zone.longitude,
      });

      Alert.alert('Success!', `You claimed the zone and gained ${zone.xp_value} XP!`);
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to claim zone. Try again.');
    }
  };

  const handleAttackZone = () => {
    Alert.alert('Coming Soon', 'Zone attacking feature will be available soon!');
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Zone {zone.id.split('_').slice(-2).join(', ')}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <View style={styles.infoRow}>
              <Text style={styles.label}>XP Value:</Text>
              <Text style={styles.value}>{zone.xp_value}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Status:</Text>
              <Text style={[styles.value, { color: isClaimed ? COLORS.DANGER : COLORS.SUCCESS }]}>
                {isClaimed ? 'Claimed' : 'Available'}
              </Text>
            </View>

            {zone.owner_username && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Owner:</Text>
                <Text style={styles.value}>{zone.owner_username}</Text>
              </View>
            )}

            <View style={styles.infoRow}>
              <Text style={styles.label}>Distance:</Text>
              <Text style={[styles.value, { color: isNearby ? COLORS.SUCCESS : COLORS.DANGER }]}>
                {userDistance ? `${Math.round(userDistance)}m` : 'Unknown'}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Defense:</Text>
              <Text style={styles.value}>{zone.defense_power}</Text>
            </View>
          </View>

          <View style={styles.actions}>
            {!isClaimed && isNearby && (
              <Button
                title="Claim Zone"
                onPress={handleClaimZone}
                loading={claimZoneMutation.isPending}
                style={styles.actionButton}
              />
            )}

            {isClaimed && !isOwned && isNearby && (
              <Button
                title="Attack Zone"
                onPress={handleAttackZone}
                variant="danger"
                style={styles.actionButton}
              />
            )}

            {!isNearby && (
              <Text style={styles.warningText}>
                ⚠️ Move closer to interact with this zone
              </Text>
            )}

            <Button
              title="Close"
              onPress={onClose}
              variant="secondary"
              style={styles.actionButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.LG,
  },
  modal: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: SPACING.LG,
    width: '100%',
    maxWidth: 400,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.LG,
  },
  title: {
    ...TYPOGRAPHY.TITLE,
    color: COLORS.DARK,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: SPACING.SM,
  },
  closeText: {
    fontSize: 20,
    color: COLORS.GRAY,
  },
  content: {
    marginBottom: SPACING.LG,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.SM,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.LIGHT_GRAY,
  },
  label: {
    ...TYPOGRAPHY.CALLOUT,
    color: COLORS.GRAY,
  },
  value: {
    ...TYPOGRAPHY.CALLOUT,
    color: COLORS.DARK,
    fontWeight: '600',
  },
  actions: {
    gap: SPACING.MD,
  },
  actionButton: {
    marginBottom: SPACING.SM,
  },
  warningText: {
    ...TYPOGRAPHY.CAPTION,
    color: COLORS.ORANGE,
    textAlign: 'center',
    marginVertical: SPACING.SM,
  },
});
