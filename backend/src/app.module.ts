import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CardService } from './card/card.service';
import { ColumnService } from './column/column.service';
import { KanbanColumn } from './column/column.entity';
import { Card } from './card/card.entity';
import { ColumnController } from './column/column.controller';
import { CardModule } from './card/card.module';  
import { ColumnModule } from './column/column.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'kanban.sqlite',
      entities: [Card, KanbanColumn],  
      synchronize: true, 
    }),
    CardModule,  
    ColumnModule,  
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
