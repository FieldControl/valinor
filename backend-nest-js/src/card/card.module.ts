//importação padrão na criação de aplicações NestJS.
import { Module } from '@nestjs/common';
import { CardService } from './card.service';
import { CardController } from './card.controller';

//importando Modulo para manipular o DataBase e Entidade referente ao endipoint

@Module({
  controllers: [CardController],
  providers: [CardService],
})
export class CardModule {}
