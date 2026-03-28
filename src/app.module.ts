import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { ConfigModule } from '@nestjs/config'
import { ScheduleModule } from '@nestjs/schedule'
import { configuration } from './config/configuration'

// Infrastructure
import { PrismaModule } from './package/prisma/prisma.module'
import { LoggerModule } from './package/logger/logger.module'
import { AxiosModule } from './package/axios/axios.module'
import { HealthModule } from './package/health-check/health.module'

// Feature Modules
import { AuthModule } from './modules/auth/auth.module'
import { UsersModule } from './modules/users/users.module'
import { KudosModule } from './modules/kudos/kudos.module'
import { RewardsModule } from './modules/rewards/rewards.module'
import { SchedulerModule } from './modules/scheduler/scheduler.module'
import { NotificationsModule } from './modules/notifications/notifications.module'
import { CommentsModule } from './modules/comments/comments.module'
import { ReactionsModule } from './modules/reactions/reactions.module'
import { MediaModule } from './modules/media/media.module'

// Guards
import { JwtAuthGuard } from './common/guards/jwt-auth.guard'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      expandVariables: true,
      envFilePath: ['.env'],
      load: [configuration],
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
    NotificationsModule,  // Global — must come before modules that inject it
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
  ],
})
export class AppModule { }
