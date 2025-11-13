import React from 'react';
import { StyleProp, StyleSheet, Text, TextInput, TextInputProps, View, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';

interface Props extends TextInputProps {
  label: string;
  helperText?: string;
  error?: boolean; // ถ้าเป็น true จะแสดง helperText เป็นสีแดง
  containerStyle?: StyleProp<ViewStyle>;
}

export const FormField: React.FC<Props> = ({ label, helperText, error, style, containerStyle, ...inputProps }) => {
  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.muted}
        style={[styles.input, error && styles.inputError, style]}
        {...inputProps}
      />
      {helperText ? <Text style={[styles.helper, error && styles.helperError]}>{helperText}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: colors.card,
  },
  inputError: {
    borderColor: colors.danger,
  },
  helper: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 4,
  },
  helperError: {
    color: colors.danger,
  },
});
