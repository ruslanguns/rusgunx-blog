import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { HOST, PORT, DB_URI } from './shared/config';

const logger = new Logger('Bootstrap');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(PORT);
  logger.log(`Server running on ${HOST}${PORT}`, 'Bootstrap');
  logger.log(DB_URI, 'DB_URI');
}

bootstrap();