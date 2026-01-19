import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TasksModule } from './tasks/tasks.module';
import { ColumnsModule } from './columns/columns.module';
import { CardsModule } from './cards/cards.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'kanban.db',
      autoLoadEntities: true,
      synchronize: true,
    }),
    TasksModule,
    ColumnsModule,
    CardsModule,
  ],
})
export class AppModule {}
