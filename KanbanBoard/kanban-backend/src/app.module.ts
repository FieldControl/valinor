import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KanbanModule } from './kanban/kanban.module';
import { Column } from './kanban/column.entity';
import { Card } from './kanban/card.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'kanban.db',
      entities: [Column, Card],
      synchronize: true,
    }),
    KanbanModule,
  ],
})
export class AppModule {}
