import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ColumnsService } from './columns.service';
import { ColumnsController } from './columns.controller';
import { BoardColumn } from '../entities/column.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BoardColumn])],
  providers: [ColumnsService],
  controllers: [ColumnsController],
})
export class ColumnsModule {}