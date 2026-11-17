import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { defaultTheme } from '../../theme';
import { Header, Card, Button, Icon, VerifiedReputationBadge } from '../../components';
import { ApiClient } from '../../services/api/apiClient';
import { WalletService } from '../../services/wallet/walletService';

interface ClientProposalsScreenProps {
  job: any;
  onBack: () => void;
  onProjectCreated: (project: any) => void;
}

export const ClientProposalsScreen: React.FC<ClientProposalsScreenProps> = ({
  job,
  onBack,
  onProjectCreated,
}) => {
  const { colors, spacing } = defaultTheme;

  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const walletState = WalletService.getState();
  const currentAddress = walletState.address?.toLowerCase();
  const jobOwnerAddress = (job?.client?.address || job?.clientAddress || '').toLowerCase();
  const isPublisher = Boolean(currentAddress && jobOwnerAddress && currentAddress === jobOwnerAddress);

  const fetchProposals = async () => {
    if (!job?.id) return;
    try {
      if (proposals.length === 0 && !refreshing) setLoading(true);
      const res = await ApiClient.getProposalsByJob(job.id);
      if (res && Array.isArray(res.proposals)) {
        setProposals(res.proposals);
      } else {
        setProposals([]);
      }
    } catch {
      setProposals([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (job?.id && isPublisher) {
      fetchProposals();
    }
  }, [job?.id, isPublisher]);

  const handleAcceptProposal = async (proposalId: string) => {
    const proposal = proposals.find((p) => p.id === proposalId);
    if (proposal && proposal.status === 'ACCEPTED') {
      Alert.alert('Already Accepted', 'This proposal has already been accepted and initialized.');
      return;
    }

    try {
      setActionLoadingId(proposalId);
      const res = await ApiClient.acceptProposal(proposalId);

      // Mark this proposal as ACCEPTED locally
      setProposals((prev) =>
        prev.map((p) => (p.id === proposalId ? { ...p, status: 'ACCEPTED' } : p))
      );

      Alert.alert(
        'Proposal Accepted! 🎉',
        'Project initialized with milestone escrow structure. Opening Project Workspace to fund escrow...',
        [
          {
            text: 'Go to Workspace',
            onPress: () => {
              if (res.project) {
                onProjectCreated(res.project);
              }
            },
          },
        ]
      );
      if (res.project) {
        onProjectCreated(res.project);
      }
    } catch (err) {
      Alert.alert('Acceptance Failed', err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setActionLoadingId(null);
    }
  };

  if (!isPublisher) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.app }}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <Header title="Proposals Restricted" onBack={onBack} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <Icon name="shield" size={48} color="#EF4444" />
          <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text.primary, marginTop: 16, textAlign: 'center' }}>
            Access Restricted
          </Text>
          <Text style={{ fontSize: 14, color: colors.text.secondary, marginTop: 8, textAlign: 'center', lineHeight: 20 }}>
            Only the client who published this gig can review applicants, view private bids, and fund milestone escrow.
          </Text>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onBack}
            style={{ marginTop: 24, backgroundColor: colors.brand.primary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 }}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Return to Marketplace</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const hasAcceptedProposal = proposals.some((p) => p.status === 'ACCEPTED');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.app }}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Header
        title="Proposals Received"
        subtitle={`Job: ${job?.title || 'Gig'}`}
        onBack={onBack}
      />

      <ScrollView
        contentContainerStyle={{
          padding: spacing.layout.screenHorizontalPadding,
          gap: 16,
          paddingTop: 16,
          paddingBottom: 48,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchProposals();
            }}
            tintColor={colors.brand.primary}
          />
        }
      >
        {/* Banner */}
        <View style={styles.summaryBar}>
          <View style={{ flex: 1 }}>
            <Text style={styles.summaryBarTitle}>{job?.title}</Text>
            <Text style={styles.summaryBarSubtitle}>Budget: ${job?.budgetUsdc} USDC</Text>
          </View>
          <View style={styles.applicantsBadge}>
            <Text style={styles.applicantsBadgeText}>
              {proposals.length} Applicant{proposals.length === 1 ? '' : 's'}
            </Text>
          </View>
        </View>

        {loading ? (
          <View style={{ paddingVertical: 48, alignItems: 'center' }}>
            <ActivityIndicator color={colors.brand.primary} size="large" />
          </View>
        ) : proposals.length === 0 ? (
          <Card style={{ padding: 32, alignItems: 'center' }}>
            <Icon name="briefcase" size={36} color="#8D95A5" />
            <Text style={{ color: colors.text.primary, fontWeight: '700', fontSize: 16, marginTop: 12 }}>
              No Proposals Yet
            </Text>
            <Text style={{ color: colors.text.secondary, textAlign: 'center', marginTop: 4, fontSize: 13 }}>
              Qualified freelancers will review your gig and submit bids shortly.
            </Text>
          </Card>
        ) : (
          proposals.map((item) => {
            const profile = item.freelancer?.freelancerProfile;
            const displayName = profile?.displayName || 'Freelancer';
            const initial = displayName.charAt(0).toUpperCase();
            const isAccepted = item.status === 'ACCEPTED';

            return (
              <Card key={item.id} style={styles.applicantCard}>
                {/* Applicant Header */}
                <View style={styles.applicantHeader}>
                  <View style={styles.avatarCircle}>
                    <Text style={styles.avatarInitial}>{initial}</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={styles.applicantName}>{displayName}</Text>
                      {profile?.completedProjectsCount > 0 && (
                        <Icon name="checkCircle" size={14} color="#10B981" />
                      )}
                    </View>
                    <Text style={styles.applicantTitle} numberOfLines={1}>
                      {profile?.title || 'Smart Contract Engineer'}
                    </Text>
                  </View>
                  <View style={styles.bidPill}>
                    <Text style={styles.bidAmount}>${item.proposedPriceUsdc}</Text>
                    <Text style={styles.bidCurrency}>USDC</Text>
                  </View>
                </View>

                {/* Reputation Badge */}
                <View style={{ marginTop: 4 }}>
                  <VerifiedReputationBadge
                    score={profile?.reputationScore || 0}
                    isVerified={Boolean(profile?.completedProjectsCount > 0)}
                  />
                </View>

                {/* Pitch / Cover Letter */}
                <Text style={styles.pitchText}>{item.coverLetter}</Text>

                {/* Milestone Plan */}
                <View style={styles.milestonesBox}>
                  <Text style={styles.milestonesTitle}>
                    Milestone Breakdown ({item.milestonePlan?.length || 0}):
                  </Text>
                  {item.milestonePlan?.map((m: any, idx: number) => (
                    <View key={idx} style={styles.milestoneRow}>
                      <View style={styles.milestoneDot} />
                      <Text style={styles.milestoneName} numberOfLines={1}>
                        {m.description}
                      </Text>
                      <Text style={styles.milestoneCost}>${m.amountUsdc}</Text>
                    </View>
                  ))}
                </View>

                {/* Action CTA */}
                {isAccepted ? (
                  <View style={{ backgroundColor: '#ECFDF5', padding: 14, borderRadius: 12, alignItems: 'center' }}>
                    <Text style={{ color: '#059669', fontWeight: '700', fontSize: 14 }}>
                      ✅ Proposal Accepted & Awarded
                    </Text>
                  </View>
                ) : hasAcceptedProposal ? (
                  <View style={{ backgroundColor: '#F3F4F6', padding: 14, borderRadius: 12, alignItems: 'center' }}>
                    <Text style={{ color: '#6B7280', fontWeight: '600', fontSize: 13 }}>
                      Gig Awarded to Another Freelancer
                    </Text>
                  </View>
                ) : (
                  <Button
                    title="Accept Proposal & Fund Escrow"
                    onPress={() => handleAcceptProposal(item.id)}
                    loading={actionLoadingId === item.id}
                  />
                )}
              </Card>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  summaryBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EEF0F8',
    shadowColor: '#5B4DFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryBarTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1D2E',
  },
  summaryBarSubtitle: {
    fontSize: 12,
    color: '#697089',
    marginTop: 2,
  },
  applicantsBadge: {
    backgroundColor: '#F0EEFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  applicantsBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5B4DFF',
  },
  applicantCard: {
    padding: 18,
    gap: 12,
  },
  applicantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EAE6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 18,
    fontWeight: '700',
    color: '#5B4DFF',
  },
  applicantName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1D2E',
  },
  applicantTitle: {
    fontSize: 12,
    color: '#697089',
    marginTop: 1,
  },
  bidPill: {
    alignItems: 'flex-end',
    backgroundColor: '#F6F7FB',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EEF0F8',
  },
  bidAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1D2E',
  },
  bidCurrency: {
    fontSize: 10,
    fontWeight: '600',
    color: '#5B4DFF',
  },
  pitchText: {
    fontSize: 13,
    color: '#4A5068',
    lineHeight: 18,
  },
  milestonesBox: {
    backgroundColor: '#F8FAFD',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EEF0F8',
  },
  milestonesTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1A1D2E',
    marginBottom: 8,
  },
  milestoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  milestoneDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#5B4DFF',
  },
  milestoneName: {
    fontSize: 12,
    color: '#697089',
    flex: 1,
  },
  milestoneCost: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1A1D2E',
  },
});
