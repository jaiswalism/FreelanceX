import { HexAddress } from '@freelancerx/shared';

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
}
