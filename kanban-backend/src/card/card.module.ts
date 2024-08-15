import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Card } from './entities/card.entity';
import { CardService } from './card.service';
import { CardController } from './card.controller';
import { SwimlaneModule } from '../swimlane/swimlane.module';  

@Module({
  imports: [TypeOrmModule.forFeature([Card]), SwimlaneModule],
  controllers: [CardController],
  providers: [CardService],
  exports: [CardService],
})
export class CardModule {}
