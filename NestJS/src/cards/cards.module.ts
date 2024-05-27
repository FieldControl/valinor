import { Module } from '@nestjs/common';
import { CardsController } from './cards.controller';
import { CardsService } from './cards.service';

@Module({
  providers: [CardsService],
  controllers: [CardsController],
})
export class CardsModule {}
