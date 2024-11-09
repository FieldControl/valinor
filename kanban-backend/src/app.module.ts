import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KanbanColumn } from './columns/column.entity/column.entity';
import { Card } from './cards/card.entity/card.entity';
import { ColumnsModule } from './columns/columns.module';
import { CardsModule } from './cards/cards.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'sua_senha',
      database: 'kanban_db',
      entities: [KanbanColumn, Card],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([KanbanColumn, Card]),
    ColumnsModule,
    CardsModule,
  ],
})
export class AppModule {}
