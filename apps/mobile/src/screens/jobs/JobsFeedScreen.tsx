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
import { WalletService } from '../../services/wallet/walletService';

interface JobsFeedScreenProps {
  onSelectJob: (job: any) => void;
  onCreateJobPress: () => void;
  onEditJob?: (job: any) => void;
  walletAddress?: string;
  isClient?: boolean;
}

export const JobsFeedScreen: React.FC<JobsFeedScreenProps> = ({
  onSelectJob,
  onCreateJobPress,
  onEditJob,
  isClient = true,
}) => {
  const { colors, spacing, radii } = defaultTheme;

  const [jobs, setJobs] = useState<any[]>(() => ApiClient.getLocalJobs());
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const walletState = WalletService.getState();
  const currentAddress = walletState.address?.toLowerCase();

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

  // Filtering:
  // In Freelancer mode: Person A posting a gig CANNOT see that gig in their freelancer account.
  // In Client mode: Client sees their posted gigs (with Edit option) and market gigs.
  const filteredJobs = jobs.filter((item: any) => {
    const jobOwner = (item.client?.address || item.clientAddress || '').toLowerCase();
    const isMyGig = currentAddress && jobOwner === currentAddress;

    if (!isClient && isMyGig) {
      return false; // Person A posting a gig should not see that gig in their freelancer account
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title?.toLowerCase().includes(q);
      const matchDesc = item.description?.toLowerCase().includes(q);
      const matchSkills = item.skills?.some((s: string) => s.toLowerCase().includes(q));
      return matchTitle || matchDesc || matchSkills;
    }
    return true;
  });

  const renderHeroBanner = () => (
    <View style={styles.bannerContainer}>
      {/* Client Post Gig Banner */}
      {isClient && (
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={onCreateJobPress}
          style={[styles.postGigBanner, { borderRadius: radii.card }]}
        >
          <View style={styles.postGigBannerLeft}>
            <View style={styles.postGigIconWrap}>
              <Icon name="plus" size={22} color="#FFFFFF" strokeWidth={2.5} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.postGigBannerTitle}>Post a New Gig</Text>
              <Text style={styles.postGigBannerSubtitle}>
                Fund milestones in smart escrow & hire verified talent
              </Text>
            </View>
          </View>
          <View style={styles.postGigActionBtn}>
            <Text style={styles.postGigActionBtnText}>Post Gig →</Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Overview Stat Card */}
      <View style={[styles.heroCard, { backgroundColor: colors.brand.primary, borderRadius: radii.card }]}>
        <View style={styles.heroTopRow}>
          <View style={styles.heroIconBadge}>
            <Icon name="shield" size={18} color="#FFFFFF" />
          </View>
          <Text style={styles.heroStatTag}>Verified Trust</Text>
        </View>

        <Text style={styles.heroTitle}>Decentralized Escrow</Text>
        <Text style={styles.heroSubtitle}>
          Non-custodial milestone payments protected by smart contracts
        </Text>

        <View style={styles.heroStatsRow}>
          <View style={styles.heroStatItem}>
            <Text style={styles.heroStatLabel}>Available Gigs</Text>
            <Text style={styles.heroStatValue}>{filteredJobs.length} Open</Text>
          </View>
          <View style={styles.heroStatItem}>
            <Text style={styles.heroStatLabel}>Protection</Text>
            <Text style={styles.heroStatValue}>2-of-3 Multisig</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderJobItem = ({ item }: { item: any }) => {
    const jobOwner = (item.client?.address || item.clientAddress || '').toLowerCase();
    const isMyGig = Boolean(currentAddress && jobOwner === currentAddress);

    return (
      <Card style={styles.jobCard}>
        <TouchableOpacity activeOpacity={0.85} onPress={() => onSelectJob(item)}>
          <View style={styles.jobHeader}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={[styles.jobTitle, { color: colors.text.primary }]}>
                {item.title}
              </Text>
              {isMyGig && isClient && (
                <View style={styles.myGigBadge}>
                  <Text style={styles.myGigBadgeText}>Your Posted Gig</Text>
                </View>
              )}
            </View>
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
        </TouchableOpacity>

        <View style={[styles.jobFooter, { borderTopColor: colors.border.subtle }]}>
          <View style={styles.proposalsCount}>
            <Icon name="user" size={14} color={colors.text.tertiary} />
            <Text style={[styles.proposalsText, { color: colors.text.tertiary }]}>
              {item.proposalsCount || 0} proposals
            </Text>
          </View>

          {/* Action Row */}
          {isClient && isMyGig ? (
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {onEditJob && (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => onEditJob(item)}
                  style={styles.editGigBtn}
                >
                  <Text style={styles.editGigBtnText}>Edit</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => onSelectJob(item)}
                style={styles.reviewBtn}
              >
                <Text style={styles.reviewBtnText}>Proposals →</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => onSelectJob(item)}
              style={styles.applyRow}
            >
              <Text style={[styles.applyText, { color: colors.brand.primary }]}>
                {isClient ? 'View Proposals' : 'Apply with Proposal'}
              </Text>
              <Icon name="chevronRight" size={14} color={colors.brand.primary} />
            </TouchableOpacity>
          )}
        </View>
      </Card>
    );
  };

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
      </View>

      <View style={{ paddingHorizontal: spacing.layout.screenHorizontalPadding, flex: 1 }}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputWrap}>
            <Input
              placeholder="Search gigs by keyword, skill or budget..."
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
            data={filteredJobs}
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
                  No open gigs found
                </Text>
                <Text style={{ color: colors.text.secondary, textAlign: 'center', marginTop: 4, marginBottom: 16 }}>
                  {isClient
                    ? 'Publish your first gig to attract top Web3 builders!'
                    : 'Check back soon for new escrow-backed opportunities.'}
                </Text>
                {isClient && <Button title="Post First Gig" onPress={onCreateJobPress} />}
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
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  bannerContainer: {
    marginBottom: 16,
    gap: 12,
  },
  postGigBanner: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#5B4DFF',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#5B4DFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  postGigBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 8,
  },
  postGigIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#5B4DFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  postGigBannerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  postGigBannerSubtitle: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  postGigActionBtn: {
    backgroundColor: '#F0EEFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  postGigActionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5B4DFF',
  },
  heroCard: {
    padding: 20,
    shadowColor: '#5B4DFF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  heroIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroStatTag: {
    fontSize: 11,
    fontWeight: '700',
    color: '#E0E7FF',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#D1D5DB',
    marginTop: 4,
    marginBottom: 16,
    lineHeight: 18,
  },
  heroStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
    paddingTop: 14,
  },
  heroStatItem: {},
  heroStatLabel: {
    fontSize: 11,
    color: '#C7D2FE',
    fontWeight: '500',
  },
  heroStatValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 2,
  },
  searchContainer: {
    marginBottom: 14,
  },
  searchInputWrap: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  jobCard: {
    padding: 16,
    marginBottom: 12,
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
    lineHeight: 22,
  },
  myGigBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
  },
  myGigBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#92400E',
  },
  budgetPill: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: '#F0EEFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 2,
  },
  budgetCurrency: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5B4DFF',
  },
  budgetValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#5B4DFF',
  },
  budgetToken: {
    fontSize: 10,
    fontWeight: '700',
    color: '#5B4DFF',
  },
  jobDesc: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 12,
  },
  skillList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 14,
  },
  skillBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  skillText: {
    fontSize: 11,
    color: '#4B5563',
    fontWeight: '500',
  },
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
  },
  proposalsCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  proposalsText: {
    fontSize: 12,
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
  editGigBtn: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  editGigBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  reviewBtn: {
    backgroundColor: '#5B4DFF',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 6,
  },
  reviewBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
