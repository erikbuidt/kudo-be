import { Test, TestingModule } from '@nestjs/testing';
import { ReactionsController } from './reactions.controller';
import { ReactionsService } from './reactions.service';

describe('ReactionsController', () => {
  let controller: ReactionsController;
  let service: ReactionsService;

  const mockReactionsService = {
    toggleReaction: jest.fn(),
    getReactionSummary: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReactionsController],
      providers: [
        { provide: ReactionsService, useValue: mockReactionsService },
      ],
    }).compile();

    controller = module.get<ReactionsController>(ReactionsController);
    service = module.get<ReactionsService>(ReactionsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('toggle', () => {
    it('should call service.toggleReaction', async () => {
      const userId = 'user-1';
      const dto = { kudo_id: 'kudo-1', emoji: '👍' };
      mockReactionsService.toggleReaction.mockResolvedValueOnce({
        action: 'added',
      });

      const result = await controller.toggle({ user: { id: userId } }, dto);

      expect(result).toEqual({ action: 'added' });
      expect(service.toggleReaction).toHaveBeenCalledWith(userId, dto);
    });
  });

  describe('summary', () => {
    it('should call service.getReactionSummary', async () => {
      const kudoId = 'kudo-1';
      mockReactionsService.getReactionSummary.mockResolvedValueOnce([]);

      const result = await controller.summary(kudoId);

      expect(result).toEqual([]);
      expect(service.getReactionSummary).toHaveBeenCalledWith(kudoId);
    });
  });
});
