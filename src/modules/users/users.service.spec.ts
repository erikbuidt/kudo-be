import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '@/package/prisma/prisma.service';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should return a user by id', async () => {
      const mockUser = { id: '1', username: 'test' };
      mockPrisma.user.findUnique.mockResolvedValueOnce(mockUser);

      const result = await service.findById('1');
      expect(result).toEqual(mockUser);
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: '1' },
        }),
      );
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      const mockUser = { id: '1', email: 'test@example.com' };
      mockPrisma.user.findUnique.mockResolvedValueOnce(mockUser);

      const result = await service.findByEmail('test@example.com');
      expect(result).toEqual(mockUser);
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const mockUsers = [{ id: '1' }, { id: '2' }];
      mockPrisma.user.findMany.mockResolvedValueOnce(mockUsers);

      const result = await service.findAll();
      expect(result).toEqual(mockUsers);
    });
  });

  describe('findMe', () => {
    it('should return current user', async () => {
      const mockUser = { id: '1', username: 'me' };
      mockPrisma.user.findUnique.mockResolvedValueOnce(mockUser);

      const result = await service.findMe({ id: '1' });
      expect(result).toEqual(mockUser);
    });
  });
});
