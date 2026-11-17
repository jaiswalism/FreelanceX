import { prisma } from '../../database/prisma.js';

export class ReputationService {
  public static async getUserReputation(address: string) {
    const user = await prisma.user.findUnique({
      where: { address: address.toLowerCase() },
      include: {
        freelancerProfile: {
          include: { portfolio: true },
        },
        clientProfile: true,
        freelancerProjects: {
          where: { status: 'COMPLETED' },
          include: { job: true },
        },
        clientProjects: {
          where: { status: 'COMPLETED' },
        },
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const completedAsFreelancer = user.freelancerProjects.length;
    const completedAsClient = user.clientProjects.length;
    const totalCompletedProjects = completedAsFreelancer + completedAsClient;

    const totalEarnedUsdc = user.freelancerProfile?.totalEarningsUsdc || 0;
    const totalSpentUsdc = user.clientProfile?.totalSpentUsdc || 0;

    // Calculate Verified On-Chain Reputation Score (0 - 100)
    let reputationScore = 0;
    if (totalCompletedProjects > 0) {
      reputationScore = 50; // Base score once verified project completed
      reputationScore += Math.min(completedAsFreelancer * 10, 30);
      reputationScore += Math.min(completedAsClient * 5, 15);
      if (Number(totalEarnedUsdc) > 1000) reputationScore += 5;
      reputationScore = Math.min(reputationScore, 100);
    }

    // On-Chain Anchors List
    const verifiedAnchors = user.freelancerProjects.map((p: any) => ({
      projectId: p.id,
      onChainProjectId: p.onChainProjectId,
      completedTxHash: p.completedTxHash,
      totalAmountUsdc: p.totalAmountUsdc,
      title: p.title,
    }));

    return {
      address: user.address,
      reputationScore,
      isVerifiedOnChain: totalCompletedProjects > 0 || Number(totalEarnedUsdc) > 0,
      stats: {
        completedAsFreelancer,
        completedAsClient,
        totalCompletedProjects,
        totalEarnedUsdc,
        totalSpentUsdc,
        rating: user.freelancerProfile?.rating || 5.0,
      },
      onChainAnchors: verifiedAnchors,
    };
  }
}
