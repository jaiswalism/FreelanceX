import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { defaultTheme } from '../../theme/index.js';
import { Header, Card, Button, Badge } from '../../components/index.js';
import { ApiClient } from '../../services/api/apiClient.js';

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
  const { colors, typography, spacing } = defaultTheme;

  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchProposals = async () => {
    try {
      setLoading(true);
      const res = await ApiClient.getProposalsByJob(job.id);
      if (res.proposals) {
        setProposals(res.proposals);
      }
    } catch {
      // Fallback sample proposal for UI testing
      setProposals([
        {
          id: 'prop-1',
          freelancer: {
            address: '0x71C...392A',
            freelancerProfile: {
              displayName: 'Alex Rivers',
              title: 'Senior Smart Contract & Security Architect',
              rating: 5.0,
              completedProjectsCount: 14,
            },
          },
          coverLetter: 'I have built and audited 10+ milestone escrow protocols on Base Sepolia. Can complete deliverables cleanly in 14 days.',
          proposedPriceUsdc: '2500',
          proposedDurationDays: 14,
          status: 'PENDING',
          milestonePlan: [
            { description: 'Architecture & Escrow Contract', amountUsdc: '1250', durationDays: 7 },
            { description: 'Testing, Invariants & Security Review', amountUsdc: '1250', durationDays: 7 },
          ],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (job?.id) {
      fetchProposals();
    }
  }, [job?.id]);

  const handleAcceptProposal = async (proposalId: string) => {
    try {
      setActionLoadingId(proposalId);
      const res = await ApiClient.acceptProposal(proposalId);
      Alert.alert(
        'Proposal Accepted!',
        'Project initialized with milestone escrow structure. Ready to fund on-chain.'
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.app }}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background.secondary} />
      <Header
        title="Applicant Proposals"
        subtitle={`Reviewing applicants for: ${job?.title || 'Job'}`}
      />

      <ScrollView
        contentContainerStyle={{
          padding: spacing.layout.screenHorizontalPadding,
          gap: 16,
          paddingBottom: 40,
        }}
      >
        <Button title="← Back to Job Feed" onPress={onBack} variant="secondary" />

        {loading ? (
          <ActivityIndicator color={colors.brand.primary} size="large" />
        ) : proposals.length === 0 ? (
          <Card style={{ padding: 24, alignItems: 'center' }}>
            <Text style={{ color: colors.text.secondary }}>No proposals received for this job yet.</Text>
          </Card>
        ) : (
          proposals.map((item) => (
            <Card key={item.id} style={{ gap: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View>
                  <Text style={{ color: colors.text.primary, fontWeight: '700', fontSize: typography.scale.heading3.fontSize }}>
                    {item.freelancer?.freelancerProfile?.displayName || 'Freelancer'}
                  </Text>
                  <Text style={{ color: colors.special.verified, fontFamily: typography.fontFamily.numeric, fontSize: 12 }}>
                    {item.freelancer?.address}
                  </Text>
                </View>
                <Badge label={`${item.proposedPriceUsdc} USDC`} variant="brand" />
              </View>

              <Text style={{ color: colors.text.secondary, fontSize: typography.scale.body.fontSize }}>
                {item.coverLetter}
              </Text>

              {/* Milestones Preview */}
              <View style={{ backgroundColor: colors.surface.raised, padding: 10, borderRadius: 8 }}>
                <Text style={{ color: colors.text.primary, fontWeight: '600', marginBottom: 6, fontSize: typography.scale.label.fontSize }}>
                  Proposed Milestones ({item.milestonePlan?.length || 0}):
                </Text>
                {item.milestonePlan?.map((m: any, idx: number) => (
                  <Text key={idx} style={{ color: colors.text.secondary, fontSize: typography.scale.caption.fontSize }}>
                    • #{idx + 1}: {m.description} — <Text style={{ color: colors.special.verified }}>{m.amountUsdc} USDC</Text>
                  </Text>
                ))}
              </View>

              <Button
                title="Accept Proposal & Hire"
                onPress={() => handleAcceptProposal(item.id)}
                loading={actionLoadingId === item.id}
              />
            </Card>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};
