import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Share,
} from 'react-native';
import { defaultTheme } from '../../theme';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Icon } from '../../components/Icon';
import { Button } from '../../components/Button';
import { WalletService, WalletState } from '../../services/wallet/walletService';

interface WalletScreenProps {
  onDisconnect?: () => void;
  onRoleChanged?: () => void;
  onEditProfile?: () => void;
}

export const WalletScreen: React.FC<WalletScreenProps> = ({
  onDisconnect,
  onRoleChanged,
  onEditProfile,
}) => {
  const { colors, radii } = defaultTheme;
  const [wallet, setWallet] = useState<WalletState>(WalletService.getState());
  const [loading, setLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = WalletService.subscribe((state) => {
      setWallet(state);
    });
    WalletService.refreshBalances().catch(() => {});
    return () => {
      unsubscribe();
    };
  }, []);

  const handleRefresh = async () => {
    try {
      setLoading(true);
      await WalletService.refreshBalances();
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (wallet.address) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      try {
        await Share.share({ message: wallet.address });
      } catch {
        // ignore
      }
    }
  };

  const handleViewOnExplorer = () => {
    if (wallet.address) {
      Linking.openURL(`https://sepolia.etherscan.io/address/${wallet.address}`);
    }
  };

  const handleToggleRole = async () => {
    const newRole = wallet.role === 'client' ? 'freelancer' : 'client';
    await WalletService.setRole(newRole);
    if (onRoleChanged) onRoleChanged();
    Alert.alert(
      'Role Switched',
      `You are now browsing FreelancerX as a ${newRole === 'client' ? 'Client (Funder)' : 'Freelancer (Builder)'}. Your navigation has been updated!`
    );
  };

  const handleDisconnect = async () => {
    Alert.alert(
      'Disconnect Wallet',
      'Are you sure you want to disconnect your wallet session?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            await WalletService.disconnect();
            if (onDisconnect) onDisconnect();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.app }]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background.app} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Top Header */}
        <View style={styles.topBar}>
          <View>
            <Text style={[styles.screenTitle, { color: colors.text.primary }]}>
              Web3 Escrow Wallet
            </Text>
            <Text style={[styles.screenSubtitle, { color: colors.text.secondary }]}>
              Verified Escrow & Payments
            </Text>
          </View>
          <View style={styles.networkBadge}>
            <Text style={styles.networkDot}>●</Text>
            <Text style={styles.networkName}>
              {wallet.latencyMs ? `${wallet.latencyMs}ms` : 'Connected'}
            </Text>
          </View>
        </View>

        {/* Hero Balance Card */}
        <View
          style={[
            styles.heroCard,
            { backgroundColor: colors.brand.primary, borderRadius: radii.card },
          ]}
        >
          <View style={styles.heroTop}>
            <View style={styles.walletLabelWrap}>
              <Icon name="shield" size={16} color="rgba(255, 255, 255, 0.9)" />
              <Text style={styles.walletAccountLabel} numberOfLines={1}>
                {wallet.providerName || 'EVM Wallet'}
              </Text>
            </View>
            <View style={styles.roleTag}>
              <Text style={styles.roleTagText}>
                {wallet.role === 'client' ? 'CLIENT MODE' : 'FREELANCER MODE'}
              </Text>
            </View>
          </View>

          <View style={styles.balanceSection}>
            <Text style={styles.balancePrefix}>$</Text>
            <Text style={styles.balanceAmount}>{wallet.usdcBalance || '0.00'}</Text>
            <Text style={styles.balanceUnit}>USDC</Text>
          </View>

          <View style={styles.secondaryBalanceRow}>
            <Text style={styles.ethBalanceText}>
              Gas: {wallet.ethBalance || '0.0000'} ETH
            </Text>
            {wallet.blockNumber && (
              <Text style={styles.blockText}>Block #{wallet.blockNumber}</Text>
            )}
          </View>

          <View style={styles.heroActionRow}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleRefresh}
              style={styles.heroBtnPrimary}
            >
              <Icon name="clock" size={14} color={colors.brand.primary} />
              <Text style={[styles.heroBtnPrimaryText, { color: colors.brand.primary }]}>
                {loading ? 'Refreshing...' : 'Refresh Balance'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleViewOnExplorer}
              style={styles.heroBtnSecondary}
            >
              <Icon name="externalLink" size={14} color="#FFFFFF" />
              <Text style={styles.heroBtnSecondaryText}>Etherscan</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Connected Account Card */}
        <Card style={styles.accountCard}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: colors.text.primary }]}>
              Connected Account
            </Text>
            <Badge label="Connected" variant="success" />
          </View>

          <TouchableOpacity
            activeOpacity={0.75}
            onPress={handleCopy}
            style={[
              styles.addressBox,
              { backgroundColor: '#F8FAFD', borderColor: colors.border.default, borderRadius: radii.default },
            ]}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.text.tertiary, fontSize: 11, fontWeight: '700', marginBottom: 2 }}>
                PUBLIC ADDRESS (TAP TO SHARE/COPY)
              </Text>
              <Text style={[styles.addressText, { color: colors.text.primary }]}>
                {wallet.address || '0x...'}
              </Text>
            </View>
            <Icon name={copied ? 'check' : 'copy'} size={18} color={copied ? '#10B981' : colors.brand.primary} />
          </TouchableOpacity>
        </Card>

        {/* Persona & Role Switcher Card */}
        <Card style={styles.accountCard}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: colors.text.primary }]}>
              Current Persona
            </Text>
            <Badge
              label={wallet.role === 'client' ? 'Client' : 'Freelancer'}
              variant={wallet.role === 'client' ? 'brand' : 'info'}
            />
          </View>

          <Text style={{ color: colors.text.secondary, fontSize: 13, lineHeight: 19, marginBottom: 14 }}>
            {wallet.role === 'client'
              ? 'You are currently acting as a Client. You can create gigs, fund milestone escrow contracts, and approve deliverables.'
              : 'You are currently acting as a Freelancer. You can explore gigs, submit milestone bids, deliver completed work, and receive USDC payouts.'}
          </Text>

          <Button
            title={`Switch to ${wallet.role === 'client' ? 'Freelancer (Builder)' : 'Client (Funder)'}`}
            variant="secondary"
            onPress={handleToggleRole}
          />

          {onEditProfile && (
            <Button
              title="Edit Profile & Portfolio"
              variant="outline"
              onPress={onEditProfile}
              style={{ marginTop: 10 }}
            />
          )}
        </Card>

        {/* Disconnect Action */}
        <View style={{ marginTop: 8 }}>
          <Button
            title="Disconnect Wallet"
            variant="outline"
            onPress={handleDisconnect}
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
    paddingTop: 8,
    paddingBottom: 40,
    gap: 16,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  screenSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  networkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8FAF3',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  networkDot: {
    color: '#10B981',
    fontSize: 10,
    marginRight: 4,
  },
  networkName: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '700',
  },
  heroCard: {
    padding: 22,
    shadowColor: '#5B4DFF',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 20,
    elevation: 6,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  walletLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  walletAccountLabel: {
    color: 'rgba(255, 255, 255, 0.95)',
    fontSize: 13,
    fontWeight: '700',
  },
  roleTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  roleTagText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  balanceSection: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 6,
  },
  balancePrefix: {
    fontSize: 24,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.8)',
    marginRight: 2,
  },
  balanceAmount: {
    fontSize: 38,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  balanceUnit: {
    fontSize: 16,
    fontWeight: '800',
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 6,
  },
  secondaryBalanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  ethBalanceText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '600',
  },
  blockText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.65)',
    fontFamily: 'monospace',
  },
  heroActionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  heroBtnPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  heroBtnPrimaryText: {
    fontSize: 12,
    fontWeight: '700',
  },
  heroBtnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  heroBtnSecondaryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  accountCard: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  addressBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    gap: 10,
  },
  addressText: {
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: '600',
  },
});
