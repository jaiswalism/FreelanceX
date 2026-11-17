import { parseUnits, encodeFunctionData, keccak256, toHex } from 'viem';
import { NETWORKS } from '@freelancerx/shared';
import { publicClient } from './client.js';

export const ERC20_APPROVE_ABI = [
  {
    type: 'function',
    name: 'approve',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ type: 'bool' }],
  },
] as const;

export const ESCROW_ABI = [
  {
    type: 'function',
    name: 'createAndFundProject',
    stateMutability: 'nonpayable',
    inputs: [
      { name: '_projectId', type: 'bytes32' },
      { name: '_freelancer', type: 'address' },
      { name: '_totalAmount', type: 'uint256' },
      { name: '_milestoneAmounts', type: 'uint256[]' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'submitMilestone',
    stateMutability: 'nonpayable',
    inputs: [
      { name: '_projectId', type: 'bytes32' },
      { name: '_milestoneIndex', type: 'uint256' },
      { name: '_deliverableHash', type: 'string' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'requestRevision',
    stateMutability: 'nonpayable',
    inputs: [
      { name: '_projectId', type: 'bytes32' },
      { name: '_milestoneIndex', type: 'uint256' },
      { name: '_reason', type: 'string' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'approveMilestone',
    stateMutability: 'nonpayable',
    inputs: [
      { name: '_projectId', type: 'bytes32' },
      { name: '_milestoneIndex', type: 'uint256' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'releasePayment',
    stateMutability: 'nonpayable',
    inputs: [
      { name: '_projectId', type: 'bytes32' },
      { name: '_milestoneIndex', type: 'uint256' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'raiseDispute',
    stateMutability: 'nonpayable',
    inputs: [
      { name: '_projectId', type: 'bytes32' },
      { name: '_milestoneIndex', type: 'uint256' },
      { name: '_reason', type: 'string' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'projects',
    stateMutability: 'view',
    inputs: [{ name: '', type: 'bytes32' }],
    outputs: [
      { name: 'client', type: 'address' },
      { name: 'freelancer', type: 'address' },
      { name: 'totalAmount', type: 'uint256' },
      { name: 'releasedAmount', type: 'uint256' },
      { name: 'refundedAmount', type: 'uint256' },
      { name: 'status', type: 'uint8' },
      { name: 'milestoneCount', type: 'uint256' },
      { name: 'paidMilestoneCount', type: 'uint256' },
    ],
  },
] as const;

export class MobileEscrowService {
  public static getEscrowContractAddress(): `0x${string}` {
    return (NETWORKS.SEPOLIA.contracts as any).escrow?.address || ('0x0000000000000000000000000000000000000000' as `0x${string}`);
  }

  public static getUsdcContractAddress(): `0x${string}` {
    return NETWORKS.SEPOLIA.contracts.usdc.address as `0x${string}`;
  }

  public static stringToBytes32(id: string): `0x${string}` {
    if (id.startsWith('0x') && id.length === 66) {
      return id as `0x${string}`;
    }
    return keccak256(toHex(id));
  }

  public static encodeApproveUsdc(amountUsdc: string): { to: `0x${string}`; data: `0x${string}` } {
    const rawAmount = parseUnits(amountUsdc, 6);
    const data = encodeFunctionData({
      abi: ERC20_APPROVE_ABI,
      functionName: 'approve',
      args: [this.getEscrowContractAddress(), rawAmount],
    });
    return {
      to: this.getUsdcContractAddress(),
      data,
    };
  }

  public static encodeCreateAndFundProject(
    projectId: string,
    freelancerAddress: `0x${string}`,
    totalAmountUsdc: string,
    milestoneAmountsUsdc: string[]
  ): { to: `0x${string}`; data: `0x${string}` } {
    const bytes32ProjectId = this.stringToBytes32(projectId);
    const rawTotalAmount = parseUnits(totalAmountUsdc, 6);
    const rawMilestoneAmounts = milestoneAmountsUsdc.map((amt) => parseUnits(amt, 6));

    const data = encodeFunctionData({
      abi: ESCROW_ABI,
      functionName: 'createAndFundProject',
      args: [bytes32ProjectId, freelancerAddress, rawTotalAmount, rawMilestoneAmounts],
    });

    return {
      to: this.getEscrowContractAddress(),
      data,
    };
  }

  public static encodeSubmitMilestone(
    projectId: string,
    milestoneIndex: number,
    deliverableHash: string
  ): { to: `0x${string}`; data: `0x${string}` } {
    const bytes32ProjectId = this.stringToBytes32(projectId);
    const data = encodeFunctionData({
      abi: ESCROW_ABI,
      functionName: 'submitMilestone',
      args: [bytes32ProjectId, BigInt(milestoneIndex), deliverableHash],
    });

    return {
      to: this.getEscrowContractAddress(),
      data,
    };
  }

  public static encodeApproveMilestone(
    projectId: string,
    milestoneIndex: number
  ): { to: `0x${string}`; data: `0x${string}` } {
    const bytes32ProjectId = this.stringToBytes32(projectId);
    const data = encodeFunctionData({
      abi: ESCROW_ABI,
      functionName: 'approveMilestone',
      args: [bytes32ProjectId, BigInt(milestoneIndex)],
    });

    return {
      to: this.getEscrowContractAddress(),
      data,
    };
  }

  public static encodeRaiseDispute(
    projectId: string,
    milestoneIndex: number,
    reason: string
  ): { to: `0x${string}`; data: `0x${string}` } {
    const bytes32ProjectId = this.stringToBytes32(projectId);
    const data = encodeFunctionData({
      abi: ESCROW_ABI,
      functionName: 'raiseDispute',
      args: [bytes32ProjectId, BigInt(milestoneIndex), reason],
    });

    return {
      to: this.getEscrowContractAddress(),
      data,
    };
  }

  public static async fetchOnChainProjectState(projectId: string) {
    try {
      const bytes32ProjectId = this.stringToBytes32(projectId);
      const res = await publicClient.readContract({
        address: this.getEscrowContractAddress(),
        abi: ESCROW_ABI,
        functionName: 'projects',
        args: [bytes32ProjectId],
      });

      return {
        success: true,
        client: res[0],
        freelancer: res[1],
        totalAmount: res[2].toString(),
        releasedAmount: res[3].toString(),
        refundedAmount: res[4].toString(),
        status: Number(res[5]),
        milestoneCount: Number(res[6]),
        paidMilestoneCount: Number(res[7]),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to read on-chain project state',
      };
    }
  }
}
