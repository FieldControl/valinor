import { Module } from '@nestjs/common';
import { ColumnService } from './column.service';
import { ColumnController } from './column.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ColumnEntity } from '../entities/column.entity';
import { Board } from '../entities/board.entity';
import { BoardModule } from '../board/board.module';

@Module({
  imports: [TypeOrmModule.forFeature([ColumnEntity, Board]), BoardModule],
  controllers: [ColumnController],
  providers: [ColumnService],
})
export class ColumnModule {}
