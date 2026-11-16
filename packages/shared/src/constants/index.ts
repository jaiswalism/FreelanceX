export const NETWORKS = {
  SEPOLIA: {
    id: 11155111,
    name: 'Ethereum Sepolia',
    nativeCurrency: {
      name: 'Sepolia Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ['https://rpc.sepolia.org', 'https://ethereum-sepolia-rpc.publicnode.com'] },
      public: { http: ['https://rpc.sepolia.org', 'https://ethereum-sepolia-rpc.publicnode.com'] },
    },
    blockExplorers: {
      default: { name: 'Etherscan', url: 'https://sepolia.etherscan.io' },
    },
    contracts: {
      usdc: {
        address: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238' as `0x${string}`,
        decimals: 6,
        symbol: 'USDC',
      },
      escrow: {
        address: '0x0000000000000000000000000000000000000000' as `0x${string}`,
      },
    },
    testnet: true,
  },
  BASE_SEPOLIA: {
    id: 84532,
    name: 'Base Sepolia',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ['https://sepolia.base.org'] },
      public: { http: ['https://sepolia.base.org'] },
    },
    blockExplorers: {
      default: { name: 'BaseScan', url: 'https://sepolia.basescan.org' },
    },
    contracts: {
      usdc: {
        address: '0x036CbD53842c5426634e7929541eC2318f3dCF7e' as `0x${string}`,
        decimals: 6,
        symbol: 'USDC',
      },
      escrow: {
        address: '0x0000000000000000000000000000000000000000' as `0x${string}`,
      },
    },
    testnet: true,
  },
  BASE_MAINNET: {
    id: 8453,
    name: 'Base Mainnet',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ['https://mainnet.base.org'] },
      public: { http: ['https://mainnet.base.org'] },
    },
    blockExplorers: {
      default: { name: 'BaseScan', url: 'https://basescan.org' },
    },
    contracts: {
      usdc: {
        address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as `0x${string}`,
        decimals: 6,
        symbol: 'USDC',
      },
    },
    testnet: false,
  },
} as const;

export const USDC_DECIMALS = 6;

export const PLATFORM_FEE_BPS = 0; // 0% MVP fee policy

export const THEME_COLORS = {
  dark: {
    background: {
      app: '#090909',
      primary: '#0B0B0B',
      secondary: '#101010',
      elevated: '#151515',
    },
    surface: {
      default: '#121212',
      raised: '#181818',
      pressed: '#1D1D1D',
      selected: '#21170F',
    },
    border: {
      subtle: '#202020',
      default: '#292929',
      strong: '#383838',
    },
    brand: {
      primary: '#FF6A00',
      strong: '#FF7A00',
      deep: '#D94F00',
      soft: '#FF8A33',
      tint: '#2A160B',
    },
    semantic: {
      success: '#5EE6B5',
      successBackground: '#0D2119',
      warning: '#F5B942',
      warningBackground: '#241C0C',
      danger: '#FF5C5C',
      dangerBackground: '#250F0F',
      info: '#A3A3A3',
      infoBackground: '#181818',
    },
    text: {
      primary: '#F5F5F5',
      secondary: '#A3A3A3',
      tertiary: '#737373',
      disabled: '#4A4A4A',
      inverse: '#090909',
    },
  },
  light: {
    background: {
      app: '#F6F6F3',
      primary: '#FAFAF8',
      secondary: '#F0F0ED',
      elevated: '#FFFFFF',
    },
    surface: {
      default: '#FFFFFF',
      raised: '#FFFFFF',
      pressed: '#F1F1EE',
      selected: '#FFF0E5',
    },
    border: {
      subtle: '#E8E8E4',
      default: '#DCDCD7',
      strong: '#C8C8C2',
    },
    brand: {
      primary: '#E95700',
      strong: '#D94D00',
      deep: '#B84000',
    },
    text: {
      primary: '#111111',
      secondary: '#5F5F5A',
      tertiary: '#858580',
      disabled: '#B0B0AA',
    },
  },
} as const;

export const ESCROW_EVENTS = {
  ProjectCreated: 'ProjectCreated',
  ProjectFunded: 'ProjectFunded',
  MilestoneCreated: 'MilestoneCreated',
  MilestoneSubmitted: 'MilestoneSubmitted',
  RevisionRequested: 'RevisionRequested',
  MilestoneApproved: 'MilestoneApproved',
  PaymentReleased: 'PaymentReleased',
  DisputeRaised: 'DisputeRaised',
  DisputeResolved: 'DisputeResolved',
  ProjectCancelled: 'ProjectCancelled',
  ProjectCompleted: 'ProjectCompleted',
} as const;
