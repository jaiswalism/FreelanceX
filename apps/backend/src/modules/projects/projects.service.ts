import { prisma } from '../../database/prisma.js';

export class ProjectsService {
  public static async getUserProjects(userId: string) {
    const projects = await prisma.project.findMany({
      where: {
        OR: [{ clientId: userId }, { freelancerId: userId }],
      },
      include: {
        job: { select: { id: true, title: true, budgetUsdc: true } },
        client: { select: { id: true, address: true, clientProfile: true } },
        freelancer: { select: { id: true, address: true, freelancerProfile: true } },
        milestones: { orderBy: { index: 'asc' } },
        disputes: { where: { isResolved: false } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return projects;
  }

  public static async getProjectById(projectId: string, userId: string) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        job: true,
        client: { select: { id: true, address: true, clientProfile: true } },
        freelancer: { select: { id: true, address: true, freelancerProfile: true } },
        milestones: { orderBy: { index: 'asc' } },
        disputes: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!project) {
      throw new Error('Project not found');
    }

    if (project.clientId !== userId && project.freelancerId !== userId) {
      throw new Error('Unauthorized project access');
    }

    return project;
  }

  public static async syncOnChainProject(
    projectId: string,
    userId: string,
    onChainProjectId: string,
    fundedTxHash?: string
  ) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new Error('Project not found');
    }

    if (project.clientId !== userId) {
      throw new Error('Only project client can record on-chain project initialization');
    }

    const updated = await prisma.project.update({
      where: { id: projectId },
      data: {
        onChainProjectId,
        status: fundedTxHash ? 'FUNDED' : 'INITIALIZED',
        ...(fundedTxHash ? { fundedTxHash } : {}),
      },
      include: { milestones: true },
    });

    return updated;
  }

  public static async submitDeliverable(
    projectId: string,
    milestoneIndex: number,
    userId: string,
    deliverableUri: string,
    deliverableDescription?: string
  ) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) throw new Error('Project not found');
    if (project.freelancerId !== userId) throw new Error('Only assigned freelancer can submit deliverables');

    const milestone = await prisma.projectMilestone.findFirst({
      where: { projectId, index: milestoneIndex },
    });

    if (!milestone) throw new Error('Milestone not found');

    const updated = await prisma.projectMilestone.update({
      where: { id: milestone.id },
      data: {
        status: 'SUBMITTED',
        deliverableUri,
        deliverableDescription: deliverableDescription || null,
        submissionDate: new Date(),
      },
    });

    return updated;
  }

  public static async approveMilestone(
    projectId: string,
    milestoneIndex: number,
    userId: string,
    paymentTxHash?: string
  ) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) throw new Error('Project not found');
    if (project.clientId !== userId) throw new Error('Only client can approve milestone payment');

    const milestone = await prisma.projectMilestone.findFirst({
      where: { projectId, index: milestoneIndex },
    });

    if (!milestone) throw new Error('Milestone not found');

    const updated = await prisma.projectMilestone.update({
      where: { id: milestone.id },
      data: {
        status: paymentTxHash ? 'PAID' : 'APPROVED',
        paidDate: paymentTxHash ? new Date() : milestone.paidDate,
        paymentTxHash: paymentTxHash || milestone.paymentTxHash,
      },
    });

    if (paymentTxHash) {
      const remainingUnpaid = await prisma.projectMilestone.count({
        where: {
          projectId,
          id: { not: milestone.id },
          status: { not: 'PAID' },
        },
      });
      if (remainingUnpaid === 0) {
        await prisma.project.update({
          where: { id: projectId },
          data: { status: 'COMPLETED' },
        });
      }
    }

    return updated;
  }
}
