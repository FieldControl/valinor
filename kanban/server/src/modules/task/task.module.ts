import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { PrismaClient } from '@prisma/client';

@Module({
  controllers: [TaskController],
  providers: [TaskService, PrismaClient],
})
export class TaskModule {}
