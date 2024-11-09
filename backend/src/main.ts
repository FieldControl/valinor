/* eslint-disable prettier/prettier */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitar CORS para permitir requisições de http://localhost:4200
  app.enableCors({
    origin: 'http://localhost:4200',  // Permite requisições apenas de localhost:4200
    methods: ['GET', 'POST', 'PUT', 'DELETE'],  // Permite apenas esses métodos
    allowedHeaders: ['Content-Type', 'Authorization'], // Permite cabeçalhos específicos
  });

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
