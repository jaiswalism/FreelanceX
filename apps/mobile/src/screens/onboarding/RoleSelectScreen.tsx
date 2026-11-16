import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { defaultTheme } from '../../theme';
import { Icon } from '../../components/Icon';
import { Button } from '../../components/Button';
import { WalletService, AccountRole } from '../../services/wallet/walletService';

interface RoleSelectScreenProps {
  walletAddress: string;
  providerName: string;
  onRoleSelected: (role: AccountRole) => void;
}

export const RoleSelectScreen: React.FC<RoleSelectScreenProps> = ({
  walletAddress,
  providerName,
  onRoleSelected,
}) => {
  const { colors, radii } = defaultTheme;
  const [selectedRole, setSelectedRole] = useState<AccountRole>('freelancer');
  const [loading, setLoading] = useState<boolean>(false);

  const truncatedAddress = walletAddress
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : '';

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await WalletService.setRole(selectedRole);
      onRoleSelected(selectedRole);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.app }]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background.app} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Top Wallet Pill */}
        <View style={styles.topPillWrap}>
          <View style={styles.walletPill}>
            <View style={styles.statusDot} />
            <Text style={styles.walletText}>
              {providerName || 'Wallet'}: {truncatedAddress}
            </Text>
          </View>
        </View>

        {/* Title */}
        <View style={styles.titleWrap}>
          <Text style={[styles.title, { color: colors.text.primary }]}>
            How will you use FreelancerX?
          </Text>
          <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
            Choose your primary role. You can switch this at any time in your wallet settings.
          </Text>
        </View>

        {/* Role Cards */}
        <View style={styles.cardsWrap}>
          {/* Client Card */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setSelectedRole('client')}
            style={[
              styles.roleCard,
              { borderRadius: radii.card },
              selectedRole === 'client' && styles.roleCardActive,
            ]}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.cardIconWrap, { backgroundColor: '#EEF0FF' }]}>
                <Icon name="briefcase" size={24} color={colors.brand.primary} />
              </View>
              <View
                style={[
                  styles.radioCircle,
                  selectedRole === 'client' && styles.radioCircleActive,
                ]}
              >
                {selectedRole === 'client' && <View style={styles.radioInner} />}
              </View>
            </View>

            <Text style={[styles.roleName, { color: colors.text.primary }]}>
              I want to Hire (Client)
            </Text>
            <Text style={[styles.roleDescription, { color: colors.text.secondary }]}>
              Post gigs, fund smart contract escrows with USDC, and approve completed deliverables.
            </Text>

            <View style={styles.bulletList}>
              <View style={styles.bulletItem}>
                <Icon name="check" size={14} color="#10B981" />
                <Text style={styles.bulletText}>Post new gigs & milestone scopes</Text>
              </View>
              <View style={styles.bulletItem}>
                <Icon name="check" size={14} color="#10B981" />
                <Text style={styles.bulletText}>Review proposals & escrow funds</Text>
              </View>
              <View style={styles.bulletItem}>
                <Icon name="check" size={14} color="#10B981" />
                <Text style={styles.bulletText}>Authorize on-chain payout releases</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Freelancer Card */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setSelectedRole('freelancer')}
            style={[
              styles.roleCard,
              { borderRadius: radii.card },
              selectedRole === 'freelancer' && styles.roleCardActive,
            ]}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.cardIconWrap, { backgroundColor: '#E8FAF3' }]}>
                <Icon name="user" size={24} color="#10B981" />
              </View>
              <View
                style={[
                  styles.radioCircle,
                  selectedRole === 'freelancer' && styles.radioCircleActive,
                ]}
              >
                {selectedRole === 'freelancer' && <View style={styles.radioInner} />}
              </View>
            </View>

            <Text style={[styles.roleName, { color: colors.text.primary }]}>
              I want to Work (Freelancer)
            </Text>
            <Text style={[styles.roleDescription, { color: colors.text.secondary }]}>
              Explore verified gigs, apply with milestone proposals, submit deliverables, and get paid instantly.
            </Text>

            <View style={styles.bulletList}>
              <View style={styles.bulletItem}>
                <Icon name="check" size={14} color="#10B981" />
                <Text style={styles.bulletText}>Apply to jobs & quote milestone pricing</Text>
              </View>
              <View style={styles.bulletItem}>
                <Icon name="check" size={14} color="#10B981" />
                <Text style={styles.bulletText}>Work with guaranteed locked escrow funds</Text>
              </View>
              <View style={styles.bulletItem}>
                <Icon name="check" size={14} color="#10B981" />
                <Text style={styles.bulletText}>Instant USDC disbursements to your wallet</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Action Button */}
        <View style={styles.bottomCta}>
          <Button
            title={`Enter FreelancerX as ${selectedRole === 'client' ? 'Client' : 'Freelancer'}`}
            onPress={handleConfirm}
            loading={loading}
          />
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
  },
  topPillWrap: {
    alignItems: 'center',
    marginBottom: 20,
  },
  walletPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  walletText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
  },
  titleWrap: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.4,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  cardsWrap: {
    gap: 16,
    marginBottom: 28,
  },
  roleCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderWidth: 2,
    borderColor: '#EEF0F8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  roleCardActive: {
    borderColor: '#5B4DFF',
    backgroundColor: '#FAFAFF',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleActive: {
    borderColor: '#5B4DFF',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#5B4DFF',
  },
  roleName: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
  },
  roleDescription: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 14,
  },
  bulletList: {
    gap: 8,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bulletText: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '500',
  },
  bottomCta: {
    marginTop: 8,
  },
});

