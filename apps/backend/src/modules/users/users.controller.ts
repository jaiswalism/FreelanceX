import { Response } from 'express';
import { UsersService } from './users.service.js';
import { AuthenticatedRequest } from '../../middleware/auth.js';
import { UpdateProfileSchema, HexAddressSchema } from '@freelancerx/shared';
import { z } from 'zod';

const PortfolioItemSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(1000),
  link: z.string().url().optional(),
  imageUrl: z.string().url().optional(),
  tags: z.array(z.string()).default([]),
  verifiedOnChain: z.boolean().optional(),
  projectContractId: z.string().optional(),
});

export class UsersController {
  static async getMe(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      const user = await UsersService.getMe(req.user.id);
      res.json({ success: true, user });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch user' });
    }
  }

  static async updateFreelancerProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const parsed = UpdateProfileSchema.partial().safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: 'Invalid profile data', details: parsed.error.issues });
        return;
      }

      const profile = await UsersService.updateFreelancerProfile(req.user.id, parsed.data);
      res.json({ success: true, profile });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to update profile' });
    }
  }

  static async updateClientProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const parsed = UpdateProfileSchema.partial().safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: 'Invalid profile data', details: parsed.error.issues });
        return;
      }

      const profile = await UsersService.updateClientProfile(req.user.id, parsed.data);
      res.json({ success: true, profile });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to update profile' });
    }
  }

  static async getUserByAddress(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const address = req.params['address'];
      const parsed = HexAddressSchema.safeParse(address);
      if (!parsed.success) {
        res.status(400).json({ error: 'Invalid address format' });
        return;
      }

      const user = await UsersService.getUserByAddress(parsed.data);
      res.json({ success: true, user });
    } catch (error) {
      res.status(404).json({ error: error instanceof Error ? error.message : 'User not found' });
    }
  }

  static async addPortfolioItem(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const parsed = PortfolioItemSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: 'Invalid portfolio data', details: parsed.error.issues });
        return;
      }

      const item = await UsersService.addPortfolioItem(req.user.id, parsed.data);
      res.json({ success: true, item });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to add portfolio item' });
    }
  }
}
