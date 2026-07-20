import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../../shared/types';
import { notificationService } from './notification.service';

export class NotificationController {
  async getNotifications(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 20;
      const result = await notificationService.getNotifications(req.user!.userId, page, limit);
      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }

  async markAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await notificationService.markAsRead(req.user!.userId, req.params.id as string);
      if (!result) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Notification not found' } });
        return;
      }
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async markAllAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await notificationService.markAllAsRead(req.user!.userId);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async saveFCMToken(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { token, platform } = req.body;
      await notificationService.saveFCMToken(req.user!.userId, token, platform);
      res.json({ success: true, data: { message: 'FCM token saved' } });
    } catch (err) {
      next(err);
    }
  }
}

export const notificationController = new NotificationController();
