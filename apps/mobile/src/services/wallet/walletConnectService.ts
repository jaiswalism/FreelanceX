import { Linking } from 'react-native';
import UniversalProvider from '@walletconnect/universal-provider';
import { HexAddress } from '@freelancerx/shared';

const REOWN_PROJECT_ID = '2d2c2c6d98c3fb70090d1c59f804680c';
const SEPOLIA_CHAIN_ID = 11155111;
const SEPOLIA_CAIP_ID = `eip155:${SEPOLIA_CHAIN_ID}`;

export interface WalletAppConfig {
  id: string;
  name: string;
  icon: string;
  tag?: string;
  scheme: string;
  universalLink: string;
  playStore: string;
}

export const SUPPORTED_WALLETS: WalletAppConfig[] = [
  {
    id: 'metamask',
    name: 'MetaMask',
    icon: '🦊',
    tag: 'Recommended',
    scheme: 'metamask://wc?uri=',
    universalLink: 'https://metamask.app.link/wc?uri=',
    playStore: 'https://play.google.com/store/apps/details?id=io.metamask',
  },
  {
    id: 'trust',
    name: 'Trust Wallet',
    icon: '🛡️',
    tag: 'Popular',
    scheme: 'trust://wc?uri=',
    universalLink: 'https://link.trustwallet.com/wc?uri=',
    playStore: 'https://play.google.com/store/apps/details?id=com.wallet.crypto.trustapp',
  },
  {
    id: 'coinbase',
    name: 'Coinbase Wallet',
    icon: '🔵',
    tag: 'Web3',
    scheme: 'cbwallet://wc?uri=',
    universalLink: 'https://go.cb-w.com/wc?uri=',
    playStore: 'https://play.google.com/store/apps/details?id=org.toshi',
  },
  {
    id: 'rainbow',
    name: 'Rainbow',
    icon: '🌈',
    tag: 'Ethereum',
    scheme: 'rainbow://wc?uri=',
    universalLink: 'https://rnbwapp.com/wc?uri=',
    playStore: 'https://play.google.com/store/apps/details?id=me.rainbow',
  },
];

let providerInstance: Awaited<ReturnType<typeof UniversalProvider.init>> | null = null;
let isInitializing = false;

export class WalletConnectService {
  /**
   * Initializes or gets the cached UniversalProvider singleton.
   */
  public static async getProvider() {
    if (providerInstance) return providerInstance;
    if (isInitializing) {
      // wait until initialized
      while (isInitializing) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      if (providerInstance) return providerInstance;
    }

    try {
      isInitializing = true;
      providerInstance = await UniversalProvider.init({
        projectId: REOWN_PROJECT_ID,
        metadata: {
          name: 'FreelancerX',
          description: 'Decentralized Escrow Marketplace on Ethereum Sepolia',
          url: 'https://freelancex-rzv0.onrender.com',
          icons: ['https://freelancex-rzv0.onrender.com/icon.png'],
          redirect: {
            native: 'freelancerx://',
          },
        },
      });
      return providerInstance;
    } finally {
      isInitializing = false;
    }
  }

  /**
   * Connect to an external mobile wallet via WalletConnect.
   * Deep links directly into the selected wallet for instant user authorization.
   */
  public static async connect(walletConfig: WalletAppConfig): Promise<{
    address: HexAddress;
    providerName: string;
  }> {
    const provider = await this.getProvider();

    // Clean up any stale sessions
    if (provider.session) {
      try {
        await provider.disconnect();
      } catch {
        // ignore
      }
    }

    return new Promise(async (resolve, reject) => {
      let uriHandled = false;

      // Handle pairing URI by launching the targeted wallet app
      const handleDisplayUri = async (uri: string) => {
        if (uriHandled) return;
        uriHandled = true;

        const encodedUri = encodeURIComponent(uri);
        const directDeepLink = `${walletConfig.scheme}${encodedUri}`;
        const universalLink = `${walletConfig.universalLink}${encodedUri}`;

        try {
          // Attempt direct app scheme first (enabled by <queries> in AndroidManifest)
          const canOpen = await Linking.canOpenURL(directDeepLink).catch(() => false);
          if (canOpen) {
            await Linking.openURL(directDeepLink);
          } else {
            // Fallback to universal link or raw wc link
            const canOpenUniversal = await Linking.canOpenURL(universalLink).catch(() => false);
            if (canOpenUniversal) {
              await Linking.openURL(universalLink);
            } else {
              // Try opening raw uri or direct scheme
              await Linking.openURL(directDeepLink).catch(async () => {
                await Linking.openURL(`wc:${encodedUri}`).catch(() => {
                  Linking.openURL(walletConfig.playStore);
                });
              });
            }
          }
        } catch (err) {
          console.warn('Failed to launch wallet app:', err);
        }
      };

      provider.once('display_uri', handleDisplayUri);

      try {
        const session = await provider.connect({
          namespaces: {
            eip155: {
              methods: [
                'eth_sendTransaction',
                'eth_signTransaction',
                'eth_sign',
                'personal_sign',
                'eth_signTypedData',
              ],
              chains: [SEPOLIA_CAIP_ID],
              events: ['chainChanged', 'accountsChanged'],
              rpcMap: {
                [SEPOLIA_CHAIN_ID]: 'https://rpc.sepolia.org',
              },
            },
          },
        });

        if (!session) {
          throw new Error('Connection session was cancelled or timed out.');
        }

        // Extract account address from session eip155 namespace
        const accounts = session.namespaces.eip155?.accounts || [];
        if (accounts.length === 0) {
          throw new Error('No Ethereum account returned by the wallet.');
        }

        // Format is eip155:11155111:0x1234...
        const primaryAccount = accounts[0] || '';
        const parts = primaryAccount.split(':');
        const rawAddress = parts[parts.length - 1] as HexAddress;

        resolve({
          address: rawAddress,
          providerName: walletConfig.name,
        });
      } catch (err) {
        reject(err);
      } finally {
        provider.removeListener('display_uri', handleDisplayUri);
      }
    });
  }

  /**
   * Disconnect active WalletConnect session.
   */
  public static async disconnect() {
    if (providerInstance && providerInstance.session) {
      try {
        await providerInstance.disconnect();
      } catch (err) {
        console.warn('WalletConnect disconnect error:', err);
      }
    }
  }

  /**
   * Request message signing from the connected wallet.
   */
  public static async signMessage(message: string, address: string): Promise<string> {
    const provider = await this.getProvider();
    if (!provider || !provider.session) {
      throw new Error('No active wallet session to sign message.');
    }

    const signature = await provider.request<string>(
      {
        method: 'personal_sign',
        params: [message, address],
      },
      SEPOLIA_CAIP_ID
    );

    return signature;
  }
}
