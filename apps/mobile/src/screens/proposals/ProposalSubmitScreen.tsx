import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
  StyleSheet,
} from 'react-native';
import { defaultTheme } from '../../theme';
import { Header, Card, Button, Input, Icon } from '../../components';
import { ApiClient } from '../../services/api/apiClient';
import { ProposedMilestone } from '@freelancerx/shared';

interface ProposalSubmitScreenProps {
  job: any;
  onBack: () => void;
  onSubmitted: () => void;
}

export const ProposalSubmitScreen: React.FC<ProposalSubmitScreenProps> = ({
  job,
  onBack,
  onSubmitted,
}) => {
  const { colors, spacing } = defaultTheme;

  const [coverLetter, setCoverLetter] = useState('');
  const [proposedPriceUsdc, setProposedPriceUsdc] = useState(job?.budgetUsdc || '1000');
  const [proposedDurationDays, setProposedDurationDays] = useState('14');
  const [milestones] = useState<ProposedMilestone[]>([
    {
      description: 'Milestone 1: Architectural Design & Core Contract Implementation',
      amountUsdc: '500',
      durationDays: 7,
    },
    {
      description: 'Milestone 2: Unit Testing, Invariant Fuzzing & Deployment Scripts',
      amountUsdc: '500',
      durationDays: 7,
    },
  ]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!coverLetter || coverLetter.length < 20) {
      Alert.alert('Cover Letter Required', 'Please provide a clear pitch explaining your approach (at least 20 characters).');
      return;
    }

    try {
      setLoading(true);
      await ApiClient.submitProposal(job.id, {
        coverLetter,
        proposedPriceUsdc,
        proposedDurationDays: parseInt(proposedDurationDays, 10) || 14,
        proposedMilestones: milestones,
      });

      Alert.alert('Proposal Submitted! 🚀', 'The client will review your proposal and can accept it to initiate milestone escrow.');
      onSubmitted();
    } catch (err) {
      Alert.alert('Submission Failed', err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.app }}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Header
        title="Submit Proposal"
        subtitle={`Gig: ${job?.title || 'Job'}`}
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
      >
        {/* Job Summary Banner */}
        <Card style={styles.jobCard}>
          <View style={styles.jobHeader}>
            <Text style={styles.jobTitle} numberOfLines={2}>
              {job?.title}
            </Text>
            <View style={styles.pricePill}>
              <Text style={styles.pricePillText}>${job?.budgetUsdc} USDC</Text>
            </View>
          </View>
          <Text style={styles.jobDescription} numberOfLines={3}>
            {job?.description}
          </Text>
        </Card>

        {/* Protection Note */}
        <View style={styles.escrowPill}>
          <Icon name="shield" size={16} color="#10B981" />
          <Text style={styles.escrowPillText}>
            Guaranteed Payout: Funds locked in escrow before start
          </Text>
        </View>

        {/* Proposal Form Card */}
        <Card style={styles.formCard}>
          <Text style={styles.sectionTitle}>Your Pitch & Terms</Text>

          <Input
            label="Cover Letter / Proposal"
            placeholder="Introduce your relevant experience, proposed technical architecture, deliverables, and estimated completion..."
            value={coverLetter}
            onChangeText={setCoverLetter}
            multiline
            numberOfLines={5}
            style={{ height: 120, textAlignVertical: 'top' }}
          />

          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Input
                label="Bid Amount (USDC)"
                value={proposedPriceUsdc}
                onChangeText={setProposedPriceUsdc}
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Input
                label="Delivery (Days)"
                value={proposedDurationDays}
                onChangeText={setProposedDurationDays}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Milestones Breakdown */}
          <View style={{ marginTop: 8 }}>
            <View style={styles.milestonesHeader}>
              <Text style={styles.milestonesTitle}>Milestone Breakdown</Text>
              <Text style={styles.milestonesSubtitle}>{milestones.length} Milestones</Text>
            </View>

            {milestones.map((m, idx) => (
              <View key={idx} style={styles.milestoneItem}>
                <View style={styles.milestoneTop}>
                  <View style={styles.milestoneIndexBadge}>
                    <Text style={styles.milestoneIndexText}>#{idx + 1}</Text>
                  </View>
                  <Text style={styles.milestoneAmount}>${m.amountUsdc} USDC</Text>
                </View>
                <Text style={styles.milestoneDescription}>{m.description}</Text>
                <View style={styles.milestoneDurationRow}>
                  <Icon name="clock" size={12} color="#8D95A5" />
                  <Text style={styles.milestoneDurationText}>{m.durationDays} Days target</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
            <Button
              title="Back"
              onPress={onBack}
              variant="secondary"
              style={{ flex: 1 }}
            />
            <Button
              title="Send Proposal"
              onPress={handleSubmit}
              loading={loading}
              style={{ flex: 2 }}
            />
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  jobCard: {
    padding: 18,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 12,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1D2E',
    flex: 1,
  },
  pricePill: {
    backgroundColor: '#F0EEFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  pricePillText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#5B4DFF',
  },
  jobDescription: {
    fontSize: 13,
    color: '#697089',
    lineHeight: 18,
  },
  escrowPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8FAF3',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: '#C6F4E2',
  },
  escrowPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#065F46',
  },
  formCard: {
    padding: 18,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1D2E',
    marginBottom: 16,
  },
  milestonesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  milestonesTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1D2E',
  },
  milestonesSubtitle: {
    fontSize: 12,
    color: '#8D95A5',
  },
  milestoneItem: {
    backgroundColor: '#F8FAFD',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EEF0F8',
  },
  milestoneTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  milestoneIndexBadge: {
    backgroundColor: '#EAE6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  milestoneIndexText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#5B4DFF',
  },
  milestoneAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1D2E',
  },
  milestoneDescription: {
    fontSize: 13,
    color: '#4A5068',
    lineHeight: 17,
    marginBottom: 6,
  },
  milestoneDurationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  milestoneDurationText: {
    fontSize: 11,
    color: '#8D95A5',
    fontWeight: '500',
  },
});
