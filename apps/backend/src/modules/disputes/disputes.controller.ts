import { Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth.js';
import { DisputesService } from './disputes.service.js';

export class DisputesController {
  public static async createDispute(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }
      const userId = req.user.id;
      const { projectId, milestoneIndex, reason, evidenceUris } = req.body;

      if (!projectId || milestoneIndex === undefined || !reason) {
        res.status(400).json({ success: false, error: 'Missing required dispute fields' });
        return;
      }

      const dispute = await DisputesService.createDispute(
        projectId,
        parseInt(milestoneIndex, 10),
        userId,
        reason,
        evidenceUris || []
      );

      res.json({ success: true, dispute });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create dispute',
      });
    }
  }

  public static async getProjectDisputes(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }
      const userId = req.user.id;
      const projectId = req.params.projectId as string;
      const disputes = await DisputesService.getProjectDisputes(projectId, userId);
      res.json({ success: true, disputes });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch disputes',
      });
    }
  }

  public static async resolveDispute(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const disputeId = req.params.id as string;
      const { outcome, resolvedTxHash } = req.body;

      if (!outcome || !resolvedTxHash) {
        res.status(400).json({ success: false, error: 'Missing outcome or resolvedTxHash' });
        return;
      }

      const dispute = await DisputesService.resolveDispute(disputeId, outcome, resolvedTxHash);
      res.json({ success: true, dispute });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to resolve dispute',
      });
    }
  }
}
