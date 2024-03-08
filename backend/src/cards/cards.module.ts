import { Module } from '@nestjs/common';
import { CardsService } from './cards.service';
import { CardsController } from './cards.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Card } from './entities/card.entity';
import { Badge } from '../badges/entities/badge.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Card,Badge])],
  controllers: [CardsController],
  providers: [CardsService],
})
export class CardsModule {}
