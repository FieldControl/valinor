import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  console.log('DB_CONNECTION_STRING:', process.env.DB_CONNECTION_STRING);

  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  app.enableCors();

  await app.listen(3000);
}
bootstrap();
