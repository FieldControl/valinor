import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ColumnsService } from './columns.service';
import { ColumnsController } from './columns.controller';
import { KanbanColumn } from './column.entity';

@Module({
  imports: [TypeOrmModule.forFeature([KanbanColumn])],
  providers: [ColumnsService],
  controllers: [ColumnsController],
})
export class ColumnsModule {}
