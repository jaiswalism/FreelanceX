import { prisma } from '../../database/prisma.js';
import { MessagesService } from '../messages/messages.service.js';

export class DisputesService {
  public static async createDispute(
    projectId: string,
    milestoneIndex: number,
    userId: string,
    reason: string,
    evidenceUris: string[] = []
  ) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { milestones: true },
    });

    if (!project) throw new Error('Project not found');
    if (project.clientId !== userId && project.freelancerId !== userId) {
      throw new Error('Only project participants can raise disputes');
    }

    const milestone = project.milestones.find((m) => m.index === milestoneIndex);
    if (!milestone) throw new Error('Milestone not found');

    // Create dispute record
    const dispute = await prisma.dispute.create({
      data: {
        projectId,
        milestoneId: milestone.id,
        raisedById: userId,
        reason,
        evidenceUris,
      },
    });

    // Update project & milestone status
    await prisma.project.update({
      where: { id: projectId },
      data: { status: 'DISPUTED' },
    });

    await prisma.projectMilestone.update({
      where: { id: milestone.id },
      data: { status: 'DISPUTED' },
    });

    // Post system message
    await MessagesService.createSystemNotification(
      projectId,
      `🚨 Dispute initiated on Milestone #${milestoneIndex + 1}. Reason: ${reason}`
    );

    return dispute;
  }

  public static async getProjectDisputes(projectId: string, userId: string) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) throw new Error('Project not found');
    if (project.clientId !== userId && project.freelancerId !== userId) {
      throw new Error('Unauthorized project access');
    }

    const disputes = await prisma.dispute.findMany({
      where: { projectId },
      include: {
        raisedBy: {
          select: {
            id: true,
            address: true,
            freelancerProfile: { select: { displayName: true } },
            clientProfile: { select: { displayName: true } },
          },
        },
        milestone: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return disputes;
  }

  public static async resolveDispute(
    disputeId: string,
    outcome: 'PAY_FREELANCER' | 'REFUND_CLIENT' | 'SPLIT_FUNDS',
    resolvedTxHash: string
  ) {
    const dispute = await prisma.dispute.findUnique({
      where: { id: disputeId },
    });

    if (!dispute) throw new Error('Dispute not found');

    const updated = await prisma.dispute.update({
      where: { id: disputeId },
      data: {
        isResolved: true,
        outcome,
        resolvedTxHash,
        resolvedAt: new Date(),
      },
    });

    await prisma.project.update({
      where: { id: dispute.projectId },
      data: { status: 'IN_PROGRESS' },
    });

    await MessagesService.createSystemNotification(
      dispute.projectId,
      `⚖️ Dispute resolved by 2-of-3 Multisig Arbitrators. Outcome: ${outcome} (Tx: ${resolvedTxHash.substring(0, 10)}...)`
    );

    return updated;
  }
}
