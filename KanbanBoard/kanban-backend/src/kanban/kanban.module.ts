import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Column } from './column.entity';
import { Card } from './card.entity';
import { ColumnsService } from './columns.service';
import { CardsService } from './cards.service';
import { ColumnsController } from './columns.controller';
import { CardsController } from './cards.controller';

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
    ColumnsService, // Exportação opcional, caso outros módulos precisem
    CardsService,
  ],
})
export class KanbanModule {}
