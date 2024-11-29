import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  await app.listen(3030);

  console.log(`Servidor disponível na porta http://localhost:3030/graphql`);
}
bootstrap();
