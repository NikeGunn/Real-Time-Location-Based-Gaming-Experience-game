import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { COLORS } from '../../utils/constants.enhanced';
import { formatDistance, formatTimeAgo, canAttackZone, canClaimZone, canCheckIntoZone } from '../../utils/gameUtils';

const { width, height } = Dimensions.get('window');

interface Zone {
  id: string;
  name: string;
  center_lat: number;
  center_lng: number;
  owner?: {
    id: string;
    username: string;
  } | null;
  level: number;
  defense_points: number;
  is_claimed: boolean;
  last_attacked?: string;
  created_at: string;
}

interface ZoneInfoCardProps {
  zone: Zone;
  userLocation: { latitude: number; longitude: number } | null;
  currentUserId?: string;
  onCheckIn: () => void;
  onClaim: () => void;
  onAttack: () => void;
  onViewDetails: () => void;
  onClose: () => void;
}

export const ZoneInfoCard: React.FC<ZoneInfoCardProps> = ({
  zone,
  userLocation,
  currentUserId,
  onCheckIn,
  onClaim,
  onAttack,
  onViewDetails,
  onClose,
}) => {
  const slideAnim = React.useRef(new Animated.Value(height)).current;

  React.useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  }, []);

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: height,
      duration: 300,
      useNativeDriver: true,
    }).start(onClose);
  };

  const getDistance = () => {
    if (!userLocation) return null;
    const distance = Math.sqrt(
      Math.pow(userLocation.latitude - zone.center_lat, 2) +
      Math.pow(userLocation.longitude - zone.center_lng, 2)
    ) * 111000; // Rough conversion to meters
    return formatDistance(distance);
  };

  const getZoneStatus = () => {
    if (!zone.is_claimed) return { text: 'Unclaimed', color: COLORS.textSecondary };
    if (zone.owner) return { text: `Owned by ${zone.owner.username}`, color: COLORS.error };
    return { text: 'Claimed', color: COLORS.success };
  };

  const status = getZoneStatus();
  const distance = getDistance();

  return (
    <Modal transparent visible animationType="none">
      <BlurView intensity={50} style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={handleClose} />
        <Animated.View
          style={[
            styles.container,
            { transform: [{ translateY: slideAnim }] }
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Text style={styles.zoneName}>{zone.name || `Zone ${zone.id.slice(-6)}`}</Text>
              <Text style={[styles.status, { color: status.color }]}>{status.text}</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <Ionicons name="close" size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Zone Info */}
          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Ionicons name="shield" size={20} color={COLORS.primary} />
                <Text style={styles.infoLabel}>Level</Text>
                <Text style={styles.infoValue}>{zone.level}</Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="flash" size={20} color={COLORS.warning} />
                <Text style={styles.infoLabel}>Defense</Text>
                <Text style={styles.infoValue}>{zone.defense_points}</Text>
              </View>
              {distance && (
                <View style={styles.infoItem}>
                  <Ionicons name="location" size={20} color={COLORS.success} />
                  <Text style={styles.infoLabel}>Distance</Text>
                  <Text style={styles.infoValue}>{distance}</Text>
                </View>
              )}
            </View>

            {zone.last_attacked && (
              <View style={styles.lastAttackedContainer}>
                <Ionicons name="time" size={16} color={COLORS.textSecondary} />
                <Text style={styles.lastAttackedText}>
                  Last attacked {formatTimeAgo(zone.last_attacked)}
                </Text>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.secondaryButton]}
              onPress={onViewDetails}
            >
              <Ionicons name="information-circle" size={20} color={COLORS.primary} />
              <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>
                Details
              </Text>
            </TouchableOpacity>            {canClaimZone(zone) && (
              <TouchableOpacity
                style={[styles.actionButton, styles.primaryButton]}
                onPress={onClaim}
              >
                <Ionicons name="flag" size={20} color={COLORS.textOnPrimary} />
                <Text style={[styles.actionButtonText, styles.primaryButtonText]}>
                  Claim Zone
                </Text>
              </TouchableOpacity>
            )}

            {canCheckIntoZone(zone) && (
              <TouchableOpacity
                style={[styles.actionButton, styles.successButton]}
                onPress={onCheckIn}
              >
                <Ionicons name="checkmark-circle" size={20} color={COLORS.textOnSuccess} />
                <Text style={[styles.actionButtonText, styles.successButtonText]}>
                  Check In
                </Text>
              </TouchableOpacity>
            )}

            {canAttackZone(zone) && (
              <TouchableOpacity
                style={[styles.actionButton, styles.dangerButton]}
                onPress={onAttack}
              >
                <Ionicons name="flash" size={20} color={COLORS.textOnError} />
                <Text style={[styles.actionButtonText, styles.dangerButtonText]}>
                  Attack
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      </BlurView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  container: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34, // Safe area
    maxHeight: height * 0.6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  titleContainer: {
    flex: 1,
  },
  zoneName: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  status: {
    fontSize: 14,
    fontWeight: '500',
  },
  closeButton: {
    padding: 8,
  },
  infoContainer: {
    padding: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  infoItem: {
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  lastAttackedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
  },
  lastAttackedText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  actionsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
  },
  primaryButtonText: {
    color: COLORS.textOnPrimary,
  },
  secondaryButton: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  secondaryButtonText: {
    color: COLORS.primary,
  },
  successButton: {
    backgroundColor: COLORS.success,
  },
  successButtonText: {
    color: COLORS.textOnSuccess,
  },
  dangerButton: {
    backgroundColor: COLORS.error,
  },
  dangerButtonText: {
    color: COLORS.textOnError,
  },
});
