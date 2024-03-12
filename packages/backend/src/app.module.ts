import { Module } from '@nestjs/common';
import { ProjectsModule } from './kanban/project/project.module';
import { TaskModule } from './kanban/task/task.module';
import { ColumnModule } from './kanban/column/column.module';

@Module({
  imports: [ProjectsModule, TaskModule, ColumnModule],
})
export class AppModule {}
