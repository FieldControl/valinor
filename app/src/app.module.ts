import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { AuthGuard } from './auth/auth/auth.guard';

import { UserModule } from './user/user.module';
import { BoardModule } from './board/board.module';
import { CardModule } from './card/card.module';
import { SwimlaneModule } from './swimlane/swimlane.module';

import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from './user/entities/user.entity';
import { Board } from './board/entities/board.entity';
import { Card } from './card/entities/card.entity';
import { Swimlane } from './swimlane/entities/swimlane.entity';

@Module({
  imports: [
    UserModule,
    BoardModule,
    CardModule,
    SwimlaneModule,
    TypeOrmModule.forRoot({
      type: 'mysql', // Define o banco de dados como MySQL.
      host: 'localhost', // O servidor do banco de dados (pode ser um IP ou domínio).
      port: 3306, // Porta padrão do MySQL.
      username: 'root', // Usuário do banco de dados.
      password: '', // Senha do banco (nesse caso, vazia).
      database: 'kanban', // Nome do banco de dados que será usado.
      entities: [User, Board, Card, Swimlane], // Lista de entidades que representam tabelas.
      synchronize: process.env.ENV !== 'production', // Se não estiver em produção, sincroniza automaticamente as tabelas com o banco.
    }),
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService, AuthGuard],
})
export class AppModule {}
