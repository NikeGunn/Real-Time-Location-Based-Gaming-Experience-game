import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { COLORS, TYPOGRAPHY, BORDER_RADIUS, SPACING, SHADOW } from '../../utils/constants';
import { Button } from './Button';

interface ActionModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message?: string;
  actions: Array<{
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'danger' | 'success';
    loading?: boolean;
  }>;
  showCloseButton?: boolean;
}

export const ActionModal: React.FC<ActionModalProps> = ({
  visible,
  onClose,
  title,
  message,
  actions,
  showCloseButton = true,
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modal}>
              <Text style={styles.title}>{title}</Text>

              {message && (
                <Text style={styles.message}>{message}</Text>
              )}

              <View style={styles.actions}>
                {actions.map((action, index) => (
                  <Button
                    key={index}
                    title={action.title}
                    onPress={action.onPress}
                    variant={action.variant || 'primary'}
                    loading={action.loading}
                    style={[
                      styles.actionButton,
                      index > 0 && styles.actionButtonSpacing,
                    ]}
                  />
                ))}
              </View>

              {showCloseButton && (
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={onClose}
                >
                  <Text style={styles.closeButtonText}>Cancel</Text>
                </TouchableOpacity>
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.LG,
  },
  modal: {
    backgroundColor: COLORS.WHITE,
    borderRadius: BORDER_RADIUS.LG,
    padding: SPACING.LG,
    width: '100%',
    maxWidth: 340,
    ...SHADOW.LARGE,
  },
  title: {
    ...TYPOGRAPHY.HEADLINE,
    color: COLORS.DARK,
    textAlign: 'center',
    marginBottom: SPACING.MD,
  },
  message: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.GRAY,
    textAlign: 'center',
    marginBottom: SPACING.LG,
    lineHeight: 22,
  },
  actions: {
    marginBottom: SPACING.MD,
  },
  actionButton: {
    width: '100%',
  },
  actionButtonSpacing: {
    marginTop: SPACING.SM,
  },
  closeButton: {
    alignItems: 'center',
    paddingVertical: SPACING.SM,
  },
  closeButtonText: {
    ...TYPOGRAPHY.CALLOUT,
    color: COLORS.GRAY,
  },
});
