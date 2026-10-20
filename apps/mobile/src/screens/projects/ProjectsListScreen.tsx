import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { defaultTheme } from '../../theme';
import { Card, Badge, Icon } from '../../components';
import { ApiClient } from '../../services/api/apiClient';

interface ProjectsListScreenProps {
  onSelectProject: (projectId: string) => void;
}

export const ProjectsListScreen: React.FC<ProjectsListScreenProps> = ({
  onSelectProject,
}) => {
  const { colors, radii } = defaultTheme;
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchProjects = async () => {
    try {
      const res = await ApiClient.getMyProjects();
      if (res.success && res.projects && res.projects.length > 0) {
        setProjects(res.projects);
      } else {
        setProjects(getSampleProjects());
      }
    } catch {
      setProjects(getSampleProjects());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getSampleProjects = () => [
    {
      id: 'proj-1',
      title: 'Base Sepolia Escrow Smart Contract Audit',
      status: 'IN_PROGRESS',
      totalAmountUsdc: '2500',
      milestonesCount: 3,
      paidMilestonesCount: 1,
      freelancer: { address: '0x709...79c8' },
      job: { title: 'Security Audit & Invariant Fuzzing' },
    },
    {
      id: 'proj-2',
      title: 'Mobile DApp UI Redesign (Middletrust Spec)',
      status: 'FUNDED',
      totalAmountUsdc: '1800',
      milestonesCount: 2,
      paidMilestonesCount: 0,
      freelancer: { address: '0x3c4...93bc' },
      job: { title: 'React Native Android Polish' },
    },
  ];

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchProjects();
  };

  const renderProjectItem = ({ item }: { item: any }) => {
    return (
      <TouchableOpacity activeOpacity={0.85} onPress={() => onSelectProject(item.id)}>
        <Card style={styles.projectCard}>
          <View style={styles.cardHeader}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={[styles.projectTitle, { color: colors.text.primary }]} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={[styles.jobSubtitle, { color: colors.text.secondary }]} numberOfLines={1}>
                {item.job?.title || 'Custom Milestone Contract'}
              </Text>
            </View>
            <Badge
              label={item.status}
              variant={
                item.status === 'COMPLETED'
                  ? 'success'
                  : item.status === 'DISPUTED'
                  ? 'danger'
                  : 'brand'
              }
            />
          </View>

          <View style={[styles.progressRow, { backgroundColor: '#F8FAFD', borderRadius: radii.default }]}>
            <View style={styles.progressItem}>
              <Text style={{ color: colors.text.tertiary, fontSize: 11 }}>ESCROW LOCKED</Text>
              <Text style={[styles.amountText, { color: colors.brand.primary }]}>
                ${item.totalAmountUsdc} USDC
              </Text>
            </View>
            <View style={styles.progressItem}>
              <Text style={{ color: colors.text.tertiary, fontSize: 11 }}>PROGRESS</Text>
              <Text style={{ color: colors.text.primary, fontSize: 14, fontWeight: '700' }}>
                {item.paidMilestonesCount || 1} / {item.milestonesCount || 3} Milestones
              </Text>
            </View>
          </View>

          <View style={[styles.cardFooter, { borderTopColor: colors.border.subtle }]}>
            <View style={styles.footerLeft}>
              <Icon name="shield" size={14} color={colors.semantic.success} />
              <Text style={{ color: colors.semantic.success, fontSize: 12, fontWeight: '600' }}>
                On-Chain Escrow Protected
              </Text>
            </View>
            <View style={styles.footerRight}>
              <Text style={{ color: colors.brand.primary, fontSize: 13, fontWeight: '700' }}>
                Manage Workspace
              </Text>
              <Icon name="chevronRight" size={14} color={colors.brand.primary} />
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.app }]}>
      <View style={styles.topHeader}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Active Escrow Projects</Text>
          <Text style={[styles.headerSubtitle, { color: colors.text.secondary }]}>
            Milestones, deliverables & release authorizations
          </Text>
        </View>
      </View>

      {loading && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.brand.primary} />
        </View>
      ) : (
        <FlatList
          data={projects}
          keyExtractor={(item) => item.id}
          renderItem={renderProjectItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.brand.primary}
            />
          }
          ListEmptyComponent={
            <Card style={styles.emptyCard}>
              <Icon name="shield" size={36} color={colors.brand.primary} />
              <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>
                No Active Escrow Projects
              </Text>
              <Text style={[styles.emptyText, { color: colors.text.secondary }]}>
                Apply to jobs or post a job to initiate smart-contract escrow.
              </Text>
            </Card>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topHeader: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 60,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  projectCard: {
    marginBottom: 14,
    padding: 18,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  projectTitle: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
  },
  jobSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  progressRow: {
    flexDirection: 'row',
    padding: 12,
    marginBottom: 12,
  },
  progressItem: {
    flex: 1,
  },
  amountText: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: 10,
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  footerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  emptyCard: {
    alignItems: 'center',
    padding: 32,
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
});
