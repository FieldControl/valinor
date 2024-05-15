import { Module } from '@nestjs/common';
import { ColunaService } from './coluna.service';
import { ColunaController } from './coluna.controller';
import { Coluna } from './entities/coluna.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Quadro } from 'src/quadro/entities/quadro.entity';

@Module({
  controllers: [ColunaController],
  providers: [ColunaService],
  imports: [TypeOrmModule.forFeature([Coluna,Quadro])],
})
export class ColunaModule {}
