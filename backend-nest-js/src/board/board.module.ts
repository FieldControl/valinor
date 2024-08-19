//importação padrão na criação de aplicações NestJS.
import { Module } from '@nestjs/common';
import { BoardService } from './board.service';
import { BoardController } from './board.controller';


//importando Modulo para manipular o DataBase e Entidade referente ao endipoint
import { TypeOrmModule } from '@nestjs/typeorm';
import { Board } from './entities/board.entity';


@Module({
  controllers: [BoardController],
  providers: [BoardService],
  imports: [
    TypeOrmModule.forFeature([Board]),
  ]
})
export class BoardModule {}
