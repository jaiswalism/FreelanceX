import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { defaultTheme } from './src/theme';
import { WalletPOCScreen } from './src/screens/wallet/WalletPOCScreen';
import { JobsFeedScreen } from './src/screens/jobs/JobsFeedScreen';
import { CreateJobScreen } from './src/screens/jobs/CreateJobScreen';
import { ProposalSubmitScreen } from './src/screens/proposals/ProposalSubmitScreen';
import { ClientProposalsScreen } from './src/screens/proposals/ClientProposalsScreen';
import { ProjectsListScreen } from './src/screens/projects/ProjectsListScreen';
import { ProjectDetailScreen } from './src/screens/projects/ProjectDetailScreen';

type TabType = 'wallet' | 'jobs' | 'create_job' | 'proposal' | 'client_review' | 'projects';

export default function App() {
  const { colors } = defaultTheme;
  const [activeTab, setActiveTab] = useState<TabType>('wallet');
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.app }}>
      <View style={{ flex: 1 }}>{renderScreen()}</View>

      {/* Bottom Navigation Bar */}
      <View
        style={{
          flexDirection: 'row',
          backgroundColor: colors.background.secondary,
          borderTopWidth: 1,
          borderTopColor: colors.border.default,
          height: 60,
          alignItems: 'center',
          justifyContent: 'space-around',
        }}
      >
        <TouchableOpacity
          onPress={() => {
            setSelectedProjectId(null);
            setActiveTab('wallet');
          }}
          style={{ alignItems: 'center', flex: 1 }}
        >
          <Text
            style={{
              color: activeTab === 'wallet' && !selectedProjectId ? colors.brand.primary : colors.text.tertiary,
              fontSize: 11,
              fontWeight: activeTab === 'wallet' ? '700' : '500',
            }}
          >
            💳 Wallet
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            setSelectedProjectId(null);
            setActiveTab('jobs');
          }}
          style={{ alignItems: 'center', flex: 1 }}
        >
          <Text
            style={{
              color: activeTab === 'jobs' && !selectedProjectId ? colors.brand.primary : colors.text.tertiary,
              fontSize: 11,
              fontWeight: activeTab === 'jobs' ? '700' : '500',
            }}
          >
            💼 Jobs
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            setSelectedProjectId(null);
            setActiveTab('create_job');
          }}
          style={{ alignItems: 'center', flex: 1 }}
        >
          <Text
            style={{
              color: activeTab === 'create_job' && !selectedProjectId ? colors.brand.primary : colors.text.tertiary,
              fontSize: 11,
              fontWeight: activeTab === 'create_job' ? '700' : '500',
            }}
          >
            ➕ Post
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            setSelectedProjectId(null);
            setActiveTab('projects');
          }}
          style={{ alignItems: 'center', flex: 1 }}
        >
          <Text
            style={{
              color: (activeTab === 'projects' || selectedProjectId) ? colors.brand.primary : colors.text.tertiary,
              fontSize: 11,
              fontWeight: activeTab === 'projects' ? '700' : '500',
            }}
          >
            🛡️ Escrow
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
