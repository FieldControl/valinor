import { NestFactory } from '@nestjs/core';
import { AppDataSource } from 'data-source';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {    
    
    await AppDataSource.initialize()
        .then(() => {
            console.log('Banco de dados foi inicializado!');
        })
        .catch((err) => {
            console.error('Erro na inicialização do banco de dados', err);
        });

    
    const app = await NestFactory.create(AppModule);   
    
    app.setGlobalPrefix('api');
    
    const config = new DocumentBuilder()
        .setTitle('Kanban API')
        .setDescription('Kanban Maker API')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('/', app, document);
    
    await app.listen(3000);
}

bootstrap();
