import { Test, TestingModule } from '@nestjs/testing';
import { KudosController } from './kudos.controller';
import { KudosService } from './kudos.service';
import { CoreValue } from '@/generated/prisma/enums';

describe('KudosController', () => {
  let controller: KudosController;
  let service: KudosService;

  const mockKudosService = {
    createKudo: jest.fn(),
    getFeed: jest.fn(),
    getTopCoreValuesThisWeek: jest.fn(),
    getKudo: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KudosController],
      providers: [{ provide: KudosService, useValue: mockKudosService }],
    }).compile();

    controller = module.get<KudosController>(KudosController);
    service = module.get<KudosService>(KudosService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createKudo', () => {
    it('should call service.createKudo with user id and dto', async () => {
      const userId = 'user-1';
      const dto = {
        receiver_id: 'receiver-1',
        points: 10,
        description: 'Great!',
        core_value: CoreValue.TEAMWORK,
      };
      mockKudosService.createKudo.mockResolvedValueOnce({ id: 'kudo-1' });

      const result = await controller.createKudo({ user: { id: userId } }, dto);

      expect(result).toEqual({ id: 'kudo-1' });
      expect(service.createKudo).toHaveBeenCalledWith(userId, dto);
    });
  });

  describe('getFeed', () => {
    it('should call service.getFeed with query and user id', async () => {
      const query = { page: 1, limit: 10 };
      const userId = 'user-1';
      mockKudosService.getFeed.mockResolvedValueOnce({ data: [], meta: {} });

      const result = await controller.getFeed({ user: { id: userId } }, query);

      expect(result).toEqual({ data: [], meta: {} });
      expect(service.getFeed).toHaveBeenCalledWith(query, userId);
    });

    it('should call service.getFeed even if user is not logged in', async () => {
      const query = { page: 1, limit: 10 };
      mockKudosService.getFeed.mockResolvedValueOnce({ data: [], meta: {} });

      const result = await controller.getFeed({ user: undefined }, query);

      expect(result).toEqual({ data: [], meta: {} });
      expect(service.getFeed).toHaveBeenCalledWith(query, undefined);
    });
  });

  describe('getTopCoreValuesThisWeek', () => {
    it('should call service.getTopCoreValuesThisWeek', async () => {
      mockKudosService.getTopCoreValuesThisWeek.mockResolvedValueOnce([]);
      const result = await controller.getTopCoreValuesThisWeek();
      expect(result).toEqual([]);
      expect(service.getTopCoreValuesThisWeek).toHaveBeenCalled();
    });
  });

  describe('getKudo', () => {
    it('should call service.getKudo with id and user id', async () => {
      const id = 'kudo-1';
      const userId = 'user-1';
      mockKudosService.getKudo.mockResolvedValueOnce({ id });

      const result = await controller.getKudo({ user: { id: userId } }, id);

      expect(result).toEqual({ id });
      expect(service.getKudo).toHaveBeenCalledWith(id, userId);
    });
  });
});
