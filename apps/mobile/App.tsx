import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { defaultTheme } from './src/theme';
import { Icon } from './src/components/Icon';
import { WalletPOCScreen } from './src/screens/wallet/WalletPOCScreen';
import { JobsFeedScreen } from './src/screens/jobs/JobsFeedScreen';
import { CreateJobScreen } from './src/screens/jobs/CreateJobScreen';
import { ProposalSubmitScreen } from './src/screens/proposals/ProposalSubmitScreen';
import { ClientProposalsScreen } from './src/screens/proposals/ClientProposalsScreen';
import { ProjectsListScreen } from './src/screens/projects/ProjectsListScreen';
import { ProjectDetailScreen } from './src/screens/projects/ProjectDetailScreen';

type TabType = 'wallet' | 'jobs' | 'create_job' | 'proposal' | 'client_review' | 'projects';

export default function App() {
  const { colors, radii } = defaultTheme;
  const [activeTab, setActiveTab] = useState<TabType>('jobs');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<any>({
    id: 'job-1',
    title: 'Base Sepolia Escrow Smart Contract Audit',
    description: 'Need experienced Solidity security researcher to audit milestone escrow contracts.',
    budgetUsdc: '2500',
    skills: ['Solidity', 'Foundry', 'Security', 'Base'],
  });

  const renderScreen = () => {
    if (selectedProjectId) {
      return (
        <ProjectDetailScreen
          projectId={selectedProjectId}
          onBack={() => setSelectedProjectId(null)}
        />
      );
    }

    switch (activeTab) {
      case 'wallet':
        return <WalletPOCScreen />;
      case 'jobs':
        return (
          <JobsFeedScreen
            onSelectJob={(jobId) => {
              setSelectedJob({
                id: jobId,
                title: 'Base Sepolia Escrow Smart Contract Audit',
                description: 'Need experienced Solidity security researcher to audit milestone escrow contracts.',
                budgetUsdc: '2500',
                skills: ['Solidity', 'Foundry', 'Security', 'Base'],
              });
              setActiveTab('proposal');
            }}
            onCreateJobPress={() => setActiveTab('create_job')}
          />
        );
      case 'create_job':
        return (
          <CreateJobScreen
            onBack={() => setActiveTab('jobs')}
            onJobCreated={(newJob) => {
              setSelectedJob(newJob);
              setActiveTab('jobs');
            }}
          />
        );
      case 'proposal':
        return (
          <ProposalSubmitScreen
            job={selectedJob}
            onBack={() => setActiveTab('jobs')}
            onSubmitted={() => setActiveTab('client_review')}
          />
        );
      case 'client_review':
        return (
          <ClientProposalsScreen
            job={selectedJob}
            onBack={() => setActiveTab('jobs')}
            onProjectCreated={() => setActiveTab('projects')}
          />
        );
      case 'projects':
        return (
          <ProjectsListScreen
            onSelectProject={(projId) => setSelectedProjectId(projId)}
          />
        );
    }
  };

  const navItems = [
    { id: 'jobs' as TabType, label: 'Market', icon: 'briefcase' as const },
    { id: 'create_job' as TabType, label: 'Post', icon: 'plus' as const },
    { id: 'projects' as TabType, label: 'Escrow', icon: 'shield' as const },
    { id: 'wallet' as TabType, label: 'Wallet', icon: 'wallet' as const },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.app }}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background.app} />
      <View style={{ flex: 1 }}>{renderScreen()}</View>

      {/* Modern Floating Bottom Navigation Bar */}
      <View style={styles.navWrapper}>
        <View style={[styles.navContainer, { backgroundColor: '#FFFFFF', borderRadius: radii.card }]}>
          {navItems.map((item) => {
            const isActive =
              !selectedProjectId &&
              (activeTab === item.id ||
                (item.id === 'jobs' && activeTab === 'proposal') ||
                (item.id === 'create_job' && activeTab === 'client_review'));

            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.8}
                onPress={() => {
                  setSelectedProjectId(null);
                  setActiveTab(item.id);
                }}
                style={[
                  styles.tabButton,
                  isActive && [styles.activeTabPill, { backgroundColor: colors.brand.tint }],
                ]}
              >
                <Icon
                  name={item.icon}
                  size={20}
                  color={isActive ? colors.brand.primary : '#9CA3AF'}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <Text
                  style={[
                    styles.tabLabel,
                    {
                      color: isActive ? colors.brand.primary : '#8D95A5',
                      fontWeight: isActive ? '700' : '500',
                    },
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  navWrapper: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 6,
    backgroundColor: '#F6F7FB',
  },
  navContainer: {
    flexDirection: 'row',
    height: 64,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    shadowColor: '#5B4DFF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#EEF0F8',
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    gap: 6,
  },
  activeTabPill: {},
  tabLabel: {
    fontSize: 12,
  },
});
