import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { defaultTheme } from '../theme';
import { Icon } from './Icon';

interface VerifiedReputationBadgeProps {
  score?: number;
  isVerified?: boolean;
}

export const VerifiedReputationBadge: React.FC<VerifiedReputationBadgeProps> = ({
  score = 88,
  isVerified = true,
}) => {
  const { colors, radii } = defaultTheme;

  return (
    <View style={[styles.container, { borderColor: colors.border.subtle, borderRadius: radii.medium }]}>
      <View style={styles.badgeRow}>
        <View style={styles.iconCircle}>
          <Icon name="sparkles" size={14} color={colors.brand.primary} />
        </View>
        <Text style={[styles.scoreText, { color: colors.text.primary }]}>
          Score: {score}
        </Text>
        {isVerified && (
          <View style={[styles.verifiedTag, { backgroundColor: colors.semantic.successBackground, borderRadius: radii.pill }]}>
            <Icon name="shield" size={12} color={colors.semantic.success} style={{ marginRight: 4 }} />
            <Text style={[styles.verifiedText, { color: colors.semantic.success }]}>
              Verified Escrow
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignSelf: 'flex-start',
    shadowColor: '#5B4DFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F0EEFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  scoreText: {
    fontSize: 13,
    fontWeight: '700',
  },
  verifiedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginLeft: 10,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
