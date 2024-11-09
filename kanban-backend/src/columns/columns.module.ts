import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KanbanColumn } from './column.entity/column.entity';
import { ColumnsService } from './columns.service';
import { ColumnsController } from './columns.controller';
import { KanbanGateway } from '../kanban.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([KanbanColumn])],
  providers: [KanbanGateway, ColumnsService],
  controllers: [ColumnsController],
})
export class ColumnsModule {}
