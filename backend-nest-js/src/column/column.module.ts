//importação padrão na criação de aplicações NestJS.
import { Module } from '@nestjs/common';
import { ColumnService } from './column.service';
import { ColumnController } from './column.controller';

//importando Modulo para manipular o DataBase e Entidade referente ao endipoint

@Module({
  controllers: [ColumnController],
  providers: [ColumnService],
})
export class ColumnModule {}
