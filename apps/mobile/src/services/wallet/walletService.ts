import { HexAddress } from '@freelancerx/shared';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchChainStatus, fetchUsdcBalance, fetchEthBalance } from '../blockchain/client';

export type AccountRole = 'client' | 'freelancer';
export type WalletConnectionType = 'none' | 'external';

export interface WalletState {
  isConnected: boolean;
  address: HexAddress | null;
  chainId: number;
  isConnecting: boolean;
  role: AccountRole;
  roleName: string;
  providerName: string;
  connectionType: WalletConnectionType;
  usdcBalance: string;
  ethBalance: string;
  latencyMs: number | null;
  blockNumber: string | null;
}

const STORAGE_KEY_ROLE = '@freelancerx:wallet_role';
const STORAGE_KEY_TYPE = '@freelancerx:wallet_type';
const STORAGE_KEY_ADDRESS = '@freelancerx:wallet_address';
const STORAGE_KEY_PROVIDER = '@freelancerx:wallet_provider';

const listeners = new Set<(state: WalletState) => void>();

export class WalletService {
  private static state: WalletState = {
    isConnected: false,
    address: null,
    chainId: 11155111, // Ethereum Sepolia
    isConnecting: false,
    role: 'freelancer',
    roleName: 'Not Connected',
    providerName: '',
    connectionType: 'none',
    usdcBalance: '0.00',
    ethBalance: '0.0000',
    latencyMs: null,
    blockNumber: null,
  };

  private static notify() {
    const currentState = { ...this.state };
    listeners.forEach((listener) => {
      try {
        listener(currentState);
      } catch (err) {
        console.warn('Wallet listener error:', err);
      }
    });
  }

  public static subscribe(listener: (state: WalletState) => void): () => void {
    listeners.add(listener);
    listener({ ...this.state });
    return () => {
      listeners.delete(listener);
    };
  }

  public static getState(): WalletState {
    return { ...this.state };
  }

  /**
   * Initializes wallet state from persistent device storage.
   * On fresh install or when disconnected, remains NOT connected.
   */
  public static async initialize(): Promise<WalletState> {
    try {
      const [savedAddress, savedRole, savedProvider] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEY_ADDRESS),
        AsyncStorage.getItem(STORAGE_KEY_ROLE),
        AsyncStorage.getItem(STORAGE_KEY_PROVIDER),
      ]);

      if (savedAddress && savedAddress.startsWith('0x')) {
        const role = (savedRole === 'client' ? 'client' : 'freelancer') as AccountRole;
        const providerName = savedProvider || 'MetaMask';
        const roleName = role === 'client' ? 'Client' : 'Freelancer';

        this.state = {
          ...this.state,
          isConnected: true,
          address: savedAddress as HexAddress,
          chainId: 11155111,
          isConnecting: false,
          role,
          roleName: `${providerName} (${roleName})`,
          providerName,
          connectionType: 'external',
        };
        this.notify();

        // Background balance refresh
        this.refreshBalances().catch(() => {});
        return this.getState();
      } else {
        this.state = {
          isConnected: false,
          address: null,
          chainId: 11155111,
          isConnecting: false,
          role: 'freelancer',
          roleName: 'Not Connected',
          providerName: '',
          connectionType: 'none',
          usdcBalance: '0.00',
          ethBalance: '0.0000',
          latencyMs: null,
          blockNumber: null,
        };
        this.notify();
        return this.getState();
      }
    } catch {
      return this.getState();
    }
  }

  /**
   * Connect an external wallet (MetaMask, Trust, Coinbase, Rainbow) by address.
   */
  public static async connectWallet(
    address: HexAddress,
    providerName: string = 'MetaMask',
    role: AccountRole = 'freelancer',
    persist = true
  ): Promise<WalletState> {
    const roleName = role === 'client' ? 'Client' : 'Freelancer';

    this.state = {
      ...this.state,
      isConnected: true,
      address,
      chainId: 11155111,
      isConnecting: false,
      role,
      roleName: `${providerName} (${roleName})`,
      providerName,
      connectionType: 'external',
    };

    if (persist) {
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEY_ADDRESS, address),
        AsyncStorage.setItem(STORAGE_KEY_ROLE, role),
        AsyncStorage.setItem(STORAGE_KEY_PROVIDER, providerName),
        AsyncStorage.setItem(STORAGE_KEY_TYPE, 'external'),
      ]);
    }

    this.notify();
    this.refreshBalances().catch(() => {});
    return this.getState();
  }

  /**
   * Updates the user's role (Client or Freelancer)
   */
  public static async setRole(role: AccountRole): Promise<WalletState> {
    const roleName = role === 'client' ? 'Client' : 'Freelancer';
    const provider = this.state.providerName || 'Wallet';

    this.state = {
      ...this.state,
      role,
      roleName: `${provider} (${roleName})`,
    };

    await AsyncStorage.setItem(STORAGE_KEY_ROLE, role);
    this.notify();
    return this.getState();
  }

  /**
   * Refreshes Ethereum Sepolia ETH and USDC balances without blocking.
   */
  public static async refreshBalances(): Promise<WalletState> {
    if (!this.state.address) return this.getState();

    try {
      const [chainStatus, usdcRes, ethRes] = await Promise.all([
        fetchChainStatus().catch(() => ({ blockNumber: this.state.blockNumber, latencyMs: null })),
        fetchUsdcBalance(this.state.address as `0x${string}`).catch((e) => ({
          success: false,
          error: String(e),
          rawBalance: '0',
          formatted: this.state.usdcBalance,
        })),
        fetchEthBalance(this.state.address as `0x${string}`).catch((e) => ({
          success: false,
          error: String(e),
          rawBalance: '0',
          formatted: this.state.ethBalance,
        })),
      ]);

      const updatedUsdc = usdcRes.success
        ? usdcRes.formatted
        : this.state.usdcBalance !== '0.00'
        ? this.state.usdcBalance
        : usdcRes.formatted;

      const updatedEth = ethRes.success
        ? ethRes.formatted
        : this.state.ethBalance !== '0.0000'
        ? this.state.ethBalance
        : ethRes.formatted;

      this.state = {
        ...this.state,
        blockNumber: ('blockNumber' in chainStatus && chainStatus.blockNumber) ? chainStatus.blockNumber : this.state.blockNumber,
        latencyMs: ('latencyMs' in chainStatus && chainStatus.latencyMs !== undefined) ? chainStatus.latencyMs : this.state.latencyMs,
        usdcBalance: updatedUsdc,
        ethBalance: updatedEth,
      };
      this.notify();
    } catch (err) {
      console.warn('Failed to refresh Sepolia balances:', err);
    }

    return this.getState();
  }

  /**
   * Disconnects the active wallet session.
   */
  public static async disconnect(): Promise<void> {
    try {
      const { WalletConnectService } = await import('./walletConnectService');
      await WalletConnectService.disconnect();
    } catch {
      // ignore
    }

    this.state = {
      isConnected: false,
      address: null,
      chainId: 11155111,
      isConnecting: false,
      role: 'freelancer',
      roleName: 'Not Connected',
      providerName: '',
      connectionType: 'none',
      usdcBalance: '0.00',
      ethBalance: '0.0000',
      latencyMs: null,
      blockNumber: null,
    };

    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEY_ADDRESS),
      AsyncStorage.removeItem(STORAGE_KEY_ROLE),
      AsyncStorage.removeItem(STORAGE_KEY_PROVIDER),
      AsyncStorage.removeItem(STORAGE_KEY_TYPE),
    ]);

    this.notify();
  }
}
