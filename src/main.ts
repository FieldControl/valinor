import { NestFactory } from '@nestjs/core';
import { AppDataSource } from 'data-source';
import { AppModule } from './app.module';


async function bootstrap() {
    
    await AppDataSource.initialize()
        .then(() => {
            console.log('Banco de dados foi inicializado!');
        })
        .catch((err) => {
            console.error('Erro na inicializacao do banco de dados', err);
        });

    const app = await NestFactory.create(AppModule);
    app.setGlobalPrefix('api')
    await app.listen(3000);
}

bootstrap();
