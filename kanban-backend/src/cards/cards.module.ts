import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Card } from '././card.entity/card.entity';
import { CardsService } from './cards.service';
import { CardsController } from './cards.controller';
import { KanbanGateway } from '../kanban.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([Card])],
  providers: [KanbanGateway, CardsService],
  controllers: [CardsController],
})
export class CardsModule {}
