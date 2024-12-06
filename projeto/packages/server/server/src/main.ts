import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); //Garantindo que fique em acesso global (não entendi muito bem, mas consegui encontrar para funcionar meu projeto)
  await app.listen(3000);
  
}
bootstrap();
