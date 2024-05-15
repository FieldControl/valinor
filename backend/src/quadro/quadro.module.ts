import { Module } from '@nestjs/common';
import { QuadroService } from './quadro.service';
import { QuadroController } from './quadro.controller';
import { TypeORMError } from 'typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Quadro } from './entities/quadro.entity';
import { Usuario } from 'src/usuario/entities/usuario.entity';

@Module({
  
  controllers: [QuadroController],
  providers: [QuadroService],
  imports: [TypeOrmModule.forFeature([Quadro, Usuario])]

})
export class QuadroModule {}
