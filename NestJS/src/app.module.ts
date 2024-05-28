import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CardsModule } from './cards/cards.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dirname } from 'path';

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
