import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module.js';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // CORS — allow the explorer (Next.js dev server) and any local frontend
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // Global exception filter — structured JSON errors, never raw stack traces
  app.useGlobalFilters(new GlobalExceptionFilter());

  const port = process.env.PORT ?? 5000;
  await app.listen(port, '0.0.0.0');
  logger.log(`ANIMA backend listening on http://localhost:${port}`);
}
bootstrap();
