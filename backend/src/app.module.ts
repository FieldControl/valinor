import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KanbanColumn } from './column/column.entity';
import { Task } from './card/card.entity';
import { CardModule } from './card/card.module';
import { ColumnModule } from './column/column.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'kanban.sqlite',
      entities: [Task, KanbanColumn],
      synchronize: true,
    }),
    CardModule,
    ColumnModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
