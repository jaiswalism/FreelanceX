import { createPublicClient, http, formatUnits } from 'viem';
import { baseSepolia } from 'viem/chains';
import { prisma } from '../../database/prisma.js';
import { config } from '../../config/index.js';
import { FREELANCER_ESCROW_ABI } from '../abi/escrowAbi.js';

export class BlockchainIndexer {
  private publicClient;
  private isIndexing = false;
  private timer: NodeJS.Timeout | null = null;

  constructor() {
    this.publicClient = createPublicClient({
      chain: baseSepolia,
      transport: http(config.rpcUrl),
    });
  }

  public async startIndexing(intervalMs: number = 5000) {
    console.log(`[Indexer] Starting Blockchain Event Indexer worker (RPC: ${config.rpcUrl})`);
    
    // Initial sync run
    await this.processLogsSafely();

    // Set recurring timer
    this.timer = setInterval(() => {
      this.processLogsSafely();
    }, intervalMs);
  }

  public stopIndexing() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      console.log('[Indexer] Blockchain Event Indexer stopped.');
    }
  }

  private async processLogsSafely() {
    if (this.isIndexing) return;
    this.isIndexing = true;

    try {
      if (config.escrowAddress === '0x0000000000000000000000000000000000000000') {
        return;
      }

      const currentBlock = await this.publicClient.getBlockNumber();
      const chainId = config.chainId;

      const record = await prisma.indexedBlock.findUnique({
        where: { chainId },
      });

      // Start from 500 blocks ago if no record exists
      const fromBlock = record ? record.lastBlock + 1n : (currentBlock > 500n ? currentBlock - 500n : 0n);

      if (fromBlock > currentBlock) {
        return;
      }

      // Cap batch size to 2000 blocks
      const maxBatch = 2000n;
      let toBlock = currentBlock;
      if (toBlock - fromBlock > maxBatch) {
        toBlock = fromBlock + maxBatch;
      }

      const logs = await this.publicClient.getLogs({
        address: config.escrowAddress,
        events: FREELANCER_ESCROW_ABI,
        fromBlock,
        toBlock,
      });

      for (const log of logs) {
        await this.handleLog(log);
      }

      await prisma.indexedBlock.upsert({
        where: { chainId },
        update: { lastBlock: toBlock },
        create: { chainId, lastBlock: toBlock },
      });

    } catch (error) {
      console.error('[Indexer] Error during log indexing batch:', error);
    } finally {
      this.isIndexing = false;
    }
  }

  private async handleLog(log: any) {
    const { eventName, args, transactionHash, blockNumber, logIndex } = log;
    if (!transactionHash) return;

    // Check if event was already indexed
    const existing = await prisma.blockchainEvent.findUnique({
      where: {
        transactionHash_logIndex: {
          transactionHash,
          logIndex: logIndex ?? 0,
        },
      },
    });

    if (existing) return;

    // Store in BlockchainEvent
    await prisma.blockchainEvent.create({
      data: {
        eventName,
        contractAddress: config.escrowAddress,
        transactionHash,
        blockNumber: blockNumber ?? 0n,
        logIndex: logIndex ?? 0,
        args: this.serializeArgs(args),
      },
    });

    console.log(`[Indexer] Indexed event ${eventName} (Tx: ${transactionHash})`);

    // State sync handlers
    switch (eventName) {
      case 'ProjectCreated':
        await this.handleProjectCreated(args, transactionHash);
        break;
      case 'ProjectFunded':
        await this.handleProjectFunded(args, transactionHash);
        break;
      case 'MilestoneSubmitted':
        await this.handleMilestoneSubmitted(args);
        break;
      case 'RevisionRequested':
        await this.handleRevisionRequested(args);
        break;
      case 'MilestoneApproved':
        await this.handleMilestoneApproved(args);
        break;
      case 'PaymentReleased':
        await this.handlePaymentReleased(args, transactionHash);
        break;
      case 'DisputeRaised':
        await this.handleDisputeRaised(args, transactionHash);
        break;
      case 'DisputeResolved':
        await this.handleDisputeResolved(args, transactionHash);
        break;
      case 'ProjectCompleted':
        await this.handleProjectCompleted(args, transactionHash);
        break;
      case 'ProjectCancelled':
        await this.handleProjectCancelled(args);
        break;
    }
  }

  private async handleProjectCreated(args: any, txHash: string) {
    const projectId = args.projectId as string;
    // Find matching project in DB if created off-chain
    const project = await prisma.project.findFirst({
      where: { onChainProjectId: projectId },
    });

    if (project) {
      await prisma.project.update({
        where: { id: project.id },
        data: {
          status: 'FUNDED',
          fundedTxHash: txHash,
        },
      });
    }
  }

  private async handleProjectFunded(args: any, txHash: string) {
    const projectId = args.projectId as string;
    await prisma.project.updateMany({
      where: { onChainProjectId: projectId },
      data: {
        status: 'IN_PROGRESS',
        fundedTxHash: txHash,
      },
    });
  }

  private async handleMilestoneSubmitted(args: any) {
    const projectId = args.projectId as string;
    const milestoneIndex = Number(args.milestoneIndex);
    const deliverableHash = args.deliverableHash as string;

    const project = await prisma.project.findFirst({
      where: { onChainProjectId: projectId },
    });

    if (project) {
      await prisma.projectMilestone.updateMany({
        where: { projectId: project.id, index: milestoneIndex },
        data: {
          status: 'SUBMITTED',
          deliverableUri: deliverableHash,
          submissionDate: new Date(),
        },
      });
    }
  }

  private async handleRevisionRequested(args: any) {
    const projectId = args.projectId as string;
    const milestoneIndex = Number(args.milestoneIndex);

    const project = await prisma.project.findFirst({
      where: { onChainProjectId: projectId },
    });

    if (project) {
      await prisma.projectMilestone.updateMany({
        where: { projectId: project.id, index: milestoneIndex },
        data: {
          status: 'REVISION_REQUESTED',
        },
      });
    }
  }

  private async handleMilestoneApproved(args: any) {
    const projectId = args.projectId as string;
    const milestoneIndex = Number(args.milestoneIndex);

    const project = await prisma.project.findFirst({
      where: { onChainProjectId: projectId },
    });

    if (project) {
      await prisma.projectMilestone.updateMany({
        where: { projectId: project.id, index: milestoneIndex },
        data: {
          status: 'APPROVED',
        },
      });
    }
  }

  private async handlePaymentReleased(args: any, txHash: string) {
    const projectId = args.projectId as string;
    const milestoneIndex = Number(args.milestoneIndex);
    const amountBigInt = BigInt(args.amount);
    const amountUsdc = Number(formatUnits(amountBigInt, 6));

    const project = await prisma.project.findFirst({
      where: { onChainProjectId: projectId },
      include: { freelancer: true },
    });

    if (project) {
      await prisma.projectMilestone.updateMany({
        where: { projectId: project.id, index: milestoneIndex },
        data: {
          status: 'PAID',
          paidDate: new Date(),
          paymentTxHash: txHash,
        },
      });

      // Update freelancer total earnings
      await prisma.freelancerProfile.updateMany({
        where: { userId: project.freelancerId },
        data: {
          totalEarningsUsdc: { increment: amountUsdc },
        },
      });

      // Update client total spent
      await prisma.clientProfile.updateMany({
        where: { userId: project.clientId },
        data: {
          totalSpentUsdc: { increment: amountUsdc },
        },
      });
    }
  }

  private async handleDisputeRaised(args: any, _txHash: string) {
    const projectId = args.projectId as string;
    const milestoneIndex = Number(args.milestoneIndex);

    const project = await prisma.project.findFirst({
      where: { onChainProjectId: projectId },
    });

    if (project) {
      const milestone = await prisma.projectMilestone.findFirst({
        where: { projectId: project.id, index: milestoneIndex },
      });

      await prisma.project.update({
        where: { id: project.id },
        data: { status: 'DISPUTED' },
      });

      if (milestone) {
        await prisma.projectMilestone.update({
          where: { id: milestone.id },
          data: { status: 'DISPUTED' },
        });

        await prisma.dispute.create({
          data: {
            projectId: project.id,
            milestoneId: milestone.id,
            raisedById: project.clientId, // Default fallback to project client or freelancer
            reason: args.reason || 'Dispute initiated on-chain',
            evidenceUris: [],
          },
        });
      }
    }
  }

  private async handleDisputeResolved(args: any, txHash: string) {
    const projectId = args.projectId as string;
    const outcomeCode = Number(args.outcome);

    const outcomeMap: Record<number, 'PAY_FREELANCER' | 'REFUND_CLIENT' | 'SPLIT_FUNDS'> = {
      0: 'PAY_FREELANCER',
      1: 'REFUND_CLIENT',
      2: 'SPLIT_FUNDS',
    };

    const outcome = outcomeMap[outcomeCode] || 'SPLIT_FUNDS';

    const project = await prisma.project.findFirst({
      where: { onChainProjectId: projectId },
    });

    if (project) {
      await prisma.project.update({
        where: { id: project.id },
        data: { status: 'IN_PROGRESS' },
      });

      await prisma.dispute.updateMany({
        where: { projectId: project.id, isResolved: false },
        data: {
          isResolved: true,
          outcome,
          resolvedTxHash: txHash,
          resolvedAt: new Date(),
        },
      });
    }
  }

  private async handleProjectCompleted(args: any, txHash: string) {
    const projectId = args.projectId as string;

    const project = await prisma.project.findFirst({
      where: { onChainProjectId: projectId },
    });

    if (project) {
      await prisma.project.update({
        where: { id: project.id },
        data: {
          status: 'COMPLETED',
          completedTxHash: txHash,
        },
      });

      await prisma.freelancerProfile.updateMany({
        where: { userId: project.freelancerId },
        data: {
          completedProjectsCount: { increment: 1 },
          verifiedProjectsCount: { increment: 1 },
        },
      });

      await prisma.clientProfile.updateMany({
        where: { userId: project.clientId },
        data: {
          completedProjectsCount: { increment: 1 },
        },
      });
    }
  }

  private async handleProjectCancelled(args: any) {
    const projectId = args.projectId as string;
    await prisma.project.updateMany({
      where: { onChainProjectId: projectId },
      data: { status: 'CANCELLED' },
    });
  }

  private serializeArgs(args: any): any {
    if (!args) return {};
    const result: any = {};
    for (const key of Object.keys(args)) {
      const value = args[key];
      if (typeof value === 'bigint') {
        result[key] = value.toString();
      } else {
        result[key] = value;
      }
    }
    return result;
  }
}
