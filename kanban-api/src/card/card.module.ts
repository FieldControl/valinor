
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Card } from './card.entity';
import { CardService } from './card.service';
import { CardResolver } from './card.resolver';
import { Column } from '../column/column.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Card, Column])], 
  providers: [CardService, CardResolver],
})
export class CardModule {}
