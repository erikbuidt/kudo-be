import { Test, TestingModule } from '@nestjs/testing';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';

describe('MediaController', () => {
  let controller: MediaController;
  let service: MediaService;

  const mockMediaService = {
    getPresignedUrl: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MediaController],
      providers: [{ provide: MediaService, useValue: mockMediaService }],
    }).compile();

    controller = module.get<MediaController>(MediaController);
    service = module.get<MediaService>(MediaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getPresignedUrl', () => {
    it('should call service.getPresignedUrl', async () => {
      const query = { filename: 'test.png' };
      mockMediaService.getPresignedUrl.mockResolvedValueOnce({
        presigned_url: 'url',
      });

      const result = await controller.getPresignedUrl(query);

      expect(result).toEqual({ presigned_url: 'url' });
      expect(service.getPresignedUrl).toHaveBeenCalledWith(query.filename);
    });
  });
});
