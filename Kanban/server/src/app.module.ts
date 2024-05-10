import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { KanbanService } from './kanban/kanban.service';
import { KanbanController } from './kanban/kanban.controller';
import { Column, ColumnSchema } from './kanban/models/column.model';
import { Card, CardSchema } from './kanban/models/card.model';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/kanban'),
    MongooseModule.forFeature([
      { name: Column.name, schema: ColumnSchema }, // Modelo de coluna
      { name: Card.name, schema: CardSchema }, // Modelo de cartão
    ]),
  ],
  controllers: [AppController, KanbanController],
  providers: [AppService, KanbanService],
})
export class AppModule {}
