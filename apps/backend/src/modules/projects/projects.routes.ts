import { Router } from 'express';
import { authenticateUser } from '../../middleware/auth.js';
import { ProjectsController } from './projects.controller.js';

const router = Router();

router.use(authenticateUser);

router.get('/projects/me', ProjectsController.getUserProjects);
router.get('/projects/:id', ProjectsController.getProjectById);
router.post('/projects/:id/onchain-sync', ProjectsController.syncOnChainProject);
router.post('/projects/:id/milestones/:index/submit', ProjectsController.submitDeliverable);
router.post('/projects/:id/milestones/:index/approve', ProjectsController.approveMilestone);

export default router;
