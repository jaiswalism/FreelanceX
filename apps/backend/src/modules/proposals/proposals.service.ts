import { prisma } from '../../database/prisma.js';
import { parseUnits } from 'viem';
import { ProposedMilestone } from '@freelancerx/shared';
import { config } from '../../config/index.js';

export class ProposalsService {
  /**
   * Submits a new proposal for a job
   */
  static async submitProposal(
    freelancerId: string,
    data: {
      jobId: string;
      coverLetter: string;
      proposedPriceUsdc: string;
      proposedDurationDays: number;
      proposedMilestones: ProposedMilestone[];
    }
  ) {
    const job = await prisma.job.findUnique({
      where: { id: data.jobId },
    });

    if (!job) {
      throw new Error('Job not found');
    }

    if (job.status !== 'OPEN') {
      throw new Error('Job is no longer open for proposals');
    }

    if (job.clientId === freelancerId) {
      throw new Error('You cannot submit a proposal to your own job');
    }

    // Check if freelancer already applied
    const existing = await prisma.proposal.findFirst({
      where: {
        jobId: data.jobId,
        freelancerId,
      },
    });

    if (existing) {
      throw new Error('You have already submitted a proposal for this job');
    }

    const proposal = await prisma.proposal.create({
      data: {
        jobId: data.jobId,
        freelancerId,
        coverLetter: data.coverLetter,
        proposedPriceUsdc: data.proposedPriceUsdc,
        proposedDurationDays: data.proposedDurationDays,
        milestonePlan: data.proposedMilestones as any,
        status: 'PENDING',
      },
      include: {
        freelancer: {
          select: {
            id: true,
            address: true,
            freelancerProfile: true,
          },
        },
      },
    });

    return proposal;
  }

  /**
   * Retrieves all proposals for a job (client owner only)
   */
  static async getProposalsByJob(jobId: string, clientId: string, clientAddress?: string) {
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: { client: true },
    });

    if (!job) {
      throw new Error('Job not found');
    }

    const isOwner =
      job.clientId === clientId ||
      (clientAddress && job.client?.address.toLowerCase() === clientAddress.toLowerCase());

    if (!isOwner) {
      throw new Error('Unauthorized to view proposals for this job');
    }

    return prisma.proposal.findMany({
      where: { jobId },
      orderBy: { createdAt: 'desc' },
      include: {
        freelancer: {
          select: {
            id: true,
            address: true,
            freelancerProfile: {
              include: {
                portfolio: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Accepts a proposal, closes the job, and creates the Project + Milestones
   */
  static async acceptProposal(proposalId: string, clientId: string, clientAddress?: string) {
    const proposal = await prisma.proposal.findUnique({
      where: { id: proposalId },
      include: {
        job: { include: { client: true } },
        freelancer: true,
      },
    });

    if (!proposal) {
      throw new Error('Proposal not found');
    }

    const isOwner =
      proposal.job.clientId === clientId ||
      (clientAddress && proposal.job.client?.address.toLowerCase() === clientAddress.toLowerCase());

    if (!isOwner) {
      throw new Error('Only the client can accept this proposal');
    }

    if (proposal.status !== 'PENDING') {
      throw new Error(`Proposal cannot be accepted from state: ${proposal.status}`);
    }

    const milestonePlan = (proposal.milestonePlan as any[]) as ProposedMilestone[];
    const totalAmountBaseUnits = parseUnits(proposal.proposedPriceUsdc.toString(), 6).toString();

    // Use Prisma interactive transaction to guarantee atomicity
    return prisma.$transaction(async (tx: any) => {
      // 1. Mark proposal as ACCEPTED
      const updatedProposal = await tx.proposal.update({
        where: { id: proposalId },
        data: { status: 'ACCEPTED' },
      });

      // 2. Reject other proposals for this job
      await tx.proposal.updateMany({
        where: {
          jobId: proposal.jobId,
          id: { not: proposalId },
        },
        data: { status: 'REJECTED' },
      });

      // 3. Mark job as IN_PROGRESS
      await tx.job.update({
        where: { id: proposal.jobId },
        data: { status: 'IN_PROGRESS' },
      });

      // 4. Create Project with milestones
      const project = await tx.project.create({
        data: {
          jobId: proposal.jobId,
          proposalId: proposal.id,
          clientId,
          freelancerId: proposal.freelancerId,
          title: proposal.job.title,
          totalAmountUsdc: proposal.proposedPriceUsdc,
          totalAmountBaseUnits,
          escrowContractAddress: config.escrowAddress,
          status: 'INITIALIZED',
          milestones: {
            create: milestonePlan.map((m, idx) => ({
              index: idx,
              title: `Milestone ${idx + 1}`,
              description: m.description,
              amountUsdc: m.amountUsdc,
              amountBaseUnits: parseUnits(m.amountUsdc, 6).toString(),
              status: 'PENDING',
            })),
          },
        },
        include: {
          milestones: true,
          client: { select: { address: true, clientProfile: true } },
          freelancer: { select: { address: true, freelancerProfile: true } },
        },
      });

      return {
        proposal: updatedProposal,
        project,
      };
    });
  }

  /**
   * Retrieves all proposals submitted by a freelancer (with job info)
   */
  static async getMyProposals(freelancerId: string) {
    return prisma.proposal.findMany({
      where: { freelancerId },
      orderBy: { createdAt: 'desc' },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            budgetUsdc: true,
            status: true,
          },
        },
      },
    });
  }

  /**
   * Rejects a proposal
   */
  static async rejectProposal(proposalId: string, clientId: string) {
    const proposal = await prisma.proposal.findUnique({
      where: { id: proposalId },
      include: { job: true },
    });

    if (!proposal) {
      throw new Error('Proposal not found');
    }

    if (proposal.job.clientId !== clientId) {
      throw new Error('Only the client can reject this proposal');
    }

    return prisma.proposal.update({
      where: { id: proposalId },
      data: { status: 'REJECTED' },
    });
  }
}
