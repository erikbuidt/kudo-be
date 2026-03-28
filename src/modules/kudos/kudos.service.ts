import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '@/package/prisma/prisma.service'
import type { CreateKudoDto, FeedQueryDto } from './create-kudo.dto'

@Injectable()
export class KudosService {
  constructor(private readonly prisma: PrismaService) {}

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

    return kudo
  }

  async getFeed(query: FeedQueryDto) {
    const page = query.page ?? 1
    const limit = query.limit ?? 10
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
}
