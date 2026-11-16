import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  TextInput,
  Alert,
  Linking,
  ScrollView,
} from 'react-native';
import { defaultTheme } from '../../theme';
import { Icon } from '../../components/Icon';
import { Button } from '../../components/Button';
import { WalletService } from '../../services/wallet/walletService';
import { HexAddress } from '@freelancerx/shared';

interface ConnectWalletScreenProps {
  onBack: () => void;
  onConnected: () => void;
}

interface WalletOption {
  id: string;
  name: string;
  icon: string;
  tag: string;
  scheme: string;
  playStore: string;
}

const WALLET_OPTIONS: WalletOption[] = [
  {
    id: 'metamask',
    name: 'MetaMask',
    icon: '🦊',
    tag: 'Recommended',
    scheme: 'metamask://',
    playStore: 'https://play.google.com/store/apps/details?id=io.metamask',
  },
  {
    id: 'trust',
    name: 'Trust Wallet',
    icon: '🛡️',
    tag: 'Popular',
    scheme: 'trust://',
    playStore: 'https://play.google.com/store/apps/details?id=com.wallet.crypto.trustapp',
  },
  {
    id: 'coinbase',
    name: 'Coinbase Wallet',
    icon: '🔵',
    tag: 'Web3',
    scheme: 'cbwallet://',
    playStore: 'https://play.google.com/store/apps/details?id=org.toshi',
  },
  {
    id: 'rainbow',
    name: 'Rainbow',
    icon: '🌈',
    tag: 'Ethereum',
    scheme: 'rainbow://',
    playStore: 'https://play.google.com/store/apps/details?id=me.rainbow',
  },
];

export const ConnectWalletScreen: React.FC<ConnectWalletScreenProps> = ({
  onBack,
  onConnected,
}) => {
  const { colors, radii } = defaultTheme;
  const [selectedWallet, setSelectedWallet] = useState<WalletOption>(WALLET_OPTIONS[0] as WalletOption);
  const [addressInput, setAddressInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleOpenWalletApp = async (wallet: WalletOption) => {
    setSelectedWallet(wallet);
    try {
      const canOpen = await Linking.canOpenURL(wallet.scheme).catch(() => false);
      if (canOpen) {
        await Linking.openURL(wallet.scheme);
      } else {
        Alert.alert(
          `${wallet.name} App`,
          `Would you like to open the Play Store to install ${wallet.name}, or connect by entering your public address?`,
          [
            { text: 'Enter Address', style: 'default' },
            { text: 'Get App', onPress: () => Linking.openURL(wallet.playStore) },
            { text: 'Cancel', style: 'cancel' },
          ]
        );
      }
    } catch {
      // Keep on screen for manual entry
    }
  };

  const handleConnectWithAddress = async () => {
    const cleanAddress = addressInput.trim();
    if (!cleanAddress.startsWith('0x') || cleanAddress.length !== 42) {
      Alert.alert(
        'Invalid Ethereum Address',
        'Please enter a valid 42-character Ethereum Sepolia public address (starting with 0x...).\n\nYou can copy your public address directly from MetaMask or Trust Wallet.'
      );
      return;
    }

    try {
      setLoading(true);
      await WalletService.connectWallet(
        cleanAddress as HexAddress,
        selectedWallet.name
      );
      onConnected();
    } catch (err) {
      Alert.alert('Connection Failed', err instanceof Error ? err.message : 'Could not connect wallet');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.app }]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background.app} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Top Header */}
        <View style={styles.topBar}>
          <TouchableOpacity activeOpacity={0.7} onPress={onBack} style={styles.backButton}>
            <Icon name="chevronLeft" size={20} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Connect Wallet</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Instructions */}
        <View style={styles.introWrap}>
          <Text style={[styles.introTitle, { color: colors.text.primary }]}>
            Select your Web3 Wallet
          </Text>
          <Text style={[styles.introSubtitle, { color: colors.text.secondary }]}>
            Connect your existing Ethereum account to sign in, bid on projects, and manage smart escrow funds.
          </Text>
        </View>

        {/* Wallets Grid */}
        <View style={styles.walletList}>
          {WALLET_OPTIONS.map((wallet) => {
            const isSelected = selectedWallet.id === wallet.id;
            return (
              <TouchableOpacity
                key={wallet.id}
                activeOpacity={0.8}
                onPress={() => handleOpenWalletApp(wallet)}
                style={[
                  styles.walletCard,
                  { borderRadius: radii.card },
                  isSelected && {
                    borderColor: colors.brand.primary,
                    backgroundColor: '#F9F8FF',
                  },
                ]}
              >
                <View style={styles.walletCardLeft}>
                  <Text style={styles.walletEmoji}>{wallet.icon}</Text>
                  <View>
                    <View style={styles.walletNameRow}>
                      <Text style={[styles.walletName, { color: colors.text.primary }]}>
                        {wallet.name}
                      </Text>
                      {wallet.tag && (
                        <View style={[styles.tagPill, isSelected && { backgroundColor: '#5B4DFF' }]}>
                          <Text style={[styles.tagText, isSelected && { color: '#FFFFFF' }]}>
                            {wallet.tag}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.walletDesc}>Tap to launch or link</Text>
                  </View>
                </View>

                <Icon
                  name={isSelected ? 'check' : 'chevronRight'}
                  size={18}
                  color={isSelected ? colors.brand.primary : '#9CA3AF'}
                />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Manual Public Address Input Card */}
        <View style={[styles.addressInputCard, { borderRadius: radii.card }]}>
          <View style={styles.addressInputHeader}>
            <Text style={[styles.addressInputTitle, { color: colors.text.primary }]}>
              {selectedWallet.name} Public Address
            </Text>
            <Text style={styles.addressNotice}>Public (0x...)</Text>
          </View>
          <Text style={styles.addressHint}>
            Copy your public address from {selectedWallet.name} and paste it below:
          </Text>

          <TextInput
            style={styles.textInput}
            placeholder="0x..."
            placeholderTextColor="#9CA3AF"
            value={addressInput}
            onChangeText={setAddressInput}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Button
            title={`Connect with ${selectedWallet.name}`}
            onPress={handleConnectWithAddress}
            loading={loading}
            disabled={!addressInput.trim()}
            style={{ marginTop: 12 }}
          />
        </View>

        {/* Security Assurance */}
        <View style={styles.securityWrap}>
          <Icon name="shield" size={16} color="#10B981" />
          <Text style={styles.securityText}>
            Zero custody. FreelancerX never asks for private keys or seed phrases.
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
    paddingTop: 12,
    paddingBottom: 32,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  introWrap: {
    marginBottom: 20,
  },
  introTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  introSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  walletList: {
    gap: 10,
    marginBottom: 20,
  },
  walletCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderWidth: 1,
    borderColor: '#EEF0F8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  walletCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  walletEmoji: {
    fontSize: 28,
  },
  walletNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  walletName: {
    fontSize: 16,
    fontWeight: '700',
  },
  tagPill: {
    backgroundColor: '#EEF0FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#5B4DFF',
  },
  walletDesc: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  addressInputCard: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderWidth: 1,
    borderColor: '#EEF0F8',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  addressInputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  addressInputTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  addressNotice: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '600',
  },
  addressHint: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 12,
    lineHeight: 18,
  },
  textInput: {
    height: 48,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 13,
    fontFamily: 'monospace',
    color: '#111827',
    backgroundColor: '#F9FAFB',
  },
  securityWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
  },
  securityText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    flex: 1,
  },
});
