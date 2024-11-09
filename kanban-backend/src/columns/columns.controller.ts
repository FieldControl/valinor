import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ColumnsService } from './columns.service';
import { KanbanColumn } from '././column.entity/column.entity';

@Controller('columns')
export class ColumnsController {
  constructor(private readonly columnsService: ColumnsService) {}

  @Get()
  findAll(): Promise<KanbanColumn[]> {
    return this.columnsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<KanbanColumn> {
    return this.columnsService.findOne(id);
  }

  @Post()
  create(@Body() column: KanbanColumn): Promise<KanbanColumn> {
    return this.columnsService.create(column);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() column: KanbanColumn): Promise<KanbanColumn> {
    return this.columnsService.update(id, column);
  }

  @Delete(':id')
  remove(@Param('id') id: number): Promise<void> {
    return this.columnsService.remove(id);
  }
}
