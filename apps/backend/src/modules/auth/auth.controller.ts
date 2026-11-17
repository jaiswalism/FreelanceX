import { Request, Response } from 'express';
import { AuthService } from './auth.service.js';
import { AuthNonceRequestSchema, AuthVerifyRequestSchema } from '@freelancerx/shared';
import { AuthenticatedRequest } from '../../middleware/auth.js';

export class AuthController {
  static async requestNonce(req: Request, res: Response): Promise<void> {
    try {
      const parsed = AuthNonceRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: 'Invalid address format', details: parsed.error.issues });
        return;
      }

      const result = await AuthService.generateNonce(parsed.data.address);
      res.json({
        success: true,
        nonce: result.nonce,
        expiresAt: result.expiresAt,
        message: `FreelancerX Auth Nonce: ${result.nonce}\nAddress: ${parsed.data.address}\nChainId: 11155111`,
      });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to generate nonce' });
    }
  }

  static async verifySignature(req: Request, res: Response): Promise<void> {
    try {
      const parsed = AuthVerifyRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: 'Invalid verification payload', details: parsed.error.issues });
        return;
      }

      const result = await AuthService.verifySignature(
        parsed.data.address,
        parsed.data.signature,
        parsed.data.nonce
      );

      res.json({
        success: true,
        token: result.token,
        user: result.user,
        expiresAt: result.expiresAt,
      });
    } catch (error) {
      res.status(401).json({ error: error instanceof Error ? error.message : 'Signature verification failed' });
    }
  }

  static async logout(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (req.user?.sessionId) {
        await AuthService.logout(req.user.sessionId);
      }
      res.json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Logout failed' });
    }
  }
}
