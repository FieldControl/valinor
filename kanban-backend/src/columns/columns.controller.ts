import { Controller, Post, Get, Delete, Param, Body } from '@nestjs/common';
import { ColumnsService } from './columns.service';

@Controller('columns')
export class ColumnsController {
  constructor(private readonly columnsService: ColumnsService) {}

  @Post()
  create(
    @Body('boardId') boardId: number,
    @Body('title') title: string,
    @Body('order') order: number,
  ) {
    return this.columnsService.create(boardId, title, order);
  }

  @Get('board/:boardId')
  findAll(@Param('boardId') boardId: string) {
    return this.columnsService.findAll(+boardId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.columnsService.findOne(+id);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.columnsService.delete(+id);
  }
}
