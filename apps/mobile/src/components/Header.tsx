import React from 'react';
import { View, Text, ViewStyle, TouchableOpacity } from 'react-native';
import { defaultTheme } from '../theme';
import { Icon } from './Icon';

interface HeaderProps {
  title: string;
  subtitle?: string;
  walletAddress?: string;
  networkName?: string;
  onBack?: () => void;
  style?: ViewStyle;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  walletAddress,
  onBack,
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
          backgroundColor: '#FFFFFF',
          borderBottomWidth: 1,
          borderBottomColor: colors.border.subtle,
          paddingHorizontal: spacing.layout.screenHorizontalPadding,
          paddingTop: 14,
          paddingBottom: 14,
          shadowColor: '#5B4DFF',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.03,
          shadowRadius: 8,
          elevation: 2,
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
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          {onBack && (
            <TouchableOpacity
              onPress={onBack}
              activeOpacity={0.7}
              style={{
                width: 38,
                height: 38,
                borderRadius: 19,
                backgroundColor: '#F0EEFF',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
              }}
            >
              <Icon name="arrowLeft" size={18} color={colors.brand.primary} strokeWidth={2.5} />
            </TouchableOpacity>
          )}
          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: colors.text.primary,
                fontSize: 18,
                fontWeight: '700',
                letterSpacing: -0.3,
              }}
              numberOfLines={1}
            >
              {title}
            </Text>
            {subtitle && (
              <Text
                style={{
                  color: colors.text.secondary,
                  fontSize: 12,
                  marginTop: 2,
                }}
                numberOfLines={1}
              >
                {subtitle}
              </Text>
            )}
          </View>
        </View>

        {walletAddress && (
          <View style={{ alignItems: 'flex-end' }}>
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
          </View>
        )}
      </View>
    </View>
  );
};
