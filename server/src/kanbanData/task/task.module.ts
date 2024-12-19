import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskResolver } from './task.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import { Task, TaskSchema } from './task.schema';
import { SubtaskModule } from '../subtask/subtask.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: Task.name, schema: TaskSchema }]), SubtaskModule],
  providers: [TaskService, TaskResolver],
  exports: [TaskService],
})
export class TaskModule {}