import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
  TouchableOpacity,
  StyleSheet,
  TextInput,
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

  const initialBudget = parseInt(job?.budgetUsdc || '1000', 10);
  const halfBudget = Math.floor(initialBudget / 2).toString();

  const [coverLetter, setCoverLetter] = useState('');
  const [proposedDurationDays, setProposedDurationDays] = useState('14');
  const [milestones, setMilestones] = useState<ProposedMilestone[]>([
    {
      description: 'Milestone 1: Architecture, Core Implementation & Specification',
      amountUsdc: halfBudget,
      durationDays: 7,
    },
    {
      description: 'Milestone 2: Security Verification, Unit Testing & Final Deployment',
      amountUsdc: (initialBudget - parseInt(halfBudget, 10)).toString(),
      durationDays: 7,
    },
  ]);
  const [loading, setLoading] = useState(false);

  // Total bid amount is dynamically computed from milestone sum
  const computedTotalUsdc = milestones.reduce((sum, m) => {
    const val = parseFloat(m.amountUsdc) || 0;
    return sum + val;
  }, 0);

  const handleAddMilestone = () => {
    const nextIdx = milestones.length + 1;
    setMilestones([
      ...milestones,
      {
        description: `Milestone ${nextIdx}: Deliverable & Code Review`,
        amountUsdc: '500',
        durationDays: 7,
      },
    ]);
  };

  const handleRemoveMilestone = (index: number) => {
    if (milestones.length <= 1) {
      Alert.alert('Minimum Milestones', 'A proposal must include at least 1 milestone deliverable.');
      return;
    }
    const updated = milestones.filter((_, i) => i !== index);
    setMilestones(updated);
  };

  const handleUpdateMilestone = (
    index: number,
    field: keyof ProposedMilestone,
    value: string | number
  ) => {
    const updated = [...milestones];
    const current = updated[index];
    if (current) {
      updated[index] = {
        ...current,
        [field]: value,
      } as ProposedMilestone;
      setMilestones(updated);
    }
  };

  const handleSubmit = async () => {
    if (!coverLetter.trim() || coverLetter.trim().length < 15) {
      Alert.alert('Cover Letter Required', 'Please provide a clear pitch explaining your approach (at least 15 characters).');
      return;
    }

    for (let i = 0; i < milestones.length; i++) {
      const m = milestones[i];
      if (!m || !m.description?.trim()) {
        Alert.alert('Incomplete Milestone', `Please provide a description for Milestone #${i + 1}.`);
        return;
      }
      if (!m.amountUsdc || parseFloat(m.amountUsdc) <= 0) {
        Alert.alert('Invalid Milestone Budget', `Milestone #${i + 1} must have a valid USDC amount.`);
        return;
      }
    }

    try {
      setLoading(true);
      await ApiClient.submitProposal(job.id, {
        coverLetter: coverLetter.trim(),
        proposedPriceUsdc: computedTotalUsdc.toString(),
        proposedDurationDays: parseInt(proposedDurationDays, 10) || 14,
        proposedMilestones: milestones,
      });

      Alert.alert('Proposal Submitted! 🚀', 'Your milestone bid has been submitted to the client. You can track it in My Bids.');
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
            Smart Escrow Protection: Client funds escrow before you begin work
          </Text>
        </View>

        {/* Pitch & Timeline Form */}
        <Card style={styles.formCard}>
          <Text style={styles.sectionTitle}>Your Pitch & Terms</Text>

          <Input
            label="Cover Letter / Proposal"
            placeholder="Introduce your relevant experience, proposed technical architecture, deliverables, and estimated completion..."
            value={coverLetter}
            onChangeText={setCoverLetter}
            multiline
            numberOfLines={4}
            style={{ height: 100, textAlignVertical: 'top' }}
          />

          <View style={{ flexDirection: 'row', gap: 12, marginTop: 4 }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.labelSmall}>Total Bid Amount (USDC)</Text>
              <View style={styles.totalBidDisplay}>
                <Text style={styles.totalBidValue}>${computedTotalUsdc.toFixed(2)}</Text>
                <Text style={styles.totalBidUnit}>USDC (Sum of Milestones)</Text>
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <Input
                label="Total Delivery (Days)"
                value={proposedDurationDays}
                onChangeText={setProposedDurationDays}
                keyboardType="numeric"
              />
            </View>
          </View>
        </Card>

        {/* Editable Milestones Section */}
        <View style={styles.milestonesSection}>
          <View style={styles.milestonesHeaderRow}>
            <View>
              <Text style={styles.milestonesTitle}>Milestone Breakdown</Text>
              <Text style={styles.milestonesSubtitle}>
                Add deliverables and allocate USDC per milestone
              </Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleAddMilestone}
              style={styles.addMilestoneBtn}
            >
              <Icon name="plus" size={14} color="#5B4DFF" strokeWidth={2.5} />
              <Text style={styles.addMilestoneBtnText}>Add Milestone</Text>
            </TouchableOpacity>
          </View>

          {milestones.map((m, idx) => (
            <Card key={idx} style={styles.milestoneCard}>
              <View style={styles.milestoneCardHeader}>
                <View style={styles.milestoneBadge}>
                  <Text style={styles.milestoneBadgeText}>Milestone #{idx + 1}</Text>
                </View>
                {milestones.length > 1 && (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => handleRemoveMilestone(idx)}
                    style={styles.removeMilestoneBtn}
                  >
                    <Text style={styles.removeMilestoneBtnText}>Remove</Text>
                  </TouchableOpacity>
                )}
              </View>

              <Text style={styles.inputLabel}>Deliverable Title & Scope</Text>
              <TextInput
                style={styles.milestoneTextInput}
                placeholder="e.g. Smart contract audit, invariant tests, report..."
                placeholderTextColor="#9CA3AF"
                value={m.description}
                onChangeText={(val) => handleUpdateMilestone(idx, 'description', val)}
              />

              <View style={styles.milestoneInputsRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Amount (USDC)</Text>
                  <TextInput
                    style={styles.milestoneNumInput}
                    placeholder="500"
                    placeholderTextColor="#9CA3AF"
                    value={m.amountUsdc}
                    keyboardType="numeric"
                    onChangeText={(val) => handleUpdateMilestone(idx, 'amountUsdc', val)}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Duration (Days)</Text>
                  <TextInput
                    style={styles.milestoneNumInput}
                    placeholder="7"
                    placeholderTextColor="#9CA3AF"
                    value={m.durationDays.toString()}
                    keyboardType="numeric"
                    onChangeText={(val) =>
                      handleUpdateMilestone(idx, 'durationDays', parseInt(val, 10) || 1)
                    }
                  />
                </View>
              </View>
            </Card>
          ))}
        </View>

        {/* Submit Action */}
        <Button
          title={`Submit Proposal ($${computedTotalUsdc.toFixed(2)} USDC)`}
          onPress={handleSubmit}
          loading={loading}
          style={{ marginTop: 8 }}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  jobCard: {
    padding: 16,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
    marginRight: 12,
  },
  pricePill: {
    backgroundColor: '#F0EEFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  pricePillText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#5B4DFF',
  },
  jobDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  escrowPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  escrowPillText: {
    fontSize: 12,
    color: '#065F46',
    fontWeight: '600',
    flex: 1,
  },
  formCard: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  labelSmall: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  totalBidDisplay: {
    height: 48,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  totalBidValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#5B4DFF',
  },
  totalBidUnit: {
    fontSize: 10,
    color: '#6B7280',
  },
  milestonesSection: {
    gap: 12,
  },
  milestonesHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  milestonesTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  milestonesSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  addMilestoneBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0EEFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addMilestoneBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5B4DFF',
  },
  milestoneCard: {
    padding: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EEF0F8',
  },
  milestoneCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  milestoneBadge: {
    backgroundColor: '#F0EEFF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  milestoneBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#5B4DFF',
  },
  removeMilestoneBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  removeMilestoneBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#EF4444',
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 4,
  },
  milestoneTextInput: {
    height: 42,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 13,
    color: '#111827',
    backgroundColor: '#F9FAFB',
    marginBottom: 10,
  },
  milestoneInputsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  milestoneNumInput: {
    height: 42,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 13,
    color: '#111827',
    backgroundColor: '#F9FAFB',
  },
});
