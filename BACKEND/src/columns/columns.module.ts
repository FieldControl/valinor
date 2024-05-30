import { Module } from '@nestjs/common';
import { ColumnsService } from './columns.service';
import { ColumnsController } from './columns.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ColumnEntity } from './entities/column.entity';
import { Board } from 'src/boards/entities/board.entity';


@Module({
  imports: [TypeOrmModule.forFeature([ColumnEntity, Board])],
  controllers: [ColumnsController],
  providers: [ColumnsService],
})
export class ColumnsModule {}
