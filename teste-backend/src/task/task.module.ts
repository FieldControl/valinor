import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskResolver } from './task.resolver';

@Module({
  providers: [TaskResolver, TaskService],
})
export class TaskModule {}
