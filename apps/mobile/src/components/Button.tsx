import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { defaultTheme } from '../theme/index.js';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'destructive';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  textStyle,
}) => {
  const { colors, typography, radii } = defaultTheme;

  const getContainerStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      height: 48,
      borderRadius: radii.default,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
      flexDirection: 'row',
    };

    if (disabled) {
      return {
        ...baseStyle,
        backgroundColor: colors.surface.raised,
        borderWidth: 1,
        borderColor: colors.border.subtle,
      };
    }

    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          backgroundColor: colors.brand.primary,
        };
      case 'secondary':
        return {
          ...baseStyle,
          backgroundColor: colors.surface.raised,
          borderWidth: 1,
          borderColor: colors.border.default,
        };
      case 'outline':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: colors.brand.primary,
        };
      case 'destructive':
        return {
          ...baseStyle,
          backgroundColor: colors.semantic.danger,
        };
    }
  };

  const getTextStyle = (): TextStyle => {
    const baseText: TextStyle = {
      fontSize: typography.scale.bodyMedium.fontSize,
      fontWeight: '600',
    };

    if (disabled) {
      return {
        ...baseText,
        color: colors.text.disabled,
      };
    }

    switch (variant) {
      case 'primary':
      case 'destructive':
        return {
          ...baseText,
          color: '#090909',
        };
      case 'secondary':
        return {
          ...baseText,
          color: colors.text.primary,
        };
      case 'outline':
        return {
          ...baseText,
          color: colors.brand.primary,
        };
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[getContainerStyle(), style]}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' || variant === 'destructive' ? '#090909' : colors.brand.primary}
          size="small"
        />
      ) : (
        <Text style={[getTextStyle(), textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};
