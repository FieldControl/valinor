import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskResolver } from './task.resolver';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  providers: [TaskService, TaskResolver],
  imports: [PrismaModule]
})
export class TaskModule {}
