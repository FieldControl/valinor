import { Module } from '@nestjs/common';
import { ColunaService } from './coluna.service';
import { ColunaController } from './coluna.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Coluna } from './entities/coluna.entity';
import { UsuarioModule } from '../usuario/usuario.module';

@Module({
  controllers: [ColunaController],
  providers: [ColunaService],
  imports: [TypeOrmModule.forFeature([Coluna]), UsuarioModule],
  exports: [ColunaService],
})
export class ColunaModule {}
