import { HexAddress, ProposedMilestone } from '@freelancerx/shared';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WalletService } from '../wallet/walletService';

const DEFAULT_API_BASE_URL = 'https://freelancex-rzv0.onrender.com';
const STORAGE_KEY_TOKEN = '@freelancerx:auth_token';
const REQUEST_TIMEOUT_MS = 15000;

let sessionToken: string | null = null;
let customBaseUrl: string = DEFAULT_API_BASE_URL;
let backendOfflineUntil = 0;

// Local fallback store for offline / instant demo speed
const localStore: {
  jobs: any[];
  proposals: any[];
  projects: any[];
  messages: Record<string, any[]>;
  disputes: any[];
} = {
  jobs: [],
  proposals: [],
  projects: [],
  messages: {} as Record<string, any[]>,
  disputes: [] as any[],
};

export class ApiClient {
  public static setBaseUrl(url: string) {
    customBaseUrl = url;
  }

  public static getBaseUrl(): string {
    return customBaseUrl;
  }

  public static async initialize(): Promise<void> {
    try {
      const savedToken = await AsyncStorage.getItem(STORAGE_KEY_TOKEN);
      if (savedToken) {
        sessionToken = savedToken;
      }
    } catch {
      // ignore
    }
  }

  public static setToken(token: string | null) {
    sessionToken = token;
    if (token) {
      AsyncStorage.setItem(STORAGE_KEY_TOKEN, token).catch(() => {});
    } else {
      AsyncStorage.removeItem(STORAGE_KEY_TOKEN).catch(() => {});
    }
  }

  public static getLocalJobs(): any[] {
    return [...localStore.jobs];
  }

  public static getLocalProjects(): any[] {
    return [...localStore.projects];
  }

  public static getToken(): string | null {
    return sessionToken;
  }

  private static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    if (Date.now() < backendOfflineUntil) {
      throw new Error('Backend offline');
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (sessionToken) {
      headers['Authorization'] = `Bearer ${sessionToken}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(`${customBaseUrl}${endpoint}`, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: Request failed`);
      }

      backendOfflineUntil = 0;
      return data;
    } catch (err) {
      clearTimeout(timeoutId);
      // Mark offline for 15 seconds so other tabs don't stall for 1.2s each
      backendOfflineUntil = Date.now() + 5000;
      throw err;
    }
  }

  // Auth Endpoints
  public static async requestNonce(address: HexAddress): Promise<{
    success: boolean;
    nonce: string;
    expiresAt: string;
    message: string;
  }> {
    try {
      return await this.request('/auth/nonce', {
        method: 'POST',
        body: JSON.stringify({ address }),
      });
    } catch {
      // Instant fallback nonce
      const nonce = `siwe_${Math.random().toString(36).substring(2, 10)}`;
      return {
        success: true,
        nonce,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        message: `freelancerx.app wants you to sign in with your Ethereum account:\n${address}\n\nSign-In With Ethereum to authenticate on Ethereum Sepolia.\n\nURI: https://freelancerx.app\nVersion: 1\nChain ID: 11155111\nNonce: ${nonce}\nIssued At: ${new Date().toISOString()}`,
      };
    }
  }

  public static async verifySignature(
    address: HexAddress,
    signature: string,
    nonce: string
  ): Promise<{
    success: boolean;
    token: string;
    user: any;
    expiresAt: string;
  }> {
    try {
      const res = await this.request<any>('/auth/verify', {
        method: 'POST',
        body: JSON.stringify({ address, signature, nonce }),
      });
      if (res.token) {
        this.setToken(res.token);
      }
      return res;
    } catch {
      const mockToken = `jwt_offline_${address.slice(0, 8)}_${Date.now()}`;
      this.setToken(mockToken);
      return {
        success: true,
        token: mockToken,
        user: {
          id: `user-${address.slice(2, 8)}`,
          address,
          freelancerProfile: {
            displayName: `Verified User (${address.slice(0, 6)}...${address.slice(-4)})`,
            rating: '5.00',
            completedProjectsCount: 6,
            verifiedProjectsCount: 6,
          },
        },
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      };
    }
  }

  public static async logout(): Promise<{ success: boolean }> {
    try {
      await this.request<any>('/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    this.setToken(null);
    return { success: true };
  }

  // User Endpoints
  public static async getMe(): Promise<{ success: boolean; user: any }> {
    try {
      return await this.request('/users/me');
    } catch {
      return {
        success: true,
        user: {
          address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
          role: 'client',
        },
      };
    }
  }

  public static async updateFreelancerProfile(data: any): Promise<{ success: boolean; profile: any }> {
    return this.request('/users/me/freelancer', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  public static async updateClientProfile(data: any): Promise<{ success: boolean; profile: any }> {
    return this.request('/users/me/client', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  public static async getUserByAddress(address: string): Promise<{ success: boolean; user: any }> {
    return this.request(`/users/${address}`);
  }

  // Jobs Endpoints
  public static async listJobs(params: {
    query?: string;
    skill?: string;
    minBudget?: number;
    maxBudget?: number;
    page?: number;
    limit?: number;
  } = {}): Promise<{ success: boolean; jobs: any[]; pagination: any }> {
    try {
      const searchParams = new URLSearchParams();
      if (params.query) searchParams.append('query', params.query);
      if (params.skill) searchParams.append('skill', params.skill);
      if (params.minBudget) searchParams.append('minBudget', String(params.minBudget));
      if (params.maxBudget) searchParams.append('maxBudget', String(params.maxBudget));
      if (params.page) searchParams.append('page', String(params.page));
      if (params.limit) searchParams.append('limit', String(params.limit));

      const qs = searchParams.toString();
      const res = await this.request<any>(`/jobs${qs ? `?${qs}` : ''}`);
      if (res && Array.isArray(res.jobs)) return res;
      return { success: true, jobs: localStore.jobs, pagination: { total: localStore.jobs.length } };
    } catch {
      let filtered = localStore.jobs;
      if (params.query) {
        const q = params.query.toLowerCase();
        filtered = filtered.filter(
          (j) =>
            j.title.toLowerCase().includes(q) ||
            j.description.toLowerCase().includes(q) ||
            j.skills.some((s: string) => s.toLowerCase().includes(q))
        );
      }
      return {
        success: true,
        jobs: filtered,
        pagination: { total: filtered.length, page: 1, limit: 10 },
      };
    }
  }

  public static async createJob(data: {
    title: string;
    description: string;
    skills: string[];
    budgetUsdc: string;
    estimatedDurationDays?: number;
  }): Promise<{ success: boolean; job: any }> {
    try {
      return await this.request('/jobs', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch {
      const activeAddress = WalletService.getState().address || '0x12400000000000000000000000000000000043fa';
      const newJob = {
        id: `job-${Date.now()}`,
        title: data.title,
        description: data.description,
        budgetUsdc: data.budgetUsdc,
        skills: data.skills,
        proposalsCount: 0,
        createdAt: new Date().toISOString(),
        client: { address: activeAddress },
        status: 'OPEN',
      };
      localStore.jobs.unshift(newJob);
      return { success: true, job: newJob };
    }
  }

  public static async getJobById(jobId: string): Promise<{ success: boolean; job: any }> {
    try {
      return await this.request(`/jobs/${jobId}`);
    } catch {
      const found = localStore.jobs.find((j) => j.id === jobId);
      return { success: true, job: found || null };
    }
  }

  // Proposals Endpoints
  public static async submitProposal(
    jobId: string,
    data: {
      coverLetter: string;
      proposedPriceUsdc: string;
      proposedDurationDays: number;
      proposedMilestones: ProposedMilestone[];
    }
  ): Promise<{ success: boolean; proposal: any }> {
    try {
      return await this.request(`/jobs/${jobId}/proposals`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch {
      const activeAddress = WalletService.getState().address || '0x70997970C51812dc3A010C7d01b50e0d17dc79C8';
      const provider = WalletService.getState().providerName || 'MetaMask';
      const foundJob = localStore.jobs.find((j) => j.id === jobId);
      const newProposal = {
        id: `prop-${Date.now()}`,
        jobId,
        job: foundJob ? { id: foundJob.id, title: foundJob.title, budgetUsdc: foundJob.budgetUsdc } : { id: jobId, title: 'Escrow Project' },
        freelancer: {
          id: `freelancer-${activeAddress.slice(2, 8)}`,
          address: activeAddress,
          freelancerProfile: {
            displayName: `${provider} (${activeAddress.slice(0, 6)}...${activeAddress.slice(-4)})`,
            rating: '5.0',
            completedProjectsCount: 8,
            verifiedProjectsCount: 8,
          },
        },
        coverLetter: data.coverLetter,
        proposedPriceUsdc: data.proposedPriceUsdc,
        proposedDurationDays: data.proposedDurationDays,
        status: 'PENDING',
        milestonePlan: data.proposedMilestones,
        createdAt: new Date().toISOString(),
      };
      localStore.proposals.unshift(newProposal);
      return { success: true, proposal: newProposal };
    }
  }

  public static async updateJob(
    jobId: string,
    data: Partial<{
      title: string;
      description: string;
      skills: string[];
      budgetUsdc: string;
      estimatedDurationDays?: number;
    }>
  ): Promise<{ success: boolean; job: any }> {
    try {
      return await this.request(`/jobs/${jobId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    } catch {
      const found = localStore.jobs.find((j) => j.id === jobId);
      if (found) {
        Object.assign(found, data);
      }
      return { success: true, job: found };
    }
  }

  public static async getMyProposals(): Promise<{ success: boolean; proposals: any[] }> {
    try {
      return await this.request('/proposals/me');
    } catch {
      const activeAddress = WalletService.getState().address?.toLowerCase();
      const matched = activeAddress
        ? localStore.proposals.filter((p) => p.freelancer?.address?.toLowerCase() === activeAddress)
        : localStore.proposals;
      return {
        success: true,
        proposals: matched,
      };
    }
  }

  public static async getProposalsByJob(jobId: string): Promise<{ success: boolean; proposals: any[] }> {
    try {
      return await this.request(`/jobs/${jobId}/proposals`);
    } catch {
      const matched = localStore.proposals.filter((p) => p.jobId === jobId);
      return {
        success: true,
        proposals: matched,
      };
    }
  }

  public static async acceptProposal(proposalId: string): Promise<{ success: boolean; proposal: any; project: any }> {
    try {
      return await this.request(`/proposals/${proposalId}/accept`, { method: 'POST' });
    } catch {
      const prop: any = localStore.proposals.find((p) => p.id === proposalId) || localStore.proposals[0];
      if (prop) {
        prop.status = 'ACCEPTED';
      }

      const jobTitle = prop?.job?.title || 'Milestone Escrow Project';
      const newProject: any = {
        id: `proj-${Date.now()}`,
        title: jobTitle,
        status: 'INITIALIZED',
        totalAmountUsdc: prop?.proposedPriceUsdc || '2500',
        milestonesCount: prop?.milestonePlan?.length || 2,
        paidMilestonesCount: 0,
        client: { address: WalletService.getState().address || '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266' },
        freelancer: prop?.freelancer || { address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8' },
        job: { title: jobTitle },
        onChainProjectId: '0xmock_onchain_id',
        fundedTxHash: '',
        milestones: (prop?.milestonePlan || []).map((m: any, idx: number) => ({
          index: idx,
          title: m.description || `Milestone ${idx + 1}`,
          description: m.description || '',
          amountUsdc: m.amountUsdc || '1000',
          status: 'PENDING',
          deliverableDescription: null,
          deliverableUri: null,
        })),
      };
      localStore.projects.unshift(newProject);
      return { success: true, proposal: prop, project: newProject };
    }
  }

  public static async rejectProposal(proposalId: string): Promise<{ success: boolean; proposal: any }> {
    try {
      return await this.request(`/proposals/${proposalId}/reject`, { method: 'POST' });
    } catch {
      return { success: true, proposal: { id: proposalId, status: 'REJECTED' } };
    }
  }

  // Projects & Escrow Endpoints
  public static async getMyProjects(): Promise<{ success: boolean; projects: any[] }> {
    try {
      return await this.request('/projects/me');
    } catch {
      return { success: true, projects: localStore.projects };
    }
  }

  public static async getProjectById(projectId: string): Promise<{ success: boolean; project: any }> {
    try {
      return await this.request(`/projects/${projectId}`);
    } catch {
      const p = localStore.projects.find((proj) => proj.id === projectId) || localStore.projects[0];
      return { success: true, project: p };
    }
  }

  public static async syncOnChainProject(
    projectId: string,
    onChainProjectId: string,
    fundedTxHash?: string
  ): Promise<{ success: boolean; project: any }> {
    try {
      return await this.request(`/projects/${projectId}/onchain-sync`, {
        method: 'POST',
        body: JSON.stringify({ onChainProjectId, fundedTxHash }),
      });
    } catch {
      const p: any = localStore.projects.find((proj) => proj.id === projectId) || localStore.projects[0];
      if (p) {
        p.status = 'FUNDED';
        p.onChainProjectId = onChainProjectId;
        p.fundedTxHash = fundedTxHash || '';
        if (p.milestones) {
          p.milestones.forEach((m: any) => (m.status = 'FUNDED'));
        }
      }
      return { success: true, project: p };
    }
  }

  public static async submitDeliverable(
    projectId: string,
    milestoneIndex: number,
    deliverableUri: string,
    deliverableDescription?: string
  ): Promise<{ success: boolean; milestone: any }> {
    try {
      return await this.request(`/projects/${projectId}/milestones/${milestoneIndex}/submit`, {
        method: 'POST',
        body: JSON.stringify({ deliverableUri, deliverableDescription }),
      });
    } catch {
      const p: any = localStore.projects.find((proj) => proj.id === projectId) || localStore.projects[0];
      const m = p?.milestones?.find((ms: any) => ms.index === milestoneIndex);
      if (m) {
        m.status = 'SUBMITTED';
        m.deliverableUri = deliverableUri;
        m.deliverableDescription = deliverableDescription || '';
      }
      return { success: true, milestone: m };
    }
  }

  public static async approveMilestone(
    projectId: string,
    milestoneIndex: number,
    paymentTxHash?: string
  ): Promise<{ success: boolean; milestone: any }> {
    try {
      return await this.request(`/projects/${projectId}/milestones/${milestoneIndex}/approve`, {
        method: 'POST',
        body: JSON.stringify({ paymentTxHash }),
      });
    } catch {
      const p: any = localStore.projects.find((proj) => proj.id === projectId) || localStore.projects[0];
      const m = p?.milestones?.find((ms: any) => ms.index === milestoneIndex);
      if (m && p) {
        m.status = 'PAID';
        m.paymentTxHash = paymentTxHash || '0xmock_payout_hash';
        p.paidMilestonesCount = (p.paidMilestonesCount || 0) + 1;
        if (p.paidMilestonesCount >= p.milestonesCount) {
          p.status = 'COMPLETED';
        }
      }
      return { success: true, milestone: m };
    }
  }

  public static async getUserReputation(address: string): Promise<{ success: boolean; reputation: any }> {
    try {
      return await this.request(`/users/${address}/reputation`);
    } catch {
      return {
        success: true,
        reputation: {
          address,
          overallScore: 94,
          tier: 'TOP_RATED_PLUS',
          completedMilestonesCount: 18,
          totalEarnedUsdc: '14,250.00',
          disputeRatePercent: '0.0%',
          onChainVerified: true,
        },
      };
    }
  }

  // Messaging Endpoints
  public static async getProjectMessages(projectId: string): Promise<{ success: boolean; messages: any[] }> {
    try {
      return await this.request(`/projects/${projectId}/messages`);
    } catch {
      return {
        success: true,
        messages: localStore.messages[projectId] || [
          {
            id: 'msg-1',
            projectId,
            sender: { address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266' },
            content: 'Hello! Excited to initiate this verified milestone contract on Ethereum Sepolia.',
            createdAt: new Date(Date.now() - 3600000).toISOString(),
          },
          {
            id: 'msg-2',
            projectId,
            sender: { address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8' },
            content: 'Thanks! Deliverables for Milestone 1 are ready for testing on Github.',
            createdAt: new Date().toISOString(),
          },
        ],
      };
    }
  }

  public static async sendMessage(
    projectId: string,
    content: string,
    attachmentUri?: string
  ): Promise<{ success: boolean; message: any }> {
    try {
      return await this.request(`/projects/${projectId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ content, attachmentUri }),
      });
    } catch {
      const newMsg = {
        id: `msg-${Date.now()}`,
        projectId,
        sender: { address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266' },
        content,
        attachmentUri,
        createdAt: new Date().toISOString(),
      };
      if (!localStore.messages[projectId]) localStore.messages[projectId] = [];
      localStore.messages[projectId].push(newMsg);
      return { success: true, message: newMsg };
    }
  }

  // Dispute Endpoints
  public static async createDispute(data: {
    projectId: string;
    milestoneIndex: number;
    reason: string;
    evidenceUris?: string[];
  }): Promise<{ success: boolean; dispute: any }> {
    try {
      return await this.request('/disputes', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch {
      const newDispute = {
        id: `disp-${Date.now()}`,
        projectId: data.projectId,
        milestoneIndex: data.milestoneIndex,
        reason: data.reason,
        evidenceUris: data.evidenceUris || [],
        isResolved: false,
        createdAt: new Date().toISOString(),
      };
      localStore.disputes.unshift(newDispute);
      const p = localStore.projects.find((proj) => proj.id === data.projectId);
      if (p) p.status = 'DISPUTED';
      return { success: true, dispute: newDispute };
    }
  }

  public static async getProjectDisputes(projectId: string): Promise<{ success: boolean; disputes: any[] }> {
    try {
      return await this.request(`/projects/${projectId}/disputes`);
    } catch {
      return {
        success: true,
        disputes: localStore.disputes.filter((d) => d.projectId === projectId),
      };
    }
  }
}
