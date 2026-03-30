import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { configuration } from './config/configuration';

// Infrastructure
import { PrismaModule } from './package/prisma/prisma.module';
import { LoggerModule } from './package/logger/logger.module';
import { AxiosModule } from './package/axios/axios.module';
import { HealthModule } from './package/health-check/health.module';

// Feature Modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { KudosModule } from './modules/kudos/kudos.module';
import { RewardsModule } from './modules/rewards/rewards.module';
import { SchedulerModule } from './modules/scheduler/scheduler.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { CommentsModule } from './modules/comments/comments.module';
import { ReactionsModule } from './modules/reactions/reactions.module';
import { MediaModule } from './modules/media/media.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { BullModule } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';

// Guards
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';

import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      expandVariables: true,
      envFilePath: ['.env'],
      load: [configuration],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    EventEmitterModule.forRoot(),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('redis.host'),
          port: configService.get<number>('redis.port'),
          password: configService.get<string>('redis.password'),
        },
      }),
    }),
    ScheduleModule.forRoot(),

    // Infrastructure
    PrismaModule,
    LoggerModule,
    AxiosModule,
    HealthModule,

    // Feature Modules
    AuthModule,
    UsersModule,
    NotificationsModule, // Global — must come before modules that inject it
    KudosModule,
    RewardsModule,
    SchedulerModule,
    CommentsModule,
    ReactionsModule,
    MediaModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
