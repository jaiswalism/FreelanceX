import { Router } from 'express';
import { authenticateUser } from '../../middleware/auth.js';
import { DisputesController } from './disputes.controller.js';

const router = Router();

router.use(authenticateUser);

router.post('/disputes', DisputesController.createDispute);
router.get('/projects/:projectId/disputes', DisputesController.getProjectDisputes);
router.post('/disputes/:id/resolve', DisputesController.resolveDispute);

export default router;
