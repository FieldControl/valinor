//importação padrão na criação de aplicações NestJS.
import { Module } from '@nestjs/common';
import { CardService } from './card.service';
import { CardController } from './card.controller';

//importando Modulo para manipular o DataBase e Entidade referente ao endpoint
import { TypeOrmModule } from '@nestjs/typeorm';
import { Card } from './entities/card.entity';

@Module({
  controllers: [CardController],
  providers: [CardService],
  imports: [TypeOrmModule.forFeature([Card])],
})
export class CardModule {}
