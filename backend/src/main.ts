import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Ativar CORS para permitir acesso do frontend
  app.enableCors({
    origin: 'http://127.0.0.1:5500', 
    methods: 'GET,POST,PUT,DELETE', 
    allowedHeaders: 'Content-Type', 
  });

  await app.listen(3000);
}

bootstrap();
