import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '@/package/prisma/prisma.service';
import { NotificationsGateway } from './notifications.gateway';
import { NotificationType } from '@/generated/prisma/enums';
import { NotFoundException } from '@nestjs/common';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let prisma: PrismaService;
  let gateway: NotificationsGateway;

  const mockPrisma = {
    notification: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockGateway = {
    sendToUser: jest.fn(),
    broadcastKudo: jest.fn(),
    broadcastReaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: NotificationsGateway, useValue: mockGateway },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    prisma = module.get<PrismaService>(PrismaService);
    gateway = module.get<NotificationsGateway>(NotificationsGateway);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createNotification', () => {
    it('should create notification and push via gateway', async () => {
      const data = {
        userId: 'user-1',
        type: NotificationType.KUDO_RECEIVED,
        message: 'You got a kudo!',
        kudoId: 'kudo-1',
      };
      mockPrisma.notification.create.mockResolvedValueOnce({ id: 'noti-1', ...data });

      const result = await service.createNotification(data);

      expect(result.id).toBe('noti-1');
      expect(mockPrisma.notification.create).toHaveBeenCalled();
      expect(mockGateway.sendToUser).toHaveBeenCalledWith(data.userId, expect.objectContaining({
        type: 'kudo_received',
        message: data.message
      }));
    });
  });

  describe('getUserNotifications', () => {
    it('should return paginated notifications', async () => {
      mockPrisma.notification.findMany.mockResolvedValueOnce([{ id: '1' }]);
      mockPrisma.notification.count.mockResolvedValueOnce(1);

      const result = await service.getUserNotifications('user-1');

      expect(result.data).toHaveLength(1);
      expect(result.meta.total_items).toBe(1);
    });
  });

  describe('markAsRead', () => {
    it('should throw NotFoundException if notification not found', async () => {
      mockPrisma.notification.findUnique.mockResolvedValueOnce(null);
      await expect(service.markAsRead('user-1', 'noti-1')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if notification belongs to another user', async () => {
      mockPrisma.notification.findUnique.mockResolvedValueOnce({ id: 'noti-1', user_id: 'user-2' });
      await expect(service.markAsRead('user-1', 'noti-1')).rejects.toThrow(NotFoundException);
    });

    it('should update notification as read', async () => {
      mockPrisma.notification.findUnique.mockResolvedValueOnce({ id: 'noti-1', user_id: 'user-1' });
      mockPrisma.notification.update.mockResolvedValueOnce({ id: 'noti-1', is_read: true });

      const result = await service.markAsRead('user-1', 'noti-1');
      expect(result.is_read).toBe(true);
      expect(mockPrisma.notification.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: 'noti-1' },
        data: { is_read: true }
      }));
    });
  });

  describe('getUnreadCount', () => {
    it('should return unread count', async () => {
      mockPrisma.notification.count.mockResolvedValueOnce(5);
      const result = await service.getUnreadCount('user-1');
      expect(result).toBe(5);
    });
  });
});
