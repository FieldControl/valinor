//importação padrão na criação de aplicações NestJS.
import { Module } from '@nestjs/common';
import { ColumnService } from './column.service';
import { ColumnController } from './column.controller';

//importando Modulo para manipular o DataBase e Entidade referente ao endpoint
import { Columns } from './entities/column.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  controllers: [ColumnController],
  providers: [ColumnService],
  imports: [TypeOrmModule.forFeature([Columns])],
})
export class ColumnModule {}
