import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Board } from './entities/board.entity';
import { KanbanColumn } from './entities/column.entity';
import { Task } from './entities/task.entity';

import { KanbanResolver } from './kanban.resolver';
import { KanbanService } from './kanban.service';

@Module({
  imports: [TypeOrmModule.forFeature([Board, KanbanColumn, Task])],
  providers: [KanbanResolver, KanbanService],
})
export class KanbanModule {}
