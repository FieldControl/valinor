import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CardsService } from './cards.service';
import { CardsController } from './cards.controller';
import { Card } from './entities/card.entity';

/**
 * O decorator @Module() organiza o código relacionado à funcionalidade de Cards.
 */
@Module({
  imports: [TypeOrmModule.forFeature([Card])],

  // 'controllers': Define os controllers que lidam com as rotas da web para os cards.
  controllers: [CardsController],

  // 'providers': Define os serviços que contêm a lógica de negócio dos cards.
  // O CardsController usará o CardsService.
  providers: [CardsService],
})
export class CardsModule {}