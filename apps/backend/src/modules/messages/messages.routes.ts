import { Router } from 'express';
import { authenticateUser } from '../../middleware/auth.js';
import { MessagesController } from './messages.controller.js';

const router = Router();

router.use(authenticateUser);

router.get('/projects/:id/messages', MessagesController.getProjectMessages);
router.post('/projects/:id/messages', MessagesController.sendMessage);

export default router;
