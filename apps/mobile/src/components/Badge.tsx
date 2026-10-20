import React from 'react';
import { View, Text, ViewStyle } from 'react-native';
import { defaultTheme } from '../theme';

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'brand';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'info',
  style,
}) => {
  const { colors, typography, radii } = defaultTheme;

  const getColors = () => {
    switch (variant) {
      case 'success':
        return {
          bg: colors.semantic.successBackground,
          text: colors.semantic.success,
          border: 'rgba(16, 185, 129, 0.25)',
        };
      case 'warning':
        return {
          bg: colors.semantic.warningBackground,
          text: colors.semantic.warning,
          border: 'rgba(245, 158, 11, 0.25)',
        };
      case 'danger':
        return {
          bg: colors.semantic.dangerBackground,
          text: colors.semantic.danger,
          border: 'rgba(239, 68, 68, 0.25)',
        };
      case 'brand':
        return {
          bg: colors.brand.tint,
          text: colors.brand.primary,
          border: 'rgba(91, 77, 255, 0.25)',
        };
      case 'info':
      default:
        return {
          bg: colors.surface.pressed,
          text: colors.text.secondary,
          border: colors.border.subtle,
        };
    }
  };

  const scheme = getColors();

  return (
    <View
      style={[
        {
          backgroundColor: scheme.bg,
          borderColor: scheme.border,
          borderWidth: 1,
          borderRadius: radii.pill,
          paddingHorizontal: 10,
          paddingVertical: 4,
          alignSelf: 'flex-start',
        },
        style,
      ]}
    >
      <Text
        style={{
          color: scheme.text,
          fontSize: typography.scale.caption.fontSize,
          fontWeight: '700',
          letterSpacing: 0.3,
        }}
      >
        {label}
      </Text>
    </View>
  );
};
