import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CardsService } from './cards.service';
import { CardsController } from './cards.controller';
import { Card } from './card.entity';
import { KanbanColumn } from '../columns/column.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Card, KanbanColumn])],
  providers: [CardsService],
  controllers: [CardsController],
})
export class CardsModule {}
