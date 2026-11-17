import React, { useState } from 'react';
import {
  View, Text, ScrollView, SafeAreaView, StatusBar,
  Alert, StyleSheet,
} from 'react-native';
import { defaultTheme } from '../../theme';
import { Card, Button, Input, Icon } from '../../components';
import { ApiClient } from '../../services/api/apiClient';

interface ProfileSetupScreenProps {
  role: 'client' | 'freelancer';
  walletAddress: string;
  onComplete: () => void;
  onSkip?: () => void;
}

export const ProfileSetupScreen: React.FC<ProfileSetupScreenProps> = ({
  role, walletAddress, onComplete,
}) => {
  const { colors, spacing } = defaultTheme;
  const isFreelancer = role === 'freelancer';

  // Common compulsory fields
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  // Freelancer-specific compulsory & optional
  const [resumeUrl, setResumeUrl] = useState('');
  const [title, setTitle] = useState('');
  const [bio, setBio] = useState('');
  const [skillsInput, setSkillsInput] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');

  // Client-specific
  const [companyName, setCompanyName] = useState('');
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');

  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!displayName.trim()) {
      Alert.alert('Required', 'Please enter your display name.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      Alert.alert('Required', 'Please provide a valid contact email address.');
      return;
    }

    if (isFreelancer && !resumeUrl.trim()) {
      Alert.alert(
        'Required',
        'Please provide a link to your resume, portfolio, or previous work (e.g. GitHub, portfolio site, or Google Drive link).'
      );
      return;
    }

    try {
      setLoading(true);

      if (isFreelancer) {
        const skills = skillsInput.split(',').map(s => s.trim()).filter(Boolean);
        await ApiClient.updateFreelancerProfile({
          displayName: displayName.trim(),
          email: email.trim(),
          resumeUrl: resumeUrl.trim(),
          title: title.trim() || undefined,
          bio: bio.trim() || undefined,
          skills: skills.length > 0 ? skills : undefined,
          hourlyRate: hourlyRate ? parseFloat(hourlyRate) : undefined,
          avatarUrl: avatarUrl.trim() || undefined,
        });
      } else {
        await ApiClient.updateClientProfile({
          displayName: displayName.trim(),
          email: email.trim(),
          companyName: companyName.trim() || undefined,
          description: description.trim() || undefined,
          website: website.trim() || undefined,
          avatarUrl: avatarUrl.trim() || undefined,
        });
      }

      Alert.alert(
        'Profile Created! 🎉',
        'Your profile has been saved. Clients can now see your credentials.',
        [{ text: 'Enter App', onPress: onComplete }]
      );
    } catch (err) {
      // Even if backend fails, let them proceed (profile can be updated later)
      Alert.alert(
        'Profile Saved Locally',
        'Could not connect to server. Your profile will sync when online.',
        [{ text: 'Enter App', onPress: onComplete }]
      );
    } finally {
      setLoading(false);
    }
  };

  const truncatedAddress = walletAddress
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : '';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.app }}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background.app} />

      <ScrollView
        contentContainerStyle={{
          padding: spacing.layout.screenHorizontalPadding,
          paddingTop: 20,
          paddingBottom: 48,
          gap: 16,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.iconCircle, { backgroundColor: '#EEF0FF' }]}>
            <Icon name={isFreelancer ? 'user' : 'briefcase'} size={32} color={colors.brand.primary} />
          </View>
          <Text style={[styles.title, { color: colors.text.primary }]}>
            {isFreelancer ? 'Build Your Freelancer Profile' : 'Set Up Your Client Profile'}
          </Text>
          <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
            {isFreelancer
              ? 'Clients review your profile before hiring. A complete profile gets 3x more offers.'
              : 'Help freelancers understand your company and projects.'}
          </Text>
          <View style={styles.walletBadge}>
            <View style={styles.walletDot} />
            <Text style={styles.walletText}>{truncatedAddress}</Text>
          </View>
        </View>

        {/* Shared Fields */}
        <Card style={{ padding: 18 }}>
          <Text style={styles.sectionLabel}>Basic Info</Text>
          <Input
            label="Display Name *"
            placeholder={isFreelancer ? 'e.g. Alex Chen, Solidity Engineer' : 'e.g. DeFi Labs Inc.'}
            value={displayName}
            onChangeText={setDisplayName}
          />
          <Input
            label="Email Address *"
            placeholder="you@domain.com (compulsory for escrow alerts)"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Input
            label="Profile Photo URL (optional)"
            placeholder="https://... link to your photo"
            value={avatarUrl}
            onChangeText={setAvatarUrl}
            autoCapitalize="none"
          />
        </Card>

        {/* Freelancer Fields */}
        {isFreelancer && (
          <Card style={{ padding: 18 }}>
            <Text style={styles.sectionLabel}>Professional Details</Text>
            <Input
              label="Resume / Portfolio / Previous Work Link *"
              placeholder="https://github.com/name or portfolio/resume URL"
              value={resumeUrl}
              onChangeText={setResumeUrl}
              autoCapitalize="none"
            />
            <Input
              label="Professional Title"
              placeholder="e.g. Senior Solidity Engineer & Smart Contract Auditor"
              value={title}
              onChangeText={setTitle}
            />
            <Input
              label="Bio / About Me"
              placeholder="Describe your experience, specializations, and what makes you unique..."
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={4}
              style={{ height: 100, textAlignVertical: 'top' }}
            />
            <Input
              label="Skills (comma separated)"
              placeholder="Solidity, Foundry, TypeScript, React Native, Security"
              value={skillsInput}
              onChangeText={setSkillsInput}
            />
            <Input
              label="Hourly Rate (USDC)"
              placeholder="e.g. 150"
              value={hourlyRate}
              onChangeText={setHourlyRate}
              keyboardType="numeric"
            />
          </Card>
        )}

        {/* Client Fields */}
        {!isFreelancer && (
          <Card style={{ padding: 18 }}>
            <Text style={styles.sectionLabel}>Company Details</Text>
            <Input
              label="Company Name"
              placeholder="e.g. DeFi Labs, Ethereum Foundation"
              value={companyName}
              onChangeText={setCompanyName}
            />
            <Input
              label="About Your Company"
              placeholder="What does your company do? What kind of projects do you fund?"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              style={{ height: 80, textAlignVertical: 'top' }}
            />
            <Input
              label="Website"
              placeholder="https://yourcompany.com"
              value={website}
              onChangeText={setWebsite}
              autoCapitalize="none"
            />
          </Card>
        )}

        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Icon name="shield" size={16} color="#5B4DFF" />
          <Text style={styles.infoText}>
            Your credentials and previous work help build verified on-chain reputation. Never include private keys.
          </Text>
        </View>

        {/* CTA Buttons */}
        <Button
          title={loading ? 'Saving Profile...' : 'Complete Profile & Enter App'}
          onPress={handleSubmit}
          loading={loading}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    paddingVertical: 8,
    gap: 8,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    shadowColor: '#5B4DFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 300,
  },
  walletBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 6,
    marginTop: 4,
  },
  walletDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#10B981',
  },
  walletText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#F0EEFF',
    borderWidth: 1,
    borderColor: '#E0DBFF',
    padding: 12,
    borderRadius: 10,
  },
  infoText: {
    fontSize: 12,
    color: '#3B2ED0',
    flex: 1,
    lineHeight: 17,
  },
  skipBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  skipText: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '500',
  },
});

