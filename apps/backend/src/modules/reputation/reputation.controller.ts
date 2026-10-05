import { Request, Response } from 'express';
import { ReputationService } from './reputation.service.js';

export class ReputationController {
  public static async getUserReputation(req: Request, res: Response): Promise<void> {
    try {
      const address = req.params.address as string;
      const reputation = await ReputationService.getUserReputation(address);
      res.json({ success: true, reputation });
    } catch (error) {
      res.status(404).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch user reputation',
      });
    }
  }
}
