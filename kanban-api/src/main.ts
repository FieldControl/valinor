import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  console.log(`Server is running on port ${process.env.PORT ?? 3000}`);
  app.enableCors({
    origin: '*', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', 
    allowedHeaders: 'Content-Type, Accept', 
    credentials: true, 
  });
  
  app.enableShutdownHooks(); 
  
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
