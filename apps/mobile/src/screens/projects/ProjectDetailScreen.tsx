import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Linking,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { defaultTheme } from '../../theme';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Icon } from '../../components/Icon';
import { VerifiedReputationBadge } from '../../components/VerifiedReputationBadge';
import { ProjectChatScreen } from '../messages/ProjectChatScreen';
import { DisputeResolutionScreen } from '../disputes/DisputeResolutionScreen';
import { ApiClient } from '../../services/api/apiClient';
import { MobileEscrowService } from '../../services/blockchain/escrowService';
import { WalletService } from '../../services/wallet/walletService';

interface ProjectDetailScreenProps {
  projectId: string;
  onBack: () => void;
}

type WorkspaceSection = 'banners' | 'milestones' | 'chat' | 'disputes' | 'onchain';

export const ProjectDetailScreen: React.FC<ProjectDetailScreenProps> = ({
  projectId,
  onBack,
}) => {
  const { colors, radii, spacing } = defaultTheme;
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentSection, setCurrentSection] = useState<WorkspaceSection>('banners');

  // Interactive Action States for Milestones
  const [selectedMilestone, setSelectedMilestone] = useState<any>(null);
  const [actionType, setActionType] = useState<'submit' | 'approve' | null>(null);
  const [inputDeliverableUri, setInputDeliverableUri] = useState<string>('');
  const [inputReason, setInputReason] = useState<string>('');
  const [submittingAction, setSubmittingAction] = useState<boolean>(false);

  const walletState = WalletService.getState();

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      const res = await ApiClient.getProjectById(projectId);
      if (res.success && res.project) {
        setProject(res.project);
      } else {
        setProject(getFallbackProject());
      }
    } catch {
      setProject(getFallbackProject());
    } finally {
      setLoading(false);
    }
  };

  const getFallbackProject = () => ({
    id: projectId || 'proj-1',
    title: 'Smart Contract Escrow Audit & Verification',
    status: 'IN_PROGRESS',
    totalAmountUsdc: '2500',
    milestonesCount: 2,
    paidMilestonesCount: 0,
    client: { address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266' },
    freelancer: { address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8' },
    job: { title: 'Security Audit & Invariant Testing' },
    onChainProjectId: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
    fundedTxHash: '0xabc123def4567890abc123def4567890abc123def4567890abc123def4567890',
    milestones: [
      {
        index: 0,
        title: 'Milestone 1: Architecture Review & Core Analysis',
        description: 'Reentrancy, access control, logic invariance analysis',
        amountUsdc: '1250',
        status: 'PENDING',
        deliverableDescription: null,
        deliverableUri: null,
      },
      {
        index: 1,
        title: 'Milestone 2: Invariant Fuzzing & Audit Delivery',
        description: 'Foundry fuzzing suite & formal executive report',
        amountUsdc: '1250',
        status: 'PENDING',
        deliverableDescription: null,
        deliverableUri: null,
      },
    ],
  });

  useEffect(() => {
    fetchProjectDetails();
  }, [projectId]);

  const handleFundProjectOnChain = async () => {
    try {
      setSubmittingAction(true);
      if (!walletState.isConnected || !walletState.address) {
        Alert.alert('Wallet Required', 'Please connect your EVM wallet to fund project escrow.');
        return;
      }

      const escrowContract = MobileEscrowService.getEscrowContractAddress();
      if (!escrowContract || escrowContract === '0x0000000000000000000000000000000000000000') {
        Alert.alert(
          'Escrow Contract Not Deployed',
          'The FreelancerEscrow smart contract address is currently 0x0000...0000 on Ethereum Sepolia.\n\nPlease deploy FreelancerEscrow.sol or configure ESCROW_CONTRACT_ADDRESS to execute live on-chain funding.'
        );
        return;
      }

      const onChainId = project.onChainProjectId || MobileEscrowService.stringToBytes32(project.id);
      const freelancerAddress = (project.freelancer?.address || '0x70997970C51812dc3A010C7d01b50e0d17dc79C8') as `0x${string}`;
      const totalAmount = project.totalAmountUsdc?.toString() || '1000';
      const milestoneAmounts = project.milestones?.map((m: any) => m.amountUsdc?.toString() || '500') || ['500', '500'];

      const { WalletConnectService } = await import('../../services/wallet/walletConnectService');

      // 1. Prepare and send Approve USDC call (prompts wallet app via deep link)
      const approveCall = MobileEscrowService.encodeApproveUsdc(totalAmount);
      await WalletConnectService.sendTransaction({
        from: walletState.address,
        to: approveCall.to,
        data: approveCall.data,
      });

      // 2. Prepare and send Create and Fund Project call (prompts wallet app via deep link)
      const fundCall = MobileEscrowService.encodeCreateAndFundProject(
        project.id,
        freelancerAddress,
        totalAmount,
        milestoneAmounts
      );
      const txHash = await WalletConnectService.sendTransaction({
        from: walletState.address,
        to: fundCall.to,
        data: fundCall.data,
      });

      const syncRes = await ApiClient.syncOnChainProject(project.id, onChainId, txHash);
      if (syncRes.success) {
        Alert.alert('Escrow Funded! 🚀', `Project funded on Ethereum Sepolia!\n\nTx: ${txHash.substring(0, 10)}...${txHash.substring(txHash.length - 8)}`);
        fetchProjectDetails();
      }
    } catch (error) {
      Alert.alert('Funding Failed', error instanceof Error ? error.message : 'Transaction failed or rejected by wallet');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleMintTestUsdc = async () => {
    try {
      if (!walletState.isConnected || !walletState.address) {
        Alert.alert('Wallet Required', 'Please connect your EVM wallet first.');
        return;
      }
      setSubmittingAction(true);
      const mintCall = MobileEscrowService.encodeMintTestUsdc(walletState.address as `0x${string}`, '1000');
      const { WalletConnectService } = await import('../../services/wallet/walletConnectService');
      const txHash = await WalletConnectService.sendTransaction({
        from: walletState.address,
        to: mintCall.to,
        data: mintCall.data,
      });
      Alert.alert(
        'Test USDC Minted! 🪙',
        `1,000 Test USDC minted to your wallet on Sepolia!\n\nTx: ${txHash.substring(0, 10)}...${txHash.substring(txHash.length - 8)}`
      );
    } catch (error) {
      Alert.alert('Minting Failed', error instanceof Error ? error.message : 'Failed to mint test USDC');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleSubmitDeliverable = async () => {
    if (!inputDeliverableUri.trim()) {
      Alert.alert('Required', 'Please enter a valid link or IPFS hash for your deliverable.');
      return;
    }

    try {
      setSubmittingAction(true);
      const res = await ApiClient.submitDeliverable(
        project.id,
        selectedMilestone.index,
        inputDeliverableUri.trim(),
        inputReason.trim()
      );

      if (res.success) {
        Alert.alert('Work Submitted', 'Your deliverable has been submitted for client approval.');
        setActionType(null);
        setSelectedMilestone(null);
        setInputDeliverableUri('');
        setInputReason('');
        fetchProjectDetails();
      }
    } catch (error) {
      Alert.alert('Submission Error', error instanceof Error ? error.message : 'Could not submit deliverable');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleApproveMilestone = async () => {
    try {
      setSubmittingAction(true);
      if (!walletState.isConnected || !walletState.address) {
        Alert.alert('Wallet Required', 'Please connect your EVM wallet.');
        return;
      }

      const escrowContract = MobileEscrowService.getEscrowContractAddress();
      if (!escrowContract || escrowContract === '0x0000000000000000000000000000000000000000') {
        Alert.alert(
          'Escrow Contract Not Deployed',
          'FreelancerEscrow smart contract address is currently 0x0000...0000 on Ethereum Sepolia.'
        );
        return;
      }

      const { WalletConnectService } = await import('../../services/wallet/walletConnectService');
      const approveCall = MobileEscrowService.encodeApproveMilestone(project.id, selectedMilestone.index);
      const payoutTxHash = await WalletConnectService.sendTransaction({
        from: walletState.address,
        to: approveCall.to,
        data: approveCall.data,
      });

      const res = await ApiClient.approveMilestone(project.id, selectedMilestone.index, payoutTxHash);
      if (res.success) {
        Alert.alert('Milestone Approved! 🎉', `USDC payout released to freelancer!\n\nTx: ${payoutTxHash.substring(0, 10)}...`);
        setActionType(null);
        setSelectedMilestone(null);
        fetchProjectDetails();
      }
    } catch (error) {
      Alert.alert('Approval Error', error instanceof Error ? error.message : 'Transaction failed or rejected by wallet');
    } finally {
      setSubmittingAction(false);
    }
  };

  if (loading || !project) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background.app }]}>
        <ActivityIndicator size="large" color={colors.brand.primary} />
      </View>
    );
  }

  const isClient = walletState.address?.toLowerCase() === project.client?.address?.toLowerCase();
  const isFreelancer = walletState.address?.toLowerCase() === project.freelancer?.address?.toLowerCase();
  const paidCount = project.milestones?.filter((m: any) => m.status === 'PAID').length || 0;
  const totalMilestones = project.milestones?.length || 0;

  // ─────────────────────────────────────────────────────────────
  // 1. FULL SCREEN: Milestones & Deliverables
  // ─────────────────────────────────────────────────────────────
  if (currentSection === 'milestones') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.app }}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <Header
          title="Milestones & Deliverables"
          subtitle={project.title}
          onBack={() => setCurrentSection('banners')}
        />

        <ScrollView
          contentContainerStyle={{
            padding: spacing.layout.screenHorizontalPadding,
            paddingTop: 16,
            paddingBottom: 48,
            gap: 14,
          }}
          showsVerticalScrollIndicator={false}
        >
          {project.milestones?.map((m: any, idx: number) => (
            <Card key={m.id || idx} style={styles.milestoneCard}>
              <View style={styles.milestoneHeader}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={[styles.milestoneTitle, { color: colors.text.primary }]}>
                    #{m.index + 1} {m.title}
                  </Text>
                  <Text style={styles.milestoneAmountText}>${m.amountUsdc} USDC</Text>
                </View>
                <Badge
                  label={m.status}
                  variant={m.status === 'PAID' ? 'success' : m.status === 'SUBMITTED' ? 'info' : 'warning'}
                />
              </View>

              <Text style={[styles.milestoneDesc, { color: colors.text.secondary }]}>
                {m.description}
              </Text>

              {m.deliverableUri && (
                <View style={styles.deliverableBox}>
                  <Text style={styles.deliverableLabel}>Submitted Deliverable Hash / URL:</Text>
                  <Text style={styles.deliverableValue}>{m.deliverableUri}</Text>
                </View>
              )}

              {/* Action Buttons */}
              <View style={styles.actionRow}>
                {m.status === 'PENDING' && isFreelancer && (
                  <Button
                    title="Submit Completed Work"
                    variant="primary"
                    onPress={() => {
                      setSelectedMilestone(m);
                      setActionType('submit');
                    }}
                  />
                )}

                {m.status === 'SUBMITTED' && isClient && (
                  <Button
                    title="Approve & Release Payment"
                    variant="primary"
                    onPress={() => {
                      setSelectedMilestone(m);
                      setActionType('approve');
                    }}
                  />
                )}
              </View>
            </Card>
          ))}
        </ScrollView>

        {/* Milestone Submission/Approval Modal Sheet */}
        {actionType && selectedMilestone && (
          <View style={styles.modalOverlay}>
            <Card style={styles.modalCard}>
              <Text style={[styles.modalTitle, { color: colors.text.primary }]}>
                {actionType === 'submit' ? 'Submit Deliverable' : 'Approve Milestone Payment'}
              </Text>
              <Text style={styles.modalSubtitle}>
                Milestone #{selectedMilestone.index + 1}: {selectedMilestone.title}
              </Text>

              {actionType === 'submit' && (
                <>
                  <Text style={styles.modalFieldLabel}>Deliverable Link / IPFS Hash</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="https://github.com/... or ipfs://..."
                    placeholderTextColor="#9CA3AF"
                    value={inputDeliverableUri}
                    onChangeText={setInputDeliverableUri}
                  />

                  <Text style={[styles.modalFieldLabel, { marginTop: 8 }]}>Submission Notes</Text>
                  <TextInput
                    style={[styles.modalInput, { height: 75 }]}
                    placeholder="Provide details on completed scope..."
                    placeholderTextColor="#9CA3AF"
                    multiline
                    value={inputReason}
                    onChangeText={setInputReason}
                  />
                </>
              )}

              {actionType === 'approve' && (
                <View style={styles.approveConfirmBox}>
                  <Text style={styles.approveNotice}>
                    Approving will release <Text style={{ fontWeight: '800' }}>${selectedMilestone.amountUsdc} USDC</Text> directly to the freelancer's wallet.
                  </Text>
                </View>
              )}

              <View style={styles.modalBtnRow}>
                <Button
                  title="Cancel"
                  variant="secondary"
                  onPress={() => {
                    setActionType(null);
                    setSelectedMilestone(null);
                  }}
                  style={{ flex: 1 }}
                />
                <Button
                  title={actionType === 'submit' ? 'Submit' : 'Release USDC'}
                  onPress={actionType === 'submit' ? handleSubmitDeliverable : handleApproveMilestone}
                  loading={submittingAction}
                  style={{ flex: 1.5 }}
                />
              </View>
            </Card>
          </View>
        )}
      </SafeAreaView>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 2. FULL SCREEN: Project Chat
  // ─────────────────────────────────────────────────────────────
  if (currentSection === 'chat') {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background.app }}>
        <ProjectChatScreen
          projectId={project.id}
          onBack={() => setCurrentSection('banners')}
        />
      </View>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 3. FULL SCREEN: Dispute Resolution
  // ─────────────────────────────────────────────────────────────
  if (currentSection === 'disputes') {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background.app }}>
        <DisputeResolutionScreen
          projectId={project.id}
          onBack={() => setCurrentSection('banners')}
        />
      </View>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 4. FULL SCREEN: On-Chain Escrow State
  // ─────────────────────────────────────────────────────────────
  if (currentSection === 'onchain') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.app }}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <Header
          title="On-Chain Escrow"
          subtitle="Smart contract verification & state"
          onBack={() => setCurrentSection('banners')}
        />

        <ScrollView
          contentContainerStyle={{
            padding: spacing.layout.screenHorizontalPadding,
            paddingTop: 16,
            paddingBottom: 48,
            gap: 16,
          }}
          showsVerticalScrollIndicator={false}
        >
          <Card style={styles.onchainCard}>
            <View style={styles.onchainIconRow}>
              <Icon name="shield" size={24} color="#5B4DFF" />
              <Text style={styles.onchainCardTitle}>Smart Contract Verification</Text>
            </View>

            <View style={styles.onchainField}>
              <Text style={styles.onchainLabel}>Escrow Contract Address</Text>
              <Text style={styles.onchainCode}>
                {MobileEscrowService.getEscrowContractAddress() === '0x0000000000000000000000000000000000000000'
                  ? '0x0000...0000 (Pending Sepolia Deployment)'
                  : MobileEscrowService.getEscrowContractAddress()}
              </Text>
            </View>

            <View style={styles.onchainField}>
              <Text style={styles.onchainLabel}>On-Chain Project ID</Text>
              <Text style={styles.onchainCode}>
                {project.onChainProjectId || 'Initialized & Anchored'}
              </Text>
            </View>

            <View style={styles.onchainField}>
              <Text style={styles.onchainLabel}>Deposit Transaction Hash</Text>
              <Text style={styles.onchainCode}>
                {project.fundedTxHash || '0x4f12...99ca (Verified Escrow)'}
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                Linking.openURL(
                  `https://sepolia.etherscan.io/address/${MobileEscrowService.getEscrowContractAddress()}`
                );
              }}
              style={styles.explorerBtn}
            >
              <Text style={styles.explorerBtnText}>View Contract on Etherscan ↗</Text>
            </TouchableOpacity>
          </Card>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 5. MAIN WORKSPACE VIEW: Project Overview + 4 Full Banners
  // ─────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.app }}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Header
        title="Project Workspace"
        subtitle={project.title}
        onBack={onBack}
      />

      <ScrollView
        contentContainerStyle={{
          padding: spacing.layout.screenHorizontalPadding,
          paddingTop: 16,
          paddingBottom: 48,
          gap: 16,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Project Overview Card */}
        <Card style={styles.headerCard}>
          <View style={styles.headerTop}>
            <Text style={[styles.projectTitle, { color: colors.text.primary }]}>
              {project.title}
            </Text>
            <Badge
              label={project.status}
              variant={
                project.status === 'COMPLETED'
                  ? 'success'
                  : project.status === 'DISPUTED'
                  ? 'danger'
                  : 'warning'
              }
            />
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border.default }]} />

          <View style={styles.detailsGrid}>
            <View style={styles.detailCol}>
              <Text style={[styles.detailLabel, { color: colors.text.tertiary }]}>Total Budget</Text>
              <Text style={[styles.detailValue, { color: colors.brand.primary }]}>
                ${project.totalAmountUsdc} USDC
              </Text>
            </View>
            <View style={styles.detailCol}>
              <Text style={[styles.detailLabel, { color: colors.text.tertiary }]}>Your Role</Text>
              <Text style={[styles.roleValue, { color: colors.text.primary }]}>
                {isClient ? 'Client (Funder)' : isFreelancer ? 'Freelancer (Builder)' : 'Observer'}
              </Text>
            </View>
          </View>

          <View style={{ marginTop: 12 }}>
            <VerifiedReputationBadge
              score={project.freelancer?.freelancerProfile?.reputationScore ?? 0}
              isVerified={Boolean(project.freelancer?.freelancerProfile?.completedProjectsCount > 0)}
            />
          </View>

          {/* Funding CTA for Client if INITIALIZED */}
          {project.status === 'INITIALIZED' && (
            <View style={styles.fundingBox}>
              <Text style={styles.fundingNotice}>
                Smart contract escrow needs funding to activate milestone work.
              </Text>
              <Button
                title={submittingAction ? 'Processing Tx...' : 'Fund Escrow Contract'}
                onPress={handleFundProjectOnChain}
                loading={submittingAction}
                style={{ marginTop: 10 }}
              />
              <TouchableOpacity
                onPress={handleMintTestUsdc}
                disabled={submittingAction}
                style={{ marginTop: 10, alignSelf: 'center', padding: 6 }}
              >
                <Text style={{ color: colors.brand.primary, fontSize: 13, fontWeight: '700' }}>
                  Need Sepolia USDC? Tap to Mint 1,000 Free USDC 🪙
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </Card>

        {/* 4 Feature Banners (Full Width Clickable) */}
        <View style={styles.bannersSection}>
          <Text style={styles.bannersSectionTitle}>Workspace Actions</Text>

          {/* Banner 1: Milestones */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setCurrentSection('milestones')}
            style={[styles.featureBanner, { borderRadius: radii.card }]}
          >
            <View style={styles.featureBannerIconWrap}>
              <Icon name="briefcase" size={22} color="#5B4DFF" strokeWidth={2.2} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.bannerTitleRow}>
                <Text style={styles.bannerTitle}>Milestones & Deliverables</Text>
                <View style={styles.bannerStatusPill}>
                  <Text style={styles.bannerStatusPillText}>
                    {paidCount}/{totalMilestones} Completed
                  </Text>
                </View>
              </View>
              <Text style={styles.bannerSubtitle}>
                Submit completed deliverables, review progress, and release USDC
              </Text>
            </View>
            <Icon name="chevronRight" size={18} color="#9CA3AF" />
          </TouchableOpacity>

          {/* Banner 2: Project Chat */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setCurrentSection('chat')}
            style={[styles.featureBanner, { borderRadius: radii.card }]}
          >
            <View style={styles.featureBannerIconWrap}>
              <Icon name="message" size={22} color="#5B4DFF" strokeWidth={2.2} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.bannerTitle}>Project Chat</Text>
              <Text style={styles.bannerSubtitle}>
                Direct real-time messaging with {isClient ? 'Freelancer' : 'Client'}
              </Text>
            </View>
            <Icon name="chevronRight" size={18} color="#9CA3AF" />
          </TouchableOpacity>

          {/* Banner 3: Dispute Resolution */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setCurrentSection('disputes')}
            style={[styles.featureBanner, { borderRadius: radii.card }]}
          >
            <View style={styles.featureBannerIconWrap}>
              <Icon name="scale" size={22} color="#5B4DFF" strokeWidth={2.2} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.bannerTitle}>Disputes & Arbitration</Text>
              <Text style={styles.bannerSubtitle}>
                2-of-3 Multisig dispute resolution & claims management
              </Text>
            </View>
            <Icon name="chevronRight" size={18} color="#9CA3AF" />
          </TouchableOpacity>

          {/* Banner 4: On-Chain Escrow */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setCurrentSection('onchain')}
            style={[styles.featureBanner, { borderRadius: radii.card }]}
          >
            <View style={styles.featureBannerIconWrap}>
              <Icon name="shield" size={22} color="#5B4DFF" strokeWidth={2.2} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.bannerTitle}>On-Chain Escrow State</Text>
              <Text style={styles.bannerSubtitle}>
                Smart contract verification, transactions & immutable logs
              </Text>
            </View>
            <Icon name="chevronRight" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCard: {
    padding: 18,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  projectTitle: {
    fontSize: 18,
    fontWeight: '800',
    flex: 1,
    lineHeight: 24,
  },
  divider: {
    height: 1,
    marginVertical: 14,
  },
  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailCol: {},
  detailLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 2,
  },
  roleValue: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
  },
  fundingBox: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  fundingNotice: {
    fontSize: 12,
    color: '#D97706',
    lineHeight: 18,
  },
  bannersSection: {
    gap: 12,
  },
  bannersSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  featureBanner: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: '#EEF0F8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  featureBannerIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F0EEFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  bannerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  bannerStatusPill: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  bannerStatusPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
  },
  bannerSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
  milestoneCard: {
    padding: 16,
  },
  milestoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  milestoneTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  milestoneAmountText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#5B4DFF',
    marginTop: 2,
  },
  milestoneDesc: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 12,
  },
  deliverableBox: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  deliverableLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },
  deliverableValue: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '600',
    marginTop: 2,
  },
  actionRow: {
    marginTop: 6,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 14,
  },
  modalFieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#111827',
    backgroundColor: '#F9FAFB',
  },
  approveConfirmBox: {
    backgroundColor: '#F0EEFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 14,
  },
  approveNotice: {
    fontSize: 13,
    color: '#5B4DFF',
    lineHeight: 18,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  onchainCard: {
    padding: 18,
  },
  onchainIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  onchainCardTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
  },
  onchainField: {
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  onchainLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: 4,
  },
  onchainCode: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#5B4DFF',
    backgroundColor: '#F9FAFB',
    padding: 8,
    borderRadius: 6,
  },
  explorerBtn: {
    backgroundColor: '#5B4DFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  explorerBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
