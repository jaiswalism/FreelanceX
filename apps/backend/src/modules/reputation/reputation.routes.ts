import { Router } from 'express';
import { ReputationController } from './reputation.controller.js';

const router = Router();

router.get('/users/:address/reputation', ReputationController.getUserReputation);

export default router;
