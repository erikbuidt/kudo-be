import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@/package/prisma/prisma.service'
import { NotificationsService } from '../notifications/notifications.service'
import type { ToggleReactionDto } from './toggle-reaction.dto'

@Injectable()
export class ReactionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async toggleReaction(userId: string, dto: ToggleReactionDto) {
    const kudo = await this.prisma.kudo.findUnique({
      where: { id: dto.kudo_id },
      select: { id: true, sender_id: true, receiver_id: true },
    })
    if (!kudo) throw new NotFoundException('Kudo not found')

    const existing = await this.prisma.reaction.findUnique({
      where: {
        kudo_id_user_id_emoji: {
          kudo_id: dto.kudo_id,
          user_id: userId,
          emoji: dto.emoji,
        },
      },
    })

    if (existing) {
      // Remove reaction (toggle off)
      await this.prisma.reaction.delete({ where: { id: existing.id } })
      return { action: 'removed', emoji: dto.emoji }
    }

    // Add reaction (toggle on)
    const reaction = await this.prisma.reaction.create({
      data: {
        emoji: dto.emoji,
        kudo_id: dto.kudo_id,
        user_id: userId,
      },
      include: { user: { select: { id: true, username: true } } },
    })

    // Notify kudo participants (excluding the reacter)
    const notifyIds = new Set([kudo.sender_id, kudo.receiver_id])
    notifyIds.delete(userId)

    for (const recipientId of notifyIds) {
      this.notificationsService.createNotification({
        userId: recipientId,
        type: 'REACTION_ON_KUDO',
        message: `${reaction.user.username} reacted with ${dto.emoji} to a kudo`,
        kudoId: dto.kudo_id,
      })
    }

    return { action: 'added', reaction }
  }

  getReactionSummary(kudoId: string) {
    return this.prisma.reaction.groupBy({
      by: ['emoji'],
      where: { kudo_id: kudoId },
      _count: { emoji: true },
    })
  }
}
