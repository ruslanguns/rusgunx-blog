import { NestFactory } from '@nestjs/core';
import 'dotenv/config';
import { join } from 'path';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { HOST, PORT, DB_URI } from './shared/config';
import { NestExpressApplication } from '@nestjs/platform-express';

const logger = new Logger('Bootstrap');

async function bootstrap() {
  // const app = await NestFactory.create(AppModule);
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useStaticAssets(join(__dirname, './files/avatars'));
  await app.useGlobalPipes(new ValidationPipe({
    transform: true,
  }));
  await app.listen(PORT);
  logger.log(`Server running on ${HOST}${PORT}`, 'Bootstrap');
  logger.log(DB_URI, 'DB_URI');
}

bootstrap();
