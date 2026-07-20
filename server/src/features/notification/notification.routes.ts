import { Router } from 'express';
import { notificationController } from './notification.controller';
import { authenticate } from '../../shared/middleware/auth.middleware';

const router = Router();
router.use(authenticate);

router.get('/', notificationController.getNotifications);
router.put('/:id/read', notificationController.markAsRead);
router.put('/read-all', notificationController.markAllAsRead);
router.post('/fcm-token', notificationController.saveFCMToken);

export default router;
