import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as fs from 'fs';

async function bootstrap() {
  const httpsOptions = {
    key: fs.readFileSync('/etc/letsencrypt/archive/lucascriado.com/privkey2.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/archive/lucascriado.com/fullchain2.pem')
  };

  const app = await NestFactory.create(AppModule, { httpsOptions });

  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
  }));

  await app.listen(3001);
  console.log(`Application is running on: https://localhost:3001/`);
}

bootstrap();