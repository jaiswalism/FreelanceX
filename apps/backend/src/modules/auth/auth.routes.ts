import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { authenticateUser } from '../../middleware/auth.js';

const router = Router();

router.post('/nonce', AuthController.requestNonce);
router.post('/verify', AuthController.verifySignature);
router.post('/logout', authenticateUser as any, AuthController.logout as any);

export default router;
