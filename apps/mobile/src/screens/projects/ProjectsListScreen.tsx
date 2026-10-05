import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { defaultTheme } from '../../theme';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { ApiClient } from '../../services/api/apiClient';

interface ProjectsListScreenProps {
  onSelectProject: (projectId: string) => void;
}

export const ProjectsListScreen: React.FC<ProjectsListScreenProps> = ({
  onSelectProject,
}) => {
  const { colors } = defaultTheme;
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchProjects = async () => {
    try {
      const res = await ApiClient.getMyProjects();
      if (res.success) {
        setProjects(res.projects || []);
      }
    } catch {
      // Quiet fallback
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchProjects();
  };

  const renderProjectItem = ({ item }: { item: any }) => {
    return (
      <TouchableOpacity onPress={() => onSelectProject(item.id)}>
        <Card style={styles.projectCard}>
          <View style={styles.cardHeader}>
            <Text style={[styles.projectTitle, { color: colors.text.primary }]} numberOfLines={1}>
              {item.title}
            </Text>
            <Badge
              label={item.status}
              variant={
                item.status === 'COMPLETED'
                  ? 'success'
                  : item.status === 'DISPUTED'
                  ? 'danger'
                  : 'warning'
              }
            />
          </View>

          <Text style={[styles.jobTitle, { color: colors.text.secondary }]} numberOfLines={1}>
            Job: {item.job?.title || 'Custom Contract Project'}
          </Text>

          <View style={[styles.cardFooter, { borderTopColor: colors.border.default }]}>
            <Text style={[styles.budgetLabel, { color: colors.text.tertiary }]}>Budget</Text>
            <Text style={[styles.budgetValue, { color: colors.brand.primary }]}>
              ${item.totalAmountUsdc} USDC
            </Text>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background.app }]}>
      <Header title="My Projects & Escrow" />

      {loading && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.brand.primary} />
        </View>
      ) : (
        <FlatList
          data={projects}
          renderItem={renderProjectItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.brand.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>
                No Active Projects Yet
              </Text>
              <Text style={[styles.emptySub, { color: colors.text.secondary }]}>
                Accept a proposal or create a job post to start milestone escrow tracking.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  projectCard: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  projectTitle: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  jobTitle: {
    fontSize: 13,
    marginVertical: 6,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  budgetLabel: {
    fontSize: 12,
  },
  budgetValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  emptySub: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
});
