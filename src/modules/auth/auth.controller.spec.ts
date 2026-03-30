import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    logout: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should call service.register', async () => {
      const dto = { username: 'test', email: 'test@example.com', password: '123' } as any;
      mockAuthService.register.mockResolvedValueOnce({ id: '1' });
      const result = await controller.register(dto);
      expect(result).toEqual({ id: '1' });
      expect(service.register).toHaveBeenCalledWith(dto);
    });
  });

  describe('login', () => {
    it('should call service.login', async () => {
      const dto = { email: 'test@example.com', password: '123' } as any;
      mockAuthService.login.mockResolvedValueOnce({ access_token: 'token' });
      const result = await controller.login(dto);
      expect(result).toEqual({ access_token: 'token' });
      expect(service.login).toHaveBeenCalledWith(dto);
    });
  });

  describe('logout', () => {
    it('should call service.logout', async () => {
      mockAuthService.logout.mockResolvedValueOnce(true);
      const result = await controller.logout();
      expect(result).toBe(true);
      expect(service.logout).toHaveBeenCalled();
    });
  });

  describe('googleAuthRedirect', () => {
    it('should redirect back to frontend with access_token', async () => {
      const req = { user: { access_token: 'token' } };
      const res = { redirect: jest.fn() };
      
      controller.googleAuthRedirect(req, res);

      expect(res.redirect).toHaveBeenCalledWith(expect.stringContaining('access_token=token'));
    });
  });
});
