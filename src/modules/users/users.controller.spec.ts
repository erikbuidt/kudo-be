import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUsersService = {
    findAll: jest.fn(),
    findMe: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should call service.findAll', async () => {
      mockUsersService.findAll.mockResolvedValueOnce([]);
      const result = await controller.findAll();
      expect(result).toEqual([]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findMe', () => {
    it('should call service.findMe with user', async () => {
      const user = { id: '1' };
      mockUsersService.findMe.mockResolvedValueOnce(user);
      const result = await controller.findMe(user);
      expect(result).toEqual(user);
      expect(service.findMe).toHaveBeenCalledWith(user);
    });
  });
});
