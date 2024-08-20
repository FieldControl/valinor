//importação padrão na criação de aplicações NestJS.
import { Module } from '@nestjs/common';
import { BoardService } from './board.service';
import { BoardController } from './board.controller';


//importando Modulo para manipular o DataBase e Entidade referente ao endpoint
import { TypeOrmModule } from '@nestjs/typeorm';
import { Board } from './entities/board.entity';
import { UserService } from 'src/user/user.service';
import { UserModule } from 'src/user/user.module';
import { User } from 'src/user/entities/user.entity';


@Module({
  controllers: [BoardController],
  providers: [BoardService, UserService],
  imports: [
    TypeOrmModule.forFeature([Board,User]), UserModule
  ]
})
export class BoardModule {}
