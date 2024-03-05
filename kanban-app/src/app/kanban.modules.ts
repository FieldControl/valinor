import { Module } from '@nestjs/common';
import { KanbanController } from './kanban.controller';
import { KanbanService } from './services/kanban.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Column } from './entities/column.entity';
import { Card } from './entities/card.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Column, Card])],
  controllers: [KanbanController],
  providers: [KanbanService],
})
export class KanbanModule {}