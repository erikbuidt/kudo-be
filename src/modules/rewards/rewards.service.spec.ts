import { Test, TestingModule } from '@nestjs/testing';
import { RewardsService } from './rewards.service';
import { PrismaService } from '@/package/prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('RewardsService', () => {
  let service: RewardsService;
  let prisma: PrismaService;

  const mockPrisma = {
    reward: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    idempotencyRecord: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    user: {
      update: jest.fn(),
    },
    redemption: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    $transaction: jest.fn((cb) => cb(mockPrisma)),
    $queryRaw: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RewardsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<RewardsService>(RewardsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return available rewards', async () => {
      mockPrisma.reward.findMany.mockResolvedValueOnce([
        { id: '1', stock: 10 },
      ]);
      const result = await service.findAll();
      expect(result).toHaveLength(1);
    });
  });

  describe('redeemReward', () => {
    const userId = 'user-1';
    const dto = { reward_id: 'reward-1' };
    const idempotencyKey = 'key-1';

    it('should throw BadRequestException if idempotency key already completed', async () => {
      mockPrisma.idempotencyRecord.findUnique.mockResolvedValueOnce({
        status: 'COMPLETED',
      });
      await expect(
        service.redeemReward(userId, dto, idempotencyKey),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if idempotency key processing', async () => {
      mockPrisma.idempotencyRecord.findUnique.mockResolvedValueOnce({
        status: 'PROCESSING',
      });
      await expect(
        service.redeemReward(userId, dto, idempotencyKey),
      ).rejects.toThrow(BadRequestException);
    });

    it('should successfully redeem reward', async () => {
      mockPrisma.idempotencyRecord.findUnique.mockResolvedValueOnce(null);
      mockPrisma.idempotencyRecord.create.mockResolvedValueOnce({});
      mockPrisma.$queryRaw.mockResolvedValueOnce([{ received_balance: 100 }]);
      mockPrisma.reward.findUnique.mockResolvedValueOnce({
        id: 'reward-1',
        point_cost: 50,
        stock: 5,
      });
      mockPrisma.redemption.create.mockResolvedValueOnce({ id: 'red-1' });
      mockPrisma.idempotencyRecord.update.mockResolvedValueOnce({});

      const result = await service.redeemReward(userId, dto, idempotencyKey);

      expect(result).toEqual({ id: 'red-1' });
      expect(mockPrisma.idempotencyRecord.create).toHaveBeenCalled();
      expect(mockPrisma.idempotencyRecord.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'COMPLETED' }),
        }),
      );
    });

    it('should throw BadRequestException if insufficient balance', async () => {
      mockPrisma.idempotencyRecord.findUnique.mockResolvedValueOnce(null);
      mockPrisma.idempotencyRecord.create.mockResolvedValueOnce({});
      mockPrisma.$queryRaw.mockResolvedValueOnce([{ received_balance: 10 }]);
      mockPrisma.reward.findUnique.mockResolvedValueOnce({
        id: 'reward-1',
        point_cost: 50,
        stock: 5,
      });
      mockPrisma.idempotencyRecord.update.mockResolvedValueOnce({});

      await expect(
        service.redeemReward(userId, dto, idempotencyKey),
      ).rejects.toThrow('Insufficient balance');
      expect(mockPrisma.idempotencyRecord.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'FAILED' }),
        }),
      );
    });

    it('should throw BadRequestException if out of stock', async () => {
      mockPrisma.idempotencyRecord.findUnique.mockResolvedValueOnce(null);
      mockPrisma.idempotencyRecord.create.mockResolvedValueOnce({});
      mockPrisma.$queryRaw.mockResolvedValueOnce([{ received_balance: 100 }]);
      mockPrisma.reward.findUnique.mockResolvedValueOnce({
        id: 'reward-1',
        point_cost: 50,
        stock: 0,
      });
      mockPrisma.idempotencyRecord.update.mockResolvedValueOnce({});

      await expect(
        service.redeemReward(userId, dto, idempotencyKey),
      ).rejects.toThrow('Reward is out of stock');
    });
  });

  describe('getMyRedemptions', () => {
    it('should return user redemptions', async () => {
      mockPrisma.redemption.findMany.mockResolvedValueOnce([{ id: '1' }]);
      const result = await service.getMyRedemptions('user-1');
      expect(result).toHaveLength(1);
    });
  });
});
