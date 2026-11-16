import { Router } from 'express';
import { authenticateUser } from '../../middleware/auth.js';
import { ProjectsController } from './projects.controller.js';

const router = Router();

router.get('/projects/me', authenticateUser as any, ProjectsController.getUserProjects as any);
router.get('/projects/:id', authenticateUser as any, ProjectsController.getProjectById as any);
router.post('/projects/:id/onchain-sync', authenticateUser as any, ProjectsController.syncOnChainProject as any);
router.post('/projects/:id/milestones/:index/submit', authenticateUser as any, ProjectsController.submitDeliverable as any);
router.post('/projects/:id/milestones/:index/approve', authenticateUser as any, ProjectsController.approveMilestone as any);

export default router;
