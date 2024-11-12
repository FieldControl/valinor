import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ColumnsModule } from './columns/columns.module';
import { CardsModule } from './cards/cards.module';
import { Card } from './cards/card.entity';
import { KanbanColumn } from './columns/column.entity';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  controllers: [AppController],
  providers: [AppService],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, 
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [Card, KanbanColumn], 
      synchronize: true,
    }),
    ColumnsModule,
    CardsModule,
  ],
})
export class AppModule {}
