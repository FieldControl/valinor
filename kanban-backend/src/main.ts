import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  
  app.enableCors();

  // Ativa a validação automática dos DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // remove campos que não existem no DTO
      forbidNonWhitelisted: true, // erro se mandar campo extra
      transform: true, // transforma tipos automaticamente
    }),
  );

  await app.listen(3000);
}

bootstrap();
