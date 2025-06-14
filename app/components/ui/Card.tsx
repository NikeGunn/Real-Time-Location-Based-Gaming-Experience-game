import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { COLORS, TYPOGRAPHY, BORDER_RADIUS, SPACING, SHADOW } from '../../utils/constants';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  onPress?: () => void;
  style?: any;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  onPress,
  style,
}) => {
  const CardComponent = onPress ? TouchableOpacity : View;

  return (
    <CardComponent
      style={[styles.card, style]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {title && <Text style={styles.title}>{title}</Text>}
      {children}
    </CardComponent>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.WHITE,
    borderRadius: BORDER_RADIUS.LG,
    padding: SPACING.MD,
    marginVertical: SPACING.SM,
    ...SHADOW.MEDIUM,
  },
  title: {
    ...TYPOGRAPHY.HEADLINE,
    color: COLORS.DARK,
    marginBottom: SPACING.SM,
  },
});
