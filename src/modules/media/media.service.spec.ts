import { Test, TestingModule } from '@nestjs/testing';
import { MediaService } from './media.service';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import { BadRequestException } from '@nestjs/common';

jest.mock('minio', () => {
  return {
    Client: jest.fn().mockImplementation(() => ({
      bucketExists: jest.fn().mockResolvedValue(true),
      makeBucket: jest.fn().mockResolvedValue(true),
      setBucketPolicy: jest.fn().mockResolvedValue(true),
      presignedPutObject: jest
        .fn()
        .mockResolvedValue('http://mock-presigned-url'),
    })),
  };
});

describe('MediaService', () => {
  let service: MediaService;
  let configService: ConfigService;

  const mockMinioConfig = {
    endPoint: 'localhost',
    port: 9000,
    useSSL: false,
    accessKey: 'key',
    secretKey: 'secret',
    bucketName: 'kudo-bucket',
    publicUrl: 'http://public-minio',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MediaService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue(mockMinioConfig),
          },
        },
      ],
    }).compile();

    service = module.get<MediaService>(MediaService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getPresignedUrl', () => {
    it('should return presigned url for image', async () => {
      const result = await service.getPresignedUrl('test.png');
      expect(result.media_type).toBe('IMAGE');
      expect(result.presigned_url).toBe('http://mock-presigned-url');
      expect(result.media_url).toContain('kudo-bucket');
    });

    it('should return presigned url for video', async () => {
      const result = await service.getPresignedUrl('test.mp4');
      expect(result.media_type).toBe('VIDEO');
    });

    it('should throw BadRequestException for unsupported extension', async () => {
      await expect(service.getPresignedUrl('test.txt')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
