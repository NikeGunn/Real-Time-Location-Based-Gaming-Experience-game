import React from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { COLORS, TYPOGRAPHY, BORDER_RADIUS, SPACING } from '../../utils/constants';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  containerStyle,
  style,
  ...props
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          error && styles.inputError,
          style,
        ]}
        placeholderTextColor={COLORS.GRAY}
        {...props}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.SM,
  },
  label: {
    ...TYPOGRAPHY.SUBHEAD,
    color: COLORS.DARK,
    marginBottom: SPACING.XS,
    fontWeight: '600',
  },
  input: {
    ...TYPOGRAPHY.BODY,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_GRAY,
    borderRadius: BORDER_RADIUS.MD,
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.MD,
    backgroundColor: COLORS.WHITE,
    color: COLORS.DARK,
    minHeight: 44,
  },
  inputError: {
    borderColor: COLORS.DANGER,
  },
  error: {
    ...TYPOGRAPHY.FOOTNOTE,
    color: COLORS.DANGER,
    marginTop: SPACING.XS,
  },
});
