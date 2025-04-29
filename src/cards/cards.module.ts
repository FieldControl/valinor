import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ColumnsController } from '../columns/columns.controller';
import { ColumnsService } from '../columns/columns.service';
import { Coluna } from '../entities/column.entity';  
//Definição dos modulos dos cards


@Module({
  imports: [TypeOrmModule.forFeature([Coluna])],
  controllers: [ColumnsController],
  providers: [ColumnsService],
})
export class ColumnsModule {}