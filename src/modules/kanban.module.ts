import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Card } from '../cards/entities/card.entity';
import { Column } from '../columns/entities/columns.entity';
import { ColumnsController } from '../columns/columns.controller';
import { CardsController } from '../cards/cards.controller';
import { ColumnsService } from '../columns/columns.service';
import { CardsService } from '../cards/cards.service';

//Definição do modulo do kanban

@Module({
  imports: [TypeOrmModule.forFeature([Column, Card])],
  controllers: [ColumnsController, CardsController],
  providers: [ColumnsService, CardsService],
})
export class KanbanModule {}