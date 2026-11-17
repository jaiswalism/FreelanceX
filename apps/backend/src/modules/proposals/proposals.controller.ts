import { Response } from 'express';
import { ProposalsService } from './proposals.service.js';
import { AuthenticatedRequest } from '../../middleware/auth.js';
import { CreateProposalSchema } from '@freelancerx/shared';

export class ProposalsController {
  static async submitProposal(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const parsed = CreateProposalSchema.safeParse({
        ...req.body,
        jobId: req.params['jobId'] || req.body.jobId,
      });

      if (!parsed.success) {
        res.status(400).json({ error: 'Invalid proposal data', details: parsed.error.issues });
        return;
      }

      const proposal = await ProposalsService.submitProposal(req.user.id, parsed.data);
      res.status(201).json({ success: true, proposal });
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to submit proposal' });
    }
  }

  static async getProposalsByJob(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const jobId = req.params['jobId'] as string;
      const proposals = await ProposalsService.getProposalsByJob(jobId, req.user.id);
      res.json({ success: true, proposals });
    } catch (error) {
      res.status(403).json({ error: error instanceof Error ? error.message : 'Failed to fetch proposals' });
    }
  }

  static async acceptProposal(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const proposalId = req.params['id'] as string;
      const result = await ProposalsService.acceptProposal(proposalId, req.user.id);
      res.json({ success: true, ...result });
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to accept proposal' });
    }
  }

  static async getMyProposals(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      const proposals = await ProposalsService.getMyProposals(req.user.id);
      res.json({ success: true, proposals });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch proposals' });
    }
  }

  static async rejectProposal(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const proposalId = req.params['id'] as string;
      const proposal = await ProposalsService.rejectProposal(proposalId, req.user.id);
      res.json({ success: true, proposal });
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to reject proposal' });
    }
  }
}
