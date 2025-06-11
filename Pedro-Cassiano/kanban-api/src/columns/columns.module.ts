/** O Organizador: Ele declara quais controllers e services fazem parte do módulo de colunas e os conecta. */
import { Module } from '@nestjs/common';
import { ColumnsService } from './columns.service';
import { ColumnsController } from './columns.controller';

@Module({
  controllers: [ColumnsController],
  providers: [ColumnsService],
  exports: [ColumnsService],
})
export class ColumnsModule {}
