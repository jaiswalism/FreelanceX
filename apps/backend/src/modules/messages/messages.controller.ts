import { Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth.js';
import { MessagesService } from './messages.service.js';

export class MessagesController {
  public static async getProjectMessages(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }
      const userId = req.user.id;
      const projectId = req.params.id as string;
      const messages = await MessagesService.getProjectMessages(projectId, userId);
      res.json({ success: true, messages });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch project messages',
      });
    }
  }

  public static async sendMessage(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }
      const userId = req.user.id;
      const projectId = req.params.id as string;
      const { content, attachmentUri } = req.body;

      if (!content || !content.trim()) {
        res.status(400).json({ success: false, error: 'Message content cannot be empty' });
        return;
      }

      const message = await MessagesService.sendMessage(
        projectId,
        userId,
        content,
        attachmentUri
      );

      res.json({ success: true, message });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send message',
      });
    }
  }
}
