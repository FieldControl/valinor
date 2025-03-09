import { Module } from '@nestjs/common';
import { KanbanResolver } from './kanban.resolver';
import { KanbanService } from './kanban.service';

@Module({
  providers: [KanbanResolver, KanbanService]
})
export class KanbanModule {}
