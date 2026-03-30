import { Test, TestingModule } from '@nestjs/testing';
import { ReactionsService } from './reactions.service';
import { PrismaService } from '@/package/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotFoundException } from '@nestjs/common';

describe('ReactionsService', () => {
  let service: ReactionsService;
  let prisma: PrismaService;
  let eventEmitter: EventEmitter2;

  const mockPrisma = {
    kudo: {
      findUnique: jest.fn(),
    },
    reaction: {
      findUnique: jest.fn(),
      delete: jest.fn(),
      create: jest.fn(),
      groupBy: jest.fn(),
    },
  };

  const mockNotificationsService = {};
  const mockEventEmitter = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReactionsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: NotificationsService, useValue: mockNotificationsService },
        { provide: EventEmitter2, useValue: mockEventEmitter },
      ],
    }).compile();

    service = module.get<ReactionsService>(ReactionsService);
    prisma = module.get<PrismaService>(PrismaService);
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('toggleReaction', () => {
    const userId = 'user-1';
    const dto = { kudo_id: 'kudo-1', emoji: '👍' };

    it('should throw NotFoundException if kudo not found', async () => {
      mockPrisma.kudo.findUnique.mockResolvedValueOnce(null);
      await expect(service.toggleReaction(userId, dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should remove reaction if it already exists', async () => {
      mockPrisma.kudo.findUnique.mockResolvedValueOnce({ id: 'kudo-1' });
      mockPrisma.reaction.findUnique.mockResolvedValueOnce({
        id: 'reaction-1',
      });

      const result = await service.toggleReaction(userId, dto);

      expect(result.action).toBe('removed');
      expect(mockPrisma.reaction.delete).toHaveBeenCalled();
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'reaction.toggled',
        expect.any(Object),
      );
    });

    it('should add reaction if it does not exist', async () => {
      mockPrisma.kudo.findUnique.mockResolvedValueOnce({ id: 'kudo-1' });
      mockPrisma.reaction.findUnique.mockResolvedValueOnce(null);
      mockPrisma.reaction.create.mockResolvedValueOnce({
        id: 'reaction-1',
        emoji: '👍',
      });

      const result = await service.toggleReaction(userId, dto);

      expect(result.action).toBe('added');
      expect(mockPrisma.reaction.create).toHaveBeenCalled();
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'reaction.toggled',
        expect.any(Object),
      );
    });
  });

  describe('getReactionSummary', () => {
    it('should return grouped reactions', async () => {
      mockPrisma.reaction.groupBy.mockResolvedValueOnce([
        { emoji: '👍', _count: { emoji: 5 } },
      ]);
      const result = await service.getReactionSummary('kudo-1');
      expect(result).toHaveLength(1);
      expect(result[0].emoji).toBe('👍');
    });
  });
});
