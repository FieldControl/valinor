
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Column } from './column.entity';
import { ColumnService } from './column.service';
import { ColumnResolver } from './column.resolver';
import { Board } from '../board/board.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Column, Board])], 
  providers: [ColumnService, ColumnResolver],
})
export class ColumnModule {}
