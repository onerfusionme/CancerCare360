// Load env vars BEFORE any imports that might trigger Prisma client initialization
import * as dotenv from 'dotenv';
dotenv.config();

// Ensure Prisma BigInt fields serialize smoothly to JSON across all endpoints
(BigInt.prototype as any).toJSON = function () {
  return Number(this);
};

import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import * as compression from 'compression';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  
  // Logger
  app.useLogger(app.get(Logger));

  // Security
  app.use(
    helmet({
      contentSecurityPolicy: false,
      frameguard: false,
      crossOriginResourcePolicy: false,
      crossOriginOpenerPolicy: false,
    }),
  );
  app.enableCors();
  app.use(compression());

  // Versioning and Prefix
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('CancerCare360 API')
    .setDescription('The core API for CancerCare360 SaaS Platform')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('port', 3001);
  
  await app.listen(port, '0.0.0.0');
}
bootstrap();
