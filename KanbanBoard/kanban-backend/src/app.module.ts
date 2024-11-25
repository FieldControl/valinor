import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KanbanModule } from './kanban.module';
import { Column } from './entities/column.entity';
import { Card } from './entities/card.entity';

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
