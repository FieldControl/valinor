import { Module } from '@nestjs/common';
import { ColunasService } from './colunas.service';
import { ColunasController } from './colunas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Coluna } from './entities/coluna.entity';
import { UsuarioModule } from 'src/usuario/usuario.module';

@Module({
  controllers: [ColunasController],
  providers: [ColunasService],
  imports: [TypeOrmModule.forFeature([Coluna]), UsuarioModule],
  exports: [ColunasService],
})
export class ColunasModule {}
