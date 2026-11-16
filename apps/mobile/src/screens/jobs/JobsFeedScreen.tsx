import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { defaultTheme } from '../../theme';
import { Card, Input, Button, Icon } from '../../components';
import { ApiClient } from '../../services/api/apiClient';

interface JobsFeedScreenProps {
  onSelectJob: (job: any) => void;
  onCreateJobPress: () => void;
  walletAddress?: string;
  isClient?: boolean;
}

export const JobsFeedScreen: React.FC<JobsFeedScreenProps> = ({
  onSelectJob,
  onCreateJobPress,
  isClient = true,
}) => {
  const { colors, spacing, radii } = defaultTheme;

  const [jobs, setJobs] = useState<any[]>(() => ApiClient.getLocalJobs());
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchJobs = async () => {
    try {
      if (jobs.length === 0 && !refreshing) setLoading(true);
      const res = await ApiClient.listJobs({ query: searchQuery.trim() || undefined });
      if (res.jobs && res.jobs.length > 0) {
        setJobs(res.jobs);
      }
    } catch {
      if (jobs.length === 0) {
        setJobs(ApiClient.getLocalJobs());
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchJobs();
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const renderHeroBanner = () => (
    <View style={[styles.heroCard, { backgroundColor: colors.brand.primary, borderRadius: radii.card }]}>
      <View style={styles.heroTopRow}>
        <View style={styles.heroIconBadge}>
          <Icon name="shield" size={18} color="#FFFFFF" />
        </View>
        <View style={styles.networkPill}>
          <Text style={styles.networkDot}>●</Text>
          <Text style={styles.networkText}>Ethereum Sepolia</Text>
        </View>
      </View>

      <Text style={styles.heroTitle}>Decentralized Escrow</Text>
      <Text style={styles.heroSubtitle}>Pay, Secure & Build Verified Trust on Sepolia</Text>

      <View style={styles.heroStatsRow}>
        <View style={styles.heroStatItem}>
          <Text style={styles.heroStatLabel}>Active Verified Gigs</Text>
          <Text style={styles.heroStatValue}>{jobs.length} Open</Text>
        </View>
        {isClient && (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onCreateJobPress}
            style={styles.heroActionButton}
          >
            <Icon name="plus" size={16} color={colors.brand.primary} />
            <Text style={[styles.heroActionText, { color: colors.brand.primary }]}>Post Gig</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderJobItem = ({ item }: { item: any }) => (
    <TouchableOpacity activeOpacity={0.85} onPress={() => onSelectJob(item)}>
      <Card style={styles.jobCard}>
        <View style={styles.jobHeader}>
          <Text style={[styles.jobTitle, { color: colors.text.primary }]}>
            {item.title}
          </Text>
          <View style={styles.budgetPill}>
            <Text style={styles.budgetCurrency}>$</Text>
            <Text style={styles.budgetValue}>{item.budgetUsdc}</Text>
            <Text style={styles.budgetToken}>USDC</Text>
          </View>
        </View>

        <Text numberOfLines={2} style={[styles.jobDesc, { color: colors.text.secondary }]}>
          {item.description}
        </Text>

        <View style={styles.skillList}>
          {item.skills?.map((skill: string, index: number) => (
            <View key={index} style={styles.skillBadge}>
              <Text style={styles.skillText}>{skill}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.jobFooter, { borderTopColor: colors.border.subtle }]}>
          <View style={styles.proposalsCount}>
            <Icon name="user" size={14} color={colors.text.tertiary} />
            <Text style={[styles.proposalsText, { color: colors.text.tertiary }]}>
              {item.proposalsCount || 0} proposals
            </Text>
          </View>
          <View style={styles.applyRow}>
            <Text style={[styles.applyText, { color: colors.brand.primary }]}>
              Apply with Proposal
            </Text>
            <Icon name="chevronRight" size={14} color={colors.brand.primary} />
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.app }}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background.app} />
      
      {/* Top Header */}
      <View style={styles.topBar}>
        <View>
          <Text style={[styles.brandTitle, { color: colors.text.primary }]}>FreelancerX</Text>
          <Text style={[styles.brandSubtitle, { color: colors.text.secondary }]}>
            Verified Freelance Marketplace
          </Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onCreateJobPress}
          style={[styles.postJobPill, { backgroundColor: colors.brand.primary }]}
        >
          <Icon name="plus" size={14} color="#FFFFFF" />
          <Text style={styles.postJobPillText}>New Job</Text>
        </TouchableOpacity>
      </View>

      <View style={{ paddingHorizontal: spacing.layout.screenHorizontalPadding, flex: 1 }}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputWrap}>
            <Input
              placeholder="Search jobs by keyword, skill or budget..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              containerStyle={{ marginBottom: 0 }}
            />
          </View>
        </View>

        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator color={colors.brand.primary} size="large" />
          </View>
        ) : (
          <FlatList
            data={jobs}
            keyExtractor={(item) => item.id}
            ListHeaderComponent={renderHeroBanner}
            renderItem={renderJobItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 60 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => {
                  setRefreshing(true);
                  fetchJobs();
                }}
                tintColor={colors.brand.primary}
              />
            }
            ListEmptyComponent={
              <Card style={{ alignItems: 'center', padding: 28, marginTop: 16 }}>
                <Icon name="briefcase" size={36} color={colors.brand.primary} />
                <Text style={{ color: colors.text.primary, fontSize: 16, fontWeight: '700', marginTop: 12 }}>
                  No open jobs found
                </Text>
                <Text style={{ color: colors.text.secondary, textAlign: 'center', marginTop: 4, marginBottom: 16 }}>
                  Be the first to publish a verified milestone project!
                </Text>
                <Button title="Post First Job" onPress={onCreateJobPress} />
              </Card>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 12,
    fontWeight: '500',
  },
  postJobPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
    shadowColor: '#5B4DFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  postJobPillText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  searchContainer: {
    marginBottom: 14,
  },
  searchInputWrap: {
    flex: 1,
  },
  heroCard: {
    padding: 22,
    marginBottom: 18,
    shadowColor: '#5B4DFF',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 5,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  heroIconBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  networkPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  networkDot: {
    color: '#5EE6B5',
    fontSize: 10,
    marginRight: 5,
  },
  networkText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    color: 'rgba(255, 255, 255, 0.82)',
    fontSize: 13,
    marginTop: 4,
    marginBottom: 16,
  },
  heroStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  heroStatItem: {
    flex: 1,
  },
  heroStatLabel: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 11,
    fontWeight: '500',
  },
  heroStatValue: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    marginTop: 2,
  },
  heroActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    gap: 4,
  },
  heroActionText: {
    fontWeight: '700',
    fontSize: 13,
  },
  jobCard: {
    marginBottom: 14,
    padding: 18,
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
    flex: 1,
    marginRight: 10,
    lineHeight: 22,
  },
  budgetPill: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: '#F0EEFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
  },
  budgetCurrency: {
    color: '#5B4DFF',
    fontSize: 12,
    fontWeight: '700',
  },
  budgetValue: {
    color: '#5B4DFF',
    fontSize: 15,
    fontWeight: '800',
    marginHorizontal: 1,
  },
  budgetToken: {
    color: '#5B4DFF',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 2,
  },
  jobDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  skillList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  skillBadge: {
    backgroundColor: '#F4F5FB',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  skillText: {
    color: '#525B75',
    fontSize: 11,
    fontWeight: '600',
  },
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: 10,
  },
  proposalsCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  proposalsText: {
    fontSize: 12,
    fontWeight: '500',
  },
  applyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  applyText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
