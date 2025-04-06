import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { ColumnsService } from '../columns.service';

@Controller('columns')
export class ColumnsController {
  constructor(private readonly columnsService: ColumnsService) {}

  /** Column  */

  @Get()
  findAll() {
    return this.columnsService.findAll();
  }

  @Post()
  createColumn(@Body() body: { title: string }) {
    return this.columnsService.create(body.title);
  }

  @Delete(':id')
  deleteColumn(@Param('id') id: number) {
    return this.columnsService.delete(id);
  }
}
