import { Module } from '@nestjs/common';
import { KanbanService } from './kanban.service';
import { KanbanResolver } from './kanban.resolver';

@Module({
  providers: [KanbanService, KanbanResolver],
})
export class KanbanModule {}
