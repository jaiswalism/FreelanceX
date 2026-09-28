import { Router } from 'express';
import { UsersController } from './users.controller.js';
import { authenticateUser } from '../../middleware/auth.js';

const router = Router();

router.get('/me', authenticateUser as any, UsersController.getMe as any);
router.patch('/me/freelancer', authenticateUser as any, UsersController.updateFreelancerProfile as any);
router.patch('/me/client', authenticateUser as any, UsersController.updateClientProfile as any);
router.post('/me/portfolio', authenticateUser as any, UsersController.addPortfolioItem as any);
router.get('/:address', UsersController.getUserByAddress as any);

export default router;
