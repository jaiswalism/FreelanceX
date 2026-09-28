import { createPublicClient, http, defineChain, formatUnits, parseUnits } from 'viem';
import { NETWORKS } from '@freelancerx/shared';

export const baseSepoliaChain = defineChain({
  id: NETWORKS.BASE_SEPOLIA.id,
  name: NETWORKS.BASE_SEPOLIA.name,
  nativeCurrency: NETWORKS.BASE_SEPOLIA.nativeCurrency,
  rpcUrls: NETWORKS.BASE_SEPOLIA.rpcUrls,
  blockExplorers: NETWORKS.BASE_SEPOLIA.blockExplorers,
  testnet: true,
});

export const publicClient = createPublicClient({
  chain: baseSepoliaChain,
  transport: http(NETWORKS.BASE_SEPOLIA.rpcUrls.default.http[0]),
});

// Minimal ERC20 ABI for USDC queries
export const ERC20_ABI = [
  {
    type: 'function',
    name: 'balanceOf',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'decimals',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint8' }],
  },
  {
    type: 'function',
    name: 'symbol',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'string' }],
  },
  {
    type: 'function',
    name: 'allowance',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    outputs: [{ type: 'uint256' }],
  },
] as const;

export async function fetchChainStatus() {
  try {
    const blockNumber = await publicClient.getBlockNumber();
    const chainId = await publicClient.getChainId();
    return {
      success: true,
      chainId,
      blockNumber: blockNumber.toString(),
      networkName: baseSepoliaChain.name,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch chain status',
    };
  }
}

export async function fetchUsdcBalance(address: `0x${string}`) {
  try {
    const balance = await publicClient.readContract({
      address: NETWORKS.BASE_SEPOLIA.contracts.usdc.address,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [address],
    });
    return {
      success: true,
      rawBalance: balance.toString(),
      formatted: formatUnits(balance, 6),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch USDC balance',
      rawBalance: '0',
      formatted: '0.00',
    };
  }
}

export { formatUnits, parseUnits };
