import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';
import { defaultTheme } from '../../theme';
import { Icon } from '../../components/Icon';
import { Button } from '../../components/Button';

interface OnboardingScreenProps {
  onGetStarted: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onGetStarted }) => {
  const { colors, radii } = defaultTheme;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.app }]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background.app} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Top Network Pill */}
        <View style={styles.topHeader}>
          <View style={styles.networkBadge}>
            <Text style={styles.networkDot}>●</Text>
            <Text style={styles.networkText}>Ethereum Sepolia Testnet</Text>
          </View>
        </View>

        {/* Hero Section */}
        <View style={styles.heroWrap}>
          <View style={[styles.iconCircle, { backgroundColor: '#EEF0FF' }]}>
            <Icon name="shield" size={44} color={colors.brand.primary} strokeWidth={2.5} />
          </View>
          <Text style={[styles.title, { color: colors.text.primary }]}>FreelancerX</Text>
          <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
            Trustless Milestone Escrow on Ethereum
          </Text>
        </View>

        {/* Feature Cards */}
        <View style={styles.featuresList}>
          <View style={[styles.featureCard, { borderRadius: radii.card }]}>
            <View style={[styles.featureIconWrap, { backgroundColor: '#E8FAF3' }]}>
              <Icon name="lock" size={20} color="#10B981" />
            </View>
            <View style={styles.featureTextWrap}>
              <Text style={[styles.featureTitle, { color: colors.text.primary }]}>
                100% On-Chain Escrow
              </Text>
              <Text style={[styles.featureDesc, { color: colors.text.secondary }]}>
                Clients fund milestones upfront into audited smart contracts. No payment defaults.
              </Text>
            </View>
          </View>

          <View style={[styles.featureCard, { borderRadius: radii.card }]}>
            <View style={[styles.featureIconWrap, { backgroundColor: '#EFF6FF' }]}>
              <Icon name="dollar" size={20} color="#2563EB" />
            </View>
            <View style={styles.featureTextWrap}>
              <Text style={[styles.featureTitle, { color: colors.text.primary }]}>
                Instant USDC Payouts
              </Text>
              <Text style={[styles.featureDesc, { color: colors.text.secondary }]}>
                Funds disburse directly to your wallet upon milestone approval. Zero platform holds.
              </Text>
            </View>
          </View>

          <View style={[styles.featureCard, { borderRadius: radii.card }]}>
            <View style={[styles.featureIconWrap, { backgroundColor: '#FFF4ED' }]}>
              <Icon name="sparkles" size={20} color="#EA580C" />
            </View>
            <View style={styles.featureTextWrap}>
              <Text style={[styles.featureTitle, { color: colors.text.primary }]}>
                Verifiable Reputation
              </Text>
              <Text style={[styles.featureDesc, { color: colors.text.secondary }]}>
                Every delivered project and rating is permanently recorded on Ethereum Sepolia.
              </Text>
            </View>
          </View>
        </View>

        {/* Supported Wallets Row */}
        <View style={styles.walletsRow}>
          <Text style={styles.walletsLabel}>Supported Wallets:</Text>
          <View style={styles.walletBadges}>
            <Text style={styles.walletPill}>🦊 MetaMask</Text>
            <Text style={styles.walletPill}>🛡️ Trust</Text>
            <Text style={styles.walletPill}>🔵 Coinbase</Text>
            <Text style={styles.walletPill}>🌈 Rainbow</Text>
          </View>
        </View>

        {/* Bottom CTA */}
        <View style={styles.ctaWrap}>
          <Button
            title="Connect Wallet to Get Started"
            onPress={onGetStarted}
            style={styles.ctaButton}
          />
          <Text style={styles.securityNote}>
            🔒 Your private keys never leave your wallet app
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
    justifyContent: 'space-between',
  },
  topHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  networkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8FAF3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  networkDot: {
    color: '#10B981',
    fontSize: 10,
  },
  networkText: {
    color: '#065F46',
    fontSize: 12,
    fontWeight: '700',
  },
  heroWrap: {
    alignItems: 'center',
    marginBottom: 28,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#5B4DFF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 22,
  },
  featuresList: {
    gap: 12,
    marginBottom: 24,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderWidth: 1,
    borderColor: '#EEF0F8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
    gap: 14,
  },
  featureIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureTextWrap: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: 12,
    lineHeight: 18,
  },
  walletsRow: {
    alignItems: 'center',
    marginBottom: 24,
    gap: 8,
  },
  walletsLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  walletBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  walletPill: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  ctaWrap: {
    gap: 10,
    alignItems: 'center',
  },
  ctaButton: {
    width: '100%',
    height: 52,
    borderRadius: 14,
  },
  securityNote: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});
