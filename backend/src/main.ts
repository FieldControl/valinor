import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: 'http://localhost:4200' });
  await app.listen(3000);
  console.log('Nest rodando em http://localhost:3000/graphql');
}
bootstrap();
