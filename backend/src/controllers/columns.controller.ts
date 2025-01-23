import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ColumnsService } from '../services/columns.service';
import { KanbanColumn } from '../column/column.entity';

@Controller('columns')
export class ColumnsController {
  constructor(private readonly columnsService: ColumnsService) {}

  @Get()
  findAll(): Promise<KanbanColumn[]> {
    return this.columnsService.findAll();
  }

  @Post()
  create(@Body() body: { title: string }): Promise<KanbanColumn> {
    return this.columnsService.createColumn(body.title);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() body: { title: string }): Promise<KanbanColumn> {
    return this.columnsService.update(id, body.title);
  }

  @Delete(':id')
  delete(@Param('id') id: number): Promise<void> {
    return this.columnsService.delete(id);
  }
}
