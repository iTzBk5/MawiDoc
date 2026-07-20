import logger from '../../shared/utils/logger';
import prisma from '../../shared/database';
import admin from '../../config/firebase';

export class NotificationService {
  async create(userId: string, title: string, body: string, data?: Record<string, unknown>) {
    const notification = await prisma.notification.create({
      data: { userId, title, body, data: data as any || undefined },
    });

    logger.info({ userId, title }, 'Notification created');
    
    try {
      // @ts-ignore
      if (admin.apps.length > 0) {
        const tokens = await prisma.fCMToken.findMany({ where: { userId } });
        const deviceTokens = tokens.map(t => t.token);

        if (deviceTokens.length > 0) {
          // @ts-ignore
          await admin.messaging().sendEachForMulticast({
            tokens: deviceTokens,
            notification: { title, body },
            data: data ? Object.fromEntries(
              Object.entries(data).map(([key, value]) => [key, String(value)])
            ) : undefined,
          });
          logger.info(`Push notification sent to ${deviceTokens.length} devices for user ${userId}`);
        }
      }
    } catch (error) {
      logger.error('Failed to send FCM push notification:', error);
    }

    return notification;
  }

  async getNotifications(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where: { userId } }),
      prisma.notification.count({ where: { userId, isRead: false } }),
    ]);

    return {
      data: notifications,
      unreadCount,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async markAsRead(userId: string, notificationId: string) {
    const notification = await prisma.notification.findUnique({ where: { id: notificationId } });
    if (!notification || notification.userId !== userId) {
      return null;
    }

    return prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    return { message: 'All notifications marked as read' };
  }

  async saveFCMToken(userId: string, token: string, platform: string) {
    await prisma.fCMToken.upsert({
      where: { token },
      update: { userId, platform },
      create: { userId, token, platform },
    });
  }
}

export const notificationService = new NotificationService();
