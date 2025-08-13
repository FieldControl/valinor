import { Module } from '@nestjs/common';
import { CardController } from './card.controller';
import { CardService } from './card.service';
import { CardRepository } from './card.repository';
import { KnexModule } from 'src/knex.module';
import { ColumnRepository } from 'src/column/column.repository';

@Module({
  imports: [KnexModule],
  controllers: [CardController],
  providers: [CardService, CardRepository, ColumnRepository],
})
export class CardModule {}
    