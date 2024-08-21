import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CartaoModule } from './cartao/cartao.module'; 
import { ColunaModule } from './coluna/coluna.module'; 
import { QuadroModule } from './quadro/quadro.module'; 
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuarioModule } from './usuario/usuario.module'; 
import { AutenticarModule } from './autenticar/autenticar.module'; 
import { AuthGuard } from './autenticar/autenticar/autenticar.guard'; 
import { Cartao } from './cartao/entities/cartao.entity'; 
import { Coluna } from './coluna/entities/coluna.entity';
import { Quadro } from './quadro/entities/quadro.entity'; 
import { Usuario } from './usuario/entities/usuario.entity'; 

@Module({
  imports: [
    AutenticarModule,
    CartaoModule,
    ColunaModule,
    QuadroModule,
    QuadroModule,
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '',
      database: 'kanban-teste',
      entities: [Cartao, Coluna, Quadro, Usuario],
      synchronize: true,
    }),
    UsuarioModule,
  ],
  controllers: [AppController],
  providers: [AppService, AuthGuard],
})
export class AppModule {}
