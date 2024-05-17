import { Module } from '@nestjs/common';
import { ColunasService } from './colunas.service';
import { ColunasController } from './colunas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Coluna } from './entities/coluna.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Coluna])],
  controllers: [ColunasController],
  providers: [ColunasService],
})
export class ColunasModule {}
