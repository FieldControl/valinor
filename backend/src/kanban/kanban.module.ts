import { Module } from '@nestjs/common';
import { KanbanService } from './kanban.service';
import { KanbanController } from './kanban.controller';

@Module({
  controllers: [KanbanController],
  providers: [KanbanService],
})
export class KanbanModule {}
