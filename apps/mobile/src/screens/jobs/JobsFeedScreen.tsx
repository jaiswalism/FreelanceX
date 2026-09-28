import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { defaultTheme } from '../../theme/index.js';
import { Header, Card, Badge, Input, Button } from '../../components/index.js';
import { ApiClient } from '../../services/api/apiClient.js';

interface JobsFeedScreenProps {
  onSelectJob: (jobId: string) => void;
  onCreateJobPress: () => void;
  walletAddress?: string;
}

export const JobsFeedScreen: React.FC<JobsFeedScreenProps> = ({
  onSelectJob,
  onCreateJobPress,
  walletAddress,
}) => {
  const { colors, typography, spacing } = defaultTheme;

  const [jobs, setJobs] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await ApiClient.listJobs({ query: searchQuery || undefined });
      if (res.jobs) {
        setJobs(res.jobs);
      }
    } catch {
      // Fallback sample data if backend is offline
      setJobs([
        {
          id: 'job-1',
          title: 'Base Sepolia Escrow Smart Contract Audit',
          description: 'Need experienced Solidity security researcher to audit non-upgradeable milestone escrow contracts.',
          budgetUsdc: '2500',
          skills: ['Solidity', 'Foundry', 'Security', 'Base'],
          proposalsCount: 3,
          createdAt: new Date().toISOString(),
          client: { address: '0x324...89ab' },
        },
        {
          id: 'job-2',
          title: 'React Native Android Fintech DApp Interface',
          description: 'Build high-contrast dark mode interfaces for EVM wallet interaction and milestone deliverables.',
          budgetUsdc: '1800',
          skills: ['React Native', 'TypeScript', 'Viem', 'Mobile'],
          proposalsCount: 5,
          createdAt: new Date().toISOString(),
          client: { address: '0x124...43fa' },
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [searchQuery]);

  const renderJobItem = ({ item }: { item: any }) => (
    <TouchableOpacity activeOpacity={0.8} onPress={() => onSelectJob(item.id)}>
      <Card style={{ marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <Text
            style={{
              color: colors.text.primary,
              fontSize: typography.scale.heading3.fontSize,
              fontWeight: '700',
              flex: 1,
              marginRight: 10,
            }}
          >
            {item.title}
          </Text>
          <Badge label={`${item.budgetUsdc} USDC`} variant="brand" />
        </View>

        <Text
          numberOfLines={2}
          style={{
            color: colors.text.secondary,
            fontSize: typography.scale.body.fontSize,
            marginBottom: 12,
          }}
        >
          {item.description}
        </Text>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
          {item.skills?.map((skill: string, index: number) => (
            <Badge key={index} label={skill} variant="info" />
          ))}
        </View>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTopWidth: 1,
            borderTopColor: colors.border.subtle,
            paddingTop: 8,
          }}
        >
          <Text
            style={{
              color: colors.text.tertiary,
              fontSize: typography.scale.caption.fontSize,
              fontFamily: typography.fontFamily.numeric,
            }}
          >
            Proposals: {item.proposalsCount || 0}
          </Text>
          <Text style={{ color: colors.brand.primary, fontSize: typography.scale.label.fontSize, fontWeight: '600' }}>
            View Details & Apply →
          </Text>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.app }}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background.secondary} />
      <Header
        title="Marketplace"
        subtitle="Discover Base Sepolia escrow jobs"
        walletAddress={walletAddress}
      />

      <View style={{ padding: spacing.layout.screenHorizontalPadding, flex: 1 }}>
        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center', marginBottom: 8 }}>
          <View style={{ flex: 1 }}>
            <Input
              placeholder="Search jobs by keyword or skill..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              containerStyle={{ marginBottom: 0 }}
            />
          </View>
          <Button
            title="+ Post Job"
            onPress={onCreateJobPress}
            style={{ height: 44, paddingHorizontal: 14 }}
          />
        </View>

        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator color={colors.brand.primary} size="large" />
          </View>
        ) : (
          <FlatList
            data={jobs}
            keyExtractor={(item) => item.id}
            renderItem={renderJobItem}
            contentContainerStyle={{ paddingVertical: 12, paddingBottom: 40 }}
            ListEmptyComponent={
              <Card style={{ alignItems: 'center', padding: 24 }}>
                <Text style={{ color: colors.text.secondary, marginBottom: 8 }}>
                  No open jobs found.
                </Text>
                <Button title="Create First Job" onPress={onCreateJobPress} />
              </Card>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
};
