import { Test, TestingModule } from '@nestjs/testing';
import { RewardsController } from './rewards.controller';
import { RewardsService } from './rewards.service';
import { BadRequestException } from '@nestjs/common';

describe('RewardsController', () => {
  let controller: RewardsController;
  let service: RewardsService;

  const mockRewardsService = {
    findAll: jest.fn(),
    redeemReward: jest.fn(),
    getMyRedemptions: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RewardsController],
      providers: [
        { provide: RewardsService, useValue: mockRewardsService },
      ],
    }).compile();

    controller = module.get<RewardsController>(RewardsController);
    service = module.get<RewardsService>(RewardsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should call service.findAll', async () => {
      mockRewardsService.findAll.mockResolvedValueOnce([]);
      const result = await controller.findAll();
      expect(result).toEqual([]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('redeem', () => {
    const userId = 'user-1';
    const dto = { reward_id: 'reward-1' };
    const idempotencyKey = 'key-1';

    it('should throw BadRequestException if idempotency key header is missing', () => {
      expect(() => controller.redeem({ user: { id: userId } }, dto, undefined as any))
        .toThrow('X-Idempotency-Key header is required');
    });

    it('should call service.redeemReward', async () => {
      mockRewardsService.redeemReward.mockResolvedValueOnce({ id: 'red-1' });
      const result = await controller.redeem({ user: { id: userId } }, dto, idempotencyKey);
      expect(result).toEqual({ id: 'red-1' });
      expect(service.redeemReward).toHaveBeenCalledWith(userId, dto, idempotencyKey);
    });
  });

  describe('getMyRedemptions', () => {
    it('should call service.getMyRedemptions', async () => {
      const userId = 'user-1';
      mockRewardsService.getMyRedemptions.mockResolvedValueOnce([]);
      const result = await controller.getMyRedemptions({ user: { id: userId } });
      expect(result).toEqual([]);
      expect(service.getMyRedemptions).toHaveBeenCalledWith(userId);
    });
  });
});
