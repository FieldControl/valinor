import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskController } from './card.controller';
import { TaskService } from './card.service';
import { Task} from './card.entity';
import { KanbanColumn } from '../column/column.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Task, KanbanColumn])],
  controllers: [TaskController],
  providers: [TaskService],
})
export class CardModule {}
