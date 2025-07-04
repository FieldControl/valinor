import { Module } from '@nestjs/common';
import { TaskService } from './task.service';           // CORRIGIDO
import { TaskController } from './task.controller';   // CORRIGIDO
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Task])],
  controllers: [TaskController],
  providers: [TaskService],
})
export class TaskModule {}
