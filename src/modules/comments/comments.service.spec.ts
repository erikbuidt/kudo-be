import { Test, TestingModule } from '@nestjs/testing';
import { CommentsService } from './comments.service';
import { PrismaService } from '@/package/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotFoundException } from '@nestjs/common';

describe('CommentsService', () => {
  let service: CommentsService;
  let prisma: PrismaService;
  let eventEmitter: EventEmitter2;

  const mockPrisma = {
    kudo: {
      findUnique: jest.fn(),
    },
    comment: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  };

  const mockNotificationsService = {};
  const mockEventEmitter = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: NotificationsService, useValue: mockNotificationsService },
        { provide: EventEmitter2, useValue: mockEventEmitter },
      ],
    }).compile();

    service = module.get<CommentsService>(CommentsService);
    prisma = module.get<PrismaService>(PrismaService);
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('addComment', () => {
    const userId = 'user-1';
    const dto = { kudo_id: 'kudo-1', content: 'Nice!' };

    it('should throw NotFoundException if kudo not found', async () => {
      mockPrisma.kudo.findUnique.mockResolvedValueOnce(null);
      await expect(service.addComment(userId, dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should create comment and emit event', async () => {
      mockPrisma.kudo.findUnique.mockResolvedValueOnce({ id: 'kudo-1' });
      mockPrisma.comment.create.mockResolvedValueOnce({
        id: 'comment-1',
        content: 'Nice!',
      });

      const result = await service.addComment(userId, dto);

      expect(result.id).toBe('comment-1');
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'comment.created',
        expect.any(Object),
      );
    });
  });

  describe('getComments', () => {
    it('should return comments for a kudo', async () => {
      mockPrisma.comment.findMany.mockResolvedValueOnce([{ id: '1' }]);
      const result = await service.getComments('kudo-1');
      expect(result).toHaveLength(1);
    });
  });
});
