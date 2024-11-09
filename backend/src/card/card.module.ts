import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CardController } from './card.controller';
import { CardService } from './card.service';
import { Card } from './card.entity';
import { KanbanColumn } from '../column/column.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Card, KanbanColumn])],
  controllers: [CardController],
  providers: [CardService],
})
export class CardModule {}
