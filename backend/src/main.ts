import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true
  }),
);

  app.enableCors();

  await app.listen(process.env.PORT ?? 3000);
   const config = new DocumentBuilder()
    .setTitle('Kanban API')
    .setDescription('API para gerenciamento de tarefas')
    .setVersion('1.0')
    .addTag('Tarefas')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);


  //await app.listen(3000);
}
bootstrap();
