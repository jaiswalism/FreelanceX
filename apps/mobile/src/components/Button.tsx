import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  StyleSheet,
} from 'react-native';
import { defaultTheme } from '../theme';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'destructive' | 'soft';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
}) => {
  const { colors, typography, radii } = defaultTheme;

  const getContainerStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      height: 50,
      borderRadius: radii.medium,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 22,
      flexDirection: 'row',
    };

    if (disabled) {
      return {
        ...baseStyle,
        backgroundColor: colors.surface.pressed,
        borderWidth: 1,
        borderColor: colors.border.subtle,
      };
    }

    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          backgroundColor: colors.brand.primary,
          shadowColor: colors.brand.primary,
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.25,
          shadowRadius: 12,
          elevation: 4,
        };
      case 'secondary':
        return {
          ...baseStyle,
          backgroundColor: colors.surface.default,
          borderWidth: 1,
          borderColor: colors.border.default,
        };
      case 'soft':
        return {
          ...baseStyle,
          backgroundColor: colors.brand.tint,
        };
      case 'outline':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: 1.5,
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
      fontWeight: '700',
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
          color: '#FFFFFF',
        };
      case 'secondary':
        return {
          ...baseText,
          color: colors.text.primary,
        };
      case 'soft':
      case 'outline':
        return {
          ...baseText,
          color: colors.brand.primary,
        };
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.82}
      onPress={onPress}
      disabled={disabled || loading}
      style={[getContainerStyle(), style]}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' || variant === 'destructive' ? '#FFFFFF' : colors.brand.primary}
          size="small"
        />
      ) : (
        <>
          {icon ? <Text style={styles.iconContainer}>{icon}</Text> : null}
          <Text style={[getTextStyle(), textStyle]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    marginRight: 8,
  },
});
