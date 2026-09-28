import { Router } from 'express';
import { ProposalsController } from './proposals.controller.js';
import { authenticateUser } from '../../middleware/auth.js';

const router = Router();

router.post('/jobs/:jobId/proposals', authenticateUser as any, ProposalsController.submitProposal as any);
router.get('/jobs/:jobId/proposals', authenticateUser as any, ProposalsController.getProposalsByJob as any);
router.post('/proposals/:id/accept', authenticateUser as any, ProposalsController.acceptProposal as any);
router.post('/proposals/:id/reject', authenticateUser as any, ProposalsController.rejectProposal as any);

export default router;
