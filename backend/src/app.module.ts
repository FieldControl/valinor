import { Module } from '@nestjs/common';
import { QuadroModule } from './quadro/quadro.module';
import { UsuarioModule } from './usuario/usuario.module';
import { ColunaModule } from './coluna/coluna.module';
import { TarefaModule } from './tarefa/tarefa.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tarefa } from './tarefa/entities/tarefa.entity';
import { Coluna } from './coluna/entities/coluna.entity';
import { Usuario } from './usuario/entities/usuario.entity';
import { Quadro } from './quadro/entities/quadro.entity';
import { AuthModule } from './auth/auth.module';
import { AuthGuard } from './auth/auth/auth.guard';

//configurações e classes para entendimento das anotações do framework

@Module({
  imports: [QuadroModule,
    UsuarioModule,
    ColunaModule,
    TarefaModule,

    TypeOrmModule.forRoot({ //converter classes em entidades do banco de dados
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password:'root',
      database:'kanban',
      entities: [Quadro, Usuario, Coluna, Tarefa],
      synchronize: process.env.ENV !== 'production',

    }),

    AuthModule

  ],
  controllers: [], //expor endpoints http
  providers: [AuthGuard],     //services  
})
export class AppModule {}
