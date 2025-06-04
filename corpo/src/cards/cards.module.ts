import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CardsService } from './cards.service';
import { CardsController } from './cards.controller';
import { Card } from '../entities/card.entity';
import { BoardColumn } from 'src/entities/column.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Card, BoardColumn])],
  providers: [CardsService],
  controllers: [CardsController],
})
export class CardsModule {}