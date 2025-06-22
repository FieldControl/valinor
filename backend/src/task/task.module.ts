import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { Task } from './task.entity';



@Module({// Define o módulo Task
  imports: [
    TypeOrmModule.forFeature([Task]) // Registra a entidade Task no TypeORM
  ],
  providers: [TaskService],
  controllers: [TaskController]
})
export class TaskModule {}
