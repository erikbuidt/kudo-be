import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

describe('NotificationsController', () => {
  let controller: NotificationsController;
  let service: NotificationsService;

  const mockNotificationsService = {
    getUserNotifications: jest.fn(),
    getUnreadCount: jest.fn(),
    markAsRead: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        { provide: NotificationsService, useValue: mockNotificationsService },
      ],
    }).compile();

    controller = module.get<NotificationsController>(NotificationsController);
    service = module.get<NotificationsService>(NotificationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserNotifications', () => {
    it('should call service.getUserNotifications with parsed query params', async () => {
      const userId = 'user-1';
      mockNotificationsService.getUserNotifications.mockResolvedValueOnce({
        data: [],
        meta: {},
      });

      const result = await controller.getUserNotifications(
        { user: { id: userId } },
        '10',
        '2',
      );

      expect(result).toEqual({ data: [], meta: {} });
      expect(service.getUserNotifications).toHaveBeenCalledWith(userId, 10, 2);
    });

    it('should use default values if query params are missing', async () => {
      const userId = 'user-1';
      mockNotificationsService.getUserNotifications.mockResolvedValueOnce({
        data: [],
        meta: {},
      });

      await controller.getUserNotifications(
        { user: { id: userId } },
        undefined,
        undefined,
      );

      expect(service.getUserNotifications).toHaveBeenCalledWith(userId, 5, 1);
    });
  });

  describe('getUnreadCount', () => {
    it('should call service.getUnreadCount', async () => {
      const userId = 'user-1';
      mockNotificationsService.getUnreadCount.mockResolvedValueOnce(5);
      const result = await controller.getUnreadCount({ user: { id: userId } });
      expect(result).toBe(5);
      expect(service.getUnreadCount).toHaveBeenCalledWith(userId);
    });
  });

  describe('markAsRead', () => {
    it('should call service.markAsRead', async () => {
      const userId = 'user-1';
      const notiId = 'noti-1';
      mockNotificationsService.markAsRead.mockResolvedValueOnce({
        id: notiId,
        is_read: true,
      });

      const result = await controller.markAsRead(
        { user: { id: userId } },
        notiId,
      );

      expect(result).toEqual({ id: notiId, is_read: true });
      expect(service.markAsRead).toHaveBeenCalledWith(userId, notiId);
    });
  });
});
