import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Column } from './entities/column.entity';
import { Card } from './entities/card.entity';
import { ColumnsService } from './services/columns.service';
import { CardsService } from './services/cards.service';
import { ColumnsController } from './controllers/columns.controller';
import { CardsController } from './controllers/cards.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Column, Card]), // Registra as entidades no TypeORM
  ],
  controllers: [
    ColumnsController, // Controlador para gerenciar colunas
    CardsController,   // Controlador para gerenciar cards
  ],
  providers: [
    ColumnsService, // Serviço para lógica de colunas
    CardsService,   // Serviço para lógica de cards
  ],
  exports: [
    ColumnsService,
    CardsService,
  ],
})
export class KanbanModule {}
