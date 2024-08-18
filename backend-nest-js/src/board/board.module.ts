//importação padrão na criação de aplicações NestJS.
import { Module } from '@nestjs/common';
import { BoardService } from './board.service';
import { BoardController } from './board.controller';

//importando Modulo para manipular o DataBase e Entidade referente ao endipoint

@Module({
  controllers: [BoardController],
  providers: [BoardService],
})
export class BoardModule {}
