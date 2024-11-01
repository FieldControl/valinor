import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  // Cria a instância do aplicativo NestJS
  const app = await NestFactory.create(AppModule);

  // Habilita CORS
  app.enableCors({
    origin: 'https://seu-frontend.vercel.app', // Substitua pela URL do seu frontend
    credentials: true,
  });

  // Define a porta e inicia o aplicativo
  await app.listen(3000);
}
bootstrap();
