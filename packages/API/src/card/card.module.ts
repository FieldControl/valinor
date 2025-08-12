import { Module } from '@nestjs/common';
import { CardController } from './card.controller';
import { CardService } from './card.service';
import { CardRepository } from './card.repository';
import { KnexModule } from 'src/knex.module';

@Module({
  imports: [KnexModule],
  controllers: [CardController],
  providers: [CardService, CardRepository],
})
export class CardModule {}
    