// main.ts (NestJS)
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuração CORS para permitir requisições do Angular
  app.enableCors({
    origin: 'http://localhost:4200', // URL do frontend Angular
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  });

  // Prefixo global para todas as rotas
  app.setGlobalPrefix('api');

  await app.listen(process.env.PORT ?? 3000);
  console.log('NestJS backend rodando na porta 3000');

  const config = new DocumentBuilder()
    .setTitle('CRUD Itens Api')
    .setDescription('API para seu CRUD')
    .setVersion('1.0')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

}
bootstrap();
