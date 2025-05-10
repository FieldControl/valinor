import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'http://localhost:4200', // ou '*', mas evite isso em produção
    credentials: true, // se usar cookies/autenticação
  });

  await app.listen(3000);
}
bootstrap();
