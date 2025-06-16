import { Module } from '@nestjs/common';
import { ColumnService } from './column.service';
import { ColumnController } from './column.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ColumnEntity } from '../entidades/column.entity';
import { Board } from '../entidades/board.entity';
import { BoardModule } from '../board/board.module';

@Module({
  imports: [TypeOrmModule.forFeature([ColumnEntity, Board]), BoardModule],
  controllers: [ColumnController],
  providers: [ColumnService],
})
export class ColumnModule {}
