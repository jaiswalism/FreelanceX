import { HexAddress, ProposedMilestone } from '@freelancerx/shared';

const API_BASE_URL = 'http://10.0.2.2:4000'; // Android emulator localhost alias or configurable URL

let sessionToken: string | null = null;

export class ApiClient {
  public static setToken(token: string | null) {
    sessionToken = token;
  }

  public static getToken(): string | null {
    return sessionToken;
  }

  private static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (sessionToken) {
      headers['Authorization'] = `Bearer ${sessionToken}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Network request failed');
    }

    return data;
  }

  // Auth Endpoints
  public static async requestNonce(address: HexAddress): Promise<{
    success: boolean;
    nonce: string;
    expiresAt: string;
    message: string;
  }> {
    return this.request('/auth/nonce', {
      method: 'POST',
      body: JSON.stringify({ address }),
    });
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
    const res = await this.request<any>('/auth/verify', {
      method: 'POST',
      body: JSON.stringify({ address, signature, nonce }),
    });

    if (res.token) {
      this.setToken(res.token);
    }

    return res;
  }

  public static async logout(): Promise<{ success: boolean }> {
    const res = await this.request<any>('/auth/logout', {
      method: 'POST',
    });
    this.setToken(null);
    return res;
  }

  // User Endpoints
  public static async getMe(): Promise<{ success: boolean; user: any }> {
    return this.request('/users/me');
  }

  public static async updateFreelancerProfile(data: {
    displayName?: string;
    bio?: string;
    title?: string;
    skills?: string[];
    hourlyRate?: number;
  }): Promise<{ success: boolean; profile: any }> {
    return this.request('/users/me/freelancer', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  public static async updateClientProfile(data: {
    displayName?: string;
    companyName?: string;
    description?: string;
    website?: string;
  }): Promise<{ success: boolean; profile: any }> {
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
    const searchParams = new URLSearchParams();
    if (params.query) searchParams.append('query', params.query);
    if (params.skill) searchParams.append('skill', params.skill);
    if (params.minBudget) searchParams.append('minBudget', String(params.minBudget));
    if (params.maxBudget) searchParams.append('maxBudget', String(params.maxBudget));
    if (params.page) searchParams.append('page', String(params.page));
    if (params.limit) searchParams.append('limit', String(params.limit));

    const qs = searchParams.toString();
    return this.request(`/jobs${qs ? `?${qs}` : ''}`);
  }

  public static async createJob(data: {
    title: string;
    description: string;
    skills: string[];
    budgetUsdc: string;
    estimatedDurationDays?: number;
  }): Promise<{ success: boolean; job: any }> {
    return this.request('/jobs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public static async getJobById(jobId: string): Promise<{ success: boolean; job: any }> {
    return this.request(`/jobs/${jobId}`);
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
    return this.request(`/jobs/${jobId}/proposals`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public static async getProposalsByJob(jobId: string): Promise<{ success: boolean; proposals: any[] }> {
    return this.request(`/jobs/${jobId}/proposals`);
  }

  public static async acceptProposal(proposalId: string): Promise<{ success: boolean; proposal: any; project: any }> {
    return this.request(`/proposals/${proposalId}/accept`, {
      method: 'POST',
    });
  }

  public static async rejectProposal(proposalId: string): Promise<{ success: boolean; proposal: any }> {
    return this.request(`/proposals/${proposalId}/reject`, {
      method: 'POST',
    });
  }

  // Projects & Escrow Endpoints
  public static async getMyProjects(): Promise<{ success: boolean; projects: any[] }> {
    return this.request('/projects/me');
  }

  public static async getProjectById(projectId: string): Promise<{ success: boolean; project: any }> {
    return this.request(`/projects/${projectId}`);
  }

  public static async syncOnChainProject(
    projectId: string,
    onChainProjectId: string,
    fundedTxHash?: string
  ): Promise<{ success: boolean; project: any }> {
    return this.request(`/projects/${projectId}/onchain-sync`, {
      method: 'POST',
      body: JSON.stringify({ onChainProjectId, fundedTxHash }),
    });
  }

  public static async submitDeliverable(
    projectId: string,
    milestoneIndex: number,
    deliverableUri: string,
    deliverableDescription?: string
  ): Promise<{ success: boolean; milestone: any }> {
    return this.request(`/projects/${projectId}/milestones/${milestoneIndex}/submit`, {
      method: 'POST',
      body: JSON.stringify({ deliverableUri, deliverableDescription }),
    });
  }

  public static async approveMilestone(
    projectId: string,
    milestoneIndex: number,
    paymentTxHash?: string
  ): Promise<{ success: boolean; milestone: any }> {
    return this.request(`/projects/${projectId}/milestones/${milestoneIndex}/approve`, {
      method: 'POST',
      body: JSON.stringify({ paymentTxHash }),
    });
  }

  public static async getUserReputation(address: string): Promise<{ success: boolean; reputation: any }> {
    return this.request(`/users/${address}/reputation`);
  }

  // Messaging Endpoints
  public static async getProjectMessages(projectId: string): Promise<{ success: boolean; messages: any[] }> {
    return this.request(`/projects/${projectId}/messages`);
  }

  public static async sendMessage(
    projectId: string,
    content: string,
    attachmentUri?: string
  ): Promise<{ success: boolean; message: any }> {
    return this.request(`/projects/${projectId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content, attachmentUri }),
    });
  }

  // Dispute Endpoints
  public static async createDispute(data: {
    projectId: string;
    milestoneIndex: number;
    reason: string;
    evidenceUris?: string[];
  }): Promise<{ success: boolean; dispute: any }> {
    return this.request('/disputes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public static async getProjectDisputes(projectId: string): Promise<{ success: boolean; disputes: any[] }> {
    return this.request(`/projects/${projectId}/disputes`);
  }
}
