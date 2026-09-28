import { prisma } from '../../database/prisma.js';

export class UsersService {
  /**
   * Retrieves full profile of the authenticated user
   */
  static async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        freelancerProfile: {
          include: {
            portfolio: true,
          },
        },
        clientProfile: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  /**
   * Updates freelancer profile details
   */
  static async updateFreelancerProfile(
    userId: string,
    data: {
      displayName?: string;
      bio?: string;
      title?: string;
      skills?: string[];
      hourlyRate?: number;
      avatarUrl?: string;
    }
  ) {
    const updateData: any = {};
    if (data.displayName !== undefined) updateData.displayName = data.displayName;
    if (data.bio !== undefined) updateData.bio = data.bio;
    if (data.title !== undefined) updateData.title = data.title;
    if (data.skills !== undefined) updateData.skills = data.skills;
    if (data.hourlyRate !== undefined) updateData.hourlyRate = data.hourlyRate;
    if (data.avatarUrl !== undefined) updateData.avatarUrl = data.avatarUrl;

    const profile = await prisma.freelancerProfile.upsert({
      where: { userId },
      update: updateData,
      create: {
        userId,
        displayName: data.displayName || 'Freelancer',
        bio: data.bio,
        title: data.title,
        skills: data.skills || [],
        hourlyRate: data.hourlyRate ?? null,
        avatarUrl: data.avatarUrl,
      },
      include: {
        portfolio: true,
      },
    });

    return profile;
  }

  /**
   * Updates client profile details
   */
  static async updateClientProfile(
    userId: string,
    data: {
      displayName?: string;
      companyName?: string;
      description?: string;
      website?: string;
      avatarUrl?: string;
    }
  ) {
    const updateData: any = {};
    if (data.displayName !== undefined) updateData.displayName = data.displayName;
    if (data.companyName !== undefined) updateData.companyName = data.companyName;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.website !== undefined) updateData.website = data.website;
    if (data.avatarUrl !== undefined) updateData.avatarUrl = data.avatarUrl;

    const profile = await prisma.clientProfile.upsert({
      where: { userId },
      update: updateData,
      create: {
        userId,
        displayName: data.displayName || 'Client',
        companyName: data.companyName,
        description: data.description,
        website: data.website,
        avatarUrl: data.avatarUrl,
      },
    });

    return profile;
  }

  /**
   * Retrieves public user profile by wallet address
   */
  static async getUserByAddress(address: string) {
    const user = await prisma.user.findUnique({
      where: { address: address.toLowerCase() },
      select: {
        id: true,
        address: true,
        createdAt: true,
        freelancerProfile: {
          include: {
            portfolio: true,
          },
        },
        clientProfile: true,
        clientProjects: {
          where: { status: 'COMPLETED' },
          select: {
            id: true,
            title: true,
            totalAmountUsdc: true,
            completedTxHash: true,
            updatedAt: true,
          },
        },
        freelancerProjects: {
          where: { status: 'COMPLETED' },
          select: {
            id: true,
            title: true,
            totalAmountUsdc: true,
            completedTxHash: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error('User not found for this address');
    }

    return user;
  }

  /**
   * Adds a portfolio entry to freelancer profile
   */
  static async addPortfolioItem(
    userId: string,
    data: {
      title: string;
      description: string;
      link?: string;
      imageUrl?: string;
      tags: string[];
      verifiedOnChain?: boolean;
      projectContractId?: string;
    }
  ) {
    const freelancerProfile = await prisma.freelancerProfile.findUnique({
      where: { userId },
    });

    if (!freelancerProfile) {
      throw new Error('Freelancer profile not found. Please create one first.');
    }

    const item = await prisma.portfolioItem.create({
      data: {
        freelancerId: freelancerProfile.id,
        title: data.title,
        description: data.description,
        link: data.link,
        imageUrl: data.imageUrl,
        tags: data.tags,
        verifiedOnChain: data.verifiedOnChain ?? false,
        projectContractId: data.projectContractId,
      },
    });

    return item;
  }
}
