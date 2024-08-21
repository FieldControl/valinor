import { Module } from '@nestjs/common';
import { CartaoService } from './cartao.service';
import { CartaoController } from './cartao.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cartao } from './entities/cartao.entity';
import { ColunaModule } from '../coluna/coluna.module';
import { UsuarioModule } from '../usuario/usuario.module';

@Module({
  controllers: [CartaoController],
  providers: [CartaoService],
  imports: [TypeOrmModule.forFeature([Cartao]), ColunaModule, UsuarioModule],
})
export class CartaoModule {}
