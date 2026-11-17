import { prisma } from '../../database/prisma.js';
import { parseUnits } from 'viem';
import { JobStatus } from '@freelancerx/shared';

export class JobsService {
  /**
   * Retrieves paginated, filtered list of marketplace jobs
   */
  static async listJobs(params: {
    query?: string;
    skill?: string;
    minBudget?: number;
    maxBudget?: number;
    status?: JobStatus;
    page?: number;
    limit?: number;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {
      status: params.status || 'OPEN',
    };

    if (params.query) {
      where.OR = [
        { title: { contains: params.query, mode: 'insensitive' } },
        { description: { contains: params.query, mode: 'insensitive' } },
      ];
    }

    if (params.skill) {
      where.skills = { has: params.skill };
    }

    if (params.minBudget !== undefined || params.maxBudget !== undefined) {
      where.budgetUsdc = {};
      if (params.minBudget !== undefined) where.budgetUsdc.gte = params.minBudget;
      if (params.maxBudget !== undefined) where.budgetUsdc.lte = params.maxBudget;
    }

    const [total, jobs] = await Promise.all([
      prisma.job.count({ where }),
      prisma.job.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          client: {
            select: {
              id: true,
              address: true,
              clientProfile: true,
            },
          },
          _count: {
            select: { proposals: true },
          },
        },
      }),
    ]);

    return {
      jobs: jobs.map((j: any) => ({
        ...j,
        proposalsCount: j._count.proposals,
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Creates a new job listing
   */
  static async createJob(
    clientId: string,
    data: {
      title: string;
      description: string;
      skills: string[];
      budgetUsdc: string;
      estimatedDurationDays?: number;
    }
  ) {
    // 6 decimals for USDC base units
    const budgetBaseUnits = parseUnits(data.budgetUsdc, 6).toString();

    const job = await prisma.job.create({
      data: {
        clientId,
        title: data.title,
        description: data.description,
        skills: data.skills,
        budgetUsdc: data.budgetUsdc,
        budgetBaseUnits,
        estimatedDurationDays: data.estimatedDurationDays,
        status: 'OPEN',
      },
      include: {
        client: {
          select: {
            id: true,
            address: true,
            clientProfile: true,
          },
        },
      },
    });

    return job;
  }

  /**
   * Retrieves detailed job by ID
   */
  static async getJobById(jobId: string, currentUserId?: string) {
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        client: {
          select: {
            id: true,
            address: true,
            clientProfile: true,
          },
        },
        proposals: currentUserId
          ? {
              where: {
                OR: [
                  { freelancerId: currentUserId },
                  { job: { clientId: currentUserId } },
                ],
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
            }
          : false,
        _count: {
          select: { proposals: true },
        },
      },
    });

    if (!job) {
      throw new Error('Job listing not found');
    }

    return {
      ...job,
      proposalsCount: job._count.proposals,
    };
  }

  /**
   * Updates an existing job listing (owner only)
   */
  static async updateJob(
    jobId: string,
    clientId: string,
    data: {
      title?: string;
      description?: string;
      skills?: string[];
      budgetUsdc?: string;
      estimatedDurationDays?: number;
    }
  ) {
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) throw new Error('Job not found');
    if (job.clientId !== clientId) throw new Error('Only the job owner can edit this gig');

    const updateData: any = { ...data };
    if (data.budgetUsdc) {
      updateData.budgetBaseUnits = parseUnits(data.budgetUsdc, 6).toString();
    }

    return prisma.job.update({
      where: { id: jobId },
      data: updateData,
      include: {
        client: { select: { id: true, address: true, clientProfile: true } },
        _count: { select: { proposals: true } },
      },
    });
  }

  /**
   * Closes a job listing
   */
  static async closeJob(jobId: string, clientId: string) {
    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new Error('Job listing not found');
    }

    if (job.clientId !== clientId) {
      throw new Error('Only the job creator can close this job');
    }

    return prisma.job.update({
      where: { id: jobId },
      data: { status: 'CANCELLED' },
    });
  }
}
