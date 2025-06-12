import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Card } from './cards.entity';
import { CardsService } from './cards.service';
import { CardsResolver } from './cards.resolver';
import { ColumnsModule } from '../columns/columns.module';

@Module({
  imports: [TypeOrmModule.forFeature([Card]), ColumnsModule],
  providers: [CardsService, CardsResolver],
})
export class CardsModule {}
