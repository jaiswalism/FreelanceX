import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { defaultTheme } from '../../theme';
import { Header, Card, Button, Badge, Input } from '../../components';
import { WalletService } from '../../services/wallet/walletService';
import {
  fetchChainStatus,
  fetchUsdcBalance,
} from '../../services/blockchain/client';
import { ApiClient } from '../../services/api/apiClient';
import { HexAddress } from '@freelancerx/shared';

export const WalletPOCScreen: React.FC = () => {
  const { colors, typography, spacing } = defaultTheme;

  const [connectedAddress, setConnectedAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [blockNumber, setBlockNumber] = useState<string | null>(null);
  const [usdcBalance, setUsdcBalance] = useState<string | null>(null);
  const [signedMessage, setSignedMessage] = useState<string | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const [authenticatedUser, setAuthenticatedUser] = useState<any | null>(null);
  const [freelancerBio, setFreelancerBio] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<string>('Ready to test Base Sepolia integration');

  const handleConnectWallet = async () => {
    try {
      setLoading(true);
      setStatusMsg('Connecting wallet...');
      const res = await WalletService.connectTestWallet();
      setConnectedAddress(res.address);
      setChainId(res.chainId);
      setStatusMsg(`Connected: ${res.address.slice(0, 8)}...${res.address.slice(-6)}`);

      // Auto-query chain status
      await handleQueryChain();
    } catch (err) {
      Alert.alert('Connection Failed', err instanceof Error ? err.message : 'Unknown error');
      setStatusMsg('Wallet connection failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleQueryChain = async () => {
    try {
      setLoading(true);
      setStatusMsg('Querying Base Sepolia RPC...');
      const status = await fetchChainStatus();
      if (status.success && status.blockNumber) {
        setBlockNumber(status.blockNumber);
        setChainId(status.chainId || 84532);
        setStatusMsg(`Base Sepolia RPC active (Block #${status.blockNumber})`);
      } else {
        setStatusMsg(`RPC Error: ${status.error}`);
      }

      if (connectedAddress) {
        const bal = await fetchUsdcBalance(connectedAddress as `0x${string}`);
        setUsdcBalance(bal.formatted);
      }
    } catch {
      setStatusMsg('RPC Query failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignAndAuthenticate = async () => {
    if (!connectedAddress) {
      Alert.alert('Connect Wallet', 'Please connect a wallet first.');
      return;
    }

    try {
      setLoading(true);
      setStatusMsg('1/3 Requesting SIWE nonce from backend...');
      
      // 1. Request nonce from backend
      const nonceRes = await ApiClient.requestNonce(connectedAddress as HexAddress);
      setStatusMsg(`2/3 Nonce received (${nonceRes.nonce.slice(0, 10)}...). Signing message...`);

      // 2. Sign message
      setSignedMessage(nonceRes.message);
      const sig = await WalletService.signMessage(nonceRes.message);
      setSignature(sig);

      // 3. Verify signature with backend
      setStatusMsg('3/3 Verifying signature & issuing JWT session...');
      const verifyRes = await ApiClient.verifySignature(
        connectedAddress as HexAddress,
        sig,
        nonceRes.nonce
      );

      setAuthenticatedUser(verifyRes.user);
      if (verifyRes.user?.freelancerProfile?.bio) {
        setFreelancerBio(verifyRes.user.freelancerProfile.bio);
      }
      setStatusMsg('Authenticated successfully! Session token active.');
    } catch (err) {
      Alert.alert('Authentication Failed', err instanceof Error ? err.message : 'Unknown error');
      setStatusMsg('SIWE Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setLoading(true);
      setStatusMsg('Updating profile on PostgreSQL backend...');
      const updated = await ApiClient.updateFreelancerProfile({
        bio: freelancerBio,
        title: 'Full-Stack Smart Contract Engineer',
        skills: ['Solidity', 'React Native', 'TypeScript', 'Foundry'],
      });
      setStatusMsg('Freelancer profile updated successfully!');
      Alert.alert('Profile Updated', `Bio saved: "${updated.profile.bio}"`);
    } catch (err) {
      Alert.alert('Update Failed', err instanceof Error ? err.message : 'Unknown error');
      setStatusMsg('Profile update failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      if (ApiClient.getToken()) {
        await ApiClient.logout();
      }
    } catch {
      // ignore
    }
    WalletService.disconnect();
    setConnectedAddress(null);
    setBlockNumber(null);
    setUsdcBalance(null);
    setSignedMessage(null);
    setSignature(null);
    setAuthenticatedUser(null);
    setStatusMsg('Wallet disconnected & session cleared.');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.app }}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background.secondary} />
      <Header
        title="FreelancerX"
        subtitle="Phase 2/3: Wallet + SIWE Auth + Backend"
        walletAddress={connectedAddress || undefined}
        networkName="Base Sepolia (84532)"
      />

      <ScrollView
        contentContainerStyle={{
          padding: spacing.layout.screenHorizontalPadding,
          gap: 16,
          paddingBottom: 40,
        }}
      >
        {/* Connection Status Card */}
        <Card>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ color: colors.text.primary, fontSize: typography.scale.heading3.fontSize, fontWeight: '700' }}>
              1. Wallet Connection
            </Text>
            <Badge
              label={connectedAddress ? 'Connected' : 'Not Connected'}
              variant={connectedAddress ? 'success' : 'info'}
            />
          </View>

          {connectedAddress ? (
            <View style={{ gap: 8, marginBottom: 16 }}>
              <Text style={{ color: colors.text.secondary, fontSize: typography.scale.caption.fontSize }}>
                EVM Address:
              </Text>
              <Text
                style={{
                  color: colors.special.verified,
                  fontFamily: typography.fontFamily.numeric,
                  fontSize: typography.scale.label.fontSize,
                  backgroundColor: colors.surface.raised,
                  padding: 10,
                  borderRadius: 6,
                  borderWidth: 1,
                  borderColor: colors.border.subtle,
                }}
              >
                {connectedAddress}
              </Text>
              <Button title="Disconnect" onPress={handleDisconnect} variant="secondary" />
            </View>
          ) : (
            <View style={{ gap: 8 }}>
              <Text style={{ color: colors.text.secondary, fontSize: typography.scale.body.fontSize }}>
                Connect an EVM wallet to interact with Base Sepolia testnet and verify SIWE signing.
              </Text>
              <Button title="Connect Test Wallet" onPress={handleConnectWallet} loading={loading} />
            </View>
          )}
        </Card>

        {/* Blockchain Node Status Card */}
        <Card>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ color: colors.text.primary, fontSize: typography.scale.heading3.fontSize, fontWeight: '700' }}>
              2. On-Chain RPC Query
            </Text>
            <Badge label="Live Viem RPC" variant="brand" />
          </View>

          <View style={{ gap: 10, marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: colors.text.secondary }}>Target Network:</Text>
              <Text style={{ color: colors.text.primary, fontWeight: '600' }}>Base Sepolia</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: colors.text.secondary }}>Chain ID:</Text>
              <Text style={{ color: colors.brand.primary, fontFamily: typography.fontFamily.numeric, fontWeight: '700' }}>
                {chainId ?? '84532'}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: colors.text.secondary }}>Latest Block Number:</Text>
              <Text style={{ color: colors.special.verified, fontFamily: typography.fontFamily.numeric, fontWeight: '600' }}>
                {blockNumber ?? 'Querying...'}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: colors.text.secondary }}>USDC Testnet Balance:</Text>
              <Text style={{ color: colors.text.primary, fontFamily: typography.fontFamily.numeric, fontWeight: '700' }}>
                {usdcBalance !== null ? `${usdcBalance} USDC` : '0.00 USDC'}
              </Text>
            </View>
          </View>

          <Button title="Refresh Block & Balance" onPress={handleQueryChain} variant="secondary" loading={loading} />
        </Card>

        {/* Cryptographic SIWE Authentication Card */}
        <Card>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ color: colors.text.primary, fontSize: typography.scale.heading3.fontSize, fontWeight: '700' }}>
              3. SIWE Authentication
            </Text>
            <Badge
              label={authenticatedUser ? 'JWT Active' : signature ? 'Signed' : 'Unauthenticated'}
              variant={authenticatedUser ? 'success' : signature ? 'brand' : 'warning'}
            />
          </View>

          <Text style={{ color: colors.text.secondary, fontSize: typography.scale.body.fontSize, marginBottom: 12 }}>
            Requests a cryptographic nonce from Node.js backend, signs it via ECDSA, and verifies into a PostgreSQL session.
          </Text>

          {signature && (
            <View style={{ gap: 6, marginBottom: 16 }}>
              <Text style={{ color: colors.text.secondary, fontSize: typography.scale.caption.fontSize }}>Signed Message:</Text>
              <Text
                style={{
                  color: colors.text.primary,
                  backgroundColor: colors.surface.raised,
                  padding: 8,
                  borderRadius: 6,
                  fontSize: 11,
                  fontFamily: typography.fontFamily.numeric,
                }}
              >
                {signedMessage}
              </Text>

              <Text style={{ color: colors.text.secondary, fontSize: typography.scale.caption.fontSize, marginTop: 4 }}>
                ECDSA Signature:
              </Text>
              <Text
                style={{
                  color: colors.special.verified,
                  backgroundColor: colors.surface.raised,
                  padding: 8,
                  borderRadius: 6,
                  fontSize: 10,
                  fontFamily: typography.fontFamily.numeric,
                }}
              >
                {signature.slice(0, 42)}...{signature.slice(-20)}
              </Text>
            </View>
          )}

          <Button
            title={authenticatedUser ? 'Re-Authenticate Wallet' : 'Sign & Authenticate (SIWE)'}
            onPress={handleSignAndAuthenticate}
            disabled={!connectedAddress}
            loading={loading}
          />
        </Card>

        {/* Profile Management Card (Active after Auth) */}
        {authenticatedUser && (
          <Card>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ color: colors.text.primary, fontSize: typography.scale.heading3.fontSize, fontWeight: '700' }}>
                4. Dual-Sided Profile
              </Text>
              <Badge label="PostgreSQL Verified" variant="success" />
            </View>

            <Input
              label="Freelancer Bio"
              value={freelancerBio}
              onChangeText={setFreelancerBio}
              placeholder="e.g. Senior Smart Contract & Mobile Developer"
            />

            <Button
              title="Save Profile to Backend"
              onPress={handleUpdateProfile}
              loading={loading}
            />
          </Card>
        )}

        {/* System Activity Status Footer */}
        <View
          style={{
            backgroundColor: colors.surface.default,
            borderColor: colors.border.default,
            borderWidth: 1,
            borderRadius: 8,
            padding: 12,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: authenticatedUser
                ? colors.semantic.success
                : connectedAddress
                ? colors.brand.primary
                : colors.semantic.warning,
            }}
          />
          <Text
            style={{
              color: colors.text.secondary,
              fontSize: typography.scale.caption.fontSize,
              flex: 1,
            }}
          >
            {statusMsg}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
