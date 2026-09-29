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
          border: 'rgba(94, 230, 181, 0.3)',
        };
      case 'warning':
        return {
          bg: colors.semantic.warningBackground,
          text: colors.semantic.warning,
          border: 'rgba(245, 185, 66, 0.3)',
        };
      case 'danger':
        return {
          bg: colors.semantic.dangerBackground,
          text: colors.semantic.danger,
          border: 'rgba(255, 92, 92, 0.3)',
        };
      case 'brand':
        return {
          bg: colors.brand.tint,
          text: colors.brand.primary,
          border: 'rgba(255, 106, 0, 0.3)',
        };
      case 'info':
      default:
        return {
          bg: colors.surface.raised,
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
          paddingHorizontal: 8,
          paddingVertical: 3,
          alignSelf: 'flex-start',
        },
        style,
      ]}
    >
      <Text
        style={{
          color: scheme.text,
          fontSize: typography.scale.caption.fontSize,
          fontWeight: '600',
        }}
      >
        {label}
      </Text>
    </View>
  );
};
