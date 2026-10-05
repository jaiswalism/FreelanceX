import { prisma } from '../../database/prisma.js';

export class MessagesService {
  public static async getProjectMessages(projectId: string, userId: string) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) throw new Error('Project not found');
    if (project.clientId !== userId && project.freelancerId !== userId) {
      throw new Error('Unauthorized project access');
    }

    const messages = await prisma.projectMessage.findMany({
      where: { projectId },
      include: {
        sender: {
          select: {
            id: true,
            address: true,
            freelancerProfile: { select: { displayName: true } },
            clientProfile: { select: { displayName: true } },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return messages;
  }

  public static async sendMessage(
    projectId: string,
    userId: string,
    content: string,
    attachmentUri?: string
  ) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) throw new Error('Project not found');
    if (project.clientId !== userId && project.freelancerId !== userId) {
      throw new Error('Unauthorized project access');
    }

    const message = await prisma.projectMessage.create({
      data: {
        projectId,
        senderId: userId,
        content,
        attachmentUri: attachmentUri || null,
      },
      include: {
        sender: {
          select: {
            id: true,
            address: true,
            freelancerProfile: { select: { displayName: true } },
            clientProfile: { select: { displayName: true } },
          },
        },
      },
    });

    return message;
  }

  public static async createSystemNotification(projectId: string, content: string) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) return;

    await prisma.projectMessage.create({
      data: {
        projectId,
        senderId: project.clientId,
        content,
        isSystemNotification: true,
      },
    });
  }
}
