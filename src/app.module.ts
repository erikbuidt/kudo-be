import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthModule } from './package/health-check/health.module';
import { ConfigModule } from '@nestjs/config';
import { configuration } from './config/configuration';
import { PrismaModule } from './package/prisma/prisma.module';
import { LoggerModule } from './package/logger/logger.module';

@Module({
  imports: [HealthModule, ConfigModule.forRoot({
    isGlobal: true,
    cache: true,
    expandVariables: true,
    envFilePath: [".env"],
    load: [configuration],
  }),
    PrismaModule,
    LoggerModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
