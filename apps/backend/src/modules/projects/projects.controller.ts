import { Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth.js';
import { ProjectsService } from './projects.service.js';

export class ProjectsController {
  public static async getUserProjects(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }
      const userId = req.user.id;
      const projects = await ProjectsService.getUserProjects(userId);
      res.json({ success: true, projects });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch user projects',
      });
    }
  }

  public static async getProjectById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }
      const userId = req.user.id;
      const projectId = req.params.id as string;
      const project = await ProjectsService.getProjectById(projectId, userId);
      res.json({ success: true, project });
    } catch (error) {
      res.status(404).json({
        success: false,
        error: error instanceof Error ? error.message : 'Project not found',
      });
    }
  }

  public static async syncOnChainProject(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }
      const userId = req.user.id;
      const projectId = req.params.id as string;
      const { onChainProjectId, fundedTxHash } = req.body;

      if (!onChainProjectId) {
        res.status(400).json({ success: false, error: 'Missing onChainProjectId' });
        return;
      }

      const project = await ProjectsService.syncOnChainProject(
        projectId,
        userId,
        onChainProjectId,
        fundedTxHash
      );

      res.json({ success: true, project });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to sync on-chain project',
      });
    }
  }

  public static async submitDeliverable(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }
      const userId = req.user.id;
      const projectId = req.params.id as string;
      const milestoneIndex = parseInt(req.params.index as string, 10);
      const { deliverableUri, deliverableDescription } = req.body;

      if (!deliverableUri) {
        res.status(400).json({ success: false, error: 'Missing deliverableUri' });
        return;
      }

      const milestone = await ProjectsService.submitDeliverable(
        projectId,
        milestoneIndex,
        userId,
        deliverableUri,
        deliverableDescription
      );

      res.json({ success: true, milestone });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to submit deliverable',
      });
    }
  }

  public static async approveMilestone(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }
      const userId = req.user.id;
      const projectId = req.params.id as string;
      const milestoneIndex = parseInt(req.params.index as string, 10);
      const { paymentTxHash } = req.body;

      const milestone = await ProjectsService.approveMilestone(
        projectId,
        milestoneIndex,
        userId,
        paymentTxHash
      );

      res.json({ success: true, milestone });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to approve milestone',
      });
    }
  }
}
