import { ConfigService } from '@nestjs/config';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import * as Minio from 'minio';
import { extname } from 'path';
import { MediaType } from '@/generated/prisma/enums';

@Injectable()
export class MediaService {
  private readonly minioClient: Minio.Client;
  private readonly bucketName: string;
  private readonly logger = new Logger(MediaService.name);

  constructor(private readonly configService: ConfigService) {
    const minioConfig = this.configService.get('minio') as {
      endPoint: string;
      port: number;
      accessKey: string;
      secretKey: string;
      useSSL: boolean;
      bucketName: string;
    };
    
    this.minioClient = new Minio.Client({
      endPoint: minioConfig.endPoint,
      port: minioConfig.port,
      useSSL: minioConfig.useSSL,
      accessKey: minioConfig.accessKey,
      secretKey: minioConfig.secretKey,
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
      await this.minioClient.setBucketPolicy(this.bucketName, JSON.stringify(policy));
      this.logger.log(`Bucket '${this.bucketName}' set to public read`);
    } catch (error) {
      this.logger.error(`Error ensuring bucket exists: ${(error as Error).message}`);
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
      throw new BadRequestException(`Unsupported file extension: ${ext || 'none'}. Allowed image/video formats only.`);
    }

    const objectName = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    
    // Generate URL valid for 60 minutes (3600 seconds)
    const presignedUrl = await this.minioClient.presignedPutObject(this.bucketName, objectName, 3600);
    
    const minioConfig = this.configService.get('minio') as any;
    const protocol = minioConfig.useSSL ? 'https' : 'http';
    const publicUrl = `${protocol}://${minioConfig.endPoint}:${minioConfig.port}/${this.bucketName}/${objectName}`;
    
    return {
      presigned_url: presignedUrl,
      media_url: publicUrl,
      media_type: mediaType,
    };
  }
}
