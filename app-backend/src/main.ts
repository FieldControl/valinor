import { NestFactory } from '@nestjs/core';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app: INestApplication = await NestFactory.create(AppModule);

  // 1) validação global
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  // 2) habilita CORS para todas origens, métodos e cabeçalhos
  app.enableCors();

  // 3) swagger
  const config = new DocumentBuilder()
    .setTitle('Kanban API')
    .setDescription('API para gerenciar usuários, colunas e cards')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // 4) start
  const port = Number(process.env.PORT) || 3000;
  await app.listen(port);
  console.log(`Application running on: http://localhost:${port}`);
}

bootstrap();
