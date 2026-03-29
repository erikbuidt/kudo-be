import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '@/package/prisma/prisma.service'
import type { CreateKudoDto, FeedQueryDto } from './create-kudo.dto'
import { NotificationsService } from '../notifications/notifications.service'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { KudoCreatedEvent } from '@/common/events/kudo.events'

@Injectable()
export class KudosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
    private readonly eventEmitter: EventEmitter2,
  ) { }

  async createKudo(senderId: string, dto: CreateKudoDto) {
    if (senderId === dto.receiver_id) {
      throw new BadRequestException('You cannot send a kudo to yourself')
    }

    const sender = await this.prisma.user.findUnique({ where: { id: senderId } })
    if (!sender) throw new NotFoundException('Sender not found')

    const receiver = await this.prisma.user.findUnique({ where: { id: dto.receiver_id } })
    if (!receiver) throw new NotFoundException('Receiver not found')

    if (sender.giving_budget < dto.points) {
      throw new ForbiddenException(
        `Insufficient giving budget. You have ${sender.giving_budget} pts remaining.`,
      )
    }

    const kudo = await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: senderId },
        data: { giving_budget: { decrement: dto.points } },
      })

      await tx.user.update({
        where: { id: dto.receiver_id },
        data: { received_balance: { increment: dto.points } },
      })

      return tx.kudo.create({
        data: {
          sender_id: senderId,
          receiver_id: dto.receiver_id,
          points: dto.points,
          description: dto.description,
          core_value: dto.core_value,
          media_url: dto.media_url,
          media_type: dto.media_type,
        },
        include: {
          sender: { select: { id: true, username: true } },
          receiver: { select: { id: true, username: true } },
        },
      })
    })

    // Emit event for background tasks (notifications, feed)
    this.eventEmitter.emit('kudo.created', new KudoCreatedEvent(
      kudo.id,
      kudo.sender_id,
      kudo.receiver_id,
      kudo.points
    ));

    return kudo
  }

  async getFeed(query: FeedQueryDto) {
    const page = query.page ?? 1
    const limit = query.limit ?? 3
    const skip = (page - 1) * limit

    const [items, total] = await Promise.all([
      this.prisma.kudo.findMany({
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          sender: { select: { id: true, username: true } },
          receiver: { select: { id: true, username: true } },
          _count: { select: { comments: true, reactions: true } },
        },
      }),
      this.prisma.kudo.count(),
    ])
    return {
      data: items.map((kudo) => ({
        id: kudo.id,
        points: kudo.points,
        description: kudo.description,
        core_value: kudo.core_value,
        media_url: kudo.media_url,
        media_type: kudo.media_type,
        created_at: kudo.created_at,
        sender: kudo.sender,
        receiver: kudo.receiver,
        comments_count: kudo._count.comments,
        reactions_count: kudo._count.reactions,
      })),
      meta: {
        total_items: total,
        items_per_page: limit,
        current_page: page,
        total_pages: Math.ceil(total / limit),
        item_count: items.length,
      },
    }
  }

  async getKudo(id: string) {
    const kudo = await this.prisma.kudo.findUnique({
      where: { id },
      include: {
        sender: { select: { id: true, username: true, display_name: true } },
        receiver: { select: { id: true, username: true, display_name: true } },
        _count: { select: { comments: true, reactions: true } },
      },
    })

    if (!kudo) {
      throw new NotFoundException('Kudo not found')
    }

    const { _count, ...rest } = kudo
    return {
      ...rest,
      comments_count: _count.comments,
      reactions_count: _count.reactions,
    }
  }

  async getTopCoreValuesThisWeek() {
    const now = new Date();
    // Start of week (Monday)
    const startOfWeek = new Date(now);
    const day = startOfWeek.getDay() || 7; // Convert Sunday (0) to 7
    startOfWeek.setHours(0, 0, 0, 0);
    startOfWeek.setDate(now.getDate() - day + 1);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const results = await this.prisma.kudo.groupBy({
      by: ['core_value'],
      where: {
        created_at: {
          gte: startOfWeek,
          lte: endOfWeek,
        },
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 3,
    });

    return results.map(r => ({
      core_value: r.core_value,
      count: r._count.id
    }));
  }
}
