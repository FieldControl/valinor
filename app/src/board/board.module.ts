import { Module } from '@nestjs/common'; // Importa o módulo do NestJS
import { BoardService } from './board.service'; // Importa o serviço de board
import { BoardController } from './board.controller'; // Importa o controlador de board
import { TypeOrmModule } from '@nestjs/typeorm'; // Importa o módulo TypeORM do NestJS
import { Board } from './entities/board.entity'; // Importa a entidade de board
import { UserModule } from 'src/user/user.module'; // Importa o módulo de usuário

@Module({ // Define o módulo de board
  controllers: [BoardController], // Define os controladores do módulo
  providers: [BoardService], // Define os provedores do módulo
  imports: [TypeOrmModule.forFeature([Board]), UserModule], // Importa o módulo TypeORM para a entidade de board e o módulo de usuário
})
export class BoardModule {} // Exporta o módulo de board
