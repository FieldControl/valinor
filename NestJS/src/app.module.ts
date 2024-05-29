import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CardsModule } from './cards/cards.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dirname } from 'path';
import { NestFactory } from '@nestjs/core';
import * as cors from 'cors';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'db.sqlite',
      entities: [__dirname + '/**/*entity{.ts,.js}'],
        synchronize: true,   
    }),
    CardsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.use(cors({
    origin: 'http://localhost:4200', 
  }));

  await app.listen(3000);
}
bootstrap();
