import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'http://localhost:4200', 
    methods: 'GET,POST,PUT,DELETE,OPTIONS',  
    allowedHeaders: 'Content-Type, Authorization', 
  });

  await app.listen(3000); 
}
bootstrap();
