import { Test, TestingModule } from '@nestjs/testing';
import { SchedulerService } from './scheduler.service';
import { PrismaService } from '@/package/prisma/prisma.service';

describe('SchedulerService', () => {
  let service: SchedulerService;
  let prisma: PrismaService;

  const mockPrisma = {
    user: {
      updateMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SchedulerService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<SchedulerService>(SchedulerService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('resetGivingBudgets', () => {
    it('should reset giving budgets for all users', async () => {
      mockPrisma.user.updateMany.mockResolvedValueOnce({ count: 10 });

      await service.resetGivingBudgets();

      expect(mockPrisma.user.updateMany).toHaveBeenCalledWith({
        data: { giving_budget: 200 },
      });
    });
  });
});
