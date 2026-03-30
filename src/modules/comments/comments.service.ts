import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/package/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import type { CreateCommentDto } from './create-comment.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CommentCreatedEvent } from '@/common/events/kudo.events';

@Injectable()
export class CommentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async addComment(userId: string, dto: CreateCommentDto) {
    const kudo = await this.prisma.kudo.findUnique({
      where: { id: dto.kudo_id },
      select: { id: true, sender_id: true, receiver_id: true },
    });
    if (!kudo) throw new NotFoundException('Kudo not found');

    const comment = await this.prisma.comment.create({
      data: {
        content: dto.content,
        media_url: dto.media_url,
        media_type: dto.media_type,
        kudo_id: dto.kudo_id,
        user_id: userId,
      },
      include: {
        user: { select: { id: true, username: true, display_name: true } },
      },
    });

    // Emit event for background tasks
    this.eventEmitter.emit(
      'comment.created',
      new CommentCreatedEvent(
        comment.id,
        dto.kudo_id,
        userId,
        comment.content,
        comment.media_url ?? undefined,
        comment.media_type ?? undefined,
      ),
    );

    return comment;
  }

  getComments(kudoId: string) {
    return this.prisma.comment.findMany({
      where: { kudo_id: kudoId },
      orderBy: { created_at: 'asc' },
      include: {
        user: { select: { id: true, username: true, display_name: true } },
      },
    });
  }
}
