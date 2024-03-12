import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ProjectsModule } from './kanban/project/project.module';
import { TaskModule } from './kanban/task/task.module';
import { ColumnModule } from './kanban/column/column.module';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: '.env' }),
    ProjectsModule,
    TaskModule,
    ColumnModule,
  ],
})
export class AppModule {}
