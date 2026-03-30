import { Test, TestingModule } from '@nestjs/testing';
import { ApiKeyGuard } from './api-key.guard';
import { ExecutionContext } from '@nestjs/common';

describe('ApiKeyGuard', () => {
  let guard: ApiKeyGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ApiKeyGuard],
    }).compile();

    guard = module.get<ApiKeyGuard>(ApiKeyGuard);
    process.env.CLERK_API_KEY = 'test-key';
  });

  it('should return false if apikey header is missing', () => {
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {},
        }),
      }),
    } as ExecutionContext;

    expect(guard.canActivate(mockContext)).toBe(false);
  });

  it('should return true if apikey header matches process.env.CLERK_API_KEY', () => {
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: { apikey: 'test-key' },
        }),
      }),
    } as ExecutionContext;

    expect(guard.canActivate(mockContext)).toBe(true);
  });

  it('should return false if apikey header does not match', () => {
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: { apikey: 'wrong-key' },
        }),
      }),
    } as ExecutionContext;

    expect(guard.canActivate(mockContext)).toBe(false);
  });
});
