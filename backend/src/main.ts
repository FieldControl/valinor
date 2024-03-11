import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin:"http://localhost:4200",
    methods: "GET,POST,PATCH,DELETE",
    preflightContinue:true,
    allowedHeaders: "Content-Type,Authorization"
  })
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true
    })
  );
  await app.listen(3000);
}
bootstrap();
