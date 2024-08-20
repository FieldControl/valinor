//importação padrão na criação de aplicações NestJS.
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

//importaçãos dos Mudolos referente aos endponts utilizados na aplicação.
import { BoardModule } from './board/board.module';
import { UserModule } from './user/user.module';
import { ColumnModule } from './column/column.module';
import { CardModule } from './card/card.module';
import { AuthenticateModule } from './authenticate/authenticate.module';

//importação da lib resposavel pela integração com DataBase, e suas respectivas entidades.
import { TypeOrmModule } from '@nestjs/typeorm';
import { Board } from './board/entities/board.entity';
import { Columns } from './column/entities/column.entity';
import { Card } from './card/entities/card.entity';
import { User } from './user/entities/user.entity';

//Guarda de Segurança
import { AuthGuard } from './authenticate/auth/auth.guard';


@Module({
  imports: [BoardModule, UserModule, ColumnModule, CardModule,AuthenticateModule,

    //Configurações de Ambiente para a utilização do Banco de dados.
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '252525',
      database: 'kanban',
      entities: [Board,Columns,Card,User],
      synchronize: process.env.ENV !== 'production',
    }),

  ],
  controllers: [AppController],
  providers: [AppService, AuthGuard],
})
export class AppModule {}
