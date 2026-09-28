import React from 'react';
import { View, Text, ViewStyle } from 'react-native';
import { defaultTheme } from '../theme/index.js';
import { Badge } from './Badge.js';

interface HeaderProps {
  title: string;
  subtitle?: string;
  walletAddress?: string;
  networkName?: string;
  style?: ViewStyle;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  walletAddress,
  networkName = 'Base Sepolia',
  style,
}) => {
  const { colors, typography, spacing } = defaultTheme;

  const formatAddress = (addr: string) => {
    if (addr.length <= 10) return addr;
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  return (
    <View
      style={[
        {
          backgroundColor: colors.background.secondary,
          borderBottomWidth: 1,
          borderBottomColor: colors.border.default,
          paddingHorizontal: spacing.layout.screenHorizontalPadding,
          paddingTop: 16,
          paddingBottom: 16,
        },
        style,
      ]}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: colors.text.primary,
              fontSize: typography.scale.heading2.fontSize,
              fontWeight: '700',
              letterSpacing: -0.3,
            }}
          >
            {title}
          </Text>
          {subtitle && (
            <Text
              style={{
                color: colors.text.secondary,
                fontSize: typography.scale.caption.fontSize,
                marginTop: 2,
              }}
            >
              {subtitle}
            </Text>
          )}
        </View>

        <View style={{ alignItems: 'flex-end', gap: 4 }}>
          <Badge label={networkName} variant="brand" />
          {walletAddress && (
            <Text
              style={{
                color: colors.special.verified,
                fontFamily: typography.fontFamily.numeric,
                fontSize: typography.scale.micro.fontSize,
                fontWeight: '600',
              }}
            >
              {formatAddress(walletAddress)}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};
