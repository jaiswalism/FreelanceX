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
  ScrollView,
} from 'react-native';
import { defaultTheme } from '../../theme';
import { Header, Card, Button, Icon } from '../../components';
import { ApiClient } from '../../services/api/apiClient';

interface MyBidsScreenProps {
  onBrowseGigs: () => void;
  onOpenProject?: (projectId: string) => void;
}

export const MyBidsScreen: React.FC<MyBidsScreenProps> = ({
  onBrowseGigs,
  onOpenProject,
}) => {
  const { colors, spacing } = defaultTheme;

  const [bids, setBids] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedBid, setSelectedBid] = useState<any | null>(null);

  const fetchBids = async () => {
    try {
      const res = await ApiClient.getMyProposals();
      if (res.proposals) {
        setBids(res.proposals);
      }
    } catch {
      // fallback
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBids();
  }, []);

  // --- Sub-View: Detailed Bid Page ---
  if (selectedBid) {
    const isAccepted = selectedBid.status === 'ACCEPTED';
    const isRejected = selectedBid.status === 'REJECTED';

    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.app }}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <Header
          title="Bid Details"
          subtitle={`Submitted on ${new Date(selectedBid.createdAt || Date.now()).toLocaleDateString()}`}
          onBack={() => setSelectedBid(null)}
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
          {/* Status Alert Banner */}
          <View
            style={[
              styles.statusBanner,
              isAccepted
                ? styles.statusBannerAccepted
                : isRejected
                ? styles.statusBannerRejected
                : styles.statusBannerPending,
            ]}
          >
            <Icon
              name={isAccepted ? 'checkCircle' : isRejected ? 'alertTriangle' : 'clock'}
              size={20}
              color={isAccepted ? '#059669' : isRejected ? '#DC2626' : '#D97706'}
            />
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.statusBannerTitle,
                  { color: isAccepted ? '#065F46' : isRejected ? '#991B1B' : '#92400E' },
                ]}
              >
                {isAccepted
                  ? 'Proposal Accepted! 🎉'
                  : isRejected
                  ? 'Proposal Not Selected'
                  : 'Proposal Pending Client Review'}
              </Text>
              <Text
                style={[
                  styles.statusBannerDesc,
                  { color: isAccepted ? '#047857' : isRejected ? '#B91C1C' : '#B45309' },
                ]}
              >
                {isAccepted
                  ? 'Client has accepted your proposal and initiated smart escrow.'
                  : isRejected
                  ? 'The client chose another proposal for this gig.'
                  : 'The client is currently reviewing milestone bids.'}
              </Text>
            </View>
          </View>

          {/* Action if Accepted */}
          {isAccepted && onOpenProject && (
            <Button
              title="Open Project Workspace →"
              onPress={() => onOpenProject(selectedBid.projectId || 'proj-1')}
            />
          )}

          {/* Proposal Summary Card */}
          <Card style={styles.detailCard}>
            <Text style={styles.detailCardTitle}>Your Bid Terms</Text>
            <View style={styles.detailGrid}>
              <View style={styles.detailCol}>
                <Text style={styles.detailLabel}>Proposed Price</Text>
                <Text style={styles.detailPrice}>${selectedBid.proposedPriceUsdc} USDC</Text>
              </View>
              <View style={styles.detailCol}>
                <Text style={styles.detailLabel}>Timeline</Text>
                <Text style={styles.detailValue}>{selectedBid.proposedDurationDays || 14} Days</Text>
              </View>
            </View>
          </Card>

          {/* Cover Letter Card */}
          <Card style={styles.detailCard}>
            <Text style={styles.detailCardTitle}>Your Pitch / Cover Letter</Text>
            <Text style={styles.coverLetterBody}>{selectedBid.coverLetter}</Text>
          </Card>

          {/* Milestone Plan */}
          <View style={{ gap: 10 }}>
            <Text style={styles.sectionHeaderTitle}>Milestone Deliverables</Text>
            {selectedBid.milestonePlan?.map((m: any, idx: number) => (
              <Card key={idx} style={styles.milestoneCard}>
                <View style={styles.milestoneCardHeader}>
                  <View style={styles.milestoneIndexPill}>
                    <Text style={styles.milestoneIndexPillText}>#{idx + 1}</Text>
                  </View>
                  <Text style={styles.milestonePrice}>${m.amountUsdc} USDC</Text>
                </View>
                <Text style={styles.milestoneDesc}>{m.description}</Text>
                <View style={styles.milestoneFooterRow}>
                  <Icon name="clock" size={13} color="#9CA3AF" />
                  <Text style={styles.milestoneDays}>{m.durationDays || 7} Days estimated</Text>
                </View>
              </Card>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // --- Main Submitted Bids List View ---
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.app }}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background.app} />

      {/* Top Header */}
      <View style={styles.topBar}>
        <View>
          <Text style={[styles.brandTitle, { color: colors.text.primary }]}>My Submitted Bids</Text>
          <Text style={[styles.brandSubtitle, { color: colors.text.secondary }]}>
            Track and manage your submitted proposals
          </Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onBrowseGigs}
          style={styles.browsePill}
        >
          <Text style={styles.browsePillText}>+ Browse Gigs</Text>
        </TouchableOpacity>
      </View>

      <View style={{ paddingHorizontal: spacing.layout.screenHorizontalPadding, flex: 1 }}>
        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator color={colors.brand.primary} size="large" />
          </View>
        ) : (
          <FlatList
            data={bids}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 60 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => {
                  setRefreshing(true);
                  fetchBids();
                }}
                tintColor={colors.brand.primary}
              />
            }
            renderItem={({ item }) => {
              const isAccepted = item.status === 'ACCEPTED';
              const isRejected = item.status === 'REJECTED';

              return (
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => setSelectedBid(item)}
                >
                  <Card style={styles.bidCard}>
                    <View style={styles.bidCardHeader}>
                      <View style={{ flex: 1, marginRight: 10 }}>
                        <Text style={styles.bidJobTitle} numberOfLines={1}>
                          {item.job?.title || 'Proposal'}
                        </Text>
                        <Text style={styles.bidDate}>
                          Submitted on {new Date(item.createdAt || Date.now()).toLocaleDateString()}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.statusBadge,
                          isAccepted
                            ? styles.statusAccepted
                            : isRejected
                            ? styles.statusRejected
                            : styles.statusPending,
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusBadgeText,
                            { color: isAccepted ? '#059669' : isRejected ? '#DC2626' : '#D97706' },
                          ]}
                        >
                          {item.status}
                        </Text>
                      </View>
                    </View>

                    <Text numberOfLines={2} style={styles.coverLetterSnippet}>
                      {item.coverLetter}
                    </Text>

                    <View style={styles.bidCardFooter}>
                      <View style={styles.bidStat}>
                        <Text style={styles.bidStatLabel}>Proposed Bid</Text>
                        <Text style={styles.bidStatPrice}>${item.proposedPriceUsdc} USDC</Text>
                      </View>
                      <View style={styles.bidStat}>
                        <Text style={styles.bidStatLabel}>Timeline</Text>
                        <Text style={styles.bidStatValue}>{item.proposedDurationDays || 14} Days</Text>
                      </View>
                      <View style={styles.bidStat}>
                        <Text style={styles.bidStatLabel}>Milestones</Text>
                        <Text style={styles.bidStatValue}>
                          {item.milestonePlan?.length || 2} Stages
                        </Text>
                      </View>
                    </View>

                    <View style={styles.viewDetailRow}>
                      <Text style={styles.viewDetailText}>View Proposal Details</Text>
                      <Icon name="chevronRight" size={14} color="#5B4DFF" />
                    </View>
                  </Card>
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={
              <Card style={{ alignItems: 'center', padding: 28, marginTop: 24 }}>
                <Icon name="fileText" size={40} color={colors.brand.primary} />
                <Text style={{ color: colors.text.primary, fontSize: 16, fontWeight: '700', marginTop: 14 }}>
                  No Bids Submitted Yet
                </Text>
                <Text style={{ color: colors.text.secondary, textAlign: 'center', marginTop: 4, marginBottom: 18 }}>
                  Explore open gigs on the marketplace and submit milestone proposals with guaranteed escrow.
                </Text>
                <Button title="Explore Gigs Now" onPress={onBrowseGigs} />
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
    paddingBottom: 14,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  brandSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  browsePill: {
    backgroundColor: '#F0EEFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  browsePillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5B4DFF',
  },
  bidCard: {
    padding: 16,
    marginBottom: 12,
  },
  bidCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  bidJobTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  bidDate: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusAccepted: {
    backgroundColor: '#ECFDF5',
  },
  statusRejected: {
    backgroundColor: '#FEF2F2',
  },
  statusPending: {
    backgroundColor: '#FFFBEB',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  coverLetterSnippet: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
    marginBottom: 12,
  },
  bidCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  bidStat: {},
  bidStatLabel: {
    fontSize: 10,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  bidStatPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: '#5B4DFF',
    marginTop: 2,
  },
  bidStatValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
    marginTop: 2,
  },
  viewDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  viewDetailText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5B4DFF',
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusBannerAccepted: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  statusBannerRejected: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  statusBannerPending: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  statusBannerTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  statusBannerDesc: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  detailCard: {
    padding: 16,
  },
  detailCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  detailGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailCol: {},
  detailLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  detailPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: '#5B4DFF',
    marginTop: 2,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginTop: 2,
  },
  coverLetterBody: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 20,
  },
  sectionHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  milestoneCard: {
    padding: 14,
    backgroundColor: '#FFFFFF',
  },
  milestoneCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  milestoneIndexPill: {
    backgroundColor: '#F0EEFF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  milestoneIndexPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#5B4DFF',
  },
  milestonePrice: {
    fontSize: 15,
    fontWeight: '800',
    color: '#5B4DFF',
  },
  milestoneDesc: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 18,
    marginBottom: 8,
  },
  milestoneFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  milestoneDays: {
    fontSize: 11,
    color: '#9CA3AF',
  },
});
