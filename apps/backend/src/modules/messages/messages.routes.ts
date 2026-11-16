import { Router } from 'express';
import { authenticateUser } from '../../middleware/auth.js';
import { MessagesController } from './messages.controller.js';

const router = Router();

router.get('/projects/:id/messages', authenticateUser as any, MessagesController.getProjectMessages as any);
router.post('/projects/:id/messages', authenticateUser as any, MessagesController.sendMessage as any);

export default router;
