import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { taskProviders } from './task.providers';
import { DatabaseModule } from 'src/db/database.module';
import { projectsProviders } from '../project/project.providers';
import { columnProviders } from '../column/column.providers';

@Module({
  imports: [DatabaseModule],
  providers: [
    TaskService,
    ...taskProviders,
    ...projectsProviders,
    ...columnProviders,
  ],
  controllers: [TaskController],
})
export class TaskModule {}
