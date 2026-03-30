import { MediaType } from '@/generated/prisma/client';

export class CommentCreatedEvent {
  constructor(
    public readonly commentId: string,
    public readonly kudoId: string,
    public readonly userId: string,
    public readonly content: string,
    public readonly mediaUrl?: string,
    public readonly mediaType?: MediaType,
  ) {}
}

export class KudoCreatedEvent {
  constructor(
    public readonly kudoId: string,
    public readonly senderId: string,
    public readonly receiverId: string,
    public readonly points: number,
  ) {}
}

export class ReactionToggledEvent {
  constructor(
    public readonly kudoId: string,
    public readonly userId: string,
    public readonly emoji: string,
    public readonly isAdded: boolean,
  ) {}
}
