import { createPublicClient, http, defineChain, formatUnits, parseUnits, formatEther } from 'viem';
import { NETWORKS } from '@freelancerx/shared';

export const sepoliaChain = defineChain({
  id: NETWORKS.SEPOLIA.id,
  name: NETWORKS.SEPOLIA.name,
  nativeCurrency: NETWORKS.SEPOLIA.nativeCurrency,
  rpcUrls: NETWORKS.SEPOLIA.rpcUrls,
  blockExplorers: NETWORKS.SEPOLIA.blockExplorers,
  testnet: true,
});

export const publicClient = createPublicClient({
  chain: sepoliaChain,
  transport: http(NETWORKS.SEPOLIA.rpcUrls.default.http[0], {
    timeout: 3500,
    retryCount: 1,
    retryDelay: 500,
  }),
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
  const startTime = Date.now();
  try {
    const [blockNumber, chainId] = await Promise.all([
      publicClient.getBlockNumber(),
      publicClient.getChainId(),
    ]);
    const latencyMs = Date.now() - startTime;
    return {
      success: true,
      chainId,
      blockNumber: blockNumber.toString(),
      networkName: sepoliaChain.name,
      latencyMs,
    };
  } catch (error) {
    const latencyMs = Date.now() - startTime;
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch chain status',
      latencyMs,
      chainId: sepoliaChain.id,
      blockNumber: 'Active',
      networkName: sepoliaChain.name,
    };
  }
}

export async function fetchEthBalance(address: `0x${string}`) {
  try {
    const balanceWei = await publicClient.getBalance({ address });
    const formatted = parseFloat(formatEther(balanceWei)).toFixed(4);
    return {
      success: true,
      rawBalance: balanceWei.toString(),
      formatted,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch ETH balance',
      rawBalance: '0',
      formatted: '0.0000',
    };
  }
}

export async function fetchUsdcBalance(address: `0x${string}`) {
  try {
    const balance = await publicClient.readContract({
      address: NETWORKS.SEPOLIA.contracts.usdc.address,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [address],
    });
    return {
      success: true,
      rawBalance: balance.toString(),
      formatted: parseFloat(formatUnits(balance, 6)).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
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

export { formatUnits, parseUnits, formatEther };
