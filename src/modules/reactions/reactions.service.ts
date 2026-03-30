import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/package/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import type { ToggleReactionDto } from './toggle-reaction.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ReactionToggledEvent } from '@/common/events/kudo.events';

@Injectable()
export class ReactionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async toggleReaction(userId: string, dto: ToggleReactionDto) {
    const kudo = await this.prisma.kudo.findUnique({
      where: { id: dto.kudo_id },
      select: { id: true, sender_id: true, receiver_id: true },
    });
    if (!kudo) throw new NotFoundException('Kudo not found');

    const existing = await this.prisma.reaction.findUnique({
      where: {
        kudo_id_user_id_emoji: {
          kudo_id: dto.kudo_id,
          user_id: userId,
          emoji: dto.emoji,
        },
      },
    });

    if (existing) {
      // Remove reaction (toggle off)
      await this.prisma.reaction.delete({ where: { id: existing.id } });

      this.eventEmitter.emit(
        'reaction.toggled',
        new ReactionToggledEvent(dto.kudo_id, userId, dto.emoji, false),
      );

      return { action: 'removed', emoji: dto.emoji };
    }

    // Add reaction (toggle on)
    const reaction = await this.prisma.reaction.create({
      data: {
        emoji: dto.emoji,
        kudo_id: dto.kudo_id,
        user_id: userId,
      },
      include: { user: { select: { id: true, username: true } } },
    });

    this.eventEmitter.emit(
      'reaction.toggled',
      new ReactionToggledEvent(dto.kudo_id, userId, dto.emoji, true),
    );

    return { action: 'added', reaction };
  }

  getReactionSummary(kudoId: string) {
    return this.prisma.reaction.groupBy({
      by: ['emoji'],
      where: { kudo_id: kudoId },
      _count: { emoji: true },
    });
  }
}
