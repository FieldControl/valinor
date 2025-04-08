import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilita o CORS para aceitar requisições do frontend Angular
  app.enableCors({
    origin: 'http://localhost:4200', //Permite apenas esse domínio
    credentials: true,
  });

  //Inicia o servidor na porta 3000
  await app.listen(3000);
}
bootstrap();
