import { Module, forwardRef } from '@nestjs/common';
import { CardsService } from './cards.service';
import { CardsController } from './cards.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Card, CardSchema } from './entities/card.entity';
import { ColumnsModule } from '../columns/columns.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: Card.name, schema: CardSchema }]),
  ColumnsModule],
  controllers: [CardsController],
  providers: [CardsService],
  exports: [CardsService],
})
export class CardsModule {}
