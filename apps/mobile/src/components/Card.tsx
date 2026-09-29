import React from 'react';
import { View, ViewStyle } from 'react-native';
import { defaultTheme } from '../theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'raised' | 'elevated';
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  variant = 'default',
}) => {
  const { colors, radii, spacing } = defaultTheme;

  const getBgColor = () => {
    switch (variant) {
      case 'raised':
        return colors.surface.raised;
      case 'elevated':
        return colors.background.elevated;
      default:
        return colors.surface.default;
    }
  };

  return (
    <View
      style={[
        {
          backgroundColor: getBgColor(),
          borderColor: colors.border.default,
          borderWidth: 1,
          borderRadius: radii.medium,
          padding: spacing.layout.standardContentPadding,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};
