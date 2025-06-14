import React, { useEffect } from 'react';
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
import { UINotification } from '../../types/notifications';

const { width } = Dimensions.get('window');

interface NotificationModalProps {
  notification: UINotification;
  visible: boolean;
  onClose: () => void;
  autoCloseDuration?: number;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  notification,
  visible,
  onClose,
  autoCloseDuration = 5000,
}) => {
  const slideAnim = React.useRef(new Animated.Value(-100)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Slide in animation
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto close after duration
      const timer = setTimeout(() => {
        handleClose();
      }, autoCloseDuration);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(onClose);
  };

  const getNotificationIcon = () => {
    switch (notification.type) {
      case 'zone_attack':
        return 'flash';
      case 'zone_captured':
        return 'flag';
      case 'battle_result':
        return 'trophy';
      case 'level_up':
        return 'star';
      default:
        return 'notifications';
    }
  };

  const getNotificationColor = () => {
    switch (notification.type) {
      case 'zone_attack':
        return COLORS.error;
      case 'zone_captured':
        return COLORS.success;
      case 'battle_result':
        return COLORS.warning;
      case 'level_up':
        return COLORS.primary;
      default:
        return COLORS.primary;
    }
  };

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none">
      <Animated.View style={[styles.overlay, { opacity: opacityAnim }]}>
        <Animated.View
          style={[
            styles.container,
            { transform: [{ translateY: slideAnim }] }
          ]}
        >
          <BlurView intensity={90} tint="light" style={styles.blurContainer}>
            <View style={styles.content}>
              <View style={styles.header}>
                <View style={[styles.iconContainer, { backgroundColor: getNotificationColor() }]}>
                  <Ionicons
                    name={getNotificationIcon() as any}
                    size={20}
                    color={COLORS.textOnPrimary}
                  />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.title}>{notification.title}</Text>
                  <Text style={styles.message}>{notification.message}</Text>
                </View>
                <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                  <Ionicons name="close" size={20} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>

              {notification.data?.action && (
                <TouchableOpacity style={styles.actionButton} onPress={handleClose}>
                  <Text style={styles.actionButtonText}>View Details</Text>
                </TouchableOpacity>
              )}
            </View>
          </BlurView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 50,
    paddingHorizontal: 16,
  },
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  blurContainer: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  message: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  closeButton: {
    padding: 4,
  },
  actionButton: {
    marginTop: 12,
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  actionButtonText: {
    color: COLORS.textOnPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
});
