import { ConfigService } from '@nestjs/config';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import * as Minio from 'minio';
import { extname } from 'path';
import { MediaType } from '@/generated/prisma/enums';
import { MinioOptions } from '@/common/interfaces/common.interface';

@Injectable()
export class MediaService {
  private readonly minioClient: Minio.Client;
  private readonly bucketName: string;
  private readonly logger = new Logger(MediaService.name);

  constructor(private readonly configService: ConfigService) {
    const minioConfig = this.configService.get('minio') as MinioOptions;

    // We always use the internal endpoint for backend tasks (ensureBucketExists, etc.)
    // because the public ngrok URL might not be reachable from inside the container.
    this.minioClient = new Minio.Client({
      endPoint: minioConfig.endPoint, // "minio"
      port: minioConfig.port, // 9000
      useSSL: minioConfig.useSSL,
      accessKey: minioConfig.accessKey,
      secretKey: minioConfig.secretKey,
      region: 'us-east-1',
    });

    this.bucketName = minioConfig.bucketName;
    this.ensureBucketExists();
  }

  private async ensureBucketExists() {
    try {
      const exists = await this.minioClient.bucketExists(this.bucketName);
      if (!exists) {
        await this.minioClient.makeBucket(this.bucketName, 'us-east-1');
        this.logger.log(`Bucket '${this.bucketName}' created`);
      }

      // Always ensure the bucket has public read policy
      const policy = {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: { AWS: ['*'] },
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${this.bucketName}/*`],
          },
        ],
      };
      await this.minioClient.setBucketPolicy(
        this.bucketName,
        JSON.stringify(policy),
      );
      this.logger.log(`Bucket '${this.bucketName}' set to public read`);
    } catch (error) {
      this.logger.error(
        `Error ensuring bucket exists: ${(error as Error).message}`,
      );
    }
  }

  async getPresignedUrl(filename: string) {
    const ext = extname(filename).toLowerCase();
    let mediaType: MediaType;

    if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'].includes(ext)) {
      mediaType = 'IMAGE' as MediaType;
    } else if (['.mp4', '.mov', '.avi', '.webm', '.mkv'].includes(ext)) {
      mediaType = 'VIDEO' as MediaType;
    } else {
      throw new BadRequestException(
        `Unsupported file extension: ${ext || 'none'}. Allowed image/video formats only.`,
      );
    }

    const objectName = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    // Generate URL valid for 60 minutes (3600 seconds)
    const minioConfig = this.configService.get('minio') as MinioOptions;

    // To make presigned URLs work over ngrok, we MUST sign using the public hostname.
    let signingClient = this.minioClient;
    if (minioConfig.publicUrl && minioConfig.publicUrl.startsWith('http')) {
      try {
        const url = new URL(minioConfig.publicUrl);
        signingClient = new Minio.Client({
          endPoint: url.hostname,
          port: url.port
            ? parseInt(url.port)
            : url.protocol === 'https:'
              ? 443
              : 80,
          useSSL: url.protocol === 'https:',
          accessKey: minioConfig.accessKey,
          secretKey: minioConfig.secretKey,
          region: 'us-east-1',
        });
      } catch (e) {
        this.logger.error(
          `Invalid public URL for signing: ${minioConfig.publicUrl}`,
        );
      }
    }

    const presignedUrl = await signingClient.presignedPutObject(
      this.bucketName,
      objectName,
      3600,
    );

    const protocol = minioConfig.useSSL ? 'https' : 'http';
    const internalBaseUrl = `${protocol}://${minioConfig.endPoint}:${minioConfig.port}`;

    // For the final URL, use the public URL if it exists (e.g. https://ngrok.app)
    const publicBaseUrl = minioConfig.publicUrl || internalBaseUrl;
    const publicUrl = `${publicBaseUrl}/${this.bucketName}/${objectName}`;

    return {
      presigned_url: presignedUrl,
      media_url: publicUrl,
      media_type: mediaType,
    };
  }
}
