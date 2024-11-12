import { Controller, Get, Post, Body, Param, Delete, Patch } from '@nestjs/common';
import { ColumnsService } from './columns.service';
import { KanbanColumn } from './column.entity';

@Controller('columns')
export class ColumnsController {
  constructor(private readonly columnService: ColumnsService) {}

  @Get()
  findAll() {
    return this.columnService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.columnService.findOne(+id);
  }

  @Post()
  create(@Body('title') title: string, @Body('order') order: number) {
    return this.columnService.create(title, order);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body('title') title: string, @Body('order') order: number) {
    return this.columnService.update(+id, title, order); 
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.columnService.remove(+id);
  }

  @Patch('order')
  updateColumnsOrder(@Body() columns: KanbanColumn[]): Promise<KanbanColumn[]> { 
    return this.columnService.updateColumnsOrder(columns);
  }
}
