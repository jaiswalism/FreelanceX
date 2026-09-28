import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { defaultTheme } from '../../theme/index.js';
import { Header, Card, Button, Input, Badge } from '../../components/index.js';
import { ApiClient } from '../../services/api/apiClient.js';
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
  const { colors, typography, spacing } = defaultTheme;

  const [coverLetter, setCoverLetter] = useState('');
  const [proposedPriceUsdc, setProposedPriceUsdc] = useState(job?.budgetUsdc || '1000');
  const [proposedDurationDays, setProposedDurationDays] = useState('14');
  const [milestones, setMilestones] = useState<ProposedMilestone[]>([
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
      Alert.alert('Cover Letter Required', 'Please write a descriptive cover letter (minimum 20 characters).');
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

      Alert.alert('Success', 'Your proposal was submitted to the client!');
      onSubmitted();
    } catch (err) {
      Alert.alert('Proposal Submission Failed', err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.app }}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background.secondary} />
      <Header
        title="Submit Proposal"
        subtitle={`Applying for: ${job?.title || 'Job'}`}
      />

      <ScrollView
        contentContainerStyle={{
          padding: spacing.layout.screenHorizontalPadding,
          gap: 16,
          paddingBottom: 40,
        }}
      >
        {/* Job Summary */}
        <Card>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={{ color: colors.text.primary, fontWeight: '700', fontSize: typography.scale.heading3.fontSize, flex: 1 }}>
              {job?.title}
            </Text>
            <Badge label={`${job?.budgetUsdc} USDC`} variant="brand" />
          </View>
          <Text style={{ color: colors.text.secondary, fontSize: typography.scale.body.fontSize }}>
            {job?.description}
          </Text>
        </Card>

        {/* Proposal Form */}
        <Card>
          <Text style={{ color: colors.text.primary, fontWeight: '700', fontSize: typography.scale.heading3.fontSize, marginBottom: 16 }}>
            Your Offer
          </Text>

          <Input
            label="Cover Letter / Approach"
            placeholder="Explain your technical approach, relevant past experience, and deliverables..."
            value={coverLetter}
            onChangeText={setCoverLetter}
            multiline
            numberOfLines={5}
            style={{ height: 120, textAlignVertical: 'top' }}
          />

          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Input
                label="Proposed Price (USDC)"
                value={proposedPriceUsdc}
                onChangeText={setProposedPriceUsdc}
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Input
                label="Duration (Days)"
                value={proposedDurationDays}
                onChangeText={setProposedDurationDays}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Milestone Plan */}
          <Text style={{ color: colors.text.primary, fontWeight: '600', marginBottom: 8 }}>
            Proposed Milestone Breakdown ({milestones.length} milestones)
          </Text>

          {milestones.map((m, idx) => (
            <View
              key={idx}
              style={{
                backgroundColor: colors.surface.raised,
                padding: 12,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: colors.border.subtle,
                marginBottom: 8,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={{ color: colors.text.primary, fontWeight: '600' }}>
                  Milestone #{idx + 1}
                </Text>
                <Text style={{ color: colors.brand.primary, fontFamily: typography.fontFamily.numeric, fontWeight: '700' }}>
                  {m.amountUsdc} USDC
                </Text>
              </View>
              <Text style={{ color: colors.text.secondary, fontSize: typography.scale.caption.fontSize }}>
                {m.description} ({m.durationDays} days)
              </Text>
            </View>
          ))}

          <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
            <Button title="Back" onPress={onBack} variant="secondary" style={{ flex: 1 }} />
            <Button title="Submit Proposal" onPress={handleSubmit} loading={loading} style={{ flex: 2 }} />
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};
