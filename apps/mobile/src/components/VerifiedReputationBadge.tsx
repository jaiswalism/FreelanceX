import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { defaultTheme } from '../theme';

interface VerifiedReputationBadgeProps {
  score?: number;
  isVerified?: boolean;
}

export const VerifiedReputationBadge: React.FC<VerifiedReputationBadgeProps> = ({
  score = 50,
  isVerified = true,
}) => {
  const { colors } = defaultTheme;

  return (
    <View style={[styles.container, { borderColor: colors.brand.primary }]}>
      <View style={styles.badgeRow}>
        <Text style={styles.icon}>🛡️</Text>
        <Text style={[styles.scoreText, { color: colors.text.primary }]}>
          Reputation: {score}/100
        </Text>
        {isVerified && (
          <View style={styles.verifiedTag}>
            <Text style={[styles.verifiedText, { color: colors.semantic.success }]}>
              ✓ On-Chain Verified
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#161616',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: 12,
    marginRight: 4,
  },
  scoreText: {
    fontSize: 12,
    fontWeight: '700',
  },
  verifiedTag: {
    backgroundColor: 'rgba(94, 230, 181, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '600',
  },
});
