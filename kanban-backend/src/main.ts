import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configura o CORS
  app.enableCors({
    origin: 'http://localhost:4200', // Permite acesso do frontend Angular
    credentials: true,
  });

  await app.listen(3000);
}
void bootstrap();
