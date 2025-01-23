import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ColumnController } from './column.controller';
import { ColumnService } from './column.service';
import { KanbanColumn } from './column.entity';

@Module({
  imports: [TypeOrmModule.forFeature([KanbanColumn])],
  controllers: [ColumnController],
  providers: [ColumnService],
})
export class ColumnModule {}
