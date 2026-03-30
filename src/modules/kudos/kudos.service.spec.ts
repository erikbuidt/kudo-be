import { Test, TestingModule } from '@nestjs/testing';
import { KudosService } from './kudos.service';
import { PrismaService } from '@/package/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { CoreValue } from '@/generated/prisma/enums';

describe('KudosService', () => {
  let service: KudosService;
  let prisma: PrismaService;
  let eventEmitter: EventEmitter2;

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    kudo: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      groupBy: jest.fn(),
    },
    $transaction: jest.fn((cb) => cb(mockPrisma)),
  };

  const mockNotificationsService = {};
  const mockEventEmitter = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KudosService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: NotificationsService, useValue: mockNotificationsService },
        { provide: EventEmitter2, useValue: mockEventEmitter },
      ],
    }).compile();

    service = module.get<KudosService>(KudosService);
    prisma = module.get<PrismaService>(PrismaService);
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createKudo', () => {
    const senderId = 'sender-1';
    const dto = {
      receiver_id: 'receiver-1',
      points: 10,
      description: 'Great job!',
      core_value: CoreValue.TEAMWORK,
    };

    it('should throw BadRequestException if sender is receiver', async () => {
      await expect(
        service.createKudo(senderId, { ...dto, receiver_id: senderId }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if sender not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce(null);
      await expect(service.createKudo(senderId, dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if receiver not found', async () => {
      mockPrisma.user.findUnique
        .mockResolvedValueOnce({ id: senderId, giving_budget: 100 }) // sender
        .mockResolvedValueOnce(null); // receiver
      await expect(service.createKudo(senderId, dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if insufficient budget', async () => {
      mockPrisma.user.findUnique
        .mockResolvedValueOnce({ id: senderId, giving_budget: 5 }) // sender
        .mockResolvedValueOnce({ id: dto.receiver_id }); // receiver
      await expect(service.createKudo(senderId, dto)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should create kudo and emit event', async () => {
      const mockKudo = { id: 'kudo-1', ...dto, sender_id: senderId };
      mockPrisma.user.findUnique
        .mockResolvedValueOnce({ id: senderId, giving_budget: 100 })
        .mockResolvedValueOnce({ id: dto.receiver_id });
      mockPrisma.kudo.create.mockResolvedValueOnce(mockKudo);

      const result = await service.createKudo(senderId, dto);

      expect(result).toEqual(mockKudo);
      expect(mockPrisma.user.update).toHaveBeenCalledTimes(2);
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'kudo.created',
        expect.any(Object),
      );
    });
  });

  describe('getFeed', () => {
    it('should return paginated feed', async () => {
      const query = { page: 1, limit: 10 };
      const mockKudos = [
        {
          id: '1',
          points: 10,
          description: 'test',
          _count: { comments: 0, reactions: 0 },
          sender: { id: 's1', username: 'u1' },
          receiver: { id: 'r1', username: 'u2' },
          reactions: [],
        },
      ];
      mockPrisma.kudo.findMany.mockResolvedValueOnce(mockKudos);
      mockPrisma.kudo.count.mockResolvedValueOnce(1);

      const result = await service.getFeed(query);

      expect(result.data).toHaveLength(1);
      expect(result.meta.total_items).toBe(1);
    });

    it('should return paginated feed with userId', async () => {
      const query = { page: 1, limit: 10 };
      const userId = 'user-1';
      const mockKudos = [
        {
          id: '1',
          points: 10,
          description: 'test',
          _count: { comments: 0, reactions: 1 },
          sender: { id: 's1', username: 'u1' },
          receiver: { id: 'r1', username: 'u2' },
          reactions: [{ id: 're-1' }],
        },
      ];
      mockPrisma.kudo.findMany.mockResolvedValueOnce(mockKudos);
      mockPrisma.kudo.count.mockResolvedValueOnce(1);

      const result = await service.getFeed(query, userId);

      expect(result.data).toHaveLength(1);
      expect(result.data[0].is_reacted).toBe(true);
      expect(mockPrisma.kudo.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            reactions: expect.any(Object),
          }),
        }),
      );
    });
  });

  describe('getKudo', () => {
    it('should return a kudo', async () => {
      const mockKudo = {
        id: '1',
        _count: { comments: 1, reactions: 2 },
        reactions: [],
      };
      mockPrisma.kudo.findUnique.mockResolvedValueOnce(mockKudo);

      const result = await service.getKudo('1');
      expect(result.id).toBe('1');
      expect(result.comments_count).toBe(1);
    });

    it('should throw NotFoundException if kudo not found', async () => {
      mockPrisma.kudo.findUnique.mockResolvedValueOnce(null);
      await expect(service.getKudo('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getTopCoreValuesThisWeek', () => {
    it('should return top core values', async () => {
      const mockResults = [
        { core_value: 'Teamwork', _count: { id: 5 } },
        { core_value: 'Integrity', _count: { id: 3 } },
      ];
      mockPrisma.kudo.groupBy.mockResolvedValueOnce(mockResults);

      const result = await service.getTopCoreValuesThisWeek();

      expect(result).toHaveLength(2);
      expect(result[0].core_value).toBe('Teamwork');
      expect(result[0].count).toBe(5);
    });
  });
});
