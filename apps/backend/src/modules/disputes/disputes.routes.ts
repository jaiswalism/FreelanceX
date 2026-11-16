import { Router } from 'express';
import { authenticateUser } from '../../middleware/auth.js';
import { DisputesController } from './disputes.controller.js';

const router = Router();

router.post('/disputes', authenticateUser as any, DisputesController.createDispute as any);
router.get('/projects/:projectId/disputes', authenticateUser as any, DisputesController.getProjectDisputes as any);
router.post('/disputes/:id/resolve', authenticateUser as any, DisputesController.resolveDispute as any);

export default router;
