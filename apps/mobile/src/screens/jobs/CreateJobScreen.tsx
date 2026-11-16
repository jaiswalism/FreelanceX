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
} from 'react-native';
import { defaultTheme } from '../../theme';
import { Header, Card, Button, Input, Icon } from '../../components';
import { ApiClient } from '../../services/api/apiClient';

interface CreateJobScreenProps {
  onBack: () => void;
  onJobCreated: (job: any) => void;
}

export const CreateJobScreen: React.FC<CreateJobScreenProps> = ({
  onBack,
  onJobCreated,
}) => {
  const { colors, spacing } = defaultTheme;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budgetUsdc, setBudgetUsdc] = useState('1500');
  const [skillsInput, setSkillsInput] = useState('Solidity, Foundry, Sepolia');
  const [durationDays, setDurationDays] = useState('14');
  const [loading, setLoading] = useState(false);

  const budgetPresets = ['500', '1000', '2500', '5000'];
  const durationPresets = [
    { label: '7 Days', val: '7' },
    { label: '14 Days', val: '14' },
    { label: '30 Days', val: '30' },
  ];

  const handleSubmit = async () => {
    if (!title || !description || !budgetUsdc) {
      Alert.alert('Missing Information', 'Please fill in Title, Description, and Budget.');
      return;
    }

    const skills = skillsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      setLoading(true);
      const res = await ApiClient.createJob({
        title,
        description,
        budgetUsdc,
        skills: skills.length > 0 ? skills : ['Smart Contracts', 'Solidity'],
        estimatedDurationDays: parseInt(durationDays, 10) || 14,
      });

      Alert.alert('Job Published! 🎉', 'Your job is now live on the marketplace. Verified freelancers can submit proposals.');
      onJobCreated(res.job);
    } catch (err) {
      Alert.alert('Job Posting Failed', err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.app }}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Header
        title="Post a New Gig"
        subtitle="Set deliverables & smart contract escrow"
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
        {/* Friendly Banner */}
        <View style={styles.escrowNotice}>
          <View style={styles.noticeIconWrapper}>
            <Icon name="shield" size={20} color="#5B4DFF" />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.noticeTitle}>Escrow Guaranteed</Text>
            <Text style={styles.noticeDesc}>
              Funds remain protected in audited smart contract escrow. Released only upon your milestone approval.
            </Text>
          </View>
        </View>

        {/* Step Card */}
        <Card style={styles.card}>
          <View style={styles.stepHeader}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepText}>STEP 1 OF 2</Text>
            </View>
            <Text style={styles.stepTitle}>Job Details & Scope</Text>
          </View>

          <Input
            label="Project Title"
            placeholder="e.g. Audit ERC20 Milestone Escrow Contract"
            value={title}
            onChangeText={setTitle}
          />

          <Input
            label="Deliverables & Specification"
            placeholder="Describe scope of work, technical requirements, deliverables..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            style={{ height: 110, textAlignVertical: 'top' }}
          />

          <Input
            label="Required Skills (comma separated)"
            placeholder="Solidity, Foundry, TypeScript, React Native"
            value={skillsInput}
            onChangeText={setSkillsInput}
          />
        </Card>

        {/* Budget & Timeline Card */}
        <Card style={styles.card}>
          <View style={styles.stepHeader}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepText}>STEP 2 OF 2</Text>
            </View>
            <Text style={styles.stepTitle}>Budget & Timeline</Text>
          </View>

          <Text style={styles.fieldLabel}>Total Budget (USDC)</Text>
          <Input
            placeholder="e.g. 1500"
            keyboardType="numeric"
            value={budgetUsdc}
            onChangeText={setBudgetUsdc}
            containerStyle={{ marginBottom: 8 }}
          />

          {/* Budget Presets */}
          <View style={styles.presetRow}>
            {budgetPresets.map((b) => (
              <TouchableOpacity
                key={b}
                activeOpacity={0.7}
                onPress={() => setBudgetUsdc(b)}
                style={[
                  styles.presetChip,
                  budgetUsdc === b && styles.presetChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.presetChipText,
                    budgetUsdc === b && styles.presetChipTextActive,
                  ]}
                >
                  ${b}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.fieldLabel, { marginTop: 16 }]}>Estimated Duration</Text>
          <View style={styles.presetRow}>
            {durationPresets.map((d) => (
              <TouchableOpacity
                key={d.val}
                activeOpacity={0.7}
                onPress={() => setDurationDays(d.val)}
                style={[
                  styles.presetChip,
                  durationDays === d.val && styles.presetChipActive,
                  { flex: 1, alignItems: 'center' },
                ]}
              >
                <Text
                  style={[
                    styles.presetChipText,
                    durationDays === d.val && styles.presetChipTextActive,
                  ]}
                >
                  {d.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Action Buttons */}
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
          <Button
            title="Cancel"
            onPress={onBack}
            variant="secondary"
            style={{ flex: 1 }}
          />
          <Button
            title="Publish Gig"
            onPress={handleSubmit}
            loading={loading}
            style={{ flex: 2 }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  escrowNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0EEFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E0DBFF',
  },
  noticeIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#5B4DFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  noticeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3B2ED0',
  },
  noticeDesc: {
    fontSize: 12,
    color: '#697089',
    marginTop: 2,
    lineHeight: 16,
  },
  card: {
    padding: 18,
  },
  stepHeader: {
    marginBottom: 16,
  },
  stepBadge: {
    backgroundColor: '#F0EEFF',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginBottom: 6,
  },
  stepText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#5B4DFF',
    letterSpacing: 0.5,
  },
  stepTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1D2E',
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#697089',
    marginBottom: 8,
  },
  presetRow: {
    flexDirection: 'row',
    gap: 8,
  },
  presetChip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: '#F6F7FB',
    borderWidth: 1.5,
    borderColor: '#E3E7F4',
  },
  presetChipActive: {
    backgroundColor: '#F0EEFF',
    borderColor: '#5B4DFF',
  },
  presetChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#697089',
  },
  presetChipTextActive: {
    color: '#5B4DFF',
    fontWeight: '700',
  },
});
