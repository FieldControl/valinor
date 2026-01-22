import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Habilita o CORS para o Frontend conversar com o Backend
  app.enableCors(); 

  await app.listen(3000);
}
bootstrap();