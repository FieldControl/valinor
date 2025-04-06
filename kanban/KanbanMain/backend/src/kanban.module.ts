import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Column } from './entities/column.entity';
import { Card } from './entities/card.entity';
import { ColumnsService } from './columns.service';
import { CardsService } from './cards.service';
import { ColumnsController } from './controllers/columns.controller';
import { CardsController } from './controllers/cards.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Column, Card])],
  controllers: [ColumnsController, CardsController],
  providers: [ ColumnsService, CardsService],
  exports: [ColumnsService, CardsService],
})
export class KanbanModule {}
