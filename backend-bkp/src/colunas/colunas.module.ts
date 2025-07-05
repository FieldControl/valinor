// colunas.module.ts
import { Module } from '@nestjs/common';
import { ColunasController } from './colunas.controller';
import { ColunasService } from './colunas.service';

@Module({
  controllers: [ColunasController],
  providers: [ColunasService],
})
export class ColunasModule {}