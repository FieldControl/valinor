import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsuarioModule } from './usuario/usuario.module';
import { QuadroModule } from './quadro/quadro.module';
import { ColunasModule } from './colunas/colunas.module';
import { CardModule } from './card/card.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Quadro } from './quadro/entities/quadro.entity';
import { Card } from './card/entities/card.entity';
import { Coluna } from './colunas/entities/coluna.entity';
import { Usuario } from './usuario/entities/usuario.entity';
import { AuthModule } from './auth/auth.module';
import { AuthGuard } from './auth/auth/auth.guard';

@Module({
  imports: [UsuarioModule, QuadroModule, ColunasModule, CardModule,
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password:'root',
      database: 'kanban',
      entities: [
        Quadro,
        Card,
        Coluna,
        Usuario
      ],
      synchronize: true,
    }),
    AuthModule
  ],
  controllers: [AppController],
  providers: [AppService, AuthGuard],
})
export class AppModule {}
