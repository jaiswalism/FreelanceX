import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { defaultTheme } from './src/theme';
import { Icon, IconName } from './src/components/Icon';
import { OnboardingScreen } from './src/screens/onboarding/OnboardingScreen';
import { ConnectWalletScreen } from './src/screens/onboarding/ConnectWalletScreen';
import { RoleSelectScreen } from './src/screens/onboarding/RoleSelectScreen';
import { WalletScreen } from './src/screens/wallet/WalletScreen';
import { JobsFeedScreen } from './src/screens/jobs/JobsFeedScreen';
import { CreateJobScreen } from './src/screens/jobs/CreateJobScreen';
import { ProposalSubmitScreen } from './src/screens/proposals/ProposalSubmitScreen';
import { ClientProposalsScreen } from './src/screens/proposals/ClientProposalsScreen';
import { ProjectsListScreen } from './src/screens/projects/ProjectsListScreen';
import { ProjectDetailScreen } from './src/screens/projects/ProjectDetailScreen';
import { WalletService, WalletState } from './src/services/wallet/walletService';
import { ApiClient } from './src/services/api/apiClient';

type TabType = 'wallet' | 'jobs' | 'create_job' | 'proposal' | 'client_review' | 'projects';
type AuthStep = 'loading' | 'onboarding' | 'connect_wallet' | 'select_role' | 'authenticated';

export default function App() {
  const { colors, radii } = defaultTheme;
  const [authStep, setAuthStep] = useState<AuthStep>('loading');
  const [activeTab, setActiveTab] = useState<TabType>('jobs');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [walletState, setWalletState] = useState<WalletState>(WalletService.getState());
  const [selectedJob, setSelectedJob] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        await ApiClient.initialize();
        const state = await WalletService.initialize();
        if (!isMounted) return;

        setWalletState(state);
        if (state.isConnected && state.address) {
          setAuthStep('authenticated');
        } else {
          setAuthStep('onboarding');
        }
      } catch {
        if (isMounted) setAuthStep('onboarding');
      }
    };

    init();

    const unsubscribe = WalletService.subscribe((state) => {
      setWalletState(state);
      if (!state.isConnected) {
        setAuthStep('onboarding');
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // --- Auth Flow Renderers ---
  if (authStep === 'loading') {
    return (
      <SafeAreaView style={[styles.centerContainer, { backgroundColor: colors.background.app }]}>
        <ActivityIndicator size="large" color={colors.brand.primary} />
      </SafeAreaView>
    );
  }

  if (authStep === 'onboarding') {
    return (
      <OnboardingScreen
        onGetStarted={() => setAuthStep('connect_wallet')}
      />
    );
  }

  if (authStep === 'connect_wallet') {
    return (
      <ConnectWalletScreen
        onBack={() => setAuthStep('onboarding')}
        onConnected={() => setAuthStep('select_role')}
      />
    );
  }

  if (authStep === 'select_role') {
    return (
      <RoleSelectScreen
        walletAddress={walletState.address || ''}
        providerName={walletState.providerName || 'MetaMask'}
        onRoleSelected={() => {
          setAuthStep('authenticated');
          setActiveTab('jobs');
        }}
      />
    );
  }

  // --- Authenticated Main Application Flow ---
  const isClient = walletState.role === 'client';

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
        return (
          <WalletScreen
            onDisconnect={() => setAuthStep('onboarding')}
            onRoleChanged={() => {
              setActiveTab('jobs');
            }}
          />
        );
      case 'jobs':
        return (
          <JobsFeedScreen
            isClient={isClient}
            onSelectJob={(job) => {
              setSelectedJob(job);
              if (isClient) {
                setActiveTab('client_review');
              } else {
                setActiveTab('proposal');
              }
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
            job={selectedJob || ApiClient.getLocalJobs()[0]}
            onBack={() => setActiveTab('jobs')}
            onSubmitted={() => {
              setActiveTab('projects');
            }}
          />
        );
      case 'client_review':
        return (
          <ClientProposalsScreen
            job={selectedJob || ApiClient.getLocalJobs()[0]}
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

  // Role-Aware Navigation Tabs
  const clientNavItems: Array<{ id: TabType; label: string; icon: IconName }> = [
    { id: 'jobs', label: 'Market', icon: 'briefcase' },
    { id: 'create_job', label: 'Post Gig', icon: 'plus' },
    { id: 'projects', label: 'Escrow', icon: 'shield' },
    { id: 'wallet', label: 'Wallet', icon: 'wallet' },
  ];

  const freelancerNavItems: Array<{ id: TabType; label: string; icon: IconName }> = [
    { id: 'jobs', label: 'Gigs', icon: 'briefcase' },
    { id: 'proposal', label: 'My Bid', icon: 'fileText' },
    { id: 'projects', label: 'Work', icon: 'shield' },
    { id: 'wallet', label: 'Wallet', icon: 'wallet' },
  ];

  const currentNavItems = isClient ? clientNavItems : freelancerNavItems;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.app }}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background.app} />

      {/* Top Universal Quick Wallet Bar (visible on root tabs) */}
      {!selectedProjectId && activeTab !== 'wallet' && (
        <View style={styles.topWalletPillRow}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveTab('wallet')}
            style={styles.topWalletPill}
          >
            <View style={styles.topWalletDot} />
            <Text style={styles.topWalletRole} numberOfLines={1}>
              {walletState.address
                ? `${walletState.providerName || 'EVM'}: ${walletState.address.slice(0, 6)}...${walletState.address.slice(-4)}`
                : 'Connect Wallet'}
            </Text>
            <Text style={styles.topWalletBalance}>
              ${walletState.usdcBalance} USDC
            </Text>
            <View style={styles.networkTag}>
              <Text style={styles.networkTagText}>Sepolia</Text>
            </View>
            <Icon name="chevronRight" size={12} color="#6B7280" />
          </TouchableOpacity>
        </View>
      )}

      {/* Active Screen Body */}
      <View style={{ flex: 1 }}>{renderScreen()}</View>

      {/* Floating Role-Aware Bottom Navigation */}
      <View style={styles.navWrapper}>
        <View style={[styles.navContainer, { backgroundColor: '#FFFFFF', borderRadius: radii.card }]}>
          {currentNavItems.map((item) => {
            const isActive =
              !selectedProjectId &&
              (activeTab === item.id ||
                (item.id === 'jobs' && (activeTab === 'proposal' || activeTab === 'client_review')) ||
                (item.id === 'create_job' && activeTab === 'create_job'));

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
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topWalletPillRow: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 2,
    alignItems: 'flex-end',
  },
  topWalletPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  topWalletDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#10B981',
  },
  topWalletRole: {
    fontSize: 11,
    fontWeight: '700',
    color: '#374151',
    maxWidth: 140,
  },
  topWalletBalance: {
    fontSize: 11,
    fontWeight: '800',
    color: '#5B4DFF',
  },
  networkTag: {
    backgroundColor: '#E8FAF3',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  networkTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#059669',
  },
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
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 6,
  },
  activeTabPill: {},
  tabLabel: {
    fontSize: 12,
  },
});
