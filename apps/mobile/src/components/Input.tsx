import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  TextInputProps,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { defaultTheme } from '../theme/index.js';

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
  const [isFocused, setIsFocused] = useState(false);
  const { colors, typography, radii } = defaultTheme;

  return (
    <View style={[{ marginBottom: 16 }, containerStyle]}>
      {label && (
        <Text
          style={{
            color: colors.text.secondary,
            fontSize: typography.scale.label.fontSize,
            fontWeight: '600',
            marginBottom: 6,
          }}
        >
          {label}
        </Text>
      )}
      <TextInput
        placeholderTextColor={colors.text.disabled}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={[
          {
            backgroundColor: colors.surface.default,
            borderWidth: 1,
            borderColor: error
              ? colors.semantic.danger
              : isFocused
              ? colors.brand.primary
              : colors.border.default,
            borderRadius: radii.default,
            color: colors.text.primary,
            paddingHorizontal: 14,
            paddingVertical: 12,
            fontSize: typography.scale.body.fontSize,
          },
          style,
        ]}
        {...props}
      />
      {error && (
        <Text
          style={{
            color: colors.semantic.danger,
            fontSize: typography.scale.caption.fontSize,
            marginTop: 4,
          }}
        >
          {error}
        </Text>
      )}
    </View>
  );
};
