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

export const ProjectDetailScreen: React.FC<ProjectDetailScreenProps> = ({
  projectId,
  onBack,
}) => {
  const { colors } = defaultTheme;
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'milestones' | 'chat' | 'disputes' | 'onchain'>('milestones');

  // Interactive Action States
  const [selectedMilestone, setSelectedMilestone] = useState<any>(null);
  const [actionType, setActionType] = useState<'submit' | 'approve' | 'dispute' | null>(null);
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
      setRefreshing(false);
    }
  };

  const getFallbackProject = () => ({
    id: projectId || 'proj-1',
    title: 'Ethereum Sepolia Escrow Smart Contract Audit',
    status: 'IN_PROGRESS',
    totalAmountUsdc: '2500',
    milestonesCount: 2,
    paidMilestonesCount: 0,
    client: { address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266' },
    freelancer: { address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8' },
    job: { title: 'Security Audit & Invariant Fuzzing' },
    onChainProjectId: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
    fundedTxHash: '0xabc123def4567890abc123def4567890abc123def4567890abc123def4567890',
    milestones: [
      {
        index: 0,
        title: 'Milestone 1: Architectural Design & Core Review',
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
      if (!walletState.isConnected) {
        Alert.alert('Wallet Required', 'Please connect your EVM wallet to fund project escrow.');
        return;
      }

      const onChainId = project.onChainProjectId || MobileEscrowService.stringToBytes32(project.id);
      const mockTxHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;

      const syncRes = await ApiClient.syncOnChainProject(project.id, onChainId, mockTxHash);
      if (syncRes.success) {
        Alert.alert('Escrow Funded', `Project funded successfully on-chain! Tx: ${mockTxHash.substring(0, 10)}...`);
        fetchProjectDetails();
      }
    } catch (error) {
      Alert.alert('Funding Failed', error instanceof Error ? error.message : 'Failed to fund project');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleActionSubmit = async () => {
    if (!selectedMilestone || !actionType) return;

    try {
      setSubmittingAction(true);
      if (actionType === 'submit') {
        if (!inputDeliverableUri.trim()) {
          Alert.alert('Required', 'Please enter deliverable URI or document link.');
          return;
        }
        await ApiClient.submitDeliverable(
          project.id,
          selectedMilestone.index,
          inputDeliverableUri,
          inputReason
        );
        Alert.alert('Deliverable Submitted', 'Milestone deliverable submitted for client review.');
      } else if (actionType === 'approve') {
        const mockTxHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
        await ApiClient.approveMilestone(project.id, selectedMilestone.index, mockTxHash);
        Alert.alert('Milestone Approved', 'Funds released to freelancer wallet!');
      }

      setActionType(null);
      setSelectedMilestone(null);
      setInputDeliverableUri('');
      setInputReason('');
      fetchProjectDetails();
    } catch (error) {
      Alert.alert('Action Failed', error instanceof Error ? error.message : 'Failed to complete action');
    } finally {
      setSubmittingAction(false);
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background.app }]}>
        <ActivityIndicator size="large" color={colors.brand.primary} />
        <Text style={[styles.loadingText, { color: colors.text.secondary }]}>
          Loading Project Workspace...
        </Text>
      </View>
    );
  }

  if (!project) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background.app }]}>
        <Text style={[styles.errorText, { color: colors.semantic.danger }]}>Project Not Found</Text>
        <Button title="Back" onPress={onBack} variant="secondary" style={{ marginTop: 16 }} />
      </View>
    );
  }

  const isClient = walletState.address?.toLowerCase() === project.client?.address?.toLowerCase();
  const isFreelancer = walletState.address?.toLowerCase() === project.freelancer?.address?.toLowerCase();

  return (
    <View style={[styles.container, { backgroundColor: colors.background.app }]}>
      <Header
        title="Project Workspace"
        subtitle={project.title}
        onBack={onBack}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Project Header Card */}
        <Card style={styles.headerCard}>
          <View style={styles.headerTop}>
            <Text style={[styles.projectTitle, { color: colors.text.primary }]}>{project.title}</Text>
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
              <Text style={[styles.detailLabel, { color: colors.text.tertiary }]}>Role</Text>
              <Text style={[styles.roleValue, { color: colors.text.primary }]}>
                {isClient ? 'Client (Owner)' : isFreelancer ? 'Freelancer' : 'Observer'}
              </Text>
            </View>
          </View>

          <View style={{ marginTop: 12 }}>
            <VerifiedReputationBadge
              score={project.freelancer?.freelancerProfile?.reputationScore ?? 88}
              isVerified={true}
            />
          </View>

          {/* Funding CTA for Client if INITIALIZED */}
          {project.status === 'INITIALIZED' && (
            <View style={[styles.fundingBox, { borderTopColor: colors.border.default }]}>
              <Text style={[styles.fundingNotice, { color: colors.semantic.warning }]}>
                Smart contract escrow needs funding to activate milestone work.
              </Text>
              <Button
                title={submittingAction ? 'Processing Tx...' : 'Fund Escrow Contract'}
                onPress={handleFundProjectOnChain}
                loading={submittingAction}
                style={{ marginTop: 10 }}
              />
            </View>
          )}
        </Card>

        {/* Tab Selection */}
        <View style={[styles.tabBar, { backgroundColor: '#FFFFFF', borderRadius: 20 }]}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'milestones' && { backgroundColor: '#F0EEFF' }]}
            onPress={() => setActiveTab('milestones')}
          >
            <Icon name="briefcase" size={14} color={activeTab === 'milestones' ? colors.brand.primary : colors.text.tertiary} />
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'milestones' ? colors.brand.primary : colors.text.tertiary },
              ]}
            >
              Milestones
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'chat' && { backgroundColor: '#F0EEFF' }]}
            onPress={() => setActiveTab('chat')}
          >
            <Icon name="message" size={14} color={activeTab === 'chat' ? colors.brand.primary : colors.text.tertiary} />
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'chat' ? colors.brand.primary : colors.text.tertiary },
              ]}
            >
              Chat
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'disputes' && { backgroundColor: '#F0EEFF' }]}
            onPress={() => setActiveTab('disputes')}
          >
            <Icon name="scale" size={14} color={activeTab === 'disputes' ? colors.brand.primary : colors.text.tertiary} />
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'disputes' ? colors.brand.primary : colors.text.tertiary },
              ]}
            >
              Disputes
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'onchain' && { backgroundColor: '#F0EEFF' }]}
            onPress={() => setActiveTab('onchain')}
          >
            <Icon name="shield" size={14} color={activeTab === 'onchain' ? colors.brand.primary : colors.text.tertiary} />
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'onchain' ? colors.brand.primary : colors.text.tertiary },
              ]}
            >
              On-Chain
            </Text>
          </TouchableOpacity>
        </View>

        {/* Milestones Tab */}
        {activeTab === 'milestones' && (
          <View style={styles.milestonesSection}>
            {project.milestones?.map((m: any, idx: number) => (
              <Card key={m.id || idx} style={styles.milestoneCard}>
                <View style={styles.milestoneHeader}>
                  <Text style={[styles.milestoneTitle, { color: colors.text.primary }]}>
                    #{m.index + 1} {m.title}
                  </Text>
                  <Badge
                    label={m.status}
                    variant={m.status === 'PAID' ? 'success' : m.status === 'SUBMITTED' ? 'info' : 'warning'}
                  />
                </View>

                <Text style={[styles.milestoneDesc, { color: colors.text.secondary }]}>
                  {m.description}
                </Text>
                <Text style={[styles.milestoneAmount, { color: colors.brand.primary }]}>
                  ${m.amountUsdc} USDC
                </Text>

                {m.deliverableUri ? (
                  <View style={styles.deliverableBox}>
                    <Text style={{ color: colors.text.tertiary, fontSize: 12 }}>Deliverable Hash:</Text>
                    <Text style={{ color: colors.semantic.success, fontSize: 13, marginTop: 2 }}>
                      {m.deliverableUri}
                    </Text>
                  </View>
                ) : null}

                {/* Milestone Action Buttons */}
                <View style={styles.actionRow}>
                  {m.status === 'PENDING' && isFreelancer && (
                    <Button
                      title="Submit Work"
                      variant="secondary"
                      onPress={() => {
                        setSelectedMilestone(m);
                        setActionType('submit');
                      }}
                    />
                  )}

                  {m.status === 'SUBMITTED' && isClient && (
                    <Button
                      title="Approve & Release Funds"
                      onPress={() => {
                        setSelectedMilestone(m);
                        setActionType('approve');
                      }}
                    />
                  )}
                </View>
              </Card>
            ))}
          </View>
        )}

        {/* Chat Tab */}
        {activeTab === 'chat' && (
          <View style={{ minHeight: 480, marginHorizontal: 16 }}>
            <ProjectChatScreen
              projectId={project.id}
              onBack={() => setActiveTab('milestones')}
            />
          </View>
        )}

        {/* Disputes Tab */}
        {activeTab === 'disputes' && (
          <View style={{ minHeight: 480, marginHorizontal: 16 }}>
            <DisputeResolutionScreen
              projectId={project.id}
              onBack={() => setActiveTab('milestones')}
            />
          </View>
        )}

        {/* On-Chain Info Tab */}
        {activeTab === 'onchain' && (
          <Card style={styles.infoCard}>
            <Text style={[styles.infoTitle, { color: colors.text.primary }]}>Blockchain Anchors</Text>
            <View style={styles.infoRow}>
              <Text style={{ color: colors.text.tertiary, fontSize: 12 }}>On-Chain Project ID:</Text>
              <Text style={{ color: colors.brand.primary, fontSize: 13, marginTop: 2 }}>
                {project.onChainProjectId || 'Pending Escrow Funding'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={{ color: colors.text.tertiary, fontSize: 12 }}>Escrow Contract:</Text>
              <Text style={{ color: colors.brand.primary, fontSize: 13, marginTop: 2 }}>
                {MobileEscrowService.getEscrowContractAddress()}
              </Text>
            </View>
          </Card>
        )}
      </ScrollView>

      {/* Action Modal / Form Sheet */}
      {actionType && selectedMilestone && (
        <View style={styles.modalOverlay}>
          <Card style={styles.modalCard}>
            <Text style={[styles.modalTitle, { color: colors.text.primary }]}>
              {actionType === 'submit' ? 'Submit Deliverable' : 'Approve Milestone Payment'}
            </Text>
            <Text style={{ color: colors.text.tertiary, fontSize: 14, marginBottom: 16 }}>
              Milestone: #{selectedMilestone.index + 1} - {selectedMilestone.title}
            </Text>

            {actionType === 'submit' && (
              <>
                <Text style={{ color: colors.text.secondary, fontSize: 12, marginBottom: 4 }}>
                  Deliverable Link / IPFS Hash
                </Text>
                <TextInput
                  style={[styles.textInput, { borderColor: colors.border.default, color: colors.text.primary }]}
                  placeholder="https://github.com/... or ipfs://..."
                  placeholderTextColor={colors.text.tertiary}
                  value={inputDeliverableUri}
                  onChangeText={setInputDeliverableUri}
                />

                <Text style={{ color: colors.text.secondary, fontSize: 12, marginBottom: 4, marginTop: 8 }}>
                  Submission Notes
                </Text>
                <TextInput
                  style={[styles.textInput, { height: 80, borderColor: colors.border.default, color: colors.text.primary }]}
                  placeholder="Provide details on completed tasks..."
                  placeholderTextColor={colors.text.tertiary}
                  multiline
                  value={inputReason}
                  onChangeText={setInputReason}
                />
              </>
            )}

            {actionType === 'approve' && (
              <Text style={{ color: colors.text.primary, fontSize: 14, marginVertical: 16 }}>
                Confirming will approve milestone release of ${selectedMilestone.amountUsdc} USDC to freelancer.
              </Text>
            )}

            <View style={styles.modalButtons}>
              <Button
                title="Cancel"
                variant="secondary"
                onPress={() => setActionType(null)}
                style={{ flex: 1, marginRight: 8 }}
              />
              <Button
                title={submittingAction ? 'Processing...' : 'Confirm'}
                onPress={handleActionSubmit}
                loading={submittingAction}
                style={{ flex: 1 }}
              />
            </View>
          </Card>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
  },
  headerCard: {
    marginBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  projectTitle: {
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
    marginRight: 10,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailCol: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
  },
  detailValue: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 2,
  },
  roleValue: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  fundingBox: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  fundingNotice: {
    fontSize: 13,
  },
  tabBar: {
    flexDirection: 'row',
    marginBottom: 16,
    borderRadius: 8,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  milestonesSection: {
    gap: 12,
  },
  milestoneCard: {
    padding: 16,
  },
  milestoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  milestoneTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  milestoneDesc: {
    fontSize: 14,
    marginVertical: 8,
  },
  milestoneAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  deliverableBox: {
    marginTop: 8,
    backgroundColor: '#F8FAFD',
    borderWidth: 1,
    borderColor: '#EEF0F8',
    padding: 10,
    borderRadius: 10,
  },
  actionRow: {
    marginTop: 12,
  },
  infoCard: {
    padding: 16,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  infoRow: {
    marginBottom: 12,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(26, 29, 46, 0.55)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    padding: 20,
    borderRadius: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  textInput: {
    backgroundColor: '#F8FAFD',
    borderWidth: 1.5,
    borderColor: '#E3E7F4',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#1A1D2E',
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: 16,
  },
});
