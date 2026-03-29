import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AppInterceptor } from '@/common/interceptors/app.interceptor';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { RedisIoAdapter } from '@/common/adapters/redis-io.adapter';
import { httpLogger } from "http-system-logger"
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Redis WebSocket adapter for Pub/Sub
  const redisIoAdapter = new RedisIoAdapter(app);
  await redisIoAdapter.connectToRedis();
  app.useWebSocketAdapter(redisIoAdapter);

  app.enableCors({
    origin: process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : true,
    credentials: true,
  });

  app.use(httpLogger)


  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalInterceptors(new AppInterceptor());

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Kudo — Peer Recognition API')
    .setDescription('Backend API for the Kudo peer recognition and rewards platform')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header' },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  await app.listen(process.env.APP_PORT ?? 3000);
}
bootstrap();
