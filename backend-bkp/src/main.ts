// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Se tiver prefixo global 'api'
  app.setGlobalPrefix('api');

  // CORS para Angular
  app.enableCors({
    origin: 'http://localhost:4200',
    credentials: true,
  });

  await app.listen(3000);
}
bootstrap();