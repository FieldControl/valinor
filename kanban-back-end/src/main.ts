import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //Libera CORS para qualquer origem (manter apenas em dev)
  app.enableCors({
    origin: 'http://localhost:4200', //Libera só o Angular local
    credentials: true,               //Se precisar cookies ou headers personalizados
  });

  await app.listen(3000);
}
bootstrap();
