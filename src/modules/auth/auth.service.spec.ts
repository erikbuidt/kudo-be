import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '@/package/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;

  const mockPrisma = {
    user: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn(() => 'test-token'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const dto = {
      username: 'test',
      email: 'test@example.com',
      password: 'password123',
      display_name: 'Test User',
    };

    it('should throw ConflictException if user already exists', async () => {
      mockPrisma.user.findFirst.mockResolvedValueOnce({ id: '1' });
      await expect(service.register(dto)).rejects.toThrow(ConflictException);
    });

    it('should hash password and create user', async () => {
      mockPrisma.user.findFirst.mockResolvedValueOnce(null);
      (bcrypt.hash as jest.Mock).mockResolvedValueOnce('hashed-password');
      mockPrisma.user.create.mockResolvedValueOnce({ id: '1', ...dto });

      const result = await service.register(dto);

      expect(result.id).toBe('1');
      expect(bcrypt.hash).toHaveBeenCalledWith(dto.password, 10);
      expect(mockPrisma.user.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ password: 'hashed-password' })
      }));
    });
  });

  describe('login', () => {
    const dto = { email: 'test@example.com', password: 'password123' };

    it('should throw UnauthorizedException if user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce(null);
      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password does not match', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce({ id: '1', password: 'hashed' });
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);
      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });

    it('should return access_token and user on success', async () => {
      const user = { id: '1', email: dto.email, username: 'test', password: 'hashed' };
      mockPrisma.user.findUnique.mockResolvedValueOnce(user);
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);

      const result = await service.login(dto);

      expect(result.access_token).toBe('test-token');
      expect(result.user.id).toBe('1');
    });
  });

  describe('validateOAuthLogin', () => {
    const profile = { email: 'test@example.com', displayName: 'Test' };

    it('should return token if user already exists', async () => {
      const user = { id: '1', email: profile.email, username: 'test' };
      mockPrisma.user.findUnique.mockResolvedValueOnce(user);

      const result = await service.validateOAuthLogin(profile);

      expect(result.access_token).toBe('test-token');
      expect(mockPrisma.user.create).not.toHaveBeenCalled();
    });

    it('should create user if does not exist', async () => {
      mockPrisma.user.findUnique
        .mockResolvedValueOnce(null) // find by email
        .mockResolvedValueOnce(null); // find by username
      (bcrypt.hash as jest.Mock).mockResolvedValueOnce('hashed');
      mockPrisma.user.create.mockResolvedValueOnce({ id: '1', ...profile, username: 'test' });

      const result = await service.validateOAuthLogin(profile);

      expect(result.user.id).toBe('1');
      expect(mockPrisma.user.create).toHaveBeenCalled();
    });

    it('should generate unique username if base exists', async () => {
      mockPrisma.user.findUnique
        .mockResolvedValueOnce(null) // email check
        .mockResolvedValueOnce({ id: '2' }) // username exists
        .mockResolvedValueOnce(null); // username with counter 1 is free
      
      mockPrisma.user.create.mockResolvedValueOnce({ id: '1', username: 'test1' });
      (bcrypt.hash as jest.Mock).mockResolvedValueOnce('hashed');

      await service.validateOAuthLogin(profile);

      expect(mockPrisma.user.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ username: 'test1' })
      }));
    });
  });
});
