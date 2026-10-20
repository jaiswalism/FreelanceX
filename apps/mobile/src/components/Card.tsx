import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { defaultTheme } from '../theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  variant?: 'default' | 'raised' | 'elevated' | 'hero' | 'flat';
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  variant = 'default',
}) => {
  const { colors, radii, spacing } = defaultTheme;

  const isHero = variant === 'hero';

  return (
    <View
      style={[
        styles.baseCard,
        {
          backgroundColor: isHero ? colors.brand.primary : colors.surface.default,
          borderColor: isHero ? colors.brand.soft : colors.border.subtle,
          borderRadius: radii.large,
          padding: spacing.layout.standardContentPadding,
        },
        !isHero && styles.shadow,
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  baseCard: {
    borderWidth: 1,
  },
  shadow: {
    shadowColor: '#5B4DFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 3,
  },
});
