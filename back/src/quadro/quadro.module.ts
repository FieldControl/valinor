import { Module } from '@nestjs/common';
import { QuadroService } from './quadro.service';
import { QuadroController } from './quadro.controller';
import { Quadro } from './entities/quadro.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuarioModule } from 'src/usuario/usuario.module';

@Module({
  controllers: [QuadroController],
  providers: [QuadroService],
  imports: [TypeOrmModule.forFeature([Quadro]), UsuarioModule]
})
export class QuadroModule {}
