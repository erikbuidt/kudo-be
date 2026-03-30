import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/package/prisma/prisma.service';
import { NotificationsGateway } from './notifications.gateway';
import { NotificationType } from '@/generated/prisma/enums';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  /**
   * Creates a notification in the DB and pushes it to the user via WebSocket
   */
  async createNotification(data: {
    userId: string;
    type: NotificationType;
    message: string;
    kudoId?: string;
  }) {
    // 1. Persist to Postgres
    const notification = await this.prisma.notification.create({
      data: {
        user_id: data.userId,
        type: data.type,
        message: data.message,
        kudo_id: data.kudoId,
      },
    });

    // 2. Push real-time event
    this.notificationsGateway.sendToUser(data.userId, {
      type:
        data.type === 'KUDO_RECEIVED'
          ? 'kudo_received'
          : data.type === 'COMMENT_ON_KUDO'
            ? 'comment_added'
            : 'reaction_added',
      message: data.message,
      data: {
        notification_id: notification.id,
        kudo_id: data.kudoId,
      },
    });

    return notification;
  }

  broadcastKudo(kudo: any) {
    this.notificationsGateway.broadcastKudo(kudo);
  }

  broadcastReaction(data: any) {
    this.notificationsGateway.broadcastReaction(data);
  }

  async getUserNotifications(userId: string, limit = 20, page = 1) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.prisma.notification.findMany({
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        where: { user_id: userId },
        include: {
          kudo: {
            select: { id: true, points: true, description: true },
          },
        },
      }),
      this.prisma.notification.count({ where: { user_id: userId } }),
    ]);

    return {
      data: items,
      meta: {
        total_items: total,
        items_per_page: limit,
        current_page: page,
        total_pages: Math.ceil(total / limit),
        item_count: items.length,
      },
    };
  }

  async markAsRead(userId: string, notificationId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });
    if (!notification || notification.user_id !== userId) {
      throw new NotFoundException('Notification not found');
    }

    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { is_read: true },
    });
  }

  async getUnreadCount(userId: string) {
    return this.prisma.notification.count({
      where: { user_id: userId, is_read: false },
    });
  }
}
