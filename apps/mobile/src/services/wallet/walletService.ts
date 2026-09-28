import { HexAddress } from '@freelancerx/shared';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';

export interface WalletState {
  isConnected: boolean;
  address: HexAddress | null;
  chainId: number;
  isConnecting: boolean;
}

// In-memory wallet test account for POC testing and integration validation
let testAccount: ReturnType<typeof privateKeyToAccount> | null = null;

export class WalletService {
  private static state: WalletState = {
    isConnected: false,
    address: null,
    chainId: 84532, // Base Sepolia
    isConnecting: false,
  };

  public static async connectTestWallet(): Promise<{ address: HexAddress; chainId: number }> {
    if (!testAccount) {
      const pKey = generatePrivateKey();
      testAccount = privateKeyToAccount(pKey);
    }

    this.state = {
      isConnected: true,
      address: testAccount.address as HexAddress,
      chainId: 84532,
      isConnecting: false,
    };

    return {
      address: this.state.address!,
      chainId: this.state.chainId,
    };
  }

  public static async signMessage(message: string): Promise<string> {
    if (!this.state.isConnected || !testAccount) {
      throw new Error('Wallet not connected. Connect wallet before signing.');
    }
    const signature = await testAccount.signMessage({
      message,
    });
    return signature;
  }

  public static disconnect(): void {
    this.state = {
      isConnected: false,
      address: null,
      chainId: 84532,
      isConnecting: false,
    };
    testAccount = null;
  }

  public static getState(): WalletState {
    return { ...this.state };
  }
}
