import { Module } from '@nestjs/common';
import { QuadroService } from './quadro.service';
import { QuadroController } from './quadro.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Quadro } from './entities/quadro.entity';
import { UsuarioModule } from '../usuario/usuario.module';

@Module({
  controllers: [QuadroController],
  providers: [QuadroService],
  imports: [TypeOrmModule.forFeature([Quadro]), UsuarioModule],
})
export class QuadroModule {}
