import { Module } from '@nestjs/common';
import { TaskService } from './task.service.js';
import { TaskController } from './task.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';


@Module({
  providers: [TaskService],
  controllers: [TaskController],
  imports: [PrismaModule]
})
export class TaskModule {}
