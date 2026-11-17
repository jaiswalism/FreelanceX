import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  BackHandler,
  Alert,
} from 'react-native';
import { defaultTheme } from './src/theme';
import { Icon, IconName } from './src/components/Icon';
import { OnboardingScreen } from './src/screens/onboarding/OnboardingScreen';
import { ConnectWalletScreen } from './src/screens/onboarding/ConnectWalletScreen';
import { RoleSelectScreen } from './src/screens/onboarding/RoleSelectScreen';
import { ProfileSetupScreen } from './src/screens/onboarding/ProfileSetupScreen';
import { WalletScreen } from './src/screens/wallet/WalletScreen';
import { JobsFeedScreen } from './src/screens/jobs/JobsFeedScreen';
import { CreateJobScreen } from './src/screens/jobs/CreateJobScreen';
import { ProposalSubmitScreen } from './src/screens/proposals/ProposalSubmitScreen';
import { ClientProposalsScreen } from './src/screens/proposals/ClientProposalsScreen';
import { MyBidsScreen } from './src/screens/proposals/MyBidsScreen';
import { ProjectsListScreen } from './src/screens/projects/ProjectsListScreen';
import { ProjectDetailScreen } from './src/screens/projects/ProjectDetailScreen';
import { WalletService, WalletState } from './src/services/wallet/walletService';
import { ApiClient } from './src/services/api/apiClient';

type TabType =
  | 'jobs'
  | 'bids'
  | 'projects'
  | 'wallet'
  | 'create_job'
  | 'proposal'
  | 'client_review';

type AuthStep = 'loading' | 'onboarding' | 'connect_wallet' | 'select_role' | 'profile_setup' | 'authenticated';

export default function App() {
  const { colors, radii } = defaultTheme;
  const [authStep, setAuthStep] = useState<AuthStep>('loading');
  const [activeTab, setActiveTab] = useState<TabType>('jobs');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [walletState, setWalletState] = useState<WalletState>(WalletService.getState());
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [editingJob, setEditingJob] = useState<any | null>(null);

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        await ApiClient.initialize();
        const state = await WalletService.initialize();
        if (!isMounted) return;

        setWalletState(state);
        if (state.isConnected && state.address) {
          // Pre-authenticate session in background to guarantee live Neon database persistence
          ApiClient.ensureAuthenticatedSession(state.address).catch((err) =>
            console.warn('Background auto-auth failed:', err)
          );
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

  // Support Android hardware back button across the whole app
  useEffect(() => {
    const handleHardwareBackPress = () => {
      // If modal project details is open
      if (selectedProjectId) {
        setSelectedProjectId(null);
        return true;
      }

      // If in sub-screens
      if (activeTab === 'create_job' || activeTab === 'proposal' || activeTab === 'client_review') {
        setEditingJob(null);
        setActiveTab('jobs');
        return true;
      }

      // If in other main tabs, return to jobs feed
      if (activeTab !== 'jobs') {
        setActiveTab('jobs');
        return true;
      }

      // If in onboarding/auth flow
      if (authStep === 'profile_setup') {
        setAuthStep('select_role');
        return true;
      }
      if (authStep === 'select_role') {
        setAuthStep('connect_wallet');
        return true;
      }
      if (authStep === 'connect_wallet') {
        setAuthStep('onboarding');
        return true;
      }

      // Root screen: allow default Android exit
      return false;
    };

    const backSubscription = BackHandler.addEventListener(
      'hardwareBackPress',
      handleHardwareBackPress
    );

    return () => backSubscription.remove();
  }, [selectedProjectId, activeTab, authStep]);

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
          setAuthStep('profile_setup');
        }}
      />
    );
  }

  if (authStep === 'profile_setup') {
    return (
      <ProfileSetupScreen
        role={walletState.role}
        walletAddress={walletState.address || ''}
        onComplete={() => {
          setAuthStep('authenticated');
          setActiveTab('jobs');
        }}
      />
    );
  }

  // --- Authenticated Main Application Flow ---
  const isClient = walletState.role === 'client';

  // Check if we are inside an internal page (navbar should be hidden on internal pages)
  const isInternalPage =
    Boolean(selectedProjectId) ||
    activeTab === 'create_job' ||
    activeTab === 'proposal' ||
    activeTab === 'client_review';

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
            onEditProfile={() => setAuthStep('profile_setup')}
          />
        );
      case 'jobs':
        return (
          <JobsFeedScreen
            isClient={isClient}
            onSelectJob={(job) => {
              setSelectedJob(job);
              const jobOwner = (job.client?.address || job.clientAddress || '').toLowerCase();
              const myAddress = (walletState.address || '').toLowerCase();
              const isOwner = Boolean(myAddress && jobOwner && myAddress === jobOwner);

              if (isOwner && isClient) {
                // Publisher reviewing applicant proposals for their gig
                setActiveTab('client_review');
              } else if (!isClient) {
                // Freelancer applying to the gig
                setActiveTab('proposal');
              } else {
                // Client viewing another client's market gig in read-only details
                Alert.alert(
                  job.title || 'Marketplace Gig',
                  `Budget: $${job.budgetUsdc} USDC\n\n${job.description}\n\nRequired Skills: ${job.skills?.join(', ') || 'N/A'}\n\nPublisher: ${jobOwner ? `${jobOwner.slice(0, 6)}...${jobOwner.slice(-4)}` : 'Verified Client'}`,
                  [{ text: 'Close' }]
                );
              }
            }}
            onCreateJobPress={() => {
              setEditingJob(null);
              setActiveTab('create_job');
            }}
            onEditJob={(job) => {
              setEditingJob(job);
              setActiveTab('create_job');
            }}
          />
        );
      case 'create_job':
        return (
          <CreateJobScreen
            jobToEdit={editingJob}
            onBack={() => {
              setEditingJob(null);
              setActiveTab('jobs');
            }}
            onJobCreated={(newOrUpdatedJob) => {
              setEditingJob(null);
              setSelectedJob(newOrUpdatedJob);
              setActiveTab('jobs');
            }}
          />
        );
      case 'proposal':
        if (!selectedJob) {
          return null;
        }
        return (
          <ProposalSubmitScreen
            job={selectedJob}
            onBack={() => setActiveTab('jobs')}
            onSubmitted={() => {
              setActiveTab('bids');
            }}
          />
        );
      case 'client_review':
        if (!selectedJob) {
          return null;
        }
        return (
          <ClientProposalsScreen
            job={selectedJob}
            onBack={() => setActiveTab('jobs')}
            onProjectCreated={(project: any) => {
              if (project?.id) {
                setSelectedProjectId(project.id);
              }
              setActiveTab('projects');
            }}
          />
        );
      case 'bids':
        return (
          <MyBidsScreen
            onBrowseGigs={() => setActiveTab('jobs')}
            onOpenProject={(projId) => setSelectedProjectId(projId)}
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

  // Role-Aware Navigation Tabs (Cleaned: no Post Gig tab, My Bids shows submitted bids)
  const clientNavItems: Array<{ id: TabType; label: string; icon: IconName }> = [
    { id: 'jobs', label: 'Market', icon: 'briefcase' },
    { id: 'projects', label: 'Escrow', icon: 'shield' },
    { id: 'wallet', label: 'Wallet', icon: 'wallet' },
  ];

  const freelancerNavItems: Array<{ id: TabType; label: string; icon: IconName }> = [
    { id: 'jobs', label: 'Gigs', icon: 'briefcase' },
    { id: 'bids', label: 'My Bids', icon: 'fileText' },
    { id: 'projects', label: 'Work', icon: 'shield' },
    { id: 'wallet', label: 'Wallet', icon: 'wallet' },
  ];

  const currentNavItems = isClient ? clientNavItems : freelancerNavItems;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.app }}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background.app} />

      {/* Active Screen Body */}
      <View style={{ flex: 1 }}>{renderScreen()}</View>

      {/* Floating Role-Aware Bottom Navigation (Only on root tabs, hidden on internal pages) */}
      {!isInternalPage && (
        <View style={styles.navWrapper}>
          <View style={[styles.navContainer, { backgroundColor: '#FFFFFF', borderRadius: radii.card }]}>
            {currentNavItems.map((item) => {
              const isActive = activeTab === item.id;

              return (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.8}
                  onPress={() => {
                    setSelectedProjectId(null);
                    setEditingJob(null);
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
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
    paddingHorizontal: 14,
    borderRadius: 20,
    gap: 6,
  },
  activeTabPill: {},
  tabLabel: {
    fontSize: 12,
  },
});
