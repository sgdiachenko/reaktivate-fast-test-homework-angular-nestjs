import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  app.enableCors({ origin: config.get('CORS_ORIGIN', 'http://localhost:4200') });
  await app.listen(config.get('PORT', 3000));
}
await bootstrap();
