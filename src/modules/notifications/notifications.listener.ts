import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { CommentCreatedEvent, KudoCreatedEvent, ReactionToggledEvent } from '@/common/events/kudo.events';
import { NotificationsGateway } from './notifications.gateway';
import { PrismaService } from '@/package/prisma/prisma.service';

@Injectable()
export class NotificationsListener {
  private readonly logger = new Logger(NotificationsListener.name);

  constructor(
    @InjectQueue('notifications') private readonly notificationsQueue: Queue,
    private readonly notificationsGateway: NotificationsGateway,
    private readonly prisma: PrismaService,
  ) { }

  @OnEvent('kudo.created')
  async handleKudoCreated(event: KudoCreatedEvent) {
    this.logger.log(`Kudo created event handled for Kudo ID: ${event.kudoId}`);

    // 1. Simple Task: Real-time broadcast (Event Bus)
    // We fetch the kudo details to broadcast
    const kudo = await this.prisma.kudo.findUnique({
      where: { id: event.kudoId },
      include: {
        sender: { select: { id: true, username: true, display_name: true } },
        receiver: { select: { id: true, username: true, display_name: true } },
      }
    });

    if (kudo) {
      // 1. Simple Task: Real-time broadcast (Event Bus)
      this.notificationsGateway.broadcastKudo(kudo);

      // 2. Complex Task: Persistent notification (BullMQ)
      await this.notificationsQueue.add('send-notification', {
        userId: event.receiverId,
        type: 'KUDO_RECEIVED',
        message: `${kudo.sender.display_name || kudo.sender.username} recognized you!`,
        kudoId: event.kudoId,
      });
    }
  }

  @OnEvent('comment.created')
  async handleCommentCreated(event: CommentCreatedEvent) {
    this.logger.log(`Comment created event handled for Kudo ID: ${event.kudoId}`);

    // 1. Simple Task: Potential broadcast if we had a comment-specific one
    // In current implementation, we might just want to refresh counts or similar

    // 2. Complex Task: Persistent notification (BullMQ)
    // We need to notify participants (sender and receiver, excluding the commenter)
    const kudo = await this.prisma.kudo.findUnique({
      where: { id: event.kudoId },
      select: { sender_id: true, receiver_id: true }
    });

    const user = await this.prisma.user.findUnique({
      where: { id: event.userId },
      select: { id: true, username: true, display_name: true },
    });

    if (kudo) {
      const recipientIds = new Set([kudo.sender_id, kudo.receiver_id]);
      recipientIds.delete(event.userId);

      for (const recipientId of recipientIds) {
        await this.notificationsQueue.add('send-notification', {
          userId: recipientId,
          type: 'COMMENT_ON_KUDO',
          message: `${user?.display_name || user?.username} commented on a kudo you're part of`,
          kudoId: event.kudoId,
        });
      }
    }
  }

  @OnEvent('reaction.toggled')
  async handleReactionToggled(event: ReactionToggledEvent) {
    if (!event.isAdded) {
      // Simple Task: Broadcast removal (Event Bus)
      this.notificationsGateway.broadcastReaction({
        kudo_id: event.kudoId,
        emoji: event.emoji,
        action: 'removed',
        userId: event.userId,
      });
      return;
    }

    // Handle addition (Complex Task: Persistence + Broadcast)
    const kudo = await this.prisma.kudo.findUnique({
      where: { id: event.kudoId },
      include: {
        sender: { select: { id: true, username: true, display_name: true } },
        receiver: { select: { id: true, username: true, display_name: true } },
      }
    });

    const user = await this.prisma.user.findUnique({
      where: { id: event.userId },
      select: { id: true, username: true, display_name: true },
    });

    if (kudo) {
      // Simple Task: Broadcast addition (Event Bus)
      this.notificationsGateway.broadcastReaction({
        kudo_id: event.kudoId,
        emoji: event.emoji,
        action: 'added',
        userId: event.userId,
      });

      // Complex Task: Persistent notification (BullMQ)
      // Only notify if reacter is not the receiver
      if (kudo.receiver_id !== event.userId) {
        await this.notificationsQueue.add('send-notification', {
          userId: kudo.receiver_id,
          type: 'REACTION_ON_KUDO',
          message: `${user?.display_name || user?.username} reacted with ${event.emoji} to your kudo`,
          kudoId: event.kudoId,
        });
      }
    }
  }
}
