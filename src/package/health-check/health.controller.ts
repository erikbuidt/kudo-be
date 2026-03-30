import { Public } from '@/common/decorators/public.decorator';
import {
  BadGatewayException,
  BadRequestException,
  Controller,
  Get,
} from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckResult,
  HealthCheckService,
  HealthIndicatorResult,
  HttpHealthIndicator,
} from '@nestjs/terminus';
import { AxiosService } from '../axios';
import { Retry } from '@/common/decorators/retry.decorator';
import { Logger } from 'http-system-logger';
import { PrismaService } from '../prisma/prisma.service';

/**
 * https://docs.nestjs.com/recipes/terminus
 */
@Controller()
export class HealthController {
  private readonly logger = new Logger(HealthController.name);
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private prisma: PrismaService,
    private axios: AxiosService,
  ) { }

  @Public()
  @Get('health')
  @HealthCheck()
  public async executeHealthCheck(): Promise<HealthCheckResult> {
    return await this.health.check([
      async (): Promise<HealthIndicatorResult> =>
        await this.http.pingCheck('dns', 'https://1.1.1.1'),
      async (): Promise<HealthIndicatorResult> => this.checkPrismaHealth(),
    ]);
  }

  private async checkPrismaHealth(): Promise<HealthIndicatorResult> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { database: { status: 'up' } };
    } catch {
      return { database: { status: 'down' } };
    }
  }

  @Public()
  @Get('hello')
  @Retry(3, 5000, { when: { statusCode: 502 } })
  public hello(): Promise<any> {
    this.logger.info('hello');
    return this.axios.get('https://api.coursity.io.vn//api/v1/500');
  }

  @Get('500')
  @Public()
  public async error500(): Promise<void> {
    throw new Error('500');
  }

  @Get('400')
  @Public()
  public async error400(): Promise<void> {
    throw new BadRequestException();
  }

  @Get('502')
  @Public()
  public async error502(): Promise<void> {
    throw new BadGatewayException();
  }
}
