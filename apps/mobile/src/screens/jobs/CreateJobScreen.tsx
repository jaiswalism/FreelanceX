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
import { Header, Card, Button, Input } from '../../components/index.js';
import { ApiClient } from '../../services/api/apiClient.js';

interface CreateJobScreenProps {
  onBack: () => void;
  onJobCreated: (job: any) => void;
}

export const CreateJobScreen: React.FC<CreateJobScreenProps> = ({
  onBack,
  onJobCreated,
}) => {
  const { colors, typography, spacing } = defaultTheme;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budgetUsdc, setBudgetUsdc] = useState('');
  const [skillsInput, setSkillsInput] = useState('');
  const [durationDays, setDurationDays] = useState('14');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title || !description || !budgetUsdc) {
      Alert.alert('Missing Fields', 'Please fill in Title, Description, and Budget.');
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

      Alert.alert('Success', 'Job posted to marketplace successfully!');
      onJobCreated(res.job);
    } catch (err) {
      Alert.alert('Job Posting Failed', err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.app }}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background.secondary} />
      <Header
        title="Post New Job"
        subtitle="Specify deliverables & USDC escrow budget"
      />

      <ScrollView
        contentContainerStyle={{
          padding: spacing.layout.screenHorizontalPadding,
          gap: 16,
          paddingBottom: 40,
        }}
      >
        <Card>
          <Text
            style={{
              color: colors.text.primary,
              fontSize: typography.scale.heading3.fontSize,
              fontWeight: '700',
              marginBottom: 16,
            }}
          >
            Job Details
          </Text>

          <Input
            label="Job Title"
            placeholder="e.g. Audit ERC20 Milestone Escrow Contract"
            value={title}
            onChangeText={setTitle}
          />

          <Input
            label="Description & Scope"
            placeholder="Detailed description of requirements, milestones, deliverables..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            style={{ height: 100, textAlignVertical: 'top' }}
          />

          <Input
            label="Total Budget (USDC)"
            placeholder="e.g. 1500"
            keyboardType="numeric"
            value={budgetUsdc}
            onChangeText={setBudgetUsdc}
          />

          <Input
            label="Skills Required (comma separated)"
            placeholder="Solidity, Foundry, TypeScript, Viem"
            value={skillsInput}
            onChangeText={setSkillsInput}
          />

          <Input
            label="Estimated Duration (Days)"
            placeholder="14"
            keyboardType="numeric"
            value={durationDays}
            onChangeText={setDurationDays}
          />

          <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
            <Button
              title="Cancel"
              onPress={onBack}
              variant="secondary"
              style={{ flex: 1 }}
            />
            <Button
              title="Publish Job"
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
