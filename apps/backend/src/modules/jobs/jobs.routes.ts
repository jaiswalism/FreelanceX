import { Router } from 'express';
import { JobsController } from './jobs.controller.js';
import { authenticateUser } from '../../middleware/auth.js';

const router = Router();

router.get('/', JobsController.listJobs as any);
router.post('/', authenticateUser as any, JobsController.createJob as any);
router.get('/:id', JobsController.getJobById as any);
router.put('/:id', authenticateUser as any, JobsController.updateJob as any);
router.post('/:id/close', authenticateUser as any, JobsController.closeJob as any);

export default router;
