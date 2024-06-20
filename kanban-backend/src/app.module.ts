import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksController } from './Controllers/tasks/tasks.controller';
import { ColumnsController } from './Controllers/columns/columns.controller';
import { TasksService } from './Services/tasks/tasks.service';
import { ColumnsService } from './Services/columns/columns.service';
import { Tasks } from './Entities/tasks.entity';
import { Columns } from './Entities/columns.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'kanban.db',
      entities: [Tasks, Columns],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Tasks, Columns]),
  ],
  controllers: [TasksController, ColumnsController],
  providers: [TasksService, ColumnsService],
})
export class AppModule {}
