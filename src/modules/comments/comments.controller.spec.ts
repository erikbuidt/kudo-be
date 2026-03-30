import { Test, TestingModule } from '@nestjs/testing';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';

describe('CommentsController', () => {
  let controller: CommentsController;
  let service: CommentsService;

  const mockCommentsService = {
    addComment: jest.fn(),
    getComments: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentsController],
      providers: [{ provide: CommentsService, useValue: mockCommentsService }],
    }).compile();

    controller = module.get<CommentsController>(CommentsController);
    service = module.get<CommentsService>(CommentsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('addComment', () => {
    it('should call service.addComment', async () => {
      const userId = 'user-1';
      const dto = { kudo_id: 'kudo-1', content: 'Nice!' };
      mockCommentsService.addComment.mockResolvedValueOnce({ id: 'comment-1' });

      const result = await controller.addComment({ user: { id: userId } }, dto);

      expect(result).toEqual({ id: 'comment-1' });
      expect(service.addComment).toHaveBeenCalledWith(userId, dto);
    });
  });

  describe('getComments', () => {
    it('should call service.getComments', async () => {
      const kudoId = 'kudo-1';
      mockCommentsService.getComments.mockResolvedValueOnce([]);

      const result = await controller.getComments(kudoId);

      expect(result).toEqual([]);
      expect(service.getComments).toHaveBeenCalledWith(kudoId);
    });
  });
});
