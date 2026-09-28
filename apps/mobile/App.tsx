import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import { defaultTheme } from './src/theme/index.js';
import { WalletPOCScreen } from './src/screens/wallet/WalletPOCScreen.js';
import { JobsFeedScreen } from './src/screens/jobs/JobsFeedScreen.js';
import { CreateJobScreen } from './src/screens/jobs/CreateJobScreen.js';
import { ProposalSubmitScreen } from './src/screens/proposals/ProposalSubmitScreen.js';
import { ClientProposalsScreen } from './src/screens/proposals/ClientProposalsScreen.js';

type TabType = 'wallet' | 'jobs' | 'create_job' | 'proposal' | 'client_review';

export default function App() {
  const { colors, typography } = defaultTheme;
  const [activeTab, setActiveTab] = useState<TabType>('wallet');
  const [selectedJob, setSelectedJob] = useState<any>({
    id: 'job-1',
    title: 'Base Sepolia Escrow Smart Contract Audit',
    description: 'Need experienced Solidity security researcher to audit milestone escrow contracts.',
    budgetUsdc: '2500',
    skills: ['Solidity', 'Foundry', 'Security', 'Base'],
  });

  const renderScreen = () => {
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
            onProjectCreated={() => setActiveTab('wallet')}
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
          onPress={() => setActiveTab('wallet')}
          style={{ alignItems: 'center', flex: 1 }}
        >
          <Text
            style={{
              color: activeTab === 'wallet' ? colors.brand.primary : colors.text.tertiary,
              fontSize: 12,
              fontWeight: activeTab === 'wallet' ? '700' : '500',
            }}
          >
            💳 Wallet & RPC
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('jobs')}
          style={{ alignItems: 'center', flex: 1 }}
        >
          <Text
            style={{
              color: activeTab === 'jobs' ? colors.brand.primary : colors.text.tertiary,
              fontSize: 12,
              fontWeight: activeTab === 'jobs' ? '700' : '500',
            }}
          >
            💼 Jobs Feed
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('create_job')}
          style={{ alignItems: 'center', flex: 1 }}
        >
          <Text
            style={{
              color: activeTab === 'create_job' ? colors.brand.primary : colors.text.tertiary,
              fontSize: 12,
              fontWeight: activeTab === 'create_job' ? '700' : '500',
            }}
          >
            ➕ Post Job
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('proposal')}
          style={{ alignItems: 'center', flex: 1 }}
        >
          <Text
            style={{
              color: activeTab === 'proposal' ? colors.brand.primary : colors.text.tertiary,
              fontSize: 12,
              fontWeight: activeTab === 'proposal' ? '700' : '500',
            }}
          >
            📄 Apply
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('client_review')}
          style={{ alignItems: 'center', flex: 1 }}
        >
          <Text
            style={{
              color: activeTab === 'client_review' ? colors.brand.primary : colors.text.tertiary,
              fontSize: 12,
              fontWeight: activeTab === 'client_review' ? '700' : '500',
            }}
          >
            🤝 Hire
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
